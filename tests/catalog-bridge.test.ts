import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import type { PrismaClient } from "@prisma/client";
import { createTestDb, type TestDb } from "./helpers/test-db";
import { resolveCatalogItem, resolveCatalogItems } from "../src/server/services/catalog-bridge";
import { MULTI_VENDOR_CATALOG } from "../src/data/multi-vendor-catalog";
import { claimHoldSlot } from "../src/server/services/availability-service";
import { createOrder, processVendorDecision } from "../src/server/services/order-service";
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

// Ambil vendor & paket katalog pertama untuk dijadikan basis uji.
const CATALOG_VENDOR = MULTI_VENDOR_CATALOG[0];
const CATALOG_PACKAGE = CATALOG_VENDOR.packages[0];

/** Seed VendorProfile + ServicePackage yang namanya cocok dengan katalog. */
async function seedMatchingVendor() {
  const phone = `0812${Math.floor(Math.random() * 1e8).toString().padStart(8, "0")}`;
  const user = await prisma.user.create({
    data: { name: CATALOG_VENDOR.name, phone, role: "VENDOR" },
  });
  const vendor = await prisma.vendorProfile.create({
    data: {
      userId: user.id,
      businessName: CATALOG_VENDOR.name,
      category: CATALOG_VENDOR.categoryTitle,
      address: "Jl. Test, Kebumen",
    },
  });
  const pkg = await prisma.servicePackage.create({
    data: {
      vendorId: vendor.id,
      category: CATALOG_VENDOR.categoryTitle,
      name: CATALOG_PACKAGE.name,
      description: CATALOG_PACKAGE.desc,
      basePrice: CATALOG_PACKAGE.price,
      unitType: "all_in",
    },
  });
  return { userId: user.id, vendorId: vendor.id, packageId: pkg.id };
}

test("catalog-bridge resolves a catalog vendor+package to DB records via name match", async () => {
  const seeded = await seedMatchingVendor();
  const resolved = await resolveCatalogItem(CATALOG_VENDOR.id, CATALOG_PACKAGE.id, prisma);

  assert.equal(resolved.vendorId, seeded.vendorId);
  assert.equal(resolved.unitPrice, CATALOG_PACKAGE.price);
  assert.equal(resolved.vendorName, CATALOG_VENDOR.name);
});

test("catalog-bridge rejects unknown catalog vendor", async () => {
  await assert.rejects(
    resolveCatalogItem("v_nonexistent", "pkg_x", prisma),
    (e: unknown) => e instanceof DomainError && e.code === "ITEM_PACKAGE_MISMATCH"
  );
});

test("catalog-bridge falls back to v1 marker package when present", async () => {
  // Use a dedicated catalog package so the marker does not contaminate
  // other tests that rely on name-matching resolution.
  const markerVendor = MULTI_VENDOR_CATALOG[3];
  const markerPackage = markerVendor.packages[0];

  const u = await prisma.user.create({
    data: { name: markerVendor.name, phone: `0814${Math.floor(Math.random() * 1e8).toString().padStart(8, "0")}`, role: "VENDOR" },
  });
  const v = await prisma.vendorProfile.create({
    data: { userId: u.id, businessName: markerVendor.name, category: markerVendor.categoryTitle, address: "Jl. Marker" },
  });

  const markerId = `catalog:pkg:${markerPackage.id}`;
  const marker = await prisma.servicePackage.create({
    data: {
      id: markerId,
      vendorId: v.id,
      category: markerVendor.categoryTitle,
      name: "Marker Package",
      description: "marker",
      basePrice: 9_999_000,
      unitType: "all_in",
    },
  });
  const resolved = await resolveCatalogItem(markerVendor.id, markerPackage.id, prisma);
  assert.equal(resolved.packageId, marker.id);
  assert.equal(resolved.unitPrice, 9_999_000);
});

test("catalog-bridge resolves many items preserving order", async () => {
  await seedMatchingVendor();
  const vendor2 = MULTI_VENDOR_CATALOG[1];
  const pkg2 = vendor2.packages[0];
  // Seed the second catalog vendor too.
  const u2 = await prisma.user.create({
    data: { name: vendor2.name, phone: `0813${Math.floor(Math.random() * 1e8).toString().padStart(8, "0")}`, role: "VENDOR" },
  });
  const v2 = await prisma.vendorProfile.create({
    data: { userId: u2.id, businessName: vendor2.name, category: vendor2.categoryTitle, address: "Jl. Test 2" },
  });
  await prisma.servicePackage.create({
    data: {
      vendorId: v2.id,
      category: vendor2.categoryTitle,
      name: pkg2.name,
      description: pkg2.desc,
      basePrice: pkg2.price,
      unitType: "all_in",
    },
  });

  const resolved = await resolveCatalogItems(
    [
      { vendorId: CATALOG_VENDOR.id, packageId: CATALOG_PACKAGE.id },
      { vendorId: vendor2.id, packageId: pkg2.id },
    ],
    prisma
  );
  assert.equal(resolved.length, 2);
  assert.equal(resolved[0].unitPrice, CATALOG_PACKAGE.price);
  assert.equal(resolved[1].unitPrice, pkg2.price);
});

test("end-to-end transport flow: resolve → hold → createOrder persists to DB", async () => {
  await seedMatchingVendor();
  const eventDate = "2028-01-15";

  // Resolve (as createOrderWithAutoHoldAction does).
  const resolved = await resolveCatalogItem(CATALOG_VENDOR.id, CATALOG_PACKAGE.id, prisma);

  // Claim hold (as the action does).
  const hold = await claimHoldSlot({ vendorId: resolved.vendorId, date: eventDate }, prisma);

  // Create order (service layer).
  const result = await createOrder(
    {
      eventDate,
      clientName: "Test Transport",
      clientPhone: "081234567890",
      items: [
        {
          servicePackageId: resolved.packageId,
          quantity: 1,
          holdToken: hold.holdToken,
        },
      ],
    },
    prisma
  );

  assert.ok(result.orderId);
  assert.equal(result.totalAmount, CATALOG_PACKAGE.price);

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: result.orderId },
    include: { items: true },
  });
  assert.equal(order.status, "PENDING_CONFIRMATION");
  assert.equal(order.items.length, 1);
  assert.equal(order.items[0].unitPrice, CATALOG_PACKAGE.price);

  // Slot is RESERVED after order creation.
  const slot = await prisma.vendorAvailability.findFirst({
    where: { orderItemId: order.items[0].id },
  });
  assert.equal(slot?.status, "RESERVED");
});

test("transport flow rejects order creation without a valid hold token", async () => {
  await seedMatchingVendor();
  const resolved = await resolveCatalogItem(CATALOG_VENDOR.id, CATALOG_PACKAGE.id, prisma);

  await assert.rejects(
    createOrder(
      {
        eventDate: "2028-02-20",
        clientName: "No Hold",
        clientPhone: "0812",
        items: [{ servicePackageId: resolved.packageId, quantity: 1, holdToken: "bogus-token" }],
      },
      prisma
    )
  );
});
