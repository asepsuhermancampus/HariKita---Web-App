# Admin RBAC + Audit Log Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pisahkan wewenang admin ke sub-role (SUPER_ADMIN/OPS/FINANCE) lewat satu modul guard capability, dan catat setiap aksi admin ke audit log append-only — tanpa menyentuh cookie/middleware.

**Architecture:** Kolom baru `User.adminRole` + model `AdminAuditLog`. Modul murni `src/server/auth/admin-guard.ts` memetakan sub-role → capability; guard async `requireAdminCapability(cap)` membaca sesi + DB lalu mengecek capability. Helper `recordAdminAudit` menulis audit. Guard tersebar (`requireAdminUserId`, `requireAdmin` ×2) diganti. `session.role` tetap `"ADMIN"`.

**Tech Stack:** TypeScript, Next.js App Router (server actions), Prisma (dual-provider: SQLite dev + PostgreSQL prod), test runner `node:test` via `tsx`.

**Spec:** `docs/superpowers/specs/2026-09-21-admin-rbac-audit-design.md`

## Global Constraints

- **Jangan** mengubah `session.role`, format cookie, atau `src/middleware.ts` (kerja session signing harus tetap utuh).
- `adminRole` null = `SUPER_ADMIN` (grandfathered). Nilai tak dikenal → `SUPER_ADMIN`.
- `AdminAuditLog.actorId` **bukan** FK cascade — log harus awet bila user dihapus.
- Dua schema Prisma (`prisma/schema.prisma` + `prisma/schema.sqlite.prisma`) harus sinkron.
- Error kode baru: `UNAUTHORIZED_ADMIN_CAPABILITY` di grup `ADMIN_ERROR_CODES` (`src/types/errors.ts`), ditambahkan ke `AppDomainErrorCode` dan `AnyDomainErrorCode`.
- `metadata` audit disimpan sebagai JSON string (`JSON.stringify`); kosong → null.
- Uang tetap Int Rupiah (tidak ada perubahan finansial di spec ini; hanya guard + audit).
- Verifikasi akhir: `prisma validate` (kedua schema), `npm run generate` + `npm run generate:sqlite`, `npm run typecheck`, `npm test`, `npm run build`.
- **Backup dev.db** sebelum db push (AGENTS.md §5.13).

---

### Task 1: Schema — `User.adminRole` + model `AdminAuditLog` (kedua provider)

**Files:**
- Modify: `prisma/schema.prisma` (User model ~line 16-31; tambah model di akhir)
- Modify: `prisma/schema.sqlite.prisma` (User model ~line 19-34; tambah model di akhir)
- Test: (verifikasi via prisma validate/generate — bukan unit test)

**Interfaces:**
- Produces: model `AdminAuditLog` dengan field `id, actorId, actorName, actorRole, capability, action, targetType, targetId, metadata, createdAt`; field `User.adminRole String?`.

- [ ] **Step 1: Backup dev.db**

Run:
```bash
copy prisma\dev.db prisma\dev.db.bak
```
Expected: file `prisma/dev.db.bak` dibuat (jika `dev.db` ada). Jika tidak ada, lanjut (fresh).

- [ ] **Step 2: Ubah `prisma/schema.prisma` — tambah `adminRole` ke User**

Di `model User`, setelah baris `role String @default("CLIENT") // "CLIENT", "VENDOR", "ADMIN"`, tambahkan:

```prisma
  adminRole         String?              // null | "SUPER_ADMIN" | "OPS" | "FINANCE" (relevan bila role = "ADMIN")
```

- [ ] **Step 3: Tambah model `AdminAuditLog` di akhir `prisma/schema.prisma`**

```prisma
/// Log audit aksi admin (append-only). actorId sengaja TANPA FK cascade agar jejak awet.
model AdminAuditLog {
  id         String   @id @default(cuid())
  actorId    String
  actorName  String
  actorRole  String
  capability String
  action     String
  targetType String
  targetId   String
  metadata   String?
  createdAt  DateTime @default(now())

  @@index([actorId, createdAt])
  @@index([targetType, targetId])
  @@index([action, createdAt])
}
```

- [ ] **Step 4: Terapkan hal yang sama ke `prisma/schema.sqlite.prisma`**

