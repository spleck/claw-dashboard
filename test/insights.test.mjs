import test from "node:test";
import assert from "node:assert/strict";
import {
  formatTokens, formatDuration, formatIn, relative, countdown,
  contextPressure, threadTree, cronHealth, statusIcon, sparkline, trendChar, costTotal,
} from "../src/insights.js";

test("formatTokens scales human-readable", () => {
  assert.equal(formatTokens(0), "0");
  assert.equal(formatTokens(999), "999");
  assert.equal(formatTokens(1234), "1.2k");
  assert.equal(formatTokens(12_340), "12k");
  assert.equal(formatTokens(3_400_000), "3.4M");
  assert.equal(formatTokens(undefined), "—");
  assert.equal(formatTokens(-5), "—");
});

test("formatDuration renders compact durations", () => {
  assert.equal(formatDuration(42_000), "42s");
  assert.equal(formatDuration(452_000), "7m 32s");
  assert.equal(formatDuration(7_500_000), "2h 5m");
  assert.equal(formatDuration(-1), "—");
});

test("countdown is short-form for future events", () => {
  assert.equal(countdown(420_000), "7m");
  assert.equal(countdown(7_500_000), "2h 5m");
});

test("formatIn flags overdue runs", () => {
  const future = formatIn(420_000);
  assert.equal(future.overdue, false);
  assert.equal(future.label, "7m");
  const past = formatIn(-180_000);
  assert.equal(past.overdue, true);
  assert.match(past.label, /overdue/);
  assert.equal(formatIn(null).label, "—");
});

test("relative renders ages", () => {
  const now = Date.now();
  assert.equal(relative(now - 300_000, now), "5m ago");
  assert.equal(relative(now, now), "just now");
  assert.equal(relative(null, now), "—");
});

test("contextPressure is null when unknown, clamped when known", () => {
  assert.equal(contextPressure({}), null);
  assert.equal(contextPressure({ totalTokens: 0 }), null);
  const known = contextPressure({ contextTokens: 500_000, contextWindow: 1_000_000 });
  assert.equal(known.pct, 50);
  assert.equal(known.used, 500_000);
  const fallback = contextPressure({ inputTokens: 100, outputTokens: 100, totalTokens: 1 }); // input+output preferred
  assert.equal(fallback.used, 200);
  assert.equal(contextPressure({ contextTokens: 2_000_000 }).pct, 100); // clamped vs default 1M window
});

test("contextPressure reads the verified gateway budget shape (contextTokens is the window)", () => {
  const row = {
    contextTokens: 1_048_576, // window, not usage!
    contextBudgetStatus: { estimatedPromptTokens: 285_142, contextTokenBudget: 1_048_576 },
  };
  const p = contextPressure(row);
  assert.equal(p.used, 285_142);
  assert.equal(p.pct, (285_142 / 1_048_576) * 100);
  // window-sized contextTokens must NOT count as usage when it equals the budget
  assert.equal(contextPressure({ contextTokens: 1_048_576, totalTokens: 1_048_576, contextBudgetStatus: { contextTokenBudget: 1_048_576 } }), null);
});

test("threadTree nests subagents under parents and flags orphans", () => {
  const parent = { key: "agent:main:main", lastActivityAt: 1000 };
  const sub1 = { key: "agent:main:subagent:a", parentSessionKey: "agent:main:main", subagentRole: "coder", lastActivityAt: 2000 };
  const sub2 = { key: "agent:main:subagent:b", parentSessionKey: "agent:main:main", subagentRole: "reviewer", lastActivityAt: 3000 };
  const orphan = { key: "agent:main:subagent:c", parentSessionKey: "agent:main:gone", subagentRole: "coder", lastActivityAt: 5000 };
  const cron = { key: "agent:main:cron:x", lastActivityAt: 500 };
  const tree = threadTree([sub1, orphan, parent, cron, sub2]);
  const keys = tree.map((e) => ({ key: e.row.key, depth: e.depth }));
  assert.deepEqual(keys, [
    { key: "agent:main:subagent:c", depth: 0 }, // orphan surfaces on its own row
    { key: "agent:main:main", depth: 0 },
    { key: "agent:main:subagent:b", depth: 1 }, // children sorted by activity
    { key: "agent:main:subagent:a", depth: 1 },
    { key: "agent:main:cron:x", depth: 0 },
  ]);
  assert.equal(tree.find((e) => e.row.key === "agent:main:subagent:b").row.subagentRole, "reviewer");
});

test("cronHealth streaks, icons, and overdue warnings", () => {
  const now = 1_762_000_000_000;
  const ok = cronHealth({ enabled: true, state: { lastRunStatus: "ok", nextRunAtMs: now + 60_000, consecutiveErrors: 0 } }, now);
  assert.equal(ok.icon, "✔");
  assert.equal(ok.warn, false);
  assert.equal(ok.nextIn.overdue, false);
  const streaking = cronHealth({ enabled: true, state: { lastRunStatus: "error", consecutiveErrors: 3, nextRunAtMs: now - 5_000 } }, now);
  assert.equal(streaking.icon, "✗");
  assert.equal(streaking.streak, 3);
  assert.equal(streaking.warn, true);
  assert.equal(streaking.nextIn.overdue, true);
  const disabled = cronHealth({ enabled: false, state: {} }, now);
  assert.equal(disabled.icon, "◌");
});

test("statusIcon covers known statuses", () => {
  assert.equal(statusIcon("running"), "●");
  assert.equal(statusIcon("done"), "✓");
  assert.equal(statusIcon("failed"), "✗");
  assert.equal(statusIcon("interrupted"), "⚑");
  assert.equal(statusIcon("queued"), "◌");
  assert.equal(statusIcon("timeout"), "⌛");
  assert.equal(statusIcon("killed"), "✕");
  assert.equal(statusIcon("mystery"), "·");
});

test("sparkline maps to block chars", () => {
  assert.equal(sparkline([0, 1, 2, 4, 8]), "▁▁▂▄▇");
  assert.equal(sparkline([]), "");
  assert.equal(sparkline([0]), "▁");
});

test("trendChar is blank when idle", () => {
  assert.equal(trendChar(0, 100), " ");
  assert.equal(trendChar(100, 100), "▇");
});

test("costTotal digs out totals defensively", () => {
  assert.equal(costTotal({ total: { totalUsd: 0.42 } }), 0.42);
  assert.equal(costTotal({ totalUsd: 0.5 }), 0.5);
  assert.equal(costTotal({ days: [{ total: 1.5 }, { total: 0.25 }] }), 1.5);
  assert.equal(costTotal({ nothing: "here" }), null);
  assert.equal(costTotal(null), null);
});
