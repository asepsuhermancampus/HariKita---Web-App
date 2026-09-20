import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  getSessionSecret,
  signSession,
  verifySession,
  type SessionData,
} from "../src/lib/session-token";

const ORIGINAL_SECRET = process.env.HARIKITA_SESSION_SECRET;

beforeEach(() => {
  process.env.HARIKITA_SESSION_SECRET = "test-secret-please-change-0123456789";
});

afterEach(() => {
  if (ORIGINAL_SECRET === undefined) {
    delete process.env.HARIKITA_SESSION_SECRET;
  } else {
    process.env.HARIKITA_SESSION_SECRET = ORIGINAL_SECRET;
  }
});

const sample = (overrides: Partial<SessionData> = {}): SessionData => ({
  userId: "usr_1",
  role: "CLIENT",
  name: "Bima & Citra",
  phone: "081987654321",
  ...overrides,
});

test("getSessionSecret returns the configured secret", () => {
  assert.equal(getSessionSecret(), "test-secret-please-change-0123456789");
});

test("getSessionSecret throws when secret is missing", () => {
  delete process.env.HARIKITA_SESSION_SECRET;
  assert.throws(() => getSessionSecret(), /HARIKITA_SESSION_SECRET/);
});

test("getSessionSecret throws when secret is blank", () => {
  process.env.HARIKITA_SESSION_SECRET = "   ";
  assert.throws(() => getSessionSecret(), /HARIKITA_SESSION_SECRET/);
});

test("signSession returns v1 token with exactly two dots", async () => {
  const token = await signSession(sample());
  const parts = token.split(".");
  assert.equal(parts.length, 3);
  assert.equal(parts[0], "v1");
  assert.ok(token.length > 0);
});

test("signSession is deterministic for the same data + secret", async () => {
  const a = await signSession(sample());
  const b = await signSession(sample());
  assert.equal(a, b);
  const parts = a.split(".");
  assert.equal(parts.length, 3);
  assert.equal(parts[0], "v1");
  assert.equal(parts[2].length, 43);
  assert.match(parts[2], /^[A-Za-z0-9_-]{43}$/);
});

test("verifySession accepts a freshly signed token", async () => {
  const data = sample({ role: "VENDOR", name: "Menganti Cinematic" });
  const token = await signSession(data);
  assert.deepEqual(await verifySession(token), data);
});

test("verifySession rejects tampered signature", async () => {
  const token = await signSession(sample());
  const [version, payload, sig] = token.split(".");
  const flipped = (sig[0] === "A" ? "B" : "A") + sig.slice(1);
  assert.equal(await verifySession(`${version}.${payload}.${flipped}`), null);
});

test("verifySession rejects tampered payload (role escalation)", async () => {
  const token = await signSession(sample({ role: "CLIENT" }));
  const [version, , sig] = token.split(".");
  const forgedPayload = Buffer.from(JSON.stringify(sample({ role: "ADMIN" })))
    .toString("base64url");
  assert.equal(await verifySession(`${version}.${forgedPayload}.${sig}`), null);
});

test("verifySession rejects legacy base64 JSON token (no v1 prefix)", async () => {
  const legacy = Buffer.from(JSON.stringify(sample({ role: "ADMIN" }))).toString("base64");
  assert.equal(await verifySession(legacy), null);
});

test("verifySession rejects malformed tokens", async () => {
  assert.equal(await verifySession(""), null);
  assert.equal(await verifySession("abc"), null);
  assert.equal(await verifySession("a.b.c"), null);
  assert.equal(await verifySession("a."), null);
  assert.equal(await verifySession(".b"), null);
  assert.equal(await verifySession("v1.only"), null);
  assert.equal(await verifySession("v1.a.b.c"), null);
});

test("verifySession rejects token signed with different secret", async () => {
  const token = await signSession(sample());
  process.env.HARIKITA_SESSION_SECRET = "a-completely-different-secret";
  assert.equal(await verifySession(token), null);
});

test("verifySession rejects payload missing required fields", async () => {
  // Sign a payload whose JSON lacks `phone`, using the real secret, then verify.
  const { getSessionSecret } = await import("../src/lib/session-token");
  const secret = getSessionSecret();
  const badPayload = Buffer.from(JSON.stringify({ userId: "u", role: "ADMIN", name: "x" }))
    .toString("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(badPayload));
  const sig = Buffer.from(new Uint8Array(sigBuf)).toString("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  assert.equal(await verifySession(`v1.${badPayload}.${sig}`), null);
});

test("verifySession rejects signed payload with a role outside the allowlist", async () => {
  // Payload is signed with the REAL secret, so signature verification passes —
  // only the role allowlist check can reject it (fail-closed).
  const { getSessionSecret } = await import("../src/lib/session-token");
  const secret = getSessionSecret();
  const badPayload = Buffer.from(
    JSON.stringify({ userId: "u", role: "SUPERGOD", name: "x", phone: "0800" })
  ).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(badPayload));
  const sig = Buffer.from(new Uint8Array(sigBuf)).toString("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  assert.equal(await verifySession(`v1.${badPayload}.${sig}`), null);
});
