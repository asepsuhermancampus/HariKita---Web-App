import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { createTestDb, seedAmbassador, seedVendorWithRecruiter, seedClient, type TestDb } from "./helpers/test-db";
import type { PrismaClient } from "@prisma/client";
import {
  creditCommissionForOrder,
  requestWithdrawal,
  resolveWithdrawal,
} from "../src/server/services/ambassador-service";
import { runPayoutSweep } from "../src/server/services/payment-service";
import { recordJournal } from "../src/server/services/ledger-service";

let ctx: TestDb;
let prisma: PrismaClient;
let servicePrismaRebound: { $disconnect: () => Promise<void> } | null = null;

before(async () => {
  ctx = await createTestDb();
  prisma = ctx.prisma;
  // Task 6: requestWithdrawal/resolveWithdrawal dipanggil TANPA `tx` oleh brief,
  // sehingga service memakai singleton `@/lib/prisma`. Arahkan singleton itu ke
  // DB SQLite temporer agar test tidak menulis ke prisma/dev.db. Modul service
  // diimpor lebih dulu supaya singleton sudah ter-instantiate saat di-rebind.
  await import("../src/server/services/ambassador-service");
  const { prisma: servicePrisma } = await import("../src/lib/prisma");
  const dbPath = path.join(process.env.HARIKITA_TEST_DB_DIR!, "test.db");

  const { PrismaClient: SqlitePrismaClient } = await import("../generated/sqlite-client");
  type ClientLike = Record<string, unknown> & {
    $connect: () => Promise<void>;
    $disconnect: () => Promise<void>;
  };
  const original = servicePrisma as unknown as ClientLike;
  const ReboundClient = SqlitePrismaClient as unknown as new (opts: unknown) => ClientLike;
  const rebound = new ReboundClient({
    datasources: { db: { url: `file:${dbPath.replace(/\\/g, "/")}` } },
  });

  for (const key of Object.keys(rebound)) {
    if (key === "$connect" || key === "$disconnect") continue;
    try {
      original[key] = rebound[key];
    } catch {
      // properti read-only (mis. _clientVersion) → abaikan.
    }
  }
  original.$connect = () => rebound.$connect();
  original.$disconnect = () => rebound.$disconnect();
  await rebound.$connect();
  servicePrismaRebound = rebound;
});

after(async () => {
  // Lepas handle file SQLite temporer sebelum cleanup menghapus direktorinya.
  if (servicePrismaRebound) await servicePrismaRebound.$disconnect();
  await ctx.cleanup();
});

beforeEach(async () => {
  await prisma.ambassadorCommission.deleteMany();
  await prisma.ledgerEntry.deleteMany();
  await prisma.ledgerJournal.deleteMany();
  await prisma.ambassadorWithdrawal.deleteMany();
  await prisma.brandAmbassador.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
});

