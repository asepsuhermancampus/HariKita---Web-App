import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import { DomainError } from "./errors";
import {
  bookReservedSlots,
  releaseBookedSlotForRefund,
} from "./availability-service";
import { getActiveItems } from "./order-service";
import {
  recordJournal,
  reverseJournal,
  executePayout,
  getDisbursedPayoutTotal,
  payoutJournalNumber,
  splitTranches,
  LEDGER_ACCOUNTS,
  type LedgerTx,
  type PayoutTranche,
} from "./ledger-service";
import { getStartOfDayWIB, diffCalendarDaysWIB, getEndOfDayWIB } from "@/lib/date-utils";
import { generateOperationalArtifacts } from "./order-lifecycle";
import { notifyDpPaid } from "./notification-templates";

/**
 * HariKita - PaymentService
 *
 * Orchestrator tunggal untuk mutasi finansial (Phase 1D §9, §12).
 * [OWNS: PaymentInstallment, PaymentAttempt] dan mengoordinasikan Order,
 * Availability, dan Ledger dalam SATU transaksi `tx` yang sama.
 *
 * Larangan: TIDAK boleh ada network call eksternal di dalam transaksi.
 */

export type PaymentTx = Prisma.TransactionClient;

export interface CreateAttemptInput {
  installmentId: string;
  provider: string;
  clientGeneratedRef: string;
}

export interface CreateAttemptResult {
  attemptId: string;
  idempotencyKey: string;
  reused: boolean;
}

/**
 * Membuat PaymentAttempt baru (status CREATED) dengan `idempotencyKey @unique`.
 * Jika key sudah ada (dua pemanggil / retry klien) → kembalikan attempt yang ada.
 */
export async function createPaymentAttempt(
  input: CreateAttemptInput,
  tx?: PaymentTx
): Promise<CreateAttemptResult> {
  const db = tx ?? prisma;
  const idempotencyKey = `${input.installmentId}:${input.provider}:${input.clientGeneratedRef}`;

  const existing = await db.paymentAttempt.findUnique({ where: { idempotencyKey } });
  if (existing) {
    return { attemptId: existing.id, idempotencyKey, reused: true };
  }

  const installment = await db.paymentInstallment.findUnique({
    where: { id: input.installmentId },
  });
  if (!installment) {
    throw new DomainError("INSTALLMENT_NOT_FOUND", `Installment "${input.installmentId}" tidak ditemukan.`);
  }
  if (installment.status === "PAID") {
    throw new DomainError("INSTALLMENT_ALREADY_PAID", "Installment sudah lunas.");
  }

  const created = await db.paymentAttempt.create({
    data: {
      installmentId: input.installmentId,
      provider: input.provider,
      amount: installment.amount,
      status: "CREATED",
      idempotencyKey,
    },
  });
  return { attemptId: created.id, idempotencyKey, reused: false };
}

export interface ProcessPaymentInput {
  attemptId: string;
  provider: string;
  providerTransactionId: string;
  amount: number;
}

export interface ProcessPaymentResult {
  outcome: "PROCESSED" | "ALREADY_PAID";
  installmentType: string;
  orderStatus: string;
}

/**
 * Memproses pembayaran sukses (dari webhook terverifikasi) di dalam satu transaksi.
 *
 * Langkah (Phase 1D §9):
 *   1. Muat & kunci attempt + installment; verifikasi 4 elemen identitas.
 *   2. Jika installment sudah PAID → idempotent early return.
 *   3. Tandai attempt PAID + installment PAID.
 *   4. Transisi Order (DP_30 → DP_PAID→IN_PROGRESS ; FULL_100/SETTLEMENT_70 → FULLY_PAID).
 *   5. Booking slot RESERVED → BOOKED (hanya bila belum).
 *   6. Posting jurnal ledger (ESCROW_DP_IN / SETTLEMENT_IN; FULL_100 = dua jurnal atomik).
 *
 * @throws {DomainError} saat mismatch identitas / transisi tidak valid.
 */
