"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { withTransactionRetry } from "@/lib/transaction-retry";
import { runAction, requireSession, revalidate, type ActionResult } from "./_shared";
import { DomainError } from "@/server/services/errors";
import { requireAdminCapability } from "@/server/auth/admin-guard";
import { recordAdminAudit } from "@/server/services/admin-audit-service";
import {
  generateReferralCode,
  requestWithdrawal,
  resolveWithdrawal,
} from "@/server/services/ambassador-service";
import { getPlatformSettings } from "@/server/services/platform-settings-service";

/**
 * HariKita - Brand Ambassador Server Actions
 *
 * Aksi self-service BA (pengajuan penarikan saldo) dan aksi admin (pembuatan
 * akun BA, pengaturan komisi/status, resolusi penarikan). Aksi admin memakai
 * capability guard (`requireAdminCapability`) + audit atomik; aksi self-service
 * BA tetap memakai `requireAmbassador`.
 */

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

/** Menyelesaikan penarikan PENDING (PAID / REJECTED). Hanya admin (MANAGE_FINANCE). */
export async function resolveWithdrawalAction(input: {
  withdrawalId: string;
  decision: "PAID" | "REJECTED";
}): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const actor = await requireAdminCapability("MANAGE_FINANCE");
    await withTransactionRetry(async (tx) => {
      await resolveWithdrawal(input.withdrawalId, input.decision, tx);
      await recordAdminAudit(
        {
          actor,
          capability: "MANAGE_FINANCE",
          action: "WITHDRAWAL_RESOLVED",
          targetType: "AmbassadorWithdrawal",
          targetId: input.withdrawalId,
          metadata: { decision: input.decision },
        },
        tx
      );
    });
    revalidate(["/admin/ba"]);
    return { id: input.withdrawalId };
  });
}

/** Mengatur persentase komisi seorang BA. Hanya admin (MANAGE_BA). */
export async function setAmbassadorCommissionAction(input: {
  ambassadorId: string;
  commissionPct: number;
}): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const actor = await requireAdminCapability("MANAGE_BA");
    if (
      !Number.isFinite(input.commissionPct) ||
      input.commissionPct < 0 ||
      input.commissionPct > 100
    ) {
      throw new DomainError("INVALID_AMBASSADOR_INPUT", "Persen komisi harus antara 0 sampai 100.");
    }
    await withTransactionRetry(async (tx) => {
      await tx.brandAmbassador.update({
        where: { id: input.ambassadorId },
        data: { commissionPct: input.commissionPct },
      });
      await recordAdminAudit(
        {
          actor,
          capability: "MANAGE_BA",
          action: "BA_COMMISSION_SET",
          targetType: "Ambassador",
          targetId: input.ambassadorId,
          metadata: { commissionPct: input.commissionPct },
        },
        tx
      );
    });
    revalidate(["/admin/ba"]);
    return { id: input.ambassadorId };
  });
}

/** Mengaktifkan / menonaktifkan seorang BA. Hanya admin (MANAGE_BA). */
export async function setAmbassadorActiveAction(input: {
  ambassadorId: string;
  isActive: boolean;
}): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const actor = await requireAdminCapability("MANAGE_BA");
    await withTransactionRetry(async (tx) => {
      await tx.brandAmbassador.update({
        where: { id: input.ambassadorId },
        data: { isActive: input.isActive },
      });
      await recordAdminAudit(
        {
          actor,
          capability: "MANAGE_BA",
          action: "BA_ACTIVE_CHANGED",
          targetType: "Ambassador",
          targetId: input.ambassadorId,
          metadata: { isActive: input.isActive },
        },
        tx
      );
    });
    revalidate(["/admin/ba"]);
    return { id: input.ambassadorId };
  });
}

/** Membuat akun BA baru (User role BA + profil BrandAmbassador). Hanya admin (MANAGE_BA). */
export async function createAmbassadorAction(input: {
  name: string;
  phone: string;
  pin: string;
  displayName: string;
  commissionPct?: number;
}): Promise<ActionResult<{ ambassadorId: string; referralCode: string }>> {
  return runAction(async () => {
    const actor = await requireAdminCapability("MANAGE_BA");
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
    const settings = await getPlatformSettings();

    const result = await withTransactionRetry(async (tx) => {
      // Kode unik (retry beberapa kali bila collision).
      let referralCode = generateReferralCode("Kebumen");
      for (let i = 0; i < 5; i++) {
        const clash = await tx.brandAmbassador.findUnique({ where: { referralCode } });
        if (!clash) break;
        referralCode = generateReferralCode("Kebumen");
      }

      const user = await tx.user.create({
        data: { name: input.name, phone: input.phone, pin: hashedPin, role: "BA" },
      });
      const ba = await tx.brandAmbassador.create({
        data: {
          userId: user.id,
          referralCode,
          displayName: input.displayName,
          phone: input.phone,
          commissionPct: input.commissionPct ?? settings.defaultBaCommissionPct,
        },
      });
      await recordAdminAudit(
        {
          actor,
          capability: "MANAGE_BA",
          action: "BA_CREATED",
          targetType: "Ambassador",
          targetId: ba.id,
          metadata: { referralCode },
        },
        tx
      );
      return { ambassadorId: ba.id, referralCode };
    });
    revalidate(["/admin/ba"]);
    return result;
  });
}
