import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createHash, randomUUID } from "node:crypto";
import { getStartOfDayWIB } from "@/lib/date-utils";
import { DomainError } from "./errors";

/**
 * HariKita - AvailabilityService
 *
 * Mengelola integritas slot ketersediaan tanggal vendor (`VendorAvailability`).
 * Leaf node: TIDAK bergantung pada OrderService / PaymentService.
 *
 * State machine (Phase 1D §10.3):
 *   OPEN → HELD (15 menit) → RESERVED → BOOKED
 *   BOOKED tidak pernah otomatis kembali ke OPEN (hanya refund/admin).
 *   BLACKED_OUT hanya dari OPEN; menambah blackout pada RESERVED/BOOKED ditolak.
 *
 * Semua method menerima `tx` opsional; pemanggil dianjurkan memakai
 * `withTransactionRetry` untuk menjamin atomicity lintas domain.
 */

export type AvailabilityTx = Prisma.TransactionClient;

/** Durasi default hold keranjang (menit). */
export const HOLD_DURATION_MINUTES = 15;

export interface ClaimHoldResult {
  slotId: string;
  holdToken: string; // plain token, hanya dikirim ke klien
  holdExpiresAt: Date;
}

export interface ClaimHoldInput {
  vendorId: string;
  /** Tanggal acara (ISO YYYY-MM-DD atau Date); dinormalisasi ke 00:00 WIB. */
  date: string | Date;
  userId?: string | null;
  /** Override TTL hold (menit) — opsional untuk pengujian. */
  holdMinutes?: number;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function normalizeSlotDate(date: string | Date): Date {
  return getStartOfDayWIB(date);
}

/**
 * Mengklaim hold sementara pada slot vendor. Berhasil bila slot `OPEN`, atau
 * `HELD` yang sudah kedaluwarsa. Mengembalikan token plain (hash-nya tersimpan).
 *
 * @throws {DomainError} SLOT_UNAVAILABLE bila slot aktif dipegang pihak lain
 *         (HELD belum kedaluwarsa, RESERVED, BOOKED, atau BLACKED_OUT).
 */
export async function claimHoldSlot(
  input: ClaimHoldInput,
  tx?: AvailabilityTx
): Promise<ClaimHoldResult> {
  const db = tx ?? prisma;
  const date = normalizeSlotDate(input.date);
  const now = new Date();
  const holdMinutes = input.holdMinutes ?? HOLD_DURATION_MINUTES;
  const holdExpiresAt = new Date(now.getTime() + holdMinutes * 60 * 1000);

  // Token plain dikembalikan ke klien; hash yang disimpan.
  const holdToken = randomUUID();
  const holdTokenHash = hashToken(holdToken);

  const existing = await db.vendorAvailability.findUnique({
    where: { vendorId_date: { vendorId: input.vendorId, date } },
  });

  if (!existing) {
    const created = await db.vendorAvailability.create({
      data: {
        vendorId: input.vendorId,
        date,
        status: "HELD",
        holdTokenHash,
        heldByUserId: input.userId ?? null,
        holdExpiresAt,
      },
    });
    return { slotId: created.id, holdToken, holdExpiresAt };
  }

  // Slot terbuka bila OPEN atau HELD yang sudah kadaluarsa.
  const isHeldActive =
    existing.status === "HELD" &&
    existing.holdExpiresAt !== null &&
    existing.holdExpiresAt.getTime() > now.getTime();

  if (existing.status !== "OPEN" && isHeldActive) {
    throw new DomainError(
      "SLOT_UNAVAILABLE",
      `Slot vendor pada tanggal tersebut sedang dipegang atau terkunci (status=${existing.status}).`,
      { slotId: existing.id, status: existing.status }
    );
  }
  if (existing.status === "RESERVED" || existing.status === "BOOKED" || existing.status === "BLACKED_OUT") {
    throw new DomainError(
      "SLOT_UNAVAILABLE",
      `Slot vendor tidak tersedia (status=${existing.status}).`,
      { slotId: existing.id, status: existing.status }
    );
  }

  // Klaim ulang slot OPEN atau HELD kedaluwarsa.
  const updated = await db.vendorAvailability.update({
    where: { id: existing.id },
    data: {
      status: "HELD",
      holdTokenHash,
      heldByUserId: input.userId ?? null,
      holdExpiresAt,
    },
  });
  return { slotId: updated.id, holdToken, holdExpiresAt };
}

export interface PromoteSlotInput {
  vendorId: string;
  date: string | Date;
  holdToken: string;
  orderItemId: string;
}

/**
 * Memverifikasi token hold dan mempromosikan slot HELD → RESERVED, mengikatnya
 * ke `orderItemId` (relasi 1:1). Kegagalan token / kedaluwarsa / status ditolak.
 *
 * @throws {DomainError} HOLD_TOKEN_INVALID | HOLD_EXPIRED | SLOT_UNAVAILABLE
 */
export async function verifyAndPromoteSlot(
  input: PromoteSlotInput,
  tx?: AvailabilityTx
): Promise<void> {
  const db = tx ?? prisma;
  const date = normalizeSlotDate(input.date);
  const now = new Date();

  const slot = await db.vendorAvailability.findUnique({
    where: { vendorId_date: { vendorId: input.vendorId, date } },
  });

  if (!slot) {
    throw new DomainError(
      "INVALID_AVAILABILITY_TRANSITION",
      "Slot ketersediaan belum di-hold untuk vendor & tanggal ini.",
      { vendorId: input.vendorId }
    );
  }

  if (slot.status !== "HELD") {
    throw new DomainError(
      "SLOT_UNAVAILABLE",
      `Slot tidak dalam status HELD (status=${slot.status}).`,
      { slotId: slot.id }
    );
  }

  if (!slot.holdTokenHash || slot.holdTokenHash !== hashToken(input.holdToken)) {
    throw new DomainError(
      "HOLD_TOKEN_INVALID",
      "Token hold tidak cocok.",
      { slotId: slot.id }
    );
  }

  if (!slot.holdExpiresAt || slot.holdExpiresAt.getTime() <= now.getTime()) {
    throw new DomainError(
      "HOLD_EXPIRED",
      "Hold slot sudah kedaluwarsa. Silakan klaim ulang.",
      { slotId: slot.id }
    );
  }

  await db.vendorAvailability.update({
    where: { id: slot.id },
    data: {
      status: "RESERVED",
      orderItemId: input.orderItemId,
      heldByUserId: null,
      holdTokenHash: null,
      holdExpiresAt: null,
    },
  });
}

/**
 * Mempromosikan seluruh slot RESERVED milik item-item pesanan menjadi BOOKED.
 * Dipanggil saat DP/FULL terbayar. Idempotent: slot yang sudah BOOKED tak berubah.
 */
export async function bookReservedSlots(
  orderItemIds: string[],
  tx?: AvailabilityTx
): Promise<number> {
  const db = tx ?? prisma;
  if (orderItemIds.length === 0) return 0;
  const result = await db.vendorAvailability.updateMany({
    where: { orderItemId: { in: orderItemIds }, status: "RESERVED" },
    data: { status: "BOOKED" },
  });
  return result.count;
}

/**
 * Melepas slot RESERVED kembali ke OPEN (dipakai saat vendor menolak item atau
 * pesanan kedaluwarsa SEBELUM DP). Slot BOOKED TIDAK dilepas di sini.
 */
export async function releaseReservedSlot(
  orderItemId: string,
  tx?: AvailabilityTx
): Promise<boolean> {
  const db = tx ?? prisma;
  const result = await db.vendorAvailability.updateMany({
    where: { orderItemId, status: "RESERVED" },
    data: {
      status: "OPEN",
      orderItemId: null,
      reservationExpiresAt: null,
      heldByUserId: null,
      holdTokenHash: null,
      holdExpiresAt: null,
    },
  });
  return result.count > 0;
}

/**
 * Melepas slot BOOKED kembali ke OPEN — HANYA dipakai oleh alur refund/dispute
 * yang disetujui admin. Tidak pernah dipanggil otomatis.
 */
export async function releaseBookedSlotForRefund(
  orderItemId: string,
  tx?: AvailabilityTx
): Promise<boolean> {
  const db = tx ?? prisma;
  const result = await db.vendorAvailability.updateMany({
    where: { orderItemId, status: "BOOKED" },
    data: {
      status: "OPEN",
      orderItemId: null,
      reservationExpiresAt: null,
    },
  });
  return result.count > 0;
}

/**
 * Menyapu slot HELD yang sudah kedaluwarsa menjadi OPEN (cron berkala).
 * Mengembalikan jumlah slot yang dilepas. Idempotent.
 */
export async function sweepExpiredHolds(tx?: AvailabilityTx): Promise<number> {
  const db = tx ?? prisma;
  const now = new Date();
  const result = await db.vendorAvailability.updateMany({
    where: {
      status: "HELD",
      holdExpiresAt: { lte: now },
    },
    data: {
      status: "OPEN",
      holdTokenHash: null,
      heldByUserId: null,
      holdExpiresAt: null,
    },
  });
  return result.count;
}

export interface SetBlackoutInput {
  vendorId: string;
  date: string | Date;
  reason?: string;
}

/**
 * Menandai tanggal sebagai BLACKED_OUT (vendor menutup tanggal mandiri).
 * Ditolak jika slot sedang RESERVED/BOOKED (bentrok dengan pesanan klien aktif).
 *
 * @throws {DomainError} SLOT_UNAVAILABLE bila slot terkunci pesanan.
 */
export async function setBlackoutDate(
  input: SetBlackoutInput,
  tx?: AvailabilityTx
): Promise<void> {
  const db = tx ?? prisma;
  const date = normalizeSlotDate(input.date);

  const existing = await db.vendorAvailability.findUnique({
    where: { vendorId_date: { vendorId: input.vendorId, date } },
  });

  if (existing && (existing.status === "RESERVED" || existing.status === "BOOKED")) {
    throw new DomainError(
      "SLOT_UNAVAILABLE",
      "Tidak dapat menutup tanggal: terdapat pesanan klien aktif yang mengunci slot ini.",
      { slotId: existing.id, status: existing.status }
    );
  }

  if (existing) {
    await db.vendorAvailability.update({
      where: { id: existing.id },
      data: {
        status: "BLACKED_OUT",
        holdTokenHash: null,
        heldByUserId: null,
        holdExpiresAt: null,
      },
    });
    return;
  }

  await db.vendorAvailability.create({
    data: { vendorId: input.vendorId, date, status: "BLACKED_OUT" },
  });
}

/**
 * Menghapus blackout date (BLACKED_OUT → OPEN). Ditolak jika slot terkunci pesanan.
 */
export async function removeBlackoutDate(
  vendorId: string,
  date: string | Date,
  tx?: AvailabilityTx
): Promise<void> {
  const db = tx ?? prisma;
  const normalized = normalizeSlotDate(date);
  await db.vendorAvailability.updateMany({
    where: { vendorId, date: normalized, status: "BLACKED_OUT" },
    data: { status: "OPEN" },
  });
}

/** Membaca status slot efektif (HELD kedaluwarsa dibaca sebagai OPEN). */
export async function getEffectiveSlotStatus(
  vendorId: string,
  date: string | Date,
  tx?: AvailabilityTx
): Promise<"OPEN" | "HELD" | "RESERVED" | "BOOKED" | "BLACKED_OUT" | "NONE"> {
  const db = tx ?? prisma;
  const slot = await db.vendorAvailability.findUnique({
    where: { vendorId_date: { vendorId, date: normalizeSlotDate(date) } },
  });
  if (!slot) return "NONE";

  if (
    slot.status === "HELD" &&
    (!slot.holdExpiresAt || slot.holdExpiresAt.getTime() <= Date.now())
  ) {
    return "OPEN";
  }
  return slot.status as "OPEN" | "HELD" | "RESERVED" | "BOOKED" | "BLACKED_OUT";
}
