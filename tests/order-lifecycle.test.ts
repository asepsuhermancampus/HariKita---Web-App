import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import type { PrismaClient } from "@prisma/client";
import { createTestDb, seedClient, type TestDb } from "./helpers/test-db";
import {
  generatePhysicalSessions,
  generateEventRundown,
  generateOperationalArtifacts,
} from "../src/server/services/order-lifecycle";

let ctx: TestDb;
let prisma: PrismaClient;
let seededVendorId = "";

before(async () => {
  ctx = await createTestDb();
  prisma = ctx.prisma;

  // Seed minimal vendor agar FK orderItem.vendorId valid.
  const u = await prisma.user.create({
    data: {
      name: "Lifecycle Vendor",
      phone: `0812${Math.floor(Math.random() * 1e8).toString().padStart(8, "0")}`,
      role: "VENDOR",
    },
  });
  const v = await prisma.vendorProfile.create({
    data: {
      userId: u.id,
      businessName: "Lifecycle Vendor",
      category: "Busana Pengantin & Fitting",
      address: "Jl. Test",
    },
  });
  seededVendorId = v.id;
});

after(async () => {
  await ctx.cleanup();
});

/** Membuat order uji dengan item tertentu. */
async function seedOrderWithItems(
  items: Array<{ categorySlug: string; packageName: string; subtotal: number }>
) {
  const client = await seedClient(prisma, "Jadwal Client");
  const order = await prisma.order.create({
    data: {
      orderNumber: `HK-JD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: client.userId,
      clientName: "Jadwal",
      clientPhone: "0812",
      eventDate: new Date("2028-08-20T00:00:00+07:00"),
      totalAmount: items.reduce((a, i) => a + i.subtotal, 0),
      status: "DP_PAID",
    },
  });
  for (const it of items) {
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        vendorId: seededVendorId,
        categorySlug: it.categorySlug,
        serviceName: it.categorySlug,
        packageName: it.packageName,
        vendorNameSnapshot: "Mitra Uji",
        unitPrice: it.subtotal,
        subtotal: it.subtotal,
        status: "ACCEPTED",
      },
    });
  }
  return order.id;
}

test("generatePhysicalSessions creates fitting sessions for busana category", async () => {
  const orderId = await seedOrderWithItems([
    { categorySlug: "Busana Pengantin & Fitting", packageName: "Kebaya Perdana", subtotal: 2_800_000 },
  ]);

  const created = await generatePhysicalSessions(orderId, prisma);
  assert.equal(created, 2); // FIRST_FITTING + FINAL_FITTING

  const sessions = await prisma.physicalSession.findMany({ where: { orderId } });
  assert.equal(sessions.length, 2);
  const types = sessions.map((s) => s.type).sort();
  assert.deepEqual(types, ["FINAL_FITTING", "FIRST_FITTING"]);
});

test("generatePhysicalSessions is idempotent (no duplicates)", async () => {
  const orderId = await seedOrderWithItems([
    { categorySlug: "busana", packageName: "Kebaya", subtotal: 1_000_000 },
  ]);

  const first = await generatePhysicalSessions(orderId, prisma);
  const second = await generatePhysicalSessions(orderId, prisma);
  assert.equal(first, 2);
  assert.equal(second, 0); // tidak ada duplikat

  const count = await prisma.physicalSession.count({ where: { orderId } });
  assert.equal(count, 2);
});

test("generatePhysicalSessions creates test food for katering", async () => {
  const orderId = await seedOrderWithItems([
    { categorySlug: "katering", packageName: "Prasmanan 200 Pax", subtotal: 5_000_000 },
  ]);
  const created = await generatePhysicalSessions(orderId, prisma);
  assert.equal(created, 1);
  const sessions = await prisma.physicalSession.findMany({ where: { orderId } });
  assert.equal(sessions[0].type, "TEST_FOOD");
});

test("generateEventRundown builds rundown with base + per-item rows", async () => {
  const orderId = await seedOrderWithItems([
    { categorySlug: "mua", packageName: "Soft Glam", subtotal: 2_000_000 },
    { categorySlug: "foto", packageName: "Liputan 4K", subtotal: 4_200_000 },
  ]);

  const rows = await generateEventRundown(orderId, prisma);
  // 2 base rows (akad, resepsi) + 2 item rows.
  assert.equal(rows, 4);

  const stored = await prisma.eventRundown.findMany({ where: { orderId }, orderBy: { sortOrder: "asc" } });
  assert.equal(stored.length, 4);
  assert.ok(stored[0].activity.includes("Akad"));
});

test("generateEventRundown is idempotent (replaces, no growth)", async () => {
  const orderId = await seedOrderWithItems([
    { categorySlug: "mua", packageName: "Glam", subtotal: 1_000_000 },
  ]);
  await generateEventRundown(orderId, prisma);
  await generateEventRundown(orderId, prisma);
  const count = await prisma.eventRundown.count({ where: { orderId } });
  assert.equal(count, 3); // 2 base + 1 item, tidak menumpuk
});

test("generateOperationalArtifacts combines sessions + rundown", async () => {
  const orderId = await seedOrderWithItems([
    { categorySlug: "busana", packageName: "Kebaya", subtotal: 2_000_000 },
    { categorySlug: "katering", packageName: "Prasmanan", subtotal: 3_000_000 },
  ]);
  const result = await generateOperationalArtifacts(orderId, prisma);
  assert.equal(result.sessions, 3); // 2 fitting + 1 test food
  assert.ok(result.rundownRows >= 4);
});
