import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { ambassadorJournalNumber, LEDGER_ACCOUNTS } from "./ledger-service";
import { DomainError } from "./errors";

export type AmbassadorTx = Prisma.TransactionClient;

/**
 * Deteksi pelanggaran unique constraint Prisma (P2002) pada field tertentu.
 * Mirror idiom module-private `isUniqueConstraintOn` di ledger-service.
 */
function isUniqueConstraintOn(error: unknown, ...fields: string[]): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: unknown; meta?: { target?: unknown } };
  if (e.code !== "P2002") return false;
  const target = e.meta?.target;
  const matches = (t: string) => fields.some((field) => t.includes(field));
  if (Array.isArray(target)) return target.some((t) => typeof t === "string" && matches(t));
  if (typeof target === "string") return matches(target);
  // Sebagian driver tidak menyertakan meta.target; perlakukan P2002 tanpa target
  // sebagai collision yang perlu di-*reread* (aman: reread memutuskan no-op).
  return target === undefined;
}

/** Membuat kode referral unik format BA-<KOTA>-<4 char>. */
export function generateReferralCode(city: string = "Kebumen"): string {
  const cityPart = (city || "Kebumen")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 8) || "KOTA";
  const suffix = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4).padEnd(4, "0");
  return `BA-${cityPart}-${suffix}`;
}

/** Resolve kode referral → BA aktif. Mengembalikan null bila kosong/invalid/nonaktif. */
export async function resolveReferral(
  code: string | null | undefined,
  tx?: AmbassadorTx
): Promise<{ ambassadorId: string } | null> {
  const normalized = (code ?? "").trim().toUpperCase();
  if (!normalized) return null;
  const db = tx ?? prisma;
  const ba = await db.brandAmbassador.findUnique({ where: { referralCode: normalized } });
  if (!ba || !ba.isActive) return null;
  return { ambassadorId: ba.id };
}

/** True bila BA adalah user yang sama dengan vendor (self-referral). */
export function attributionBaLocked(vendorUserId: string, ambassadorUserId: string): boolean {
  return vendorUserId === ambassadorUserId;
}

/**
 * Mengkredit komisi BA untuk semua OrderItem pada satu order.
 * Exact-once via AmbassadorCommission.@@unique([orderItemId]) + journalNumber
 * deterministik "ADVCOM-{orderItemId}".
 *
 * Untuk setiap item:
 *  - vendor.recruitedById harus ada & BA-nya isActive,
 *  - komisi = floor(subtotal * commissionPct / 100),
 *  - tambah walletBalance BA,
 *  - tulis jurnal DR PLATFORM_FEE / CR AMBASSADOR_PAYABLE.
 */
