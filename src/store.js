// Live gateway state. Frames in (method results + push events), snapshot() out.
// Sessions merge shallowly by key: partial rows from sessions.changed patches
// what exists; `null` clears a field; omission means "no change";
// `activeRunIds: []` clears the active-run set naturally (array replaced wholesale).
import { sessionLabel, costTotal, truncate } from "./insights.js";

export const LOG_LIMIT = 500;
export const ACTIVITY_LIMIT = 200;
const TOKEN_WINDOW_MS = 300_000; // 5 minutes of token-delta history

export function mergeSessionRow(existing, patch) {
  const out = existing ? { ...existing } : {};
  if (!patch) return out;
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) delete out[key];
    else out[key] = value;
  }
  return out;
}

// Logs arrive as JSON strings like {"0":"{\"subsystem\":\"gateway\"}","1":"warn","2":"1762...","3":"msg"}
// (or plain text, or {"0":"<message>"} wrappers). Parse defensively.
export function parseLogLine(raw) {
  const text = typeof raw === "string" ? raw : String(raw ?? "");
  let obj = null;
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) obj = parsed;
  } catch { /* plain text */ }
  if (!obj) {
    return { ts: null, level: "info", subsystem: null, msg: flatten(text), raw: text };
  }
  const unwrap = (v) => {
    if (typeof v !== "string") return v;
    try { return JSON.parse(v); } catch { return v; }
  };
  const keys = Object.keys(obj);
  const first = unwrap(obj["0"]);
  const tsRaw = Number(unwrap(obj["2"] ?? obj.ts));
  const levelRaw = String(unwrap(obj["1"] ?? obj.level) ?? "").toLowerCase();
  let subsystem = null;
  let msg = unwrap(obj["3"] ?? obj.msg ?? obj.message);
  if (first && typeof first === "object" && first.subsystem != null) {
    subsystem = String(first.subsystem);
  } else if (typeof first === "string" && first.length <= 32 && keys.length > 1) {
    subsystem = first; // {"0":"gateway","1":"info",...} shape
  }
  if (msg == null && first != null && keys.length === 1) msg = first; // {"0":"<message>"} wrapper
  if (msg == null) {
    // no explicit message: stringify the payload-ish remainder
    const payloadKeys = keys.filter((k) => !["0", "1", "2"].includes(k));
    msg = payloadKeys.length ? JSON.stringify(Object.fromEntries(payloadKeys.map((k) => [k, unwrap(obj[k])]))) : JSON.stringify(obj);
  }
  if (typeof msg !== "string") msg = JSON.stringify(msg);
  const level = /error|fatal|critical|panic/.test(levelRaw) ? "error"
    : /warn/.test(levelRaw) ? "warn"
    : /debug|trace/.test(levelRaw) ? "debug" : "info";
  return {
    ts: Number.isFinite(tsRaw) ? tsRaw : null,
    level,
    subsystem,
    msg: flatten(msg).slice(0, 400),
    raw: text,
  };
}

// Newlines would break a single-line TUI log pane — flatten them.
function flatten(s) {
  return String(s).replace(/\r?\n/g, " ⏎ ");
}

export class Store {
  constructor({ logLimit = LOG_LIMIT, activityLimit = ACTIVITY_LIMIT } = {}) {
    this.logLimit = logLimit;
    this.activityLimit = activityLimit;
    this.sessions = new Map();
    this.sessionTotals = { count: null, totalCount: null, hasMore: false };
    this.cronJobs = new Map();
    this.runs = []; // cron.runs entries, newest first
    this.agents = [];
    this.mainKey = null;
    this.presence = [];
    this.channels = null;
    this.logs = []; // oldest -> newest
    this.logsMeta = { cursor: null, file: null };
    this.activity = []; // oldest -> newest
    this.tokenDeltas = []; // {ts, tokens, key}
    this.health = null;
    this.statusHealth = null;
    this.bootedAt = null;
    this.server = null; // {version, protocol?, bootId}
    this.costToday = null;
    this.updateAvailable = false;
    this.connection = "connecting"; // connecting | connected | reconnecting | closed
    this.reconnectInMs = null;
  }

