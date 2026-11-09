// Pure derivation helpers: formatting, trends, thread grouping, cron health.
// No I/O, no state — everything takes plain data and time as arguments.

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function truncate(s, n) {
  const str = String(s ?? "");
  if (str.length <= n) return str;
  return n > 1 ? str.slice(0, n - 1) + "…" : str.slice(0, n);
}

// 0 -> "0"; 999 -> "999"; 1200 -> "1.2k"; 3_400_000 -> "3.4M"
export function formatTokens(n) {
  const v = Number(n);
  if (!Number.isFinite(v) || v < 0) return "—";
  if (v < 1000) return String(Math.round(v));
  if (v < 1e6) return `${(v / 1e3).toFixed(v < 10_000 ? 1 : 0).replace(/\.0$/, "")}k`;
  return `${(v / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
}

// 42_000 -> "42s"; 452_000 -> "7m 32s"; 7500_000 -> "2h 5m"; 190_000_000 -> "2d 5h"
export function formatDuration(ms) {
  const v = Number(ms);
  if (!Number.isFinite(v) || v < 0) return "—";
  if (v < 1000) return "0s";
  const s = Math.floor(v / 1000);
  const d = Math.floor(s / 86_400);
  const h = Math.floor((s % 86_400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return sec >= 1 ? `${m}m ${sec}s` : `${m}m`;
  return `${sec}s`;
}

// Countdown for future events: 45s -> "45s", 420_000 -> "7m", 7_500_000 -> "2h 5m"
export function countdown(ms) {
  const v = Number(ms);
  if (!Number.isFinite(v) || v < 0) return "0s";
  if (v < 60_000) return `${Math.max(1, Math.round(v / 1000))}s`;
  return formatDuration(v);
}

// {ts} -> "just now" | "5m ago" | "3h ago" | "2d ago" | "—" for missing
export function relative(ts, now = Date.now()) {
  let t = ts;
  if (typeof t === "string" && !/^-?\d+(\.\d+)?$/.test(t.trim())) t = Date.parse(t);
  if (t == null || !Number.isFinite(Number(t))) return "—";
  const delta = now - Number(t);
  if (delta < 10_000) return "just now";
  if (delta < 0) return "in " + countdown(-delta);
  return formatDuration(delta) + " ago";
}

// Future-or-overdue label: 420_000 -> {label:"7m", overdue:false}; -180_000 -> {label:"3m overdue", overdue:true}
export function formatIn(ms) {
  if (ms == null || !Number.isFinite(Number(ms))) return { label: "—", overdue: false };
  const v = Number(ms);
  if (v <= 0) return { label: `${countdown(-v)} overdue`, overdue: true };
  return { label: countdown(v), overdue: false };
}

// Tiny sparkline over values, ▁▂▃▄▅▆▇; empty/nulls render as blank.
export function sparkline(values, chars = "▁▂▃▄▅▆▇") {
  const vals = (values ?? []).map((v) => (Number.isFinite(Number(v)) ? Number(v) : 0));
  const max = Math.max(...vals, 0);
  if (!vals.length || max <= 0) return chars[0].repeat(vals.length) || "";
  return vals.map((v) => chars[clamp(Math.floor((v / max) * chars.length - 0.0001), 0, chars.length - 1)]).join("");
}

// Single trend char relative to a max: how hot is this session right now?
export function trendChar(tokens, max, chars = " ▂▅▇") {
  const v = Number(tokens ?? 0);
  if (!v || v <= 0) return " ";
  const ratio = max > 0 ? v / max : 0;
  return chars[clamp(Math.ceil(ratio * (chars.length - 1)), 1, chars.length - 1)];
}

// Context pressure. Real gateway (verified live): contextTokens is the *window*
// size; true usage is contextBudgetStatus.estimatedPromptTokens vs contextTokenBudget.
// Falls back defensively; returns null when unknown.
export function contextPressure(row, defaultWindow = 1_000_000) {
  if (!row) return null;
  const budget = row.contextBudgetStatus?.contextTokenBudget
    ?? row.contextWindow ?? row.contextLimit ?? defaultWindow;
  let used = row.contextBudgetStatus?.estimatedPromptTokens ?? null;
  if (!Number.isFinite(used)) {
    if (Number.isFinite(row.inputTokens) && Number.isFinite(row.outputTokens)) used = row.inputTokens + row.outputTokens;
    else if (Number.isFinite(row.contextTokens) && Math.abs(row.contextTokens - budget) > budget * 0.1) used = row.contextTokens;
    else if (Number.isFinite(row.totalTokens) && Math.abs(row.totalTokens - budget) > budget * 0.1) used = row.totalTokens;
    else used = null;
  }
  if (!Number.isFinite(budget) || budget <= 0 || !Number.isFinite(used) || used <= 0) return null;
  return { pct: clamp((used / budget) * 100, 0, 100), used, window: budget };
}

export function sessionLabel(row) {
  return row?.displayName ?? row?.autoLabel ?? row?.derivedTitle ?? row?.label
    ?? (row?.key ? truncate(row.key, 40) : "untitled");
}

const STATUS_ICONS = {
  running: "●", done: "✓", failed: "✗", interrupted: "⚑",
  killed: "✕", timeout: "⌛", queued: "◌",
};

export function statusIcon(status) {
  return STATUS_ICONS[status] ?? "·";
}

export function isRunning(row) {
  const status = row?.status;
  if (status === "done" || status === "failed") return false;
  return status === "running" || Boolean(row?.hasActiveRun) || (row?.activeRunIds?.length ?? 0) > 0;
}

function activityOf(row) {
  return row?.lastActivityAt ?? row?.updatedAt ?? row?.createdAt ?? 0;
}

// Group sessions into display rows: parents (sorted by activity desc) with their
// subagent sessions indented beneath them. Subagents whose parent isn't in the
// list get their own top-level row flagged `orphan: true`.
export function threadTree(rows, now = Date.now()) {
  const list = (rows ?? []).filter((r) => r?.key);
  const byKey = new Map(list.map((r) => [r.key, r]));
  const kids = new Map();
  const tops = [];
  for (const row of list) {
    const parentKey = row.parentSessionKey;
    if (parentKey && byKey.has(parentKey)) {
      if (!kids.has(parentKey)) kids.set(parentKey, []);
      kids.get(parentKey).push(row);
    } else {
      tops.push(row);
    }
  }
  const byActivity = (a, b) => activityOf(b) - activityOf(a) || String(a.key).localeCompare(b.key);
  const out = [];
  for (const parent of tops.sort(byActivity)) {
    out.push({ row: parent, depth: 0, orphan: Boolean(parent.parentSessionKey) });
    const children = (kids.get(parent.key) ?? []).slice().sort(byActivity);
    for (const child of children) out.push({ row: child, depth: 1, orphan: false });
  }
  return out.map((entry) => ({ ...entry, activity: activityOf(entry.row), now }));
}

export function cronScheduleLabel(job) {
  const sched = job?.schedule ?? {};
  if (sched.kind === "every" && sched.everyMs != null) return `every ${formatDuration(sched.everyMs)}`;
  if (sched.kind === "cron" && sched.expr) return sched.tz ? `${sched.expr} ${sched.tz}` : sched.expr;
  if (sched.kind === "at" && sched.at) return relative(sched.at);
  if (sched.kind) return sched.kind;
  return "—";
}

// Health view of a cron job: icon, next run countdown, streak of errors.
export function cronHealth(job, now = Date.now()) {
  const state = job?.state ?? {};
  const next = state.nextRunAtMs != null ? state.nextRunAtMs - now : null;
  const nextIn = next != null && Number.isFinite(next) ? formatIn(next) : null;
  const streak = Number(state.consecutiveErrors ?? 0);
  let icon;
  if (job?.enabled === false) icon = "◌";
  else if (state.runningAtMs != null) icon = "●";
  else if (state.lastRunStatus === "ok") icon = "✔";
  else if (state.lastRunStatus === "error") icon = "✗";
  else if (state.lastRunStatus === "skipped") icon = "⊘";
  else icon = "◌";
  return {
    icon,
    status: state.lastRunStatus ?? null,
    next,
    nextIn,
    streak,
    lastDurationMs: state.lastDurationMs ?? null,
    lastError: state.lastError ?? null,
    warn: streak > 0 || Boolean(nextIn?.overdue) || state.lastRunStatus === "error" || job?.enabled === false,
  };
}

export function cronJobLabel(job) {
  return job?.displayName ?? job?.name ?? job?.id ?? "unnamed";
}

// Display order: enabled first, soonest next-run first, then by name.
export function orderCronJobs(jobs) {
  return [...(jobs ?? [])].sort((a, b) =>
    ((a?.enabled === false ? 1 : 0) - (b?.enabled === false ? 1 : 0))
    || Number(a?.state?.nextRunAtMs ?? Infinity) - Number(b?.state?.nextRunAtMs ?? Infinity)
    || String(a?.name ?? "").localeCompare(b?.name ?? ""));
}

// Defensive total-cost extraction from usage.cost payloads.
export function costTotal(payload) {
  if (payload == null) return null;
  const seen = new Set();
  const visit = (node, depth) => {
    if (depth > 4 || node == null || typeof node !== "object" || seen.has(node)) return null;
    seen.add(node);
    for (const [key, value] of Object.entries(node)) {
      if (typeof value === "number" && Number.isFinite(value)) {
        if (/^(total|totalUsd|totalCost|totalCostUsd|cost)$/i.test(key) && !/token/i.test(key)) return value;
        if (/^usd$/i.test(key)) return value;
      }
    }
    for (const value of Object.values(node)) {
      const found = visit(value, depth + 1);
      if (found != null) return found;
    }
    return null;
  };
  const found = visit(payload, 0);
  return found != null && Number.isFinite(found) ? found : null;
}

export function summarizeChannels(channels) {
  if (channels == null) return null;
  // Live shape: {channelOrder: ["telegram"], channelLabels: {...}, channelMeta: [...]}
  let order = Array.isArray(channels?.channelOrder) ? channels.channelOrder : null;
  let errors = 0;
  let labelsMap = channels?.channelLabels ?? {};
  if (!order && Array.isArray(channels?.channelMeta)) {
    order = channels.channelMeta.map((c) => c?.id ?? c?.label).filter(Boolean);
    errors = channels.channelMeta.filter((c) => !c?.connected && c?.connected != null).length;
  }
  if (!order) {
    const list = Array.isArray(channels) ? channels : (Array.isArray(channels?.channels) ? channels.channels : null);
    if (!list) return null;
    order = list.map((c) => c?.name ?? c?.channel ?? c?.id).filter(Boolean);
    errors = list.filter((c) => c?.error || c?.lastError || c?.connected === false).length;
    labelsMap = {};
  }
  return { count: order.length, names: order.map((o) => labelsMap[o] ?? o), errors };
}

export function formatUsd(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  return `$${Number(n).toFixed(4).replace(/0+$/, "").replace(/\.$/, "")}`;
}

export function uptimeLabel(row) {
  const v = row?.uptimeMs ?? row?.uptime?.ms ?? null;
  return Number.isFinite(Number(v)) ? formatDuration(Number(v)) : null;
}
