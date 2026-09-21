# Platform Settings + Order Snapshot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pusatkan seluruh persentase finansial (DP, settlement, platform fee + rinciannya, default komisi BA) ke satu konfigurasi yang dapat diedit Super Admin, dan snapshot nilai yang berlaku ke setiap `Order` saat dibuat.

**Architecture:** Tabel singleton `PlatformSetting` + `PlatformFeeComponent` (CRUD penuh). Satu service `platform-settings-service.ts` menyediakan `getPlatformSettings` (fallback default, tidak throw) dan `updatePlatformSettings` (validasi + audit). Pembaca runtime (`splitTranches`, `createOrder`, aksi buat BA, cart) membaca config/snapshot, bukan hardcode. Panel Super Admin `/admin/pengaturan`. **Tidak mengubah split ledger.**

**Tech Stack:** TypeScript, Next.js App Router (server actions + server components), Prisma (dual-provider SQLite dev + PostgreSQL prod), test runner `node:test` via `tsx`.

**Spec:** `docs/superpowers/specs/2026-09-21-platform-settings-design.md`

## Global Constraints

- **Jangan** mengubah cara ledger membagi uang (`executePayout` tetap `DR CLIENT_ESCROW / CR VENDOR_PAYABLE`). Non-tujuan dari spec.
- Snapshot ke `Order` saat dibuat; perubahan config **tidak** boleh retroaktif.
- Persentase disimpan sebagai **Int** (0–100), bukan Float.
- Validasi: `dpPct + settlementPct = 100`; tiap pct ∈ [0,100]; total komponen fee = `platformFeePct`.
- Perubahan pada `splitTranches`/`cart-store` **kompatibel-mundur**: parameter opsional dengan default = nilai lama (30) agar test & pemanggil lama tetap benar.
- Izin tulis: hanya `MANAGE_PLATFORM_SETTINGS` (SUPER_ADMIN). Read: `VIEW_ADMIN`.
- Dua schema Prisma (`prisma/schema.prisma` + `prisma/schema.sqlite.prisma`) sinkron.
- `getPlatformSettings` **tidak throw** (fallback default bila belum ada baris).
- Verifikasi akhir: prisma validate (kedua), `npm run generate` + `npm run generate:sqlite`, `npm run typecheck`, `npm test`, `npm run build`.
- Backup `prisma/dev.db` sebelum db push (AGENTS.md §5.13).

---

### Task 1: Schema — `PlatformSetting`, `PlatformFeeComponent`, `Order.snapshot*` (kedua provider)

**Files:**
- Modify: `prisma/schema.prisma` (Order model ~line 168; tambah 2 model di akhir)
- Modify: `prisma/schema.sqlite.prisma`
- Test: verifikasi via prisma validate/generate/push

**Interfaces:**
- Produces: model `PlatformSetting` (id, dpPct, settlementPct, platformFeePct, defaultBaCommissionPct, isActive, updatedById, updatedByName, createdAt, updatedAt, components[]), model `PlatformFeeComponent` (id, settingId, label, pct, sortOrder, timestamps), dan `Order.snapshotDpPct/snapshotSettlementPct/snapshotPlatformFeePct` (`Int?`).

- [ ] **Step 1: Backup dev.db**

Run: `copy prisma\dev.db prisma\dev.db.bak`
Expected: `prisma/dev.db.bak` dibuat (jika dev.db ada).

- [ ] **Step 2: Tambah model `PlatformSetting` + `PlatformFeeComponent` di akhir `prisma/schema.prisma`**

```prisma
/// Konfigurasi finansial platform (singleton — satu baris aktif).
model PlatformSetting {
  id                     String                 @id @default(cuid())
  dpPct                  Int                    @default(30)
  settlementPct          Int                    @default(70)
  platformFeePct         Int                    @default(10)
  defaultBaCommissionPct Int                    @default(5)
  isActive               Boolean                @default(true)
  updatedById            String?
  updatedByName          String?
  createdAt              DateTime               @default(now())
  updatedAt              DateTime               @updatedAt

  components             PlatformFeeComponent[]
}

/// Rincian komponen platform fee (mis. Operasional, Marketing). Total = platformFeePct.
model PlatformFeeComponent {
  id        String          @id @default(cuid())
  settingId String
  setting   PlatformSetting @relation(fields: [settingId], references: [id], onDelete: Cascade)
  label     String
  pct       Int
  sortOrder Int             @default(0)
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt

  @@index([settingId, sortOrder])
}
```

- [ ] **Step 3: Tambah kolom snapshot ke `model Order` di `prisma/schema.prisma`**

Sisipkan setelah baris `totalAmount ...` pada `model Order`:
```prisma
  snapshotDpPct          Int?
  snapshotSettlementPct  Int?
  snapshotPlatformFeePct Int?
```

- [ ] **Step 4: Terapkan Step 2 & 3 identik ke `prisma/schema.sqlite.prisma`**

- [ ] **Step 5: Validasi kedua schema**

