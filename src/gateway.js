// GatewayClient — protocol v4 WebSocket client for an OpenClaw gateway.
// Node built-ins only: global WebSocket (node >= 22.19), node:crypto, node:fs.
//
// Handshake (matches the live-tested POC exactly):
//   1. ws open -> gateway pushes {type:"event", event:"connect.challenge", payload:{nonce,ts}}
//   2. we reply with a "connect" req carrying token auth + Ed25519 device signature
//      over the exact string: v3|<deviceId>|cli|cli|operator|<scopes>|<ts>|<token>|<nonce>|<platform>|<deviceFamily>
//   3. res payload is hello-ok {protocol, server, snapshot, policy}
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { EventEmitter } from "node:events";

export const VERSION = "4.0.0";
export const DEFAULT_PORT = 18789;
export const DEFAULT_SCOPES = ["operator.read"]; // read-only; must match the signature string exactly
export const DEVICE_KEY_PATH = path.join(os.homedir(), ".openclaw", "clawdash", "device.json");

const CALL_TIMEOUT_MS = 10_000;
const BACKOFF_START_MS = 1_000;
const BACKOFF_MAX_MS = 30_000;

// Pure: the exact string the gateway verifies with the device's Ed25519 public key.
// platform/deviceFamily are lowercased, scopes joined by "," — field order is load-bearing.
export function buildDeviceAuthPayloadV3({
  deviceId, clientId = "cli", clientMode = "cli", role = "operator",
  scopes, signedAt, token, nonce, platform, deviceFamily = "desktop",
}) {
  return `v3|${deviceId}|${clientId}|${clientMode}|${role}|${scopes.join(",")}|${signedAt}|${token}|${nonce}|${platform.toLowerCase()}|${deviceFamily.toLowerCase()}`;
}

export function signDeviceAuth(privKey, payload) {
  return crypto.sign(null, Buffer.from(payload), privKey).toString("base64url");
}

// Load or create the persistent Ed25519 device keypair (auto-pairs on loopback).
export function loadDeviceKey(file = DEVICE_KEY_PATH) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  let keys;
  try {
    keys = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
    keys = {
      pub: publicKey.export({ type: "spki", format: "der" }).toString("base64"),
      priv: privateKey.export({ type: "pkcs8", format: "der" }).toString("base64"),
    };
    fs.writeFileSync(file, JSON.stringify(keys), { mode: 0o600 });
    fs.chmodSync(file, 0o600);
  }
  const pubKey = crypto.createPublicKey({ key: Buffer.from(keys.pub, "base64"), format: "der", type: "spki" });
  const privKey = crypto.createPrivateKey({ key: Buffer.from(keys.priv, "base64"), format: "der", type: "pkcs8" });
  const rawPub = Buffer.from(pubKey.export({ format: "jwk" }).x, "base64url");
  const deviceId = crypto.createHash("sha256").update(rawPub).digest("hex");
  return { deviceId, rawPubBase64url: rawPub.toString("base64url"), pubKey, privKey, file };
}

export class GatewayClient extends EventEmitter {
  constructor({ url, token, timeoutMs = CALL_TIMEOUT_MS, deviceKeyFile = DEVICE_KEY_PATH } = {}) {
    super();
    this.url = url;
    this.token = token;
    this.timeoutMs = timeoutMs;
    this.device = loadDeviceKey(deviceKeyFile);
    this.ws = null;
    this.hello = null;
    this.tickIntervalMs = 15_000;
    this.lastFrameAt = 0;
    this.connection = "connecting"; // connecting | connected | reconnecting | closed
    this.reconnectInMs = null;
    this.pending = new Map();
    this.seq = 0;
    this.backoffMs = BACKOFF_START_MS;
    this.watchdogTimer = null;
    this.reconnectTimer = null;
    this.closed = false;
    this._connectPromise = null;
  }