async function makeOrder(vendorId: string, packageId: string, subtotal: number) {
  const client = await seedClient(prisma, "Klien Uji");
  const order = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Math.floor(Math.random() * 1e9)}`,
      userId: client.userId,
      clientName: "Klien Uji",
      clientPhone: "081200000000",
      eventDate: new Date("2027-01-01"),
      totalAmount: subtotal,
      status: "COMPLETED",
    },
  });
  const item = await prisma.orderItem.create({
    data: {
      orderId: order.id,
      vendorId,
      packageId,
      vendorNameSnapshot: "Vendor",
      unitPrice: subtotal,
      subtotal,
      status: "ACCEPTED",
    },
  });
  return { order, item };
}

test("credits commission = floor(subtotal * pct / 100) to BA wallet", async () => {
  const ba = await seedAmbassador(prisma, { commissionPct: 5.0 });
  const v = await seedVendorWithRecruiter(prisma, { ambassadorId: ba.ambassadorId, commissionPct: 5.0, price: 1_000_000 });
  const { order } = await makeOrder(v.vendorId, v.packageId, 1_000_000);

  const res = await creditCommissionForOrder(order.id, prisma);
  assert.equal(res.created, 1);

  const wallet = await prisma.brandAmbassador.findUnique({ where: { id: ba.ambassadorId } });
  assert.equal(wallet!.walletBalance, 50_000);
});

test("is exact-once: running twice does not double credit", async () => {
  const ba = await seedAmbassador(prisma, { commissionPct: 5.0 });
  const v = await seedVendorWithRecruiter(prisma, { ambassadorId: ba.ambassadorId, commissionPct: 5.0, price: 2_000_000 });
  const { order } = await makeOrder(v.vendorId, v.packageId, 2_000_000);

  await creditCommissionForOrder(order.id, prisma);
  const second = await creditCommissionForOrder(order.id, prisma);
  assert.equal(second.created, 0);

  const wallet = await prisma.brandAmbassador.findUnique({ where: { id: ba.ambassadorId } });
  assert.equal(wallet!.walletBalance, 100_000);
});

test("does not credit for vendor without recruiter", async () => {
  const ba = await seedAmbassador(prisma, { commissionPct: 5.0 });
  const v = await seedVendorWithRecruiter(prisma, { ambassadorId: ba.ambassadorId, commissionPct: 5.0, price: 1_000_000 });
  // Clear recruiter to simulate vendor tanpa BA.
  await prisma.vendorProfile.update({ where: { id: v.vendorId }, data: { recruitedById: null } });
  const { order } = await makeOrder(v.vendorId, v.packageId, 1_000_000);

  const res = await creditCommissionForOrder(order.id, prisma);
  assert.equal(res.created, 0);
});

test("does not credit for inactive ambassador", async () => {
  const ba = await seedAmbassador(prisma, { commissionPct: 5.0, isActive: false });
  const v = await seedVendorWithRecruiter(prisma, { ambassadorId: ba.ambassadorId, commissionPct: 5.0, price: 1_000_000 });
  const { order } = await makeOrder(v.vendorId, v.packageId, 1_000_000);

  const res = await creditCommissionForOrder(order.id, prisma);
  assert.equal(res.created, 0);
});

test("idempotent no-op when journalNumber already exists (concurrent collision)", async () => {
  const ba = await seedAmbassador(prisma, { commissionPct: 5.0 });
  const v = await seedVendorWithRecruiter(prisma, { ambassadorId: ba.ambassadorId, commissionPct: 5.0, price: 1_000_000 });
  const { order, item } = await makeOrder(v.vendorId, v.packageId, 1_000_000);

  // Simulasi pemanggil concurrent yang lebih dulu menulis jurnal deterministik
  // (ADVCOM-{item.id}) tanpa (belum) menulis AmbassadorCommission.
  await prisma.ledgerJournal.create({
    data: {
      journalNumber: `ADVCOM-${item.id}`,
      type: "AMBASSADOR_COMMISSION",
      description: "concurrent winner",
      orderId: order.id,
      entries: {
        create: [
          { accountId: "4010_PLATFORM_FEE", debit: 50_000, credit: 0 },
          { accountId: "2040_AMBASSADOR_PAYABLE", debit: 0, credit: 50_000 },
        ],
      },
    },
  });

  // Harus tidak throw (P2002 pada journalNumber tertangkap → no-op), tidak double-credit.
  const res = await creditCommissionForOrder(order.id, prisma);
  assert.equal(res.created, 0);
  assert.equal(res.skipped, 1);

  const wallet = await prisma.brandAmbassador.findUnique({ where: { id: ba.ambassadorId } });
  assert.equal(wallet!.walletBalance, 0);
  const commissions = await prisma.ambassadorCommission.count();
  assert.equal(commissions, 0);
});

test("idempotent no-op when AmbassadorCommission already exists", async () => {
  const ba = await seedAmbassador(prisma, { commissionPct: 5.0 });
  const v = await seedVendorWithRecruiter(prisma, { ambassadorId: ba.ambassadorId, commissionPct: 5.0, price: 1_000_000 });
  const { order, item } = await makeOrder(v.vendorId, v.packageId, 1_000_000);

  // Simulasi exact-once: commission untuk item ini sudah tercatat.
  await prisma.ambassadorCommission.create({
    data: {
      ambassadorId: ba.ambassadorId,
      orderId: order.id,
      orderItemId: item.id,
      vendorId: v.vendorId,
      baseAmount: 1_000_000,
      commissionPct: 5.0,
      commissionAmount: 50_000,
      status: "CREDITED",
    },
  });

  const res = await creditCommissionForOrder(order.id, prisma);
  assert.equal(res.created, 0);

  const wallet = await prisma.brandAmbassador.findUnique({ where: { id: ba.ambassadorId } });
  assert.equal(wallet!.walletBalance, 0);
});

test("runPayoutSweep SETTLEMENT_PAYOUT triggers BA commission", async () => {
  const ba = await seedAmbassador(prisma, { commissionPct: 5.0 });
  const v = await seedVendorWithRecruiter(prisma, { ambassadorId: ba.ambassadorId, commissionPct: 5.0, price: 1_000_000 });
  const { order } = await makeOrder(v.vendorId, v.packageId, 1_000_000);

  // Sumber jurnal SETTLEMENT_IN (prasyarat eligibility).
  await recordJournal(
    {
      type: "SETTLEMENT_IN",
      description: "Pelunasan diterima",
      orderId: order.id,
      entries: [
        { accountId: "1010_CASH_GATEWAY", debit: 700_000, credit: 0 },
        { accountId: "2010_CLIENT_ESCROW", debit: 0, credit: 700_000 },
      ],
    },
    prisma
  );

  // Installment SETTLEMENT_70 PAID agar guard pembayaran lolos.
  await prisma.paymentInstallment.create({
    data: { orderId: order.id, type: "SETTLEMENT_70", amount: 700_000, status: "PAID", paidAt: new Date() },
  });

  // Guard H+2 memakai SSOT OrderStatusHistory (toStatus COMPLETED), bukan
  // order.updatedAt. Seed riwayat COMPLETED >= 48 jam lalu agar window terlewati.
  await prisma.orderStatusHistory.create({
    data: {
      orderId: order.id,
      fromStatus: "WAITING_SETTLEMENT",
      toStatus: "COMPLETED",
      changedBy: "SYSTEM",
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    },
  });

  const sweep = await runPayoutSweep([{ orderId: order.id, tranche: "SETTLEMENT_PAYOUT" }], prisma);
  assert.deepEqual(sweep.executed, [order.id]);

  const commission = await prisma.ambassadorCommission.findFirst({ where: { orderId: order.id } });
  assert.ok(commission, "komisi BA harus tercatat setelah settlement payout");
  assert.equal(commission!.commissionAmount, 50_000);

  const wallet = await prisma.brandAmbassador.findUnique({ where: { id: ba.ambassadorId } });
  assert.equal(wallet!.walletBalance, 50_000);
});

test("runPayoutSweep DP_DISBURSEMENT does NOT trigger BA commission", async () => {
  const ba = await seedAmbassador(prisma, { commissionPct: 5.0 });
  const v = await seedVendorWithRecruiter(prisma, { ambassadorId: ba.ambassadorId, commissionPct: 5.0, price: 1_000_000 });
  const { order } = await makeOrder(v.vendorId, v.packageId, 1_000_000);

  // Order masih dalam proses (bukan terminal) + event H-1 (dalam window H-3 DP).
  await prisma.order.update({
    where: { id: order.id },
    data: { status: "IN_PROGRESS", eventDate: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  });

  // Sumber jurnal ESCROW_DP_IN (prasyarat eligibility DP).
  await recordJournal(
    {
      type: "ESCROW_DP_IN",
      description: "DP diterima",
      orderId: order.id,
      entries: [
        { accountId: "1010_CASH_GATEWAY", debit: 300_000, credit: 0 },
        { accountId: "2010_CLIENT_ESCROW", debit: 0, credit: 300_000 },
      ],
    },
    prisma
  );

  // Installment DP_30 PAID agar guard pembayaran DP lolos.
  await prisma.paymentInstallment.create({
    data: { orderId: order.id, type: "DP_30", amount: 300_000, status: "PAID", paidAt: new Date() },
  });

  const sweep = await runPayoutSweep([{ orderId: order.id, tranche: "DP_DISBURSEMENT" }], prisma);
  // Guard benar-benar lolos: payout DP benar-benar dieksekusi.
  assert.deepEqual(sweep.executed, [order.id]);

  // Aturan inti task: komisi HANYA pada SETTLEMENT_PAYOUT, bukan DP.
  const commissionCount = await prisma.ambassadorCommission.count();
  assert.equal(commissionCount, 0, "tidak boleh ada komisi BA pada DP_DISBURSEMENT");

  const wallet = await prisma.brandAmbassador.findUnique({ where: { id: ba.ambassadorId } });
  assert.equal(wallet!.walletBalance, 0);
});

// ── Task 6: penarikan dompet BA ────────────────────────────────────────────

test("requestWithdrawal deducts wallet balance", async () => {
  const ba = await seedAmbassador(prisma);
  await prisma.brandAmbassador.update({ where: { id: ba.ambassadorId }, data: { walletBalance: 100_000 } });

  await requestWithdrawal({ ambassadorId: ba.ambassadorId, amount: 40_000 });
  const wallet = await prisma.brandAmbassador.findUnique({ where: { id: ba.ambassadorId } });
  assert.equal(wallet!.walletBalance, 60_000);
});

test("requestWithdrawal rejects amount above balance", async () => {
  const ba = await seedAmbassador(prisma);
  await prisma.brandAmbassador.update({ where: { id: ba.ambassadorId }, data: { walletBalance: 10_000 } });
  await assert.rejects(() => requestWithdrawal({ ambassadorId: ba.ambassadorId, amount: 20_000 }));
});

test("resolveWithdrawal REJECTED restores balance", async () => {
  const ba = await seedAmbassador(prisma);
  await prisma.brandAmbassador.update({ where: { id: ba.ambassadorId }, data: { walletBalance: 50_000 } });
  const { withdrawalId } = await requestWithdrawal({ ambassadorId: ba.ambassadorId, amount: 50_000 });

  await resolveWithdrawal(withdrawalId, "REJECTED", prisma);
  const wallet = await prisma.brandAmbassador.findUnique({ where: { id: ba.ambassadorId } });
  assert.equal(wallet!.walletBalance, 50_000);
});