Run:
```bash
npx prisma validate --schema prisma/schema.prisma
npx prisma validate --schema prisma/schema.sqlite.prisma
```
Expected: keduanya `is valid`. (Jika schema sqlite butuh `DATABASE_URL` file:, set env `DATABASE_URL="file:<abs path ke prisma/dev.db>"` untuk perintah ini.)

- [ ] **Step 6: Generate kedua client + push SQLite**

Run:
```bash
npm run generate
npm run generate:sqlite
npx prisma db push --schema prisma/schema.sqlite.prisma --skip-generate
```
(Untuk db push, set `$env:DATABASE_URL="file:" + ((Resolve-Path "prisma\dev.db").Path -replace '\\','/')` agar menarget SQLite, bukan Neon.)
Expected: client ter-generate; db push sukses.

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma prisma/schema.sqlite.prisma prisma/dev.db
git commit -m "feat(settings): add PlatformSetting, PlatformFeeComponent, Order snapshot columns"
```

---

### Task 2: Error code `INVALID_PLATFORM_SETTINGS` + capability `MANAGE_PLATFORM_SETTINGS`

**Files:**
- Modify: `src/types/errors.ts`
- Modify: `src/server/services/errors.ts`
- Modify: `src/server/auth/admin-guard.ts`
- Test: `tests/platform-settings.test.ts` (bagian capability)

**Interfaces:**
- Produces: `SETTINGS_ERROR_CODES`, `type SettingsErrorCode`, masuk ke kedua union; `AdminCapability` bertambah `"MANAGE_PLATFORM_SETTINGS"`; matriks memberi capability ini hanya ke `SUPER_ADMIN`.

- [ ] **Step 1: Tambah grup error**

Di `src/types/errors.ts`, setelah grup admin, tambah:
```ts
// ── 9. PLATFORM SETTINGS ERROR CODES ───────────────────────────────────────
export const SETTINGS_ERROR_CODES = [
  'INVALID_PLATFORM_SETTINGS',
] as const;

export type SettingsErrorCode = (typeof SETTINGS_ERROR_CODES)[number];
```
Tambahkan `| SettingsErrorCode` ke union `AppDomainErrorCode`.

- [ ] **Step 2: Tambah ke `AnyDomainErrorCode`**

Di `src/server/services/errors.ts`, import `SettingsErrorCode` dan tambahkan `| SettingsErrorCode` ke union `AnyDomainErrorCode`.

- [ ] **Step 3: Tambah capability**

Di `src/server/auth/admin-guard.ts`:
- Tambahkan `"MANAGE_PLATFORM_SETTINGS"` ke tipe `AdminCapability`.
- Tambahkan ke `CAPABILITY_MATRIX.SUPER_ADMIN` (hanya SUPER_ADMIN; OPS/FINANCE tidak).

- [ ] **Step 4: Tulis test capability yang gagal**

Buat `tests/platform-settings.test.ts`:
```ts
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createTestDb, type TestDb } from "./helpers/test-db";

type AdminGuard = typeof import("../src/server/auth/admin-guard");
let ctx: TestDb;
let guard: AdminGuard;

before(async () => {
  ctx = await createTestDb();
  (globalThis as unknown as { prisma?: unknown }).prisma = ctx.prisma;
  guard = await import("../src/server/auth/admin-guard");
});

after(async () => { await ctx.cleanup(); });

test("capability: SUPER_ADMIN has MANAGE_PLATFORM_SETTINGS", () => {
  assert.equal(guard.hasCapability("SUPER_ADMIN", "MANAGE_PLATFORM_SETTINGS"), true);
});

test("capability: OPS and FINANCE do NOT have MANAGE_PLATFORM_SETTINGS", () => {
  assert.equal(guard.hasCapability("OPS", "MANAGE_PLATFORM_SETTINGS"), false);
  assert.equal(guard.hasCapability("FINANCE", "MANAGE_PLATFORM_SETTINGS"), false);
});
```

- [ ] **Step 5: Jalankan test — pastikan lulus setelah perubahan**

Run: `npx tsx --test tests/platform-settings.test.ts`
Expected: PASS (2 tests). Typecheck juga: `npm run typecheck`.

- [ ] **Step 6: Commit**

```bash
git add src/types/errors.ts src/server/services/errors.ts src/server/auth/admin-guard.ts tests/platform-settings.test.ts
git commit -m "feat(settings): add INVALID_PLATFORM_SETTINGS error + MANAGE_PLATFORM_SETTINGS capability"
```

---

### Task 3: Service `platform-settings-service.ts` — get + validate

**Files:**
- Create: `src/server/services/platform-settings-service.ts`
- Test: `tests/platform-settings.test.ts` (tambah)

**Interfaces:**
- Consumes: `prisma`; `DomainError`.
- Produces:
  - `interface PlatformSettingsView { dpPct: number; settlementPct: number; platformFeePct: number; defaultBaCommissionPct: number; components: Array<{ id: string; label: string; pct: number; sortOrder: number }> }`
  - `const DEFAULT_PLATFORM_SETTINGS: PlatformSettingsView`
  - `async function getPlatformSettings(tx?): Promise<PlatformSettingsView>`
  - `function validatePlatformSettings(input: PlatformSettingsView): void`

- [ ] **Step 1: Tulis test yang gagal**

Tambahkan ke `tests/platform-settings.test.ts`:
```ts
import {
  getPlatformSettings,
  validatePlatformSettings,
  DEFAULT_PLATFORM_SETTINGS,
} from "../src/server/services/platform-settings-service";

