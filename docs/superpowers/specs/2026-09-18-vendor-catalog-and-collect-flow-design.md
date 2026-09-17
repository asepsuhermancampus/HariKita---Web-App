# Spec: Halaman Vendor Kategori, Alur "Kumpulkan Vendor", dan Relokasi Dashboard Vendor

Tanggal: 2026-09-18
Status: Disetujui (siap masuk implementation plan)

## 1. Latar Belakang & Tujuan

Saat ini beranda menampilkan 11 card kategori (data hardcoded `CATEGORIES` di
`src/app/page.tsx`) dengan aksi "Pilih Layanan" yang mengarah ke
`/builder?cat=<id>`. Belum ada halaman publik untuk menjelajah vendor perorangan
per kategori. Route `/vendor` sudah dipakai sebagai **dashboard vendor**
(punya sub-route `dompet`, `inbox`, `kalender`, `paket`, `portofolio`, `profil`).

Tujuan:

1. Beranda menampilkan **card kategori** ("Lihat Layanan") yang mengarah ke
   halaman katalog vendor, bukan langsung ke builder.
2. Tersedia halaman publik **`/vendor`** (index 11 kategori) dan
   **`/vendor/kategori/[kategori]`** (list vendor perorangan per kategori) —
   dua tampilan yang **sengaja dibedakan** agar mudah diingat pelanggan dan
   user friendly.
3. Setiap card vendor perorangan punya tombol **"+ Rencana"** yang memasukkan
   vendor ke rencana builder. Pilihan **tidak hilang** saat berpindah halaman
   (persisten), dan dapat dikumpulkan di builder sebelum di-book.
4. `/builder` tetap dapat diakses dari navbar dan dari halaman `/vendor`.
5. Dashboard vendor dipindah ke **`/dashboard/vendor/*`** agar `/vendor` bebas
   dipakai sebagai area publik.

## 2. Klasifikasi

Architectural — merestrukturisasi routing dan mengubah perilaku state lintas
halaman (builder hydration/merge) serta memperbaiki bug ID vendor yang
berdampak pada checkout/DB.

## 3. Struktur Routing Baru

```
/vendor                              → index publik: 11 card kategori (katalog/direktori)
/vendor/kategori/[kategori]          → list vendor perorangan (marketplace, tombol +Rencana)
/vendor/[slug]                       → profil publik vendor perorangan (TETAP)
/vendor/[slug]/layout.tsx            → BARU: layout bersih tanpa header dashboard
/dashboard/vendor                    → dashboard root (DIPINDAH dari /vendor)
/dashboard/vendor/{dompet,inbox,kalender,paket,portofolio,profil,profile}
/builder                             → tidak berubah lokasi (di-upgrade hydrate+merge)
```

`[kategori]` menggunakan nilai `categoryId` katalog (`prewed`, `busana`, `mua`,
`seserahan`, `foto`, `dekor`, `katering`, `cake`, `souvenir`, `undangan`,
`denah`) — menjaga konsistensi dengan `cartStore.categoryId` dan
`MULTI_VENDOR_CATALOG[].categoryId`.

### Struktur folder `src/app/vendor/` (setelah refactor)

```
src/app/vendor/
├── page.tsx                       ← BARU: index 11 card kategori
├── kategori/[kategori]/page.tsx   ← BARU: list vendor perorangan
└── [slug]/
    ├── page.tsx                   ← TETAP (profil publik, back-link /kategori/...)
    └── layout.tsx                 ← BARU (bersih, tanpa VendorHeaderNav)
```

### Struktur folder `src/app/dashboard/vendor/` (setelah refactor)

```
src/app/dashboard/vendor/
├── page.tsx          (dari src/app/vendor/page.tsx)
├── layout.tsx        (dari src/app/vendor/layout.tsx)
├── error.tsx         (dari src/app/vendor/error.tsx)
├── dompet/ inbox/ kalender/ paket/ portofolio/ profil/ profile/
```

Catatan penting: profil publik `/vendor/[slug]` saat ini **mewarisi**
`vendor/layout.tsx` (header nav dashboard). Setelah dashboard pindah, folder
`vendor/` tidak lagi punya `layout.tsx` dashboard; sebagai gantinya
`[slug]/layout.tsx` baru yang bersih ditambahkan.

## 4. State & Aliran Data "Kumpulkan Vendor"

**Mekanisme:** reuse `cartStore` (`src/lib/cart-store.ts`, key
`hk_cart_v1`) yang sudah persistent (localStorage) dan **dedupe 1 vendor per
`categoryId`** (`addItem` baris 107-128). Tidak menambah store/provider baru.

### Alur dari card vendor perorangan (`/vendor/kategori/[slug]`)

