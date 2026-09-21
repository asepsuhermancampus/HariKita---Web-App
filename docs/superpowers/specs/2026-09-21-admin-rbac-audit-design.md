# Admin RBAC + Audit Log — Design Spec

> Status: Menunggu review. Setelah disetujui → lanjut ke implementation plan
> (`writing-plans`).
> Tanggal: 2026-09-21
> Branch: `feat/admin-rbac-audit`

## 1. Latar Belakang & Masalah

Saat ini seluruh otorisasi admin adalah **satu pemeriksaan tunggal** `session.role === "ADMIN"`,
diduplikasi di beberapa tempat:
- `src/server/actions/admin.ts` — `requireAdminUserId()`
- `src/server/queries/admin.ts` — `requireAdmin()`
- `src/server/actions/ambassador.ts` — `requireAdmin()`

Konsekuensi:
1. **Tidak ada pemisahan tugas.** Satu role `ADMIN` bisa memverifikasi vendor, menyelesaikan
   sengketa, mengelola dana escrow, memproses penarikan BA, dan mengatur komisi BA sekaligus.
2. **Single point of failure.** Jika satu-satunya admin tidak aktif, seluruh operasi berhenti.
3. **Tidak ada jejak audit.** Aksi admin (approve vendor, resolve dispute, bayar withdraw)
   tidak meninggalkan catatan siapa-melakukan-apa-kapan. `OrderStatusHistory` mencatat
   `changedBy` untuk beberapa alur, tetapi tidak ada log admin terpusat.
4. **Duplikasi guard.** Tiga implementasi `requireAdmin` yang bisa menyimpang.

Tujuan: memisahkan wewenang admin ke **sub-role** dan mencatat **audit log** untuk setiap aksi
admin — tanpa menyentuh cookie/middleware yang baru diperkuat (session signing).

## 2. Tujuan

1. Sub-role admin: `SUPER_ADMIN`, `OPS`, `FINANCE` pada kolom baru `User.adminRole`.
2. Modul guard tunggal `requireAdminCapability(cap)` menggantikan 3 guard yang tersebar.
3. Model `AdminAuditLog` append-only; setiap aksi admin menulis satu baris audit.
4. `session.role` **tetap** `"ADMIN"` → cookie signing & middleware tidak berubah.
5. `adminRole` null = `SUPER_ADMIN` (grandfathered; tidak mengunci admin lama).
6. Semua aksi admin yang ada sekarang di-enforce ke capability masing-masing.

**Non-tujuan (di luar lingkup):**
- **UI hiding per capability.** Tombol tetap tampil; server menolak via `UNAUTHORIZED_ADMIN_CAPABILITY`. UI gating adalah spec/PR terpisah.
- Manajemen admin via UI (buat/ubah sub-role dari dashboard) — di luar lingkup; sub-role di-set via seed/DB.
- Multi-capability per admin (tabel M:N) — ditolak sebagai over-engineering (YAGNI).
- Dual-control / larangan self-approval — tidak di spec ini.
- Perubahan pada `getDashboardPath`, login split, atau format cookie.

## 3. Keputusan Desain

| Pertanyaan | Keputusan |
|---|---|
| Model sub-role | Kolom baru `User.adminRole` (String?) |
| Nilai sub-role | `"SUPER_ADMIN" \| "OPS" \| "FINANCE"` (null = grandfathered SUPER_ADMIN) |
| `session.role` | **Tidak berubah** — tetap `"ADMIN"` |
| Sumber sub-role saat guard | **DB** (baca `User.adminRole` via `session.userId`) |
| Satu admin = satu sub-role | Ya (bukan multi-capability) |
| Enforcement | **Semua aksi admin** yang ada |
| Audit | Model `AdminAuditLog` append-only, ditulis dalam transaksi aksi bila transaksional |
| Admin lama (`adminRole` null) | Diperlakukan `SUPER_ADMIN` |
| UI hiding | **Tidak** — di luar lingkup |
| Error kode | Tambahan `UNAUTHORIZED_ADMIN_CAPABILITY` di `src/types/errors.ts` |

## 4. Model Data (Prisma)

Kedua provider (PostgreSQL produksi + SQLite dev/test) diperbarui:
`prisma/schema.prisma` dan `prisma/schema.sqlite.prisma`.

