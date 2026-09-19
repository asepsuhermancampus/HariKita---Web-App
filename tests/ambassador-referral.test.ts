import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createTestDb, seedAmbassador, type TestDb } from "./helpers/test-db";
import type { PrismaClient } from "@prisma/client";
import {
  generateReferralCode,
  resolveReferral,
  attributeVendorToReferral,
} from "../src/server/services/ambassador-service";

let ctx: TestDb;
let prisma: PrismaClient;

before(async () => {
  ctx = await createTestDb();
  prisma = ctx.prisma;
});

after(async () => {
  await ctx.cleanup();
});

test("generateReferralCode has BA-<CITY>-<4> shape", () => {
  const code = generateReferralCode("Kebumen");
  assert.match(code, /^BA-[A-Z]+-[A-Z0-9]{4}$/);
});

test("resolveReferral returns ambassadorId for valid active code", async () => {
  const ba = await seedAmbassador(prisma, { isActive: true });
  const result = await resolveReferral(ba.referralCode, prisma);
  assert.ok(result);
  assert.equal(result!.ambassadorId, ba.ambassadorId);
});

test("resolveReferral returns null for empty or unknown code", async () => {
  assert.equal(await resolveReferral("", prisma), null);
  assert.equal(await resolveReferral(null, prisma), null);
  assert.equal(await resolveReferral("BA-NOPE-XXXX", prisma), null);
});

test("resolveReferral returns null for inactive ambassador", async () => {
  const ba = await seedAmbassador(prisma, { isActive: false });
  const result = await resolveReferral(ba.referralCode, prisma);
  assert.equal(result, null);
});

test("attributeVendorToReferral sets recruitedById for valid code", async () => {
  const ba = await seedAmbassador(prisma, { isActive: true });
  const vendorUser = await prisma.user.create({
    data: { name: "Vendor Baru", phone: `0877${Math.floor(Math.random()*1e8).toString().padStart(8,"0")}`, role: "VENDOR" },
  });
  const vendor = await prisma.vendorProfile.create({
    data: { userId: vendorUser.id, businessName: "Vendor Baru", category: "katering", address: "Kebumen" },
  });

  await attributeVendorToReferral(vendor.id, ba.referralCode, prisma);
  const updated = await prisma.vendorProfile.findUnique({ where: { id: vendor.id } });
  assert.equal(updated!.recruitedById, ba.ambassadorId);
});

test("attributeVendorToReferral ignores invalid code", async () => {
  const vendorUser = await prisma.user.create({
    data: { name: "Vendor B", phone: `0878${Math.floor(Math.random()*1e8).toString().padStart(8,"0")}`, role: "VENDOR" },
  });
  const vendor = await prisma.vendorProfile.create({
    data: { userId: vendorUser.id, businessName: "Vendor B", category: "katering", address: "Kebumen" },
  });
  await attributeVendorToReferral(vendor.id, "BA-NOPE-XXXX", prisma);
  const updated = await prisma.vendorProfile.findUnique({ where: { id: vendor.id } });
  assert.equal(updated!.recruitedById, null);
});
