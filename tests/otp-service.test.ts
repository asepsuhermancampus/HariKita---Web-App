import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createTestDb, seedOtpCode, type TestDb } from "./helpers/test-db";
import type { PrismaClient } from "@prisma/client";
import { generateOtp, issueOtp, checkSendAllowed, verifyOtp, countDailyAttempts, assertDailyLimit, assertPinChangeAllowed } from "../src/server/services/otp-service";
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

test("verifyOtp marks VERIFIED for correct code", async () => {
  await seedOtpCode(prisma, { email: "v@b.com", code: "654321", status: "PENDING" });
  const res = await verifyOtp({ email: "v@b.com", purpose: "REGISTER", code: "654321" }, prisma);
  const row = await prisma.otpCode.findUnique({ where: { id: res.otpId } });
  assert.equal(row!.status, "VERIFIED");
  assert.ok(row!.verifiedAt);
});

test("verifyOtp increments attempts and locks after 3 wrong", async () => {
  await seedOtpCode(prisma, { email: "w@b.com", code: "111111", status: "PENDING", attempts: 2 });
  await assert.rejects(
    () => verifyOtp({ email: "w@b.com", purpose: "REGISTER", code: "999999" }, prisma),
    /OTP_LOCKED/
  );
  const row = await prisma.otpCode.findFirst({ where: { email: "w@b.com" } });
  assert.equal(row!.status, "LOCKED");
  assert.equal(row!.attempts, 3);
  assert.ok(row!.lockedUntil && row!.lockedUntil.getTime() > Date.now());
});

test("verifyOtp throws OTP_INVALID (not lock) on first wrong attempt", async () => {
  await seedOtpCode(prisma, { email: "w2@b.com", code: "111111", status: "PENDING", attempts: 0 });
  await assert.rejects(
    () => verifyOtp({ email: "w2@b.com", purpose: "REGISTER", code: "999999" }, prisma),
    /OTP_INVALID/
  );
  const row = await prisma.otpCode.findFirst({ where: { email: "w2@b.com" } });
  assert.equal(row!.attempts, 1);
  assert.equal(row!.status, "PENDING");
});

test("verifyOtp rejects expired code", async () => {
  await seedOtpCode(prisma, { email: "e@b.com", code: "222222", expiresAt: new Date(Date.now() - 1000) });
  await assert.rejects(
    () => verifyOtp({ email: "e@b.com", purpose: "REGISTER", code: "222222" }, prisma),
    /OTP_EXPIRED/
  );
});

test("assertDailyLimit throws at 9 attempts within WIB day", async () => {
  for (let i = 0; i < 3; i++) {
    await seedOtpCode(prisma, { email: "d@b.com", attempts: 3, createdAt: new Date() });
  }
  assert.equal(await countDailyAttempts("d@b.com", new Date(), prisma), 9);
  await assert.rejects(() => assertDailyLimit("d@b.com", prisma), /OTP_DAILY_LIMIT/);
});

test("assertPinChangeAllowed throws PIN_TOO_RECENT within 14 days", async () => {
  const user = await prisma.user.create({ data: { name: "U", phone: "081100000001", role: "CLIENT" } });
  await prisma.pinChangeLog.create({ data: { userId: user.id, changedAt: new Date(Date.now() - 3 * 86400000) } });
  await assert.rejects(() => assertPinChangeAllowed(user.id, prisma), /PIN_TOO_RECENT/);
});

test("assertPinChangeAllowed passes after 14 days", async () => {
  const user = await prisma.user.create({ data: { name: "V", phone: "081100000002", role: "CLIENT" } });
  await prisma.pinChangeLog.create({ data: { userId: user.id, changedAt: new Date(Date.now() - 15 * 86400000) } });
  await assertPinChangeAllowed(user.id, prisma); // tidak throw
});
