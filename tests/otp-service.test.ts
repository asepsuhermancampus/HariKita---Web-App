import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createTestDb, seedOtpCode, type TestDb } from "./helpers/test-db";
import type { PrismaClient } from "@prisma/client";
import { generateOtp, issueOtp, checkSendAllowed } from "../src/server/services/otp-service";

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
  await prisma.otpCode.deleteMany();
});

test("generateOtp returns 6-digit string", () => {
  const code = generateOtp();
  assert.match(code, /^\d{6}$/);
});

test("issueOtp creates a PENDING record with 5-minute expiry", async () => {
  const { otpId, code } = await issueOtp("a@b.com", "REGISTER", prisma);
  const row = await prisma.otpCode.findUnique({ where: { id: otpId } });
  assert.ok(row);
  assert.equal(row!.status, "PENDING");
  assert.match(code, /^\d{6}$/);
  const ttl = row!.expiresAt.getTime() - row!.createdAt.getTime();
  assert.ok(ttl >= 290000 && ttl <= 310000, `ttl=${ttl}`);
});

test("checkSendAllowed throws OTP_COOLDOWN while locked", async () => {
  await seedOtpCode(prisma, {
    email: "lock@b.com",
    status: "LOCKED",
    lockedUntil: new Date(Date.now() + 5 * 60 * 1000),
  });
  await assert.rejects(
    () => checkSendAllowed("lock@b.com", prisma),
    /OTP_COOLDOWN/
  );
});

test("checkSendAllowed passes when lock expired", async () => {
  await seedOtpCode(prisma, {
    email: "free@b.com",
    status: "LOCKED",
    lockedUntil: new Date(Date.now() - 1000),
  });
  await checkSendAllowed("free@b.com", prisma); // tidak throw
});