Ulangi Step 2 & 3 persis pada file SQLite (tambah `adminRole` ke `User`, tambah model `AdminAuditLog` di akhir).

- [ ] **Step 5: Validasi kedua schema**

Run:
```bash
npx prisma validate --schema prisma/schema.prisma
npx prisma validate --schema prisma/schema.sqlite.prisma
```
Expected: kedua perintah mencetak `The schema ... is valid`.

- [ ] **Step 6: Generate kedua client + push ke SQLite**

Run:
```bash
npm run generate
npm run generate:sqlite
npx prisma db push --schema prisma/schema.sqlite.prisma
```
Expected: client ter-generate; db push sukses (menambah kolom/tabel tanpa data loss).

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma prisma/schema.sqlite.prisma
git commit -m "feat(admin): add User.adminRole and AdminAuditLog model"
```

---

### Task 2: Error code `UNAUTHORIZED_ADMIN_CAPABILITY`

**Files:**
- Modify: `src/types/errors.ts`
- Modify: `src/server/services/errors.ts`

**Interfaces:**
- Produces: `ADMIN_ERROR_CODES`, `type AdminErrorCode`, dan `AdminErrorCode` masuk ke union `AppDomainErrorCode` + `AnyDomainErrorCode`.

- [ ] **Step 1: Tambah grup error di `src/types/errors.ts`**

Setelah grup 7 (OTP) dan sebelum `AppDomainErrorCode`, tambah:

```ts
// ── 8. ADMIN AUTHORIZATION ERROR CODES ─────────────────────────────────────
export const ADMIN_ERROR_CODES = [
  'UNAUTHORIZED_ADMIN_CAPABILITY',
] as const;

export type AdminErrorCode = (typeof ADMIN_ERROR_CODES)[number];
```

- [ ] **Step 2: Tambah ke union `AppDomainErrorCode`**

Ubah definisi union agar menyertakan `| AdminErrorCode`:

```ts
export type AppDomainErrorCode =
  | AvailabilityErrorCode
  | OrderErrorCode
  | PaymentErrorCode
  | LedgerErrorCode
  | AmbassadorErrorCode
  | OtpErrorCode
  | AdminErrorCode;
```

- [ ] **Step 3: Tambah ke `AnyDomainErrorCode` di `src/server/services/errors.ts`**

Import `AdminErrorCode` dari `@/types/errors` (tambah ke daftar import yang ada) dan tambahkan ke union:

```ts
export type AnyDomainErrorCode =
  | AvailabilityErrorCode
  | OrderErrorCode
  | PaymentErrorCode
  | LedgerErrorCode
  | AmbassadorErrorCode
  | OtpErrorCode
  | AdminErrorCode;
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/types/errors.ts src/server/services/errors.ts
git commit -m "feat(admin): add UNAUTHORIZED_ADMIN_CAPABILITY error code"
```

---

### Task 3: Modul guard murni — `resolveAdminRole` + `hasCapability`

**Files:**
- Create: `src/server/auth/admin-guard.ts` (bagian pure dulu)
- Test: `tests/admin-rbac.test.ts`

**Interfaces:**
- Produces:
  - `type AdminSubRole = "SUPER_ADMIN" | "OPS" | "FINANCE"`
  - `type AdminCapability = "VIEW_ADMIN" | "VERIFY_VENDOR" | "MANAGE_DISPUTE" | "MANAGE_FINANCE" | "MANAGE_BA" | "MANAGE_ADMIN"`
  - `const CAPABILITY_MATRIX: Record<AdminSubRole, readonly AdminCapability[]>`
  - `function resolveAdminRole(role: string, adminRole: string | null): AdminSubRole | null`
  - `function hasCapability(subRole: AdminSubRole, cap: AdminCapability): boolean`

- [ ] **Step 1: Tulis test yang gagal**

Buat `tests/admin-rbac.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resolveAdminRole,
  hasCapability,
  CAPABILITY_MATRIX,
  type AdminCapability,
} from "../src/server/auth/admin-guard";

test("resolveAdminRole: ADMIN with null adminRole -> SUPER_ADMIN (grandfathered)", () => {
  assert.equal(resolveAdminRole("ADMIN", null), "SUPER_ADMIN");
});