export async function processPaymentSuccess(
  input: ProcessPaymentInput,
  tx: PaymentTx
): Promise<ProcessPaymentResult> {
  const db = tx;

  const attempt = await db.paymentAttempt.findUnique({
    where: { id: input.attemptId },
  });
  if (!attempt) {
    throw new DomainError("INSTALLMENT_NOT_FOUND", `Attempt "${input.attemptId}" tidak ditemukan.`);
  }

  const installment = await db.paymentInstallment.findUnique({
    where: { id: attempt.installmentId },
  });
  if (!installment) {
    throw new DomainError("INSTALLMENT_NOT_FOUND", "Installment untuk attempt ini tidak ditemukan.");
  }

  // 4 elemen identitas.
  if (attempt.provider !== input.provider) {
    throw new DomainError("PAYMENT_ATTEMPT_FAILED", "Provider attempt tidak cocok dengan webhook.");
  }
  if (attempt.amount !== installment.amount || input.amount !== installment.amount) {
    throw new DomainError(
      "PAYMENT_AMOUNT_MISMATCH",
      `Nominal tidak cocok (attempt=${attempt.amount}, webhook=${input.amount}, installment=${installment.amount}).`
    );
  }

  // Referensi transaksi gateway tidak boleh dipakai attempt lain (application invariant).
  const conflict = await db.paymentAttempt.findFirst({
    where: { providerTransactionId: input.providerTransactionId, id: { not: attempt.id } },
  });
  if (conflict) {
    throw new DomainError(
      "PAYMENT_ATTEMPT_FAILED",
      `Referensi transaksi ${input.providerTransactionId} sudah tertaut ke attempt lain.`
    );
  }

  // Idempotency: sudah PAID → early return.
  if (installment.status === "PAID") {
    return { outcome: "ALREADY_PAID", installmentType: installment.type, orderStatus: await currentOrderStatus(installment.orderId, tx) };
  }

  const order = await db.order.findUnique({ where: { id: installment.orderId } });
  if (!order) {
    throw new DomainError("ORDER_NOT_FOUND", `Order "${installment.orderId}" tidak ditemukan.`);
  }

  // Validasi state sesuai tipe installment.
  validateInstallmentState(order.status, installment.type);

  const now = new Date();

  // Update payment layer.
  await db.paymentAttempt.update({
    where: { id: attempt.id },
    data: { status: "PAID", providerTransactionId: input.providerTransactionId, paidAt: now },
  });
  await db.paymentInstallment.update({
    where: { id: installment.id },
    data: { status: "PAID", paidAt: now },
  });

  const activeItems = await getActiveItems(order.id, tx);
  const activeItemIds = activeItems.map((i) => i.id);

  if (installment.type === "DP_30") {
    // WAITING_DP → DP_PAID → IN_PROGRESS
    await db.order.update({ where: { id: order.id }, data: { status: "DP_PAID" } });
    await db.orderStatusHistory.create({
      data: { orderId: order.id, fromStatus: order.status, toStatus: "DP_PAID", reason: "DP_30 payment confirmed", changedBy: "SYSTEM" },
    });
    await db.order.update({ where: { id: order.id }, data: { status: "IN_PROGRESS" } });
    await db.orderStatusHistory.create({
      data: { orderId: order.id, fromStatus: "DP_PAID", toStatus: "IN_PROGRESS", reason: "Operational auto-transition", changedBy: "SYSTEM" },
    });

    await bookReservedSlots(activeItemIds, tx);

    // Hasilkan sesi fisik (fitting/test food) & rundown hari H (idempotent).
    await generateOperationalArtifacts(order.id, tx);

    await recordJournal(
      {
        type: "ESCROW_DP_IN",
        description: `DP 30% escrow inflow untuk order ${order.id}`,
        orderId: order.id,
        installmentId: installment.id,
        journalNumber: `ESCROW-DP-${order.id}`,
        entries: [
          { accountId: LEDGER_ACCOUNTS.CASH_GATEWAY, debit: installment.amount, credit: 0 },
          { accountId: LEDGER_ACCOUNTS.CLIENT_ESCROW, debit: 0, credit: installment.amount },
        ],
      },
      tx
    );

    // Notifikasi DP terbayar (outbox; dikirim scheduler).
    await notifyDpPaid(order.id, installment.amount, tx);

    return { outcome: "PROCESSED", installmentType: "DP_30", orderStatus: "IN_PROGRESS" };
  }

  if (installment.type === "FULL_100") {
    // WAITING_DP → FULLY_PAID (atomik: 2 jurnal + order + availability).
    await db.order.update({ where: { id: order.id }, data: { status: "FULLY_PAID" } });
    await db.orderStatusHistory.create({
      data: { orderId: order.id, fromStatus: order.status, toStatus: "FULLY_PAID", reason: "FULL_100 payment confirmed", changedBy: "SYSTEM" },
    });

    await bookReservedSlots(activeItemIds, tx);

    const { dpAmount, settlementAmount } = splitTranches(installment.amount);

    await recordJournal(
      {
        type: "ESCROW_DP_IN",
        description: `FULL_100 alokasi DP (30%) order ${order.id}`,
        orderId: order.id,
        installmentId: installment.id,
        journalNumber: `ESCROW-DP-${order.id}`,
        entries: [
          { accountId: LEDGER_ACCOUNTS.CASH_GATEWAY, debit: dpAmount, credit: 0 },
          { accountId: LEDGER_ACCOUNTS.CLIENT_ESCROW, debit: 0, credit: dpAmount },
        ],
      },
      tx
    );
    await recordJournal(
      {
        type: "SETTLEMENT_IN",
        description: `FULL_100 alokasi Settlement (70%) order ${order.id}`,
        orderId: order.id,
        installmentId: installment.id,
        journalNumber: `SETTLE-IN-${order.id}`,
        entries: [
          { accountId: LEDGER_ACCOUNTS.CASH_GATEWAY, debit: settlementAmount, credit: 0 },
          { accountId: LEDGER_ACCOUNTS.CLIENT_ESCROW, debit: 0, credit: settlementAmount },
        ],
      },
      tx
    );

    return { outcome: "PROCESSED", installmentType: "FULL_100", orderStatus: "FULLY_PAID" };
  }

  if (installment.type === "SETTLEMENT_70") {
    // WAITING_SETTLEMENT → FULLY_PAID (slot sudah BOOKED).
    await db.order.update({ where: { id: order.id }, data: { status: "FULLY_PAID" } });
    await db.orderStatusHistory.create({
      data: { orderId: order.id, fromStatus: order.status, toStatus: "FULLY_PAID", reason: "SETTLEMENT_70 payment confirmed", changedBy: "SYSTEM" },
    });

    await recordJournal(
      {
        type: "SETTLEMENT_IN",
        description: `Pelunasan 70% escrow inflow untuk order ${order.id}`,
        orderId: order.id,
        installmentId: installment.id,
        journalNumber: `SETTLE-IN-${order.id}`,
        entries: [
          { accountId: LEDGER_ACCOUNTS.CASH_GATEWAY, debit: installment.amount, credit: 0 },
          { accountId: LEDGER_ACCOUNTS.CLIENT_ESCROW, debit: 0, credit: installment.amount },
        ],
      },
      tx
    );

    return { outcome: "PROCESSED", installmentType: "SETTLEMENT_70", orderStatus: "FULLY_PAID" };
  }

  throw new DomainError("INVALID_ORDER_TRANSITION", `Tipe installment tidak dikenal: ${installment.type}`);
}

