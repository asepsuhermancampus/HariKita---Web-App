# Dashboard SaaS untuk Semua Role — Design Spec

> Status: Menunggu review. Setelah disetujui → lanjut ke implementation plan (`writing-plans`).
> Tanggal: 2026-09-22
> Branch rencana: `feat/dashboard-saas-all-roles`

## 1. Latar Belakang & Masalah

Setelah panel **Super Admin** di-redesain ke gaya SaaS (sidebar + komponen bersama), dashboard role lain masih memakai pola lama yang **tidak konsisten**:

| Role | Route | Navigasi saat ini |
|---|---|---|
| Vendor | `/dashboard/vendor/*` | `VendorHeaderNav` (header horizontal) |
| Brand Ambassador | `/dashboard/ba/*` | `BaHeaderNav` (header horizontal) |
| Klien | `/client/*` | `ClientHeaderNav` (header horizontal) |

Akibatnya: pengalaman antar role berbeda-beda, tiap header nav punya gayanya sendiri, dan tidak memakai komponen bersama. Navbar/Footer publik juga masih tampil di atas dashboard role, sehingga terasa ramai.

**Tujuan:**
- Semua dashboard role memakai **shell SaaS yang sama** seperti admin (sidebar kiri + drawer mobile), beda hanya item menu & label role.
- Palet & font dari **brand hub** (`/design-system-showcase?hub=brand`): Charcoal `#2B2B2B`, Taupe `#88735B`, Champagne `#C9A88A`, Soft Beige `#E8DED1`, Ivory `#F8F6F1`; font **Cormorant Garamond** (`font-editorial`) + **Manrope** (`font-manrope`).
- Semua halaman tiap role dirapikan dengan komponen bersama.
- Navbar & Footer publik **disembunyikan** di area dashboard role.
- Tampilan **cantik & konsisten**.

### Non-tujuan
- Tidak mengubah logika data/aksi/halaman (hanya tampilan & shell).
- Tidak menyentuh halaman publik, admin (sudah SaaS), atau alur auth.
- Tidak mengubah skema database.

## 2. Keputusan Desain

| Pertanyaan | Keputusan |
|---|---|
| Tingkat kesamaan dgn admin | **Shell identik** (komponen sama), menu beda per role |
| Sumber warna/font | Brand hub: 5-color palette + Cormorant/Manrope |
| Warna sidebar | **Charcoal `#2B2B2B`**, aksen aktif Champagne `#C9A88A` |
| Aksen primer (tombol) | **Taupe `#88735B`** (brand primary) |
| Cakupan | **Semua halaman semua role** |
| Komponen bersama | Pindah `components/admin/*` → **`components/dashboard/*`** (netral), dipakai lintas role |
| Navbar/Footer publik | **Disembunyikan** di `/admin`, `/dashboard/*`, `/client/*` |

## 3. Arsitektur

### 3.1 Komponen bersama (refactor dari admin)

```
src/components/dashboard/
  DashboardShell.tsx        ← BARU: shell generik (sidebar + drawer + main + topbar)
  DashboardSidebarNav.tsx   ← digeneralisasi dari AdminSidebarNav (prop: items, roleLabel, home)
  DashButton.tsx            ← dari AdminButton (rename)
  DashBadge.tsx             ← dari AdminBadge
  DashCard.tsx              ← dari AdminCard
  DashPageHeader.tsx        ← dari AdminPageHeader
  DashStatCard.tsx          ← dari AdminStatCard
  DashTable.tsx             ← dari AdminTable
  nav-config.ts             ← ADMIN_NAV, VENDOR_NAV, BA_NAV, CLIENT_NAV
  index.ts
```

`src/components/admin/*` lama dihapus setelah semua konsumen dipindah ke `components/dashboard/*`.

### 3.2 Shell generik

```ts
// DashboardShell (server component)
interface DashboardShellProps {
  nav: NavGroup[];          // menu sidebar
  roleLabel: string;        // "Super Admin" | "Mitra Vendor" | "Brand Ambassador" | "Klien"
  children: ReactNode;
}
```

`DashboardSidebarNav` (client): prop `nav`, `roleLabel`, `homeHref`. Aktif berdasar `usePathname()`, drawer mobile ≤`lg`.

### 3.3 Navigasi per role (`nav-config.ts`)

```ts
VENDOR_NAV = [
  { group: "Operasional", items: [
    { label: "Ringkasan", href: "/dashboard/vendor", icon: LayoutDashboard },
    { label: "Kotak Masuk Order", href: "/dashboard/vendor/inbox", icon: Inbox },
    { label: "Kalender Blackout", href: "/dashboard/vendor/kalender", icon: CalendarDays },
    { label: "Dompet Saldo Escrow", href: "/dashboard/vendor/dompet", icon: Wallet },
  ]},
  { group: "Katalog", items: [
    { label: "Paket & Layanan", href: "/dashboard/vendor/paket", icon: Package },
    { label: "Portofolio & Feed", href: "/dashboard/vendor/portofolio", icon: ImageIcon },
  ]},
  { group: "Akun", items: [
    { label: "Data Diri & Profil", href: "/dashboard/vendor/profil", icon: UserRound },
  ]},
];

BA_NAV = [
  { group: "Kemitraan", items: [
    { label: "Ringkasan", href: "/dashboard/ba", icon: LayoutDashboard },
    { label: "Vendor Rekrutan", href: "/dashboard/ba/vendor", icon: Store },
    { label: "Komisi", href: "/dashboard/ba/komisi", icon: Coins },
    { label: "Dompet", href: "/dashboard/ba/dompet", icon: Wallet },
  ]},
];

CLIENT_NAV = [
  { group: "Acara Saya", items: [
    { label: "Ringkasan", href: "/client", icon: LayoutDashboard },
    { label: "Pesanan & Escrow", href: "/client/pesanan", icon: ReceiptText },
    { label: "Jadwal Fitting & Sesi", href: "/client/jadwal", icon: CalendarClock },
    { label: "Undangan Digital & Tamu", href: "/client/undangan", icon: Mail },
  ]},
  { group: "Akun", items: [
    { label: "Data Diri & Profil", href: "/client/profil", icon: UserRound },
  ]},
];
```

