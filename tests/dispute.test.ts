import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import type { PrismaClient } from "@prisma/client";
import { createTestDb, seedClient, type TestDb } from "./helpers/test-db";
import {
  openDispute,
  reviewDispute,
  resolveDispute,
  listDisputes,
} from "../src/server/services/dispute-service";
import { DomainError } from "../src/server/services/errors";

let ctx: TestDb;
let prisma: PrismaClient;
let clientUserId = "";

before(async () => {
  ctx = await createTestDb();
  prisma = ctx.prisma;
  const c = await seedClient(prisma, "Dispute Client");
  clientUserId = c.userId;
});

after(async () => {
  await ctx.cleanup();
});

async function makeOrder(status: string) {
  const order = await prisma.order.create({
    data: {
      orderNumber: `HK-DS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: clientUserId,
      clientName: "Dispute Client",
      clientPhone: "0812",
      eventDate: new Date("2028-10-01T00:00:00+07:00"),
      totalAmount: 3_000_000,
      status,
    },
  });
  return order.id;
}

test("openDispute creates dispute and freezes order to DISPUTED", async () => {
  const orderId = await makeOrder("DP_PAID");
  const res = await openDispute(
    {
      orderId,
      openedBy: clientUserId,
      reason: "VENDOR_NO_SHOW",
      description: "Vendor tidak hadir pada sesi fitting.",
    },
    prisma
  );
  assert.equal(res.status, "OPEN");

  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  assert.equal(order.status, "DISPUTED");

  const history = await prisma.orderStatusHistory.findFirst({
    where: { orderId, toStatus: "DISPUTED" },
  });
  assert.ok(history);
});

test("openDispute rejects duplicate active dispute", async () => {
  const orderId = await makeOrder("IN_PROGRESS");
  await openDispute(
    { orderId, openedBy: clientUserId, reason: "QUALITY_MISMATCH", description: "x" },
    prisma
  );
  await assert.rejects(
    openDispute(
      { orderId, openedBy: clientUserId, reason: "CANCEL_REQUEST", description: "y" },
      prisma
    ),
    (e: unknown) => e instanceof DomainError
  );
});

test("openDispute rejects terminal order status", async () => {
  const orderId = await makeOrder("REFUNDED");
  await assert.rejects(
    openDispute(
      { orderId, openedBy: clientUserId, reason: "CANCEL_REQUEST", description: "z" },
      prisma
    ),
    (e: unknown) => e instanceof DomainError
  );
});

test("reviewDispute moves OPEN -> UNDER_REVIEW", async () => {
  const orderId = await makeOrder("COMPLETED");
  const { id } = await openDispute(
    { orderId, openedBy: clientUserId, reason: "QUALITY_MISMATCH", description: "d" },
    prisma
  );
  const reviewed = await reviewDispute(id, "admin-1", prisma);
  assert.equal(reviewed.status, "UNDER_REVIEW");
});

test("resolveDispute (approved) moves order to REFUND_PENDING", async () => {
  const orderId = await makeOrder("DP_PAID");
  const { id } = await openDispute(
    { orderId, openedBy: clientUserId, reason: "UNAUTHORIZED_EXTRA_FEE", description: "e" },
    prisma
  );
  const res = await resolveDispute(
    { disputeId: id, adminUserId: "admin-1", approved: true, resolution: "Refund disetujui" },
    prisma
  );
  assert.equal(res.status, "RESOLVED");
  assert.equal(res.orderStatus, "REFUND_PENDING");

  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  assert.equal(order.status, "REFUND_PENDING");
});

test("resolveDispute (rejected) restores order to operational status", async () => {
  const orderId = await makeOrder("DP_PAID");
  const { id } = await openDispute(
    { orderId, openedBy: clientUserId, reason: "QUALITY_MISMATCH", description: "f" },
    prisma
  );
  const res = await resolveDispute(
    { disputeId: id, adminUserId: "admin-1", approved: false, resolution: "Tidak terbukti" },
    prisma
  );
  assert.equal(res.status, "REJECTED");
  assert.equal(res.orderStatus, "IN_PROGRESS");
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  assert.equal(order.status, "IN_PROGRESS");
});

test("resolveDispute rejects already-final dispute", async () => {
  const orderId = await makeOrder("DP_PAID");
  const { id } = await openDispute(
    { orderId, openedBy: clientUserId, reason: "CANCEL_REQUEST", description: "g" },
    prisma
  );
  await resolveDispute(
    { disputeId: id, adminUserId: "admin-1", approved: true, resolution: "ok" },
    prisma
  );
  await assert.rejects(
    resolveDispute(
      { disputeId: id, adminUserId: "admin-1", approved: false, resolution: "again" },
      prisma
    ),
    (e: unknown) => e instanceof DomainError
  );
});

test("listDisputes returns disputes with order info", async () => {
  const all = await listDisputes(undefined, prisma);
  assert.ok(all.length >= 1);
  assert.ok(all[0].order.orderNumber);
});
