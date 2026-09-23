# Katalog Vendor Masif + Beranda dari DB + Filter Kategori — Design Spec

> Status: Menunggu review. Setelah disetujui → implementation plan (`writing-plans`).
> Tanggal: 2026-09-24
> Branch rencana: `feat/vendor-catalog-db-home`

## 1. Latar Belakang & Masalah

1. **Sebaran vendor klik sedikit & tercampur**: beranda memakai katalog **statis** (`src/data/multi-vendor-catalog.ts`) yang hanya berisi sedikit vendor per kategori; tampilan "Semua Layanan / Busana / Katering / Suvenir" terasa minim dan pencampuran menyulitkan kurasi.
2. **Seeder minim**: hanya 11 vendor, 1 paket + 0 portofolio per vendor.
3. **Gambar tidak selalu relevan** dengan judul/kategori.

Padahal sudah ada: Dashboard SaaS semua role, verifikasi vendor (data + dokumen + peta), 11 kategori resmi (`VENDOR_CATEGORIES`), estimasi jarak.

**Tujuan:**
- Seeder **275 vendor** (25 per 11 kategori), tiap vendor **satu kategori** (tidak campur), tiap vendor **25 jasa** + **10 portofolio**, **gambar relevan per kategori**.
- **Beranda membaca vendor dari DB** (bukan statis), menampilkan **6 vendor per kategori** + tombol **"Lihat Selengkapnya"** per kategori.
- **Efek blur gradient** pada barisan terbawah grid (setengah blur ke atas) untuk memicu CTA — warna dari design-system brand hub.
- Akun login per vendor untuk testing (`081300000001..275`).
- Navbar: Login → **Dashboard →** (per role) saat sudah masuk; **Logout** di sidebar bawah (semua role); nama vendor di samping logo. *(Sudah diimplementasi — bagian dari fase ini, dikunci lewat spec.)*
- Skrip **`npm run reset-session`** untuk fresh start tiap testing.

### Non-tujuan
- T&C/SLA multi-pihak (fase terpisah — setelah ini).
- Mengubah alur ledger/payment.
- Halaman kategori (`/vendor/kategori/[kategori]`) tetap menampilkan semua vendor kategori tsb (bukan 6).

## 2. Keputusan Desain

| Pertanyaan | Keputusan |
|---|---|
| Jumlah vendor | **25 per kategori × 11 = 275 vendor** |
| Kategori per vendor | **Satu** kategori saja (tidak campur) |
| Jasa per vendor | **25 ServicePackage** |
| Portofolio per vendor | **10 VendorPortfolio** |
| Gambar | Pool Unsplash **per kategori**, dipetakan konsisten (judul↔gambar relevan) |
| Sumber beranda | **DB** (`VendorProfile` `verificationStatus="APPROVED"`) |
| Tampilan beranda | **6 vendor/kategori** + tombol **"Lihat Selengkapnya"** |
| Blur CTA | Overlay gradient **`hk-ivory` → transparan** (naik ke atas) pada baris terbawah |
| Akun login vendor | `081300000001..275` (PIN `123456`) |
| Session reset | `npm run reset-session` (rotasi `HARIKITA_SESSION_SECRET`) |
| Navbar login→dashboard | per role (ADMIN→/admin, VENDOR→/dashboard/vendor/profil, BA→/dashboard/ba, CLIENT→/client/profil) |
| Logout | tombol di sidebar bawah, panggil `logoutAction` (semua role) |

## 3. Seeder Masif

### 3.1 Sumber data
- Perluas `prisma/seed-data/vendor-services.ts`: `SERVICE_TEMPLATES` (25/kategori, sudah ada) & `PORTFOLIO_TEMPLATES` (10/kategori, sudah ada) + **pool gambar per kategori** (`IMG`, sudah ada; dipastikan cocok).
- Tambah `prisma/seed-data/vendors.ts`: generator **25 nama vendor per kategori** (nama realistis Kebumen) + atribut (alamat per kecamatan, rating, dsb).

### 3.2 Struktur vendor
```
untuk tiap kategori (11) → untuk i in 1..25:
  User    : phone = 081300 + zero-pad(index)  (unik), name = nama vendor, role VENDOR, pin 123456
  VendorProfile: category = kategori, businessName, district (rotasi 26 kecamatan),
                 verificationStatus = APPROVED, isVerified = true, profileCompleted = true,
                 ktpNumber, revenueMethod BANK, alamat, koordinat (VENDOR_COORDS rotasi),
                 rating (4.6–5.0), reviewCount, lat/lng
  ServicePackage × 25 (dari SERVICE_TEMPLATES[kategori], harga = base × factor)
  VendorPortfolio × 10 (dari PORTFOLIO_TEMPLATES[kategori], imageUrl pool kategori)
```
- **Index global** vendor (1..275) → nomor HP login berurutan & mudah dites.
- Pastikan **tidak ada** vendor yang punya kategori ganda.

### 3.3 Gambar relevan
- Pool gambar **per kategori** (mis. prewed = foto pasangan outdoor; katering = foto makanan; MUA = foto makeup; seserahan = baki/hantaran; souvenir = cendera mata). Judul portofolio & nama jasa dipetakan ke pool kategori yang **sama** → relevan.
- `imageUrl` di `ServicePackage` & `VendorPortfolio` memakai pool kategori vendor tsb.

