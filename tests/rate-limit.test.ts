import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  checkRateLimit,
  clientIpFromHeaders,
  resetRateLimits,
} from "../src/lib/rate-limit";

beforeEach(() => {
  resetRateLimits();
});

test("rate limit allows requests under the limit", () => {
  for (let i = 0; i < 5; i++) {
    const r = checkRateLimit({ key: "k1", limit: 5, windowMs: 60_000 });
    assert.equal(r.allowed, true);
  }
});

test("rate limit blocks the request that exceeds the limit", () => {
  for (let i = 0; i < 5; i++) {
    checkRateLimit({ key: "k2", limit: 5, windowMs: 60_000 });
  }
  const blocked = checkRateLimit({ key: "k2", limit: 5, windowMs: 60_000 });
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
});

test("rate limit keys are independent", () => {
  for (let i = 0; i < 5; i++) checkRateLimit({ key: "a", limit: 5, windowMs: 60_000 });
  const other = checkRateLimit({ key: "b", limit: 5, windowMs: 60_000 });
  assert.equal(other.allowed, true);
});

test("rate limit window resets after expiry", () => {
  const r1 = checkRateLimit({ key: "k3", limit: 1, windowMs: -1 }); // window already expired next call
  assert.equal(r1.allowed, true);
  // With a negative window, the bucket is immediately considered expired.
  const r2 = checkRateLimit({ key: "k3", limit: 1, windowMs: -1 });
  assert.equal(r2.allowed, true);
});

test("clientIpFromHeaders reads x-forwarded-for first entry", () => {
  const h = new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" });
  assert.equal(clientIpFromHeaders(h), "203.0.113.5");
});

test("clientIpFromHeaders falls back to x-real-ip then unknown", () => {
  assert.equal(clientIpFromHeaders(new Headers({ "x-real-ip": "198.51.100.9" })), "198.51.100.9");
  assert.equal(clientIpFromHeaders(new Headers()), "unknown");
});
