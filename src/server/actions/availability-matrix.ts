"use server";

import { prisma } from "@/lib/prisma";
import { resolveCatalogItem } from "@/server/services/catalog-bridge";
import { DomainError } from "@/server/services/errors";
import { runAction, type ActionResult } from "./_shared";

/**
 * HariKita - Availability Matrix Server Action (Phase 5)
 *
 * Mengecek ketersediaan nyata (dari tabel VendorAvailability) untuk sekumpulan
 * vendor katalog pada satu tanggal acara. Menggantikan matriks mock di /builder.
 */

export interface MatrixConflict {
  catalogVendorId: string;
  vendorName: string;
  reason: string;
  status: string;
}

export interface MatrixResult {
  isAllAvailable: boolean;
  conflicts: MatrixConflict[];
  availableCount: number;
  totalChecked: number;
}

const STATUS_LABEL: Record<string, string> = {
  BLACKED_OUT: "Tanggal ditutup oleh vendor (offline)",
  BOOKED: "Sudah terisi pesanan lain",
  RESERVED: "Sedang direservasi klien lain",
  HELD: "Sedang dalam proses checkout klien lain",
};

/**
 * Memeriksa ketersediaan multi-vendor. Untuk tiap vendor katalog: resolve ke
 * vendorId DB, lalu baca status slot efektif pada tanggal tersebut.
 */
export async function checkAvailabilityMatrixAction(input: {
  eventDate: string;
  vendors: Array<{ catalogVendorId: string; catalogPackageId: string }>;
}): Promise<ActionResult<MatrixResult>> {
  return runAction(async () => {
    if (!input.eventDate) {
      throw new DomainError("INVALID_AVAILABILITY_TRANSITION", "Tanggal acara wajib diisi.");
    }
    if (!input.vendors || input.vendors.length === 0) {
      return { isAllAvailable: true, conflicts: [], availableCount: 0, totalChecked: 0 };
    }

    // Normalisasi tanggal ke 00:00 WIB.
    const { getStartOfDayWIB } = await import("@/lib/date-utils");
    const slotDate = getStartOfDayWIB(input.eventDate);
    const now = new Date();

    const conflicts: MatrixConflict[] = [];
    let checked = 0;

    for (const v of input.vendors) {
      let resolved;
      try {
        resolved = await resolveCatalogItem(v.catalogVendorId, v.catalogPackageId, prisma);
      } catch {
        // Vendor belum ada di DB → dianggap tidak tersedia untuk dicek.
        continue;
      }
      checked++;

      const slot = await prisma.vendorAvailability.findUnique({
        where: { vendorId_date: { vendorId: resolved.vendorId, date: slotDate } },
      });

      if (!slot) continue; // belum ada record = OPEN

      let blocked = false;
      if (slot.status === "BLACKED_OUT" || slot.status === "BOOKED" || slot.status === "RESERVED") {
        blocked = true;
      } else if (
        slot.status === "HELD" &&
        slot.holdExpiresAt &&
        slot.holdExpiresAt.getTime() > now.getTime()
      ) {
        blocked = true;
      }

      if (blocked) {
        conflicts.push({
          catalogVendorId: v.catalogVendorId,
          vendorName: resolved.vendorName,
          reason: STATUS_LABEL[slot.status] ?? "Tidak tersedia",
          status: slot.status,
        });
      }
    }

    const availableCount = checked - conflicts.length;
    return {
      isAllAvailable: conflicts.length === 0,
      conflicts,
      availableCount,
      totalChecked: checked,
    };
  });
}