export async function creditCommissionForOrder(
  orderId: string,
  tx: AmbassadorTx
): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;

  const items = await tx.orderItem.findMany({
    where: { orderId, status: "ACCEPTED" },
    include: { vendor: true },
  });

  for (const item of items) {
    const recruiterId = item.vendor?.recruitedById;
    if (!recruiterId) {
      skipped++;
      continue;
    }
    const ba = await tx.brandAmbassador.findUnique({ where: { id: recruiterId } });
    if (!ba || !ba.isActive) {
      skipped++;
      continue;
    }

    // Exact-once guard.
    const existing = await tx.ambassadorCommission.findUnique({ where: { orderItemId: item.id } });
    if (existing) {
      skipped++;
      continue;
    }

    const baseAmount = item.subtotal;
    const commissionAmount = Math.floor((baseAmount * ba.commissionPct) / 100);
    if (commissionAmount <= 0) {
      skipped++;
      continue;
    }

    const journalNumber = ambassadorJournalNumber(item.id);
    try {
      const journal = await tx.ledgerJournal.create({
        data: {
          journalNumber,
          type: "AMBASSADOR_COMMISSION",
          description: `Komisi BA ${ba.commissionPct}% untuk item ${item.id}`,
          orderId,
          entries: {
            create: [
              { accountId: LEDGER_ACCOUNTS.PLATFORM_FEE, debit: commissionAmount, credit: 0 },
              { accountId: LEDGER_ACCOUNTS.AMBASSADOR_PAYABLE, debit: 0, credit: commissionAmount, entityId: ba.id },
            ],
          },
        },
      });

      await tx.ambassadorCommission.create({
        data: {
          ambassadorId: ba.id,
          orderId,
          orderItemId: item.id,
          vendorId: item.vendorId,
          baseAmount,
          commissionPct: ba.commissionPct,
          commissionAmount,
          status: "CREDITED",
          ledgerJournalId: journal.id,
        },
      });
    } catch (error) {
      // Dua pemanggil concurrent / retry → P2002 pada journalNumber atau orderItemId.
      // Idiom ledger-service.executePayout: reread lalu perlakukan sebagai no-op
      // idempotent. Tidak menulis wallet, sehingga state tetap konsisten (tidak
      // ada double-credit maupun orphan journal dari pemanggilan ini).
      if (isUniqueConstraintOn(error, "journalNumber", "orderItemId")) {
        const racedCommission = await tx.ambassadorCommission.findUnique({
          where: { orderItemId: item.id },
        });
        const racedJournal = racedCommission
          ? null
          : await tx.ledgerJournal.findUnique({ where: { journalNumber } });
        if (racedCommission || racedJournal) {
          skipped++;
          continue;
        }
      }
      throw error;
    }

    await tx.brandAmbassador.update({
      where: { id: ba.id },
      data: { walletBalance: { increment: commissionAmount } },
    });

    created++;
  }

  return { created, skipped };
}

export interface WithdrawalInput {
  ambassadorId: string;
  amount: number;
  bankName?: string;
  bankAccount?: string;
  bankHolder?: string;
}

/** Mengajukan penarikan: menahan saldo (wallet -= amount) & membuat record PENDING. */
export async function requestWithdrawal(
  input: WithdrawalInput,
  tx?: AmbassadorTx
): Promise<{ withdrawalId: string }> {
  if (!Number.isInteger(input.amount) || input.amount <= 0) {
    throw new DomainError("INVALID_WITHDRAWAL_AMOUNT", "Nominal penarikan harus lebih dari 0.");
  }
  const db = tx ?? prisma;
  const ba = await db.brandAmbassador.findUnique({ where: { id: input.ambassadorId } });
  if (!ba) throw new DomainError("BA_NOT_FOUND", "Brand Ambassador tidak ditemukan.");
  if (input.amount > ba.walletBalance) {
    throw new DomainError("INSUFFICIENT_BALANCE", "Saldo tidak mencukupi.");
  }

  const withdrawal = await db.ambassadorWithdrawal.create({
    data: {
      ambassadorId: ba.id,
      amount: input.amount,
      status: "PENDING",
      bankName: input.bankName ?? ba.bankName,
      bankAccount: input.bankAccount ?? ba.bankAccount,
      bankHolder: input.bankHolder ?? ba.bankHolder,
    },
  });
  await db.brandAmbassador.update({
    where: { id: ba.id },
    data: { walletBalance: { decrement: input.amount } },
  });
  return { withdrawalId: withdrawal.id };
}

/** Menyelesaikan penarikan. REJECTED → saldo dikembalikan. */
export async function resolveWithdrawal(
  withdrawalId: string,
  decision: "PAID" | "REJECTED",
  tx?: AmbassadorTx
): Promise<void> {
  const db = tx ?? prisma;
  const w = await db.ambassadorWithdrawal.findUnique({ where: { id: withdrawalId } });
  if (!w) throw new DomainError("WITHDRAWAL_NOT_FOUND", "Penarikan tidak ditemukan.");
  if (w.status !== "PENDING") {
    throw new DomainError("WITHDRAWAL_ALREADY_RESOLVED", "Penarikan sudah diproses sebelumnya.");
  }
  await db.ambassadorWithdrawal.update({
    where: { id: w.id },
    data: { status: decision, processedAt: new Date() },
  });
  if (decision === "REJECTED") {
    await db.brandAmbassador.update({
      where: { id: w.ambassadorId },
      data: { walletBalance: { increment: w.amount } },
    });
  }
}
