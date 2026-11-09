import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { buildDeviceAuthPayloadV3, signDeviceAuth, loadDeviceKey, DEFAULT_SCOPES } from "../src/gateway.js";

test("buildDeviceAuthPayloadV3 emits the exact challenge-verified string", () => {
  const payload = buildDeviceAuthPayloadV3({
    deviceId: "abc123",
    scopes: ["operator.read"],
    signedAt: 1_762_000_000_000,
    token: "sekrit",
    nonce: "n0nce",
    platform: "darwin",
    deviceFamily: "desktop",
  });
  assert.equal(payload, "v3|abc123|cli|cli|operator|operator.read|1762000000000|sekrit|n0nce|darwin|desktop");
});

test("scopes are joined by commas in the signature payload", () => {
  const payload = buildDeviceAuthPayloadV3({
    deviceId: "d", scopes: ["operator.read", "operator.write"], signedAt: 1, token: "t",
    nonce: "n", platform: "Linux", deviceFamily: "Desktop",
  });
  assert.equal(payload, "v3|d|cli|cli|operator|operator.read,operator.write|1|t|n|linux|desktop");
});

test("client defaults are read-only (operator.read only)", () => {
  assert.deepEqual(DEFAULT_SCOPES, ["operator.read"]);
});

test("device signature verifies against the payload string", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "clawdash-test-"));
  const file = path.join(dir, "device.json");
  const { deviceId, rawPubBase64url, pubKey, privKey } = loadDeviceKey(file);
  const payload = buildDeviceAuthPayloadV3({
    deviceId, scopes: DEFAULT_SCOPES, signedAt: 42, token: "tok", nonce: "nn",
    platform: "darwin", deviceFamily: "desktop",
  });
  const sig = signDeviceAuth(privKey, payload);
  const ok = crypto.verify(null, Buffer.from(payload), pubKey, Buffer.from(sig, "base64url"));
  assert.ok(ok, "Ed25519 signature must verify");
  assert.equal(deviceId.length, 64);
  assert.ok(/^[0-9a-f]+$/.test(deviceId));
  // raw publicKey bytes round-trip via base64url
  assert.equal(rawPubBase64url.length, 43); // 32 bytes base64url unpadded
});

test("device key file is created once and reused (stable deviceId)", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "clawdash-test-"));
  const file = path.join(dir, "device.json");
  const first = loadDeviceKey(file);
  const second = loadDeviceKey(file);
  assert.equal(first.deviceId, second.deviceId);
  assert.equal(fs.statSync(file).mode & 0o777, 0o600);
});
