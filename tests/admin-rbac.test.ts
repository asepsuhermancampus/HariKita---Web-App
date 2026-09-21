import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createTestDb, type TestDb } from "./helpers/test-db";

/**
 * Admin RBAC guard tests.
 *
 * Bagian pure (resolveAdminRole/hasCapability) tidak butuh DB. Bagian async
 * (loadAdminActor) membaca lewat singleton `@/lib/prisma`, sedangkan `.env`
 * proyek menunjuk PostgreSQL (Neon) yang TIDAK boleh tersentuh test.
 *
 * Karena itu `admin-guard` TIDAK di-import statis di sini. Sebagai gantinya:
 *   1. `createTestDb()` membuat salinan SQLite terisolasi + client-nya.
 *   2. Client itu disuntikkan ke slot `globalThis.prisma`, yaitu slot yang
 *      dibaca `src/lib/prisma.ts` (`globalForPrisma.prisma ?? createPrismaClient()`).
 *   3. `admin-guard` di-import dinamis SETELAH injeksi, sehingga singleton
 *      `prisma` di dalamnya adalah client test (bukan Neon).
 * Dengan begitu kode guard produksi tetap apa adanya (import `@/lib/prisma`)
 * dan test benar-benar berjalan pada DB SQLite yang sudah dimigrasi.
 */

type AdminGuard = typeof import("../src/server/auth/admin-guard");
type AdminAuditService = typeof import("../src/server/services/admin-audit-service");

let ctx: TestDb;
let guard: AdminGuard;
let audit: AdminAuditService;

before(async () => {
  ctx = await createTestDb();
  (globalThis as unknown as { prisma?: unknown }).prisma = ctx.prisma;
  guard = await import("../src/server/auth/admin-guard");
  audit = await import("../src/server/services/admin-audit-service");
});

after(async () => {
  await ctx.cleanup();
});

test("resolveAdminRole: ADMIN with null adminRole -> SUPER_ADMIN (grandfathered)", () => {
  assert.equal(guard.resolveAdminRole("ADMIN", null), "SUPER_ADMIN");
});

test("resolveAdminRole: ADMIN with known sub-role returns it", () => {
  assert.equal(guard.resolveAdminRole("ADMIN", "OPS"), "OPS");
  assert.equal(guard.resolveAdminRole("ADMIN", "FINANCE"), "FINANCE");
  assert.equal(guard.resolveAdminRole("ADMIN", "SUPER_ADMIN"), "SUPER_ADMIN");
});

test("resolveAdminRole: ADMIN with unknown sub-role -> SUPER_ADMIN (fail-safe)", () => {
  assert.equal(guard.resolveAdminRole("ADMIN", "WIZARD"), "SUPER_ADMIN");
});

test("resolveAdminRole: non-admin role -> null", () => {
  assert.equal(guard.resolveAdminRole("CLIENT", "OPS"), null);
  assert.equal(guard.resolveAdminRole("VENDOR", null), null);
  assert.equal(guard.resolveAdminRole("BA", null), null);
});

test("hasCapability: FINANCE can MANAGE_FINANCE only", () => {
  assert.equal(guard.hasCapability("FINANCE", "MANAGE_FINANCE"), true);
  assert.equal(guard.hasCapability("FINANCE", "VIEW_ADMIN"), true);
  assert.equal(guard.hasCapability("FINANCE", "VERIFY_VENDOR"), false);
  assert.equal(guard.hasCapability("FINANCE", "MANAGE_DISPUTE"), false);
  assert.equal(guard.hasCapability("FINANCE", "MANAGE_BA"), false);
});

test("hasCapability: OPS can verify + dispute, not finance/BA", () => {
  assert.equal(guard.hasCapability("OPS", "VERIFY_VENDOR"), true);
  assert.equal(guard.hasCapability("OPS", "MANAGE_DISPUTE"), true);
  assert.equal(guard.hasCapability("OPS", "VIEW_ADMIN"), true);
  assert.equal(guard.hasCapability("OPS", "MANAGE_FINANCE"), false);
  assert.equal(guard.hasCapability("OPS", "MANAGE_BA"), false);
});