  // ---- connections / misc --------------------------------------------------
  setConnection(state, reconnectInMs = null) {
    this.connection = state;
    this.reconnectInMs = reconnectInMs;
  }

  applyHello(payload) {
    const uptimeMs = payload?.snapshot?.uptimeMs ?? null;
    this.bootedAt = uptimeMs != null ? Date.now() - Number(uptimeMs) : (this.bootedAt ?? null);
    this.server = {
      version: payload?.server?.version ?? null,
      protocol: payload?.protocol ?? null,
      bootId: payload?.server?.bootId ?? null,
    };
  }

  applyStatus(payload) {
    if (!payload) return;
    this.server = {
      ...this.server,
      version: payload.version ?? payload.runtimeVersion ?? this.server?.version ?? null,
      sqliteWal: payload.sqliteWal ?? this.server?.sqliteWal ?? null,
    };
    // status.eventLoop doubles as a health fallback (verified live):
    // {degraded, reasons[]: [], delayP99Ms, utilization}
    const el = payload.eventLoop;
    if (el && typeof el === "object" && Number.isFinite(Number(el.delayP99Ms))) {
      this.statusHealth = {
        degraded: Boolean(el.degraded),
        reasons: Array.isArray(el.reasons) ? el.reasons : [],
        p99: Number(el.delayP99Ms),
        utilization: Number.isFinite(Number(el.utilization)) ? Number(el.utilization) : null,
      };
    }
  }

  // ---- sessions -------------------------------------------------------------
  putSession(row) {
    if (!row?.key) return;
    const prev = this.sessions.get(row.key);
    const next = mergeSessionRow(prev, row);
    // Token deltas from cumulative totals — first sighting sets the baseline
    // (a session whose total predates the dashboard shouldn't spike tok/min at boot).
    if (prev) {
      const prevTotal = Number.isFinite(prev.totalTokens) ? prev.totalTokens : 0;
      const nextTotal = Number.isFinite(next.totalTokens) ? next.totalTokens : prevTotal;
      if (nextTotal > prevTotal) {
        this.tokenDeltas.push({ ts: Date.now(), tokens: nextTotal - prevTotal, key: row.key });
        this._trimTokenDeltas();
      }
    }
    const wasRunning = Boolean(prev?.hasActiveRun ?? (prev?.activeRunIds?.length ?? 0) > 0);
    const isRunning = Boolean(next.hasActiveRun ?? (next.activeRunIds?.length ?? 0) > 0);
    const seen = Boolean(prev);
    if (seen && (next.hasActiveRun === false || (Array.isArray(next.activeRunIds) && next.activeRunIds.length === 0))) {
      if (wasRunning) {
        this.pushActivity({
          source: "agent",
          level: next.status === "failed" ? "error" : undefined,
          text: `run finished · ${sessionLabel(next)} (${next.status ?? "done"})`,
        });
      }
    } else if (seen && !wasRunning && isRunning) {
      this.pushActivity({ source: "agent", text: `run started · ${sessionLabel(next)}` });
    }
    this.sessions.set(row.key, next);
  }

  upsertSessions(rows) {
    for (const row of rows ?? []) this.putSession(row);
  }

  // ---- cron -----------------------------------------------------------------
  setCronJobs(jobs) {
    this.cronJobs = new Map((jobs ?? []).filter((j) => j?.id).map((j) => [j.id, j]));
  }

