"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { runAction, requireSession, revalidate, type ActionResult } from "./_shared";
import { DomainError } from "@/server/services/errors";
import {
  generateReferralCode,
  requestWithdrawal,
  resolveWithdrawal,
} from "@/server/services/ambassador-service";

/**
 * HariKita - Brand Ambassador Server Actions
 *
 * Aksi self-service BA (pengajuan penarikan saldo) dan aksi admin (pembuatan
 * akun BA, pengaturan komisi/status, resolusi penarikan). Seluruh aksi
 * role-guarded dan memakai kosakata error kanonik dari `src/types/errors.ts`.
 */

/** Auth guard: hanya sesi dengan role ADMIN yang boleh melanjutkan. */
async function requireAdmin() {
  const session = await requireSession();
  if (session.role !== "ADMIN") {
    throw new DomainError("UNAUTHORIZED_ORDER_ACCESS", "Hanya admin yang boleh melakukan aksi ini.");
  }
  return session;
}

/** Auth guard: hanya BA yang memiliki profil yang boleh melanjutkan. */
async function requireAmbassador() {
  const session = await requireSession();
  if (session.role !== "BA") {
    throw new DomainError("UNAUTHORIZED_ORDER_ACCESS", "Hanya Brand Ambassador yang boleh melakukan aksi ini.");
  }
  const ba = await prisma.brandAmbassador.findUnique({ where: { userId: session.userId } });
  if (!ba) throw new DomainError("BA_NOT_FOUND", "Profil BA tidak ditemukan.");
  return ba;
}

/** Mengajukan penarikan saldo oleh BA yang login (nominal ditahan saat PENDING). */
export async function requestWithdrawalAction(input: {
  amount: number;
  bankName?: string;
  bankAccount?: string;
  bankHolder?: string;
}): Promise<ActionResult<{ withdrawalId: string }>> {
  return runAction(async () => {
    const ba = await requireAmbassador();
    const res = await requestWithdrawal({ ambassadorId: ba.id, ...input });
    revalidate(["/dashboard/ba", "/dashboard/ba/dompet"]);
    return res;
  });
}

/** Menyelesaikan penarikan PENDING (PAID / REJECTED). Hanya admin. */
export async function resolveWithdrawalAction(input: {
  withdrawalId: string;
  decision: "PAID" | "REJECTED";
}): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    await requireAdmin();
    await resolveWithdrawal(input.withdrawalId, input.decision);
    revalidate(["/admin/ba"]);
    return { id: input.withdrawalId };
  });
}

/** Mengatur persentase komisi seorang BA. Hanya admin. */
export async function setAmbassadorCommissionAction(input: {
  ambassadorId: string;
  commissionPct: number;
}): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    await requireAdmin();
    if (
      !Number.isFinite(input.commissionPct) ||
      input.commissionPct < 0 ||
      input.commissionPct > 100
    ) {
      throw new DomainError("INVALID_AMBASSADOR_INPUT", "Persen komisi harus antara 0 sampai 100.");
    }
    await prisma.brandAmbassador.update({
      where: { id: input.ambassadorId },
      data: { commissionPct: input.commissionPct },
    });
    revalidate(["/admin/ba"]);
    return { id: input.ambassadorId };
  });
}

/** Mengaktifkan / menonaktifkan seorang BA. Hanya admin. */
export async function setAmbassadorActiveAction(input: {
  ambassadorId: string;
  isActive: boolean;
}): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    await requireAdmin();
    await prisma.brandAmbassador.update({
      where: { id: input.ambassadorId },
      data: { isActive: input.isActive },
    });
    revalidate(["/admin/ba"]);
    return { id: input.ambassadorId };
  });
}

/** Membuat akun BA baru (User role BA + profil BrandAmbassador). Hanya admin. */
export async function createAmbassadorAction(input: {
  name: string;
  phone: string;
  pin: string;
  displayName: string;
  commissionPct?: number;
}): Promise<ActionResult<{ ambassadorId: string; referralCode: string }>> {
  return runAction(async () => {
    await requireAdmin();
    if (!/^\d{6}$/.test(input.pin)) {
      throw new DomainError("INVALID_AMBASSADOR_INPUT", "PIN harus 6 digit angka.");
    }
    if (
      input.commissionPct !== undefined &&
      (!Number.isFinite(input.commissionPct) || input.commissionPct < 0 || input.commissionPct > 100)
    ) {
      throw new DomainError("INVALID_AMBASSADOR_INPUT", "Persen komisi harus antara 0 sampai 100.");
    }
    const existing = await prisma.user.findUnique({ where: { phone: input.phone } });
    if (existing) throw new DomainError("INVALID_AMBASSADOR_INPUT", "Nomor HP sudah terdaftar.");

    const hashedPin = await bcrypt.hash(input.pin, 10);

    // Kode unik (retry beberapa kali bila collision).
    let referralCode = generateReferralCode("Kebumen");
    for (let i = 0; i < 5; i++) {
      const clash = await prisma.brandAmbassador.findUnique({ where: { referralCode } });
      if (!clash) break;
      referralCode = generateReferralCode("Kebumen");
    }

    const user = await prisma.user.create({
      data: { name: input.name, phone: input.phone, pin: hashedPin, role: "BA" },
    });
    const ba = await prisma.brandAmbassador.create({
      data: {
        userId: user.id,
        referralCode,
        displayName: input.displayName,
        phone: input.phone,
        commissionPct: input.commissionPct ?? 5.0,
      },
    });
    revalidate(["/admin/ba"]);
    return { ambassadorId: ba.id, referralCode };
  });
}
