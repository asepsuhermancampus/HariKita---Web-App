import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createTestDb, seedAmbassador, seedVendorWithRecruiter, seedClient, type TestDb } from "./helpers/test-db";
import type { PrismaClient } from "@prisma/client";
import { creditCommissionForOrder } from "../src/server/services/ambassador-service";

let ctx: TestDb;
let prisma: PrismaClient;

before(async () => {
  ctx = await createTestDb();
  prisma = ctx.prisma;
});

after(async () => {
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

