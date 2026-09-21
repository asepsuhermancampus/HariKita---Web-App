# Admin Panel Redesign + Platform Settings OTP Guard — Design Spec

> Status: Menunggu review. Setelah disetujui → lanjut ke implementation plan (`writing-plans`).
> Tanggal: 2026-09-21
> Branch rencana: `feat/admin-ui-redesign`

## 1. Latar Belakang & Masalah

Panel Super Admin saat ini **tidak konsisten dan terasa jelek**:

1. **Tidak ada navigasi persisten.** `AdminDashboardClient` memakai tab in-page (Overview/Funnel/Kalender/Kliring). Halaman lain (`/admin/verifikasi`, `/admin/escrow`, `/admin/dispute`, `/admin/ba`, `/admin/kalender`, `/admin/audit-konten`, `/admin/pengaturan`) terpisah tanpa menu penghubung — pengguna harus menebak URL.
2. **Pengaturan Platform** adalah halaman terpisah, tidak terdaftar sebagai bagian dari navigasi utama.
3. **Halaman Pengaturan Platform jelek**: input melebar penuh, tidak ada tombol Simpan, tidak ada pengamanan perubahan.
4. **Bahaya tidak terotorisasi**: Super Admin bisa menitipkan akses ke orang lain; saat ini siapa pun dengan sesi admin bisa mengubah persentase finansial tanpa gembok tambahan.
5. **Rincian komisi 10% di halaman vendor masih hardcoded** (`VendorPaketClient.tsx`: "Server Cloud & Portofolio HD 3.5%", "Semua Admin Ditanggung", dll) — tidak sinkron dengan config admin.

**Tujuan:**
- Redesain **semua halaman admin** dengan layout SaaS + sidebar yang konsisten, memakai **design-system HariKita** (font & warna), responsif mobile.
- Pindahkan **Pengaturan Platform** menjadi item sidebar **sejajar "Kliring & Settlement"**.
- Tambahkan **gembok edit berbasis OTP email**: untuk membuka mode edit diperlukan verifikasi OTP ke email Super Admin; berlaku juga di server (bukan hanya UI).
- Vendor membaca **rincian komisi 10%** dari `PlatformFeeComponent` (dikelola Super Admin), bukan hardcode.

### Ruang lingkup & non-tujuan

**In-scope:**
- Layout admin (shell sidebar), redesign seluruh halaman admin, komponen UI bersama admin.
- Relokasi Pengaturan Platform ke sidebar.
- Gembok OTP edit + kolom `superAdminEmail` di Platform Settings.
- Vendor membaca rincian fee dari config.

**Non-tujuan:**
- Tidak mengubah cara ledger membagi uang (`executePayout` tetap).
- Tidak mengubah skema `PlatformSetting`/`PlatformFeeComponent` selain menambah kolom `superAdminEmail`.
- Tidak menyentuh halaman publik, vendor selain dropdown fee, atau BA selain styling konsisten (opsional).

## 2. Keputusan Desain

| Pertanyaan | Keputusan |
|---|---|
| Gaya visual admin | **Dashboard SaaS modern**: sidebar kiri persisten, kartu, tabel rapi. Palet tetap design-system HariKita. |
| Font | `Manrope` (body), `Playfair Display` (`font-serif`, judul), `Cormorant Garamond` (`font-editorial`). Dari `globals.css`/`tailwind.config.ts`. **Tidak pakai font sistem.** |
| Warna | Token design-system: `hk-canvas`, `hk-ivory`, `hk-soft-beige`, `hk-charcoal`, `hk-taupe`, `hk-champagne`, `gold{light/DEFAULT/dark}`, `plum{light/DEFAULT/dark}`, `success/warning/error/info`. **Tidak ada warna ad-hoc.** |
| Icon | **Lucide React** (sudah dependency). Tidak ada emoji di UI produksi. |
| Sidebar mobile | Collapsible (hamburger → drawer). |
| Verifikasi edit | **OTP email saja** (bukan PIN tambahan). |
| Email OTP tujuan | Kolom baru `PlatformSetting.superAdminEmail`. |
| Setelah Save | **Langsung tersimpan** (tidak minta OTP lagi). OTP hanya membuka mode edit. |
| Lock pasca-save | Kembali terkunci; perlu trigger OTP baru untuk edit lagi. |
| Validasi server | **Wajib**: action `updatePlatformSettingsAction` menolak save tanpa sesi OTP-verified yang valid. |
| Rincian fee vendor | Dibaca dari `PlatformFeeComponent` (config admin). Rincian lama (hardcode) **dihapus total**. |

