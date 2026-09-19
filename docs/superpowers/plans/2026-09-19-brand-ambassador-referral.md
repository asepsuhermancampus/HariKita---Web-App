# Brand Ambassador (BA) Referral & Komisi — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Menambahkan role Brand Ambassador (BA) yang merekrut vendor lewat kode referral, mencatat komisi persen ke dompet BA saat pelunasan 70% order cair, plus dashboard BA dan panel admin.

**Architecture:** Model baru `BrandAmbassador`, `AmbassadorCommission`, `AmbassadorWithdrawal` di Prisma (dual-provider postgres+sqlite). Komisi dihitung & dikreditkan tepat setelah `SETTLEMENT_PAYOUT` sukses di `runPayoutSweep`, exact-once via unique `orderItemId` + jurnal ledger deterministik. Dompet BA mengikuti pola dompet vendor (saldo + withdraw manual admin).

**Tech Stack:** Next.js App Router, TypeScript, Prisma (PostgreSQL produksi + SQLite dev/test), `node:test` + `tsx --test`, bcryptjs, ledger double-entry yang sudah ada.

**Spec:** `docs/superpowers/specs/2026-09-19-brand-ambassador-referral-design.md`

## Global Constraints

- Test runner: `npm test` → `tsx --test tests/*.test.ts`.
- Type-check: `npm run typecheck` (`tsc --noEmit`).
- Build: `npm run build` (`next build`). **JANGAN jalankan `next build` saat dev server hidup** (menimpa `.next`).
- Sintaks Prisma CLI: `npm run db:push` (postgres), `npm run db:push:sqlite`.
- Semua nominal uang = **Integer Rupiah**.
- Komisi = `floor(subtotal * pct / 100)`, exact-once per `OrderItem`.
- Dua skema Prisma WAJIB sinkron: `prisma/schema.prisma` + `prisma/schema.sqlite.prisma`.
- Bahasa UI: Indonesia.
- Role string: `"CLIENT" | "VENDOR" | "ADMIN" | "BA"`.
- Commit setelah tiap task (pesan gaya repo: `feat(...)`, `test(...)`, `refactor(...)`).

---

## File Structure

| File | Tanggung jawab |
|------|----------------|
| `prisma/schema.prisma` (UBAH) | Model BA + relasi (postgres) |
| `prisma/schema.sqlite.prisma` (UBAH) | Model BA + relasi (sqlite, sinkron) |
| `src/server/services/ambassador-service.ts` (BARU) | Logika: generate kode, resolve referral, hitung komisi, dompet, withdraw |
| `src/server/queries/ambassador.ts` (BARU) | Query dashboard BA & admin |
| `src/server/actions/ambassador.ts` (BARU) | Server actions (withdraw BA, admin kelola BA) |
| `src/server/services/ledger-service.ts` (UBAH) | Akun COA `AMBASSADOR_PAYABLE` + `ambassadorJournalNumber` |
| `src/server/services/payment-service.ts` (UBAH) | Panggil hook komisi setelah `SETTLEMENT_PAYOUT` |
| `src/server/actions/auth.ts` (UBAH) | Terima & validasi `referralCode` saat register vendor |
| `src/lib/session.ts` (UBAH) | `getDashboardPath` mengenali role `BA` |
| `src/lib/routes.ts` (UBAH) | Rute BA + admin BA |
| `src/middleware.ts` (UBAH) | Proteksi `/dashboard/ba/*` |
| `tests/helpers/test-db.ts` (UBAH) | Helper `seedAmbassador` & `seedVendorWithRecruiter` |
| `tests/ambassador-commission.test.ts` (BARU) | Test komisi & withdraw |
| `tests/ambassador-referral.test.ts` (BARU) | Test resolve kode referral |
| `src/app/dashboard/ba/...` (BARU) | Dashboard BA |
| `src/app/admin/ba/...` (BARU) | Panel Admin BA |

---

