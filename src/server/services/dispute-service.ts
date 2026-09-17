import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DomainError } from "./errors";

/**
 * HariKita - DisputeService
 *
 * Mengelola sengketa (sidecar process) pada sebuah order. Dispute dapat dibuka
 * pada status finansial aktif (DP_PAID s/d COMPLETED). Penyelesaian dapat:
 *  - mengembalikan order ke status operasional (dispute ditolak), atau
 *  - mengarahkan order ke REFUND_PENDING (dispute disetujui).
 *
 * Keputusan refund aktual (reversal ledger) dilakukan oleh PaymentService
 * (`processRefund`) — DisputeService hanya mengelola state sengketa.
 */

export type DisputeTx = Prisma.TransactionClient;

export const DISPUTE_STATUSES = ["OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED", "CLOSED"] as const;
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

export const DISPUTE_REASONS = [
  "VENDOR_NO_SHOW",
  "QUALITY_MISMATCH",
  "UNAUTHORIZED_EXTRA_FEE",
  "CANCEL_REQUEST",
] as const;
export type DisputeReason = (typeof DISPUTE_REASONS)[number];

/** Status order yang boleh membuka dispute. */
const DISPUTABLE_ORDER_STATUSES = [
  "DP_PAID",
  "IN_PROGRESS",
  "WAITING_SETTLEMENT",
  "FULLY_PAID",
  "COMPLETED",
  "WAITING_DP",
];

export interface OpenDisputeInput {
  orderId: string;
  openedBy: string; // userId klien/vendor
  reason: DisputeReason;
  description: string;
  orderItemId?: string | null;
  evidence?: Record<string, unknown> | null;
}

/**
 * Membuka sengketa baru pada sebuah order.
 * @throws {DomainError} bila order tidak ditemukan / status tidak memungkinkan.
 */
export async function openDispute(
  input: OpenDisputeInput,
  tx?: DisputeTx
): Promise<{ id: string; status: string }> {
  const db = tx ?? prisma;

  if (!input.description?.trim()) {
    throw new DomainError("ORDER_NOT_FOUND", "Deskripsi sengketa wajib diisi.");
  }

  const order = await db.order.findUnique({ where: { id: input.orderId } });
  if (!order) {
    throw new DomainError("ORDER_NOT_FOUND", `Order "${input.orderId}" tidak ditemukan.`);
  }
  if (!DISPUTABLE_ORDER_STATUSES.includes(order.status)) {
    throw new DomainError(
      "INVALID_ORDER_TRANSITION",
      `Order pada status ${order.status} tidak dapat disengketakan.`
    );
  }

  const existing = await db.dispute.findFirst({
    where: { orderId: input.orderId, status: { in: ["OPEN", "UNDER_REVIEW"] } },
  });
  if (existing) {
    throw new DomainError("INVALID_ORDER_TRANSITION", "Sudah ada sengketa aktif untuk order ini.");
  }

  const dispute = await db.dispute.create({
    data: {
      orderId: input.orderId,
      orderItemId: input.orderItemId ?? null,
      openedBy: input.openedBy,
      reason: input.reason,
      description: input.description.trim(),
      evidence: input.evidence ? JSON.stringify(input.evidence) : null,
      status: "OPEN",
    },
  });

  // Freeze order menjadi DISPUTED (menahan payout).
  if (order.status !== "DISPUTED") {
    await db.order.update({ where: { id: order.id }, data: { status: "DISPUTED" } });
    await db.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: order.status,
        toStatus: "DISPUTED",
        reason: `Dispute opened: ${input.reason}`,
        changedBy: input.openedBy,
      },
    });
  }

  return { id: dispute.id, status: dispute.status };
}

