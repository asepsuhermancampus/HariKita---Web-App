import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createTestDb, type TestDb } from "./helpers/test-db";

type AdminGuard = typeof import("../src/server/auth/admin-guard");
let ctx: TestDb;
let guard: AdminGuard;

before(async () => {
  ctx = await createTestDb();
  (globalThis as unknown as { prisma?: unknown }).prisma = ctx.prisma;
  guard = await import("../src/server/auth/admin-guard");
});

after(async () => {
  await ctx.cleanup();
});

test("capability: SUPER_ADMIN has MANAGE_PLATFORM_SETTINGS", () => {
  assert.equal(guard.hasCapability("SUPER_ADMIN", "MANAGE_PLATFORM_SETTINGS"), true);
});

test("capability: OPS and FINANCE do NOT have MANAGE_PLATFORM_SETTINGS", () => {
  assert.equal(guard.hasCapability("OPS", "MANAGE_PLATFORM_SETTINGS"), false);
  assert.equal(guard.hasCapability("FINANCE", "MANAGE_PLATFORM_SETTINGS"), false);
});
