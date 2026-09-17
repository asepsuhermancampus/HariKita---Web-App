import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import type { PrismaClient } from "@prisma/client";
import { createTestDb, seedVendorWithPackage, seedClient, type TestDb } from "./helpers/test-db";

import {
  claimHoldSlot,
  verifyAndPromoteSlot,
  bookReservedSlots,
  setBlackoutDate,
  sweepExpiredHolds,
  getEffectiveSlotStatus,
} from "../src/server/services/availability-service";
import {
  createOrder,
  processVendorDecision,
  expireOrdersSweep,
} from "../src/server/services/order-service";
import {
  createPaymentAttempt,
  processPaymentSuccess,
  runPayoutSweep,
  checkPayoutEligibility,
} from "../src/server/services/payment-service";
import { executePayout, payoutJournalNumber, getDisbursedPayoutTotal } from "../src/server/services/ledger-service";
import { DomainError } from "../src/server/services/errors";

let ctx: TestDb;
let prisma: PrismaClient;

before(async () => {
  ctx = await createTestDb();
  prisma = ctx.prisma;
});

after(async () => {
  await ctx.cleanup();
});

const EVENT_DATE = "2027-05-20";

// ── AvailabilityService ──────────────────────────────────────────────────────
test("Availability: claim → promote → book lifecycle", async () => {
  const { vendorId } = await seedVendorWithPackage(prisma, {
    category: "MUA",
    businessName: "Alula MUA",
    price: 2_000_000,
  });

  const hold = await claimHoldSlot({ vendorId, date: EVENT_DATE }, prisma);
  assert.ok(hold.holdToken);
  assert.equal(await getEffectiveSlotStatus(vendorId, EVENT_DATE, prisma), "HELD");

  // Promote needs an orderItem to bind; create a fake via order service below.
  // Direct DB order item for this unit test:
  const client = await seedClient(prisma, "Test Client");
  const order = await prisma.order.create({
    data: {
      orderNumber: `T-${Date.now()}`,
      userId: client.userId,
      clientName: "Test",
      clientPhone: "0812",
      eventDate: new Date("2027-05-20T00:00:00+07:00"),
      totalAmount: 2_000_000,
      status: "PENDING_CONFIRMATION",
    },
  });
  const item = await prisma.orderItem.create({
    data: {
      orderId: order.id,
      vendorId,
      categorySlug: "MUA",
      unitPrice: 2_000_000,
      subtotal: 2_000_000,
      status: "PENDING",
    },
  });

  await verifyAndPromoteSlot(
    { vendorId, date: EVENT_DATE, holdToken: hold.holdToken, orderItemId: item.id },
    prisma
  );
  assert.equal(await getEffectiveSlotStatus(vendorId, EVENT_DATE, prisma), "RESERVED");

  await bookReservedSlots([item.id], prisma);
  assert.equal(await getEffectiveSlotStatus(vendorId, EVENT_DATE, prisma), "BOOKED");
});

test("Availability: second concurrent hold on a RESERVED slot is rejected", async () => {
  const { vendorId } = await seedVendorWithPackage(prisma, {
    category: "Dekorasi",
    businessName: "Asmara Flora",
    price: 5_000_000,
  });
  const hold = await claimHoldSlot({ vendorId, date: "2027-06-01" }, prisma);

  const client = await seedClient(prisma, "C2");
  const order = await prisma.order.create({
    data: {
      orderNumber: `T2-${Date.now()}`,
      userId: client.userId,
      clientName: "C2",
      clientPhone: "0812",
      eventDate: new Date("2027-06-01T00:00:00+07:00"),
      totalAmount: 5_000_000,
      status: "PENDING_CONFIRMATION",
    },
  });
  const item = await prisma.orderItem.create({
    data: { orderId: order.id, vendorId, categorySlug: "Dekorasi", unitPrice: 5_000_000, subtotal: 5_000_000, status: "PENDING" },
  });
  await verifyAndPromoteSlot({ vendorId, date: "2027-06-01", holdToken: hold.holdToken, orderItemId: item.id }, prisma);

  await assert.rejects(
    claimHoldSlot({ vendorId, date: "2027-06-01" }, prisma),
    (e: unknown) => e instanceof DomainError && e.code === "SLOT_UNAVAILABLE"
  );
});