/**
 * Menandai attempt gagal tanpa membatalkan installment (klien boleh coba lagi).
 */
export async function processPaymentFailure(
  attemptId: string,
  errorMessage: string,
  tx?: PaymentTx
): Promise<void> {
  const db = tx ?? prisma;
  await db.paymentAttempt.updateMany({
    where: { id: attemptId, status: { in: ["CREATED", "PENDING"] } },
    data: { status: "FAILED", errorMessage },
  });
}

/** Mengaktifkan installment SETTLEMENT_70 saat order mencapai H-7 (WIB). */
export async function activateSettlementInstallment(
  orderId: string,
  tx: PaymentTx
): Promise<boolean> {
  const db = tx;
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) throw new DomainError("ORDER_NOT_FOUND", `Order "${orderId}" tidak ditemukan.`);
  if (order.status !== "IN_PROGRESS") return false;

  // H-7 kalender WIB.
  const daysUntilEvent = diffCalendarDaysWIB(order.eventDate, new Date());
  if (daysUntilEvent > 7) return false;

  const existing = await db.paymentInstallment.findFirst({
    where: { orderId, type: "SETTLEMENT_70" },
  });
  if (existing) return false;

  // Nominal settlement = total - DP yang sudah dibayar (fallback 70% dari total).
  const dpInstallment = await db.paymentInstallment.findFirst({
    where: { orderId, type: "DP_30", status: "PAID" },
  });
  const settlementAmount = dpInstallment
    ? order.totalAmount - dpInstallment.amount
    : order.totalAmount - Math.floor((order.totalAmount * 30) / 100);

  await db.paymentInstallment.create({
    data: {
      orderId,
      type: "SETTLEMENT_70",
      amount: settlementAmount,
      status: "PENDING",
      dueAt: getEndOfDayWIB(order.eventDate),
    },
  });
  await db.order.update({ where: { id: orderId }, data: { status: "WAITING_SETTLEMENT" } });
  await db.orderStatusHistory.create({
    data: { orderId, fromStatus: "IN_PROGRESS", toStatus: "WAITING_SETTLEMENT", reason: "H-7 settlement window opened", changedBy: "SYSTEM" },
  });
  return true;
}