## 3. Arsitektur

### 3.1 Struktur Route & Layout

```
src/app/admin/layout.tsx                 ← BARU: shell (sidebar + topbar) untuk semua halaman admin
src/app/admin/AdminSidebarNav.tsx        ← BARU: nav sidebar (client; active state; drawer mobile)
src/app/admin/page.tsx                   ← Dashboard (dirapikan, tetap pakai AdminTrackingSuite)
src/app/admin/AdminDashboardClient.tsx   ← Disederhanakan (tab → section scroll dalam shell)
src/app/admin/verifikasi/...             ← dirapikan pakai komponen bersama
src/app/admin/escrow/...
src/app/admin/dispute/...
src/app/admin/ba/...
src/app/admin/kalender/...
src/app/admin/audit-konten/...
src/app/admin/pengaturan/...             ← dirapikan; jadi item sidebar sederajat
```

Sidebar item (urut):
`Dashboard` · `Verifikasi Vendor` · `Kliring & Settlement` · `Dispute` · `Brand Ambassador` · `Kalender` · `Audit Konten` · `Pengaturan Platform`

### 3.2 Komponen UI Bersama Admin (baru)

`src/components/admin/`:
- `AdminSidebar` / `AdminSidebarNav` — navigasi.
- `AdminPageHeader` — judul + deskripsi + slot aksi kanan.
- `AdminCard` — wrapper kartu (title/desc opsional + body).
- `AdminStatCard` — angka besar + label + delta.
- `AdminTable` — tabel responsif (mobile → kartu bertumpuk).
- `AdminButton` — varian primary/secondary/danger/ghost (min-h-11).
- `AdminBadge` — status pill (pakai token status).
- `AdminEmptyState` — pesan kosong + CTA.

> Boleh menipiskan/menyesuaikan `src/components/harikita/ui/*` yang sudah ada (Button, Modal, EmptyState) alih-alih membuat duplikat. Prinsip: satu sumber komponen.

### 3.3 Alur Gembok OTP (Fase 2; UI dipasang di Fase 1)

```
[Kirim Kode OTP] ──► server: issueOtp(superAdminEmail, purpose=ADMIN_EDIT_UNLOCK)
                          │
                          ▼
                    email 6 digit ke Super Admin
                          │
[Modal input OTP] ──► server: verifyOtp(...) ──► set penanda OTP-verified
                          │                        (cookie bertanda tangan / kolom DB + expiry)
                          ▼
                    [Edit] aktif → form editable
                          │
                    [Simpan] ──► server: cek penanda valid → updatePlatformSettings + audit
                          │        (gagal bila penanda tidak ada / kedaluwarsa)
                          ▼
                    kembali TERKUNCI (penanda dihapus)
```

**Perilaku Fase 1 (OTP ditunda, Resend belum ada):**
- Tombol `Kirim Kode OTP` dan `Edit` **ditampilkan** namun non-fungsi: klik `Kirim OTP` membuka modal yang menampilkan pesan "Fitur OTP belum diaktifkan." Form read-only; tombol `Simpan` disabled.
- Struktur state (locked → editing) sudah disiapkan agar Fase 2 hanya menyambungkan backend.

### 3.4 Rincian Fee ke Vendor

- `VendorPaketClient.tsx`: hapus rincian hardcode; baca `PlatformFeeComponent` (via query server) → tampilkan label + pct + nominal.
- Sumber tunggal: `PlatformFeeComponent`. Bila admin belum mengatur → komponen default (dari `DEFAULT_PLATFORM_SETTINGS.components` / seed).

## 4. Model Data

### 4.1 Perubahan `PlatformSetting` (kedua schema Prisma)

```prisma
model PlatformSetting {
  // ...existing...
  superAdminEmail String?   // tujuan OTP gembok edit; null = belum diatur
  // ...existing...
}
```