test("getPlatformSettings: returns DEFAULT when no row exists", async () => {
  const s = await getPlatformSettings(ctx.prisma);
  assert.equal(s.dpPct, 30);
  assert.equal(s.settlementPct, 70);
  assert.equal(s.platformFeePct, 10);
  assert.equal(s.defaultBaCommissionPct, 5);
  assert.deepEqual(s.components, []);
});

test("validatePlatformSettings: dp+settlement must equal 100", () => {
  assert.throws(
    () => validatePlatformSettings({ ...DEFAULT_PLATFORM_SETTINGS, dpPct: 40, settlementPct: 50 }),
    /INVALID_PLATFORM_SETTINGS/
  );
});

test("validatePlatformSettings: component total must equal platformFeePct", () => {
  assert.throws(
    () => validatePlatformSettings({
      ...DEFAULT_PLATFORM_SETTINGS,
      components: [{ id: "c1", label: "Ops", pct: 3, sortOrder: 0 }], // total 3 != 10
    }),
    /INVALID_PLATFORM_SETTINGS/
  );
});

test("validatePlatformSettings: pct out of range rejected", () => {
  assert.throws(
    () => validatePlatformSettings({ ...DEFAULT_PLATFORM_SETTINGS, platformFeePct: 120 }),
    /INVALID_PLATFORM_SETTINGS/
  );
});

test("validatePlatformSettings: valid input passes", () => {
  assert.doesNotThrow(() =>
    validatePlatformSettings({
      ...DEFAULT_PLATFORM_SETTINGS,
      components: [
        { id: "a", label: "Operasional", pct: 6, sortOrder: 0 },
        { id: "b", label: "Marketing", pct: 2, sortOrder: 1 },
        { id: "c", label: "Cadangan", pct: 2, sortOrder: 2 },
      ],
    })
  );
});
```

- [ ] **Step 2: Jalankan test — pastikan gagal**

Run: `npx tsx --test tests/platform-settings.test.ts`
Expected: FAIL — modul belum ada.

- [ ] **Step 3: Implementasi service (get + validate + default)**

Buat `src/server/services/platform-settings-service.ts`:
```ts
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DomainError } from "./errors";

export type PlatformSettingsTx = Prisma.TransactionClient;

export interface PlatformFeeComponentView {
  id: string;
  label: string;
  pct: number;
  sortOrder: number;
}

