# Platform Settings + Snapshot ke Order — Design Spec

> Status: Menunggu review. Setelah disetujui → lanjut ke implementation plan
> (`writing-plans`).
> Tanggal: 2026-09-21
> Branch: `feat/platform-settings`

## 1. Latar Belakang & Masalah

Persentase finansial platform saat ini **hardcoded dan tersebar** di banyak tempat:

| Nilai | Lokasi | Bentuk |
|---|---|---|
| DP 30% | `src/lib/cart-store.ts:222` | `Math.round(subtotal * 0.3)` |
| Pelunasan 70% | `src/lib/cart-store.ts:223` | `subtotal - dpAmount` |
| Platform fee 10% | `src/lib/cart-store.ts:224` | `Math.round(subtotal * 0.1)` |
| Split DP saat settlement | `src/server/services/ledger-service.ts:386` | `Math.floor(totalAmount * 30 / 100)` |
| Fallback DP 30% | `src/server/services/payment-service.ts:332` | `totalAmount - Math.floor(totalAmount * 30 / 100)` |

Konsekuensi:
1. **Tidak ada satu sumber kebenaran.** Mengubah persentase berarti menyunting beberapa file kode — berisiko tidak sinkron.
2. **Tidak bisa diatur operator.** Super Admin tidak dapat mengubah persentase tanpa deploy ulang.
3. **Tidak ada rincian platform fee.** Angka 10% tidak dipecah komponen; tidak bisa diaudit "10% ini untuk apa".
4. **Risiko retroaktif.** Bila persentase diubah, order lama bisa terpengaruh bila nilainya tidak di-snapshot.

**Tujuan:** memusatkan seluruh persentase finansial ke satu konfigurasi yang dapat diedit Super Admin,
dan **mengikat nilai yang berlaku ke setiap order saat dibuat** (snapshot) agar order lama stabil.

### Ruang lingkup & non-tujuan (PENTING)

Spec ini **TIDAK mengubah cara uang dibagi di ledger.** Payout tetap `DR CLIENT_ESCROW / CR VENDOR_PAYABLE`
seperti sekarang; platform fee belum dipisahkan sebagai jurnal tersendiri. Spec ini hanya:
- mendefinisikan, menyimpan, dan menyunting persentase + rincian fee;
- meng-snapshot nilai ke `Order` saat checkout agar stabil;
- membuat kalkulasi (frontend & service) **membaca dari config**, bukan hardcode.

Pemindahan uang nyata (platform fee ke akun `PLATFORM_FEE` saat payout) menjadi **Spec terpisah
(Ledger Platform Fee Split)**. Konsekuensi yang disadari: sampai spec itu dikerjakan, angka *tampilan*
fee ikut config, tetapi *split ledger* belum sepenuhnya selaras — kondisi ini sudah ada sekarang
(fee hanya di frontend), jadi spec ini tidak memperburuk, melainkan memusatkan angkanya.

## 2. Tujuan

1. Tabel `PlatformSetting` (singleton/versi aktif) berisi seluruh persentase finances.
2. Tabel `PlatformFeeComponent` (CRUD penuh) merinci platform fee menjadi komponen (nama + persen);
   total komponen **harus = platformFeePct**.
3. Panel Super Admin untuk mengedit persentase + komponen (tambah/kurang/edit baris).
4. Snapshot nilai yang berlaku ke `Order` saat order dibuat (kolom baru di `Order`).
5. Semua kalkulasi membaca dari config/snapshot, bukan hardcode.
6. Otorisasi: hanya **SUPER_ADMIN** (`MANAGE_PLATFORM_SETTINGS`); FINANCE/OPS read-only.

**Non-tujuan:**
- Mengubah split ledger (Spec terpisah).
- Komisi BA bertahap/tier (Spec terpisah — multi-BA & tier).
- Multi-BA + reassign vendor (Spec terpisah).
- SLA withdraw BA (Spec terpisah).
- Editor visual WYSIWYG; panel cukup form terstruktur.

## 3. Keputusan Desain

| Pertanyaan | Keputusan |
|---|---|
| Bentuk config | Tabel singleton `PlatformSetting` (satu baris aktif) — bukan key-value generik |
| Rincian platform fee | Tabel `PlatformFeeComponent` (CRUD penuh dari Super Admin), total = `platformFeePct` |
| Binding ke order | **Snapshot** nilai ke kolom `Order` saat order dibuat |
| Sumber pembacaan runtime | Config aktif (fallback ke nilai default terkonstanta bila belum ada baris) |
| Persen default | DP 30, settlement 70, platform fee 10 (sesuai nilai yang ada sekarang) |
| Izin edit | Hanya SUPER_ADMIN (`MANAGE_PLATFORM_SETTINGS`); FINANCE/OPS lihat saja |
| Validasi | `dpPct + settlementPct = 100`; `platformFeePct ∈ [0,100]`; total komponen = `platformFeePct` |
| Audit | Setiap perubahan setting/komponen menulis `AdminAuditLog` (dari spec RBAC) |