test("resolveAdminRole: ADMIN with known sub-role returns it", () => {
  assert.equal(resolveAdminRole("ADMIN", "OPS"), "OPS");
  assert.equal(resolveAdminRole("ADMIN", "FINANCE"), "FINANCE");
  assert.equal(resolveAdminRole("ADMIN", "SUPER_ADMIN"), "SUPER_ADMIN");
});

test("resolveAdminRole: ADMIN with unknown sub-role -> SUPER_ADMIN (fail-safe)", () => {
  assert.equal(resolveAdminRole("ADMIN", "WIZARD"), "SUPER_ADMIN");
});

test("resolveAdminRole: non-admin role -> null", () => {
  assert.equal(resolveAdminRole("CLIENT", "OPS"), null);
  assert.equal(resolveAdminRole("VENDOR", null), null);
  assert.equal(resolveAdminRole("BA", null), null);
});

test("hasCapability: FINANCE can MANAGE_FINANCE only", () => {
  assert.equal(hasCapability("FINANCE", "MANAGE_FINANCE"), true);
  assert.equal(hasCapability("FINANCE", "VIEW_ADMIN"), true);
  assert.equal(hasCapability("FINANCE", "VERIFY_VENDOR"), false);
  assert.equal(hasCapability("FINANCE", "MANAGE_DISPUTE"), false);
  assert.equal(hasCapability("FINANCE", "MANAGE_BA"), false);
});

test("hasCapability: OPS can verify + dispute, not finance/BA", () => {
  assert.equal(hasCapability("OPS", "VERIFY_VENDOR"), true);
  assert.equal(hasCapability("OPS", "MANAGE_DISPUTE"), true);
  assert.equal(hasCapability("OPS", "VIEW_ADMIN"), true);
  assert.equal(hasCapability("OPS", "MANAGE_FINANCE"), false);
  assert.equal(hasCapability("OPS", "MANAGE_BA"), false);
});

test("hasCapability: SUPER_ADMIN can everything", () => {
  for (const cap of Object.values(CAPABILITY_MATRIX)) {
    for (const c of cap) {
      assert.equal(hasCapability("SUPER_ADMIN", c), true);
    }
  }
});

test("CAPABILITY_MATRIX: SUPER_ADMIN has all capabilities", () => {
  const all: AdminCapability[] = [
    "VIEW_ADMIN", "VERIFY_VENDOR", "MANAGE_DISPUTE",
    "MANAGE_FINANCE", "MANAGE_BA", "MANAGE_ADMIN",
  ];
  for (const c of all) assert.ok(CAPABILITY_MATRIX.SUPER_ADMIN.includes(c));
});
```

- [ ] **Step 2: Jalankan test — pastikan gagal**

Run: `npx tsx --test tests/admin-rbac.test.ts`
Expected: FAIL — `Cannot find module '../src/server/auth/admin-guard'`.

- [ ] **Step 3: Implementasi pure module**

Buat `src/server/auth/admin-guard.ts`:

```ts
/**
 * HariKita - Admin RBAC Guard
 *
 * Satu sumber kebenaran otorisasi admin. Sub-role disimpan pada User.adminRole
 * (null = grandfathered SUPER_ADMIN). session.role tetap "ADMIN".
 */

export type AdminSubRole = "SUPER_ADMIN" | "OPS" | "FINANCE";

export type AdminCapability =
  | "VIEW_ADMIN"
  | "VERIFY_VENDOR"
  | "MANAGE_DISPUTE"
  | "MANAGE_FINANCE"
  | "MANAGE_BA"
  | "MANAGE_ADMIN";

export const CAPABILITY_MATRIX: Record<AdminSubRole, readonly AdminCapability[]> = {
  SUPER_ADMIN: [
    "VIEW_ADMIN",
    "VERIFY_VENDOR",
    "MANAGE_DISPUTE",
    "MANAGE_FINANCE",
    "MANAGE_BA",
    "MANAGE_ADMIN",
  ],
  OPS: ["VIEW_ADMIN", "VERIFY_VENDOR", "MANAGE_DISPUTE"],
  FINANCE: ["VIEW_ADMIN", "MANAGE_FINANCE"],
};