  // Resolve on first hello-ok; afterwards the client keeps the socket alive on its own.
  connect() {
    if (this._connectPromise) return this._connectPromise;
    this.closed = false;
    this._connectPromise = new Promise((resolve, reject) => {
      this._resolveConnect = resolve;
      this._rejectConnect = reject;
    });
    this._openSocket();
    return this._connectPromise;
  }

  _openSocket() {
    this.connection = "connecting";
    if (process.env.CLAWDASH_DEBUG) console.error(`[gw] opening ${this.url}`);
    let ws;
    try {
      ws = new WebSocket(this.url);
    } catch (err) {
      this._scheduleReconnect(err);
      return;
    }
    this.ws = ws;
    if (process.env.CLAWDASH_DEBUG) {
      ws.addEventListener("open", () => console.error(`[gw] OPEN readyState=${ws.readyState}`));
      console.error(`[gw] socket created readyState=${ws.readyState}`);
    }
    ws.addEventListener("message", (ev) => this._onFrame(ev.data));
    ws.addEventListener("close", (ev) => this._onClose(ev));
    ws.addEventListener("error", () => { /* close always follows */ });
    this._startWatchdog();
  }

  _send(obj) {
    if (process.env.CLAWDASH_DEBUG && obj.method) console.error(`[gw] -> ${obj.method}#${obj.id}`);
    if (this.ws && this.ws.readyState === 1) this.ws.send(JSON.stringify(obj));
  }