## 4. Model Data (Prisma)

Kedua provider (`prisma/schema.prisma` + `prisma/schema.sqlite.prisma`) diperbarui.

### 4.1 Model baru `PlatformSetting` (singleton)

```prisma
/// Konfigurasi finansial platform (singleton — satu baris aktif).
model PlatformSetting {
  id                  String   @id @default(cuid())
  dpPct               Int      @default(30)   // persen DP
  settlementPct       Int      @default(70)   // persen pelunasan
  platformFeePct      Int      @default(10)   // persen platform fee HariKita
  defaultBaCommissionPct Int   @default(5)    // default komisi BA (dipakai saat buat BA baru)
  isActive            Boolean  @default(true)
  updatedById         String?                 // userId admin yang terakhir mengubah
  updatedByName       String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  components          PlatformFeeComponent[]
}
```

> Angka uang disimpan sebagai **Int persen** (bukan Float) mengikuti semangat aturan AGENTS.md §5.3
> (uang = Int). Persentase di sini pecahan bulat 0–100.

### 4.2 Model baru `PlatformFeeComponent` (CRUD penuh)

```prisma
/// Rincian komponen platform fee (mis. Operasional, Marketing). Total harus = platformFeePct.
model PlatformFeeComponent {
  id          String          @id @default(cuid())
  settingId   String
  setting     PlatformSetting @relation(fields: [settingId], references: [id], onDelete: Cascade)
  label       String
  pct         Int             // persen komponen (0–100)
  sortOrder   Int             @default(0)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@index([settingId, sortOrder])
}
```

### 4.3 Snapshot di `Order`

Tambah kolom snapshot (nullable agar order lama tidak wajib):
```prisma
model Order {
  // ...existing...
  snapshotDpPct          Int?  // snapshot saat order dibuat
  snapshotSettlementPct  Int?
  snapshotPlatformFeePct Int?
  // ...existing...
}
```
> Snapshot menyimpan **persentase** (bukan nominal) — nominal tetap dihitung & disimpan di
> `totalAmount`, `OrderItem.subtotal`, dan `PaymentInstallment.amount` seperti sekarang.

## 5. Service Config: `src/server/services/platform-settings-service.ts`

```ts
export interface PlatformSettingsView {
  dpPct: number;
  settlementPct: number;
  platformFeePct: number;
  defaultBaCommissionPct: number;
  components: Array<{ id: string; label: string; pct: number; sortOrder: number }>;
}

/** Nilai default (fallback bila belum ada baris) — mencerminkan nilai hardcode lama. */
export const DEFAULT_PLATFORM_SETTINGS: PlatformSettingsView;

/** Baca setting aktif (buat baris default bila belum ada). Read-only, tidak throw. */
export async function getPlatformSettings(tx?: Tx): Promise<PlatformSettingsView>;

/** Validasi: dpPct+settlementPct=100, 0<=pct<=100, total komponen = platformFeePct. */
export function validatePlatformSettings(input: {...}): void; // throw DomainError bila invalid

/** Simpan perubahan setting + komponen (SUPER_ADMIN). Menulis audit. */
export async function updatePlatformSettings(
  input: PlatformSettingsView & { actor: AdminActor },
  tx?: Tx
): Promise<PlatformSettingsView>;
```

- `getPlatformSettings` **tidak throw**; bila belum ada baris → kembalikan `DEFAULT_PLATFORM_SETTINGS`.
  Ini yang dipakai semua pembaca runtime (frontend calculation server-side, service).
- `updatePlatformSettings` memvalidasi total & aturan, lalu menulis audit (`PLATFORM_SETTINGS_UPDATED`).

## 6. Error & Otorisasi

- Error kode baru di `src/types/errors.ts` — grup baru (setelah grup admin):
  ```ts
  // ── 9. PLATFORM SETTINGS ERROR CODES ───────────────────────────────────────
  export const SETTINGS_ERROR_CODES = [
    'INVALID_PLATFORM_SETTINGS',
  ] as const;
  export type SettingsErrorCode = (typeof SETTINGS_ERROR_CODES)[number];
  ```
  Tambahkan `SettingsErrorCode` ke union `AppDomainErrorCode` dan `AnyDomainErrorCode`.
- Guard: `requireAdminCapability("MANAGE_PLATFORM_SETTINGS")` untuk aksi tulis.
- Capability baru ditambahkan ke matriks RBAC (`src/server/auth/admin-guard.ts`):
  - `MANAGE_PLATFORM_SETTINGS` → hanya `SUPER_ADMIN`.
- Read panel: `canViewAdmin()` (VIEW_ADMIN) — FINANCE/OPS boleh melihat.

## 7. Perubahan Pembacaan (menghapus hardcode)