### 3.4 Akun testing
- Vendor ke-N: HP `081300` + `String(n).padStart(6,"0")` → mis. `081300000001`..`081300000275`.
- Cetak ringkasan di akhir seed (mis. 5 contoh + rentang).
- **Data uji lama tetap**: client demo (`081900000099`), vendor PENDING (`081399000099` mis.), order demo, admin/BA.

## 4. Beranda dari DB

### 4.1 Query baru
`src/server/queries/catalog.ts`:
```ts
export interface HomeVendorCard {
  slug: string; businessName: string; categoryId: string; categoryTitle: string;
  district: string; rating: number; reviewCount: number; priceFrom: number | null;
  imageUrl: string | null;
}
// vendor APPROVED per kategori, urut rating desc, limit N (6 di beranda)
export async function getHomeVendorsByCategory(limitPerCategory = 6): Promise<Record<string, HomeVendorCard[]>>;
// semua vendor 1 kategori (halaman "lihat selengkapnya")
export async function getVendorsByCategoryFromDb(categoryId: string): Promise<HomeVendorCard[]>;
```
- `slug` vendor: turunkan dari `businessName` + short id (stabil). Tambah kolom `slug` bila perlu **atau** derive deterministik (mis. `slugify(businessName)-<id8>`).

> **Catatan skema**: untuk kemudahan, tambahkan kolom `slug String? @unique` di `VendorProfile` (kedua schema) + isi saat seed. Perlu migrasi Neon.

### 4.2 Pemetaan kategori → label
Gunakan `VENDOR_CATEGORIES` (11) untuk label & urutan tab. `categoryId` vendor disimpan di `VendorProfile.category` — perlu **pemetaan nama kategori → id** (mis. `"Makeup Artist (MUA)"` → `"mua"`). Buat util `categoryNameToId`.

### 4.3 Beranda UI
- Tab: **"Semua Layanan"** (default) + 11 kategori (MUA, Fotografi & Video, Seserahan, Souvenir, dst).
- Untuk tiap kategori: **grid 6 kartu vendor** + overlay **blur gradient `hk-ivory`→transparan** di baris terbawah + tombol **"Lihat Selengkapnya"** → `/vendor/kategori/<id>`.
- "Semua Layanan": tampilkan ringkas per kategori (6 masing-masing) ATAU grid gabungan; rekomendasi: tampilkan **6 per kategori** berurutan.
- Kartu vendor: gambar (pool kategori), nama, kecamatan, rating, harga mulai.

### 4.4 Halaman kategori
- `/vendor/kategori/[kategori]` membaca dari DB (semua 25 vendor kategori tsb). Bila sebelumnya statis, ganti ke DB.

## 5. Blur CTA (warna brand)
Overlay pada baris terbawah grid:
```tsx
<div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-hk-ivory via-hk-ivory/80 to-transparent" />
```
- `from-hk-ivory` (#F8F6F1, latar beranda) → transparan ke atas = efek "kabut" elegan.
- Tombol "Lihat Selengkapnya" di atas overlay, `pointer-events-auto`.

## 6. Navbar, Sidebar, Logout, Reset Session (dikunci di spec)
- **Navbar**: bila `isLoggedIn`, tampilkan tombol **"Dashboard →"** (label + ikon `LayoutDashboard` + `ArrowRight`) menuju `getDashboardPath(role)`. Bila belum login → tombol **Login**.
- **Sidebar**: di samping logo tampilkan **nama pengguna** (vendor → businessName; BA → displayName; client/admin → name) + **roleLabel**. Bawah: tombol **"Keluar"** (`logoutAction`).
- **reset-session**: `scripts/reset-session.mjs` merotasi `HARIKITA_SESSION_SECRET` di `.env`/`.env.local` → semua cookie lama invalid.

## 7. File yang Disentuh

| File | Aksi |
|---|---|
| `prisma/seed-data/vendor-services.ts` | Perluas pool gambar relevan |
| `prisma/seed-data/vendors.ts` | **Baru** — generator 25 vendor/kategori |
| `prisma/seed.ts` | Vendor loop → 275 vendor (25/kategori) |
| `prisma/schema.prisma` + `schema.sqlite.prisma` | Tambah `VendorProfile.slug` (+ migrasi Neon) |
| `src/server/queries/catalog.ts` | **Baru** — query beranda & kategori dari DB |
| `src/lib/vendor-categories.ts` | Util `categoryNameToId` |
| `src/app/page.tsx` | Beranda baca DB + 6/kategori + blur CTA + tab |
| `src/app/vendor/kategori/[kategori]/page.tsx` | Baca DB (semua vendor kategori) |
| `src/components/layout/Navbar.tsx` | Tombol Dashboard→ *(sudah)* |
| `src/components/dashboard/*` | Sidebar nama + logout *(sudah)* |
| `scripts/reset-session.mjs` | **Baru** *(sudah dibuat)* |
| `tests/*` | unit slug/kategori map + query |

## 8. Risiko & Catatan
- **Skala seed**: 275 vendor × 25 jasa = **~6.875 jasa** + 2.750 portofolio → seed lebih lama & DB Neon bertambah besar. Gunakan `createMany` bila memungkinkan, atau batch.
- **Migrasi Neon**: kolom `slug` perlu `migrate deploy`.
- **Performa beranda**: batasi 6/kategori + index; hindari query N+1 (agregasi per kategori).
- **Gambar**: pakai pool Unsplash per kategori (konsisten & relevan). Pastikan URL valid.
- **Jangan** ubah ledger/payment. Dua schema Prisma sinkron.
- Font/warna tetap design-system brand hub.
- Seed **reset** data (hapus lalu isi ulang) — termasuk akun demo uji.