export interface RefundInput {
  orderId: string;
  sourceJournalId: string;
  reason: string;
  changedBy?: string;
}

export interface RefundResult {
  outcome: "REFUNDED_AUTO" | "MANUAL_RESOLUTION_REQUIRED";
  reversalJournalId?: string;
}

/**
 * Mengajukan refund. Menerapkan kebijakan "No Automatic Refund After Payout"
 * (Phase 1D v9 §7):
 *   - Jika sudah ada disbursed payout > 0 → refund otomatis DILARANG; order
 *     dialihkan ke jalur manual (DISPUTED → REFUND_PENDING).
 *   - Jika belum ada payout → reversal jurnal otomatis + lepas slot BOOKED.
 */
export async function processRefund(
  input: RefundInput,
  tx: PaymentTx
): Promise<RefundResult> {
  const db = tx;

  const order = await db.order.findUnique({ where: { id: input.orderId } });
  if (!order) throw new DomainError("ORDER_NOT_FOUND", `Order "${input.orderId}" tidak ditemukan.`);

  const disbursed = await getDisbursedPayoutTotal(input.orderId, tx);

  if (disbursed > 0) {
    // Manual resolution: kunci refund otomatis.
    await db.order.update({ where: { id: order.id }, data: { status: "REFUND_PENDING" } });
    await db.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: order.status,
        toStatus: "REFUND_PENDING",
        reason: `MANUAL_RESOLUTION: disbursed payout = ${disbursed}. ${input.reason}`,
        changedBy: input.changedBy ?? "ADMIN",
      },
    });
    return { outcome: "MANUAL_RESOLUTION_REQUIRED" };
  }

  // Jalur otomatis (pra-payout).
  const reversal = await reverseJournal(input.sourceJournalId, input.reason, tx);

  await db.order.update({ where: { id: order.id }, data: { status: "REFUND_PENDING" } });
  await db.orderStatusHistory.create({
    data: {
      orderId: order.id,
      fromStatus: order.status,
      toStatus: "REFUND_PENDING",
      reason: input.reason,
      changedBy: input.changedBy ?? "ADMIN",
    },
  });

  // Lepas seluruh slot BOOKED.
  const items = await db.orderItem.findMany({ where: { orderId: order.id } });
  for (const item of items) {
    await releaseBookedSlotForRefund(item.id, tx);
  }

  return { outcome: "REFUNDED_AUTO", reversalJournalId: reversal.id };
}

