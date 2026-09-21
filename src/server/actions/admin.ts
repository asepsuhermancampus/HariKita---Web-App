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
import { requireAdminCapability } from "@/server/auth/admin-guard";
import { recordAdminAudit } from "@/server/services/admin-audit-service";
import { runAction, revalidate, type ActionResult } from "./_shared";

/**
 * HariKita - Admin Server Actions (Phase 9)
 *
 * Verifikasi vendor, dispute/resolution. Aksi dispute dapat dipanggil klien/vendor
 * (open) maupun admin (review/resolve). Semua memakai sesi + pemeriksaan role.
 */

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
    const actor = await requireAdminCapability("VERIFY_VENDOR");
    const vendor = await prisma.vendorProfile.findUnique({ where: { id: input.vendorId } });
    if (!vendor) throw new DomainError("ORDER_NOT_FOUND", "Vendor tidak ditemukan.");

    await prisma.vendorProfile.update({
      where: { id: input.vendorId },
      data: { verificationStatus: "APPROVED", isVerified: true, verificationNote: null },
    });

    await recordAdminAudit({
      actor,
      capability: "VERIFY_VENDOR",
      action: "VENDOR_APPROVED",
      targetType: "VendorProfile",
      targetId: input.vendorId,
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
    const actor = await requireAdminCapability("VERIFY_VENDOR");
    const vendor = await prisma.vendorProfile.findUnique({ where: { id: input.vendorId } });
    if (!vendor) throw new DomainError("ORDER_NOT_FOUND", "Vendor tidak ditemukan.");

    const note = input.note?.trim() || "Berkas belum lengkap.";
    await prisma.vendorProfile.update({
      where: { id: input.vendorId },
      data: { verificationStatus: "REJECTED", isVerified: false, verificationNote: note },
    });

    await recordAdminAudit({
      actor,
      capability: "VERIFY_VENDOR",
      action: "VENDOR_REJECTED",
      targetType: "VendorProfile",
      targetId: input.vendorId,
      metadata: { note },
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
    const actor = await requireAdminCapability("MANAGE_DISPUTE");
    const result = await withTransactionRetry((tx) =>
      reviewDispute(input.disputeId, actor.userId, tx)
    );
    await recordAdminAudit({
      actor,
      capability: "MANAGE_DISPUTE",
      action: "DISPUTE_REVIEWED",
      targetType: "Dispute",
      targetId: input.disputeId,
    });
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
    const actor = await requireAdminCapability("MANAGE_DISPUTE");
    if (!input.resolution?.trim()) {
      throw new DomainError("INVALID_ORDER_TRANSITION", "Catatan resolusi wajib diisi.");
    }
    const result = await withTransactionRetry((tx) =>
      resolveDispute(
        {
          disputeId: input.disputeId,
          adminUserId: actor.userId,
          approved: input.approved,
          resolution: input.resolution.trim(),
        },
        tx
      )
    );
    await recordAdminAudit({
      actor,
      capability: "MANAGE_DISPUTE",
      action: "DISPUTE_RESOLVED",
      targetType: "Dispute",
      targetId: input.disputeId,
      metadata: { approved: input.approved, resolution: input.resolution.trim() },
    });
    revalidate(["/admin/dispute", "/admin/escrow", "/client/pesanan"]);
    return result;
  });
}