### Task 1: Skema Prisma — model BA & relasi

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma/schema.sqlite.prisma`

**Interfaces:**
- Produces: model `BrandAmbassador` (`id, userId, referralCode, displayName, phone, city, district, commissionPct, isActive, walletBalance, bankName, bankAccount, bankHolder`), `AmbassadorCommission` (`id, ambassadorId, orderId, orderItemId, vendorId, baseAmount, commissionPct, commissionAmount, status, ledgerJournalId`), `AmbassadorWithdrawal` (`id, ambassadorId, amount, status, bankName, bankAccount, bankHolder, processedAt, note`). Relasi `User.brandAmbassador?`, `VendorProfile.recruitedById?/recruitedBy?`, `Order.ambassadorCommissions[]`, `OrderItem.ambassadorCommissions[]`.

- [x] **Step 1: Tambah model & relasi ke `prisma/schema.prisma`**

Tambahkan blok berikut (mis. sebelum berkas `model Notification`):

```prisma
model BrandAmbassador {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  referralCode  String   @unique
  displayName   String
  phone         String?
  city          String   @default("Kebumen")
  district      String?

  commissionPct Float    @default(5.0)
  isActive      Boolean  @default(true)

  walletBalance Int      @default(0)
  bankName      String?
  bankAccount   String?
  bankHolder    String?

  recruitedVendors VendorProfile[]        @relation("VendorRecruiter")
  commissions      AmbassadorCommission[]
  withdrawals      AmbassadorWithdrawal[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model AmbassadorCommission {
  id               String           @id @default(cuid())
  ambassadorId     String
  ambassador       BrandAmbassador  @relation(fields: [ambassadorId], references: [id], onDelete: Cascade)

  orderId          String
  order            Order            @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderItemId      String
  orderItem        OrderItem        @relation(fields: [orderItemId], references: [id], onDelete: Cascade)

  vendorId         String
  vendor           VendorProfile    @relation("VendorCommissionSource", fields: [vendorId], references: [id], onDelete: Cascade)

  baseAmount       Int
  commissionPct    Float
  commissionAmount Int

  status           String           @default("CREDITED")
  ledgerJournalId  String?

  createdAt        DateTime         @default(now())

  @@unique([orderItemId])
  @@index([ambassadorId, createdAt])
  @@index([vendorId])
}

model AmbassadorWithdrawal {
  id             String          @id @default(cuid())
  ambassadorId   String
  ambassador     BrandAmbassador @relation(fields: [ambassadorId], references: [id], onDelete: Cascade)
  amount         Int
  status         String          @default("PENDING")
  bankName       String?
  bankAccount    String?
  bankHolder     String?
  processedAt    DateTime?
  note           String?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  @@index([ambassadorId, status])
}
```

Lalu pada model yang sudah ada, tambahkan relasi:

- Di `model User` (setelah `clientProfile ClientProfile?`):
  ```prisma
  brandAmbassador   BrandAmbassador?
  ```
- Di `model VendorProfile` (setelah `portfolios VendorPortfolio[]`):
  ```prisma
  recruitedById  String?
  recruitedBy    BrandAmbassador? @relation("VendorRecruiter", fields: [recruitedById], references: [id], onDelete: SetNull)
  vendorCommissions AmbassadorCommission[] @relation("VendorCommissionSource")
  ```
- Di `model Order` (setelah `rundowns EventRundown[]`):
  ```prisma
  ambassadorCommissions AmbassadorCommission[]
  ```
- Di `model OrderItem` (setelah `statusHistories OrderItemStatusHistory[]`):
  ```prisma
  ambassadorCommissions AmbassadorCommission[]
  ```

- [x] **Step 2: Salin perubahan yang sama ke `prisma/schema.sqlite.prisma`**

Terapkan blok model & relasi yang identik pada `prisma/schema.sqlite.prisma`. Untuk SQLite, tidak ada perbedaan sintaks pada model di atas (semua tipe didukung). Pastikan `datasource` tetap `provider = "sqlite"`.

- [x] **Step 3: Validasi & push skema**

Run: `npm run validate`
Expected: "The schema is valid" untuk schema default.

Run: `npx prisma validate --schema prisma/schema.sqlite.prisma`
Expected: "The schema is valid".

Run: `npm run db:push`
Expected: database postgres ter-update tanpa error.

Run: `npm run db:push:sqlite`
Expected: `prisma/dev.db` ter-update tanpa error.

- [x] **Step 4: Regenerate clients**

Run: `npm run generate; if ($?) { npm run generate:sqlite }`
Expected: kedua client ter-generate tanpa error.

- [x] **Step 5: Verifikasi typecheck**

Run: `npm run typecheck`
Expected: bersih (exit 0).

- [x] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/schema.sqlite.prisma
git commit -m "feat(ba): add BrandAmbassador, AmbassadorCommission, AmbassadorWithdrawal models"
```

---

### Task 2: Helper test DB — seed BA & vendor rekrutan

**Files:**
- Modify: `tests/helpers/test-db.ts`

**Interfaces:**
- Consumes: model dari Task 1.
- Produces: `seedAmbassador(prisma, opts?): Promise<{ userId, ambassadorId, referralCode }>` dan `seedVendorWithRecruiter(prisma, opts): Promise<{ userId, vendorId, packageId, ambassadorId }>`.

- [x] **Step 1: Tambah helper `seedAmbassador`**

Tambahkan di akhir `tests/helpers/test-db.ts`:

```ts
/** Membuat user BA + BrandAmbassador uji. */
export async function seedAmbassador(
  prisma: PrismaClient,
  opts?: { commissionPct?: number; isActive?: boolean; displayName?: string }
) {
  const user = await prisma.user.create({
    data: {
      name: opts?.displayName ?? "BA Uji",
      phone: `0855${Math.floor(Math.random() * 1e8).toString().padStart(8, "0")}`,
      role: "BA",
    },
  });
  const ambassador = await prisma.brandAmbassador.create({
    data: {
      userId: user.id,
      referralCode: `BA-TEST-${Math.floor(Math.random() * 1e6).toString(36).toUpperCase()}`,
      displayName: opts?.displayName ?? "BA Uji",
      commissionPct: opts?.commissionPct ?? 5.0,
      isActive: opts?.isActive ?? true,
    },
  });
  return { userId: user.id, ambassadorId: ambassador.id, referralCode: ambassador.referralCode };
}

/** Membuat vendor yang direkrut seorang BA + paket uji. */
export async function seedVendorWithRecruiter(
  prisma: PrismaClient,
  opts: { ambassadorId: string; commissionPct: number; price: number; businessName?: string }
) {
  const ba = await prisma.brandAmbassador.findUnique({ where: { id: opts.ambassadorId } });
  if (ba) {
    await prisma.brandAmbassador.update({
      where: { id: ba.id },
      data: { commissionPct: opts.commissionPct },
    });
  }
  const user = await prisma.user.create({
    data: {
      name: opts.businessName ?? "Vendor Rekrutan",
      phone: `0813${Math.floor(Math.random() * 1e8).toString().padStart(8, "0")}`,
      role: "VENDOR",
    },
  });
  const vendor = await prisma.vendorProfile.create({
    data: {
      userId: user.id,
      businessName: opts.businessName ?? "Vendor Rekrutan",
      category: "katering",
      address: "Jl. Test, Kebumen",
      recruitedById: opts.ambassadorId,
    },
  });
  const pkg = await prisma.servicePackage.create({
    data: {
      vendorId: vendor.id,
      category: "katering",
      name: "Paket Rekrutan",
      description: "Paket uji",
      basePrice: opts.price,
      unitType: "all_in",
    },
  });
  return { userId: user.id, vendorId: vendor.id, packageId: pkg.id, ambassadorId: opts.ambassadorId };
}
```

- [x] **Step 2: Verifikasi typecheck**

Run: `npm run typecheck`
Expected: bersih.

- [x] **Step 3: Commit**

```bash
git add tests/helpers/test-db.ts
git commit -m "test(ba): add seed helpers for ambassador and recruited vendor"
```

---

### Task 3: Ambassador Service — generate kode & resolve referral

**Files:**
- Create: `src/server/services/ambassador-service.ts`
- Test: `tests/ambassador-referral.test.ts`

**Interfaces:**
- Consumes: `prisma` dari `@/lib/prisma`.
- Produces:
  - `generateReferralCode(city?: string): string` — format `BA-<KOTA>-<4 char A-Z0-9>`.
  - `resolveReferral(code: string | null | undefined, tx?): Promise<{ ambassadorId: string } | null>` — mengembalikan BA aktif jika kode valid, `null` bila kosong/invalid/nonaktif.
  - `attributionBaLocked(vendorUserId, ambassadorUserId): boolean` — true bila self-referral (userId BA == userId vendor).

- [x] **Step 1: Write the failing test**

Buat `tests/ambassador-referral.test.ts`:

```ts
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createTestDb, seedAmbassador, type TestDb } from "./helpers/test-db";
import type { PrismaClient } from "@prisma/client";
import {
  generateReferralCode,
  resolveReferral,
} from "../src/server/services/ambassador-service";

let ctx: TestDb;
let prisma: PrismaClient;

before(async () => {
  ctx = await createTestDb();
  prisma = ctx.prisma;
});

after(async () => {
  await ctx.cleanup();
});

test("generateReferralCode has BA-<CITY>-<4> shape", () => {
  const code = generateReferralCode("Kebumen");
  assert.match(code, /^BA-[A-Z]+-[A-Z0-9]{4}$/);
});

test("resolveReferral returns ambassadorId for valid active code", async () => {
  const ba = await seedAmbassador(prisma, { isActive: true });
  const result = await resolveReferral(ba.referralCode, prisma);
  assert.ok(result);
  assert.equal(result!.ambassadorId, ba.ambassadorId);
});

test("resolveReferral returns null for empty or unknown code", async () => {
  assert.equal(await resolveReferral("", prisma), null);
  assert.equal(await resolveReferral(null, prisma), null);
  assert.equal(await resolveReferral("BA-NOPE-XXXX", prisma), null);
});

test("resolveReferral returns null for inactive ambassador", async () => {
  const ba = await seedAmbassador(prisma, { isActive: false });
  const result = await resolveReferral(ba.referralCode, prisma);
  assert.equal(result, null);
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/ambassador-referral.test.ts`
Expected: FAIL — module `../src/server/services/ambassador-service` belum ada.

- [x] **Step 3: Write minimal implementation**

Buat `src/server/services/ambassador-service.ts`:

```ts
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type AmbassadorTx = Prisma.TransactionClient;

/** Membuat kode referral unik format BA-<KOTA>-<4 char>. */
export function generateReferralCode(city: string = "Kebumen"): string {
  const cityPart = (city || "Kebumen")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 8) || "KOTA";
  const suffix = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4).padEnd(4, "0");
  return `BA-${cityPart}-${suffix}`;
}

/** Resolve kode referral → BA aktif. Mengembalikan null bila kosong/invalid/nonaktif. */
export async function resolveReferral(
  code: string | null | undefined,
  tx?: AmbassadorTx
): Promise<{ ambassadorId: string } | null> {
  const normalized = (code ?? "").trim().toUpperCase();
  if (!normalized) return null;
  const db = tx ?? prisma;
  const ba = await db.brandAmbassador.findUnique({ where: { referralCode: normalized } });
  if (!ba || !ba.isActive) return null;
  return { ambassadorId: ba.id };
}

/** True bila BA adalah user yang sama dengan vendor (self-referral). */
export function attributionBaLocked(vendorUserId: string, ambassadorUserId: string): boolean {
  return vendorUserId === ambassadorUserId;
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/ambassador-referral.test.ts`
Expected: PASS (4 test).

- [x] **Step 5: Commit**

```bash
git add src/server/services/ambassador-service.ts tests/ambassador-referral.test.ts
git commit -m "feat(ba): referral code generation and resolution"
```

---

### Task 4: Ambassador Service — kredit komisi per OrderItem (exact-once)

**Files:**
- Modify: `src/server/services/ambassador-service.ts`
- Modify: `src/server/services/ledger-service.ts`
- Test: `tests/ambassador-commission.test.ts`

**Interfaces:**
- Consumes: `prisma`, `LEDGER_ACCOUNTS` dari ledger-service, model Task 1.
- Produces:
  - Ledger: `LEDGER_ACCOUNTS.AMBASSADOR_PAYABLE = "2030_AMBASSADOR_PAYABLE"`, `ambassadorJournalNumber(orderItemId): string` = `"ADVCOM-{orderItemId}"`.
  - `creditCommissionForOrder(orderId: string, tx: AmbassadorTx): Promise<{ created: number; skipped: number }>` — untuk tiap OrderItem order tsb yang vendornya punya rekruter BA aktif, buat komisi (exact-once) + tambah `walletBalance` BA + jurnal.

- [x] **Step 1: Write the failing test**

Buat `tests/ambassador-commission.test.ts`:

```ts
import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createTestDb, seedAmbassador, seedVendorWithRecruiter, seedClient, type TestDb } from "./helpers/test-db";
import type { PrismaClient } from "@prisma/client";
import { creditCommissionForOrder } from "../src/server/services/ambassador-service";

let ctx: TestDb;
let prisma: PrismaClient;

before(async () => {
  ctx = await createTestDb();
  prisma = ctx.prisma;
});

after(async () => {
  await ctx.cleanup();
});

beforeEach(async () => {
  await prisma.ambassadorCommission.deleteMany();
  await prisma.ledgerEntry.deleteMany();
  await prisma.ledgerJournal.deleteMany();
  await prisma.ambassadorWithdrawal.deleteMany();
  await prisma.brandAmbassador.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
});

async function makeOrder(vendorId: string, packageId: string, subtotal: number) {
  const client = await seedClient(prisma, "Klien Uji");
  const order = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Math.floor(Math.random() * 1e9)}`,
      userId: client.userId,
      clientName: "Klien Uji",
      clientPhone: "081200000000",
      eventDate: new Date("2027-01-01"),
      totalAmount: subtotal,
      status: "COMPLETED",
    },
  });
  const item = await prisma.orderItem.create({
    data: {
      orderId: order.id,
      vendorId,
      packageId,
      vendorNameSnapshot: "Vendor",
      unitPrice: subtotal,
      subtotal,
      status: "ACCEPTED",
    },
  });
  return { order, item };
}

