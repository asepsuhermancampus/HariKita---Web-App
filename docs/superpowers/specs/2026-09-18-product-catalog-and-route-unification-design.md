# Spec: Katalog Produk Multi-Vendor, Detail Produk, dan Penyeragaman Route Kategori

Tanggal: 2026-09-18
Status: Disetujui (siap masuk implementation plan)

## 1. Latar Belakang & Tujuan

Pekerjaan sebelumnya (lihat `2026-09-18-vendor-catalog-and-collect-flow-design.md`)
sudah menetapkan route katalog publik `/vendor` dan `/vendor/kategori/[kategori]`.
Namun masih ada ketidaksesuaian:

1. **Beranda** (`src/app/page.tsx`) masih memakai array hardcoded `CATEGORIES`
   yang menampilkan **nama vendor + harga** pada card kategori. Seharusnya card
   beranda hanya menampilkan **jenis kategori** (ikon, judul, deskripsi singkat,
   tombol "Lihat Layanan").
2. **Dua sistem kategori paralel** yang duplikat: sistem lama `/kategori` dan
   `/kategori/[slug]` (data hardcoded, jumlah vendor palsu) vs sistem baru
   `/vendor` dan `/vendor/kategori/[kategori]` (dari `VENDOR_CATEGORIES`).
3. Belum ada konsep **produk perorangan** di bawah vendor. `VendorPackage` hanya
   1-2 paket per vendor. Tujuan produk: tiap vendor punya banyak produk
   (mis. 15) dengan **satuan** berbeda (paket borongan, per pax, per pcs), bisa
   disaring berdasarkan **jenis produk**, dan bisa **diatur jumlahnya** sebelum
   masuk keranjang.

Tujuan:

1. Beranda menampilkan **card kategori murni** (tanpa vendor/harga), sumber data
   `VENDOR_CATEGORIES`, tombol "Lihat Layanan" ke `/vendor/kategori/[id]`.
2. Menyeragamkan routing kategori ke **satu sistem**: `/vendor` &
   `/vendor/kategori/[kategori]`. Sistem lama `/kategori/*` **dihapus** dan
   di-redirect ke sistem baru.
3. Menambah jenjang **produk di bawah vendor**: `/vendor/[slug]/produk/[slug]`
   dengan **stepper jumlah (quantity)** dan **satuan** (unitType/unitLabel).
4. Menyediakan **generator statis** data dummy skala penuh (11 kategori × 20
   vendor × 15 produk) sebagai fondasi data yang konsisten dan mudah dibuang
   saat pindah ke DB.
5. Memperluas keranjang agar mendukung **multi-produk per vendor** (mis. bakso +
   sate dari vendor yang sama = dua baris).

## 2. Klasifikasi

Architectural — merestrukturisasi routing (hapus sistem lama, tambah level
produk), mengubah model data katalog (packages → products), dan mengubah
perilaku state keranjang lintas halaman.

## 3. Struktur Routing Final

```
/                                          Beranda (card 11 kategori murni)
│
├── /vendor                                Indeks 11 kategori (dari VENDOR_CATEGORIES)
│
├── /vendor/kategori/[kategori]            Daftar vendor dalam kategori
│   │                                      + filter kecamatan
│   │                                      + filter jenis produk (productTags gabungan)
│   │
│   └── /vendor/[vendorSlug]               Profil vendor + daftar produk (tab)
│       │                                  + filter jenis produk
│       │
│       └── /vendor/[vendorSlug]/produk/[productSlug]   Detail produk
│                                                        + stepper jumlah (porsi/pcs)
│                                                        + tambah ke keranjang
│
└── /kategori/*  →  redirect 308  →  /vendor/*
```

`[kategori]` memakai nilai `categoryId` (`prewed`, `busana`, `mua`, `seserahan`,
`foto`, `dekor`, `katering`, `cake`, `souvenir`, `undangan`, `denah`).

Contoh alur katering:

```
/  →  /vendor/kategori/katering  →  /vendor/dapur-bahagia  →  /vendor/dapur-bahagia/produk/stall-bakso
      (20 vendor)                   (profil + 15 produk)      (300 pax → keranjang)
```

### Struktur folder `src/app/vendor/` (setelah perubahan)

```
src/app/vendor/
├── page.tsx                                    (ADA, pakai VENDOR_CATEGORIES)
├── kategori/[kategori]/page.tsx                (ADA, tambah filter jenis produk)
└── [slug]/
    ├── page.tsx                                (ADA: profil + tab produk)
    ├── layout.tsx                              (ADA, bersih)
    └── produk/[productSlug]/page.tsx           BARU: detail produk + stepper
```

### Route collision — WAJIB

`produk` dan `kategori` harus ditambahkan ke `RESERVED_VENDOR_SLUGS` di
`src/lib/routes.ts`. Tanpa ini, vendor dengan slug `kategori` atau `produk` akan
menabrak segmen statis. `kategori` sudah aman secara praktik (segmen statis
menang), tetapi `produk` adalah segmen baru di bawah `[slug]` dan harus
di-reserve secara eksplisit.

## 4. Model Data

