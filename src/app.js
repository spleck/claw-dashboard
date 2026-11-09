// Wiring: gateway <-> store <-> render. Keyboard lives here too.
import readline from "node:readline";
import { setTimeout as sleep } from "node:timers/promises";
import { GatewayClient, VERSION } from "./gateway.js";
import { Store } from "./store.js";
import { threadTree, sessionLabel, orderCronJobs, cronJobLabel, cronScheduleLabel, cronHealth, statusIcon, isRunning, formatTokens, formatDuration, relative, contextPressure, formatUsd } from "./insights.js";
import { makePainter, renderScreen, presentFrame, TERM_CODES } from "./render.js";

// One-shot reads fired after every hello (cheap, read-only).
export const ONE_SHOTS = [
  ["agents.list", {}],
  ["cron.list", { includeDisabled: true, limit: 200 }],
  ["cron.runs", { scope: "all", limit: 12 }],
  ["logs.tail", { limit: 300 }],
  ["status", {}],
  ["system-presence", {}],
  ["channels.status", {}],
  ["usage.cost", { days: 1 }], // quietly skipped if unsupported
];

async function fire(client, store, method, params) {
  try {
    const payload = await client.call(method, params);
    store.applyMethodResult(method, payload);
    return payload;
  } catch {
    return null; // one-shots may fail (e.g. usage.cost) — skip quietly
  }
}

async function initialSync(client, store) {
  await fire(client, store, "sessions.list", { limit: 80, sortBy: "activity" });
  for (const [method, params] of ONE_SHOTS) await fire(client, store, method, params);
  await fire(client, store, "sessions.subscribe", { limit: 80, sortBy: "activity" });
}