### 3.4 Layout per role

- `src/app/admin/layout.tsx` → refactor pakai `DashboardShell` + `ADMIN_NAV` + `roleLabel="Super Admin"`.
- `src/app/dashboard/vendor/layout.tsx` → ganti `VendorHeaderNav` → `DashboardShell` + `VENDOR_NAV`.
- `src/app/dashboard/ba/layout.tsx` → ganti `BaHeaderNav` → `DashboardShell` + `BA_NAV`.
- `src/app/client/layout.tsx` → ganti `ClientHeaderNav` → `DashboardShell` + `CLIENT_NAV`.

Header nav lama (`VendorHeaderNav`, `BaHeaderNav`, `ClientHeaderNav`) **tidak lagi dirender** di layout (file boleh dihapus bila tak dipakai).

### 3.5 Sembunyikan Navbar/Footer publik

Di `Navbar.tsx` & `Footer.tsx`: tambah kondisi `return null` untuk path yang diawali `/admin`, `/dashboard`, `/client`.

```ts
const isDashboardArea =
  pathname && (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/client")
  );
```

## 4. Visual (Brand Hub)

- **Sidebar**: `bg-hk-charcoal` (#2B2B2B), brand mark gradient champagne→taupe, teks `text-white/70`, hover `bg-white/10`, aktif `bg-hk-champagne/20 text-hk-champagne`.
- **Topbar/halaman**: `bg-hk-ivory`, kartu `bg-white border-hk-champagne/30 rounded-2xl shadow-sm`.
- **Tombol primer**: `bg-hk-taupe text-white` (hover `bg-hk-charcoal`); sekunder `bg-white border-hk-soft-beige`.
- **Judul halaman**: `font-editorial text-hk-charcoal`; body `font-manrope`.
- **Badge status**: token `success/warning/error/info` (teks turunan gelap agar kontras).
- **Icon**: Lucide React saja. **Tanpa emoji** di UI produksi.
- Tombol `min-h-11`, `focus-ring`. Responsif: sidebar drawer ≤`lg`, tanpa horizontal overflow di 375px.

## 5. Dashboard Landing per Role

- **Vendor** `/dashboard/vendor`: 4 `DashStatCard` (Order Masuk, GMV, Pending Verifikasi, Saldo Dompet) + `VendorTrackingSuite` (existing) + aksi cepat.
- **BA** `/dashboard/ba`: 4 `DashStatCard` (Vendor Rekrutan, Komisi, Saldo Dompet, Kode Referral) + daftar vendor + ringkasan komisi.
- **Klien** `/client`: `DashStatCard` (Pesanan Aktif, Total Belanja, Jadwal, Undangan) + order terbaru.

## 6. File yang Disentuh

| File | Aksi |
|---|---|
| `src/components/dashboard/*` | **Baru** (pindahan + shell generik + nav-config) |
| `src/components/admin/*` | Dihapus (dipindah) |
| `src/app/admin/layout.tsx` + halaman admin | Update import ke `components/dashboard` |
| `src/app/dashboard/vendor/{layout,page}.tsx` + halaman | Refactor shell + komponen |
| `src/app/dashboard/ba/{layout,page}.tsx` + halaman | Refactor shell + komponen |
| `src/app/client/{layout,page}.tsx` + halaman | Refactor shell + komponen |
| `src/components/layout/Navbar.tsx`, `Footer.tsx` | Sembunyikan di area dashboard |
| `src/components/{vendor,ba,client}/*HeaderNav.tsx` | Tak dipakai → hapus |
| `tests/*` | Update test sidebar generik + komponen dashboard |

## 7. Testing

- Update `tests/admin-sidebar.test.ts` → `tests/dashboard-nav.test.ts` (uji semua `*_NAV` punya route lengkap, icon Lucide, tanpa emoji).
- Update `tests/admin-ui-components.test.ts` → baca `components/dashboard/*`.
- Verifikasi: `npm run typecheck`, `npm test`, `npm run build` hijau; cek visual tiap role (desktop + 375px).

## 8. Risiko & Catatan

- **Jangan ubah logika data/aksi** — hanya tampilan.
- **Jangan pakai emoji**; ganti placeholder ke Lucide.
- Semua warna/font dari token design-system (brand hub).
- Hapus header nav lama hanya setelah layout tidak lagi merendernya.
- Akses middleware per role (vendor/BA/client) tidak diubah.
