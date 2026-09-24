# Galeri Portofolio (IG) + Produk Media — Implementation Plan

> **For agentic workers:** Eksekusi task-by-task (superpowers:executing-plans inline).

**Goal:** Galeri portofolio gaya Instagram (grid rapat, rounded sudut terluar, love, multi-foto, modal detail) + card produk ber-gambar + halaman produk ber-galeri foto (thumbnail switch). Semua data dari seeder DB.

**Architecture:** Tambah kolom JSON (`VendorPortfolio.images`, `ServicePackage.galleryImages`); perkaya seeder; perluas query publik; ubah UI galeri/produk.

**Spec:** `docs/superpowers/specs/2026-09-25-vendor-gallery-and-product-media-design.md`

## Global Constraints
- Font/warna design-system; ikon Lucide; tanpa emoji. Jangan ubah ledger/cart logic.
- Foto relevan per kategori; kelengkapan bervariasi. Dua schema Prisma sinkron.
- Verifikasi: `npm run typecheck` + `npm test` + `npm run build`.

---

### Task 1: Skema — kolom `images` & `galleryImages`

**Files:** Modify `prisma/schema.prisma`, `prisma/schema.sqlite.prisma`

- [x] **Step 1: Backup dev.db** (`copy prisma\dev.db prisma\dev.db.bak`)
- [x] **Step 2:** Di `VendorPortfolio` tambah `images String?` (JSON array). Di `ServicePackage` tambah `galleryImages String?` (JSON array). Kedua schema.
- [x] **Step 3:** validate + generate + push SQLite.
```bash
npx prisma validate --schema prisma/schema.prisma
npm run generate && npm run generate:sqlite
$env:DATABASE_URL="file:" + ((Resolve-Path "prisma\dev.db").Path -replace '\\','/'); npx prisma db push --schema prisma/schema.sqlite.prisma --skip-generate
```
- [x] **Step 4: Commit** `feat(vendor): add portfolio.images + package.galleryImages`

---

### Task 2: Seeder — images & galleryImages + includes bervariasi

**Files:** Modify `prisma/seed-data/vendor-services.ts`, `prisma/seed.ts`

- [x] **Step 1:** Perkaya pool `IMG` (≥10/kategori) & tambah daftar fitur per kategori (`FEATURE_SETS`) bervariasi.
- [x] **Step 2:** Di seed loop: `images = imgPool` subset 1–4 (deterministik berdasar index post), `imageUrl = images[0]`.
- [x] **Step 3:** `galleryImages = imgPool` 8 foto (rotasi), `includes = FEATURE_SETS[kategori]` subset bervariasi (3–6).
- [x] **Step 4:** Seed ke SQLite; verifikasi jumlah & isi (mis. 1 vendor: post punya images 1–4, paket punya gallery 8).
- [x] **Step 5: Commit** `feat(seed): portfolio multi-images + product galleries + varied includes`

---

### Task 3: Query — perluas PublicVendor

**Files:** Modify `src/server/queries/catalog.ts`

- [x] **Step 1:** `PublicVendor.portfolio` item tambah `images: string[]` (parse JSON; fallback `[imageUrl]`).
- [x] **Step 2:** `PublicVendorProduct` tambah `galleryImages: string[]` (parse JSON; fallback `[image]`).
- [x] **Step 3:** typecheck.
- [x] **Step 4: Commit** `feat(catalog): expose portfolio images + product gallery in public query`

---

### Task 4: Galeri portofolio gaya IG + modal

**Files:** Modify `src/components/vendor/PublicVendorProfileClient.tsx`

- [x] **Step 1:** Ganti grid portofolio → grid rapat `grid-cols-2 sm:grid-cols-3 gap-0` dalam wrapper `rounded-3xl overflow-hidden`, item `aspect-square`.
- [x] **Step 2:** Tiap foto overlay: `Heart` kanan-bawah (ikon love); bila `images.length>1`, `Images` kanan-atas.
- [x] **Step 3:** Klik foto → modal: foto besar (slider bila multi), title, tag, caption, `likes`.
- [x] **Step 4:** typecheck + build + verifikasi manual.
- [x] **Step 5: Commit** `feat(vendor): instagram-style portfolio grid + detail modal`

---

### Task 5: Card produk ber-gambar

**Files:** Modify `src/components/vendor/PublicVendorProfileClient.tsx`

- [x] **Step 1:** Card produk tampilkan `<Image src={product.image}>` (aspect-[4/3]) di atas info.
- [x] **Step 2:** typecheck + build.
- [x] **Step 3: Commit** `feat(vendor): product cards show image`

---

### Task 6: Halaman produk — galeri thumbnail + kelengkapan bervariasi

**Files:** Modify `src/app/vendor/[slug]/produk/[productSlug]/ProductDetailClient.tsx`

- [x] **Step 1:** Foto utama pakai state `activeImage` (default `product.image`).
- [x] **Step 2:** Jejeran thumbnail (`product.galleryImages`, ~8) di bawah; klik → setActiveImage.
- [x] **Step 3:** Tampilkan info lengkap: lokasi/call time, deskripsi, kelengkapan (`features`), harga, unit.
- [x] **Step 4:** typecheck + build + verifikasi manual.
- [x] **Step 5: Commit** `feat(vendor): product detail gallery thumbnails + full info`

---

### Task 7: Migrasi Neon + seed + verifikasi akhir

- [x] **Step 1:** Buat migration diff Neon → schema (tanpa BOM); `migrate deploy`.
- [x] **Step 2:** `npm run db:seed` (Neon).
- [x] **Step 3:** typecheck + test + build.
- [x] **Step 4: Commit** `chore(db): migration for portfolio images + package gallery`

## Self-Review
- Spec §4 (seeder) → T2; §5.1 (galeri) → T4; §5.2 (card produk) → T5; §5.3 (galeri produk) → T6; §3 (skema) → T1; query → T3. ✅
- Konsistensi: `images`/`galleryImages` (T1) → T2 → T3 → T4/T5/T6.