// ---- TUI ---------------------------------------------------------------------
export function start({ url, token, noColor = false }) {
  if (!process.stdin.isTTY) {
    console.error("clawdash: no TTY on stdin; use `clawdash --once` for a one-shot snapshot");
    process.exitCode = 1;
    return;
  }
  const store = new Store();
  const client = new GatewayClient({ url, token });
  const p = makePainter({ noColor });
  const ui = {
    focus: "threads",
    sel: { threads: 0, automations: 0 },
    overlay: null, // {kind:"help"} | {kind:"session", sessionKey, title, data, error} | {kind:"cron", jobId, title}
    logFilter: "all", // all -> error -> warn -> info
    activityErrorsOnly: false,
  };
  let width = process.stdout.columns > 0 ? process.stdout.columns : 100;
  let height = process.stdout.rows > 0 ? process.stdout.rows : 30;
  let dirty = true;
  let lastFrame = "";
  const pollTimers = [];

  const render = () => {
    try {
      const frame = renderScreen({ snap: store.snapshot(), ui, width, height, p });
      if (frame !== lastFrame) {
        lastFrame = frame;
        process.stdout.write(presentFrame(frame));
      }
    } catch (err) {
      process.stdout.write(TERM_CODES.leave);
      console.error(`clawdash: render error: ${err?.stack ?? err}`);
      process.exit(1);
    }
  };

  const touch = () => { dirty = true; };

  // gateway lifecycle
  client.on("event", (name, payload) => {
    store.onEvent(name, payload);
    if (name !== "tick") touch();
  });
  client.on("down", () => {
    store.setConnection("reconnecting");
    touch();
  });
  client.on("reconnecting", (ms) => {
    store.setConnection("reconnecting", ms);
    touch();
  });
  client.on("hello", () => {
    store.setConnection("connected");
    store.applyHello(client.hello);
    initialSync(client, store).then(touch);
    touch();
  });

  client.connect().then(() => {
    store.setConnection("connected");
    store.applyHello(client.hello);
    return initialSync(client, store);
  }).then(touch).catch((err) => {
    store.setConnection("reconnecting");
    store.pushActivity({ source: "system", level: "error", text: `connect failed: ${err?.message ?? err}` });
    touch();
  });

  // quiet polling (catches missed pushes; single socket, nothing hammered)
  pollTimers.push(setInterval(async () => {
    if (client.connection === "connected") await fire(client, store, "sessions.list", { limit: 80, sortBy: "activity" }).then(touch);
  }, 15_000));
  pollTimers.push(setInterval(async () => {
    if (client.connection !== "connected") return;
    const payload = await client.call("logs.tail", { ...(store.logsMeta.cursor ? { cursor: store.logsMeta.cursor } : {}), limit: 200 }).catch(() => null);
    if (payload) { store.applyMethodResult("logs.tail", payload); touch(); }
  }, 1_500));
  pollTimers.push(setInterval(async () => {
    if (client.connection !== "connected") return;
    await fire(client, store, "cron.list", { includeDisabled: true, limit: 200 });
    touch();
  }, 30_000));
  pollTimers.push(setInterval(async () => {
    if (client.connection !== "connected") return;
    await fire(client, store, "status", {});
    await fire(client, store, "system-presence", {});
    await fire(client, store, "channels.status", {});
    touch();
  }, 30_000));
  pollTimers.push(setInterval(async () => {
    await fire(client, store, "usage.cost", { days: 1 });
    touch();
  }, 15 * 60_000));
  for (const t of pollTimers) t.unref?.();

  // terminal housekeeping
  process.stdout.write(TERM_CODES.enter);
  render();
  const paintLoop = setInterval(() => { if (dirty) { dirty = false; render(); } }, 250);
  process.stdout.on("resize", () => {
    width = process.stdout.columns ?? width;
    height = process.stdout.rows ?? height;
    dirty = true;
  });

  // keyboard
  const sessionTree = () => threadTree([...store.sessions.values()], Date.now());
  const jobList = () => orderCronJobs([...store.cronJobs.values()]);

  const closeOverlay = () => { ui.overlay = null; touch(); };

  function openPeek() {
    if (ui.overlay?.kind === "help") return closeOverlay();
    if (ui.overlay) return closeOverlay(); // same key closes an open peek
    if (ui.focus === "threads") {
      const tree = sessionTree();
      const entry = tree[Math.min(ui.sel.threads, tree.length - 1)];
      if (!entry) return;
      ui.overlay = {
        kind: "session", sessionKey: entry.row.key, title: sessionLabel(entry.row),
        data: null, error: null,
      };
      client.call("chat.history", { sessionKey: entry.row.key, limit: 15 })
        .then((data) => { ui.overlay.data = data; touch(); })
        .catch((err) => { ui.overlay.error = err?.message ?? "unavailable"; touch(); });
    } else {
      const jobs = jobList();
      const job = jobs[Math.min(ui.sel.automations, jobs.length - 1)];
      if (!job) return;
      ui.overlay = { kind: "cron", jobId: job.id, title: cronJobLabel(job), error: null };
      client.call("cron.runs", { scope: "all", limit: 12 })
        .then((data) => { if (data) store.applyMethodResult("cron.runs", data); touch(); })
        .catch((err) => { ui.overlay.error = err?.message ?? "unavailable"; touch(); });
    }
    touch();
  }

  const move = (delta) => {
    if (ui.focus === "threads") ui.sel.threads = Math.max(0, ui.sel.threads + delta);
    else ui.sel.automations = Math.max(0, ui.sel.automations + delta);
    touch();
  };
  const jump = (where) => {
    const len = ui.focus === "threads" ? sessionTree().length : jobList().length;
    ui.sel[ui.focus === "threads" ? "threads" : "automations"] = where === "top" ? 0 : Math.max(0, len - 1);
    touch();
  };
  const cycleLogFilter = () => {
    ui.logFilter = { all: "error", error: "warn", warn: "info", info: "all" }[ui.logFilter] ?? "all";
    touch();
  };
  const refreshNow = () => {
    initialSync(client, store).then(touch);
    touch();
  };

  function onKey(ch, key) {
    const name = key?.name ?? "";
    if (key?.ctrl && name === "c") return quit();
    if (ch === "q") return quit();
    if (name === "tab") { ui.focus = ui.focus === "threads" ? "automations" : "threads"; return touch(); }
    if (name === "up" || ch === "k") return move(-1);
    if (name === "down" || ch === "j") return move(1);
    if (name === "g" && !key?.shift) return jump("top");
    if (name === "g" && key?.shift) return jump("end");
    if (ch === "G") return jump("end");
    if (name === "return" || name === "enter") return ui.overlay?.kind === "help" ? closeOverlay() : openPeek();
    if (name === "escape") return ui.overlay ? closeOverlay() : undefined;
    if (ch === "l" && !ui.overlay) return cycleLogFilter();
    if (ch === "a" && !ui.overlay) { ui.activityErrorsOnly = !ui.activityErrorsOnly; return touch(); }
    if (ch === "r" && !ui.overlay) return refreshNow();
    if (ch === "?") return ui.overlay?.kind === "help" ? closeOverlay() : (ui.overlay = { kind: "help" }, touch());
  }

  function quit() {
    for (const t of pollTimers) clearInterval(t);
    clearInterval(paintLoop);
    client.close();
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stdout.write(TERM_CODES.leave);
    console.log("bye");
    process.exit(0);
  }

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on("keypress", onKey);
  process.on("SIGINT", quit);
  return { client, store };
}

