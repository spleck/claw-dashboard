import test from "node:test";
import assert from "node:assert/strict";
import { Store, mergeSessionRow, parseLogLine, LOG_LIMIT, ACTIVITY_LIMIT } from "../src/store.js";

test("mergeSessionRow: partial rows patch, null clears, omission preserves", () => {
  const base = { key: "a", model: "ollama/glm", totalTokens: 100, status: "running", lastRunError: null };
  const merged = mergeSessionRow(base, { status: "done", totalTokens: 150 });
  assert.equal(merged.model, "ollama/glm"); // omitted = unchanged
  assert.equal(merged.status, "done");
  assert.equal(merged.totalTokens, 150);
  const cleared = mergeSessionRow(merged, { lastRunError: null, model: null });
  assert.equal("model" in cleared, false); // null clears
  assert.equal("lastRunError" in cleared, false);
  // activeRunIds: [] clears the run set by replacing it
  const clearedRuns = mergeSessionRow({ key: "a", activeRunIds: ["r1", "r2"] }, { activeRunIds: [] });
  assert.deepEqual(clearedRuns.activeRunIds, []);
});

test("sessions.changed partial rows merge into the store by key", () => {
  const store = new Store();
  store.applyMethodResult("sessions.list", {
    count: 1, totalCount: 1, sessions: [
      { key: "agent:main:main", status: "running", totalTokens: 10, hasActiveRun: true },
    ],
  });
  store.onEvent("sessions.changed", { session: { key: "agent:main:main", status: "done", activeRunIds: [] } });
  const row = store.sessions.get("agent:main:main");
  assert.equal(row.status, "done");
  assert.deepEqual(row.activeRunIds, []);
  assert.equal(row.totalTokens, 10); // untouched by the partial row
});

test("log ring buffer trims to LOG_LIMIT and keeps newest", () => {
  const store = new Store();
  const lines = Array.from({ length: LOG_LIMIT + 50 }, (_, i) => `{"1":"info","2":"${1000 + i}","3":"line-${i}"}`);
  store.applyLogsTail({ lines, cursor: 42 });
  assert.equal(store.logs.length, LOG_LIMIT);
  assert.equal(store.logs.at(-1).msg, `line-${LOG_LIMIT + 49}`);
  assert.equal(store.logs[0].msg, "line-50"); // oldest 50 dropped
  assert.equal(store.logsMeta.cursor, 42);
});

test("logs.tail reset clears the buffer", () => {
  const store = new Store();
  store.applyLogsTail({ lines: ["a", "b"], cursor: 5 });
  store.applyLogsTail({ reset: true, lines: ["c"], cursor: 9 });
  assert.deepEqual(store.logs.map((l) => l.msg), ["c"]);
  assert.equal(store.logsMeta.cursor, 9);
});

test("parseLogLine defends against gateway log JSON shapes and plain text", () => {
  const structured = parseLogLine('{"0":"{\\"subsystem\\":\\"gateway\\"}","1":"warn","2":"1762000000000","3":"disk almost full"}');
  assert.equal(structured.level, "warn");
  assert.equal(structured.subsystem, "gateway");
  assert.equal(structured.ts, 1_762_000_000_000);
  assert.equal(structured.msg, "disk almost full");
  const plain = parseLogLine("just a line");
  assert.equal(plain.level, "info");
  assert.equal(plain.msg, "just a line");
  const err = parseLogLine('{"1":"error","3":"boom"}');
  assert.equal(err.level, "error");
  assert.equal(err.msg, "boom");
});

