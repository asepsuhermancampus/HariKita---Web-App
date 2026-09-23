# Galeri Portofolio (Gaya IG) + Produk Ber-gambar & Galeri Foto — Design Spec

> Status: Menunggu review → implementation plan.
> Tanggal: 2026-09-25
> Branch: `feat/vendor-gallery-and-product-media`

## 1. Latar Belakang & Tujuan

Halaman profil publik vendor (`/vendor/[slug]`) & produk perlu diperkaya:
- **Galeri portofolio ala Instagram**: grid rapat, foto menempel, rounded hanya di 4 sudut foto terluar;
  ikon love (kanan bawah) tiap foto; ikon "multi-foto" (kanan atas) bila post punya >1 foto;
  title/tag/caption/like **disembunyikan** di grid, muncul saat foto **diklik** (modal).
- **Pilihan Produk Layanan**: tiap card produk **menampilkan gambar**; klik → halaman produk.
- **Halaman produk**: lebih lengkap (lokasi, kelengkapan bervariasi) + **~8 foto event** sebagai
  thumbnail; klik thumbnail → foto besar berganti.

Semua data dari **DB (seeder)** — bukan statis. Foto **relevan** dengan title/deskripsi/tag/lokasi.

## 2. Keputusan Desain

| Pertanyaan | Keputusan |
|---|---|
| Multi-foto post | Kolom baru `VendorPortfolio.images String?` (JSON array URL; foto ke-1 = cover/`imageUrl`) |
| Galeri foto produk | Kolom baru `ServicePackage.galleryImages String?` (JSON array ~8 URL) |
| Lokasi foto | `VendorPortfolio.locationTag` sudah ada; produk: pakai `callTime`/variasi teks |
| Kelengkapan bervariasi | `ServicePackage.includes` (JSON) di-seed **bervariasi** per paket (bukan sama semua) |
| Rounded sudut terluar | Grid dengan gap-0; rounded pada item indeks sudut (0,3,4,7,...) via class kondisional |
| Love + multi-foto | Ikon Lucide `Heart`/`Images` overlay di grid |
| Detail saat diklik | Modal (lightbox) menampilkan title, tag, caption, like, dan slider foto post |
| Sumber data | DB via `getPublicVendorBySlug` (sudah) — perluas include images & galleryImages |
| Statis lain | `portfolio-store` (localStorage) **tidak** dipakai untuk profil publik; sumber = DB |

## 3. Skema (tambah kolom, kedua provider)

```prisma
model VendorPortfolio {
  // ...existing...
  images String?   // JSON array URL (multi-foto). imageUrl tetap foto utama/cover.
}
model ServicePackage {
  // ...existing...
  galleryImages String?  // JSON array URL ~8 foto event
}
```
- Migrasi baru (Neon) + `db push` SQLite.

## 4. Seeder
- **VendorPortfolio**: tiap post dapat **1–4 foto** (JSON) — foto relevan per kategori (pool kategori).
  Foto dari pool kategori vendor (mis. prewed → foto pasangan/outdoor). `imageUrl` = foto pertama.
- **ServicePackage**: tiap paket dapat `galleryImages` ~8 foto (pool kategori, variasi). `includes` bervariasi
  (min 3–6 item, dari daftar fitur per kategori yang lebih kaya), `slaDays` bervariasi.
- **Post `likes`** bervariasi (sudah).
- Semua deterministik (agar tidak berubah tiap seed).

## 5. UI

### 5.1 Galeri portofolio (tab Galeri di `/vendor/[slug]`)
- Grid `grid-cols-2 sm:grid-cols-3` (rapat, `gap-0`), tiap item `aspect-square`.
- **Rounded hanya sudut terluar grid** — hitung indeks: item baris pertama (pertama & terakhir per baris)
  dan baris terakhir. Implementasi: `rounded-tl-*`/`rounded-tr-*`/`rounded-bl-*`/`rounded-br-*` kondisional
  berdasar posisi (indeks 0, index kolom terakhir baris pertama, dst). Karena kolom responsif, gunakan
  pendekatan: wrapper grid `rounded-3xl overflow-hidden` (paling andal & rapi) — **atau** rounded per-sudut
  item. **Rekomendasi:** wrapper `overflow-hidden rounded-3xl` (rounded hanya muncul di sudut grid = 4 foto terluar). ✅
- Tiap foto: overlay ikon `Heart` (kanan bawah) + `Images` (kanan atas bila post.images.length > 1).
- Klik foto → **modal** (multi-foto post): tampilkan foto besar + thumbnail bila >1, title, tag, caption, `likes`.

### 5.2 Tab Produk
- Card produk menampilkan **gambar** (product.image) + nama + harga + unit + (potong deskripsi).

### 5.3 Halaman produk `/vendor/[slug]/produk/[productSlug]`
- Foto utama besar + **jejeran thumbnail (galleryImages ~8)**; klik thumbnail → foto utama berganti.
- Info lengkap: harga, unit, call time, **lokasi** (label), deskripsi, **kelengkapan** (`features` bervariasi).

## 6. File yang Disentuh

| File | Aksi |
|---|---|
| `prisma/schema.prisma` + `schema.sqlite.prisma` | Kolom `VendorPortfolio.images`, `ServicePackage.galleryImages` |
| `prisma/seed-data/vendor-services.ts` | Pool gambar & fitur bervariasi |
| `prisma/seed.ts` | Isi images (1–4) & galleryImages (~8) + includes bervariasi |
| `src/server/queries/catalog.ts` | `PublicVendorProduct.galleryImages`; portfolio `images[]` |
| `src/components/vendor/PublicVendorProfileClient.tsx` | Grid IG + modal + card produk ber-gambar |
| `src/app/vendor/[slug]/produk/[productSlug]/ProductDetailClient.tsx` | Galeri thumbnail |

## 7. Non-tujuan
- Tidak menyentuh ledger/payment. Tidak mengubah cart logic.
- `portfolio-store` (localStorage) dibiarkan untuk dashboard vendor, tidak untuk profil publik.

## 8. Testing
- Unit: util parse JSON images (fallback aman).
- Verifikasi: typecheck/test/build; manual galeri & produk.
- Migrasi Neon.