### 4.1 `VendorPackage` → `VendorProduct` (ganti nama, bukan tambah)

```ts
export type UnitType = "package" | "pax" | "piece" | "portion";

export interface VendorProduct {
  id: string;
  slug: string;                 // BARU: segmen URL /produk/[slug]
  name: string;
  price: number;                // IDR
  unitType: UnitType;           // BARU
  unitLabel: string;            // BARU: "per paket" | "per pax" | "per pcs" | "per porsi"
  minQuantity?: number;         // BARU: mis. souvenir min 50
  maxQuantity?: number;         // BARU: opsional
  image: string;                // BARU: gambar produk
  desc: string;
  callTime: string;
  features: string[];
  productTags: string[];        // BARU: ["prasmanan","stall"]
}
```

Field `packages[]` di `VendorProfile` **diganti** menjadi `products[]`. Semua
konsumen (`src/app/vendor/[slug]/page.tsx`, `cart-store`, dll.) diperbarui.

### 4.2 `VendorProfile` (perubahan)

```ts
export interface VendorProfile {
  // ... field lama tetap ...
  products: VendorProduct[];    // menggantikan packages[]
  tagline?: string;             // BARU
}
```

### 4.3 Taksonomi `productTags` per kategori

| Kategori  | Contoh productTags                                        |
|-----------|-----------------------------------------------------------|
| katering  | prasmanan, stall, dessert, snack, minuman                 |
| prewed    | outdoor, studio, indoor, drone                            |
| busana    | adat, modern, keluarga                                    |
| mua       | soft-glam, adat, hijab                                    |
| seserahan | akrilik, mahar, jati                                      |
| foto      | akad, resepsi, cinematic, drone                           |
| dekor     | pelaminan, photobooth, rustic                             |
| cake      | tiered, dessert-table, tumpeng                            |
| souvenir  | pandan, linen, edible                                     |
| undangan  | digital, cetak, wax-seal                                  |
| denah     | kartun, qr, cetak                                         |

### 4.4 Generator statis

File BARU: `src/data/catalog-generator.ts`

- Fungsi `generateCatalog(): VendorProfile[]`.
- **Deterministik** (seed tetap, tanpa `Math.random()` pada nilai yang berubah
  antar build) agar hasil stabil dan testable.
- Template nama vendor + 15 template produk per kategori, dengan satuan &
  productTags yang sesuai.
- Menghasilkan 11 × 20 = **220 vendor**, tiap vendor **15 produk** = 3.300 produk.
- `src/data/multi-vendor-catalog.ts` tetap menjadi modul ekspor akhir
  (`MULTI_VENDOR_CATALOG`), kini bersumber dari generator. 12 vendor lama
  dipertahankan sebagai bagian dari seed bila memungkinkan agar konten contoh
  eksisting tidak hilang.

### 4.5 Keranjang (multi-produk per vendor)

`CartVendorItem` (di `src/lib/cart-store.ts`) tambah:

```ts
unitLabel?: string;    // "per pax" untuk tampilan
productSlug?: string;  // untuk link balik
```

**Perubahan logika kunci:** saat ini `addItem` melakukan dedupe **by
`categoryId`** (1 vendor per kategori, replace). Untuk mendukung multi-produk
per vendor, key menjadi **`vendorId + packageId`** sehingga produk berbeda dari
vendor yang sama menjadi baris terpisah.

- Menambah produk dari vendor & kategori yang sama, produk **berbeda** →
  tambah baris baru (akumulasi).
- Menambah produk **yang sama persis** (`vendorId + packageId` sama) → perbarui
  quantity baris itu (upsert), bukan duplikasi.
- Ketika klien memilih vendor **berbeda** untuk kategori yang sama: satu kategori
  tetap hanya boleh diisi satu vendor (dedupe by `categoryId` di tingkat vendor).
  Bila kategori itu sudah terisi vendor lain, tampilkan konfirmasi
  "Ganti <Kategori> dari <VendorA> ke <VendorB>?"; setuju → ganti seluruh produk
  vendor lama di kategori itu, batal → no-op. Aturan ini eksplisit dan konsisten
  dengan `2026-09-18-vendor-catalog-and-collect-flow-design.md`.

## 5. Tampilan (UI)

### 5.1 Beranda (`src/app/page.tsx`)

- Ganti sumber card dari `CATEGORIES` (hardcoded) menjadi `VENDOR_CATEGORIES`.
- Card hanya: ikon, judul kategori, deskripsi singkat, jumlah vendor tersedia,
  tombol "Lihat Layanan" → `/vendor/kategori/[id]`.
- **Hapus** nama vendor, harga, dan foto vendor dari card beranda.
- Filter tab fase (Semua / Pra-Acara / Hari H / Detail) tetap dipertahankan,
  bersumber dari `phase` di `VENDOR_CATEGORIES`.

### 5.2 Indeks Kategori (`/vendor`)

Sudah benar. Pastikan tertaut dari navigasi utama.

### 5.3 Daftar Vendor per Kategori (`/vendor/kategori/[kategori]`)

- Pertahankan filter **kecamatan**.
- Tambah filter **jenis produk** (gabungan `productTags` unik dari seluruh vendor
  di kategori itu).