  applyCronEvent(payload = {}) {
    if (payload.job?.id) this.cronJobs.set(payload.job.id, payload.job);
    const job = payload.job ?? this.cronJobs.get(payload.jobId);
    if (payload.status) {
      if (job) {
        this.cronJobs.set(job.id, {
          ...job,
          state: {
            ...job.state,
            lastRunStatus: payload.status,
            lastRunAtMs: payload.runAtMs ?? job.state?.lastRunAtMs ?? null,
            lastDurationMs: payload.durationMs ?? job.state?.lastDurationMs ?? null,
            lastError: payload.error ?? job.state?.lastError ?? null,
          },
        });
      }
      const name = payload.jobName ?? job?.name ?? job?.displayName ?? payload.jobId ?? "cron";
      const summary = payload.summary ? ` · ${truncate(payload.summary, 90)}` : "";
      const error = payload.error ? ` · ${truncate(payload.error, 90)}` : "";
      this.pushActivity({
        source: "cron",
        level: payload.status === "ok" ? undefined : "error",
        text: `${name} → ${payload.status}${summary}${error}`,
      });
    } else if (payload.action) {
      const name = job?.name ?? job?.displayName ?? payload.jobId ?? "?";
      this.pushActivity({ source: "cron", level: payload.action === "removed" ? "warn" : undefined, text: `${name} · ${payload.action}` });
    }
  }

  setRuns(entries) {
    this.runs = Array.isArray(entries) ? entries.filter((e) => e && e.ts != null) : [];
  }

  // ---- logs -----------------------------------------------------------------
  appendLogLines(lines) {
    for (const raw of lines ?? []) this.logs.push(parseLogLine(raw));
    if (this.logs.length > this.logLimit) this.logs.splice(0, this.logs.length - this.logLimit);
  }

  applyLogsTail(payload = {}) {
    if (payload.cursor != null) this.logsMeta.cursor = payload.cursor;
    if (payload.file) this.logsMeta.file = payload.file;
    if (payload.reset) this.logs = [];
    if (payload.reset || payload.truncated) this.logsMeta.cursor = payload.cursor ?? this.logsMeta.cursor;
    this.appendLogLines(payload.lines);
  }

  // ---- activity ---------------------------------------------------------------
  pushActivity({ source = "system", text = "", level } = {}) {
    if (!text) return;
    this.activity.push({ ts: Date.now(), source, text, level });
    if (this.activity.length > this.activityLimit) this.activity.splice(0, this.activity.length - this.activityLimit);
  }

  // ---- push events ------------------------------------------------------------
  onEvent(name, payload = {}) {
    switch (name) {
      case "sessions.changed": {
        const row = payload?.session ?? (Array.isArray(payload) ? null : payload);
        if (Array.isArray(payload?.sessions)) this.upsertSessions(payload.sessions);
        else if (row?.key) this.putSession(row);
        break;
      }
      case "chat": {
        const state = payload?.state;
        if (state === "final") this.pushActivity({ source: "chat", text: `reply done · ${payload?.sessionKey ?? "?"}` });
        else if (state === "error" || state === "aborted") {
          this.pushActivity({ source: "chat", level: "error", text: `chat ${state} · ${payload?.sessionKey ?? "?"}` });
        }
        break;
      }
      case "agent": {
        const text = typeof payload === "string" ? payload : (payload?.description ?? payload?.text ?? payload?.phase ?? null);
        if (text) this.pushActivity({ source: "agent", text: truncate(String(text), 120) });
        break;
      }
      case "cron": this.applyCronEvent(payload); break;
      case "health": this.health = payload ?? null; break;
      case "heartbeat": this.pushActivity({ source: "hb", text: `heartbeat${payload?.ok === false ? " missed" : " ok"}` }); break;
      case "update.available": this.updateAvailable = true; break;
      case "presence": {
        if (Array.isArray(payload)) this.presence = payload;
        else if (Array.isArray(payload?.entries)) this.presence = payload.entries;
        else if (payload?.instanceId) {
          this.presence = [...this.presence.filter((e) => e?.instanceId !== payload.instanceId), payload];
        }
        break;
      }
      case "shutdown": this.pushActivity({ source: "system", level: "warn", text: "gateway shutting down" }); break;
      default: break; // tick and unknown events are liveness only
    }
  }