```
Tombol "+ Rencana" pada card vendor
  → cartStore.addItem({
      vendorId: vendor.id,           // ID katalog asli, mis. "v_katering_01"
      categoryId: vendor.categoryId,
      categoryTitle: vendor.categoryTitle,
      vendorName: vendor.name,
      district: vendor.district,
      packageId, packageName, unitPrice, quantity, ...
    })
  → dedupe by categoryId (1 vendor/kategori)
      - jika kategori tsb sudah terisi vendor lain → tampilkan konfirmasi
        "Ganti <Kategori> dari <VendorA> ke <VendorB>?"
          * setuju  → replace item kategori tsb
          * batal   → no-op
  → persist ke localStorage (otomatis, sudah ada)
  → toast sukses + badge "sudah di rencana" pada card
```

### Alur saat masuk builder (`/builder`)

```
/builder mount
  1. Baca cartStore (hydrate)                      ← BARU
  2. Baca URL param ?cat= / ?vendor=  (existing)   ← existing
  3. MERGE keduanya ke selectedItems               ← PERBAIKAN (sekarang overwrite)
```

### Tiga perbaikan bug yang wajib

| Bug | Lokasi | Perbaikan |
|-----|--------|-----------|
| URL param overwrite seluruh map | `src/app/builder/page.tsx:228` | ganti `setSelectedItems({ [serviceId]: {...} })` menjadi merge: `setSelectedItems(prev => ({ ...prev, [serviceId]: {...} }))` |
| `syncToCart` memanggil `clearCart()` dulu | `src/app/builder/page.tsx:352` | hapus `clearCart()`; jadikan upsert/merge (jangan hapus item kategori lain yang tidak diubah) |
| `vendorId` palsu (`vendor_<serviceId>`) | `src/app/builder/page.tsx:363` | gunakan `catalogIdByVendorName` (sudah ada, baris 271-277) untuk menulis `vendorId` = ID katalog asli (`v_*`) |
| Hydration cartStore tidak ada | builder mount | tambah efek mount yang membaca `cartStore.getSnapshot()` dan merge ke `selectedItems` (memetakan `categoryId`/`vendorId` → serviceId via `categoryToServiceMap`/`vendorToServiceMap`) |

## 5. Tampilan (UI) — Dua Halaman yang Dibedakan

### A. `/vendor` (index) — "Katalog Direktori"

Gaya direktori/katalog besar (bukan marketplace):

- Hero singkat + judul besar, mis. "11 Jenis Layanan Vendor Kebumen"
- Grid **11 card kategori**: ikon besar berwarna, judul kategori, deskripsi 1
  baris, badge **"X vendor tersedia"**
- Tiap card → klik ke `/vendor/kategori/[categoryId]`
- Header memiliki tombol **"Racik Paket Hari H"** → `/builder`
- Filter chip kategori (opsional, untuk lompat cepat)
- Fokus pesan: "Ini layanan apa saja yang ada" — pengenalan kategori

### B. `/vendor/kategori/[slug]` — "Marketplace Vendor"

Gaya marketplace, kontras jelas dari index:

- Header breadcrumb: `Layanan › <Kategori>` + tombol **"Racik Paket Hari H"** → `/builder`
- Judul kategori + jumlah vendor + **filter kecamatan** (pakai `KEBUMEN_DISTRICTS`)
- List **card vendor perorangan**: foto cover, avatar, nama, badge verified,
  rating + jumlah review, harga mulai, deskripsi singkat
- Tiap card punya 2 aksi:
  - **"+ Rencana"** → `cartStore.addItem(...)` (dengan konfirmasi ganti jika
    kategori sama sudah terisi) + toast sukses
  - **"Lihat Profil"** → `/vendor/[slug]`
- **Indikator "sudah di rencana"**: card yang sudah masuk rencana diberi
  badge/centang (baca dari cartStore), persisten lintas halaman
- **Bar ringkas** di bawah: "X layanan di rencana • Racik sekarang →"
- Fokus pesan: "Ini vendor-vendor pilihan di kategori ini" — pemilihan detail

Kontras kunci agar mudah diingat: index = ikon kategori besar + nama layanan;
kategori = foto vendor + harga + rating + tombol tambah.

## 6. Title/Navbar & Link yang Diupdate

### Navbar (`src/components/layout/Navbar.tsx`)

- Nav link `"11 Layanan Kebumen"` → `/#layanan` (tetap valid)
- "Akses Portal" dropdown (baris 105) & mobile (baris 203): `/vendor` →
  **`/dashboard/vendor`**
- Tombol "Racik Paket Hari H" → `/builder` (tidak berubah)

### Homepage (`src/app/page.tsx`)

- Card kategori: tombol "Pilih Layanan" → **"Lihat Layanan"** ke
  **`/vendor/kategori/<id>`** (baris 700)