const KNOWN_SUB_ROLES: readonly AdminSubRole[] = ["SUPER_ADMIN", "OPS", "FINANCE"];

/**
 * Sub-role efektif. null bila bukan admin.
 * - role !== "ADMIN" → null
 * - adminRole null / tak dikenal → "SUPER_ADMIN" (grandfathered / fail-safe)
 */
export function resolveAdminRole(role: string, adminRole: string | null): AdminSubRole | null {
  if (role !== "ADMIN") return null;
  if (!adminRole) return "SUPER_ADMIN";
  const normalized = adminRole.trim().toUpperCase();
  if (KNOWN_SUB_ROLES.includes(normalized as AdminSubRole)) {
    return normalized as AdminSubRole;
  }
  return "SUPER_ADMIN";
}

/** Apakah sub-role punya capability. */
export function hasCapability(subRole: AdminSubRole, cap: AdminCapability): boolean {
  return CAPABILITY_MATRIX[subRole].includes(cap);
}
```

- [ ] **Step 4: Jalankan test — pastikan lulus**

Run: `npx tsx --test tests/admin-rbac.test.ts`
Expected: PASS (semua test pure).

- [ ] **Step 5: Commit**

```bash
git add src/server/auth/admin-guard.ts tests/admin-rbac.test.ts
git commit -m "feat(admin): add pure RBAC guard (resolveAdminRole + hasCapability)"
```

---

### Task 4: Guard async `requireAdminCapability`

**Files:**
- Modify: `src/server/auth/admin-guard.ts` (tambah guard async)
- Test: `tests/admin-rbac.test.ts` (tambah test integrasi ringan dengan DB test)

**Interfaces:**
- Consumes: `resolveAdminRole`, `hasCapability` (Task 3); `getSession` dari `@/lib/session`; `prisma` dari `@/lib/prisma`; `DomainError` dari `@/server/services/errors`.
- Produces:
  - `interface AdminActor { userId: string; name: string; subRole: AdminSubRole }`
  - `async function requireAdminCapability(cap: AdminCapability): Promise<AdminActor>`

- [ ] **Step 1: Tulis test yang gagal**

Tambahkan ke `tests/admin-rbac.test.ts`:

```ts
import { prisma } from "../src/lib/prisma";
import { loadAdminActor } from "../src/server/auth/admin-guard";

test("loadAdminActor: returns SUPER_ADMIN for admin with null adminRole", async () => {
  const u = await prisma.user.create({
    data: { name: "T Admin", phone: `0899${Date.now() % 100000000}`, role: "ADMIN" },
  });
  try {
    const actor = await loadAdminActor(u.id);
    assert.equal(actor?.subRole, "SUPER_ADMIN");
    assert.equal(actor?.userId, u.id);
  } finally {
    await prisma.user.delete({ where: { id: u.id } });
  }
});

test("loadAdminActor: returns null for non-admin user", async () => {
  const u = await prisma.user.create({
    data: { name: "T Client", phone: `0898${Date.now() % 100000000}`, role: "CLIENT" },
  });
  try {
    assert.equal(await loadAdminActor(u.id), null);
  } finally {
    await prisma.user.delete({ where: { id: u.id } });
  }
});

test("loadAdminActor: resolves OPS sub-role", async () => {
  const u = await prisma.user.create({
    data: { name: "T Ops", phone: `0897${Date.now() % 100000000}`, role: "ADMIN", adminRole: "OPS" },
  });
  try {
    const actor = await loadAdminActor(u.id);
    assert.equal(actor?.subRole, "OPS");
  } finally {
    await prisma.user.delete({ where: { id: u.id } });
  }
});
```

- [ ] **Step 2: Jalankan test — pastikan gagal**

Run: `npx tsx --test tests/admin-rbac.test.ts`
Expected: FAIL — `loadAdminActor` belum diekspor.

- [ ] **Step 3: Implementasi guard async**

Tambahkan ke `src/server/auth/admin-guard.ts`:

```ts
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DomainError } from "@/server/services/errors";

export interface AdminActor {
  userId: string;
  name: string;
  subRole: AdminSubRole;
}

/**
 * Memuat actor admin dari DB berdasarkan userId.
 * Mengembalikan null bila user tidak ada atau bukan admin.
 */
