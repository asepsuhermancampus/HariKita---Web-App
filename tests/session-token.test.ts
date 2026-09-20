import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  getSessionSecret,
  signSession,
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

test("signSession returns token with exactly one dot", async () => {
  const token = await signSession(sample());
  assert.equal(token.split(".").length, 2);
  assert.ok(token.length > 0);
});

test("signSession is deterministic for the same data + secret", async () => {
  const a = await signSession(sample());
  const b = await signSession(sample());
  assert.equal(a, b);
});
