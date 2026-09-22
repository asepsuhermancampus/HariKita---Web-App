import { test } from "node:test";
import assert from "node:assert/strict";

process.env.HARIKITA_SESSION_SECRET = "test-secret-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

test("sign then verify unlock token round-trips", async () => {
  const { signUnlockToken, verifyUnlockToken } = await import("../src/server/auth/admin-edit-unlock");
  const token = await signUnlockToken("admin-1");
  const res = await verifyUnlockToken(token);
  assert.equal(res?.adminId, "admin-1");
});

test("expired token fails", async () => {
  const { signUnlockToken, verifyUnlockToken, UNLOCK_TTL_MINUTES } = await import(
    "../src/server/auth/admin-edit-unlock"
  );
  const past = new Date(Date.now() - (UNLOCK_TTL_MINUTES + 1) * 60 * 1000);
  const token = await signUnlockToken("admin-1", past);
  assert.equal(await verifyUnlockToken(token), null);
});

test("garbage token returns null (never throws)", async () => {
  const { verifyUnlockToken } = await import("../src/server/auth/admin-edit-unlock");
  assert.equal(await verifyUnlockToken("not-a-token"), null);
  assert.equal(await verifyUnlockToken(undefined), null);
});
