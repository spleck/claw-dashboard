import test from "node:test";
import assert from "node:assert/strict";
import { makePainter, bar, fitSegs, stripAnsi, padTo, boxLines, renderScreen } from "../src/render.js";

test("no-color painter emits zero ANSI escapes", () => {
  const p = makePainter({ noColor: true });
  for (const out of [p.red("x"), p.green("x"), p.gray("x"), p.bold("x"), p.dim("x"), p.bg("x"), p.status("failed")("x"), p.cyan("x"), p.yellow("x"), p.dark("x")]) {
    assert.equal(out, "x");
    assert.doesNotMatch(out, /\x1b/);
  }
});

test("color painter emits open/close pairs that compose", () => {
  const p = makePainter({ noColor: false });
  const composed = p.bg(p.red("x"));
  assert.ok(composed.includes("48;5;236"));
  assert.ok(composed.includes("38;5;203"));
  assert.equal(stripAnsi(composed), "x");
});

test("bar clamps to 0..100 and always fills width", () => {
  assert.equal(bar(150, 10), "█".repeat(10));
  assert.equal(bar(-5, 10), "░".repeat(10));
  assert.equal(bar(50, 10), "█".repeat(5) + "░".repeat(5));
  assert.equal(bar(0, 4), "░".repeat(4));
  assert.equal(bar(null, 4), "░".repeat(4));
});

test("fitSegs clips to visible width regardless of escapes", () => {
  const p = makePainter({});
  const segs = [{ t: "hello", p: p.red }, { t: " world" }];
  assert.equal(stripAnsi(fitSegs(segs, 6)), "hello ");
  assert.equal(fitSegs(segs, 0), "");
});

test("padTo measures visible width only", () => {
  const p = makePainter({});
  const s = padTo(p.red("ab"), 5);
  assert.equal(stripAnsi(s).length, 5);
});

test("boxLines returns exactly height lines with rounded borders", () => {
  const p = makePainter({ noColor: true });
  const box = boxLines({ title: "T", lines: [[{ t: "row" }]], width: 12, height: 4, p });
  assert.equal(box.length, 4);
  assert.ok(box[0].startsWith("╭─"));
  assert.ok(box[0].endsWith("╮"));
  assert.ok(box[1].startsWith("│"));
  assert.ok(box[3].startsWith("╰─"));
  assert.ok(box[3].endsWith("╯"));
  for (const line of box) assert.equal(stripAnsi(line).length, 12);
});

test("renderScreen guards against tiny terminals", () => {
  const p = makePainter({ noColor: true });
  const view = {
    snap: { sessions: [], sessionTotals: {}, cronJobs: [], runs: [], presence: [], logs: [], activity: [], tokMap: new Map(), connection: "connecting" },
    ui: { focus: "threads", sel: { threads: 0, automations: 0 }, overlay: null, logFilter: "all", activityErrorsOnly: false },
    width: 60, height: 20, p,
  };
  const frame = renderScreen(view);
  assert.match(frame, /at least 80x24/);
  assert.equal(frame.split("\n").length, 1);
});

test("renderScreen builds a full frame (min size, no color)", () => {
  const p = makePainter({ noColor: true });
  const snap = {
    connection: "connected", reconnectInMs: null,
    server: { version: "2026.11.1", uptimeMs: 3_600_000 },
    sessions: [{ key: "agent:main:main", label: "main", status: "done", lastActivityAt: Date.now() - 60_000, totalTokens: 1234, model: "ollama/glm-5.3" }],
    sessionTotals: { count: 1, totalCount: 1 },
    cronJobs: [{ id: "j", name: "heartbeats", enabled: true, schedule: { kind: "every", everyMs: 1_800_000 }, state: { lastRunStatus: "ok", nextRunAtMs: Date.now() + 300_000 } }],
    runs: [], presence: [{ instanceId: "x" }], channels: { channels: [{ name: "telegram" }] },
    logs: [{ ts: Date.now(), level: "info", subsystem: "gateway", msg: "hi" }],
    activity: [{ ts: Date.now(), source: "cron", text: "heartbeats → ok", level: undefined }],
    tokPerMin: 4_200, tokMap: new Map(), costToday: 0.1234,
    health: { ok: true, p99: 3 }, updateAvailable: false,
  };
  const ui = { focus: "threads", sel: { threads: 0, automations: 0 }, overlay: null, logFilter: "all", activityErrorsOnly: false };
  const frame = renderScreen({ snap, ui, width: 80, height: 24, p });
  const lines = frame.split("\n");
  assert.equal(lines.length, 24);
  assert.match(frame, /OpenClaw 2026\.11\.1/);
  assert.match(frame, /up 1h 0m/);
  assert.match(frame, /sessions 1/);
  assert.match(frame, /today \$0\.1234/);
  assert.match(frame, /next cron heartbeats in 5m/);
  assert.match(frame, /main/);
  assert.match(frame, /heartbeats/);
  assert.match(frame, /every 30m/);
  assert.doesNotMatch(frame, /\x1b/); // noColor end-to-end
});

test("help overlay renders over a dimmed frame", () => {
  const p = makePainter({ noColor: true });
  const snap = { sessions: [], sessionTotals: {}, cronJobs: [], runs: [], presence: [], logs: [], activity: [], tokMap: new Map(), connection: "connected", channels: null };
  const frame = renderScreen({
    snap, ui: { focus: "threads", sel: { threads: 0, automations: 0 }, overlay: { kind: "help" }, logFilter: "all", activityErrorsOnly: false },
    width: 80, height: 24, p,
  });
  const lines = frame.split("\n");
  assert.equal(lines.length, 24);
  assert.match(frame, /clawdash keys/);
});
