"use server";

import { withTransactionRetry } from "@/lib/transaction-retry";
import {
  claimHoldSlot,
  getEffectiveSlotStatus,
  sweepExpiredHolds,
} from "@/server/services/availability-service";
import { resolveCatalogItem } from "@/server/services/catalog-bridge";
import { DomainError } from "@/server/services/errors";
import { runAction, optionalSession, type ActionResult } from "./_shared";

/**
 * HariKita - Availability Server Actions (Phase 2 transport layer)
 *
 * Menjembatani UI (builder/checkout) ke AvailabilityService + database.
 */

export interface ClaimHoldActionResult {
  slotId: string;
  holdToken: string;
  holdExpiresAt: string; // ISO
}

/**
 * Mengklaim hold 15 menit untuk vendor (berdasarkan ID katalog) + tanggal acara.
 * Mengembalikan token hold plain yang disimpan klien (localStorage/session).
 */
export async function claimHoldSlotAction(input: {
  catalogVendorId: string;
  catalogPackageId: string;
  eventDate: string;
}): Promise<ActionResult<ClaimHoldActionResult>> {
  return runAction(async () => {
    const session = await optionalSession();

    return withTransactionRetry(async (tx) => {
      const resolved = await resolveCatalogItem(
        input.catalogVendorId,
        input.catalogPackageId,
        tx
      );

      const hold = await claimHoldSlot(
        {
          vendorId: resolved.vendorId,
          date: input.eventDate,
          userId: session?.userId ?? null,
        },
        tx
      );

      return {
        slotId: hold.slotId,
        holdToken: hold.holdToken,
        holdExpiresAt: hold.holdExpiresAt.toISOString(),
      };
    });
  });
}

/** Mengecek status slot efektif (OPEN/HELD/RESERVED/BOOKED/BLACKED_OUT). */
export async function checkSlotStatusAction(input: {
  catalogVendorId: string;
  catalogPackageId: string;
  eventDate: string;
}): Promise<ActionResult<{ status: string }>> {
  return runAction(async () => {
    if (!input.eventDate) {
      throw new DomainError("INVALID_AVAILABILITY_TRANSITION", "Tanggal acara wajib diisi.");
    }
    const resolved = await resolveCatalogItem(
      input.catalogVendorId,
      input.catalogPackageId
    );
    const status = await getEffectiveSlotStatus(resolved.vendorId, input.eventDate);
    return { status };
  });
}

/** Menyapu slot HELD yang kedaluwarsa (dapat dipanggil cron/manual). */
export async function sweepExpiredHoldsAction(): Promise<ActionResult<{ released: number }>> {
  return runAction(async () => {
    const released = await sweepExpiredHolds();
    return { released };
  });
}
