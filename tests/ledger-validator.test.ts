import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateLedgerEntries,
  validateNormalJournal,
  validateReversalJournal,
  LedgerValidationError,
  type LedgerEntryLike,
  type LedgerJournalLike,
  type ExpectedJournalMeta,
} from "../src/server/services/ledger-validator";

// ── Helper builders ──────────────────────────────────────────────────────────
const entry = (
  accountId: string,
  debit: number,
  credit: number,
  entityId: string | null = null
): LedgerEntryLike => ({ accountId, entityId, debit, credit });

const journal = (
  overrides: Partial<LedgerJournalLike> = {}
): LedgerJournalLike => ({
  id: "jrn_1",
  journalNumber: "JRN-20261120-000001",
  type: "ESCROW_DP_IN",
  orderId: "ord_1",
  reversalOfId: null,
  ...overrides,
});

function expectCode(fn: () => void, code: string) {
  try {
    fn();
    assert.fail(`Diharapkan error ${code}, tetapi tidak ada error.`);
  } catch (err) {
    assert.ok(err instanceof LedgerValidationError, "error harus LedgerValidationError");
    assert.equal((err as LedgerValidationError).code, code);
  }
}

// ── Lapis 1: pre-commit invariants ───────────────────────────────────────────
test("validateLedgerEntries accepts a balanced two-entry journal", () => {
  assert.doesNotThrow(() =>
    validateLedgerEntries([
      entry("1010_CASH_GATEWAY", 3_000_000, 0),
      entry("2010_CLIENT_ESCROW", 0, 3_000_000),
    ])
  );
});

test("validateLedgerEntries rejects fewer than two entries", () => {
  expectCode(
    () => validateLedgerEntries([entry("1010_CASH_GATEWAY", 1, 0)]),
    "LEDGER_INSUFFICIENT_ENTRIES"
  );
});

test("validateLedgerEntries rejects negative amounts", () => {
  expectCode(
    () =>
      validateLedgerEntries([
        entry("1010_CASH_GATEWAY", -1, 0),
        entry("2010_CLIENT_ESCROW", 0, 1),
      ]),
    "LEDGER_INVALID_ENTRY_AMOUNTS"
  );
});

test("validateLedgerEntries rejects non-integer amounts", () => {
  expectCode(
    () =>
      validateLedgerEntries([
        entry("1010_CASH_GATEWAY", 1.5, 0),
        entry("2010_CLIENT_ESCROW", 0, 1.5),
      ]),
    "LEDGER_INVALID_ENTRY_AMOUNTS"
  );
});

test("validateLedgerEntries rejects a zero-value entry", () => {
  expectCode(
    () =>
      validateLedgerEntries([
        entry("1010_CASH_GATEWAY", 0, 0),
        entry("2010_CLIENT_ESCROW", 0, 0),
      ]),
    "LEDGER_ZERO_ENTRY"
  );
});

test("validateLedgerEntries rejects debit and credit on the same line", () => {
  expectCode(
    () =>
      validateLedgerEntries([
        entry("1010_CASH_GATEWAY", 100, 100),
        entry("2010_CLIENT_ESCROW", 0, 0),
      ]),
    "LEDGER_INVALID_ENTRY_AMOUNTS"
  );
});

test("validateLedgerEntries rejects imbalance", () => {
  expectCode(
    () =>
      validateLedgerEntries([
        entry("1010_CASH_GATEWAY", 3_000_000, 0),
        entry("2010_CLIENT_ESCROW", 0, 2_000_000),
      ]),
    "LEDGER_IMBALANCE"
  );
});

// ── Lapis 2: 12-point normal journal validator ───────────────────────────────
const goodEntries: LedgerEntryLike[] = [
  entry("1010_CASH_GATEWAY", 3_000_000, 0),
  entry("2010_CLIENT_ESCROW", 0, 3_000_000),
];

const goodExpected: ExpectedJournalMeta = {
  journalNumber: "JRN-20261120-000001",
  type: "ESCROW_DP_IN",
  orderId: "ord_1",
  amount: 3_000_000,
  entries: goodEntries,
};

test("validateNormalJournal passes a fully-consistent journal", () => {
  assert.doesNotThrow(() =>
    validateNormalJournal(journal(), goodEntries, goodExpected)
  );
});

test("validateNormalJournal rejects invalid expected.amount (F12)", () => {
  expectCode(
    () =>
      validateNormalJournal(journal(), goodEntries, {
        ...goodExpected,
        amount: 0,
      }),
    "EXPECTED_AMOUNT_INVALID"
  );
  expectCode(
    () =>
      validateNormalJournal(journal(), goodEntries, {
        ...goodExpected,
        amount: -100,
      }),
    "EXPECTED_AMOUNT_INVALID"
  );
});

test("validateNormalJournal rejects journalNumber mismatch (point 1)", () => {
  expectCode(
    () =>
      validateNormalJournal(
        journal({ journalNumber: "OTHER" }),
        goodEntries,
        goodExpected
      ),
    "JOURNAL_NUMBER_MISMATCH"
  );
});

test("validateNormalJournal rejects type mismatch (point 2)", () => {
  expectCode(
    () =>
      validateNormalJournal(
        journal({ type: "SETTLEMENT_IN" }),
        goodEntries,
        goodExpected
      ),
    "JOURNAL_TYPE_MISMATCH"
  );
});

test("validateNormalJournal rejects REVERSAL type for normal journal (point 2b)", () => {
  expectCode(
    () =>
      validateNormalJournal(
        journal({ type: "REVERSAL" }),
        goodEntries,
        goodExpected
      ),
    "JOURNAL_TYPE_INVALID"
  );
});

