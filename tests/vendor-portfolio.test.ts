import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import type { PrismaClient } from "@prisma/client";
import { createTestDb, seedVendorWithPackage, type TestDb } from "./helpers/test-db";
import { detectOffPlatformContact } from "../src/lib/content-guard";

/**
 * Vendor portfolio & inbox domain tests (DB-level behavior).
 * Server Actions require a session; di sini kami menguji perilaku model DB +
 * util content-guard yang sama dipakai action.
 */

let ctx: TestDb;
let prisma: PrismaClient;
let vendorId = "";
let vendorName = "";

before(async () => {
  ctx = await createTestDb();
  prisma = ctx.prisma;
  const seeded = await seedVendorWithPackage(prisma, {
    category: "Dokumentasi Foto-Video",
    businessName: `Portfolio Vendor ${Date.now()}`,
    price: 4_000_000,
  });
  vendorId = seeded.vendorId;
  vendorName = `Portfolio Vendor ${Date.now()}`;
  // Set the actual business name (helper used a random suffix already stored).
  const v = await prisma.vendorProfile.findUniqueOrThrow({ where: { id: vendorId } });
  vendorName = v.businessName;
});

after(async () => {
  await ctx.cleanup();
});

test("VendorPortfolio: create + read back with style tags", async () => {
  const created = await prisma.vendorPortfolio.create({
    data: {
      vendorId,
      title: "Sunset Menganti",
      locationTag: "Pantai Menganti, Ayah",
      categoryTag: "Outdoor Pre-wedding",
      styleTags: JSON.stringify(["Sunset", "Cinematic"]),
      caption: "Momen golden hour di tebing karst.",
      imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552",
      likes: 12,
    },
  });

  const found = await prisma.vendorPortfolio.findUniqueOrThrow({ where: { id: created.id } });
  assert.equal(found.title, "Sunset Menganti");
  assert.deepEqual(JSON.parse(found.styleTags ?? "[]"), ["Sunset", "Cinematic"]);
  assert.equal(found.isPublished, true);
});

test("VendorPortfolio: cascade delete when vendor removed", async () => {
  // Buat vendor sementara + post.
  const u = await prisma.user.create({
    data: { name: "Temp Vendor", phone: `0815${Math.floor(Math.random() * 1e8).toString().padStart(8, "0")}`, role: "VENDOR" },
  });
  const v = await prisma.vendorProfile.create({
    data: { userId: u.id, businessName: "Temp Vendor", category: "X", address: "Y" },
  });
  await prisma.vendorPortfolio.create({
    data: { vendorId: v.id, title: "Post", imageUrl: "http://x" },
  });

  await prisma.vendorProfile.delete({ where: { id: v.id } });
  const remaining = await prisma.vendorPortfolio.count({ where: { vendorId: v.id } });
  assert.equal(remaining, 0, "portfolio harus terhapus cascade");
});

test("content-guard blocks off-platform contact in portfolio caption", () => {
  const res = detectOffPlatformContact("Booking via wa 0812-3456-7890 ya");
  assert.equal(res.isViolation, true);
  assert.ok(res.cleanText.includes("DISENSOR"));
});

test("content-guard allows clean caption", () => {
  const res = detectOffPlatformContact("Sesi prewedding sunset di Pantai Menganti yang estetik.");
  assert.equal(res.isViolation, false);
});

test("VendorInbox: order items are scoped to a vendor", async () => {
  // Buat order + item untuk vendor ini.
  const client = await prisma.user.create({
    data: { name: "Inbox Client", phone: `0816${Math.floor(Math.random() * 1e8).toString().padStart(8, "0")}`, role: "CLIENT" },
  });
  const order = await prisma.order.create({
    data: {
      orderNumber: `HK-IN-${Date.now()}`,
      userId: client.id,
      clientName: "Inbox Client",
      clientPhone: "0812",
      eventDate: new Date("2028-09-01T00:00:00+07:00"),
      totalAmount: 4_000_000,
      status: "PENDING_CONFIRMATION",
    },
  });
  await prisma.orderItem.create({
    data: {
      orderId: order.id,
      vendorId,
      categorySlug: "Dokumentasi Foto-Video",
      serviceName: "Dokumentasi Foto-Video",
      packageName: "Liputan Hari H",
      vendorNameSnapshot: vendorName,
      unitPrice: 4_000_000,
      subtotal: 4_000_000,
      status: "PENDING",
    },
  });

  const items = await prisma.orderItem.findMany({ where: { vendorId } });
  assert.ok(items.length >= 1);
  assert.equal(items[0].status, "PENDING");
});
