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

import {
  getPlatformSettings,
  validatePlatformSettings,
  DEFAULT_PLATFORM_SETTINGS,
} from "../src/server/services/platform-settings-service";

test("getPlatformSettings: returns DEFAULT when no row exists", async () => {
  const s = await getPlatformSettings(ctx.prisma);
  assert.equal(s.dpPct, 30);
  assert.equal(s.settlementPct, 70);
  assert.equal(s.platformFeePct, 10);
  assert.equal(s.defaultBaCommissionPct, 5);
  assert.deepEqual(s.components, []);
});

test("validatePlatformSettings: dp+settlement must equal 100", () => {
  assert.throws(
    () => validatePlatformSettings({ ...DEFAULT_PLATFORM_SETTINGS, dpPct: 40, settlementPct: 50 }),
    /INVALID_PLATFORM_SETTINGS/
  );
});

test("validatePlatformSettings: component total must equal platformFeePct", () => {
  assert.throws(
    () =>
      validatePlatformSettings({
        ...DEFAULT_PLATFORM_SETTINGS,
        components: [{ id: "c1", label: "Ops", pct: 3, sortOrder: 0 }], // total 3 != 10
      }),
    /INVALID_PLATFORM_SETTINGS/
  );
});

test("validatePlatformSettings: pct out of range rejected", () => {
  assert.throws(
    () => validatePlatformSettings({ ...DEFAULT_PLATFORM_SETTINGS, platformFeePct: 120 }),
    /INVALID_PLATFORM_SETTINGS/
  );
});

test("validatePlatformSettings: valid input passes", () => {
  assert.doesNotThrow(() =>
    validatePlatformSettings({
      ...DEFAULT_PLATFORM_SETTINGS,
      components: [
        { id: "a", label: "Operasional", pct: 6, sortOrder: 0 },
        { id: "b", label: "Marketing", pct: 2, sortOrder: 1 },
        { id: "c", label: "Cadangan", pct: 2, sortOrder: 2 },
      ],
    })
  );
});