test("Availability: blackout rejected on RESERVED slot; allowed on OPEN", async () => {
  const { vendorId } = await seedVendorWithPackage(prisma, {
    category: "Katering",
    businessName: "Rasa Boga",
    price: 4_000_000,
  });
  // OPEN → blackout allowed
  await assert.doesNotReject(setBlackoutDate({ vendorId, date: "2027-07-01" }, prisma));
  assert.equal(await getEffectiveSlotStatus(vendorId, "2027-07-01", prisma), "BLACKED_OUT");

  // RESERVED → blackout rejected
  const hold = await claimHoldSlot({ vendorId, date: "2027-07-02" }, prisma);
  const client = await seedClient(prisma, "C3");
  const order = await prisma.order.create({
    data: { orderNumber: `T3-${Date.now()}`, userId: client.userId, clientName: "C3", clientPhone: "0812", eventDate: new Date("2027-07-02T00:00:00+07:00"), totalAmount: 4_000_000, status: "PENDING_CONFIRMATION" },
  });
  const item = await prisma.orderItem.create({
    data: { orderId: order.id, vendorId, categorySlug: "Katering", unitPrice: 4_000_000, subtotal: 4_000_000, status: "PENDING" },
  });
  await verifyAndPromoteSlot({ vendorId, date: "2027-07-02", holdToken: hold.holdToken, orderItemId: item.id }, prisma);

  await assert.rejects(
    setBlackoutDate({ vendorId, date: "2027-07-02" }, prisma),
    (e: unknown) => e instanceof DomainError && e.code === "SLOT_UNAVAILABLE"
  );
});

test("Availability: expired holds are swept back to OPEN", async () => {
  const { vendorId } = await seedVendorWithPackage(prisma, {
    category: "Souvenir",
    businessName: "Kriya Anyam",
    price: 1_000_000,
  });
  // Claim with negative TTL to force immediate expiry.
  await claimHoldSlot({ vendorId, date: "2027-08-01", holdMinutes: -1 }, prisma);
  const released = await sweepExpiredHolds(prisma);
  assert.ok(released >= 1);
  assert.equal(await getEffectiveSlotStatus(vendorId, "2027-08-01", prisma), "OPEN");
});

// ── OrderService: create + vendor decision + full payment ────────────────────
test("Order: createOrder uses authoritative pricing and promotes slots", async () => {
  const v1 = await seedVendorWithPackage(prisma, { category: "Pre-wedding", businessName: "Menganti Studio", price: 3_500_000 });
  const client = await seedClient(prisma, "Bima & Citra");

  const hold = await claimHoldSlot({ vendorId: v1.vendorId, date: "2027-09-10" }, prisma);

  const result = await createOrder(
    {
      eventDate: "2027-09-10",
      clientName: "Bima & Citra",
      clientPhone: "081987654321",
      userId: client.userId,
      items: [{ servicePackageId: v1.packageId, quantity: 1, holdToken: hold.holdToken }],
    },
    prisma
  );

  assert.equal(result.totalAmount, 3_500_000);
  assert.match(result.orderNumber, /^HK-\d{8}-[0-9A-F]{6}$/);

  const item = await prisma.orderItem.findFirst({ where: { orderId: result.orderId } });
  assert.ok(item);
  assert.equal(item!.unitPrice, 3_500_000);
  assert.equal(item!.subtotal, 3_500_000);
  assert.equal(await getEffectiveSlotStatus(v1.vendorId, "2027-09-10", prisma), "RESERVED");
});

test("Order: all-accepted transitions to WAITING_DP and locks total + creates DP installment", async () => {
  const v1 = await seedVendorWithPackage(prisma, { category: "Busana", businessName: "Rarasati", price: 2_800_000 });
  const client = await seedClient(prisma, "Dimas");
  const hold = await claimHoldSlot({ vendorId: v1.vendorId, date: "2027-10-10" }, prisma);
  const order = await createOrder(
    {
      eventDate: "2027-10-10",
      clientName: "Dimas",
      clientPhone: "0812",
      userId: client.userId,
      items: [{ servicePackageId: v1.packageId, quantity: 1, holdToken: hold.holdToken }],
    },
    prisma
  );

  const item = await prisma.orderItem.findFirstOrThrow({ where: { orderId: order.orderId } });
  const decision = await processVendorDecision(
    { orderItemId: item.id, command: "ACCEPT", vendorUserId: v1.userId },
    prisma
  );
  assert.equal(decision.orderStatus, "WAITING_DP");

  const updated = await prisma.order.findUniqueOrThrow({ where: { id: order.orderId } });
  assert.equal(updated.status, "WAITING_DP");
  assert.equal(updated.totalAmount, 2_800_000);
  assert.ok(updated.dpDueAt);

  const dp = await prisma.paymentInstallment.findFirst({ where: { orderId: order.orderId, type: "DP_30" } });
  assert.ok(dp);
  assert.equal(dp!.amount, 2_800_000);
  assert.equal(dp!.status, "PENDING");
});

