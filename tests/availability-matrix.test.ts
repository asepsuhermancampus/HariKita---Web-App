import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import type { PrismaClient } from "@prisma/client";
import { createTestDb, type TestDb } from "./helpers/test-db";
import { claimHoldSlot, setBlackoutDate, bookReservedSlots, verifyAndPromoteSlot } from "../src/server/services/availability-service";
import { getStartOfDayWIB } from "../src/lib/date-utils";

/**
 * Availability matrix behavior — menguji status slot efektif yang dipakai
 * oleh checkAvailabilityMatrixAction (tanpa sesi).
 */

let ctx: TestDb;
let prisma: PrismaClient;
let vendorId = "";

before(async () => {
  ctx = await createTestDb();
  prisma = ctx.prisma;
  const u = await prisma.user.create({
    data: { name: "Matrix Vendor", phone: `0817${Math.floor(Math.random() * 1e8).toString().padStart(8, "0")}`, role: "VENDOR" },
  });
  const v = await prisma.vendorProfile.create({
    data: { userId: u.id, businessName: "Matrix Vendor", category: "X", address: "Y" },
  });
  vendorId = v.id;
});

after(async () => {
  await ctx.cleanup();
});

async function slotStatus(date: string): Promise<string | null> {
  const slot = await prisma.vendorAvailability.findUnique({
    where: { vendorId_date: { vendorId, date: getStartOfDayWIB(date) } },
  });
  return slot?.status ?? null;
}

test("no slot record means OPEN (available)", async () => {
  assert.equal(await slotStatus("2029-01-01"), null);
});

test("BLACKED_OUT marks the date unavailable", async () => {
  await setBlackoutDate({ vendorId, date: "2029-02-01" }, prisma);
  assert.equal(await slotStatus("2029-02-01"), "BLACKED_OUT");
});

test("BOOKED marks the date unavailable", async () => {
  const date = "2029-03-01";
  const hold = await claimHoldSlot({ vendorId, date }, prisma);
  // Butuh orderItem untuk promote; buat manual.
  const client = await prisma.user.create({
    data: { name: "C", phone: `0818${Math.floor(Math.random() * 1e8).toString().padStart(8, "0")}`, role: "CLIENT" },
  });
  const order = await prisma.order.create({
    data: { orderNumber: `HK-MX-${Date.now()}`, userId: client.id, clientName: "C", clientPhone: "0812", eventDate: getStartOfDayWIB(date), totalAmount: 1, status: "WAITING_DP" },
  });
  const item = await prisma.orderItem.create({
    data: { orderId: order.id, vendorId, categorySlug: "X", unitPrice: 1, subtotal: 1, status: "ACCEPTED" },
  });
  await verifyAndPromoteSlot({ vendorId, date, holdToken: hold.holdToken, orderItemId: item.id }, prisma);
  await bookReservedSlots([item.id], prisma);
  assert.equal(await slotStatus(date), "BOOKED");
});

test("active HELD marks the date unavailable", async () => {
  await claimHoldSlot({ vendorId, date: "2029-04-01", holdMinutes: 15 }, prisma);
  assert.equal(await slotStatus("2029-04-01"), "HELD");
});
