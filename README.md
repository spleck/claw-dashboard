# clawdash

A minimal terminal dashboard for a running [OpenClaw](https://openclaw.ai) gateway — sessions, automations, live activity, and logs on one screen. Written to be small: **zero runtime dependencies** (Node built-ins only), read-only, honest output.

> Screenshot: placeholder — paste a captured frame here. On a 120×40 terminal you get a header strip, a threads list (left), an activity feed and automations panel (right), a log tail (bottom), and a keybinding footer.

## What it shows

- **Header** — gateway version, uptime, event-loop health (`p99` delay), presence count, channel status, live `sessions (running)`, token throughput (`tok/min`), today's estimated cost, and the next cron run countdown.
- **Threads** — every gateway session (main chats, subagent threads, cron sessions, channel sessions) with status, model, context pressure bar, tokens burned, a per-session activity trend, and age. Subagents are indented under their parent.
- **Activity** — a live feed of run starts/finishes, cron results, chat events, and heartbeats. Errors are red.
- **Automations** — every cron job with its schedule, next-run countdown (overdue runs flagged), last result, and error streaks.
- **Logs** — live tail of the gateway log with level filtering (`l`: all → error → warn → info).

## Install & run

Requires Node **>= 22.19** (uses the built-in `WebSocket`) and an OpenClaw gateway (2026.11+, protocol v4) running locally.

```sh
npm i -g claw-dashboard
clawdash            # full TUI
clawdash --once     # plaintext snapshot (great for scripts/smoke tests)
clawdash --help     # all flags (--port, --token, --no-color, ...)
```

The gateway URL is `ws://127.0.0.1:<port>`. `clawdash` reads `gateway.port` and `gateway.auth.token` from `~/.openclaw/openclaw.json` (or pass `--port` / `--token`). On first connect it creates a device keypair at `~/.openclaw/clawdash/device.json` (Ed25519) and pairs automatically — first pairing is auto-approved on loopback.

## Keys

| Key | Action |
| --- | --- |
| `j`/`k` or ↑/↓ | move selection in the focused pane |
| `tab` | switch focus: threads ⇄ automations |
| `g` / `G` | jump to top / end |
| `enter` | peek: chat history of the selected session / recent runs of the selected cron job |
| `l` | cycle log level filter |
| `a` | activity feed: all ↔ errors only |
| `r` | force refresh now |
| `?` | help |
| `q` or Ctrl+C | quit |

## Scope & safety

`clawdash` connects with the `operator.read` role and scope **only**. It never aborts sessions, runs crons, or writes anything. One WebSocket, polite polling (sessions 15s, crons 30s, logs 1.5s tail, usage 15min) plus gateway push events; reconnects with backoff if the connection drops.

## Troubleshooting disconnects

- **`no gateway token`** — set `gateway.auth.token` in `~/.openclaw/openclaw.json`, or pass `--token`.
- **`reconnecting in Ns…` never resolves** — is the gateway actually up? `openclaw status`. Wrong port? `clawdash --port 18789`.
- **`device signature invalid`** — your machine clock is far off, or the device key in `~/.openclaw/clawdash/device.json` was re-keyed server-side; delete that file and reconnect (it will re-pair).
- Dropped connection after sleep/resume — the client reconnects automatically (1s→30s backoff) and re-subscribes; give it a few seconds.

## Development

```sh
npm install
npm test        # node:test, zero deps beyond eslint
npm run lint
```

MIT licensed. CHANGELOG in [CHANGELOG.md](CHANGELOG.md).