export async function loadAdminActor(userId: string): Promise<AdminActor | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  const subRole = resolveAdminRole(user.role, user.adminRole);
  if (!subRole) return null;
  return { userId: user.id, name: user.name, subRole };
}

/**
 * Guard utama. Membaca sesi, memuat actor, dan memverifikasi capability.
 * @throws {DomainError} UNAUTHORIZED_ADMIN_CAPABILITY
 */
export async function requireAdminCapability(cap: AdminCapability): Promise<AdminActor> {
  const session = await getSession();
  if (!session) {
    throw new DomainError("UNAUTHORIZED_ADMIN_CAPABILITY", "Sesi tidak ditemukan. Silakan login.");
  }
  const actor = await loadAdminActor(session.userId);
  if (!actor) {
    throw new DomainError("UNAUTHORIZED_ADMIN_CAPABILITY", "Akses admin ditolak.");
  }
  if (!hasCapability(actor.subRole, cap)) {
    throw new DomainError(
      "UNAUTHORIZED_ADMIN_CAPABILITY",
      `Sub-role ${actor.subRole} tidak memiliki capability ${cap}.`
    );
  }
  return actor;
}
```

- [ ] **Step 4: Jalankan test — pastikan lulus**

Run: `npx tsx --test tests/admin-rbac.test.ts`
Expected: PASS. (Pastikan DB test tersedia — suite lain sudah memakai `prisma` seperti di `vendor-portfolio.test.ts`.)

- [ ] **Step 5: Commit**

```bash
git add src/server/auth/admin-guard.ts tests/admin-rbac.test.ts
git commit -m "feat(admin): add async requireAdminCapability guard"
```

---

### Task 5: Service audit — `recordAdminAudit`

**Files:**
- Create: `src/server/services/admin-audit-service.ts`
- Test: `tests/admin-rbac.test.ts` (tambah test)

**Interfaces:**
- Consumes: `AdminActor`, `AdminCapability` dari `@/server/auth/admin-guard`; `prisma`.
- Produces:
  - `interface AdminAuditInput { actor: AdminActor; capability: AdminCapability; action: string; targetType: string; targetId: string; metadata?: Record<string, unknown> }`
  - `async function recordAdminAudit(input: AdminAuditInput, tx?: Prisma.TransactionClient): Promise<void>`

- [ ] **Step 1: Tulis test yang gagal**

Tambahkan ke `tests/admin-rbac.test.ts`:

```ts
import { recordAdminAudit } from "../src/server/services/admin-audit-service";

test("recordAdminAudit writes a row with correct fields + JSON metadata", async () => {
  const before = await prisma.adminAuditLog.count();
  await recordAdminAudit({
    actor: { userId: "u_test", name: "Test Admin", subRole: "OPS" },
    capability: "VERIFY_VENDOR",
    action: "VENDOR_APPROVED",
    targetType: "VendorProfile",
    targetId: "vp_1",
    metadata: { note: "ok" },
  });
  const rows = await prisma.adminAuditLog.findMany({ orderBy: { createdAt: "desc" }, take: 1 });
  assert.equal(await prisma.adminAuditLog.count(), before + 1);
  assert.equal(rows[0].actorId, "u_test");
  assert.equal(rows[0].actorRole, "OPS");
  assert.equal(rows[0].capability, "VERIFY_VENDOR");
  assert.equal(rows[0].action, "VENDOR_APPROVED");
  assert.equal(rows[0].targetType, "VendorProfile");
  assert.equal(rows[0].targetId, "vp_1");
  assert.equal(rows[0].metadata, JSON.stringify({ note: "ok" }));
  await prisma.adminAuditLog.deleteMany({ where: { actorId: "u_test" } });
});

test("recordAdminAudit: no metadata -> null", async () => {
  await recordAdminAudit({
    actor: { userId: "u_test2", name: "A", subRole: "SUPER_ADMIN" },
    capability: "MANAGE_BA",
    action: "BA_CREATED",
    targetType: "Ambassador",
    targetId: "ba_1",
  });
  const row = await prisma.adminAuditLog.findFirst({ where: { actorId: "u_test2" } });
  assert.equal(row?.metadata, null);
  await prisma.adminAuditLog.deleteMany({ where: { actorId: "u_test2" } });
});
```

- [ ] **Step 2: Jalankan test — pastikan gagal**

Run: `npx tsx --test tests/admin-rbac.test.ts`
Expected: FAIL — modul `admin-audit-service` belum ada.

- [ ] **Step 3: Implementasi service**

Buat `src/server/services/admin-audit-service.ts`:

```ts
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AdminActor, AdminCapability } from "@/server/auth/admin-guard";