export interface PlatformSettingsView {
  dpPct: number;
  settlementPct: number;
  platformFeePct: number;
  defaultBaCommissionPct: number;
  components: PlatformFeeComponentView[];
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettingsView = {
  dpPct: 30,
  settlementPct: 70,
  platformFeePct: 10,
  defaultBaCommissionPct: 5,
  components: [],
};

/** Validasi aturan persentase. Throw DomainError bila invalid. */
export function validatePlatformSettings(input: PlatformSettingsView): void {
  const pcts = [
    input.dpPct,
    input.settlementPct,
    input.platformFeePct,
    input.defaultBaCommissionPct,
    ...input.components.map((c) => c.pct),
  ];
  for (const p of pcts) {
    if (!Number.isInteger(p) || p < 0 || p > 100) {
      throw new DomainError("INVALID_PLATFORM_SETTINGS", `Persentase harus integer 0–100 (diberikan: ${p}).`);
    }
  }
  if (input.dpPct + input.settlementPct !== 100) {
    throw new DomainError("INVALID_PLATFORM_SETTINGS", "DP% + Settlement% harus = 100.");
  }
  const componentTotal = input.components.reduce((acc, c) => acc + c.pct, 0);
  if (componentTotal !== input.platformFeePct) {
    throw new DomainError(
      "INVALID_PLATFORM_SETTINGS",
      `Total komponen fee (${componentTotal}) harus = platformFeePct (${input.platformFeePct}).`
    );
  }
}

/** Baca setting aktif. Tidak throw; fallback DEFAULT bila belum ada baris. */
export async function getPlatformSettings(tx?: PlatformSettingsTx): Promise<PlatformSettingsView> {
  const db = tx ?? prisma;
  try {
    const row = await db.platformSetting.findFirst({
      where: { isActive: true },
      include: { components: { orderBy: { sortOrder: "asc" } } },
    });
    if (!row) return { ...DEFAULT_PLATFORM_SETTINGS, components: [] };
    return {
      dpPct: row.dpPct,
      settlementPct: row.settlementPct,
      platformFeePct: row.platformFeePct,
      defaultBaCommissionPct: row.defaultBaCommissionPct,
      components: row.components.map((c) => ({ id: c.id, label: c.label, pct: c.pct, sortOrder: c.sortOrder })),
    };
  } catch {
    return { ...DEFAULT_PLATFORM_SETTINGS, components: [] };
  }
}
```

- [ ] **Step 4: Jalankan test — pastikan lulus**

Run: `npx tsx --test tests/platform-settings.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/server/services/platform-settings-service.ts tests/platform-settings.test.ts
git commit -m "feat(settings): add getPlatformSettings + validatePlatformSettings"
```

---

### Task 4: `updatePlatformSettings` — simpan + audit

**Files:**
- Modify: `src/server/services/platform-settings-service.ts`
- Test: `tests/platform-settings.test.ts` (tambah)

**Interfaces:**
- Consumes: `validatePlatformSettings`, `recordAdminAudit`, `AdminActor`.
- Produces: `async function updatePlatformSettings(input: PlatformSettingsView & { actor: AdminActor }, tx?): Promise<PlatformSettingsView>`.

- [ ] **Step 1: Tulis test yang gagal**

Tambahkan ke `tests/platform-settings.test.ts`:
```ts
import { updatePlatformSettings } from "../src/server/services/platform-settings-service";

test("updatePlatformSettings: persists + writes audit row", async () => {
  const actor = { userId: "u_super", name: "Super", subRole: "SUPER_ADMIN" as const };
  const saved = await updatePlatformSettings({
    dpPct: 30, settlementPct: 70, platformFeePct: 10, defaultBaCommissionPct: 5,
    components: [
      { id: "", label: "Operasional", pct: 6, sortOrder: 0 },
      { id: "", label: "Marketing", pct: 4, sortOrder: 1 },
    ],
    actor,
  });
  assert.equal(saved.platformFeePct, 10);
  assert.equal(saved.components.length, 2);

  const reread = await getPlatformSettings();
  assert.equal(reread.components.length, 2);

  const audit = await ctx.prisma.adminAuditLog.findFirst({ where: { action: "PLATFORM_SETTINGS_UPDATED" } });
  assert.ok(audit, "audit row written");
});
```

- [ ] **Step 2: Jalankan test — pastikan gagal**

Run: `npx tsx --test tests/platform-settings.test.ts`
Expected: FAIL — `updatePlatformSettings` belum ada.

- [ ] **Step 3: Implementasi**

Tambahkan ke `src/server/services/platform-settings-service.ts`:
```ts
import type { AdminActor } from "@/server/auth/admin-guard";
import { recordAdminAudit } from "./admin-audit-service";

/** Simpan setting + komponen (replace) lalu tulis audit. Aktor harus SUPER_ADMIN (dicek pemanggil). */
export async function updatePlatformSettings(
  input: PlatformSettingsView & { actor: AdminActor },
  tx?: PlatformSettingsTx
): Promise<PlatformSettingsView> {
  validatePlatformSettings(input);
  const db = tx ?? prisma;

  let row = await db.platformSetting.findFirst({ where: { isActive: true } });
  if (!row) {
    row = await db.platformSetting.create({ data: { isActive: true } });
  }

  await db.platformFeeComponent.deleteMany({ where: { settingId: row.id } });

  await db.platformSetting.update({
    where: { id: row.id },
    data: {
      dpPct: input.dpPct,
      settlementPct: input.settlementPct,
      platformFeePct: input.platformFeePct,
      defaultBaCommissionPct: input.defaultBaCommissionPct,
      updatedById: input.actor.userId,
      updatedByName: input.actor.name,
      components: {
        create: input.components.map((c, i) => ({
          label: c.label,
          pct: c.pct,
          sortOrder: c.sortOrder ?? i,
        })),
      },
    },
  });

  await recordAdminAudit(
    {
      actor: input.actor,
      capability: "MANAGE_PLATFORM_SETTINGS",
      action: "PLATFORM_SETTINGS_UPDATED",
      targetType: "PlatformSetting",
      targetId: row.id,
      metadata: {
        dpPct: input.dpPct,
        settlementPct: input.settlementPct,
        platformFeePct: input.platformFeePct,
        defaultBaCommissionPct: input.defaultBaCommissionPct,
        componentCount: input.components.length,
      },
    },
    tx
  );

  return getPlatformSettings(db);
}
```

- [ ] **Step 4: Jalankan test — pastikan lulus**

Run: `npx tsx --test tests/platform-settings.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/server/services/platform-settings-service.ts tests/platform-settings.test.ts
git commit -m "feat(settings): add updatePlatformSettings with audit"
```

---

### Task 5: Query + Server Action (dengan guard SUPER_ADMIN)

**Files:**
- Create: `src/server/queries/platform-settings.ts`
- Create: `src/server/actions/platform-settings.ts`

**Interfaces:**
- Produces:
  - query `getPlatformSettingsForAdmin(): Promise<PlatformSettingsView | null>` (VIEW_ADMIN; null bila tak berhak).
  - action `updatePlatformSettingsAction(input): Promise<ActionResult<PlatformSettingsView>>` (guard `MANAGE_PLATFORM_SETTINGS`).

- [ ] **Step 1: Query**

Buat `src/server/queries/platform-settings.ts`:
```ts
import { canViewAdmin } from "@/server/auth/admin-guard";
import { getPlatformSettings, type PlatformSettingsView } from "@/server/services/platform-settings-service";

/** Setting untuk panel admin (VIEW_ADMIN). null bila tak berhak. */
export async function getPlatformSettingsForAdmin(): Promise<PlatformSettingsView | null> {
  if (!(await canViewAdmin())) return null;
  return getPlatformSettings();
}
```

- [ ] **Step 2: Action**

Buat `src/server/actions/platform-settings.ts`:
```ts
"use server";

import { requireAdminCapability } from "@/server/auth/admin-guard";
import {
  updatePlatformSettings,
  type PlatformSettingsView,
} from "@/server/services/platform-settings-service";
import { runAction, revalidate, type ActionResult } from "./_shared";

/** Simpan platform settings. Hanya SUPER_ADMIN (MANAGE_PLATFORM_SETTINGS). */
export async function updatePlatformSettingsAction(
  input: Omit<PlatformSettingsView, "components"> & {
    components: Array<{ id?: string; label: string; pct: number; sortOrder?: number }>;
  }
): Promise<ActionResult<PlatformSettingsView>> {
  return runAction(async () => {
    const actor = await requireAdminCapability("MANAGE_PLATFORM_SETTINGS");
    const saved = await updatePlatformSettings({
      dpPct: input.dpPct,
      settlementPct: input.settlementPct,
      platformFeePct: input.platformFeePct,
      defaultBaCommissionPct: input.defaultBaCommissionPct,
      components: input.components.map((c, i) => ({
        id: c.id ?? "",
        label: c.label,
        pct: c.pct,
        sortOrder: c.sortOrder ?? i,
      })),
      actor,
    });
    revalidate(["/admin/pengaturan", "/checkout"]);
    return saved;
  });
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/server/queries/platform-settings.ts src/server/actions/platform-settings.ts
git commit -m "feat(settings): add settings query + update action (SUPER_ADMIN)"
```

---

### Task 6: `splitTranches` terima `dpPct` (kompatibel-mundur)

**Files:**
- Modify: `src/server/services/ledger-service.ts` (fungsi `splitTranches` ~line 376)
- Test: `tests/platform-settings.test.ts` (tambah)

**Interfaces:**
- Produces: `splitTranches(totalAmount: number, dpPct = 30): { dpAmount; settlementAmount }`.

- [ ] **Step 1: Tulis test yang gagal**

Tambahkan ke `tests/platform-settings.test.ts`:
```ts
import { splitTranches } from "../src/server/services/ledger-service";

test("splitTranches: default 30/70", () => {
  assert.deepEqual(splitTranches(100000), { dpAmount: 30000, settlementAmount: 70000 });
});

test("splitTranches: custom dpPct=40 -> 40/60", () => {
  assert.deepEqual(splitTranches(100000, 40), { dpAmount: 40000, settlementAmount: 60000 });
});
```

- [ ] **Step 2: Jalankan test — pastikan gagal pada kasus custom**

Run: `npx tsx --test tests/platform-settings.test.ts`
Expected: FAIL — `splitTranches` belum menerima argumen kedua (TypeScript error / hasil salah).

- [ ] **Step 3: Ubah `splitTranches`**

Ganti isi `splitTranches` di `src/server/services/ledger-service.ts`:
```ts
export function splitTranches(
  totalAmount: number,
  dpPct = 30
): {
  dpAmount: number;
  settlementAmount: number;
} {
  if (!Number.isInteger(totalAmount) || totalAmount < 0) {
    throw new LedgerServiceError(
      "INVALID_AMOUNT",
      `Total amount harus integer >= 0 (diberikan: ${totalAmount}).`
    );
  }
  const dpAmount = Math.floor((totalAmount * dpPct) / 100);
  return { dpAmount, settlementAmount: totalAmount - dpAmount };
}
```

- [ ] **Step 4: Jalankan test — pastikan lulus**

Run: `npx tsx --test tests/platform-settings.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/server/services/ledger-service.ts tests/platform-settings.test.ts
git commit -m "feat(settings): make splitTranches accept dpPct (backward-compatible)"
```

---

### Task 7: Snapshot ke `Order` saat `createOrder`

**Files:**
- Modify: `src/server/services/order-service.ts` (fungsi `createOrder` ~line 103-152)
- Test: `tests/platform-settings.test.ts` (tambah)

**Interfaces:**
- Consumes: `getPlatformSettings` (via `db` dalam transaksi).
- Produces: `createOrder` menulis `snapshotDpPct/snapshotSettlementPct/snapshotPlatformFeePct` dari setting aktif.

- [ ] **Step 1: Tulis test yang gagal**

Tambahkan ke `tests/platform-settings.test.ts` (gunakan helper `seedVendorWithPackage` + `claimHoldSlot`; pola dari `tests/services-integration.test.ts`):
```ts
import { createOrder } from "../src/server/services/order-service";
import { claimHoldSlot } from "../src/server/services/availability-service";
import { seedVendorWithPackage } from "./helpers/test-db";

test("createOrder writes snapshot percentages from active settings", async () => {
  const v = await seedVendorWithPackage(ctx.prisma, {
    category: "katering", businessName: "Snapshot Vendor", price: 100000,
  });
  const eventDate = "2027-05-01";
  const hold = await claimHoldSlot({ vendorId: v.vendorId, date: eventDate }, ctx.prisma);

  // Seed an active setting with non-default dpPct (before order creation).
  await ctx.prisma.platformSetting.create({
    data: { dpPct: 40, settlementPct: 60, platformFeePct: 10, defaultBaCommissionPct: 5, isActive: true },
  });

  const result = await createOrder(
    {
      eventDate,
      clientName: "Test Client",
      clientPhone: "081200000000",
      city: "Kebumen",
      userId: null,
      items: [{ servicePackageId: v.packageId, quantity: 1, holdToken: hold.holdToken }],
    },
    ctx.prisma
  );

  const order = await ctx.prisma.order.findUnique({ where: { id: result.orderId } });
  assert.equal(order?.snapshotDpPct, 40);
  assert.equal(order?.snapshotSettlementPct, 60);
  assert.equal(order?.snapshotPlatformFeePct, 10);
});
```

> Catatan: `createOrder` memerlukan `holdToken` valid & slot HELD. Gunakan pola dari
> `tests/services-integration.test.ts` (sekitar baris 161-173): `seedVendorWithPackage` →
> `claimHoldSlot({ vendorId, date }, prisma)` → `createOrder({... items: [{ servicePackageId, holdToken: hold.holdToken }]}, tx)`.
> Tiru setup ini persis agar order bisa dibuat.

- [ ] **Step 2: Jalankan test — pastikan gagal**

Run: `npx tsx --test tests/platform-settings.test.ts`
Expected: FAIL — snapshot masih null.

- [ ] **Step 3: Modifikasi `createOrder`**

Di `src/server/services/order-service.ts`, tambahkan import:
```ts
import { getPlatformSettings } from "./platform-settings-service";
```
Di dalam `createOrder`, sebelum `db.order.create(...)`, baca setting:
```ts
  const settings = await getPlatformSettings(db);
```
Lalu pada `data: { ... }` di `db.order.create`, tambahkan:
```ts
      snapshotDpPct: settings.dpPct,
      snapshotSettlementPct: settings.settlementPct,
      snapshotPlatformFeePct: settings.platformFeePct,
```

- [ ] **Step 4: Jalankan test — pastikan lulus**

Run: `npx tsx --test tests/platform-settings.test.ts`
Expected: PASS.

- [ ] **Step 5: Jalankan suite penuh**

Run: `npm test`
Expected: PASS (baseline + test baru). Verifikasi `order-lifecycle.test.ts` tetap hijau.

- [ ] **Step 6: Commit**

```bash
git add src/server/services/order-service.ts tests/platform-settings.test.ts
git commit -m "feat(settings): snapshot platform percentages onto Order at creation"
```

---

### Task 8: Pembaca lain membaca config — `payment-service` fallback + default komisi BA

**Files:**
- Modify: `src/server/services/payment-service.ts` (~line 322-332)
- Modify: `src/server/actions/ambassador.ts` (~line 149)

**Interfaces:**
- Consumes: `getPlatformSettings`.
- Produces: fallback settlement memakai snapshot order (bila ada) atau setting; default komisi BA dari setting.

- [ ] **Step 1: Ganti fallback di `payment-service.ts`**

Pada fungsi yang mengaktifkan `SETTLEMENT_70` (~line 326-332), ganti fallback:
```ts
  // Nominal settlement = total - DP yang sudah dibayar (fallback: pakai snapshot DP% order / setting).
  const setting = await getPlatformSettings(db);
  const dpPct = order.snapshotDpPct ?? setting.dpPct;
  const settlementAmount = dpInstallment ? order.totalAmount - dpInstallment.amount
    : order.totalAmount - Math.floor((order.totalAmount * dpPct) / 100);
```
(Hapus `Math.floor((order.totalAmount * 30) / 100)` hardcode; import `getPlatformSettings`.)

- [ ] **Step 2: Ganti default komisi BA di `actions/ambassador.ts`**

Pada `createAmbassadorAction` (~line 149), ganti `commissionPct: input.commissionPct ?? 5.0` menjadi membaca setting:
```ts
    const settings = await getPlatformSettings();
    // ...di dalam create brandAmbassador:
    commissionPct: input.commissionPct ?? settings.defaultBaCommissionPct,
```
(Tambahkan import `getPlatformSettings`.)

- [ ] **Step 3: Typecheck + suite**

Run: `npm run typecheck` lalu `npm test`
Expected: keduanya PASS.

- [ ] **Step 4: Commit**

```bash
git add src/server/services/payment-service.ts src/server/actions/ambassador.ts
git commit -m "feat(settings): read dpPct default + BA commission default from platform settings"
```

---

### Task 9: Panel Super Admin `/admin/pengaturan`

**Files:**
- Create: `src/app/admin/pengaturan/page.tsx` (server component)
- Create: `src/app/admin/pengaturan/AdminPengaturanClient.tsx` (client form)

**Interfaces:**
- Consumes: `getPlatformSettingsForAdmin`, `updatePlatformSettingsAction`.

- [ ] **Step 1: Server component**

Buat `src/app/admin/pengaturan/page.tsx`:
```tsx
import type { Metadata } from "next";
import { getPlatformSettingsForAdmin } from "@/server/queries/platform-settings";
import { AdminPengaturanClient } from "./AdminPengaturanClient";

export const metadata: Metadata = { title: "Pengaturan Platform", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPengaturanPage() {
  const settings = await getPlatformSettingsForAdmin();
  if (!settings) {
    return <div className="p-8 text-hk-charcoal">Akses ditolak. Hanya admin yang dapat membuka halaman ini.</div>;
  }
  return <AdminPengaturanClient initial={settings} />;
}
```

- [ ] **Step 2: Client form (ringkas, mobile-first, ≥44px target)**

Buat `src/app/admin/pengaturan/AdminPengaturanClient.tsx`:
```tsx
"use client";

import { useState } from "react";
import { updatePlatformSettingsAction } from "@/server/actions/platform-settings";
import type { PlatformSettingsView } from "@/server/services/platform-settings-service";

export function AdminPengaturanClient({ initial }: { initial: PlatformSettingsView }) {
  const [dpPct, setDpPct] = useState(initial.dpPct);
  const [settlementPct, setSettlementPct] = useState(initial.settlementPct);
  const [platformFeePct, setPlatformFeePct] = useState(initial.platformFeePct);
  const [defaultBaCommissionPct, setDefaultBaCommissionPct] = useState(initial.defaultBaCommissionPct);
  const [components, setComponents] = useState(initial.components);
  const [msg, setMsg] = useState<string | null>(null);

  const total = components.reduce((a, c) => a + c.pct, 0);

  async function save() {
    setMsg(null);
    const res = await updatePlatformSettingsAction({
      dpPct, settlementPct, platformFeePct, defaultBaCommissionPct,
      components: components.map((c, i) => ({ id: c.id, label: c.label, pct: c.pct, sortOrder: i })),
    });
    if (res.success) setMsg("Tersimpan.");
    else setMsg(res.message);
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-hk-charcoal">Pengaturan Platform</h1>

      <section className="space-y-3">
        <label className="block text-sm">DP % <input type="number" min={0} max={100} value={dpPct} onChange={(e) => setDpPct(Number(e.target.value))} className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige min-h-11" /></label>
        <label className="block text-sm">Pelunasan % <input type="number" min={0} max={100} value={settlementPct} onChange={(e) => setSettlementPct(Number(e.target.value))} className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige min-h-11" /></label>
        <label className="block text-sm">Platform Fee % <input type="number" min={0} max={100} value={platformFeePct} onChange={(e) => setPlatformFeePct(Number(e.target.value))} className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige min-h-11" /></label>
        <label className="block text-sm">Default Komisi BA % <input type="number" min={0} max={100} value={defaultBaCommissionPct} onChange={(e) => setDefaultBaCommissionPct(Number(e.target.value))} className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige min-h-11" /></label>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Rincian Platform Fee — total {total}% (harus = {platformFeePct}%)</h2>
        {components.map((c, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input value={c.label} onChange={(e) => setComponents(components.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} placeholder="Nama komponen" className="focus-ring flex-1 p-2.5 rounded-xl border border-hk-soft-beige min-h-11" />
            <input type="number" min={0} max={100} value={c.pct} onChange={(e) => setComponents(components.map((x, j) => j === i ? { ...x, pct: Number(e.target.value) } : x))} className="focus-ring w-20 p-2.5 rounded-xl border border-hk-soft-beige min-h-11" />
            <button type="button" onClick={() => setComponents(components.filter((_, j) => j !== i))} className="focus-ring px-3 min-h-11 rounded-xl border border-hk-soft-beige">Hapus</button>
          </div>
        ))}
        <button type="button" onClick={() => setComponents([...components, { id: "", label: "", pct: 0, sortOrder: components.length }])} className="focus-ring px-4 min-h-11 rounded-xl border border-hk-gold">+ Tambah Komponen</button>
      </section>

      {msg && <div role="status" className="text-sm">{msg}</div>}
      <button type="button" onClick={save} className="focus-ring px-5 min-h-11 rounded-xl bg-hk-gold text-white">Simpan</button>
    </div>
  );
}
```

- [ ] **Step 3: Tambah tautan di dashboard admin (opsional)**

Tambahkan kartu/link `Pengaturan Platform` di `src/app/admin/AdminDashboardClient.tsx` menuju `/admin/pengaturan` (hanya tampil bila perlu; server tetap otoritatif).

- [ ] **Step 4: Typecheck + build**

Run: `npm run typecheck` lalu `npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/pengaturan src/app/admin/AdminDashboardClient.tsx
git commit -m "feat(settings): add Super Admin platform settings panel"
```

---

### Task 10: Frontend cart + checkout membaca config; seed; verifikasi akhir

**Files:**
- Modify: `src/lib/cart-store.ts` (`useCart` ~line 210-241)
- Modify: `src/app/checkout/page.tsx` (teruskan settings)
- Modify: `prisma/seed.ts`

**Interfaces:**
- Produces: `useCart(settings?)` menerima `{ dpPct?, platformFeePct? }` (opsional, default 30/10) untuk kalkulasi.

- [ ] **Step 1: `cart-store` terima persen (opsional)**

Di `src/lib/cart-store.ts`, ubah `useCart()` menjadi:
```ts
export function useCart(opts?: { dpPct?: number; platformFeePct?: number }) {
  const state = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
  const subtotal = state.items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const dpPct = opts?.dpPct ?? 30;
  const platformFeePct = opts?.platformFeePct ?? 10;
  const dpAmount = Math.round((subtotal * dpPct) / 100);
  const finalAmount = subtotal - dpAmount;
  const platformFee = Math.round((subtotal * platformFeePct) / 100);
  const vendorNetAmount = subtotal - platformFee;
  return { ...state, subtotal, dpAmount, finalAmount, platformFee, vendorNetAmount, addItem: cartStore.addItem, removeItem: cartStore.removeItem, setEventDate: cartStore.setEventDate, setEventLocation: cartStore.setEventLocation, setCustomerInfo: cartStore.setCustomerInfo, setPaymentType: cartStore.setPaymentType, clearCart: cartStore.clearCart };
}
```

- [ ] **Step 2: Checkout meneruskan settings**

Ubah `src/app/checkout/page.tsx`: buat server wrapper yang memuat settings lalu teruskan ke client, ATAU (lebih sederhana, karena halaman ini client) tambahkan prop. Pola minimal: jadikan `checkout/page.tsx` server component yang merender `<CheckoutClient settings={...} />` (pindahkan isi client ke `CheckoutClient.tsx`), lalu `CheckoutClient` memanggil `useCart({ dpPct: settings.dpPct, platformFeePct: settings.platformFeePct })`.

> Rencana menetapkan pola split server/client ini agar settings dibaca server-side (tidak fetch DB dari klien).

- [ ] **Step 3: Seed**

Di `prisma/seed.ts`:
- Tambah ke blok `deleteMany` awal: `await prisma.platformFeeComponent.deleteMany(); await prisma.platformSetting.deleteMany();`
- Buat setting + komponen contoh:
```ts
  const setting = await prisma.platformSetting.create({
    data: { dpPct: 30, settlementPct: 70, platformFeePct: 10, defaultBaCommissionPct: 5, isActive: true },
  });
  await prisma.platformFeeComponent.createMany({
    data: [
      { settingId: setting.id, label: "Operasional", pct: 6, sortOrder: 0 },
      { settingId: setting.id, label: "Marketing", pct: 2, sortOrder: 1 },
      { settingId: setting.id, label: "Cadangan", pct: 2, sortOrder: 2 },
    ],
  });
```

- [ ] **Step 4: Verifikasi akhir lengkap**

Run:
```bash
npx prisma validate --schema prisma/schema.prisma
npx prisma validate --schema prisma/schema.sqlite.prisma
npm run typecheck
npm test
npm run build
```
Expected: semua PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/cart-store.ts src/app/checkout prisma/seed.ts
git commit -m "feat(settings): cart/checkout read config + seed platform settings"
```

---

## Self-Review

**1. Spec coverage**
- `PlatformSetting` + `PlatformFeeComponent` + `Order.snapshot*` → Task 1. ✅
- Error `INVALID_PLATFORM_SETTINGS` + capability `MANAGE_PLATFORM_SETTINGS` (SUPER_ADMIN) → Task 2. ✅
- `getPlatformSettings` (fallback, tak throw) + `validatePlatformSettings` → Task 3. ✅
- `updatePlatformSettings` + audit → Task 4. ✅
- Query + action dengan guard → Task 5. ✅
- `splitTranches` parametrik (kompatibel-mundur) → Task 6. ✅
- Snapshot ke Order saat createOrder → Task 7. ✅
- pembaca lain (payment fallback, default komisi BA) → Task 8. ✅
- Panel Super Admin `/admin/pengaturan` → Task 9. ✅
- cart/checkout baca config + seed → Task 10. ✅
- Non-tujuan (split ledger tak diubah) → tidak ada task menyentuh `executePayout`. ✅
- Verifikasi akhir (validate kedua, generate, push, typecheck, test, build) → Task 1, 7, 10. ✅

**2. Placeholder scan:** Tidak ada TBD/TODO. Task 7 Step 1 & Task 9 Step 2 memuat kode konkret; Task 7 menyertakan instruksi eksplisit untuk mengikuti pola `order-lifecycle.test.ts` bila setup hold rumit (instruksi konkret, bukan placeholder).

**3. Type consistency:** `PlatformSettingsView` / `PlatformFeeComponentView` dipakai konsisten (Task 3-5, 9). `getPlatformSettings(tx?)` dipakai Task 3/4/7/8. `splitTranches(total, dpPct?)` konsisten Task 6. `updatePlatformSettingsAction` mengembalikan `PlatformSettingsView`. ✅

**Catatan perbaikan inline:** Task 8 memakai `order.snapshotDpPct ?? setting.dpPct` (snapshot menang) — konsisten dengan janji spec "snapshot mengikat nilai saat order dibuat".