  _onFrame(data) {
    this.lastFrameAt = Date.now();
    let frame;
    try {
      frame = JSON.parse(typeof data === "string" ? data : String(data));
    } catch {
      return;
    }
    if (process.env.CLAWDASH_DEBUG) console.error(`[gw] <- ${String(frame.type)}${frame.event ? `:${frame.event}` : ""}${frame.id ? `#${frame.id}` : ""}`);
    if (frame.type === "res") return this._onRes(frame);
    if (frame.type === "event") return this._onServerEvent(frame);
  }

  _onRes(frame) {
    const entry = this.pending.get(frame.id);
    if (!entry) return;
    this.pending.delete(frame.id);
    clearTimeout(entry.timer);
    if (frame.ok) entry.resolve(frame.payload);
    else entry.reject(Object.assign(new Error(frame.error?.message ?? "request failed"), { code: frame.error?.code }));
  }

  _onServerEvent(frame) {
    const { event, payload = {} } = frame;
    if (event === "connect.challenge") return this._sendConnect(payload);
    if (event === "hello-ok" && payload?.server) this._applyHello(payload); // defensive: some builds push it as an event
    if (event === "tick") return; // liveness only; lastFrameAt already updated
    this.emit("event", event, payload);
  }

  _applyHello(payload) {
    this.hello = payload;
    this.tickIntervalMs = payload.policy?.tickIntervalMs ?? this.tickIntervalMs;
    const first = this.connection !== "connected";
    this.connection = "connected";
    this.reconnectInMs = null;
    this.backoffMs = BACKOFF_START_MS;
    this.lastFrameAt = Date.now();
    if (!first || !this._resolveConnect) this.emit("hello", payload); // re-hello after a reconnect
  }

  _sendConnect(challenge) {
    const signedAt = challenge?.ts;
    const nonce = challenge?.nonce;
    const payloadStr = buildDeviceAuthPayloadV3({
      deviceId: this.device.deviceId,
      scopes: DEFAULT_SCOPES,
      signedAt,
      token: this.token,
      nonce,
      platform: process.platform,
      deviceFamily: "desktop",
    });
    const signature = signDeviceAuth(this.device.privKey, payloadStr);
    const id = `connect-${++this.seq}`;
    this._setPending(id, (payload) => {
      // the connect res payload IS hello-ok: {type:"hello-ok", protocol, server, snapshot, policy}
      if (payload?.server || payload?.type === "hello-ok") this._applyHello(payload);
      this._resolveConnect?.(this.hello);
      this._resolveConnect = this._rejectConnect = null;
    }, (err) => {
      this._rejectConnect?.(err);
      this._resolveConnect = this._rejectConnect = null;
    });
    this._send({
      type: "req", id, method: "connect",
      params: {
        minProtocol: 4,
        maxProtocol: 4,
        client: { id: "cli", version: VERSION, platform: process.platform, mode: "cli", deviceFamily: "desktop" },
        role: "operator",
        scopes: DEFAULT_SCOPES,
        auth: { token: this.token },
        device: {
          id: this.device.deviceId,
          publicKey: this.device.rawPubBase64url,
          signature,
          signedAt, // challenge ts exactly
          nonce, // challenge nonce exactly
        },
        locale: "en-US",
        userAgent: `clawdash/${VERSION}`,
      },
    });
  }

  _setPending(id, onResolve, onReject) {
    const timer = setTimeout(() => {
      if (!this.pending.has(id)) return;
      this.pending.delete(id);
      onReject(new Error("request timed out"));
    }, this.timeoutMs);
    this.pending.set(id, {
      timer,
      resolve: (v) => onResolve(v),
      reject: (e) => onReject(e),
    });
  }

  call(method, params = {}, { timeoutMs = this.timeoutMs } = {}) {
    if (!this.ws || this.ws.readyState !== 1) {
      return Promise.reject(new Error("not connected"));
    }
    const id = `r${++this.seq}`;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (!this.pending.has(id)) return;
        this.pending.delete(id);
        reject(new Error(`${method} timed out`));
      }, timeoutMs);
      this.pending.set(id, {
        timer,
        resolve: (v) => { clearTimeout(timer); resolve(v); },
        reject: (e) => { clearTimeout(timer); reject(e); },
      });
      this._send({ type: "req", id, method, params });
    });
  }

  _startWatchdog() {
    clearInterval(this.watchdogTimer);
    this.watchdogTimer = setInterval(() => {
      if (this.closed) return clearInterval(this.watchdogTimer);
      const silentMs = Date.now() - this.lastFrameAt;
      if (silentMs > 2 * this.tickIntervalMs) {
        this._teardownSocket();
        this._scheduleReconnect(new Error(`gateway silent for ${Math.round(silentMs / 1000)}s`));
      }
    }, 5_000);
    this.watchdogTimer.unref?.();
  }

  _onClose(ev) {
    this.ws = null;
    if (this.closed) return;
    const err = new Error(`connection closed (${ev?.code ?? "?"})`);
    this._scheduleReconnect(err);
  }

  _failPending(err) {
    for (const [id, p] of this.pending) {
      clearTimeout(p.timer);
      p.reject(err);
      this.pending.delete(id);
    }
  }

  _teardownSocket() {
    clearInterval(this.watchdogTimer);
    this._failPending(new Error("connection lost"));
    if (this.ws) {
      try {
        this.ws.close();
      } catch { /* already closing */ }
      this.ws = null;
    }
  }

  _scheduleReconnect(err) {
    const wasConnected = this.connection === "connected" || this.hello;
    if (!wasConnected) this._rejectConnect?.(err);
    this._resolveConnect = this._rejectConnect = null;
    this._connectPromise = null;
    this.hello = null;
    this.connection = "reconnecting";
    this.reconnectInMs = this.backoffMs;
    this.emit("down", err);
    this.emit("reconnecting", this.backoffMs);
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectInMs = null;
      this.backoffMs = Math.min(this.backoffMs * 2, BACKOFF_MAX_MS);
      this._openSocket();
    }, this.backoffMs);
    this.reconnectTimer.unref?.();
  }

  close() {
    this.closed = true;
    clearTimeout(this.reconnectTimer);
    clearInterval(this.watchdogTimer);
    this._failPending(new Error("client closed"));
    this.connection = "closed";
    if (this.ws) {
      try {
        this.ws.close(1000, "bye");
      } catch { /* already closed */ }
      this.ws = null;
    }
  }
}
