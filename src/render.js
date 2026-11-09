// Raw ANSI painter: full-frame repaints are coalesced by the app (max ~4 Hz).
// No blessed, no mouse — box-drawing chars, 256 colors, and honest layout.
// Every style is an (open, close) pair so styles compose instead of resetting.
import {
  formatTokens, formatDuration, relative, formatIn, truncate, formatUsd,
  threadTree, statusIcon, sessionLabel, isRunning, contextPressure,
  cronScheduleLabel, cronHealth, cronJobLabel, summarizeChannels, trendChar, sparkline, orderCronJobs,
} from "./insights.js";

export const TERM_CODES = {
  enter: "\x1b[?1049h\x1b[?25l\x1b[2J\x1b[H",
  leave: "\x1b[?25h\x1b[?1049l\x1b[H\x1b[2J",
};

// Wrap a rendered frame for a single atomic write: home, erase each line tail, clear below.
export function presentFrame(frame) {
  return "\x1b[H" + frame.split("\n").map((l) => l + "\x1b[K").join("\n") + "\x1b[0m\x1b[J";
}

export function makePainter({ noColor = false } = {}) {
  const c = (open, close) => (s) => (noColor ? s : `\x1b[${open}m${s}\x1b[${close}m`);
  const p = {
    noColor,
    gray: c("38;5;245", "39"),
    dark: c("38;5;238", "39"),
    red: c("38;5;203", "39"),
    green: c("38;5;114", "39"),
    yellow: c("38;5;179", "39"),
    cyan: c("38;5;80", "39"),
    bold: c("1", "22"),
    dim: c("2", "22"),
    bg: c("48;5;236", "49"),
  };
  p.status = (status) => (status === "failed" || status === "error" ? p.red
    : status === "warn" || status === "interrupted" ? p.yellow
    : status === "running" || status === "ok" ? p.green : p.gray);
  p.err = (s) => p.bold(p.red(s)); // composed: bold red
  p.warn = (s) => p.bold(p.yellow(s)); // composed: bold amber
  return p;
}