/**
 * HariKita - Admin Audit Service
 *
 * Menulis satu baris AdminAuditLog (append-only). Menerima `tx` opsional agar
 * dapat ikut transaksi aksi. Tidak ada update/delete.
 */

export interface AdminAuditInput {
  actor: AdminActor;
  capability: AdminCapability;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}

export async function recordAdminAudit(
  input: AdminAuditInput,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const db = tx ?? prisma;
  await db.adminAuditLog.create({
    data: {
      actorId: input.actor.userId,
      actorName: input.actor.name,
      actorRole: input.actor.subRole,
      capability: input.capability,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    },
  });
}
```

- [ ] **Step 4: Jalankan test — pastikan lulus**

Run: `npx tsx --test tests/admin-rbac.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/server/services/admin-audit-service.ts tests/admin-rbac.test.ts
git commit -m "feat(admin): add recordAdminAudit service"
```

---

### Task 6: Terapkan guard + audit di `actions/admin.ts`

**Files:**
- Modify: `src/server/actions/admin.ts`

**Interfaces:**
- Consumes: `requireAdminCapability`, `loadAdminActor` tidak dipakai di sini; `recordAdminAudit`.
- Produces: aksi vendor/dispute kini memakai capability + menulis audit. Bentuk return `ActionResult` tidak berubah.

- [ ] **Step 1: Ganti import + hapus guard lokal**

Di `src/server/actions/admin.ts`, ganti import `getSession`/`DomainError` bila tidak lagi dipakai, dan tambah:

```ts
import { requireAdminCapability } from "@/server/auth/admin-guard";
import { recordAdminAudit } from "@/server/services/admin-audit-service";
```

Hapus fungsi `requireAdminUserId` (diganti). **Pertahankan** `requireAnyUserId` (dipakai `openDisputeAction`).

- [ ] **Step 2: Update `approveVendorAction`**

```ts
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
```

- [ ] **Step 3: Update `rejectVendorAction`**

```ts
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
```

- [ ] **Step 4: Update `reviewDisputeAction` + `resolveDisputeAction`**

```ts
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
```

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: PASS. Pastikan tidak ada referensi `requireAdminUserId`/`getSession` yang tersisa bila tak dipakai.

- [ ] **Step 6: Commit**

```bash
git add src/server/actions/admin.ts
git commit -m "feat(admin): enforce capability + audit in vendor/dispute actions"
```

---

### Task 7: Terapkan guard + audit di `actions/ambassador.ts`

**Files:**
- Modify: `src/server/actions/ambassador.ts`

**Interfaces:**
- Consumes: `requireAdminCapability`, `recordAdminAudit`.
- Produces: aksi admin BA (withdraw, set commission, set active, create) memakai capability + audit. `requireAmbassador` (self-service BA) tetap.

- [ ] **Step 1: Ganti import + hapus `requireAdmin` lokal**

Di `src/server/actions/ambassador.ts`, hapus fungsi `requireAdmin` lokal. Tambah:

```ts
import { requireAdminCapability } from "@/server/auth/admin-guard";
import { recordAdminAudit } from "@/server/services/admin-audit-service";
```

**Pertahankan** `requireAmbassador` untuk `requestWithdrawalAction`.

- [ ] **Step 2: Update `resolveWithdrawalAction`**

```ts
export async function resolveWithdrawalAction(input: {
  withdrawalId: string;
  decision: "PAID" | "REJECTED";
}): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const actor = await requireAdminCapability("MANAGE_FINANCE");
    await resolveWithdrawal(input.withdrawalId, input.decision);
    await recordAdminAudit({
      actor,
      capability: "MANAGE_FINANCE",
      action: "WITHDRAWAL_RESOLVED",
      targetType: "AmbassadorWithdrawal",
      targetId: input.withdrawalId,
      metadata: { decision: input.decision },
    });
    revalidate(["/admin/ba"]);
    return { id: input.withdrawalId };
  });
}
```

- [ ] **Step 3: Update `setAmbassadorCommissionAction`**

```ts
export async function setAmbassadorCommissionAction(input: {
  ambassadorId: string;
  commissionPct: number;
}): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const actor = await requireAdminCapability("MANAGE_BA");
    if (
      !Number.isFinite(input.commissionPct) ||
      input.commissionPct < 0 ||
      input.commissionPct > 100
    ) {
      throw new DomainError("INVALID_AMBASSADOR_INPUT", "Persen komisi harus antara 0 sampai 100.");
    }
    await prisma.brandAmbassador.update({
      where: { id: input.ambassadorId },
      data: { commissionPct: input.commissionPct },
    });
    await recordAdminAudit({
      actor,
      capability: "MANAGE_BA",
      action: "BA_COMMISSION_SET",
      targetType: "Ambassador",
      targetId: input.ambassadorId,
      metadata: { commissionPct: input.commissionPct },
    });
    revalidate(["/admin/ba"]);
    return { id: input.ambassadorId };
  });
}
```

- [ ] **Step 4: Update `setAmbassadorActiveAction`**

```ts
export async function setAmbassadorActiveAction(input: {
  ambassadorId: string;
  isActive: boolean;
}): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const actor = await requireAdminCapability("MANAGE_BA");
    await prisma.brandAmbassador.update({
      where: { id: input.ambassadorId },
      data: { isActive: input.isActive },
    });
    await recordAdminAudit({
      actor,
      capability: "MANAGE_BA",
      action: "BA_ACTIVE_CHANGED",
      targetType: "Ambassador",
      targetId: input.ambassadorId,
      metadata: { isActive: input.isActive },
    });
    revalidate(["/admin/ba"]);
    return { id: input.ambassadorId };
  });
}
```

- [ ] **Step 5: Update `createAmbassadorAction`**

Ganti baris `await requireAdmin();` menjadi `const actor = await requireAdminCapability("MANAGE_BA");`, dan tepat sebelum `return`, tambah:

```ts
    await recordAdminAudit({
      actor,
      capability: "MANAGE_BA",
      action: "BA_CREATED",
      targetType: "Ambassador",
      targetId: ba.id,
      metadata: { referralCode },
    });
