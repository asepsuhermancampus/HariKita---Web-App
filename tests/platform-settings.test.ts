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

import { updatePlatformSettings } from "../src/server/services/platform-settings-service";

test("updatePlatformSettings: persists + writes audit row", async () => {
  const actor = { userId: "u_super", name: "Super", subRole: "SUPER_ADMIN" as const };
  const saved = await updatePlatformSettings(
    {
      dpPct: 30,
      settlementPct: 70,
      platformFeePct: 10,
      defaultBaCommissionPct: 5,
      components: [
        { id: "", label: "Operasional", pct: 6, sortOrder: 0 },
        { id: "", label: "Marketing", pct: 4, sortOrder: 1 },
      ],
      actor,
    },
    ctx.prisma
  );
  assert.equal(saved.platformFeePct, 10);
  assert.equal(saved.components.length, 2);

  const reread = await getPlatformSettings(ctx.prisma);
  assert.equal(reread.components.length, 2);

  const audit = await ctx.prisma.adminAuditLog.findFirst({
    where: { action: "PLATFORM_SETTINGS_UPDATED" },
  });
  assert.ok(audit, "audit row written");

  // Bersihkan agar test lain yang mengharapkan DEFAULT tetap valid.
  await ctx.prisma.platformFeeComponent.deleteMany();
  await ctx.prisma.platformSetting.deleteMany();
  await ctx.prisma.adminAuditLog.deleteMany({ where: { action: "PLATFORM_SETTINGS_UPDATED" } });
});

import { splitTranches } from "../src/server/services/ledger-service";

test("splitTranches: default 30/70", () => {
  assert.deepEqual(splitTranches(100000), { dpAmount: 30000, settlementAmount: 70000 });
});

test("splitTranches: custom dpPct=40 -> 40/60", () => {
  assert.deepEqual(splitTranches(100000, 40), { dpAmount: 40000, settlementAmount: 60000 });
});
