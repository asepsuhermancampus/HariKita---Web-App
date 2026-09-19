import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createTestDb, seedAmbassador, type TestDb } from "./helpers/test-db";
import type { PrismaClient } from "@prisma/client";
import {
  generateReferralCode,
  resolveReferral,
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