- Kedua schema (`prisma/schema.prisma` + `prisma/schema.sqlite.prisma`) sinkron.
- Migrasi baru (migrate deploy) untuk produksi; `db push` untuk SQLite dev.

### 4.2 OTP admin-edit unlock

Memakai ulang `OtpCode` (service `otp-service.ts`) dengan **purpose baru** `ADMIN_EDIT_UNLOCK` (perlu menambah nilai pada tipe purpose OTP yang ada; dicek di Fase 2). Bila tipe purpose OTP saat ini union tertutup, tambahkan anggotanya di Fase 2.

**Penanda "OTP-verified" (Fase 2)** — pilih salah satu (diputuskan di plan):
- (a) cookie httpOnly bertanda tangan (HMAC) berisi `{ adminId, expiry }`, TTL pendek (mis. 10 menit), ATAU
- (b) kolom/penanda di DB dengan expiry.
- Rekomendasi: (a) cookie bertanda tangan — memakai ulang `session-token` HMAC, tidak menyentuh skema lagi.

## 5. Error & Otorisasi

- Tulis edit tetap: `requireAdminCapability("MANAGE_PLATFORM_SETTINGS")` (SUPER_ADMIN).
- Tambahan (Fase 2): **wajib penanda OTP-verified valid**; bila tidak → error kode baru `ADMIN_EDIT_NOT_UNLOCKED` (grup `SETTINGS_ERROR_CODES` atau `ADMIN_ERROR_CODES`) + ditambahkan ke union `AppDomainErrorCode`/`AnyDomainErrorCode`.
- Read panel tetap: `canViewAdmin()` (VIEW_ADMIN).

## 6. Testing

- **Unit/komponen**: tiap komponen bersama `src/components/admin/*` (render, prop varian).
- **Behavioral**:
  - Sidebar: active state sesuai route; drawer mobile toggle.
  - Pengaturan: mode terkunci default (input readonly, Simpan disabled); klik Kirim OTP menampilkan modal; (Fase 2) OTP valid → editable; Save → terkunci lagi.
  - Server (Fase 2): action menolak save tanpa penanda OTP.
  - Vendor: dropdown fee membaca `PlatformFeeComponent` (bukan hardcode).
- **Verifikasi**: `npm run typecheck`, `npm test`, `npm run build` hijau; cek visual 375px (tanpa horizontal overflow) & desktop.

## 7. File yang Disentuh (ringkas)

| File | Aksi |
|---|---|
| `src/app/admin/layout.tsx` | **Baru** — shell sidebar |
| `src/components/admin/*` | **Baru** — komponen bersama |
| `src/app/admin/page.tsx` + `AdminDashboardClient.tsx` | Modify — dalam shell, section |
| `src/app/admin/{verifikasi,escrow,dispute,ba,kalender,audit-konten}/*` | Modify — komponen bersama |
| `src/app/admin/pengaturan/*` | Modify — layout 2 kolom + OTP/Edit/Simpan |
| `src/server/actions/platform-settings.ts` | Modify — guard OTP (Fase 2) |
| `src/server/services/platform-settings-service.ts` | Modify — baca/tulis `superAdminEmail` (Fase 2) |
| `src/server/queries/platform-settings.ts` | Modify — sediakan email & komponen |
| `prisma/schema.prisma` + `schema.sqlite.prisma` | Modify — `superAdminEmail` |
| `src/app/dashboard/vendor/paket/VendorPaketClient.tsx` (+query) | Modify — fee dari config |
| `src/types/errors.ts`, `src/server/services/errors.ts` | Modify (Fase 2) — error code |

## 8. Risiko & Catatan

- **Jangan pakai emoji** di UI produksi; ganti placeholder mockup dengan Lucide.
- **Konsistensi token**: setiap warna/spacing harus dari design-system; review visual per halaman.
- **OTP butuh Resend** — Fase 2 menunggu API key. Fase 1 mengirim UI non-fungsi.
- **Jangan ganti cara ledger** membagi uang.
- **Aksesibilitas**: tombol min 44px, kontras teks status cukup (gunakan turunan gelap token status untuk teks), fokus ring dari design-system (`focus-ring`).
- Redesain tidak boleh mengubah **logika data/aksi** halaman (kecuali yang disebut eksplisit: Pengaturan & fee vendor).
