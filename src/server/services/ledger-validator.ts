/**
 * HariKita - Double-Entry Ledger Validator (Pure Functions)
 *
 * Sumber kontrak: Phase 1A v3.5 & Phase 1D v14.1.
 *
 * File ini murni (pure) dan bebas I/O database agar dapat diuji secara terisolasi.
 * Dua lapis validasi:
 *   1. Pre-commit invariant dasar (5 aturan)  → `validateLedgerEntries`
 *   2. Audited 12-point validator (v14.1)      → `validateNormalJournal`
 *   3. Reversal validator                      → `validateReversalJournal`
 *
 * Prinsip: seluruh kegagalan dilempar sebagai `LedgerValidationError` dengan `code`
 * yang stabil agar dapat dipetakan ke `AppDomainErrorCode` / respons HTTP.
 */

import type { LedgerJournalType } from "@/types/domain";

// ── Error vocabulary (konsisten dengan src/types/errors.ts) ──────────────────
export type LedgerValidationCode =
  | "LEDGER_INSUFFICIENT_ENTRIES"
  | "LEDGER_INVALID_ENTRY_AMOUNTS"
  | "LEDGER_ZERO_ENTRY"
  | "LEDGER_IMBALANCE"
  | "LEDGER_ENTRY_MISMATCH"
  | "LEDGER_ENTRY_COUNT_MISMATCH"
  | "LEDGER_AMOUNT_MISMATCH"
  | "EXPECTED_AMOUNT_INVALID"
  | "JOURNAL_NUMBER_MISMATCH"
  | "JOURNAL_TYPE_MISMATCH"
  | "JOURNAL_TYPE_INVALID"
  | "JOURNAL_ORDER_MISMATCH"
  | "JOURNAL_INVALID_FOR_NORMAL"
  | "CANNOT_REVERSE_REVERSAL_JOURNAL"
  | "REVERSAL_ORDER_MISMATCH"
  | "REVERSAL_SOURCE_MISMATCH"
  | "REVERSAL_ENTRY_MISMATCH";

export class LedgerValidationError extends Error {
  readonly code: LedgerValidationCode;
  readonly detail?: unknown;

  constructor(code: LedgerValidationCode, message: string, detail?: unknown) {
    super(`LEDGER_ERROR[${code}]: ${message}`);
    this.name = "LedgerValidationError";
    this.code = code;
    this.detail = detail;
  }
}

// ── Bentuk minimal yang divalidasi ───────────────────────────────────────────
export interface LedgerEntryLike {
  accountId: string;
  entityId?: string | null;
  debit: number;
  credit: number;
}

export interface LedgerJournalLike {
  id: string;
  journalNumber: string;
  type: string;
  orderId?: string | null;
  reversalOfId?: string | null;
}

/** Metadata ekspektasi untuk 12-point validation. */
export interface ExpectedJournalMeta {
  journalNumber: string;
  type: Exclude<LedgerJournalType, "REVERSAL">;
  orderId?: string | null;
  /** Total nominal yang diharapkan (dipakai pada point 9 & 10). */
  amount: number;
  /** Daftar entri yang diharapkan (dipakai pada point 12, bijection multiset). */
  entries: LedgerEntryLike[];
}

const REVERSAL_TYPE = "REVERSAL";

// ─────────────────────────────────────────────────────────────────────────────
// LAPIS 1 — Pre-commit invariant dasar (5 aturan)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Memvalidasi spektrum entri jurnal sebelum ditulis ke database.
 *
 * Invariant (Phase 1A v3.5):
 *   1. Minimal 2 entri.
 *   2. Setiap nominal tidak boleh negatif.
 *   3. Mutual-exclusive: satu baris tidak boleh debit>0 DAN credit>0 sekaligus.
 *   4. Tidak boleh entri nol (debit=0 dan credit=0).
 *   5. Σ debit === Σ credit (zero-balance mutlak).
 *
 * @throws {LedgerValidationError}
 */