- Card vendor menampilkan: nama, rating, kecamatan, "15 produk", harga termurah.
- Tombol → `/vendor/[slug]`.

### 5.4 Profil Vendor (`/vendor/[slug]`)

- Tab "Portofolio" dan tab "Produk (15)".
- Tab Produk: filter jenis, grid card produk (gambar, nama, harga, satuan),
  tombol → `/vendor/[slug]/produk/[productSlug]`.
- Perbaiki tombol "Kembali" agar mengarah ke `/vendor/kategori/[categoryId]`
  (bukan `/kategori/[categoryId]`).

### 5.5 Detail Produk (`/vendor/[slug]/produk/[productSlug]`) — BARU

```
[Breadcrumb: Kategori / Vendor / Produk]
[Gambar produk]   Nama Produk
                  Nama Vendor · Kecamatan
                  Rp <harga> [per pax]
                  Deskripsi
                  Kelengkapan (features)
                  Jumlah: [ - ] <qty> [ + ]
                  Estimasi: Rp <harga × qty>
                  Min. <minQuantity>
                  [ Tambah ke Keranjang ]
```

- Stepper quantity menyesuaikan `unitType`:
  - `package` → quantity terkunci 1 (atau kelipatan paket).
  - `pax`/`piece`/`portion` → quantity bebas dengan `minQuantity`.
- Hitung `unitPrice × quantity` secara live.
- Tombol tambah → `cartStore.addItem` dengan `unitLabel` & `productSlug`.

### 5.6 Keranjang / Ringkasan

- Tampilkan `quantity + unitLabel` (mis. "300 pax").
- Mendukung multi-produk per vendor.

## 6. Penghapusan Sistem Lama `/kategori/*`

| Yang dihapus/diubah                                   | Tindakan                              |
|-------------------------------------------------------|---------------------------------------|
| `src/app/kategori/page.tsx`                           | Hapus; redirect 308 → `/vendor`       |
| `src/app/kategori/[slug]/page.tsx`                    | Hapus; redirect 308 → `/vendor/kategori/[slug]` |
| `src/app/kategori/layout.tsx`, `loading.tsx`          | Hapus                                 |
| `src/app/not-found.tsx` link `/kategori`              | Ubah → `/vendor`                      |
| `src/components/vendor/VendorHeaderNav.tsx` link `/kategori` | Ubah → `/vendor`               |
| `src/lib/routes.ts` `KATEGORI`, `KATEGORI_DETAIL`     | Ubah → `/vendor`, `/vendor/kategori/${slug}` |
| `src/lib/routes.ts` `ROUTE_REGISTRY` entri `/kategori`| Ubah → `/vendor`                     |
| `src/lib/routes.ts` `RESERVED_VENDOR_SLUGS`           | Tambah `kategori`, `produk`           |

Redirect dapat diletakkan di `next.config` (rewrites/redirects) atau file
`page.tsx` yang memanggil `redirect()` Next.js.

## 7. Testing & Definition of Done

Test runner: proyek memakai `node:test` (lihat `tests/`).

Test yang wajib:

1. Generator: jumlah 11 kategori × 20 vendor = 220 vendor; tiap vendor 15 produk;
   hasil deterministik antar pemanggilan.
2. `getVendorsByCategory(id)` mengembalikan 20 vendor per kategori.
3. Fungsi lookup produk by `vendorSlug + productSlug` mengembalikan produk benar.
4. `RESERVED_VENDOR_SLUGS` memuat `kategori` & `produk`.
5. Cart: menambah dua produk berbeda dari vendor sama → 2 baris; menambah produk
   sama dua kali → quantity bertambah (upsert).

Verifikasi tambahan:

- `npm run build` sukses.
- `npx tsc --noEmit` bersih (bila tersedia).
- Checklist manual:
  - Beranda menampilkan 11 card kategori tanpa vendor/harga.
  - Klik "Lihat Layanan" → `/vendor/kategori/<id>`.
  - `/vendor/kategori/katering` menampilkan 20 vendor + filter kecamatan & jenis.
  - `/vendor/dapur-bahagia` menampilkan 15 produk di tab Produk.
  - Klik produk → `/vendor/dapur-bahagia/produk/stall-bakso`; stepper porsi
    menyesuaikan satuan; estimasi harga benar.
  - Tambah 300 pax bakso + 300 pax sate → 2 baris keranjang, label "per pax".
  - `/kategori` → redirect ke `/vendor`; `/kategori/katering` → redirect ke
    `/vendor/kategori/katering`.

**Definition of Done:** semua test hijau, build pass, checklist manual hijau,
tidak ada referensi tersisa ke `/kategori/*` sebagai navigasi aktif.

## 8. Di Luar Cakupan (Non-Goals)

- Migrasi ke database (Prisma) untuk katalog — katalog tetap statis pada fase ini.
- Sistem pembayaran/checkout baru.
- Redesign halaman lain di luar jalur katalog (undangan, admin, dll.).
- Menambah library state management baru.
- Penggantian total konten 12 vendor lama (dipertahankan bila memungkinkan).
