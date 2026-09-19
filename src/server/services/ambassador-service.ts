import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { ambassadorJournalNumber, LEDGER_ACCOUNTS } from "./ledger-service";

export type AmbassadorTx = Prisma.TransactionClient;

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

    await tx.brandAmbassador.update({
      where: { id: ba.id },
      data: { walletBalance: { increment: commissionAmount } },
    });

    created++;
  }

  return { created, skipped };
}
