import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { DomainError } from "./errors";

export type OtpTx = Prisma.TransactionClient;
export type OtpPurpose = "REGISTER" | "RESET_PIN" | "ADMIN_EDIT_UNLOCK";

const OTP_TTL_MS = 5 * 60 * 1000; // 5 menit
const MAX_ATTEMPTS = 3; // salah maksimal 3x
const LOCK_MS = 10 * 60 * 1000; // cooldown 10 menit
const DAILY_LIMIT = 9; // maksimal input OTP / hari (WIB)
const PIN_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000; // 14 hari

/** 6-digit acak aman (crypto). */
export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

/** Awal hari WIB (UTC+7) dari sebuah tanggal. */
export function WIB_DAY_START(date: Date): Date {
  const WIB_OFFSET = 7 * 60 * 60 * 1000;
  const wib = new Date(date.getTime() + WIB_OFFSET);
  wib.setUTCHours(0, 0, 0, 0);
  return new Date(wib.getTime() - WIB_OFFSET);
}

/** Cek apakah pengiriman OTP boleh dilakukan (cooldown lock). */
export async function checkSendAllowed(email: string, tx?: OtpTx): Promise<void> {
  const db = tx ?? prisma;
  const locked = await db.otpCode.findFirst({
    where: {
      email: email.toLowerCase(),
      lockedUntil: { gt: new Date() },
    },
    orderBy: { lockedUntil: "desc" },
  });
  if (locked) {
    throw new DomainError(
      "OTP_COOLDOWN",
      "Terlalu banyak percobaan. Coba kirim ulang dalam 10 menit."
    );
  }
}

/** Membuat OTP baru (PENDING) untuk email+purpose. */
export async function issueOtp(
  email: string,
  purpose: OtpPurpose,
  tx?: OtpTx
): Promise<{ otpId: string; code: string }> {
  const db = tx ?? prisma;
  await checkSendAllowed(email, db);
  const code = generateOtp();
  const codeHash = await bcrypt.hash(code, 10);
  const row = await db.otpCode.create({
    data: {
      email: email.toLowerCase(),
      codeHash,
      purpose,
      status: "PENDING",
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });
  return { otpId: row.id, code };
}

/** Total percobaan input OTP (attempts) per-email pada hari WIB berjalan. */
export async function countDailyAttempts(
  email: string,
  now: Date = new Date(),
  tx?: OtpTx
): Promise<number> {
  const db = tx ?? prisma;
  const start = WIB_DAY_START(now);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const agg = await db.otpCode.aggregate({
    where: {
      email: email.toLowerCase(),
      createdAt: { gte: start, lt: end },
    },
    _sum: { attempts: true },
  });
  return agg._sum.attempts ?? 0;
}

/** Throw OTP_DAILY_LIMIT bila sudah mencapai batas harian. */
export async function assertDailyLimit(email: string, tx?: OtpTx): Promise<void> {
  const total = await countDailyAttempts(email, new Date(), tx);
  if (total >= DAILY_LIMIT) {
    throw new DomainError(
      "OTP_DAILY_LIMIT",
      "Batas percobaan harian tercapai. Coba lagi besok."
    );
  }
}

/** Verifikasi kode OTP. Set VERIFIED bila cocok; naikkan attempts bila salah. */
export async function verifyOtp(
  input: { email: string; purpose: OtpPurpose; code: string },
  tx?: OtpTx
): Promise<{ otpId: string }> {
  const db = tx ?? prisma;
  const email = input.email.toLowerCase();

  await assertDailyLimit(email, db);

  const row = await db.otpCode.findFirst({
    where: { email, purpose: input.purpose, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
  if (!row) throw new DomainError("OTP_NOT_FOUND", "Kode OTP tidak ditemukan. Kirim ulang.");

  if (row.expiresAt.getTime() < Date.now()) {
    await db.otpCode.update({ where: { id: row.id }, data: { status: "LOCKED" } });
    throw new DomainError("OTP_EXPIRED", "Kode OTP sudah kedaluwarsa. Kirim ulang.");
  }
  if (row.status === "LOCKED") {
    throw new DomainError("OTP_LOCKED", "Kode OTP terkunci. Tunggu 10 menit.");
  }

  const ok = await bcrypt.compare(input.code, row.codeHash);
  if (!ok) {
    const attempts = row.attempts + 1;
    const reached = attempts >= MAX_ATTEMPTS;
    await db.otpCode.update({
      where: { id: row.id },
      data: {
        attempts,
        status: reached ? "LOCKED" : "PENDING",
        lockedUntil: reached ? new Date(Date.now() + LOCK_MS) : null,
      },
    });
    if (reached) {
      throw new DomainError("OTP_LOCKED", "Terlalu banyak salah. Tunggu 10 menit.");
    }
    throw new DomainError("OTP_INVALID", "Kode OTP salah.");
  }

  await db.otpCode.update({
    where: { id: row.id },
    data: { status: "VERIFIED", verifiedAt: new Date() },
  });
  return { otpId: row.id };
}

/** Throw PIN_TOO_RECENT bila PIN terakhir diubah < 14 hari lalu. */
export async function assertPinChangeAllowed(userId: string, tx?: OtpTx): Promise<void> {
  const db = tx ?? prisma;
  const last = await db.pinChangeLog.findFirst({
    where: { userId },
    orderBy: { changedAt: "desc" },
  });
  if (last && Date.now() - last.changedAt.getTime() < PIN_COOLDOWN_MS) {
    throw new DomainError(
      "PIN_TOO_RECENT",
      "PIN hanya dapat diubah setiap 14 hari sekali."
    );
  }
}

/** Helper internal: konfigurasi untuk test. */
export const _otpConfig = { OTP_TTL_MS, MAX_ATTEMPTS, LOCK_MS, DAILY_LIMIT, PIN_COOLDOWN_MS };