```

(Sisanya tidak berubah.)

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/server/actions/ambassador.ts
git commit -m "feat(admin): enforce capability + audit in ambassador admin actions"
```

---

### Task 8: Terapkan guard di `queries/admin.ts`

**Files:**
- Modify: `src/server/queries/admin.ts`

**Interfaces:**
- Consumes: `loadAdminActor` (untuk cek VIEW_ADMIN tanpa throw) atau `resolveAdminRole`.

- [ ] **Step 1: Ganti `requireAdmin` lokal dengan capability check**

Di `src/server/queries/admin.ts`, ganti fungsi `requireAdmin` menjadi berbasis capability (read-only, return boolean, tanpa throw):

```ts
import { getSession } from "@/lib/session";
import { loadAdminActor, hasCapability } from "@/server/auth/admin-guard";

/** Cek read access admin (VIEW_ADMIN). Mengembalikan boolean, tanpa throw. */
async function canViewAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  const actor = await loadAdminActor(session.userId);
  if (!actor) return false;
  return hasCapability(actor.subRole, "VIEW_ADMIN");
}
```

Lalu ganti setiap `if (!(await requireAdmin())) return [];` menjadi `if (!(await canViewAdmin())) return [];` (ada 4 pemakaian: `getVendorVerifications`, `getContentAuditFindings`, `getDisputes`, `getFunnelTelemetry`).

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Jalankan suite penuh**

Run: `npm test`
Expected: PASS — baseline 244 + test baru admin-rbac.

- [ ] **Step 4: Commit**

```bash
git add src/server/queries/admin.ts
git commit -m "feat(admin): guard admin queries with VIEW_ADMIN capability"
```

---

### Task 9: Seed admin demo (OPS, FINANCE) + verifikasi akhir

**Files:**
- Modify: `prisma/seed.ts`