test('parseLogLine treats {"0":"<text>"} wrappers as messages and flattens newlines', () => {
  const wrapped = parseLogLine('{"0":"OpenClaw status\\nOverview"}');
  assert.equal(wrapped.subsystem, null);
  assert.equal(wrapped.msg, "OpenClaw status ⏎ Overview");
  const short = parseLogLine('{"0":"gateway","1":"info","3":"ready"}');
  assert.equal(short.subsystem, "gateway");
  assert.equal(short.msg, "ready");
  const long = parseLogLine('{"0":"(node:1) [DEP] a very long deprecation warning '.padEnd(120, "x") + '"}');
  assert.equal(long.subsystem, null);
  assert.match(long.msg, /deprecation/);
});

test("activity feed appends and trims", () => {
  const store = new Store({ activityLimit: 3 });
  for (let i = 0; i < ACTIVITY_LIMIT + 5; i++) store.pushActivity({ source: "cron", text: `e${i}` });
  assert.equal(store.activity.length, 3);
  // keeps the newest three: events were e0..e204
  assert.deepEqual(store.activity.map((a) => a.text), ["e202", "e203", "e204"]);
});

test("token deltas: cumulative totals produce deltas and tok/min", async () => {
  const store = new Store();
  store.putSession({ key: "s1", totalTokens: 100 });
  await new Promise((r) => setTimeout(r, 5));
  store.putSession({ key: "s1", totalTokens: 1_600 });
  assert.equal(store.tokPerMinute(), 1_500);
  const perSession = store.tokPerSession().get("s1");
  assert.ok(perSession >= 1_500);
  // no delta when totals shrink or stay flat
  store.putSession({ key: "s1", totalTokens: 100 });
  assert.equal(store.tokPerMinute(), 1_500);
});

test("run transitions surface in activity", () => {
  const store = new Store();
  store.putSession({ key: "s1", label: "work" }); // first sight: baseline, no events
  store.putSession({ key: "s1", label: "work", hasActiveRun: true });
  store.putSession({ key: "s1", label: "work", hasActiveRun: false, status: "done" });
  const texts = store.activity.map((a) => a.text);
  assert.equal(texts.length, 2);
  assert.match(texts[0], /run started · work/);
  assert.match(texts[1], /run finished · work \(done\)/);
});

test("cron events update job state and activity", () => {
  const store = new Store();
  store.applyMethodResult("cron.list", {
    jobs: [{ id: "j1", name: "heartbeats", enabled: true, state: { lastRunStatus: "ok" } }],
  });
  store.onEvent("cron", { action: "started", jobId: "j1" });
  store.onEvent("cron", { jobId: "j1", jobName: "heartbeats", status: "error", error: "boom", runAtMs: 1_762_000_000_000, durationMs: 44 });
  const job = store.cronJobs.get("j1");
  assert.equal(job.state.lastRunStatus, "error");
  assert.equal(job.state.lastError, "boom");
  assert.equal(job.state.lastDurationMs, 44);
  const last = store.activity.at(-1);
  assert.match(last.text, /heartbeats → error · boom/);
  assert.equal(last.level, "error");
});

test("snapshot exposes derivations defensively", () => {
  const store = new Store();
  store.applyHello({ server: { version: "2026.11.1" }, snapshot: { uptimeMs: 60_000 } });
  const t0 = Date.now();
  store.applyMethodResult("status", { runtimeVersion: "2026.11.1", eventLoop: { degraded: false, reasons: [], delayP99Ms: 2 } });
  store.applyMethodResult("channels.status", { channelOrder: ["telegram"], channelLabels: { telegram: "Telegram" } });
  store.applyMethodResult("usage.cost", { daily: [{ totalCost: 0.75, totalTokens: 10 }] });
  const snap = store.snapshot();
  assert.equal(snap.server.version, "2026.11.1");
  const uptime = snap.server.uptimeMs;
  assert.ok(Math.abs(uptime - (60_000 + (Date.now() - t0))) < 3_000, `uptime should tick live (${uptime})`);
  assert.ok(snap.health, "eventLoop from status is a health fallback");
  assert.equal(snap.health.p99, 2);
  assert.equal(snap.health.degraded, false);
  assert.equal(snap.costToday, 0.75);
});
