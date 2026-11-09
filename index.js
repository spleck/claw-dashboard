#!/usr/bin/env node
// clawdash — minimal terminal dashboard for a running OpenClaw gateway.
// Zero runtime dependencies; Node >= 22.19 (built-in WebSocket).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DEFAULT_PORT, VERSION } from "./src/gateway.js";
import { runOnce, start } from "./src/app.js";

const HELP = `clawdash ${VERSION} — minimal terminal dashboard for an OpenClaw gateway

Usage: clawdash [options]

Options:
  --port <n>      gateway port (default: gateway.port from ~/.openclaw/openclaw.json, else ${DEFAULT_PORT})
  --token <t>     gateway auth token (default: gateway.auth.token from ~/.openclaw/openclaw.json)
  --once          print a plaintext snapshot and exit (no TUI, used for smoke tests)
  --no-color      disable ANSI colors
  -h, --help      show this help
  -v, --version   print version

Read-only: uses operator.read scope only. Quit the dashboard with q or Ctrl+C.`;

function parseArgs(argv) {
  const opts = { once: false, noColor: false, help: false, version: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const eq = arg.indexOf("=");
    const [name, inline] = eq > 0 ? [arg.slice(0, eq), arg.slice(eq + 1)] : [arg, undefined];
    const takeValue = () => {
      if (inline !== undefined) return inline;
      if (i + 1 >= argv.length) throw new Error(`${name} needs a value`);
      return argv[++i];
    };
    switch (name) {
      case "--port": opts.port = Number(takeValue()); break;
      case "--token": opts.token = takeValue(); break;
      case "--once": opts.once = true; break;
      case "--no-color": opts.noColor = true; break;
      case "-h": case "--help": opts.help = true; break;
      case "-v": case "--version": opts.version = true; break;
      default: throw new Error(`unknown option: ${name} (see --help)`);
    }
  }
  return opts;
}

function loadGatewayConfig() {
  const file = path.join(os.homedir(), ".openclaw", "openclaw.json");
  let cfg = null;
  try {
    cfg = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return { file, port: null, token: null };
  }
  return {
    file,
    port: cfg?.gateway?.port ?? null,
    token: cfg?.gateway?.auth?.token ?? null,
  };
}

export function main(argv = process.argv.slice(2)) {
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (err) {
    console.error(`clawdash: ${err.message}`);
    process.exitCode = 1;
    return;
  }
  if (opts.help) return console.log(HELP);
  if (opts.version) return console.log(`clawdash ${VERSION}`);

  const cfg = loadGatewayConfig();
  const port = opts.port ?? cfg.port ?? DEFAULT_PORT;
  const token = opts.token ?? cfg.token;
  if (!token) {
    console.error(`clawdash: no gateway token. Put gateway.auth.token in ${cfg.file || "~/.openclaw/openclaw.json"} or pass --token.`);
    process.exitCode = 1;
    return;
  }
  const url = `ws://127.0.0.1:${port}`;
  const common = { url, token, port };
  if (opts.once) {
    runOnce(common).catch((err) => {
      console.error(`clawdash: ${err?.stack ?? err}`);
      process.exitCode = 1;
    });
    return;
  }
  if (opts.noColor) process.env.FORCE_COLOR = "0";
  start({ ...common, noColor: opts.noColor || process.env.NO_COLOR != null });
}

// SIGINT during startup (before raw mode) should not dump a stack.
process.on("unhandledRejection", (err) => {
  console.error(`clawdash: ${err?.stack ?? err}`);
  process.exitCode = 1;
});

main();
