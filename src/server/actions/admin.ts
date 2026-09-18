"use server";

import { withTransactionRetry } from "@/lib/transaction-retry";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { DomainError } from "@/server/services/errors";
import {
  openDispute,
  reviewDispute,
  resolveDispute,
  type DisputeReason,
} from "@/server/services/dispute-service";
import { runAction, revalidate, type ActionResult } from "./_shared";

/**
 * HariKita - Admin Server Actions (Phase 9)
 *
 * Verifikasi vendor, dispute/resolution. Aksi dispute dapat dipanggil klien/vendor
 * (open) maupun admin (review/resolve). Semua memakai sesi + pemeriksaan role.
 */

async function requireAdminUserId(): Promise<string> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new DomainError("UNAUTHORIZED_ORDER_ACCESS", "Hanya Super Admin yang dapat mengakses.");
  }
  return session.userId;
}

async function requireAnyUserId(): Promise<string> {
  const session = await getSession();
  if (!session) {
    throw new DomainError("UNAUTHORIZED_ORDER_ACCESS", "Sesi tidak ditemukan. Silakan login.");
  }
  return session.userId;
}

// ── VERIFIKASI VENDOR ────────────────────────────────────────────────────────

/** Menyetujui vendor (terbitkan ke katalog). */
export async function approveVendorAction(input: {
  vendorId: string;
}): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    await requireAdminUserId();
    const vendor = await prisma.vendorProfile.findUnique({ where: { id: input.vendorId } });
    if (!vendor) throw new DomainError("ORDER_NOT_FOUND", "Vendor tidak ditemukan.");

    await prisma.vendorProfile.update({
      where: { id: input.vendorId },
      data: { verificationStatus: "APPROVED", isVerified: true, verificationNote: null },
    });

    revalidate(["/admin/verifikasi", "/vendor"]);
    return { id: input.vendorId };
  });
}

/** Menolak / meminta revisi vendor. */
export async function rejectVendorAction(input: {
  vendorId: string;
  note?: string;
}): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    await requireAdminUserId();
    const vendor = await prisma.vendorProfile.findUnique({ where: { id: input.vendorId } });
    if (!vendor) throw new DomainError("ORDER_NOT_FOUND", "Vendor tidak ditemukan.");

    await prisma.vendorProfile.update({
      where: { id: input.vendorId },
      data: {
        verificationStatus: "REJECTED",
        isVerified: false,
        verificationNote: input.note?.trim() || "Berkas belum lengkap.",
      },
    });

    revalidate(["/admin/verifikasi", "/vendor"]);
    return { id: input.vendorId };
  });
}

// ── DISPUTE / RESOLUTION CENTER ──────────────────────────────────────────────

export interface OpenDisputeActionInput {
  orderId: string;
  reason: DisputeReason;
  description: string;
  orderItemId?: string;
}

/** Membuka sengketa (klien/vendor). */
export async function openDisputeAction(
  input: OpenDisputeActionInput
): Promise<ActionResult<{ id: string; status: string }>> {
  return runAction(async () => {
    const userId = await requireAnyUserId();
    const result = await withTransactionRetry((tx) =>
      openDispute(
        {
          orderId: input.orderId,
          openedBy: userId,
          reason: input.reason,
          description: input.description,
          orderItemId: input.orderItemId ?? null,
        },
        tx
      )
    );
    revalidate(["/admin/dispute", "/client/pesanan"]);
    return result;
  });
}

/** Admin menandai sengketa sedang ditinjau. */
export async function reviewDisputeAction(input: {
  disputeId: string;
}): Promise<ActionResult<{ status: string }>> {
  return runAction(async () => {
    const adminId = await requireAdminUserId();
    const result = await withTransactionRetry((tx) =>
      reviewDispute(input.disputeId, adminId, tx)
    );
    revalidate(["/admin/dispute"]);
    return result;
  });
}

/** Admin menyelesaikan sengketa (setuju/tolak). */
export async function resolveDisputeAction(input: {
  disputeId: string;
  approved: boolean;
  resolution: string;
}): Promise<ActionResult<{ status: string; orderStatus: string }>> {
  return runAction(async () => {
    const adminId = await requireAdminUserId();
    if (!input.resolution?.trim()) {
      throw new DomainError("INVALID_ORDER_TRANSITION", "Catatan resolusi wajib diisi.");
    }
    const result = await withTransactionRetry((tx) =>
      resolveDispute(
        {
          disputeId: input.disputeId,
          adminUserId: adminId,
          approved: input.approved,
          resolution: input.resolution.trim(),
        },
        tx
      )
    );
    revalidate(["/admin/dispute", "/admin/escrow", "/client/pesanan"]);
    return result;
  });
}