test("validateNormalJournal rejects orderId mismatch (point 3)", () => {
  expectCode(
    () =>
      validateNormalJournal(
        journal({ orderId: "ord_other" }),
        goodEntries,
        goodExpected
      ),
    "JOURNAL_ORDER_MISMATCH"
  );
});

test("validateNormalJournal rejects non-null reversalOfId on a normal journal (point 4)", () => {
  expectCode(
    () =>
      validateNormalJournal(
        journal({ reversalOfId: "jrn_x" }),
        goodEntries,
        goodExpected
      ),
    "JOURNAL_INVALID_FOR_NORMAL"
  );
});

test("validateNormalJournal rejects entry count mismatch (point 5)", () => {
  expectCode(
    () =>
      validateNormalJournal(
        journal(),
        [entry("1010_CASH_GATEWAY", 3_000_000, 0)],
        goodExpected
      ),
    "LEDGER_ENTRY_COUNT_MISMATCH"
  );
});

test("validateNormalJournal rejects amount mismatch with expected (points 9/10)", () => {
  expectCode(
    () =>
      validateNormalJournal(journal(), goodEntries, {
        ...goodExpected,
        amount: 1_000,
      }),
    "LEDGER_AMOUNT_MISMATCH"
  );
});

test("validateNormalJournal rejects account mismatch via multiset bijection (point 12)", () => {
  const wrongAccounts = [
    entry("1010_CASH_GATEWAY", 3_000_000, 0),
    entry("9999_WRONG", 0, 3_000_000),
  ];
  expectCode(
    () => validateNormalJournal(journal(), wrongAccounts, goodExpected),
    "LEDGER_ENTRY_MISMATCH"
  );
});

test("validateNormalJournal supports multiset with duplicate entries", () => {
  const dupEntries = [
    entry("1010_CASH_GATEWAY", 1_000_000, 0),
    entry("1010_CASH_GATEWAY", 2_000_000, 0),
    entry("2010_CLIENT_ESCROW", 0, 3_000_000),
  ];
  const expected: ExpectedJournalMeta = {
    journalNumber: "JRN-20261120-000001",
    type: "ESCROW_DP_IN",
    orderId: "ord_1",
    amount: 3_000_000,
    entries: dupEntries,
  };
  assert.doesNotThrow(() => validateNormalJournal(journal(), dupEntries, expected));
});

// ── Lapis 3: reversal validator ──────────────────────────────────────────────
const sourceJournal = journal({ id: "src_1" });
const sourceEntries: LedgerEntryLike[] = [
  entry("1010_CASH_GATEWAY", 3_000_000, 0),
  entry("2010_CLIENT_ESCROW", 0, 3_000_000),
];
const sourceExpected: ExpectedJournalMeta = {
  journalNumber: sourceJournal.journalNumber,
  type: "ESCROW_DP_IN",
  orderId: sourceJournal.orderId,
  amount: 3_000_000,
  entries: sourceEntries,
};

const reversalJournal = journal({
  id: "rev_1",
  type: "REVERSAL",
  reversalOfId: "src_1",
});
const reversalEntries: LedgerEntryLike[] = [
  entry("1010_CASH_GATEWAY", 0, 3_000_000),
  entry("2010_CLIENT_ESCROW", 3_000_000, 0),
];

test("validateReversalJournal accepts a proper mirrored reversal", () => {
  assert.doesNotThrow(() =>
    validateReversalJournal(
      reversalJournal,
      reversalEntries,
      sourceJournal,
      sourceEntries,
      sourceExpected
    )
  );
});

test("validateReversalJournal cascades source corruption (unbalanced source)", () => {
  const corruptSource = [
    entry("1010_CASH_GATEWAY", 4_000_000, 0),
    entry("2010_CLIENT_ESCROW", 0, 4_000_000),
  ];
  expectCode(
    () =>
      validateReversalJournal(
        reversalJournal,
        reversalEntries,
        sourceJournal,
        corruptSource,
        sourceExpected
      ),
    "LEDGER_AMOUNT_MISMATCH"
  );
});

test("validateReversalJournal cascades rejection when source is itself a REVERSAL journal", () => {
  // Per spec §5.2: source pre-validation runs FIRST, so an invalid REVERSAL source
  // is rejected at the source-validation layer (JOURNAL_TYPE_INVALID) before the
  // reversal-specific checks are reached. This is the intended cascade behaviour.
  const reversalSource = journal({ id: "src_2", type: "REVERSAL", reversalOfId: "x" });
  expectCode(
    () =>
      validateReversalJournal(
        journal({ id: "rev_2", type: "REVERSAL", reversalOfId: "src_2" }),
        reversalEntries,
        reversalSource,
        sourceEntries,
        sourceExpected
      ),
    "JOURNAL_TYPE_INVALID"
  );
});

test("validateReversalJournal rejects wrong reversalOfId target", () => {
  expectCode(
    () =>
      validateReversalJournal(
        journal({ id: "rev_3", type: "REVERSAL", reversalOfId: "wrong" }),
        reversalEntries,
        sourceJournal,
        sourceEntries,
        sourceExpected
      ),
    "REVERSAL_SOURCE_MISMATCH"
  );
});

test("validateReversalJournal rejects non-mirrored entries", () => {
  const wrongMirror = [
    entry("1010_CASH_GATEWAY", 0, 1_000),
    entry("2010_CLIENT_ESCROW", 1_000, 0),
  ];
  expectCode(
    () =>
      validateReversalJournal(
        reversalJournal,
        wrongMirror,
        sourceJournal,
        sourceEntries,
        sourceExpected
      ),
    "REVERSAL_ENTRY_MISMATCH"
  );
});