### 4.1 Perubahan `User`

```prisma
model User {
  // ...existing...
  role      String  @default("CLIENT") // "CLIENT", "VENDOR", "ADMIN", "BA"
  adminRole String? // null | "SUPER_ADMIN" | "OPS" | "FINANCE" (hanya relevan bila role = "ADMIN")
  // ...existing...
}
```

### 4.2 Model baru `AdminAuditLog`

```prisma
model AdminAuditLog {
  id         String   @id @default(cuid())
  actorId    String                       // User ID pelaku (tidak FK-cascade; log harus awet)
  actorName  String                       // snapshot nama saat aksi (historis stabil)
  actorRole  String                       // sub-role efektif saat aksi ("SUPER_ADMIN"|"OPS"|"FINANCE")
  capability String                       // capability yang dipakai (mis. "VERIFY_VENDOR")
  action     String                       // mis. "VENDOR_APPROVED", "WITHDRAWAL_RESOLVED"
  targetType String                       // "VendorProfile" | "Dispute" | "Ambassador" | "AmbassadorWithdrawal"
  targetId   String
  metadata   String?                      // JSON string detail bebas (note, amount, decision)
  createdAt  DateTime @default(now())

  @@index([actorId, createdAt])
  @@index([targetType, targetId])
  @@index([action, createdAt])
}
```

**Catatan penting:** `actorId` **bukan** foreign key dengan `onDelete: Cascade`. Audit log harus
tetap ada meski user pelaku dihapus (integritas jejak audit). Ini disengaja berbeda dari model lain.

> Aturan AGENTS.md §5.12: setiap perubahan schema disertai prisma validation, db push check,
> TypeScript check, dan test. Rencana implementasi akan memuat langkah-langkah ini eksplisit.

## 5. Modul Guard: `src/server/auth/admin-guard.ts`

Satu sumber kebenaran otorisasi admin. Modul murni (pure) + guard tipis async.

```ts
export type AdminSubRole = "SUPER_ADMIN" | "OPS" | "FINANCE";

export type AdminCapability =
  | "VIEW_ADMIN"
  | "VERIFY_VENDOR"
  | "MANAGE_DISPUTE"
  | "MANAGE_FINANCE"
  | "MANAGE_BA"
  | "MANAGE_ADMIN";

/** Matriks capability per sub-role. */
export const CAPABILITY_MATRIX: Record<AdminSubRole, readonly AdminCapability[]>;

/**
 * Sub-role efektif. Mengembalikan null bila bukan admin.
 * - role !== "ADMIN" → null
 * - role === "ADMIN" dan adminRole null/unknown → "SUPER_ADMIN" (grandfathered)
 * - role === "ADMIN" dan adminRole valid → adminRole
 */
export function resolveAdminRole(
  role: string,
  adminRole: string | null
): AdminSubRole | null;

/** Apakah sub-role punya capability. */
export function hasCapability(subRole: AdminSubRole, cap: AdminCapability): boolean;

export interface AdminActor {
  userId: string;
  name: string;
  subRole: AdminSubRole;
}

/**
 * Guard utama (async). Membaca sesi + User dari DB, verifikasi role ADMIN,
 * resolve sub-role, dan cek capability. Throw DomainError bila gagal.
 */
export async function requireAdminCapability(cap: AdminCapability): Promise<AdminActor>;
```

### 5.1 Matriks capability

| Capability | SUPER_ADMIN | OPS | FINANCE |
|---|:--:|:--:|:--:|
| `VIEW_ADMIN` | ✅ | ✅ | ✅ |
| `VERIFY_VENDOR` | ✅ | ✅ | — |
| `MANAGE_DISPUTE` | ✅ | ✅ | — |
| `MANAGE_FINANCE` | ✅ | — | ✅ |
| `MANAGE_BA` | ✅ | — | — |
| `MANAGE_ADMIN` | ✅ | — | — |

### 5.2 Perilaku `requireAdminCapability`

1. `session = getSession()`; null → `DomainError("UNAUTHORIZED_ADMIN_CAPABILITY", "Sesi tidak ditemukan.")`.
2. Baca `User` via `prisma.user.findUnique({ where: { id: session.userId } })`; null → throw.
3. `subRole = resolveAdminRole(user.role, user.adminRole)`; null → throw.
4. `if (!hasCapability(subRole, cap))` → throw `UNAUTHORIZED_ADMIN_CAPABILITY`.
5. Kembalikan `{ userId, name, subRole }`.