**Interfaces:** tidak ada ekspor baru.

- [ ] **Step 1: Tambah 2 admin demo setelah `adminUser`**

Di `prisma/seed.ts`, setelah blok pembuatan `adminUser` + `logPin(adminUser.id)`, tambah:

```ts
  const opsAdmin = await prisma.user.create({
    data: {
      name: "Ops Admin HariKita",
      phone: "081234567891",
      email: "ops@harikita.id",
      pin: DEFAULT_PIN,
      role: "ADMIN",
      adminRole: "OPS",
    },
  });
  await logPin(opsAdmin.id);

  const financeAdmin = await prisma.user.create({
    data: {
      name: "Finance Admin HariKita",
      phone: "081234567892",
      email: "finance@harikita.id",
      pin: DEFAULT_PIN,
      role: "ADMIN",
      adminRole: "FINANCE",
    },
  });
  await logPin(financeAdmin.id);
```

- [ ] **Step 2: Update blok cetak akun demo**

Setelah baris `console.log("Super Admin : 081234567890  -> /auth/login/admin");`, tambah:

```ts
  console.log("Ops Admin   : 081234567891  (sub-role OPS)     -> /auth/login/admin");
  console.log("Finance Adm : 081234567892  (sub-role FINANCE) -> /auth/login/admin");
```

- [ ] **Step 3: Tambah `adminAuditLog` ke pembersihan seed (opsional, konsisten)**

Di blok `deleteMany` awal seed, tambahkan:

```ts
  await prisma.adminAuditLog.deleteMany();
```

- [ ] **Step 4: Jalankan seed**

Run: `npm run db:seed`
Expected: seed sukses; blok akun demo mencetak 3 admin (Super/Ops/Finance).

- [ ] **Step 5: Verifikasi akhir lengkap**

Run:
```bash
npx prisma validate --schema prisma/schema.prisma
npx prisma validate --schema prisma/schema.sqlite.prisma
npm run typecheck
npm test
npm run build
```
Expected: semua PASS. Build sukses (tidak ada perubahan cookie/middleware).

- [ ] **Step 6: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat(admin): seed OPS and FINANCE demo admins"
```

---

## Self-Review

**1. Spec coverage**
- Sub-role di kolom `User.adminRole` → Task 1. ✅
- Matriks capability + `resolveAdminRole` + `hasCapability` → Task 3. ✅
- `requireAdminCapability` async (baca DB) → Task 4. ✅
- Model `AdminAuditLog` append-only tanpa FK cascade → Task 1. ✅
- `recordAdminAudit` + `metadata` JSON → Task 5. ✅
- Enforce semua aksi (vendor/dispute) → Task 6. ✅
- Enforce semua aksi (BA/withdraw) → Task 7. ✅
- Query VIEW_ADMIN → Task 8. ✅
- Error kode `UNAUTHORIZED_ADMIN_CAPABILITY` → Task 2. ✅
- Seed OPS/FINANCE → Task 9. ✅
- `session.role` & middleware tidak berubah → Global constraints + tidak ada task menyentuhnya. ✅
- UI hiding TIDAK dikerjakan → konsisten (tidak ada task). ✅
- Testing `tests/admin-rbac.test.ts` → Task 3,4,5. ✅
- Verifikasi akhir (prisma validate/generate/push, typecheck, test, build) → Task 1, 8, 9. ✅

**2. Placeholder scan:** Tidak ada TBD/TODO. Satu catatan "sesuaikan agar typecheck bersih" di Task 3 Step 1 ada — itu instruksi konkret (ganti bentuk impor), bukan placeholder. ✅

**3. Type consistency:** `AdminSubRole`/`AdminCapability`/`AdminActor`/`AdminAuditInput` konsisten di Task 3-7. `requireAdminCapability` mengembalikan `AdminActor` yang dipakai `recordAdminAudit({ actor })`. `loadAdminActor` diekspor (Task 4) & dipakai Task 8. ✅

**Catatan penyesuaian inline:** Task 3 Step 1 test memakai alias tipe `AdminServiceCaps` yang berbelit; instruksi eksplisit menyatakan ganti dengan impor `type AdminCapability` bila perlu — jaga typecheck bersih.
