import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { DomainError } from "./errors";

export type OtpTx = Prisma.TransactionClient;
export type OtpPurpose = "REGISTER" | "RESET_PIN";

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

/** Helper internal: konfigurasi untuk test. */
export const _otpConfig = { OTP_TTL_MS, MAX_ATTEMPTS, LOCK_MS, DAILY_LIMIT, PIN_COOLDOWN_MS };
