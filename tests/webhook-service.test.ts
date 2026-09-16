import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import type { PrismaClient } from "@prisma/client";
import { createTestDb, seedVendorWithPackage, seedClient, type TestDb } from "./helpers/test-db";

import { claimHoldSlot } from "../src/server/services/availability-service";
import { createOrder, processVendorDecision } from "../src/server/services/order-service";
import { createPaymentAttempt } from "../src/server/services/payment-service";
import {
  persistWebhookEvent,
  handleIncomingWebhook,
} from "../src/server/services/payment-webhook-service";

let ctx: TestDb;
let prisma: PrismaClient;
const RUN = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

before(async () => {
  ctx = await createTestDb();
  prisma = ctx.prisma;
});

after(async () => {
  await ctx.cleanup();
});

async function makeOrderWithAttempt(amount: number, eventDate: string) {
  const v1 = await seedVendorWithPackage(prisma, {
    category: "WebhookCat",
    businessName: `WH-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    price: amount,
  });
  const client = await seedClient(prisma, "WH Client");
  const hold = await claimHoldSlot({ vendorId: v1.vendorId, date: eventDate }, prisma);
  const order = await createOrder(
    {
      eventDate,
      clientName: "WH",
      clientPhone: "0812",
      userId: client.userId,
      items: [{ servicePackageId: v1.packageId, holdToken: hold.holdToken }],
    },
    prisma
  );
  const item = await prisma.orderItem.findFirstOrThrow({ where: { orderId: order.orderId } });
  await processVendorDecision({ orderItemId: item.id, command: "ACCEPT", vendorUserId: v1.userId }, prisma);
  const dp = await prisma.paymentInstallment.findFirstOrThrow({ where: { orderId: order.orderId, type: "DP_30" } });
  const attempt = await createPaymentAttempt(
    { installmentId: dp.id, provider: "midtrans", clientGeneratedRef: "ref-wh" },
    prisma
  );
  return { orderId: order.orderId, attemptId: attempt.attemptId, amount };
}

test("Webhook: persistWebhookEvent is idempotent on (provider, eventId)", async () => {
  const first = await persistWebhookEvent(
    { provider: "midtrans", eventId: `EV-1-${RUN}`, eventType: "payment.success", payload: "{}" },
    prisma
  );
  assert.equal(first.duplicate, false);

  const second = await persistWebhookEvent(
    { provider: "midtrans", eventId: `EV-1-${RUN}`, eventType: "payment.success", payload: "{}" },
    prisma
  );
  assert.equal(second.duplicate, true);
  assert.equal(second.eventId, first.eventId);
});
test("Webhook: full two-phase processing marks event processed and pays order", async () => {
  const { orderId, attemptId, amount } = await makeOrderWithAttempt(3_000_000, "2027-06-15");

  const payload = JSON.stringify({
    attemptId,
    provider: "midtrans",
    providerTransactionId: "TX-WH-1",
    amount,
  });

  const result = await handleIncomingWebhook({
    provider: "midtrans",
    eventId: `EV-WH-1-${RUN}`,
    eventType: "payment.success",
    payload,
  }, prisma);

  assert.equal(result.httpStatus, 200);
  assert.equal(result.outcome.status, "PROCESSED");

  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  assert.equal(order.status, "IN_PROGRESS");

  const evt = await prisma.paymentWebhookEvent.findUniqueOrThrow({
    where: { provider_eventId: { provider: "midtrans", eventId: `EV-WH-1-${RUN}` } },
  });
  assert.equal(evt.processed, true);
});

test("Webhook: duplicate event delivery is idempotent (no double mutation)", async () => {
  const { orderId, attemptId, amount } = await makeOrderWithAttempt(1_500_000, "2027-06-16");
  const payload = JSON.stringify({ attemptId, provider: "midtrans", providerTransactionId: "TX-WH-2", amount });

  const first = await handleIncomingWebhook({ provider: "midtrans", eventId: `EV-WH-2-${RUN}`, eventType: "payment.success", payload }, prisma);
  assert.equal(first.outcome.status, "PROCESSED");

  const second = await handleIncomingWebhook({ provider: "midtrans", eventId: `EV-WH-2-${RUN}`, eventType: "payment.success", payload }, prisma);
  // Duplicate event → already processed → HTTP 200 idempotent.
  assert.equal(second.httpStatus, 200);
  assert.equal(second.outcome.status, "ALREADY_PROCESSED");

  // Only one ESCROW_DP_IN journal exists.
  const journals = await prisma.ledgerJournal.findMany({ where: { orderId, type: "ESCROW_DP_IN" } });
  assert.equal(journals.length, 1);
});

test("Webhook: amount mismatch yields permanent rejection (HTTP 200, processed=true)", async () => {
  const { attemptId } = await makeOrderWithAttempt(2_000_000, "2027-06-17");
  const payload = JSON.stringify({ attemptId, provider: "midtrans", providerTransactionId: "TX-WH-3", amount: 999 });

  const result = await handleIncomingWebhook({ provider: "midtrans", eventId: `EV-WH-3-${RUN}`, eventType: "payment.success", payload }, prisma);
  assert.equal(result.httpStatus, 200);
  assert.equal(result.outcome.status, "PERMANENT_REJECTION");

  const evt = await prisma.paymentWebhookEvent.findUniqueOrThrow({
    where: { provider_eventId: { provider: "midtrans", eventId: `EV-WH-3-${RUN}` } },
  });
  assert.equal(evt.processed, true);
  assert.ok(evt.errorMessage?.includes("PERMANENT_REJECTION"));
});

test("Webhook: invalid JSON payload is a permanent rejection", async () => {
  const result = await handleIncomingWebhook({
    provider: "xendit",
    eventId: `EV-BAD-${RUN}`,
    eventType: "payment.success",
    payload: "not-json",
  }, prisma);
  assert.equal(result.httpStatus, 200);
  assert.equal(result.outcome.status, "PERMANENT_REJECTION");
});
