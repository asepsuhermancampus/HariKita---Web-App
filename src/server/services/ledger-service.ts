import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { LedgerJournalType } from "@/types/domain";
import {
  validateLedgerEntries,
  LedgerValidationError,
  type LedgerEntryLike,
  type LedgerJournalLike,
} from "./ledger-validator";

/**
 * HariKita - LedgerService
 *
 * Buku besar double-entry, append-only, dan immutable (Phase 1D v14.1).
 *
 * Prinsip operasional (Wajib):
 *  - TIDAK menyediakan API `update` atau `delete` untuk jurnal/entri. Koreksi
 *    hanya melalui jurnal pembalik (`reverseJournal`).
 *  - `recordJournal()` memvalidasi invariant dasar (≥2 entri, non-negatif,
 *    mutually-exclusive, zero-sum) SEBELUM menulis.
 *  - `reverseJournal()` adalah operasi exact-once via `reversalOfId @unique`.
 *  - Semua method menerima `tx` opsional; jika tidak diberikan, digunakan client
 *    global (namun pemanggil dianjurkan memakai `withTransactionRetry`).
 */

export type LedgerTx = Prisma.TransactionClient;

export interface RecordJournalEntryInput {
  accountId: string;
  entityId?: string | null;
  debit: number;
  credit: number;
}

/** Tipe jurnal yang diizinkan untuk `recordJournal` (selain REVERSAL). */
export type NormalJournalType = Exclude<LedgerJournalType, "REVERSAL">;

export interface RecordJournalInput {
  type: NormalJournalType;
  description: string;
  orderId?: string | null;
  installmentId?: string | null;
  currency?: string;
  /** Nomor jurnal eksplisit (opsional). Jika kosong, dibuatkan otomatis. */
  journalNumber?: string;
  entries: RecordJournalEntryInput[];
}

export interface RecordedJournal {
  id: string;
  journalNumber: string;
  type: string;
  orderId: string | null;
  reversalOfId: string | null;
  entryCount: number;
}

/** Error untuk pelanggaran invariant business ledger. */
export class LedgerServiceError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "LedgerServiceError";
    this.code = code;
  }
}

// Jumlah percobaan regenerasi journalNumber saat P2002 collision.
const JOURNAL_NUMBER_MAX_RETRY = 5;

/**
 * Menulis jurnal double-entry baru (append-only). Memvalidasi invariant dasar
 * sebelum menyimpan. Bila `journalNumber` tidak diberikan, ia di-generate otomatis
 * dengan format `JRN-YYYYMMDD-XXXX` dan di-retry pada collision P2002.
 *
 * @throws {LedgerValidationError} bila entri melanggar invariant.
 * @throws {LedgerServiceError} bila terjadi kegagalan non-contention yang tak terduga.
 */
export async function recordJournal(
  input: RecordJournalInput,
  tx?: LedgerTx
): Promise<RecordedJournal> {
  // Runtime defense-in-depth: meskipun tipe `NormalJournalType` mengecualikan
  // "REVERSAL", pemanggil dapat melewati tipe (mis. via `as any`). Bandingkan
  // sebagai string agar perlindungan runtime tetap berlaku.
  if ((input.type as string) === "REVERSAL") {
    throw new LedgerServiceError(
      "CANNOT_RECORD_REVERSAL_DIRECTLY",
      "Jurnal REVERSAL hanya boleh dibuat via reverseJournal()."
    );
  }

  // Validasi invariant dasar (5 aturan) sebelum menyentuh DB.
  const entryLikes: LedgerEntryLike[] = input.entries.map((e) => ({
    accountId: e.accountId,
    entityId: e.entityId ?? null,
    debit: e.debit,
    credit: e.credit,
  }));
  validateLedgerEntries(entryLikes);

  const db = tx ?? prisma;

  const useExplicitNumber = Boolean(input.journalNumber);
  const maxAttempts = useExplicitNumber ? 1 : JOURNAL_NUMBER_MAX_RETRY;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const journalNumber = input.journalNumber ?? generateJournalNumber(input.type);

    try {
      const created = await db.ledgerJournal.create({
        data: {
          journalNumber,
          type: input.type,
          description: input.description,
          orderId: input.orderId ?? null,
          installmentId: input.installmentId ?? null,
          currency: input.currency ?? "IDR",
          entries: {
            create: input.entries.map((e) => ({
              accountId: e.accountId,
              entityId: e.entityId ?? null,
              debit: e.debit,
              credit: e.credit,
            })),
          },
        },
        include: { _count: { select: { entries: true } } },
      });

      return {
        id: created.id,
        journalNumber: created.journalNumber,
        type: created.type,
        orderId: created.orderId,
        reversalOfId: created.reversalOfId,
        entryCount: created._count.entries,
      };
    } catch (error) {
      lastError = error;

      // Hanya collision pada journalNumber yang boleh diregenerasi.
      if (isJournalNumberCollision(error) && !useExplicitNumber && attempt < maxAttempts) {
        continue;
      }
      throw error;
    }
  }

  throw new LedgerServiceError(
    "JOURNAL_NUMBER_EXHAUSTED",
    `Gagal membuat journalNumber unik setelah ${maxAttempts} percobaan. ` +
      `Penyebab: ${lastError instanceof Error ? lastError.message : String(lastError)}`
  );
}

