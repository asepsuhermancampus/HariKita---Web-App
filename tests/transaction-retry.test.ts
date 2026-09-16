import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isContentionError,
  TransactionRetryExhaustedError,
} from "../src/lib/transaction-retry";

test("isContentionError recognizes Prisma P2034", () => {
  assert.equal(isContentionError({ code: "P2034" }), true);
});

test("isContentionError recognizes SQLITE_BUSY in message", () => {
  assert.equal(isContentionError({ message: "Error: SQLITE_BUSY: database is busy" }), true);
});

test("isContentionError recognizes 'database is locked'", () => {
  assert.equal(isContentionError({ message: "database is locked" }), true);
});

test("isContentionError treats P2002 (unique violation) as NON-contention", () => {
  assert.equal(isContentionError({ code: "P2002" }), false);
});

test("isContentionError treats unknown/plain errors as NON-contention", () => {
  assert.equal(isContentionError(new Error("boom")), false);
  assert.equal(isContentionError(null), false);
  assert.equal(isContentionError(undefined), false);
  assert.equal(isContentionError("string error"), false);
  assert.equal(isContentionError(42), false);
});

test("TransactionRetryExhaustedError exposes attempts and cause", () => {
  const cause = { code: "P2034" };
  const err = new TransactionRetryExhaustedError(6, cause);
  assert.ok(err instanceof Error);
  assert.equal(err.name, "TransactionRetryExhaustedError");
  assert.equal(err.attempts, 6);
  assert.equal(err.cause, cause);
  assert.ok(err.message.includes("6"));
});