| Lokasi | Sekarang | Menjadi |
|---|---|---|
| `src/lib/cart-store.ts:222-225` | `subtotal*0.3`, `*0.1` | terima persen dari parameter settings (detail di §8) |
| `src/server/services/ledger-service.ts:386` (`splitTranches`) | `totalAmount*30/100` | terima `dpPct` sebagai parameter (default 30 bila tak diberi) |
| `src/server/services/payment-service.ts:332` | fallback `*30/100` | pakai snapshot order / config |
| `src/server/services/order-service.ts` (createOrder) | — | tulis snapshot persen ke `Order` saat dibuat |
| Buat BA baru (`ambassador.ts:149`) | `commissionPct ?? 5.0` | `?? setting.defaultBaCommissionPct` |

> `splitTranches` dan `cart-store` diubah **kompatibel-mundur**: parameter opsional dengan default
> nilai lama (30), sehingga pemanggil lama tetap benar dan test lama tetap lulus; pemanggil baru
> menyuplai persen dari config/snapshot.

## 8. Frontend

- `src/lib/cart-store.ts`: `useCart()` menerima/membaca `platformFeePct`, `dpPct` dari sumber config.
  Karena cart adalah store klien (localStorage), **nilai config di-fetch saat mount** (mis. via server
  prop dari halaman checkout) dan diteruskan; hindari membaca DB dari klien.
- `src/app/checkout/page.tsx`: menerima settings dari server component lalu memberi ke kalkulasi.
- Panel admin baru: `src/app/admin/pengaturan/page.tsx` (+ client component) — form persen + editor
  daftar komponen (tambah/kurang/edit/simpan), hanya tampil aktif untuk SUPER_ADMIN (server-side guard
  tetap otoritatif; UI boleh menyembunyikan tombol).

## 9. Seed

`prisma/seed.ts`:
- Buat satu `PlatformSetting` (dp 30 / settlement 70 / fee 10 / defaultBaCommission 5).
- Buat komponen contoh (mis. Operasional 6, Marketing 2, Cadangan 2 → total 10).
- Tambah `platformSetting`/`platformFeeComponent` ke blok `deleteMany` awal.

## 10. Testing Strategy

**Unit test `tests/platform-settings.test.ts`** (createTestDb + dynamic-import pattern):
1. `getPlatformSettings` tanpa baris → `DEFAULT_PLATFORM_SETTINGS`.
2. `getPlatformSettings` dengan baris → nilai dari DB + komponen terurut.
3. `validatePlatformSettings`: `dpPct+settlementPct != 100` → throw; total komponen != platformFeePct → throw; pct di luar 0–100 → throw; valid → tidak throw.
4. `updatePlatformSettings` (owner/gunakan helper) → menulis setting + komponen + audit row.
5. Snapshot: bila `createOrder` diberi settings, `Order.snapshotDpPct` terisi.
6. `splitTranches(total, dpPct)` → split sesuai dpPct (mis. 40 → 40/60); default 30 tetap 30/70.

**Verifikasi akhir:** prisma validate (kedua schema), generate (kedua), db push sqlite, typecheck,
`npm test`, `npm run build`.

## 11. Risiko & Catatan

- **Dua schema Prisma** harus disinkronkan.
- **Snapshot wajib** agar perubahan config tidak retroaktif (aturan ledger: jurnal tak boleh diedit).
- **Split ledger belum berubah** — dinyatakan sebagai non-tujuan; konsekuensi didokumentasikan.
- **Perubahan `splitTranches`/`cart-store`** dibuat kompatibel-mundur (default = nilai lama) agar
  tidak merusak test & pemanggil lama.
- **Angka sebagai Int persen** (bukan Float) — konsisten semangat §5.3.
- **Otorisasi** mengikuti pola RBAC yang baru dibangun (`requireAdminCapability`).

## 12. File yang Disentuh

| File | Aksi |
|---|---|
| `prisma/schema.prisma` + `prisma/schema.sqlite.prisma` | `PlatformSetting`, `PlatformFeeComponent`, `Order.snapshot*` |
| `prisma/seed.ts` | setting default + komponen contoh |
| `src/types/errors.ts` | kode error settings |
| `src/server/auth/admin-guard.ts` | capability `MANAGE_PLATFORM_SETTINGS` |
| `src/server/services/platform-settings-service.ts` | **Baru** — get/validate/update |
| `src/server/actions/platform-settings.ts` | **Baru** — server action update |
| `src/server/queries/platform-settings.ts` | **Baru** — query read |
| `src/server/services/order-service.ts` | tulis snapshot saat createOrder |
| `src/server/services/ledger-service.ts` | `splitTranches` terima `dpPct` |
| `src/server/services/payment-service.ts` | fallback pakai config/snapshot |
| `src/server/actions/ambassador.ts` | default komisi dari config |
| `src/lib/cart-store.ts` | kalkulasi dari config |
| `src/app/checkout/page.tsx` | teruskan settings |
| `src/app/admin/pengaturan/page.tsx` (+ client) | **Baru** — panel Super Admin |
| `tests/platform-settings.test.ts` | **Baru** |