/**
 * Membuat jurnal pembalik (REVERSAL) untuk jurnal sumber secara exact-once.
 *
 * Kontrak (Phase 1D v14.1 §5):
 *  - Entri pembalik = mirror persis (debit↔credit dibalik) dari entri sumber.
 *  - `reversalOfId @unique` menjamin satu jurnal hanya bisa dibalik SEKALI.
 *  - Jika P2002 pada `reversalOfId` (dua pemanggil concurrent) → idempotent:
 *    baca ulang jurnal pembalik yang ada dan kembalikan.
 *  - Jurnal yang sudah bertipe REVERSAL tidak boleh dibalik lagi.
 *
 * @throws {LedgerServiceError} bila sumber tidak ditemukan / sudah REVERSAL.
 */
export async function reverseJournal(
  sourceJournalId: string,
  reason: string,
  tx?: LedgerTx
): Promise<RecordedJournal> {
  const db = tx ?? prisma;

  const source = await db.ledgerJournal.findUnique({
    where: { id: sourceJournalId },
    include: { entries: true },
  });

  if (!source) {
    throw new LedgerServiceError(
      "SOURCE_JOURNAL_NOT_FOUND",
      `Jurnal sumber "${sourceJournalId}" tidak ditemukan.`
    );
  }

  if (source.type === "REVERSAL") {
    throw new LedgerServiceError(
      "CANNOT_REVERSE_REVERSAL_JOURNAL",
      "Jurnal bertipe REVERSAL tidak boleh dibalik kembali."
    );
  }

  // Idempotency pre-check: jika sudah pernah dibalik, kembalikan yang ada.
  const existingReversal = await db.ledgerJournal.findUnique({
    where: { reversalOfId: sourceJournalId },
    include: { _count: { select: { entries: true } } },
  });
  if (existingReversal) {
    return {
      id: existingReversal.id,
      journalNumber: existingReversal.journalNumber,
      type: existingReversal.type,
      orderId: existingReversal.orderId,
      reversalOfId: existingReversal.reversalOfId,
      entryCount: existingReversal._count.entries,
    };
  }

  // Entri mirror: tukar debit <-> credit.
  const mirroredEntries = source.entries.map((e) => ({
    accountId: e.accountId,
    entityId: e.entityId,
    debit: e.credit,
    credit: e.debit,
  }));

  validateLedgerEntries(
    mirroredEntries.map((e) => ({
      accountId: e.accountId,
      entityId: e.entityId,
      debit: e.debit,
      credit: e.credit,
    }))
  );

  const journalNumber = generateJournalNumber("REVERSAL");

  try {
    const created = await db.ledgerJournal.create({
      data: {
        journalNumber,
        type: "REVERSAL",
        description: `Reversal of ${source.journalNumber}: ${reason}`,
        orderId: source.orderId,
        installmentId: source.installmentId,
        currency: source.currency,
        reversalOfId: source.id,
        entries: { create: mirroredEntries },
      },
      include: { _count: { select: { entries: true } } },
    });

    return {
      id: created.id,
      journalNumber: created.journalNumber,
      type: created.type,
      orderId: created.orderId,
      reversalOfId: created.reversalOfId,
      entryCount: created._count.entries,
    };
  } catch (error) {
    // P2002 pada reversalOfId = duplicate reversal attempt → idempotent reread.
    if (isUniqueConstraintOn(error, "reversalOfId")) {
      const raced = await db.ledgerJournal.findUnique({
        where: { reversalOfId: sourceJournalId },
        include: { _count: { select: { entries: true } } },
      });
      if (raced) {
        return {
          id: raced.id,
          journalNumber: raced.journalNumber,
          type: raced.type,
          orderId: raced.orderId,
          reversalOfId: raced.reversalOfId,
          entryCount: raced._count.entries,
        };
      }
    }
    throw error;
  }
}

/**
 * Mengambil jurnal beserta entri-entrinya sebagai bentuk yang cocok untuk
 * validator (`LedgerJournalLike` + `LedgerEntryLike[]`).
 */
export async function getJournalForValidation(
  journalId: string,
  tx?: LedgerTx
): Promise<{
  journal: LedgerJournalLike;
  entries: LedgerEntryLike[];
} | null> {
  const db = tx ?? prisma;
  const row = await db.ledgerJournal.findUnique({
    where: { id: journalId },
    include: { entries: true },
  });
  if (!row) return null;

  return {
    journal: {
      id: row.id,
      journalNumber: row.journalNumber,
      type: row.type,
      orderId: row.orderId,
      reversalOfId: row.reversalOfId,
    },
    entries: row.entries.map((e) => ({
      accountId: e.accountId,
      entityId: e.entityId,
      debit: e.debit,
      credit: e.credit,
    })),
  };
}

// ── Internal helpers ─────────────────────────────────────────────────────────

/** Generate nomor jurnal format `JRN-YYYYMMDD-XXXX` (WIB). */
export function generateJournalNumber(type: string): string {
  const now = new Date();
  // Konversi ke tanggal kalender WIB.
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const y = wib.getUTCFullYear();
  const m = String(wib.getUTCMonth() + 1).padStart(2, "0");
  const d = String(wib.getUTCDate()).padStart(2, "0");
  const datePart = `${y}${m}${d}`;

  // Suffix acak ber-entropy cukup untuk menghindari collision pada volume pilot.
  const suffix = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .toUpperCase()
    .padStart(6, "0");

  return `JRN-${datePart}-${suffix}`;
}

function isJournalNumberCollision(error: unknown): boolean {
  return isUniqueConstraintOn(error, "journalNumber");
}

function isUniqueConstraintOn(error: unknown, field: string): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: unknown; meta?: { target?: unknown } };
  if (e.code !== "P2002") return false;
  const target = e.meta?.target;
  if (Array.isArray(target)) return target.includes(field);
  if (typeof target === "string") return target.includes(field);
  return false;
}

// Re-export validator types untuk kenyamanan konsumen service.
export { LedgerValidationError } from "./ledger-validator";