test("credits commission = floor(subtotal * pct / 100) to BA wallet", async () => {
  const ba = await seedAmbassador(prisma, { commissionPct: 5.0 });
  const v = await seedVendorWithRecruiter(prisma, { ambassadorId: ba.ambassadorId, commissionPct: 5.0, price: 1_000_000 });
  const { order } = await makeOrder(v.vendorId, v.packageId, 1_000_000);

  const res = await creditCommissionForOrder(order.id, prisma);
  assert.equal(res.created, 1);

  const wallet = await prisma.brandAmbassador.findUnique({ where: { id: ba.ambassadorId } });
  assert.equal(wallet!.walletBalance, 50_000);
});

test("is exact-once: running twice does not double credit", async () => {
  const ba = await seedAmbassador(prisma, { commissionPct: 5.0 });
  const v = await seedVendorWithRecruiter(prisma, { ambassadorId: ba.ambassadorId, commissionPct: 5.0, price: 2_000_000 });
  const { order } = await makeOrder(v.vendorId, v.packageId, 2_000_000);

  await creditCommissionForOrder(order.id, prisma);
  const second = await creditCommissionForOrder(order.id, prisma);
  assert.equal(second.created, 0);

  const wallet = await prisma.brandAmbassador.findUnique({ where: { id: ba.ambassadorId } });
  assert.equal(wallet!.walletBalance, 100_000);
});

test("does not credit for vendor without recruiter", async () => {
  const ba = await seedAmbassador(prisma, { commissionPct: 5.0 });
  const v = await seedVendorWithRecruiter(prisma, { ambassadorId: ba.ambassadorId, commissionPct: 5.0, price: 1_000_000 });
  // Clear recruiter to simulate vendor tanpa BA.
  await prisma.vendorProfile.update({ where: { id: v.vendorId }, data: { recruitedById: null } });
  const { order } = await makeOrder(v.vendorId, v.packageId, 1_000_000);

  const res = await creditCommissionForOrder(order.id, prisma);
  assert.equal(res.created, 0);
});

