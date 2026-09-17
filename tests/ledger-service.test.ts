import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createTestDb, type TestDb } from "./helpers/test-db";
import type { PrismaClient } from "@prisma/client";

/**
 * LedgerService — DB integration test.
 *
 * Menguji:
 *  - recordJournal menulis jurnal + entri dan menolak invariant yang dilanggar.
 *  - reverseJournal bersifat exact-once (dipanggil dua kali → id yang sama).
 *  - reversal dilarang untuk jurnal REVERSAL.
 *  - append-only: tidak ada method update/delete untuk ledger.
 *
 * Isolasi: memakai helper createTestDb (SQLite temporer) sehingga database
 * pengembangan tidak tersentuh.
 */

let ctx: TestDb;
let prisma: PrismaClient;

before(async () => {
  ctx = await createTestDb();
  prisma = ctx.prisma;
});

after(async () => {
  await ctx.cleanup();
});

// Import the service AFTER env is ready (service reads global prisma otherwise,
// so we always pass the explicit `tx`/client via its optional parameter).
import {
  recordJournal,
  reverseJournal,
  LedgerServiceError,
} from "../src/server/services/ledger-service";

function seedOrderAndVendor() {
  // The ledger FKs are optional (orderId nullable, no vendor FK on entries),
  // so a direct ledger write does not require seeding Orders.
}

test("recordJournal writes a balanced journal with entries", async () => {
  seedOrderAndVendor();
  const recorded = await recordJournal(
    {
      type: "ESCROW_DP_IN",
      description: "DP 30% diterima",
      entries: [
        { accountId: "1010_CASH_GATEWAY", debit: 3_000_000, credit: 0 },
        { accountId: "2010_CLIENT_ESCROW", debit: 0, credit: 3_000_000 },
      ],
    },
    prisma
  );

  assert.ok(recorded.id);
  assert.match(recorded.journalNumber, /^JRN-\d{8}-[0-9A-F]{6}$/);
  assert.equal(recorded.type, "ESCROW_DP_IN");
  assert.equal(recorded.reversalOfId, null);
  assert.equal(recorded.entryCount, 2);

  const entries = await prisma.ledgerEntry.findMany({
    where: { journalId: recorded.id },
  });
  assert.equal(entries.length, 2);
  const debit = entries.reduce((a, e) => a + e.debit, 0);
  const credit = entries.reduce((a, e) => a + e.credit, 0);
  assert.equal(debit, credit);
});

test("recordJournal rejects unbalanced entries before hitting DB", async () => {
  await assert.rejects(
    recordJournal(
      {
        type: "ESCROW_DP_IN",
        description: "unbalanced",
        entries: [
          { accountId: "1010_CASH_GATEWAY", debit: 3_000_000, credit: 0 },
          { accountId: "2010_CLIENT_ESCROW", debit: 0, credit: 1_000 },
        ],
      },
      prisma
    )
  );
});

test("recordJournal refuses to create a REVERSAL journal directly", async () => {
  await assert.rejects(
    recordJournal(
      {
        // @ts-expect-error intentionally passing REVERSAL type
        type: "REVERSAL",
        description: "should fail",
        entries: [
          { accountId: "1010_CASH_GATEWAY", debit: 1_000, credit: 0 },
          { accountId: "2010_CLIENT_ESCROW", debit: 0, credit: 1_000 },
        ],
      },
      prisma
    ),
    (err: unknown) => {
      assert.ok(err instanceof LedgerServiceError);
      assert.equal((err as LedgerServiceError).code, "CANNOT_RECORD_REVERSAL_DIRECTLY");
      return true;
    }
  );
});

test("reverseJournal mirrors entries and is exact-once under repeated calls", async () => {
  const source = await recordJournal(
    {
      type: "SETTLEMENT_IN",
      description: "Pelunasan 70% diterima",
      entries: [
        { accountId: "1010_CASH_GATEWAY", debit: 7_000_000, credit: 0 },
        { accountId: "2010_CLIENT_ESCROW", debit: 0, credit: 7_000_000 },
      ],
    },
    prisma
  );

  const first = await reverseJournal(source.id, "pembatalan klien", prisma);
  const second = await reverseJournal(source.id, "pembatalan klien (retry)", prisma);

  assert.equal(first.id, second.id, "reversal harus exact-once (id sama)");
  assert.equal(first.reversalOfId, source.id);

  const reversalEntries = await prisma.ledgerEntry.findMany({
    where: { journalId: first.id },
  });
  assert.equal(reversalEntries.length, 2);
  // Mirror: debit <-> credit ditukar.
  const cashRow = reversalEntries.find((e) => e.accountId === "1010_CASH_GATEWAY");
  assert.ok(cashRow);
  assert.equal(cashRow!.debit, 0);
  assert.equal(cashRow!.credit, 7_000_000);

  // Hanya boleh ada tepat satu reversal untuk source ini.
  const reversals = await prisma.ledgerJournal.findMany({
    where: { reversalOfId: source.id },
  });
  assert.equal(reversals.length, 1);
});

test("reverseJournal refuses to reverse a REVERSAL journal", async () => {
  const source = await recordJournal(
    {
      type: "ESCROW_DP_IN",
      description: "jurnal untuk chained reversal test",
      entries: [
        { accountId: "1010_CASH_GATEWAY", debit: 500_000, credit: 0 },
        { accountId: "2010_CLIENT_ESCROW", debit: 0, credit: 500_000 },
      ],
    },
    prisma
  );
  const reversal = await reverseJournal(source.id, "batalkan", prisma);

  await assert.rejects(
    reverseJournal(reversal.id, "coba balik lagi", prisma),
    (err: unknown) => {
      assert.ok(err instanceof LedgerServiceError);
      assert.equal((err as LedgerServiceError).code, "CANNOT_REVERSE_REVERSAL_JOURNAL");
      return true;
    }
  );
});

test("LedgerService exposes no update/delete API (immutability surface)", async () => {
  const service = await import("../src/server/services/ledger-service");
  const exported = Object.keys(service);
  assert.ok(!exported.includes("updateJournal"));
  assert.ok(!exported.includes("deleteJournal"));
  assert.ok(!exported.includes("updateLedgerEntry"));
  assert.ok(!exported.includes("deleteLedgerEntry"));
});