- Hapus tombol "Portofolio" + pemakaian modal `VendorPortfolioModal` **pada
  section layanan homepage** (baris 690 & 1044). File modal hanya dihapus bila
  terbukti tidak dipakai di tempat lain.
- Link "Buka Simulator Racik" (baris 599) → tetap `/builder`

### Semua link dashboard yang dipindah

- `src/components/vendor/VendorHeaderNav.tsx` baris 39, 45, 51, 57, 63, 69, 75
  → `/dashboard/vendor/*`
- Breadcrumb: `dompet/page.tsx:71`, `inbox/VendorInboxClient.tsx:113`,
  `kalender/VendorKalenderClient.tsx:92`, `paket/VendorPaketClient.tsx:143`,
  `portofolio/VendorPortofolioClient.tsx:153`,
  `profil/VendorProfilWorkspace.tsx:158`
- `inbox/VendorInboxClient.tsx:128` (`/vendor/kalender`)
- `auth/register-vendor/page.tsx:44` (`router.push("/vendor")`)
- `lib/routes.ts` baris 32-37 dan 115-120
- `lib/session.ts:63` dan `middleware.ts:35` (`getDashboardPath("VENDOR")` →
  `/dashboard/vendor/profil`)
- `src/middleware.ts`: `PROTECTED_VENDOR_SEGMENTS` + branch `/vendor` &
  `/vendor/profile` → arahkan guard ke `/dashboard/vendor/*`;
  `/vendor/kategori/*` dan `/vendor/[slug]` harus **publik** (tidak dilindungi)
- `src/app/vendor/profile/route.ts:6` → alias ke `/dashboard/vendor/profil`
- `src/app/robots.ts:19-24` → disallow `/dashboard/vendor/*`
- semua `revalidate()`/`revalidatePath()` di
  `server/actions/{vendor,vendor-profile,order,payment}.ts` → path baru

### Profil publik dipertahankan (jangan diubah)

- `src/app/vendor/[slug]/page.tsx` (back-link ke `/kategori/...` aman)
- `src/app/kategori/[slug]/page.tsx:178`
- `src/app/vendor/portofolio/VendorPortofolioClient.tsx:169` (link ke profil publik)
- `src/lib/routes.ts:11` (`VENDOR_PROFILE`)

### Middleware — catatan kritis

Karena `/vendor/[slug]` (profil publik) juga cocok dengan pola `/vendor/*`,
guard **harus hanya melindungi** `/dashboard/vendor/*`. `/vendor`,
`/vendor/kategori/*`, dan `/vendor/[slug]` = **publik**.

## 7. Testing & Definition of Done

Project belum punya test runner UI. Verifikasi:

1. `npm run build` sukses (menangkap import/link patah).
2. `npx tsc --noEmit` (bila tersedia) — type-check bersih.
3. Checklist manual/E2E:
   - `/vendor` tampil 11 card kategori → klik → `/vendor/kategori/<id>`
   - `/vendor/kategori/prewed` tampil list vendor perorangan + filter kecamatan
   - Klik "+ Rencana" → toast sukses, badge "sudah di rencana" muncul
   - Pindah kategori → tambah vendor lain → pilihan sebelumnya tetap ada
   - Klik "+ Rencana" vendor lain di kategori sama → muncul konfirmasi ganti
   - "Racik Paket Hari H" dari `/vendor` → `/builder` → vendor terpilih tampil
     (hydrate+merge)
   - Submit builder → `/checkout` dengan `vendorId` ID katalog asli (`v_*`);
     verifikasi di `hk_cart_v1`/`hk_orders_history_v1`
   - Login vendor tanpa callback → `/dashboard/vendor/profil`
   - Akses `/dashboard/vendor/*` tanpa login → redirect `/auth/login`
   - Akses `/vendor/kategori/prewed` & `/vendor/<slug>` tanpa login → boleh (publik)
   - `/vendor/<slug>` tidak menampilkan header nav dashboard
   - `/robots.txt` disallow `/dashboard/vendor/*`
   - Homepage card "Lihat Layanan" → `/vendor/kategori/<id>`
   - Refresh di tengah koleksi → pilihan tetap ada (localStorage)

**Definition of Done:** build pass, checklist manual hijau, tidak ada link
dashboard `/vendor/*` yang tersisa mengarah ke path lama.

## 8. Di Luar Cakupan (Non-Goals)

- Redesign menyeluruh halaman lain (kategori, undangan, admin).
- Membangun sistem pembayaran/DB baru.
- Menambah dependency state management baru (Zustand, dsb.).
- Perubahan data katalog (`MULTI_VENDOR_CATALOG`) selain yang diperlukan.