> `resolveAdminRole` dan `hasCapability` **murni** (tanpa DB) → mudah diuji unit.
> `requireAdminCapability` tipis (sesi + DB + panggil pure) → diuji integrasi.

## 6. Service Audit: `src/server/services/admin-audit-service.ts`

```ts
import type { Prisma } from "@prisma/client";
import type { AdminActor, AdminCapability } from "@/server/auth/admin-guard";

export interface AdminAuditInput {
  actor: AdminActor;
  capability: AdminCapability;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}

/**
 * Menulis satu baris AdminAuditLog. Menerima `tx` opsional agar bisa ikut
 * transaksi aksi. metadata di-serialize ke JSON string.
 */
export async function recordAdminAudit(
  input: AdminAuditInput,
  tx?: Prisma.TransactionClient
): Promise<void>;
```

**Aturan penulisan:**
- Untuk aksi yang sudah transaksional (dispute review/resolve, withdrawal): tulis audit **di dalam transaksi yang sama** agar atomik.
- Untuk aksi non-transaksional (approve/reject vendor, set commission/active, create BA): tulis tepat setelah update sukses.
- Append-only: tidak ada update/delete pada `AdminAuditLog`.
- `metadata` disimpan sebagai JSON string (`JSON.stringify`); kosong → null.

## 7. Penerapan ke Aksi yang Ada

| File | Fungsi | Capability | `action` | `targetType` |
|---|---|---|---|---|
| `actions/admin.ts` | `approveVendorAction` | VERIFY_VENDOR | `VENDOR_APPROVED` | `VendorProfile` |
| `actions/admin.ts` | `rejectVendorAction` | VERIFY_VENDOR | `VENDOR_REJECTED` | `VendorProfile` |
| `actions/admin.ts` | `openDisputeAction` | (klien/vendor, tidak berubah) | — | — |
| `actions/admin.ts` | `reviewDisputeAction` | MANAGE_DISPUTE | `DISPUTE_REVIEWED` | `Dispute` |
| `actions/admin.ts` | `resolveDisputeAction` | MANAGE_DISPUTE | `DISPUTE_RESOLVED` | `Dispute` |
| `actions/ambassador.ts` | `resolveWithdrawalAction` | MANAGE_FINANCE | `WITHDRAWAL_RESOLVED` | `AmbassadorWithdrawal` |
| `actions/ambassador.ts` | `setAmbassadorCommissionAction` | MANAGE_BA | `BA_COMMISSION_SET` | `Ambassador` |
| `actions/ambassador.ts` | `setAmbassadorActiveAction` | MANAGE_BA | `BA_ACTIVE_CHANGED` | `Ambassador` |
| `actions/ambassador.ts` | `createAmbassadorAction` | MANAGE_BA | `BA_CREATED` | `Ambassador` |
| `queries/admin.ts` | semua query | VIEW_ADMIN | — (read, tidak diaudit) | — |

**Detail implementasi:**
- Guard lokal (`requireAdminUserId`, `requireAdmin` ×2) **dihapus**, diganti
  `requireAdminCapability(...)` yang mengembalikan `AdminActor`.
- `openDisputeAction` tetap memakai `requireAnyUserId()` (klien/vendor) — tidak diubah.
- `reviewDisputeAction`/`resolveDisputeAction` meneruskan `actor.userId` sebagai `adminUserId`
  ke service dispute (perilaku sama seperti sekarang) **plus** menulis audit.
- `resolveWithdrawalAction` dapat mengubah bentuk: service `resolveWithdrawal` saat ini tidak
  transaksional dari sisi aksi — audit ditulis setelah sukses. (Rencana menetapkan urutan pasti.)
- `metadata` contoh: approve vendor → `{}`; reject → `{ note }`; resolve dispute →
  `{ approved, resolution }`; withdrawal → `{ decision }`; commission → `{ commissionPct }`.

## 8. Perubahan Error

`src/types/errors.ts` — tambah grup baru:

```ts
// ── 8. ADMIN AUTHORIZATION ERROR CODES ─────────────────────────────────────
export const ADMIN_ERROR_CODES = [
  'UNAUTHORIZED_ADMIN_CAPABILITY',
] as const;

export type AdminErrorCode = (typeof ADMIN_ERROR_CODES)[number];
```
dan tambahkan `AdminErrorCode` ke `AppDomainErrorCode` union.

`src/server/services/errors.ts` — tambah `AdminErrorCode` ke `AnyDomainErrorCode` union
dan import-nya.

## 9. Seed

`prisma/seed.ts` — tambah dua akun admin demo di samping SUPER_ADMIN yang ada:
- OPS: mis. `081234567891` / PIN `123456`, `adminRole: "OPS"`.
- FINANCE: mis. `081234567892` / PIN `123456`, `adminRole: "FINANCE"`.
- Admin lama (`081234567890`) tetap `adminRole: null` (= SUPER_ADMIN).

Update blok cetak akun demo agar menyertakan sub-role. Semua user demo diberi `logPin`.

## 10. Testing Strategy

**Unit test baru `tests/admin-rbac.test.ts`** (pola `node:test` + `tsx`):
1. `resolveAdminRole("ADMIN", null)` → `"SUPER_ADMIN"`.
2. `resolveAdminRole("ADMIN", "OPS")` → `"OPS"`.
3. `resolveAdminRole("ADMIN", "FINANCE")` → `"FINANCE"`.
4. `resolveAdminRole("ADMIN", "UNKNOWN_ROLE")` → `"SUPER_ADMIN"` (fail-safe ke grandfathered; nilai `adminRole` yang tidak dikenal diperlakukan sebagai null).
5. `resolveAdminRole("CLIENT", "OPS")` → `null` (bukan admin).
6. `hasCapability`: FINANCE boleh `MANAGE_FINANCE`, tidak boleh `VERIFY_VENDOR`/`MANAGE_BA`;
   OPS boleh `VERIFY_VENDOR`/`MANAGE_DISPUTE`, tidak boleh `MANAGE_FINANCE`/`MANAGE_BA`;
   SUPER_ADMIN boleh semua.
7. `recordAdminAudit` menulis baris dengan field benar (termasuk serialisasi metadata) — memakai DB test.

**Verifikasi akhir (wajib):**
- `prisma validate` (kedua schema) & `prisma db push` ke SQLite dev.
- `npm run typecheck`.
- `npm test`.
- `npm run build`.

## 11. Risiko & Catatan

- **Dua schema Prisma** harus disinkronkan (postgres + sqlite).
- **Audit append-only** tanpa FK cascade agar jejak awet bila user dihapus.
- **Grandfathering**: `adminRole` null = SUPER_ADMIN — pastikan guard fail-safe (nilai tak dikenal → SUPER_ADMIN, bukan akses ditolak, agar admin lama tidak terkunci; namun capability tetap dibatasi oleh role ADMIN).
- **Guard async**: `requireAdminCapability` membaca DB tiap aksi → satu query tambahan; dapat diterima (aksi admin jarang).
- **Tidak menyentuh cookie/middleware**: `session.role` tetap `"ADMIN"` → kerja session signing aman.
- **`metadata` sebagai String JSON**: cukup untuk MVP; tidak perlu Json type (SQLite kompatibel).

## 12. File yang Disentuh

| File | Aksi |
|---|---|
| `prisma/schema.prisma` + `prisma/schema.sqlite.prisma` | `User.adminRole` + model `AdminAuditLog` |
| `prisma/seed.ts` | 2 admin demo (OPS, FINANCE) + cetak sub-role |
| `src/types/errors.ts` | `ADMIN_ERROR_CODES` + union |
| `src/server/services/errors.ts` | `AdminErrorCode` ke `AnyDomainErrorCode` |
| `src/server/auth/admin-guard.ts` | **Baru** — capability/guard |
| `src/server/services/admin-audit-service.ts` | **Baru** — `recordAdminAudit` |
| `src/server/actions/admin.ts` | Guard → capability + audit vendor/dispute |
| `src/server/actions/ambassador.ts` | Guard → capability + audit BA/withdrawal |
| `src/server/queries/admin.ts` | Guard → `requireAdminCapability("VIEW_ADMIN")` |
| `tests/admin-rbac.test.ts` | **Baru** — unit + integrasi |