test("hasCapability: SUPER_ADMIN can everything", () => {
  for (const cap of Object.values(guard.CAPABILITY_MATRIX)) {
    for (const c of cap) {
      assert.equal(guard.hasCapability("SUPER_ADMIN", c), true);
    }
  }
});

test("CAPABILITY_MATRIX: SUPER_ADMIN has all capabilities", () => {
  const all: Array<import("../src/server/auth/admin-guard").AdminCapability> = [
    "VIEW_ADMIN", "VERIFY_VENDOR", "MANAGE_DISPUTE",
    "MANAGE_FINANCE", "MANAGE_BA", "MANAGE_ADMIN",
  ];
  for (const c of all) assert.ok(guard.CAPABILITY_MATRIX.SUPER_ADMIN.includes(c));
});

/* ----------------------- Async guard (DB-backed) ----------------------- */

test("loadAdminActor: returns SUPER_ADMIN for admin with null adminRole", async () => {
  const u = await ctx.prisma.user.create({
    data: { name: "T Admin", phone: `0899${Date.now() % 100000000}`, role: "ADMIN" },
  });
  try {
    const actor = await guard.loadAdminActor(u.id);
    assert.equal(actor?.subRole, "SUPER_ADMIN");
    assert.equal(actor?.userId, u.id);
  } finally {
    await ctx.prisma.user.delete({ where: { id: u.id } });
  }
});

test("loadAdminActor: returns null for non-admin user", async () => {
  const u = await ctx.prisma.user.create({
    data: { name: "T Client", phone: `0898${Date.now() % 100000000}`, role: "CLIENT" },
  });
  try {
    assert.equal(await guard.loadAdminActor(u.id), null);
  } finally {
    await ctx.prisma.user.delete({ where: { id: u.id } });
  }
});

test("loadAdminActor: resolves OPS sub-role", async () => {
  const u = await ctx.prisma.user.create({
    data: { name: "T Ops", phone: `0897${Date.now() % 100000000}`, role: "ADMIN", adminRole: "OPS" },
  });
  try {
    const actor = await guard.loadAdminActor(u.id);
    assert.equal(actor?.subRole, "OPS");
  } finally {
    await ctx.prisma.user.delete({ where: { id: u.id } });
  }
});

/* -------------------- Audit service (DB-backed) -------------------- */

test("recordAdminAudit writes a row with correct fields + JSON metadata", async () => {
  const before = await ctx.prisma.adminAuditLog.count();
  await audit.recordAdminAudit({
    actor: { userId: "u_test", name: "Test Admin", subRole: "OPS" },
    capability: "VERIFY_VENDOR",
    action: "VENDOR_APPROVED",
    targetType: "VendorProfile",
    targetId: "vp_1",
    metadata: { note: "ok" },
  });
  const rows = await ctx.prisma.adminAuditLog.findMany({ orderBy: { createdAt: "desc" }, take: 1 });
  assert.equal(await ctx.prisma.adminAuditLog.count(), before + 1);
  assert.equal(rows[0].actorId, "u_test");
  assert.equal(rows[0].actorName, "Test Admin");
  assert.equal(rows[0].actorRole, "OPS");
  assert.equal(rows[0].capability, "VERIFY_VENDOR");
  assert.equal(rows[0].action, "VENDOR_APPROVED");
  assert.equal(rows[0].targetType, "VendorProfile");
  assert.equal(rows[0].targetId, "vp_1");
  assert.equal(rows[0].metadata, JSON.stringify({ note: "ok" }));
  await ctx.prisma.adminAuditLog.deleteMany({ where: { actorId: "u_test" } });
});

test("recordAdminAudit: no metadata -> null", async () => {
  await audit.recordAdminAudit({
    actor: { userId: "u_test2", name: "A", subRole: "SUPER_ADMIN" },
    capability: "MANAGE_BA",
    action: "BA_CREATED",
    targetType: "Ambassador",
    targetId: "ba_1",
  });
  const row = await ctx.prisma.adminAuditLog.findFirst({ where: { actorId: "u_test2" } });
  assert.equal(row?.metadata, null);
  await ctx.prisma.adminAuditLog.deleteMany({ where: { actorId: "u_test2" } });
});