const ANSI_RE = /\x1b\[[0-9;]*[A-Za-z]/g;
export function stripAnsi(s) {
  return String(s).replace(ANSI_RE, "");
}

// Filled bar, clamped to 0..100. Null/unknown pct renders an empty rail.
export function bar(pct, width) {
  const p = pct == null || !Number.isFinite(Number(pct)) ? 0 : Math.max(0, Math.min(100, Number(pct)));
  const filled = Math.round((p / 100) * width);
  return "█".repeat(Math.max(0, filled)) + "░".repeat(Math.max(0, width - filled));
}

// Join styled segments {t, p?} into a string clipped to `width` visible chars.
export function fitSegs(segs, width) {
  let out = "", used = 0;
  for (const seg of segs ?? []) {
    if (used >= width) break;
    const t = String(seg?.t ?? "");
    const slice = t.slice(0, width - used);
    used += slice.length;
    out += seg?.p ? seg.p(slice) : slice;
    if (t.length > slice.length) break;
  }
  return out;
}

export function padTo(s, width) {
  return s + " ".repeat(Math.max(0, width - stripAnsi(s).length));
}

const R = { tl: "╭", tr: "╮", bl: "╰", br: "╯", h: "─", v: "│" };

// Rounded-border box; returns exactly `height` strings of visible width `width`.
export function boxLines({ title = "", lines = [], width, height, focus = false, p, footer = null }) {
  const edge = focus ? p.gray : p.dark;
  const contentW = Math.max(0, width - 4);
  const label = title ? ` ${truncate(title, Math.max(0, width - 6))} ` : "";
  const topDashes = Math.max(0, width - 3 - label.length);
  const out = [edge(R.tl + R.h) + (title ? (focus ? p.bold(label) : p.gray(label)) : "") + edge(R.h.repeat(topDashes)) + edge(R.tr)];
  for (let i = 0; i < Math.max(0, height - 2); i++) {
    const content = lines[i] ? padTo(fitSegs(lines[i], contentW), contentW) : " ".repeat(contentW);
    out.push(edge(R.v) + " " + content + " " + edge(R.v));
  }
  const foot = footer ? ` ${truncate(footer, Math.max(0, width - 6))} ` : "";
  const botDashes = foot ? Math.max(0, width - 3 - foot.length) : Math.max(0, width - 3);
  out.push(edge(R.bl + R.h) + (foot ? p.gray(foot) + edge(R.h.repeat(botDashes)) : edge(R.h.repeat(botDashes))) + edge(R.br));
  return out.slice(0, height).map((l) => padTo(l, width));
}

function compactAge(ts, now) {
  return relative(ts, now).replace(/ ago$/, "").replace("just now", "now").replace("—", "-");
}

function headerLines(snap, p, w) {
  const dot = snap.connection === "connected" ? { t: "●", p: p.green }
    : snap.connection === "reconnecting" ? { t: "◌", p: p.yellow } : { t: "◌", p: p.dark };
  const up = snap.server?.uptimeMs != null ? [{ t: " · " }, { t: `up ${formatDuration(snap.server.uptimeMs)}`, p: p.gray }] : [];
  const health = snap.health;
  const healthSeg = health ? [{ t: " · " },
    { t: health.ok && !health.degraded ? "● ok" : "● degraded", p: health.ok && !health.degraded ? p.green : p.red },
    ...(health.p99 != null ? [{ t: ` (p99 ${Math.round(health.p99)}ms)`, p: p.gray }] : []),
  ] : [];
  const ver = snap.server?.version
    ? [{ t: " · " }, { t: "OpenClaw ", p: p.gray }, { t: snap.server.version, p: p.gray }]
    : [{ t: " · " }, { t: "OpenClaw —", p: p.gray }];
  const presenceSeg = snap.presence?.length != null ? [{ t: " · " }, { t: "presence ", p: p.gray }, { t: String(snap.presence.length), p: p.gray }] : [];
  const line1 = [
    { t: "clawdash " }, dot, { t: ` ${snap.connection}`, p: p.gray },
    ...ver, ...up, ...healthSeg, ...presenceSeg,
  ];
  const next = snap.nextCron;
  const nextSeg = next ? [{ t: " · " }, { t: "next cron ", p: p.gray },
    { t: cronJobLabel(next.job), p: p.gray }, { t: " " },
    { t: `in ${next.nextIn.label}`, p: next.nextIn.overdue ? p.err : p.gray },
  ] : [];
  const ch = summarizeChannels(snap.channels);
  const line2 = [
    { t: "sessions ", p: p.gray }, { t: String(snap.sessionTotals.count ?? snap.sessions.length ?? "—"), p: p.gray },
    snap.runningCount > 0 ? { t: ` (${snap.runningCount} running)`, p: p.gray } : { t: "" },
    { t: " · " }, { t: "tok/min ", p: p.gray },
    { t: snap.tokPerMin > 0 ? formatTokens(snap.tokPerMin) : "0", p: snap.tokPerMin > 0 ? p.cyan : p.gray },
    { t: " · " }, { t: "today ", p: p.gray },
    { t: formatUsd(snap.costToday), p: snap.costToday != null ? p.cyan : p.gray },
    ...nextSeg,
    ...(ch ? [{ t: " · " }, { t: `channels ${ch.count}${ch.errors > 0 ? ` (${ch.errors} err)` : ""}`, p: ch.errors > 0 ? p.red : p.gray }] : []),
    ...(snap.updateAvailable ? [{ t: "  " }, { t: "⚡ update available", p: p.warn }] : []),
  ];
  return [padTo(fitSegs(line1, w), w), padTo(fitSegs(line2, w), w)];
}

function threadColumns(innerW) {
  const cols = { icon: 3, tok: 5, trend: 1, age: 4, bar: 5, model: 12 };
  let fixed = cols.icon + cols.tok + cols.trend + cols.age + cols.bar + 8;
  cols.model = innerW >= fixed + cols.model + 10 ? cols.model : 0;
  fixed += cols.model;
  if (innerW - fixed < 8) cols.bar = 0;
  fixed -= cols.bar === 0 ? 5 + 2 : 0;
  cols.name = Math.max(8, innerW - fixed - 2);
  return cols;
}

function threadRowSegs(entry, selected, snap, p, cols) {
  const row = entry?.row ?? {};
  const wrap = (fn) => (selected ? (s) => p.bg(fn ? fn(s) : s) : fn ?? ((s) => s));
  const status = row.status ?? (isRunning(row) ? "running" : "queued");
  const running = isRunning(row);
  const sub = entry.depth > 0 || entry.orphan;
  const indent = entry.depth > 0 ? "└ " : "";
  const model = row.model ? String(row.model).split("/").pop() : "";
  const ctx = contextPressure(row);
  const pct = ctx ? Math.round(ctx.pct) : null;
  const segs = [
    { t: " ", p: undefined },
    { t: statusIcon(status), p: wrap(p.status(status)) },
    { t: " " },
    { t: indent + truncate(sessionLabel(row), Math.max(2, cols.name - indent.length)), p: running ? wrap(p.bold) : sub ? wrap(p.gray) : wrap(undefined) },
  ];
  if (sub) segs.push({ t: ` [${truncate(row.subagentRole ?? "sub", 10)}]`, p: wrap(p.dark) });
  if (cols.model) segs.push({ t: "  " }, { t: truncate(model, cols.model).padStart(cols.model), p: wrap(p.dark) });
  if (cols.bar) segs.push({ t: "  " }, { t: bar(pct, cols.bar), p: wrap(pct != null && pct > 80 ? p.red : pct != null && pct > 60 ? p.yellow : p.dark) });
  segs.push(
    { t: "  " }, { t: formatTokens(row.totalTokens).padStart(cols.tok), p: wrap(running ? p.cyan : p.gray) },
    { t: " " }, { t: trendChar(snap.tokMap.get(row.key) ?? 0, snap.tokMax), p: wrap(p.cyan) },
    { t: " " }, { t: truncate(compactAge(row.lastActivityAt, snap.now), cols.age).padStart(cols.age), p: wrap(p.gray) },
  );
  return segs;
}

function automationRow(snap, p, innerW, job, selected) {
  const h = cronHealth(job, snap.now);
  const wrap = (fn) => (selected ? (s) => p.bg(fn ? fn(s) : s) : fn ?? ((s) => s));
  const iconColor = h.icon === "✗" ? p.red : h.icon === "●" ? p.green : h.icon === "✔" ? p.green : h.icon === "⊘" ? p.yellow : p.dark;
  const sch = cronScheduleLabel(job);
  const lastTxt = h.status ? `${h.status === "ok" ? "✔" : h.status === "error" ? "✗" : "⊘"} ${compactAge(job?.state?.lastRunAtMs, snap.now)}` : "never";
  const streak = h.streak > 0 ? `✗${h.streak}` : "";
  const fixedNext = 12, fixedLast = lastTxt.length, fixedStreak = streak.length + 1;
  const nameW = Math.max(6, innerW - fixedNext - fixedLast - fixedStreak - sch.length - 9);
  const segs = [
    { t: " " }, { t: h.icon, p: wrap(iconColor) }, { t: " " },
    { t: truncate(cronJobLabel(job), nameW), p: wrap(job.enabled ? p.bold : p.gray) },
    { t: "  " }, { t: truncate(sch, 20), p: wrap(p.gray) },
    { t: "  " },
    h.nextIn
      ? { t: truncate(h.nextIn.label, fixedNext - 2).padStart(fixedNext - 2), p: wrap(h.nextIn.overdue ? p.err : p.gray) }
      : { t: "—".padStart(fixedNext - 2), p: wrap(p.dark) },
    { t: "  " }, { t: lastTxt, p: wrap(h.status === "error" ? p.red : p.gray) },
  ];
  if (streak) segs.push({ t: " " + streak, p: wrap(p.err) });
  return segs;
}

function activityRows(snap, ui, p, innerW, avail) {
  const rows = [];
  for (let i = snap.activity.length - 1; i >= 0 && rows.length < avail; i--) {
    const a = snap.activity[i];
    if (ui.activityErrorsOnly && a.level !== "error") continue;
    rows.push(a);
  }
  return rows.map((a) => {
    const t = new Date(a.ts).toTimeString().slice(0, 8);
    const tagColors = { cron: p.yellow, chat: p.cyan, agent: p.green, hb: p.dark };
    return [
      { t: t, p: p.dark }, { t: " " },
      { t: a.source.padEnd(5).slice(0, 5), p: tagColors[a.source] ?? p.gray }, { t: " " },
      { t: truncate(a.text, Math.max(8, innerW - 9)), p: a.level === "error" ? p.err : a.level === "warn" ? p.yellow : undefined },
    ];
  });
}

const LOG_RANK = { debug: 0, info: 1, warn: 2, error: 3 };
function logRows(snap, ui, p, innerW, avail) {
  const min = LOG_RANK[ui.logFilter] ?? 0;
  const rows = snap.logs.filter((l) => LOG_RANK[l.level] >= min).slice(-avail);
  return rows.map((l) => {
    const t = l.ts ? new Date(l.ts).toTimeString().slice(0, 8) : "--:--:--";
    const color = l.level === "error" ? p.red : l.level === "warn" ? p.yellow : l.level === "debug" ? p.dark : undefined;
    const sub = l.subsystem ? `[${l.subsystem}] ` : "";
    return [
      { t: t, p: p.dark },
      { t: (" " + truncate(sub, 14)).padEnd(10), p: p.gray },
      { t: " " }, { t: truncate(l.msg, Math.max(10, innerW - 18)), p: color },
    ];
  });
}

function footerLine(snap, p, w) {
  const left = "j/k select · tab pane · enter peek · l logfilter · a errfilter · r refresh · ? help · q quit";
  const right = snap.connection === "connected"
    ? [{ t: "●", p: p.green }, { t: ` connected ${snap.port ?? ""}`, p: p.gray }]
    : snap.connection === "reconnecting"
      ? [{ t: "◌", p: p.yellow }, { t: ` reconnecting in ${snap.reconnectInMs != null ? Math.ceil(snap.reconnectInMs / 1000) + "s…" : "…"}`, p: p.gray }]
      : [{ t: "◌", p: p.dark }, { t: ` ${snap.connection}`, p: p.gray }];
  const rightStr = fitSegs(right, Math.max(10, Math.floor(w / 2)));
  const leftW = Math.max(0, w - stripAnsi(rightStr).length - 2);
  return padTo(fitSegs([{ t: " " + left, p: p.dim }], leftW), leftW) + rightStr;
}

function computeLayout(w, h) {
  const bodyH = Math.max(0, h - 3);
  const logsH = h >= 32 ? Math.max(3, Math.round(bodyH * 0.4)) : 0;
  const paneH = Math.max(0, bodyH - logsH);
  const leftW = Math.min(w - 24, Math.round(w * 0.52));
  const actH = Math.max(3, Math.round(paneH * 0.55));
  return { logsH, paneH, leftW, rightW: w - leftW, actH, autoH: Math.max(3, paneH - actH) };
}

export function nextCronInfo(jobs, now) {
  let best = null;
  for (const job of jobs ?? []) {
    if (job?.enabled === false) continue;
    const at = job?.state?.nextRunAtMs;
    if (!Number.isFinite(Number(at))) continue;
    if (!best || Number(at) < best.at) best = { at: Number(at), job };
  }
  if (!best) return null;
  return { job: best.job, at: best.at, nextIn: formatIn(best.at - now) };
}

// Full-frame render. view = { snap, ui: {focus, sel, overlay, logFilter, activityErrorsOnly},
//                               width, height, p } -> string ready to write to stdout.
export function renderScreen(view) {
  const { snap, ui, width: w, height: h, p } = view;
  if (w < 80 || h < 24) {
    return padTo(`clawdash needs a terminal of at least 80x24 (current ${w}x${h})`, Math.max(8, w));
  }
  snap.now = Date.now();
  snap.runningCount = snap.sessions.filter((r) => isRunning(r)).length;
  snap.tokMax = Math.max(1, ...snap.tokMap.values(), 0);
  snap.nextCron = nextCronInfo(snap.cronJobs, snap.now);
  const L = computeLayout(w, h);

  const tree = threadTree(snap.sessions, snap.now);
  const tSel = Math.min(ui.sel.threads, Math.max(0, tree.length - 1));
  const cols = threadColumns(L.leftW - 4);
  const avail = Math.max(1, L.paneH - 2);
  const start = Math.max(0, Math.min(tSel - Math.floor(avail / 2), Math.max(0, tree.length - avail)));
  const tLines = tree.slice(start, start + avail)
    .map((entry, i) => threadRowSegs(entry, ui.focus === "threads" && start + i === tSel, snap, p, cols));
  const threads = boxLines({
    title: `THREADS ${tree.length}${snap.sessionTotals.totalCount != null && snap.sessionTotals.totalCount !== tree.length ? `/${snap.sessionTotals.totalCount}` : ""}`,
    lines: tLines, width: L.leftW, height: L.paneH, focus: ui.focus === "threads", p,
    footer: tree.length ? `${Math.min(tSel + 1, tree.length)}/${tree.length}` : "empty",
  });

  const aLines = activityRows(snap, ui, p, L.rightW - 4, Math.max(1, L.actH - 2));
  const activity = boxLines({
    title: `ACTIVITY${ui.activityErrorsOnly ? " [errors]" : ""}`,
    lines: aLines, width: L.rightW, height: L.actH, p,
  });

  const jobs = orderCronJobs(snap.cronJobs);
  const jSel = Math.min(ui.sel.automations, Math.max(0, jobs.length - 1));
  const jAvail = Math.max(1, L.autoH - 2);
  const jStart = Math.max(0, Math.min(jSel - Math.floor(jAvail / 2), Math.max(0, jobs.length - jAvail)));
  const jLines = jobs.slice(jStart, jStart + jAvail)
    .map((job, i) => automationRow(snap, p, L.rightW - 4, job, ui.focus === "automations" && jStart + i === jSel));
  const autos = boxLines({
    title: `AUTOMATIONS ${jobs.length}`, lines: jLines, width: L.rightW, height: L.autoH,
    focus: ui.focus === "automations", p,
    footer: jobs.length ? `${Math.min(jSel + 1, jobs.length)}/${jobs.length}` : "none",
  });

  const pane = [];
  for (let i = 0; i < L.paneH; i++) {
    const rightSide = i < L.actH ? (activity[i] ?? "") : (autos[i - L.actH] ?? "");
    pane.push(padTo(padTo(threads[i] ?? "", L.leftW) + rightSide, w));
  }
  const lines = [...headerLines(snap, p, w), ...pane];
  if (L.logsH > 0) {
    const logContentW = w - 4;
    const lines0 = logRows(snap, ui, p, logContentW, Math.max(1, L.logsH - 2));
    lines.push(...boxLines({
      title: `LOGS [${ui.logFilter}]`, lines: lines0, width: w, height: L.logsH, p,
      footer: `tail ${snap.logs.length}`,
    }));
  }
  lines.push(footerLine(snap, p, w));

  const framed = lines.slice(0, h);
  while (framed.length < h) framed.push("");
  return applyOverlay(framed, view, w, h).join("\n");
}

export const HELP_LINES = [
  "clawdash keys",
  "",
  " j/k or ↑/↓     move selection in focused pane",
  " tab            focus: threads ⇄ automations",
  " g / G          jump to top / end of pane",
  " enter          peek session chats / cron runs (enter or esc closes)",
  " l              cycle log filter: all → error → warn → info",
  " a              activity filter: all ↔ errors only",
  " r              force refresh now",
  " ?              this help",
  " q or Ctrl+C    quit",
];

function applyOverlay(baseLines, view, w, h) {
  const ov = view.ui.overlay;
  if (!ov) return baseLines;
  let body;
  if (ov.kind === "help") body = HELP_LINES.map((l) => [{ t: " " + l }]);
  else if (ov.kind === "session") body = sessionPeekLines(view);
  else if (ov.kind === "cron") body = cronPeekLines(view);
  else return baseLines;
  const widest = Math.max(...body.map((segs) => stripAnsi(fitSegs(segs, 500)).length), 30);
  const boxW = Math.min(w - 8, widest + 6);
  const boxH = Math.min(h - 4, body.length + 2);
  const box = boxLines({ title: ov.kind === "help" ? "HELP" : `PEEK — ${ov.title ?? ""}`, lines: body, width: boxW, height: boxH, p: view.p });
  const top = Math.max(1, Math.floor((h - boxH) / 2));
  const left = Math.max(0, Math.floor((w - boxW) / 2));
  return baseLines.map((line, i) => {
    const plain = padTo(stripAnsi(line), w);
    if (i < top || i >= top + boxH) return view.p.dark(plain);
    const row = box[i - top] ?? "";
    const rowLen = stripAnsi(row).length;
    return view.p.dark(plain.slice(0, left)) + row + view.p.dark(plain.slice(Math.min(plain.length, left + rowLen)));
  });
}

function sessionPeekLines(view) {
  const { peek, p } = view;
  const msgs = peek?.data?.messages ?? [];
  const rows = msgs.slice(-15).map((m) => {
    const role = String(m?.role ?? "?");
    const content = m?.content?.text ?? (typeof m?.content === "string" ? m.content : m?.text ?? m?.preview ?? "");
    const first = String(content).split("\n").find((l) => l.trim()) ?? "(empty)";
    return [
      { t: " " },
      { t: truncate(role, 9).padEnd(9), p: role === "user" ? p.cyan : role === "assistant" ? p.green : p.gray },
      { t: " " },
      { t: truncate(first, 160), p: role === "user" ? undefined : p.gray },
    ];
  });
  return [
    [{ t: msgs.length ? ` showing last ${Math.min(15, msgs.length)} messages` : " no messages recorded", p: p.gray }],
    ...(peek.error ? [[{ t: " error: " + peek.error, p: p.red }]] : []),
    ...rows,
  ];
}

function cronPeekLines(view) {
  const { peek, snap, p } = view;
  const job = snap.cronJobs.find((j) => j?.id === peek?.jobId);
  const runs = (snap.runs ?? []).filter((r) => r?.jobId === peek?.jobId).slice(0, 12);
  const usages = runs.map((r) => Number(r?.usage?.total_tokens ?? 0));
  const spark = usages.some((u) => u > 0)
    ? `   ${p.gray("tokens")} ` + p.cyan(sparkline(usages.reverse())) : "";
  const rows = runs.map((r) => [
    { t: " " },
    { t: new Date(Number(r.ts)).toTimeString().slice(0, 8), p: p.dark }, { t: " " },
    { t: r.status === "ok" ? "✔" : r.status === "error" ? "✗" : "⊘", p: r.status === "ok" ? p.green : r.status === "error" ? p.red : p.yellow },
    { t: " " },
    { t: (r.durationMs != null ? formatDuration(Number(r.durationMs)) : "—").padEnd(7), p: p.gray },
    { t: " " },
    { t: truncate(r.error || r.summary || "", 110), p: r.error ? p.red : undefined },
  ]);
  return [
    [{ t: job ? `${cronScheduleLabel(job)}  ·  ${job.enabled === false ? p.gray("disabled") : p.gray("enabled")}` : "", p: p.gray }, { t: spark }],
    [{ t: runs.length ? ` last ${runs.length} runs` : " no runs recorded", p: p.gray }],
    ...(peek.error ? [[{ t: " error: " + peek.error, p: p.red }]] : []),
    ...rows,
  ];
}
