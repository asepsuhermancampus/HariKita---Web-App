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
type TransactionRetry = typeof import("../src/lib/transaction-retry");
type AmbassadorService = typeof import("../src/server/services/ambassador-service");

let ctx: TestDb;
let guard: AdminGuard;
let audit: AdminAuditService;
let txRetry: TransactionRetry;
let ambassador: AmbassadorService;

before(async () => {
  ctx = await createTestDb();
  (globalThis as unknown as { prisma?: unknown }).prisma = ctx.prisma;
  guard = await import("../src/server/auth/admin-guard");
  audit = await import("../src/server/services/admin-audit-service");
  txRetry = await import("../src/lib/transaction-retry");
  ambassador = await import("../src/server/services/ambassador-service");
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

/* ------------- Admin BA actions: atomic mutation + audit (DB-backed) -------------
 *
 * Server Action `src/server/actions/ambassador.ts` tidak dapat dipanggil langsung
 * dari test (import `next/headers` → butuh request context). Yang diuji di sini
 * adalah BODY transaksi persis yang dipakai aksi tersebut:
 *   withTransactionRetry(async (tx) => {
 *     <mutasi>(..., tx);  recordAdminAudit({...}, tx);
 *   });
 * sehingga kontrak atomicity (mutasi + audit commit/rollback bersama) tervalidasi.
 */

const financeActor: import("../src/server/auth/admin-guard").AdminActor = {
  userId: "u_finance_1",
  name: "Finance Uji",
  subRole: "FINANCE",
};
const baActor: import("../src/server/auth/admin-guard").AdminActor = {
  userId: "u_ba_1",
  name: "BA Admin Uji",
  subRole: "SUPER_ADMIN",
};

/** BA + withdrawal PENDING untuk diuji resolusi admin. */
async function seedPendingWithdrawal(amount: number) {
  const user = await ctx.prisma.user.create({
    data: {
      name: "BA Withdraw Uji",
      phone: `0857${Math.floor(Math.random() * 1e8).toString().padStart(8, "0")}`,
      role: "BA",
    },
  });
  const ambassadorRow = await ctx.prisma.brandAmbassador.create({
    data: {
      userId: user.id,
      referralCode: `BA-TW-${Math.floor(Math.random() * 1e6).toString(36).toUpperCase()}`,
      displayName: "BA Withdraw Uji",
      // Nominal penarikan sudah ditahan saat PENDING → saldo wallet 0.
      walletBalance: 0,
    },
  });
  const withdrawal = await ctx.prisma.ambassadorWithdrawal.create({
    data: { ambassadorId: ambassadorRow.id, amount, status: "PENDING" },
  });
  return { user, ambassadorRow, withdrawal };
}

test("ambassador admin: resolveWithdrawal(REJECTED) + audit commit atomically", async () => {
  const { user, ambassadorRow, withdrawal } = await seedPendingWithdrawal(50_000);
  try {
    await txRetry.withTransactionRetry(async (tx) => {
      await ambassador.resolveWithdrawal(withdrawal.id, "REJECTED", tx);
      await audit.recordAdminAudit(
        {
          actor: financeActor,
          capability: "MANAGE_FINANCE",
          action: "WITHDRAWAL_RESOLVED",
          targetType: "AmbassadorWithdrawal",
          targetId: withdrawal.id,
          metadata: { decision: "REJECTED" },
        },
        tx
      );
    });

    const w = await ctx.prisma.ambassadorWithdrawal.findUniqueOrThrow({ where: { id: withdrawal.id } });
    assert.equal(w.status, "REJECTED");
    const baAfter = await ctx.prisma.brandAmbassador.findUniqueOrThrow({ where: { id: ambassadorRow.id } });
    assert.equal(baAfter.walletBalance, 50_000); // refund saldo saat REJECTED (dari 0)
    const log = await ctx.prisma.adminAuditLog.findFirst({
      where: { targetId: withdrawal.id, action: "WITHDRAWAL_RESOLVED" },
    });
    assert.ok(log, "audit row harus tertulis");
    assert.equal(log?.capability, "MANAGE_FINANCE");
    assert.equal(log?.actorRole, "FINANCE");
    assert.equal(log?.metadata, JSON.stringify({ decision: "REJECTED" }));
  } finally {
    await ctx.prisma.adminAuditLog.deleteMany({ where: { targetId: withdrawal.id } });
    await ctx.prisma.brandAmbassador.deleteMany({ where: { id: ambassadorRow.id } });
    await ctx.prisma.user.deleteMany({ where: { id: user.id } });
  }
});

test("ambassador admin: resolveWithdrawal + audit roll back together bila audit gagal", async () => {
  const { user, ambassadorRow, withdrawal } = await seedPendingWithdrawal(50_000);
  try {
    await assert.rejects(
      txRetry.withTransactionRetry(async (tx) => {
        await ambassador.resolveWithdrawal(withdrawal.id, "REJECTED", tx);
        // targetId TIDAK NULL → foreign-key/unique violation memaksa rollback.
        await audit.recordAdminAudit(
          {
            actor: financeActor,
            capability: "MANAGE_FINANCE",
            action: "WITHDRAWAL_RESOLVED",
            targetType: "AmbassadorWithdrawal",
            targetId: withdrawal.id,
            // metadata memaksa error lewat payload non-serializable
            metadata: { bad: BigInt(1) as unknown as number },
          },
          tx
        );
      })
    );

    // Mutasi withdrawal harus ikut ter-rollback (masih PENDING).
    const w = await ctx.prisma.ambassadorWithdrawal.findUniqueOrThrow({ where: { id: withdrawal.id } });
    assert.equal(w.status, "PENDING");
    const baAfter = await ctx.prisma.brandAmbassador.findUniqueOrThrow({ where: { id: ambassadorRow.id } });
    assert.equal(baAfter.walletBalance, 0); // refund ikut ter-rollback
    assert.equal(await ctx.prisma.adminAuditLog.count({ where: { targetId: withdrawal.id } }), 0);
  } finally {
    await ctx.prisma.adminAuditLog.deleteMany({ where: { targetId: withdrawal.id } });
    await ctx.prisma.brandAmbassador.deleteMany({ where: { id: ambassadorRow.id } });
    await ctx.prisma.user.deleteMany({ where: { id: user.id } });
  }
});

test("ambassador admin: setCommission + audit commit atomically", async () => {
  const { user, ambassadorRow } = await seedPendingWithdrawal(0);
  try {
    await txRetry.withTransactionRetry(async (tx) => {
      await tx.brandAmbassador.update({
        where: { id: ambassadorRow.id },
        data: { commissionPct: 12.5 },
      });
      await audit.recordAdminAudit(
        {
          actor: baActor,
          capability: "MANAGE_BA",
          action: "BA_COMMISSION_SET",
          targetType: "Ambassador",
          targetId: ambassadorRow.id,
          metadata: { commissionPct: 12.5 },
        },
        tx
      );
    });

    const baAfter = await ctx.prisma.brandAmbassador.findUniqueOrThrow({ where: { id: ambassadorRow.id } });
    assert.equal(baAfter.commissionPct, 12.5);
    const log = await ctx.prisma.adminAuditLog.findFirst({
      where: { targetId: ambassadorRow.id, action: "BA_COMMISSION_SET" },
    });
    assert.equal(log?.metadata, JSON.stringify({ commissionPct: 12.5 }));
    assert.equal(log?.capability, "MANAGE_BA");
  } finally {
    await ctx.prisma.adminAuditLog.deleteMany({ where: { targetId: ambassadorRow.id } });
    await ctx.prisma.brandAmbassador.deleteMany({ where: { id: ambassadorRow.id } });
    await ctx.prisma.user.deleteMany({ where: { id: user.id } });
  }
});

test("ambassador admin: setActive + audit commit atomically", async () => {
  const { user, ambassadorRow } = await seedPendingWithdrawal(0);
  try {
    await txRetry.withTransactionRetry(async (tx) => {
      await tx.brandAmbassador.update({
        where: { id: ambassadorRow.id },
        data: { isActive: false },
      });
      await audit.recordAdminAudit(
        {
          actor: baActor,
          capability: "MANAGE_BA",
          action: "BA_ACTIVE_CHANGED",
          targetType: "Ambassador",
          targetId: ambassadorRow.id,
          metadata: { isActive: false },
        },
        tx
      );
    });

    const baAfter = await ctx.prisma.brandAmbassador.findUniqueOrThrow({ where: { id: ambassadorRow.id } });
    assert.equal(baAfter.isActive, false);
    const log = await ctx.prisma.adminAuditLog.findFirst({
      where: { targetId: ambassadorRow.id, action: "BA_ACTIVE_CHANGED" },
    });
    assert.equal(log?.metadata, JSON.stringify({ isActive: false }));
  } finally {
    await ctx.prisma.adminAuditLog.deleteMany({ where: { targetId: ambassadorRow.id } });
    await ctx.prisma.brandAmbassador.deleteMany({ where: { id: ambassadorRow.id } });
    await ctx.prisma.user.deleteMany({ where: { id: user.id } });
  }
});

test("ambassador admin: create (User + BrandAmbassador + audit) commit atomically", async () => {
  const phone = `0866${Math.floor(Math.random() * 1e8).toString().padStart(8, "0")}`;
  const result = await txRetry.withTransactionRetry(async (tx) => {
    const createdUser = await tx.user.create({
      data: { name: "BA Baru", phone, pin: "hash", role: "BA" },
    });
    const createdBa = await tx.brandAmbassador.create({
      data: {
        userId: createdUser.id,
        referralCode: `BA-NEW-${Math.floor(Math.random() * 1e6).toString(36).toUpperCase()}`,
        displayName: "BA Baru",
        commissionPct: 5.0,
      },
    });
    await audit.recordAdminAudit(
      {
        actor: baActor,
        capability: "MANAGE_BA",
        action: "BA_CREATED",
        targetType: "Ambassador",
        targetId: createdBa.id,
        metadata: { referralCode: createdBa.referralCode },
      },
      tx
    );
    return createdBa;
  });

  try {
    const persisted = await ctx.prisma.brandAmbassador.findUniqueOrThrow({ where: { id: result.id } });
    assert.equal(persisted.referralCode, result.referralCode);
    const log = await ctx.prisma.adminAuditLog.findFirst({
      where: { targetId: result.id, action: "BA_CREATED" },
    });
    assert.equal(log?.metadata, JSON.stringify({ referralCode: result.referralCode }));
  } finally {
    await ctx.prisma.adminAuditLog.deleteMany({ where: { targetId: result.id } });
    await ctx.prisma.brandAmbassador.deleteMany({ where: { id: result.id } });
    await ctx.prisma.user.deleteMany({ where: { phone } });
  }
});