export function validateLedgerEntries(entries: readonly LedgerEntryLike[]): void {
  // Rule 1 — minimal dua entri.
  if (!Array.isArray(entries) || entries.length < 2) {
    throw new LedgerValidationError(
      "LEDGER_INSUFFICIENT_ENTRIES",
      `Jurnal wajib memiliki minimal dua entri (diberikan: ${entries?.length ?? 0}).`
    );
  }

  let totalDebit = 0;
  let totalCredit = 0;

  for (const entry of entries) {
    const { debit, credit } = entry;

    // Rule 2 — tipe & non-negatif & finite.
    if (
      !Number.isInteger(debit) ||
      !Number.isInteger(credit) ||
      !Number.isFinite(debit) ||
      !Number.isFinite(credit) ||
      debit < 0 ||
      credit < 0
    ) {
      throw new LedgerValidationError(
        "LEDGER_INVALID_ENTRY_AMOUNTS",
        `Nominal entri harus integer >= 0 (debit=${debit}, credit=${credit}).`
      );
    }

    // Rule 4 — entri nol.
    if (debit === 0 && credit === 0) {
      throw new LedgerValidationError(
        "LEDGER_ZERO_ENTRY",
        "Entri jurnal tidak boleh bernilai nol (debit=0 dan credit=0)."
      );
    }

    // Rule 3 — mutual-exclusive.
    if (debit > 0 && credit > 0) {
      throw new LedgerValidationError(
        "LEDGER_INVALID_ENTRY_AMOUNTS",
        `Satu entri tidak boleh memiliki debit dan credit sekaligus (debit=${debit}, credit=${credit}).`
      );
    }

    totalDebit += debit;
    totalCredit += credit;
  }

  // Rule 5 — zero-balance.
  if (totalDebit !== totalCredit) {
    throw new LedgerValidationError(
      "LEDGER_IMBALANCE",
      `Jurnal tidak seimbang. Total Debit (Rp ${totalDebit}) != Total Credit (Rp ${totalCredit}).`,
      { totalDebit, totalCredit }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LAPIS 2 — Audited 12-point validator (Phase 1D v14.1)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Memvalidasi sebuah journal normal terhadap metadata ekspektasi (12 poin).
 *
 * Poin (v14.1 §4.1):
 *   1. journalNumber cocok
 *   2. type cocok dan BUKAN 'REVERSAL'
 *   3. orderId cocok
 *   4. reversalOfId harus null (jurnal normal)
 *   5. jumlah entri cocok
 *   6. nominal integer
 *   7. nominal non-negatif
 *   8. nominal finite
 *   9. total debit === expected.amount
 *  10. total credit === expected.amount
 *  11. total debit === total credit
 *  12. bijection multiset entri (algoritma consumption pool)
 *
 * Guard tambahan: `expected.amount` harus integer > 0 (F12), zero-entry ditolak (F13).
 *
 * @throws {LedgerValidationError}
 */
export function validateNormalJournal(
  journal: LedgerJournalLike,
  actualEntries: readonly LedgerEntryLike[],
  expected: ExpectedJournalMeta
): void {
  // Guard F12 — expected.amount valid lebih dulu.
  if (
    !Number.isInteger(expected.amount) ||
    !Number.isFinite(expected.amount) ||
    expected.amount <= 0
  ) {
    throw new LedgerValidationError(
      "EXPECTED_AMOUNT_INVALID",
      `expected.amount harus integer > 0 (diberikan: ${expected.amount}).`
    );
  }

  // Point 1 — journalNumber.
  if (journal.journalNumber !== expected.journalNumber) {
    throw new LedgerValidationError(
      "JOURNAL_NUMBER_MISMATCH",
      `journalNumber tidak cocok (actual="${journal.journalNumber}", expected="${expected.journalNumber}").`
    );
  }

  // Point 2 — type exact & bukan REVERSAL.
  if (journal.type === REVERSAL_TYPE) {
    throw new LedgerValidationError(
      "JOURNAL_TYPE_INVALID",
      "Jurnal normal tidak boleh bertipe REVERSAL."
    );
  }
  if (journal.type !== expected.type) {
    throw new LedgerValidationError(
      "JOURNAL_TYPE_MISMATCH",
      `type tidak cocok (actual="${journal.type}", expected="${expected.type}").`
    );
  }

  // Point 3 — orderId.
  const actualOrderId = journal.orderId ?? null;
  const expectedOrderId = expected.orderId ?? null;
  if (actualOrderId !== expectedOrderId) {
    throw new LedgerValidationError(
      "JOURNAL_ORDER_MISMATCH",
      `orderId tidak cocok (actual="${actualOrderId}", expected="${expectedOrderId}").`
    );
  }

  // Point 4 — reversalOfId harus null untuk jurnal normal.
  if (journal.reversalOfId !== null && journal.reversalOfId !== undefined) {
    throw new LedgerValidationError(
      "JOURNAL_INVALID_FOR_NORMAL",
      `Jurnal normal tidak boleh memiliki reversalOfId (actual="${journal.reversalOfId}").`
    );
  }

  // Point 5 — jumlah entri.
  if (actualEntries.length !== expected.entries.length) {
    throw new LedgerValidationError(
      "LEDGER_ENTRY_COUNT_MISMATCH",
      `Jumlah entri tidak cocok (actual=${actualEntries.length}, expected=${expected.entries.length}).`
    );
  }

  let totalDebit = 0;
  let totalCredit = 0;

  // Point 6, 7, 8, 11 — validasi per-entri.
  for (const entry of actualEntries) {
    const { debit, credit } = entry;

    if (
      !Number.isInteger(debit) ||
      !Number.isInteger(credit) ||
      !Number.isFinite(debit) ||
      !Number.isFinite(credit)
    ) {
      throw new LedgerValidationError(
        "LEDGER_INVALID_ENTRY_AMOUNTS",
        `Nominal entri harus integer & finite (debit=${debit}, credit=${credit}).`
      );
    }
    if (debit < 0 || credit < 0) {
      throw new LedgerValidationError(
        "LEDGER_INVALID_ENTRY_AMOUNTS",
        `Nominal entri tidak boleh negatif (debit=${debit}, credit=${credit}).`
      );
    }
    if (debit === 0 && credit === 0) {
      throw new LedgerValidationError(
        "LEDGER_ZERO_ENTRY",
        "Entri jurnal tidak boleh bernilai nol (debit=0 dan credit=0)."
      );
    }

    totalDebit += debit;
    totalCredit += credit;
  }

  // Point 9 & 10 — total debit & credit harus sama dengan expected.amount.
  if (totalDebit !== expected.amount) {
    throw new LedgerValidationError(
      "LEDGER_AMOUNT_MISMATCH",
      `Total debit (${totalDebit}) != expected.amount (${expected.amount}).`
    );
  }
  if (totalCredit !== expected.amount) {
    throw new LedgerValidationError(
      "LEDGER_AMOUNT_MISMATCH",
      `Total credit (${totalCredit}) != expected.amount (${expected.amount}).`
    );
  }

  // Point 11 — zero-balance.
  if (totalDebit !== totalCredit) {
    throw new LedgerValidationError(
      "LEDGER_IMBALANCE",
      `Jurnal tidak seimbang (debit=${totalDebit}, credit=${totalCredit}).`
    );
  }

  // Point 12 — bijection multiset.
  assertEntryMultisetBijection(actualEntries, expected.entries);
}

/**
 * Memvalidasi jurnal pembalik terhadap jurnal sumbernya.
 *
 * Kontrak Phase 1D v14.1 §5:
 *   - Langkah 1: validasi PENUH jurnal sumber via validateNormalJournal (cascade).
 *   - Jurnal sumber TIDAK boleh bertipe REVERSAL & reversalOfId harus null.
 *   - reversalOfId jurnal pembalik harus menunjuk ke sumber.
 *   - Entri pembalik = mirror persis (debit↔credit dibalik) dari entri sumber.
 *
 * @throws {LedgerValidationError}
 */
export function validateReversalJournal(
  reversal: LedgerJournalLike,
  reversalEntries: readonly LedgerEntryLike[],
  source: LedgerJournalLike,
  sourceEntries: readonly LedgerEntryLike[],
  sourceExpected: ExpectedJournalMeta
): void {
  // Langkah 1 — validasi penuh sumber (12-point). Jika sumber korup → cascade tolak.
  validateNormalJournal(source, sourceEntries, sourceExpected);

  // Reverse-of-reversal dilarang.
  if (source.type === REVERSAL_TYPE) {
    throw new LedgerValidationError(
      "CANNOT_REVERSE_REVERSAL_JOURNAL",
      "Jurnal REVERSAL tidak boleh dibalik kembali."
    );
  }

  // reversalOfId harus menunjuk ke sumber.
  if (reversal.reversalOfId !== source.id) {
    throw new LedgerValidationError(
      "REVERSAL_SOURCE_MISMATCH",
      `reversalOfId ("${reversal.reversalOfId}") harus menunjuk ke source.id ("${source.id}").`
    );
  }

  // orderId pembalik harus sama dengan sumber.
  const reversalOrderId = reversal.orderId ?? null;
  const sourceOrderId = source.orderId ?? null;
  if (reversalOrderId !== sourceOrderId) {
    throw new LedgerValidationError(
      "REVERSAL_ORDER_MISMATCH",
      `orderId jurnal pembalik ("${reversalOrderId}") != sumber ("${sourceOrderId}").`
    );
  }

  // Jumlah entri harus identik.
  if (reversalEntries.length !== sourceEntries.length) {
    throw new LedgerValidationError(
      "REVERSAL_ENTRY_MISMATCH",
      `Jumlah entri pembalik (${reversalEntries.length}) != sumber (${sourceEntries.length}).`
    );
  }

  // Mirror bijection: setiap entri sumber harus punya pasangan terbalik.
  const mirroredSource: LedgerEntryLike[] = sourceEntries.map((e) => ({
    accountId: e.accountId,
    entityId: e.entityId ?? null,
    debit: e.credit,
    credit: e.debit,
  }));

  try {
    assertEntryMultisetBijection(reversalEntries, mirroredSource);
  } catch {
    throw new LedgerValidationError(
      "REVERSAL_ENTRY_MISMATCH",
      "Entri jurnal pembalik bukan mirror persis (debit↔credit) dari entri sumber."
    );
  }
}

// ── Internal: bijection multiset (consumption pool algorithm) ────────────────
function assertEntryMultisetBijection(
  actual: readonly LedgerEntryLike[],
  expected: readonly LedgerEntryLike[]
): void {
  if (actual.length !== expected.length) {
    throw new LedgerValidationError(
      "LEDGER_ENTRY_MISMATCH",
      `Jumlah entri berbeda dalam pemeriksaan bijection (actual=${actual.length}, expected=${expected.length}).`
    );
  }

  // Pool yang dapat dikonsumsi (mutable copy).
  const pool = expected.map((e) => serializeEntry(e));

  for (const entry of actual) {
    const signature = serializeEntry(entry);
    const idx = pool.indexOf(signature);
    if (idx === -1) {
      throw new LedgerValidationError(
        "LEDGER_ENTRY_MISMATCH",
        `Entri tidak memiliki pasangan di multiset ekspektasi: ${signature}.`
      );
    }
    pool.splice(idx, 1); // konsumsi — mencegah pencocokan ganda.
  }

  if (pool.length !== 0) {
    throw new LedgerValidationError(
      "LEDGER_ENTRY_MISMATCH",
      `Terdapat ${pool.length} entri ekspektasi yang tidak terpakai.`
    );
  }
}

function serializeEntry(entry: LedgerEntryLike): string {
  return JSON.stringify({
    accountId: entry.accountId,
    entityId: entry.entityId ?? null,
    debit: entry.debit,
    credit: entry.credit,
  });
}