// ---- --once mode ----------------------------------------------------------------
export async function runOnce({ url, token, port }) {
  const store = new Store();
  const client = new GatewayClient({ url, token });
  try {
    await Promise.race([
      client.connect(),
      sleep(10_000).then(() => { throw new Error("timed out connecting to gateway"); }),
    ]);
  } catch (err) {
    client.close();
    console.error(`clawdash: ${err?.message ?? err}`);
    process.exitCode = 1;
    return;
  }
  store.setConnection("connected");
  store.applyHello(client.hello);
  await fire(client, store, "sessions.list", { limit: 80, sortBy: "activity" });
  for (const [method, params] of ONE_SHOTS) await fire(client, store, method, params);
  client.close();
  console.log(textSnapshot(store, port));
}

function textSnapshot(store, port) {
  const now = Date.now();
  const ctx = { ...store.snapshot(), now };
  ctx.runningCount = ctx.sessions.filter((r) => isRunning(r)).length;
  const line = (s) => s.replace(/\s+$/, "");
  const out = [];
  const health = ctx.health;
  out.push(line(`clawdash ${VERSION} · OpenClaw ${ctx.server?.version ?? "—"} · connected :${port} · up ${ctx.server?.uptimeMs != null ? formatDuration(ctx.server.uptimeMs) : "—"}`
    + (health ? ` · health ${health.ok && !health.degraded ? "ok" : `degraded${health.reasons.length ? ` (${health.reasons.join(", ")})` : ""}`}` : "")
    + ` · presence ${ctx.presence.length}`));
  const nextJobs = orderCronJobs(ctx.cronJobs.filter((j) => j?.enabled !== false));
  const nextJob = nextJobs.find((j) => Number.isFinite(Number(j?.state?.nextRunAtMs)));
  out.push(line(`sessions ${ctx.sessionTotals.count ?? ctx.sessions.length} (${ctx.runningCount} running) · tok/min ${formatTokens(ctx.tokPerMin)} · today ${formatUsd(ctx.costToday)}${nextJob ? ` · next cron ${cronJobLabel(nextJob)} in ${formatDuration(Math.max(0, Number(nextJob.state.nextRunAtMs) - now))}` : ""}`));
  out.push("");
  out.push("threads:");
  const tree = threadTree(ctx.sessions, now).slice(0, 10);
  for (const { row, depth } of tree) {
    const ctx2 = contextPressure(row);
    const bits = [
      ` ${depth ? "  └" : statusIcon(row.status ?? "queued")}`,
      sessionLabel(row).slice(0, 46).padEnd(46),
      (ctx2 ? `${Math.round(ctx2.pct)}%` : "—").padStart(4),
      formatTokens(row.totalTokens).padStart(7),
      relative(row.lastActivityAt, now).padStart(9),
    ];
    out.push(line(bits.join(" ")));
  }
  out.push("");
  out.push(`automations (${ctx.cronJobs.length}):`);
  for (const job of ctx.cronJobs.slice(0, 12)) {
    const h = cronHealth(job, now);
    out.push(line(` ${h.icon} ${cronJobLabel(job).slice(0, 34).padEnd(34)} ${cronScheduleLabel(job).padEnd(18)} ${(h.nextIn ? `next ${h.nextIn.label}` : "next —").padEnd(16)} last ${h.status ?? "never"}${h.streak ? ` (✗${h.streak})` : ""}`));
  }
  const logs = ctx.logs.slice(-10);
  if (logs.length) {
    out.push("");
    out.push("logs (tail):");
    for (const l of logs) {
      const t = l.ts ? new Date(l.ts).toTimeString().slice(0, 8) : "--------";
      out.push(line(` ${t} ${l.level.padEnd(5)} ${l.subsystem ? `[${l.subsystem}] ` : ""}${l.msg.slice(0, 120)}`));
    }
  }
  return out.join("\n");
}