/** Menandai refund tuntas (transfer terekonsiliasi) → REFUNDED (terminal). */
export async function markRefundSettled(
  orderId: string,
  tx: PaymentTx
): Promise<void> {
  const db = tx;
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) throw new DomainError("ORDER_NOT_FOUND", `Order "${orderId}" tidak ditemukan.`);
  await db.order.update({ where: { id: orderId }, data: { status: "REFUNDED" } });
  await db.orderStatusHistory.create({
    data: { orderId, fromStatus: order.status, toStatus: "REFUNDED", reason: "Refund transfer reconciled", changedBy: "ADMIN" },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYOUT SCHEDULER (5 financial eligibility guards — Phase 1D v9 §8.2)
// ─────────────────────────────────────────────────────────────────────────────

export interface PayoutSweepResult {
  eligible: string[];
  executed: string[];
  skipped: Array<{ orderId: string; tranche: PayoutTranche; reason: string }>;
}

/**
 * Menjalankan payout yang layak (DP_DISBURSEMENT H-3 & SETTLEMENT_PAYOUT H+2).
 * Idempotent via journalNumber deterministik. Pihak pemanggil dapat menjalankan
 * ini pada cron harian; setiap order dievaluasi ulang.
 */
export async function runPayoutSweep(
  candidates: Array<{ orderId: string; tranche: PayoutTranche }>,
  tx: PaymentTx
): Promise<PayoutSweepResult> {
  const db = tx;
  const eligible: string[] = [];
  const executed: string[] = [];
  const skipped: PayoutSweepResult["skipped"] = [];

  for (const cand of candidates) {
    const order = await db.order.findUnique({ where: { id: cand.orderId } });
    if (!order) {
      skipped.push({ ...cand, reason: "ORDER_NOT_FOUND" });
      continue;
    }

    const guard = await checkPayoutEligibility(cand.orderId, cand.tranche, tx);
    if (!guard.eligible) {
      skipped.push({ ...cand, reason: guard.reason });
      continue;
    }
    eligible.push(cand.orderId);

    const result = await executePayout(
      {
        orderId: cand.orderId,
        tranche: cand.tranche,
        amount: guard.amount,
      },
      tx
    );
    if (result.created) executed.push(cand.orderId);
    else skipped.push({ ...cand, reason: "ALREADY_PAID_OUT" });
  }

  return { eligible, executed, skipped };
}

interface EligibilityResult {
  eligible: boolean;
  reason: string;
  amount: number;
}

/**
 * 5 Financial Eligibility Guards (Phase 1D v9 §8.2):
 *  1. Source journal exists (ESCROW_DP_IN / SETTLEMENT_IN).
 *  2. Payment confirmed (installment PAID).
 *  3. Source not reversed.
 *  4. Tranche not yet disbursed.
 *  5. No active dispute / refund state.
 * Ditambah kelayakan waktu kalender WIB (H-3 / H+2).
 */
export async function checkPayoutEligibility(
  orderId: string,
  tranche: PayoutTranche,
  tx?: PaymentTx
): Promise<EligibilityResult> {
  const db = tx ?? prisma;
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return { eligible: false, reason: "ORDER_NOT_FOUND", amount: 0 };

  // Guard 5: tidak dalam dispute/refund.
  if (["DISPUTED", "REFUND_PENDING", "REFUNDED", "EXPIRED", "CANCELLED"].includes(order.status)) {
    return { eligible: false, reason: `ORDER_STATE_${order.status}`, amount: 0 };
  }

  // Kelayakan waktu.
  const todayWIB = new Date();
  if (tranche === "DP_DISBURSEMENT") {
    const daysUntilEvent = diffCalendarDaysWIB(order.eventDate, todayWIB);
    if (daysUntilEvent > 3) {
      return { eligible: false, reason: "NOT_H3_YET", amount: 0 };
    }
  } else {
    // SETTLEMENT_PAYOUT: completedAt (SSOT) + 48 jam.
    const completedHistory = await db.orderStatusHistory.findFirst({
      where: { orderId, toStatus: "COMPLETED" },
      orderBy: { createdAt: "desc" },
    });
    if (!completedHistory) {
      return { eligible: false, reason: "NOT_COMPLETED", amount: 0 };
    }
    const eligibleAt = new Date(completedHistory.createdAt.getTime() + 48 * 60 * 60 * 1000);
    if (eligibleAt.getTime() > todayWIB.getTime()) {
      return { eligible: false, reason: "NOT_H2_YET", amount: 0 };
    }
  }

  // Guard 4: belum pernah payout tranche ini.
  const existingPayout = await db.ledgerJournal.findUnique({
    where: { journalNumber: payoutJournalNumber(orderId, tranche) },
  });
  if (existingPayout) {
    return { eligible: false, reason: "ALREADY_PAID_OUT", amount: 0 };
  }

  // Tentukan tipe source journal & jumlah.
  const sourceType = tranche === "DP_DISBURSEMENT" ? "ESCROW_DP_IN" : "SETTLEMENT_IN";
  const sourceJournal = await db.ledgerJournal.findFirst({
    where: { orderId, type: sourceType, reversalOfId: null },
    include: { entries: true, reversedBy: true },
  });
  if (!sourceJournal) {
    return { eligible: false, reason: "SOURCE_JOURNAL_MISSING", amount: 0 };
  }
  // Guard 3: source belum di-reverse.
  if (sourceJournal.reversedBy) {
    return { eligible: false, reason: "SOURCE_REVERSED", amount: 0 };
  }

  // Guard 2: installment terkait PAID dengan tipe yang benar.
  //  - DP_DISBURSEMENT berasal dari DP_30 ATAU FULL_100 (FULL_100 mencakup alokasi DP).
  //  - SETTLEMENT_PAYOUT berasal dari SETTLEMENT_70 ATAU FULL_100.
  const paidInstallments = await db.paymentInstallment.findMany({
    where: { orderId, status: "PAID" },
  });
  const requiredTypes =
    tranche === "DP_DISBURSEMENT" ? ["DP_30", "FULL_100"] : ["SETTLEMENT_70", "FULL_100"];
  const hasRequiredPayment = paidInstallments.some((i) => requiredTypes.includes(i.type));
  if (!hasRequiredPayment) {
    return { eligible: false, reason: "PAYMENT_NOT_CONFIRMED", amount: 0 };
  }

  const sourceAmount = sourceJournal.entries.reduce((acc, e) => acc + e.credit, 0);
  return { eligible: true, reason: "ELIGIBLE", amount: sourceAmount };
}

async function currentOrderStatus(orderId: string, tx: PaymentTx): Promise<string> {
  const order = await tx.order.findUnique({ where: { id: orderId }, select: { status: true } });
  return order?.status ?? "UNKNOWN";
}

function validateInstallmentState(orderStatus: string, installmentType: string): void {
  if (installmentType === "DP_30" || installmentType === "FULL_100") {
    if (orderStatus !== "WAITING_DP") {
      throw new DomainError(
        "INVALID_ORDER_TRANSITION",
        `Order harus WAITING_DP untuk pembayaran ${installmentType} (status=${orderStatus}).`
      );
    }
  } else if (installmentType === "SETTLEMENT_70") {
    if (orderStatus !== "WAITING_SETTLEMENT") {
      throw new DomainError(
        "INVALID_ORDER_TRANSITION",
        `Order harus WAITING_SETTLEMENT untuk pelunasan (status=${orderStatus}).`
      );
    }
  }
}

/** Util: membuat referensi idempotency key acak untuk attempt baru. */
export function generateClientRef(): string {
  return randomUUID();
}

// Re-export helper yang sering dipakai konsumen.
export { splitTranches, payoutJournalNumber, type LedgerTx };
export { getStartOfDayWIB };