test("Order: full payment flow DP_30 → IN_PROGRESS with BOOKED slots and ledger", async () => {
  const v1 = await seedVendorWithPackage(prisma, { category: "MUA", businessName: "Alula2", price: 2_000_000 });
  const client = await seedClient(prisma, "Flow Client");
  const hold = await claimHoldSlot({ vendorId: v1.vendorId, date: "2027-11-11" }, prisma);
  const order = await createOrder(
    {
      eventDate: "2027-11-11",
      clientName: "Flow",
      clientPhone: "0812",
      userId: client.userId,
      items: [{ servicePackageId: v1.packageId, quantity: 1, holdToken: hold.holdToken }],
    },
    prisma
  );
  const item = await prisma.orderItem.findFirstOrThrow({ where: { orderId: order.orderId } });
  await processVendorDecision({ orderItemId: item.id, command: "ACCEPT", vendorUserId: v1.userId }, prisma);

  const dp = await prisma.paymentInstallment.findFirstOrThrow({ where: { orderId: order.orderId, type: "DP_30" } });
  const attempt = await createPaymentAttempt(
    { installmentId: dp.id, provider: "simulated_qris", clientGeneratedRef: "ref-1" },
    prisma
  );
  assert.equal(attempt.reused, false);

  const result = await processPaymentSuccess(
    { attemptId: attempt.attemptId, provider: "simulated_qris", providerTransactionId: "TX-1", amount: 2_000_000 },
    prisma
  );
  assert.equal(result.outcome, "PROCESSED");
  assert.equal(result.orderStatus, "IN_PROGRESS");

  // Slot becomes BOOKED.
  assert.equal(await getEffectiveSlotStatus(v1.vendorId, "2027-11-11", prisma), "BOOKED");

  // Ledger has ESCROW_DP_IN.
  const journal = await prisma.ledgerJournal.findFirst({ where: { orderId: order.orderId, type: "ESCROW_DP_IN" }, include: { entries: true } });
  assert.ok(journal);
  const debit = journal!.entries.reduce((a, e) => a + e.debit, 0);
  const credit = journal!.entries.reduce((a, e) => a + e.credit, 0);
  assert.equal(debit, credit);
  assert.equal(debit, 2_000_000);

  // Idempotent reprocessing.
  const again = await processPaymentSuccess(
    { attemptId: attempt.attemptId, provider: "simulated_qris", providerTransactionId: "TX-1", amount: 2_000_000 },
    prisma
  );
  assert.equal(again.outcome, "ALREADY_PAID");
});

test("Payment: amount mismatch is a permanent DomainError", async () => {
  const v1 = await seedVendorWithPackage(prisma, { category: "Cake", businessName: "L'Aura", price: 1_600_000 });
  const client = await seedClient(prisma, "Mismatch");
  const hold = await claimHoldSlot({ vendorId: v1.vendorId, date: "2027-12-01" }, prisma);
  const order = await createOrder(
    { eventDate: "2027-12-01", clientName: "M", clientPhone: "0812", userId: client.userId, items: [{ servicePackageId: v1.packageId, holdToken: hold.holdToken }] },
    prisma
  );
  const item = await prisma.orderItem.findFirstOrThrow({ where: { orderId: order.orderId } });
  await processVendorDecision({ orderItemId: item.id, command: "ACCEPT", vendorUserId: v1.userId }, prisma);
  const dp = await prisma.paymentInstallment.findFirstOrThrow({ where: { orderId: order.orderId, type: "DP_30" } });
  const attempt = await createPaymentAttempt({ installmentId: dp.id, provider: "x", clientGeneratedRef: "r" }, prisma);

  await assert.rejects(
    processPaymentSuccess({ attemptId: attempt.attemptId, provider: "x", providerTransactionId: "TX-M", amount: 999 }, prisma),
    (e: unknown) => e instanceof DomainError && e.code === "PAYMENT_AMOUNT_MISMATCH"
  );
});