  // ---- method results ----------------------------------------------------------
  applyMethodResult(method, payload) {
    switch (method) {
      case "sessions.subscribe":
      case "sessions.list": {
        if (payload?.sessions) this.upsertSessions(payload.sessions);
        this.sessionTotals = {
          count: payload?.count ?? null,
          totalCount: payload?.totalCount ?? null,
          hasMore: Boolean(payload?.hasMore),
        };
        break;
      }
      case "agents.list": {
        this.agents = Array.isArray(payload?.agents) ? payload.agents : [];
        this.mainKey = payload?.mainKey ?? null;
        break;
      }
      case "cron.list": {
        this.setCronJobs(payload?.jobs);
        break;
      }
      case "cron.runs": this.setRuns(payload?.entries); break;
      case "logs.tail": this.applyLogsTail(payload); break;
      case "status": this.applyStatus(payload); break;
      case "system-presence": this.presence = Array.isArray(payload) ? payload : (payload?.entries ?? []); break;
      case "channels.status": this.channels = payload ?? null; break;
      case "usage.cost": this.costToday = costTotal(payload); break;
      case "chat.history": break; // handled by the app for the peek overlay
      default: break;
    }
  }

  // ---- derivations -------------------------------------------------------------
  _trimTokenDeltas(now = Date.now()) {
    this.tokenDeltas = this.tokenDeltas.filter((d) => now - d.ts <= TOKEN_WINDOW_MS + 60_000);
  }

  // Map of key -> tokens burned in the last 5 minutes (for trend chars).
  tokPerSession(now = Date.now()) {
    this._trimTokenDeltas(now);
    const map = new Map();
    for (const { ts, tokens, key } of this.tokenDeltas) {
      if (now - ts <= TOKEN_WINDOW_MS) map.set(key, (map.get(key) ?? 0) + tokens);
    }
    return map;
  }

  tokPerMinute(now = Date.now()) {
    this._trimTokenDeltas(now);
    let sum = 0;
    for (const { ts, tokens } of this.tokenDeltas) {
      if (now - ts <= 60_000) sum += tokens;
    }
    return sum;
  }

  runningCount() {
    let n = 0;
    for (const row of this.sessions.values()) {
      if (row.status === "running" || (row.hasActiveRun ?? (row.activeRunIds?.length ?? 0) > 0)) n++;
    }
    return n;
  }

  healthSummary() {
    const h = this.health;
    if (h && typeof h === "object") {
      return {
        ok: h.ok ?? true,
        p99: h.eventLoop?.delayP99Ms ?? null,
        degraded: Boolean(h.eventLoop?.degraded),
        utilization: h.eventLoop?.utilization ?? null,
        reasons: Array.isArray(h.eventLoop?.reasons) ? h.eventLoop.reasons : [],
      };
    }
    // fallback from status({}).eventLoop
    if (this.statusHealth) return { ok: true, ...this.statusHealth };
    return null;
  }

  snapshot() {
    const now = Date.now();
    return {
      connection: this.connection,
      reconnectInMs: this.reconnectInMs,
      server: {
        ...this.server,
        uptimeMs: this.bootedAt != null ? Math.max(0, now - this.bootedAt) : null,
      },
      sessions: [...this.sessions.values()],
      sessionTotals: this.sessionTotals,
      agents: this.agents,
      cronJobs: [...this.cronJobs.values()],
      runs: this.runs,
      presence: this.presence,
      channels: this.channels,
      logs: this.logs,
      logsMeta: this.logsMeta,
      activity: this.activity,
      tokPerMin: this.tokPerMinute(now),
      tokMap: this.tokPerSession(now),
      costToday: this.costToday,
      health: this.healthSummary(),
      updateAvailable: this.updateAvailable,
    };
  }
}