test("does not credit for inactive ambassador", async () => {
  const ba = await seedAmbassador(prisma, { commissionPct: 5.0, isActive: false });
  const v = await seedVendorWithRecruiter(prisma, { ambassadorId: ba.ambassadorId, commissionPct: 5.0, price: 1_000_000 });
  const { order } = await makeOrder(v.vendorId, v.packageId, 1_000_000);

  const res = await creditCommissionForOrder(order.id, prisma);
  assert.equal(res.created, 0);
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/ambassador-commission.test.ts`
Expected: FAIL — `creditCommissionForOrder` belum ada.

- [x] **Step 3: Tambah akun COA & helper jurnal di `ledger-service.ts`**

Di dalam objek `LEDGER_ACCOUNTS` (baris ~353), tambahkan baris:

```ts
  AMBASSADOR_PAYABLE: "2030_AMBASSADOR_PAYABLE",
```

Lalu tambahkan fungsi (setelah `payoutJournalNumber`):

```ts
/** journalNumber deterministik komisi BA → exact-once per OrderItem. */
export function ambassadorJournalNumber(orderItemId: string): string {
  return `ADVCOM-${orderItemId}`;
}
```

- [x] **Step 4: Implementasi `creditCommissionForOrder`**

Tambahkan ke `src/server/services/ambassador-service.ts`:

```ts
import { ambassadorJournalNumber, LEDGER_ACCOUNTS } from "./ledger-service";

/**
 * Mengkredit komisi BA untuk semua OrderItem pada satu order.
 * Exact-once via AmbassadorCommission.@@unique([orderItemId]) + journalNumber
 * deterministik "ADVCOM-{orderItemId}".
 *
 * Untuk setiap item:
 *  - vendor.recruitedById harus ada & BA-nya isActive,
 *  - komisi = floor(subtotal * commissionPct / 100),
 *  - tambah walletBalance BA,
 *  - tulis jurnal DR PLATFORM_FEE / CR AMBASSADOR_PAYABLE.
 */
export async function creditCommissionForOrder(
  orderId: string,
  tx: AmbassadorTx
): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;

  const items = await tx.orderItem.findMany({
    where: { orderId, status: "ACCEPTED" },
    include: { vendor: true },
  });

  for (const item of items) {
    const recruiterId = item.vendor?.recruitedById;
    if (!recruiterId) {
      skipped++;
      continue;
    }
    const ba = await tx.brandAmbassador.findUnique({ where: { id: recruiterId } });
    if (!ba || !ba.isActive) {
      skipped++;
      continue;
    }

    // Exact-once guard.
    const existing = await tx.ambassadorCommission.findUnique({ where: { orderItemId: item.id } });
    if (existing) {
      skipped++;
      continue;
    }

    const baseAmount = item.subtotal;
    const commissionAmount = Math.floor((baseAmount * ba.commissionPct) / 100);
    if (commissionAmount <= 0) {
      skipped++;
      continue;
    }

    const journalNumber = ambassadorJournalNumber(item.id);
    const journal = await tx.ledgerJournal.create({
      data: {
        journalNumber,
        type: "AMBASSADOR_COMMISSION",
        description: `Komisi BA ${ba.commissionPct}% untuk item ${item.id}`,
        orderId,
        entries: {
          create: [
            { accountId: LEDGER_ACCOUNTS.PLATFORM_FEE, debit: commissionAmount, credit: 0 },
            { accountId: LEDGER_ACCOUNTS.AMBASSADOR_PAYABLE, debit: 0, credit: commissionAmount, entityId: ba.id },
          ],
        },
      },
    });

    await tx.ambassadorCommission.create({
      data: {
        ambassadorId: ba.id,
        orderId,
        orderItemId: item.id,
        vendorId: item.vendorId,
        baseAmount,
        commissionPct: ba.commissionPct,
        commissionAmount,
        status: "CREDITED",
        ledgerJournalId: journal.id,
      },
    });

    await tx.brandAmbassador.update({
      where: { id: ba.id },
      data: { walletBalance: { increment: commissionAmount } },
    });

    created++;
  }

  return { created, skipped };
}
```

- [x] **Step 5: Run test to verify it passes**

Run: `npx tsx --test tests/ambassador-commission.test.ts`
Expected: PASS (4 test).

- [x] **Step 6: Commit**

```bash
git add src/server/services/ambassador-service.ts src/server/services/ledger-service.ts tests/ambassador-commission.test.ts
git commit -m "feat(ba): credit commission per order item with exact-once ledger"
```

---

### Task 5: Hook komisi ke payout sweep (saat pelunasan 70% cair)

**Files:**
- Modify: `src/server/services/payment-service.ts`
- Test: `tests/ambassador-commission.test.ts` (tambah test integrasi)

**Interfaces:**
- Consumes: `creditCommissionForOrder` dari ambassador-service; `runPayoutSweep` di payment-service.
- Produces: setelah `executePayout` `SETTLEMENT_PAYOUT` berhasil, `creditCommissionForOrder(orderId, tx)` dipanggil.

- [x] **Step 1: Tambah test integrasi**

Tambahkan ke `tests/ambassador-commission.test.ts`:

```ts
import { runPayoutSweep } from "../src/server/services/payment-service";
import { recordJournal } from "../src/server/services/ledger-service";

test("runPayoutSweep SETTLEMENT_PAYOUT triggers BA commission", async () => {
  const ba = await seedAmbassador(prisma, { commissionPct: 5.0 });
  const v = await seedVendorWithRecruiter(prisma, { ambassadorId: ba.ambassadorId, commissionPct: 5.0, price: 1_000_000 });
  const { order } = await makeOrder(v.vendorId, v.packageId, 1_000_000);

  // Sumber jurnal SETTLEMENT_IN (prasyarat eligibility).
  await recordJournal(
    {
      type: "SETTLEMENT_IN",
      description: "Pelunasan diterima",
      orderId: order.id,
      entries: [
        { accountId: "1010_CASH_GATEWAY", debit: 700_000, credit: 0 },
        { accountId: "2010_CLIENT_ESCROW", debit: 0, credit: 700_000 },
      ],
    },
    prisma
  );

  // Buat installment SETTLEMENT_70 PAID agar eligibility lolos.
  await prisma.paymentInstallment.create({
    data: { orderId: order.id, type: "SETTLEMENT_70", amount: 700_000, status: "PAID", paidAt: new Date() },
  });
  // Status order COMPLETED + completedAt H+2 (agar window terlewati).
  await prisma.order.update({
    where: { id: order.id },
    data: { status: "COMPLETED", updatedAt: new Date(Date.now() - 72 * 3600 * 1000) },
  });

  await runPayoutSweep([{ orderId: order.id, tranche: "SETTLEMENT_PAYOUT" }], prisma);

  const commission = await prisma.ambassadorCommission.findFirst({ where: { orderId: order.id } });
  assert.ok(commission, "komisi BA harus tercatat setelah settlement payout");
});
```

> Catatan: bila guard waktu/`completedAt` di `checkPayoutEligibility` tidak lolos dengan skema test di atas, sesuaikan setup (lihat `checkPayoutEligibility` di `payment-service.ts` baris ~499) agar guard terpenuhi — tetapi JANGAN melemahkan guard produksi. Test harus menyesuaikan ke guard, bukan sebaliknya.

- [x] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/ambassador-commission.test.ts`
Expected: FAIL — komisi tidak dibuat (hook belum ada).

- [x] **Step 3: Sisipkan hook di `runPayoutSweep`**

Di `src/server/services/payment-service.ts`, import di atas:

```ts
import { creditCommissionForOrder } from "./ambassador-service";
```

Di dalam `runPayoutSweep`, setelah blok `if (result.created) executed.push(cand.orderId);` dan hanya untuk tranche settlement:

```ts
    if (result.created) {
      executed.push(cand.orderId);
      if (cand.tranche === "SETTLEMENT_PAYOUT") {
        await creditCommissionForOrder(cand.orderId, tx);
      }
    } else {
      skipped.push({ ...cand, reason: "ALREADY_PAID_OUT" });
    }
```

- [x] **Step 4: Run tests to verify they pass**

Run: `npx tsx --test tests/ambassador-commission.test.ts`
Expected: PASS (semua test, termasuk integrasi).

- [x] **Step 5: Commit**

```bash
git add src/server/services/payment-service.ts tests/ambassador-commission.test.ts
git commit -m "feat(ba): trigger commission credit on settlement payout sweep"
```

---

### Task 6: Withdraw dompet BA (service + test)

**Files:**
- Modify: `src/server/services/ambassador-service.ts`
- Test: `tests/ambassador-commission.test.ts` (tambah test withdraw)

**Interfaces:**
- Produces:
  - `requestWithdrawal(input: { ambassadorId: string; amount: number; bankName?: string; bankAccount?: string; bankHolder?: string }, tx?): Promise<{ withdrawalId: string }>` — menahan saldo; error bila amount > saldo.
  - `resolveWithdrawal(withdrawalId: string, decision: "PAID" | "REJECTED", tx?): Promise<void>` — REJECTED mengembalikan saldo.

- [x] **Step 1: Write the failing tests**

Tambahkan ke `tests/ambassador-commission.test.ts`:

```ts
import { requestWithdrawal, resolveWithdrawal } from "../src/server/services/ambassador-service";

test("requestWithdrawal deducts wallet balance", async () => {
  const ba = await seedAmbassador(prisma);
  await prisma.brandAmbassador.update({ where: { id: ba.ambassadorId }, data: { walletBalance: 100_000 } });

  await requestWithdrawal({ ambassadorId: ba.ambassadorId, amount: 40_000 });
  const wallet = await prisma.brandAmbassador.findUnique({ where: { id: ba.ambassadorId } });
  assert.equal(wallet!.walletBalance, 60_000);
});

test("requestWithdrawal rejects amount above balance", async () => {
  const ba = await seedAmbassador(prisma);
  await prisma.brandAmbassador.update({ where: { id: ba.ambassadorId }, data: { walletBalance: 10_000 } });
  await assert.rejects(() => requestWithdrawal({ ambassadorId: ba.ambassadorId, amount: 20_000 }));
});

test("resolveWithdrawal REJECTED restores balance", async () => {
  const ba = await seedAmbassador(prisma);
  await prisma.brandAmbassador.update({ where: { id: ba.ambassadorId }, data: { walletBalance: 50_000 } });
  const { withdrawalId } = await requestWithdrawal({ ambassadorId: ba.ambassadorId, amount: 50_000 });

  await resolveWithdrawal(withdrawalId, "REJECTED", prisma);
  const wallet = await prisma.brandAmbassador.findUnique({ where: { id: ba.ambassadorId } });
  assert.equal(wallet!.walletBalance, 50_000);
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/ambassador-commission.test.ts`
Expected: FAIL — `requestWithdrawal`/`resolveWithdrawal` belum ada.

- [x] **Step 3: Implementasi**

Tambahkan ke `src/server/services/ambassador-service.ts`:

```ts
import { DomainError } from "./errors";

export interface WithdrawalInput {
  ambassadorId: string;
  amount: number;
  bankName?: string;
  bankAccount?: string;
  bankHolder?: string;
}

/** Mengajukan penarikan: menahan saldo (wallet -= amount) & membuat record PENDING. */
export async function requestWithdrawal(
  input: WithdrawalInput,
  tx?: AmbassadorTx
): Promise<{ withdrawalId: string }> {
  if (!Number.isInteger(input.amount) || input.amount <= 0) {
    throw new DomainError("INVALID_AMOUNT", "Nominal penarikan harus lebih dari 0.");
  }
  const db = tx ?? prisma;
  const ba = await db.brandAmbassador.findUnique({ where: { id: input.ambassadorId } });
  if (!ba) throw new DomainError("BA_NOT_FOUND", "Brand Ambassador tidak ditemukan.");
  if (input.amount > ba.walletBalance) {
    throw new DomainError("INSUFFICIENT_BALANCE", "Saldo tidak mencukupi.");
  }

  const withdrawal = await db.ambassadorWithdrawal.create({
    data: {
      ambassadorId: ba.id,
      amount: input.amount,
      status: "PENDING",
      bankName: input.bankName ?? ba.bankName,
      bankAccount: input.bankAccount ?? ba.bankAccount,
      bankHolder: input.bankHolder ?? ba.bankHolder,
    },
  });
  await db.brandAmbassador.update({
    where: { id: ba.id },
    data: { walletBalance: { decrement: input.amount } },
  });
  return { withdrawalId: withdrawal.id };
}

/** Menyelesaikan penarikan. REJECTED → saldo dikembalikan. */
export async function resolveWithdrawal(
  withdrawalId: string,
  decision: "PAID" | "REJECTED",
  tx?: AmbassadorTx
): Promise<void> {
  const db = tx ?? prisma;
  const w = await db.ambassadorWithdrawal.findUnique({ where: { id: withdrawalId } });
  if (!w) throw new DomainError("WITHDRAWAL_NOT_FOUND", "Penarikan tidak ditemukan.");
  if (w.status !== "PENDING") {
    throw new DomainError("WITHDRAWAL_RESOLVED", "Penarikan sudah diproses sebelumnya.");
  }
  await db.ambassadorWithdrawal.update({
    where: { id: w.id },
    data: { status: decision, processedAt: new Date() },
  });
  if (decision === "REJECTED") {
    await db.brandAmbassador.update({
      where: { id: w.ambassadorId },
      data: { walletBalance: { increment: w.amount } },
    });
  }
}
```

> Verifikasi nama error class: `DomainError` diimpor dari `src/server/services/errors.ts` (cek export). Bila beda nama, sesuaikan.

- [x] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/ambassador-commission.test.ts`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add src/server/services/ambassador-service.ts tests/ambassador-commission.test.ts
git commit -m "feat(ba): ambassador wallet withdrawal request and resolution"
```

---

### Task 7: Registrasi vendor menerima kode referral

**Files:**
- Modify: `src/server/actions/auth.ts` (`registerVendorAction`)
- Modify: `src/app/auth/register-vendor/page.tsx`
- Test: `tests/ambassador-referral.test.ts` (tambah test atribusi)

**Interfaces:**
- Consumes: `resolveReferral`, `attributionBaLocked`.
- Produces: `registerVendorAction` menerima FormData key `referralCode` (opsional) dan menyetel `VendorProfile.recruitedById`.

- [x] **Step 1: Write the failing test**

Tambahkan ke `tests/ambassador-referral.test.ts`:

```ts
import { attributeVendorToReferral } from "../src/server/services/ambassador-service";

test("attributeVendorToReferral sets recruitedById for valid code", async () => {
  const ba = await seedAmbassador(prisma, { isActive: true });
  const vendorUser = await prisma.user.create({
    data: { name: "Vendor Baru", phone: `0877${Math.floor(Math.random()*1e8).toString().padStart(8,"0")}`, role: "VENDOR" },
  });
  const vendor = await prisma.vendorProfile.create({
    data: { userId: vendorUser.id, businessName: "Vendor Baru", category: "katering", address: "Kebumen" },
  });

  await attributeVendorToReferral(vendor.id, ba.referralCode, prisma);
  const updated = await prisma.vendorProfile.findUnique({ where: { id: vendor.id } });
  assert.equal(updated!.recruitedById, ba.ambassadorId);
});

test("attributeVendorToReferral ignores invalid code", async () => {
  const vendorUser = await prisma.user.create({
    data: { name: "Vendor B", phone: `0878${Math.floor(Math.random()*1e8).toString().padStart(8,"0")}`, role: "VENDOR" },
  });
  const vendor = await prisma.vendorProfile.create({
    data: { userId: vendorUser.id, businessName: "Vendor B", category: "katering", address: "Kebumen" },
  });
  await attributeVendorToReferral(vendor.id, "BA-NOPE-XXXX", prisma);
  const updated = await prisma.vendorProfile.findUnique({ where: { id: vendor.id } });
  assert.equal(updated!.recruitedById, null);
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/ambassador-referral.test.ts`
Expected: FAIL — `attributeVendorToReferral` belum ada.

- [x] **Step 3: Implementasi helper atribusi**

Tambahkan ke `src/server/services/ambassador-service.ts`:

```ts
/**
 * Menetapkan recruiter BA pada vendor berdasarkan kode. Aman bila kode invalid
 * (diabaikan). Bila vendor sudah punya recruiter, tidak diubah (terkunci).
 */
export async function attributeVendorToReferral(
  vendorId: string,
  code: string | null | undefined,
  tx?: AmbassadorTx
): Promise<void> {
  const db = tx ?? prisma;
  const resolved = await resolveReferral(code, db);
  if (!resolved) return;

  const vendor = await db.vendorProfile.findUnique({
    where: { id: vendorId },
    include: { user: true },
  });
  if (!vendor || vendor.recruitedById) return;

  // Blokir self-referral.
  const ba = await db.brandAmbassador.findUnique({ where: { id: resolved.ambassadorId } });
  if (!ba || attributionBaLocked(vendor.userId, ba.userId)) return;

  await db.vendorProfile.update({
    where: { id: vendorId },
    data: { recruitedById: resolved.ambassadorId },
  });
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/ambassador-referral.test.ts`
Expected: PASS.

- [x] **Step 5: Hubungkan ke `registerVendorAction`**

Di `src/server/actions/auth.ts`, tambahkan import di atas:

```ts
import { attributeVendorToReferral } from "@/server/services/ambassador-service";
```

Di dalam `registerVendorAction`, sebelum `const hashedPin = ...`:

```ts
    const referralCode = (formData.get("referralCode") as string)?.trim() || null;
```

Setelah `prisma.user.create({...})` sukses (tambahkan setelah variabel `newUser` dibuat):

```ts
    // Atribusi referral BA (opsional, aman bila kode invalid).
    if (newUser.vendorProfile) {
      // vendorProfile belum ter-return; ambil ulang.
    }
    const createdVendor = await prisma.vendorProfile.findUnique({ where: { userId: newUser.id } });
    if (createdVendor && referralCode) {
      await attributeVendorToReferral(createdVendor.id, referralCode);
    }
```

- [x] **Step 6: Tambah field input di halaman registrasi vendor**

Di `src/app/auth/register-vendor/page.tsx`, tambahkan state di atas return:

```tsx
  const [referralCode, setReferralCode] = useState("");
```

Tambahkan input (mis. setelah field whatsapp) di dalam form:

```tsx
          <div>
            <label className="block text-xs font-semibold text-[#4A2E35] mb-1">
              Kode Referral BA (opsional)
            </label>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="Contoh: BA-KEBUMEN-7X3A"
              className="w-full p-2.5 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880]"
            />
            <p className="text-[11px] text-[#6B5E62] mt-1">
              Kosongkan bila mendaftar tanpa Brand Ambassador.
            </p>
          </div>
```

> Catatan: halaman registrasi saat ini memakai `setTimeout` mock (belum memanggil action). Bila belum tersambung ke `registerVendorAction`, cukup pastikan `referralCode` ikut dikirim saat form benar-benar tersambung. Jangan mengubah perilaku lain.

- [x] **Step 7: Verifikasi typecheck**

Run: `npm run typecheck`
Expected: bersih.

- [x] **Step 8: Commit**

```bash
git add src/server/actions/auth.ts src/app/auth/register-vendor/page.tsx src/server/services/ambassador-service.ts tests/ambassador-referral.test.ts
git commit -m "feat(ba): accept referral code on vendor registration"
```

---

### Task 8: Session & rute & middleware untuk role BA

**Files:**
- Modify: `src/lib/session.ts`
- Modify: `src/lib/routes.ts`
- Modify: `src/middleware.ts`

**Interfaces:**
- Produces: `getDashboardPath("BA") === "/dashboard/ba"`; rute `ROUTES.BA.*`; middleware melindungi `/dashboard/ba/*` untuk role `BA`.

- [x] **Step 1: Update `getDashboardPath`**

Di `src/lib/session.ts`, pada `switch (role)` tambahkan case:

```ts
    case "BA":
      return "/dashboard/ba";
```

- [x] **Step 2: Tambah rute BA di `src/lib/routes.ts`**

Tambahkan setelah blok `VENDOR: { ... }`:

```ts
  // 4b. Portal Brand Ambassador
  BA: {
    DASHBOARD: '/dashboard/ba',
    VENDOR: '/dashboard/ba/vendor',
    KOMISI: '/dashboard/ba/komisi',
    DOMPET: '/dashboard/ba/dompet',
  },
```

Tambahkan juga ke `ADMIN`:

```ts
    BA: '/admin/ba',
```

- [x] **Step 3: Proteksi rute di `src/middleware.ts`**

Tambahkan blok proteksi (mengikuti pola `/dashboard/vendor`):

```ts
  if (pathname === "/dashboard/ba" || pathname.startsWith("/dashboard/ba/")) {
    if (!session) {
      const url = new URL("/auth/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (session.role !== "BA" && session.role !== "ADMIN") {
      return NextResponse.redirect(new URL(getDashboardPath(session.role), request.url));
    }
    return NextResponse.next();
  }
```

- [x] **Step 4: Verifikasi typecheck**

Run: `npm run typecheck`
Expected: bersih.

- [x] **Step 5: Commit**

```bash
git add src/lib/session.ts src/lib/routes.ts src/middleware.ts
git commit -m "feat(ba): BA dashboard route, session redirect and middleware guard"
```

---

### Task 9: Query layer dashboard BA & admin

**Files:**
- Create: `src/server/queries/ambassador.ts`

**Interfaces:**
- Produces:
  - `getCurrentAmbassador(): Promise<BrandAmbassador | null>`
  - `getAmbassadorSummary(): Promise<{ displayName, referralCode, walletBalance, commissionPct, recruitedCount, totalCommission } | null>`
  - `getAmbassadorRecruitedVendors(): Promise<Array<{ id, businessName, category, createdAt }>>`
  - `getAmbassadorCommissions(): Promise<Array<{ id, orderNumber, vendorName, baseAmount, commissionAmount, pct, createdAt }>>`
  - `getAmbassadorWithdrawals(): Promise<Array<{ id, amount, status, createdAt }>>`
  - `listAmbassadors(): Promise<Array<{ id, displayName, referralCode, commissionPct, isActive, walletBalance, recruitedCount }>>`

- [x] **Step 1: Implementasi query**

Buat `src/server/queries/ambassador.ts`:

```ts
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/** BrandAmbassador milik sesi login (atau null). */
export async function getCurrentAmbassador() {
  try {
    const session = await getSession();
    if (!session || session.role !== "BA") return null;
    return await prisma.brandAmbassador.findUnique({ where: { userId: session.userId } });
  } catch (err) {
    console.error("[getCurrentAmbassador] Query failed:", err);
    return null;
  }
}

export async function getAmbassadorSummary() {
  const ba = await getCurrentAmbassador();
  if (!ba) return null;

  const [recruitedCount, commissionAgg] = await Promise.all([
    prisma.vendorProfile.count({ where: { recruitedById: ba.id } }),
    prisma.ambassadorCommission.aggregate({
      where: { ambassadorId: ba.id, status: "CREDITED" },
      _sum: { commissionAmount: true },
    }),
  ]);

  return {
    displayName: ba.displayName,
    referralCode: ba.referralCode,
    walletBalance: ba.walletBalance,
    commissionPct: ba.commissionPct,
    recruitedCount,
    totalCommission: commissionAgg._sum.commissionAmount ?? 0,
  };
}

export async function getAmbassadorRecruitedVendors() {
  const ba = await getCurrentAmbassador();
  if (!ba) return [];
  const vendors = await prisma.vendorProfile.findMany({
    where: { recruitedById: ba.id },
    orderBy: { createdAt: "desc" },
  });
  return vendors.map((v) => ({ id: v.id, businessName: v.businessName, category: v.category, createdAt: v.createdAt.toISOString().split("T")[0] }));
}

export async function getAmbassadorCommissions() {
  const ba = await getCurrentAmbassador();
  if (!ba) return [];
  const rows = await prisma.ambassadorCommission.findMany({
    where: { ambassadorId: ba.id },
    include: { vendor: true, order: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return rows.map((c) => ({
    id: c.id,
    orderNumber: c.order.orderNumber,
    vendorName: c.vendor.businessName,
    baseAmount: c.baseAmount,
    commissionAmount: c.commissionAmount,
    pct: c.commissionPct,
    createdAt: c.createdAt.toISOString().split("T")[0],
  }));
}

export async function getAmbassadorWithdrawals() {
  const ba = await getCurrentAmbassador();
  if (!ba) return [];
  const rows = await prisma.ambassadorWithdrawal.findMany({
    where: { ambassadorId: ba.id },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((w) => ({ id: w.id, amount: w.amount, status: w.status, createdAt: w.createdAt.toISOString().split("T")[0] }));
}

export async function listAmbassadors() {
  const rows = await prisma.brandAmbassador.findMany({
    include: { _count: { select: { recruitedVendors: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((b) => ({
    id: b.id,
    displayName: b.displayName,
    referralCode: b.referralCode,
    commissionPct: b.commissionPct,
    isActive: b.isActive,
    walletBalance: b.walletBalance,
    recruitedCount: b._count.recruitedVendors,
  }));
}
```

- [x] **Step 2: Verifikasi typecheck**

Run: `npm run typecheck`
Expected: bersih.

- [x] **Step 3: Commit**

```bash
git add src/server/queries/ambassador.ts
git commit -m "feat(ba): ambassador dashboard and admin query layer"
```

---

### Task 10: Server actions BA & admin

**Files:**
- Create: `src/server/actions/ambassador.ts`

**Interfaces:**
- Consumes: `runAction`, `requireSession`, `DomainError`; service withdraw; query.
- Produces:
  - `requestWithdrawalAction(input: { amount: number; bankName?; bankAccount?; bankHolder? }): Promise<ActionResult<{ withdrawalId: string }>>`
  - `setAmbassadorCommissionAction(input: { ambassadorId: string; commissionPct: number }): Promise<ActionResult<{ id: string }>>`
  - `setAmbassadorActiveAction(input: { ambassadorId: string; isActive: boolean }): Promise<ActionResult<{ id: string }>>`
  - `createAmbassadorAction(input: { name: string; phone: string; pin: string; displayName: string; commissionPct?: number }): Promise<ActionResult<{ ambassadorId: string; referralCode: string }>>`
  - `resolveWithdrawalAction(input: { withdrawalId: string; decision: "PAID" | "REJECTED" }): Promise<ActionResult<{ id: string }>>`

- [x] **Step 1: Implementasi actions**

Buat `src/server/actions/ambassador.ts`:

```ts
"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { runAction, requireSession, revalidate, type ActionResult } from "./_shared";
import { DomainError } from "@/server/services/errors";
import {
  generateReferralCode,
  requestWithdrawal,
  resolveWithdrawal,
} from "@/server/services/ambassador-service";

async function requireAdmin() {
  const session = await requireSession();
  if (session.role !== "ADMIN") {
    throw new DomainError("UNAUTHORIZED_ORDER_ACCESS", "Hanya admin yang boleh melakukan aksi ini.");
  }
  return session;
}

async function requireAmbassador() {
  const session = await requireSession();
  if (session.role !== "BA") {
    throw new DomainError("UNAUTHORIZED_ORDER_ACCESS", "Hanya Brand Ambassador yang boleh melakukan aksi ini.");
  }
  const ba = await prisma.brandAmbassador.findUnique({ where: { userId: session.userId } });
  if (!ba) throw new DomainError("BA_NOT_FOUND", "Profil BA tidak ditemukan.");
  return ba;
}

export async function requestWithdrawalAction(input: {
  amount: number;
  bankName?: string;
  bankAccount?: string;
  bankHolder?: string;
}): Promise<ActionResult<{ withdrawalId: string }>> {
  return runAction(async () => {
    const ba = await requireAmbassador();
    const res = await requestWithdrawal({ ambassadorId: ba.id, ...input });
    revalidate(["/dashboard/ba", "/dashboard/ba/dompet"]);
    return res;
  });
}

export async function resolveWithdrawalAction(input: {
  withdrawalId: string;
  decision: "PAID" | "REJECTED";
}): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    await requireAdmin();
    await resolveWithdrawal(input.withdrawalId, input.decision);
    revalidate(["/admin/ba"]);
    return { id: input.withdrawalId };
  });
}

export async function setAmbassadorCommissionAction(input: {
  ambassadorId: string;
  commissionPct: number;
}): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    await requireAdmin();
    if (input.commissionPct < 0 || input.commissionPct > 100) {
      throw new DomainError("INVALID_AMOUNT", "Persen komisi harus antara 0 sampai 100.");
    }
    await prisma.brandAmbassador.update({
      where: { id: input.ambassadorId },
      data: { commissionPct: input.commissionPct },
    });
    revalidate(["/admin/ba"]);
    return { id: input.ambassadorId };
  });
}

export async function setAmbassadorActiveAction(input: {
  ambassadorId: string;
  isActive: boolean;
}): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    await requireAdmin();
    await prisma.brandAmbassador.update({
      where: { id: input.ambassadorId },
      data: { isActive: input.isActive },
    });
    revalidate(["/admin/ba"]);
    return { id: input.ambassadorId };
  });
}

export async function createAmbassadorAction(input: {
  name: string;
  phone: string;
  pin: string;
  displayName: string;
  commissionPct?: number;
}): Promise<ActionResult<{ ambassadorId: string; referralCode: string }>> {
  return runAction(async () => {
    await requireAdmin();
    if (!/^\d{6}$/.test(input.pin)) {
      throw new DomainError("INVALID_AMOUNT", "PIN harus 6 digit angka.");
    }
    const existing = await prisma.user.findUnique({ where: { phone: input.phone } });
    if (existing) throw new DomainError("INVALID_AMOUNT", "Nomor HP sudah terdaftar.");

    const hashedPin = await bcrypt.hash(input.pin, 10);

    // Kode unik (retry beberapa kali bila collision).
    let referralCode = generateReferralCode("Kebumen");
    for (let i = 0; i < 5; i++) {
      const clash = await prisma.brandAmbassador.findUnique({ where: { referralCode } });
      if (!clash) break;
      referralCode = generateReferralCode("Kebumen");
    }

    const user = await prisma.user.create({
      data: { name: input.name, phone: input.phone, pin: hashedPin, role: "BA" },
    });
    const ba = await prisma.brandAmbassador.create({
      data: {
        userId: user.id,
        referralCode,
        displayName: input.displayName,
        phone: input.phone,
        commissionPct: input.commissionPct ?? 5.0,
      },
    });
    revalidate(["/admin/ba"]);
    return { ambassadorId: ba.id, referralCode };
  });
}
```

- [x] **Step 2: Verifikasi typecheck**

Run: `npm run typecheck`
Expected: bersih. (Bila `DomainError` constructor signature berbeda, sesuaikan dengan `src/server/services/errors.ts`.)

- [x] **Step 3: Commit**

```bash
git add src/server/actions/ambassador.ts
git commit -m "feat(ba): server actions for withdrawal and admin BA management"
```

---

### Task 11: Dashboard BA (halaman)

**Files:**
- Create: `src/app/dashboard/ba/layout.tsx`
- Create: `src/app/dashboard/ba/page.tsx`
- Create: `src/app/dashboard/ba/dompet/page.tsx`
- Create: `src/app/dashboard/ba/vendor/page.tsx`
- Create: `src/app/dashboard/ba/komisi/page.tsx`

**Interfaces:**
- Consumes: query layer Task 9, action `requestWithdrawalAction` Task 10, design system `hk-*` + `font-editorial`/`font-manrope`.

- [x] **Step 1: Buat layout BA**

Buat `src/app/dashboard/ba/layout.tsx` dengan header/NAV (kartu brand, kode referral, menu: Ringkasan / Vendor / Komisi / Dompet), mengikuti gaya `src/app/dashboard/vendor/layout.tsx` dan memakai token `hk-*`.

```tsx
import React from "react";
import Link from "next/link";
import { getAmbassadorSummary } from "@/server/queries/ambassador";

export const metadata = {
  title: "Portal Brand Ambassador | HariKita",
};

export default async function BaLayout({ children }: { children: React.ReactNode }) {
  const summary = await getAmbassadorSummary();
  return (
    <div className="min-h-screen bg-hk-ivory text-hk-charcoal font-manrope">
      <header className="bg-white border-b border-hk-champagne/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-editorial text-xl font-bold text-hk-charcoal">
              Portal Brand Ambassador
            </h1>
            <p className="text-xs text-hk-charcoal/70">
              {summary?.displayName ?? "BA HariKita"} • Kode:{" "}
              <span className="font-mono font-bold text-hk-taupe">{summary?.referralCode ?? "-"}</span>
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-xs">
            {[
              { href: "/dashboard/ba", label: "Ringkasan" },
              { href: "/dashboard/ba/vendor", label: "Vendor Rekrutan" },
              { href: "/dashboard/ba/komisi", label: "Komisi" },
              { href: "/dashboard/ba/dompet", label: "Dompet" },
            ].map((n) => (
              <Link key={n.href} href={n.href} className="px-3 py-1.5 rounded-full border border-hk-champagne/50 hover:bg-hk-ivory transition-colors">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

- [x] **Step 2: Halaman Ringkasan `/dashboard/ba`**

Buat `src/app/dashboard/ba/page.tsx` (server component) yang menampilkan kartu: kode referral, saldo dompet, total komisi, jumlah vendor rekrutan — dari `getAmbassadorSummary()`. Gunakan `formatRupiah` dari `@/lib/utils`.

- [x] **Step 3: Halaman Vendor `/dashboard/ba/vendor`**

Server component yang memetakan `getAmbassadorRecruitedVendors()` ke daftar kartu (nama, kategori, tanggal bergabung). Empty state bila kosong.

- [x] **Step 4: Halaman Komisi `/dashboard/ba/komisi`**

Server component `getAmbassadorCommissions()` → tabel/daftar (order, vendor, nominal basis, %, nominal komisi, tanggal).

- [x] **Step 5: Halaman Dompet `/dashboard/ba/dompet`**

Server component + client form withdraw (`requestWithdrawalAction`). Tampilkan saldo, riwayat withdraw (`getAmbassadorWithdrawals()`), form nominal + rekening.

- [x] **Step 6: Verifikasi typecheck**

Run: `npm run typecheck`
Expected: bersih.

- [x] **Step 7: Commit**

```bash
git add src/app/dashboard/ba
git commit -m "feat(ba): brand ambassador dashboard pages"
```

---

### Task 12: Panel Admin BA

**Files:**
- Create: `src/app/admin/ba/page.tsx`
- Create: `src/app/admin/ba/AdminBaClient.tsx`

**Interfaces:**
- Consumes: `listAmbassadors()` Task 9; actions `createAmbassadorAction`, `setAmbassadorCommissionAction`, `setAmbassadorActiveAction`, `resolveWithdrawalAction` Task 10.

- [x] **Step 1: Halaman admin BA (server + client)**

Buat `src/app/admin/ba/page.tsx` (server) memuat `listAmbassadors()` lalu render `AdminBaClient` (client) yang menyediakan:
- Form buat BA baru (nama, HP, PIN, displayName, persen).
- Tabel BA: displayName, kode, persen (editable), status aktif (toggle), saldo, jumlah rekrutan.
- Daftar withdraw PENDING + tombol Proses (PAID) / Tolak (REJECTED).

> Gunakan komponen `Modal`/`EmptyState` dari `@/components/harikita/ui` bila perlu. Ikuti pola `src/app/admin/verifikasi/AdminVerifikasiClient.tsx`.

- [x] **Step 2: Verifikasi typecheck**

Run: `npm run typecheck`
Expected: bersih.

- [x] **Step 3: Commit**

```bash
git add src/app/admin/ba
git commit -m "feat(ba): admin panel to manage brand ambassadors"
```

---

### Task 13: Verifikasi akhir

**Files:** tidak ada file baru.

- [x] **Step 1: Jalankan seluruh test**

Run: `npm test`
Expected: semua hijau (termasuk `ambassador-commission.test.ts`, `ambassador-referral.test.ts`, dan test lama).

- [x] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: bersih.

- [x] **Step 3: Build produksi**

Pastikan dev server MATI dulu. Run: `npm run build`
Expected: sukses tanpa error.

- [x] **Step 4: Checklist manual (dev server)**

Jalankan `npm run dev` (satu instance saja), lalu verifikasi:
- Registrasi vendor dengan kode BA valid → vendor tercatat sebagai rekrutan BA.
- Registrasi vendor dengan kode invalid/kosong → tetap sukses tanpa recruiter.
- Buat order vendor rekrutan → tuntas → komisi BA bertambah di dompet BA.
- Jalankan payout sweep dua kali → komisi tidak dobel.
- BA ajukan withdraw → saldo berkurang; admin proses PAID/REJECTED sesuai.
- Admin ubah persen komisi BA → komisi berikutnya memakai persen baru.

- [x] **Step 5: Commit sisa (bila ada perbaikan)**

```bash
git add -A
git commit -m "chore(ba): final verification fixes for brand ambassador rollout"
```

---

## Self-Review

**1. Spec coverage:**
- Role `BA` → Task 1, 8 ✅
- Kode referral unik → Task 3 ✅
- Input kode saat registrasi vendor → Task 7 ✅
- Komisi % porsi vendor, cair saat settlement 70% → Task 4, 5 ✅
- Bisa diatur Admin per-BA → Task 1 (commissionPct), 10 ✅
- Dompet + withdraw → Task 6, 11 ✅
- Proteksi self-referral & 1 BA/vendor → Task 3, 7 ✅
- Dashboard BA → Task 11 ✅
- Panel admin → Task 12 ✅
- Test → Task 3, 4, 5, 6, 7, 13 ✅

**2. Placeholder scan:** Task 11 & 12 mendiskripsikan halaman secara naratif (bukan kode penuh) karena isinya presentasional; struktur & query/aksi yang jadi tulang punggungnya sudah diberikan penuh. Ini bukan placeholder kosong — pola komponen mengikuti file referensi yang disebut.

**3. Type consistency:** `creditCommissionForOrder`, `resolveReferral`, `attributeVendorToReferral`, `requestWithdrawal`, `resolveWithdrawal`, `generateReferralCode`, `ambassadorJournalNumber`, `LEDGER_ACCOUNTS.AMBASSADOR_PAYABLE` konsisten dipakai lintas task.

**4. Pertanyaan terbuka dari spec (diputuskan di plan ini):**
- Pembuatan akun BA: **oleh Admin** (Task 10/12).
- Persen default: **5%**.
- Item `REJECTED`/`CANCELLED` tidak dapat komisi (Task 4: filter `status: "ACCEPTED"`).