// ── Ledger payout exact-once ─────────────────────────────────────────────────
test("Ledger: executePayout is exact-once via deterministic journalNumber", async () => {
  const order = await prisma.order.create({
    data: { orderNumber: `P-${Date.now()}`, clientName: "P", clientPhone: "0812", eventDate: new Date("2027-01-01T00:00:00+07:00"), totalAmount: 3_000_000, status: "COMPLETED" },
  });

  const first = await executePayout({ orderId: order.id, tranche: "DP_DISBURSEMENT", amount: 900_000 }, prisma);
  assert.equal(first.created, true);
  assert.equal(first.journalNumber, payoutJournalNumber(order.id, "DP_DISBURSEMENT"));

  const second = await executePayout({ orderId: order.id, tranche: "DP_DISBURSEMENT", amount: 900_000 }, prisma);
  assert.equal(second.created, false);
  assert.equal(second.journalId, first.journalId);

  const disbursed = await getDisbursedPayoutTotal(order.id, prisma);
  assert.equal(disbursed, 900_000);
});

test("Ledger: payout eligibility requires H-3 window and source journal", async () => {
  const v1 = await seedVendorWithPackage(prisma, { category: "Undangan", businessName: "HK Print", price: 1_250_000 });
  const client = await seedClient(prisma, "Elig");
  const hold = await claimHoldSlot({ vendorId: v1.vendorId, date: "2027-03-01" }, prisma);
  const order = await createOrder(
    { eventDate: "2027-03-01", clientName: "E", clientPhone: "0812", userId: client.userId, items: [{ servicePackageId: v1.packageId, holdToken: hold.holdToken }] },
    prisma
  );
  const item = await prisma.orderItem.findFirstOrThrow({ where: { orderId: order.orderId } });
  await processVendorDecision({ orderItemId: item.id, command: "ACCEPT", vendorUserId: v1.userId }, prisma);
  const dp = await prisma.paymentInstallment.findFirstOrThrow({ where: { orderId: order.orderId, type: "DP_30" } });
  const attempt = await createPaymentAttempt({ installmentId: dp.id, provider: "x", clientGeneratedRef: "r" }, prisma);
  await processPaymentSuccess({ attemptId: attempt.attemptId, provider: "x", providerTransactionId: "TX-E", amount: 1_250_000 }, prisma);

  // Not eligible yet (event far away).
  const early = await checkPayoutEligibility(order.orderId, "DP_DISBURSEMENT", prisma);
  assert.equal(early.eligible, false);
  assert.equal(early.reason, "NOT_H3_YET");

  // Sweep with the candidate: should skip (not yet eligible).
  const sweep = await runPayoutSweep([{ orderId: order.orderId, tranche: "DP_DISBURSEMENT" }], prisma);
  assert.ok(sweep.skipped.some((s) => s.orderId === order.orderId));
});

// ── Order expiry sweep ───────────────────────────────────────────────────────
test("Order: expireOrdersSweep expires overdue vendor-response orders", async () => {
  const v1 = await seedVendorWithPackage(prisma, { category: "Dokumentasi", businessName: "Pradana", price: 4_200_000 });
  const client = await seedClient(prisma, "Expire");
  const hold = await claimHoldSlot({ vendorId: v1.vendorId, date: "2027-04-01" }, prisma);
  const order = await createOrder(
    { eventDate: "2027-04-01", clientName: "X", clientPhone: "0812", userId: client.userId, items: [{ servicePackageId: v1.packageId, holdToken: hold.holdToken }] },
    prisma
  );
  // Force overdue.
  await prisma.order.update({ where: { id: order.orderId }, data: { vendorResponseDueAt: new Date(Date.now() - 1000) } });

  const expired = await expireOrdersSweep(prisma);
  assert.ok(expired.includes(order.orderId));

  const updated = await prisma.order.findUniqueOrThrow({ where: { id: order.orderId } });
  assert.equal(updated.status, "EXPIRED");
  // Slot released back to OPEN.
  assert.equal(await getEffectiveSlotStatus(v1.vendorId, "2027-04-01", prisma), "OPEN");
});