/** Menandai dispute sedang ditinjau admin. */
export async function reviewDispute(
  disputeId: string,
  adminUserId: string,
  tx?: DisputeTx
): Promise<{ status: string }> {
  const db = tx ?? prisma;
  const dispute = await db.dispute.findUnique({ where: { id: disputeId } });
  if (!dispute) throw new DomainError("ORDER_NOT_FOUND", "Sengketa tidak ditemukan.");
  if (dispute.status !== "OPEN") {
    throw new DomainError("INVALID_ORDER_TRANSITION", `Sengketa sudah berstatus ${dispute.status}.`);
  }

  await db.dispute.update({
    where: { id: disputeId },
    data: { status: "UNDER_REVIEW" },
  });
  void adminUserId;
  return { status: "UNDER_REVIEW" };
}

export interface ResolveDisputeInput {
  disputeId: string;
  adminUserId: string;
  /** true = disetujui (arahkan refund); false = ditolak (kembali operasional). */
  approved: boolean;
  resolution: string;
}

/**
 * Menyelesaikan dispute.
 *  - approved=false → RESOLVED? tidak; status REJECTED, order kembali operasional.
 *  - approved=true  → status RESOLVED, order diarahkan ke REFUND_PENDING
 *    (proses refund aktual dilakukan PaymentService.processRefund).
 *
 * @throws {DomainError}
 */
export async function resolveDispute(
  input: ResolveDisputeInput,
  tx?: DisputeTx
): Promise<{ status: string; orderStatus: string }> {
  const db = tx ?? prisma;
  const dispute = await db.dispute.findUnique({
    where: { id: input.disputeId },
    include: { order: true },
  });
  if (!dispute) throw new DomainError("ORDER_NOT_FOUND", "Sengketa tidak ditemukan.");
  if (["RESOLVED", "REJECTED", "CLOSED"].includes(dispute.status)) {
    throw new DomainError("INVALID_ORDER_TRANSITION", `Sengketa sudah final (${dispute.status}).`);
  }

  const now = new Date();

  if (!input.approved) {
    // Dispute ditolak → order kembali ke status operasional sebelumnya.
    await db.dispute.update({
      where: { id: dispute.id },
      data: {
        status: "REJECTED",
        resolution: input.resolution,
        resolvedBy: input.adminUserId,
        resolvedAt: now,
      },
    });

    const restoreStatus = dispute.order.status === "DISPUTED" ? "IN_PROGRESS" : dispute.order.status;
    if (dispute.order.status === "DISPUTED") {
      await db.order.update({ where: { id: dispute.orderId }, data: { status: restoreStatus } });
      await db.orderStatusHistory.create({
        data: {
          orderId: dispute.orderId,
          fromStatus: "DISPUTED",
          toStatus: restoreStatus,
          reason: `Dispute rejected: ${input.resolution}`,
          changedBy: input.adminUserId,
        },
      });
    }
    return { status: "REJECTED", orderStatus: restoreStatus };
  }

  // Dispute disetujui → arahkan order ke REFUND_PENDING.
  await db.dispute.update({
    where: { id: dispute.id },
    data: {
      status: "RESOLVED",
      resolution: input.resolution,
      resolvedBy: input.adminUserId,
      resolvedAt: now,
    },
  });

  if (dispute.order.status !== "REFUND_PENDING" && dispute.order.status !== "REFUNDED") {
    await db.order.update({ where: { id: dispute.orderId }, data: { status: "REFUND_PENDING" } });
    await db.orderStatusHistory.create({
      data: {
        orderId: dispute.orderId,
        fromStatus: dispute.order.status,
        toStatus: "REFUND_PENDING",
        reason: `Dispute approved: ${input.resolution}`,
        changedBy: input.adminUserId,
      },
    });
  }

  return { status: "RESOLVED", orderStatus: "REFUND_PENDING" };
}

/** Daftar sengketa untuk admin (dengan info order). */
export async function listDisputes(
  status?: DisputeStatus,
  db: Prisma.TransactionClient | typeof prisma = prisma
) {
  return db.dispute.findMany({
    where: status ? { status } : undefined,
    include: {
      order: { select: { orderNumber: true, clientName: true, totalAmount: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}
