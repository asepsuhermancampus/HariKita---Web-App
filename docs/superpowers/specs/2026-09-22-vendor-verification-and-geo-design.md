# Vendor Verification + Peta & Estimasi Jarak — Design Spec

> Status: Menunggu review. Setelah disetujui → lanjut ke implementation plan (`writing-plans`).
> Tanggal: 2026-09-22
> Branch rencana: `feat/vendor-verification-and-geo`

## 1. Latar Belakang & Masalah

Saat ini vendor bisa mendaftar (OTP) dan **langsung tampil** di katalog (`VendorProfile.verificationStatus` default `APPROVED`, `isVerified` default `true`) tanpa validasi. Tidak ada:
- Bukti identitas/usaha (KTP, foto usaha) — **rawan penipuan** (vendor tidak nyata / menghilang).
- Alamat terstruktur & titik koordinat → tidak bisa menghitung jarak.
- Estimasi jarak vendor↔client (dibutuhkan untuk transparansi biaya tempuh/operasional).

**Tujuan:**
1. Vendor **wajib** melengkapi data usaha + unggah dokumen (KTP, foto usaha), lalu **pengajuan verifikasi** → admin menyetujui/menolak. Hanya `APPROVED` yang tampil & bisa terima order.
2. **Alamat terstruktur + koordinat peta** untuk vendor & client (antisipasi penipuan & presisi).
3. **Estimasi jarak berkendara** (rute nyata, bukan garis lurus) via OSRM, tampil ke client saat order.
4. Data tersimpan rapi untuk penelusuran bila terjadi masalah.

### Ruang lingkup & non-tujuan
**In-scope:** verifikasi vendor (data + dokumen + alur), alamat terstruktur + peta koordinat (vendor & client), estimasi jarak.
**Non-tujuan:** T&C/SLA multi-pihak (Vendor/Client/BA) — fase terpisah. Payment gateway live. Object storage (fase ini folder lokal).

## 2. Keputusan Desain

| Pertanyaan | Keputusan |
|---|---|
| Dokumen wajib vendor | KTP (foto), foto usaha, nama usaha, rekening (bank/e-wallet) + jenis, nama lengkap, no WA, alamat terstruktur |
| Alamat | RT/RW, dusun, desa/kelurahan, kecamatan, kabupaten (Kebumen), **kode pos auto** |
| Peta | **Leaflet + OpenStreetMap** (gratis, tanpa API key) |
| Jarak | **OSRM** (`router.project-osrm.org`) rute berkendara nyata; fallback Haversine bila gagal |
| Simpan file | Folder lokal `public/uploads/vendor/{userId}/` (fase ini) |
| Alur vendor baru | Daftar OTP → `PENDING` (tidak tampil) → lengkapi + ajukan → admin verifikasi → `APPROVED` (tampil) |
| Client | Tambah nama pasangan + alamat terstruktur + koordinat |
| Otorisasi verifikasi | `requireAdminCapability("VERIFY_VENDOR")` + audit (sudah ada) |

## 3. Arsitektur

### 3.1 Model Data (Prisma — tambah kolom)

**`VendorProfile`** — tambah:
```prisma
// pemilik
ktpNumber        String?
ktpPhotoUrl      String?
businessPhotoUrl String?
// rekening
revenueMethod    String?   // "BANK" | "EWALLET"
ewalletProvider  String?   // "DANA" | "OVO" | "GoPay" | "ShopeePay"
// alamat terstruktur
rt               String?
rw               String?
dusun            String?
desa             String?
kecamatan        String?
kabupaten        String?   @default("Kebumen")
postalCode       String?
// koordinat
latitude         Float?
longitude        Float?
// kelengkapan
profileCompleted Boolean   @default(false)
submittedAt      DateTime?
```
- Ubah `verificationStatus` default **`PENDING`** (vendor baru tidak langsung tampil).
- Ubah `isVerified` default **`false`**.

**`ClientProfile`** — tambah:
```prisma
rt, rw, dusun, desa, kecamatan: String?
kabupaten String? @default("Kebumen")
postalCode String?
latitude  Float?
longitude Float?
```

Kedua schema (`schema.prisma` + `schema.sqlite.prisma`) sinkron.

### 3.2 Komponen & Modul Baru

```
src/components/maps/LocationPickerMap.tsx    ← Leaflet pilih titik (client-only, dynamic import ssr:false)
src/components/maps/LocationPreviewMap.tsx   ← mini-map read-only (admin)
src/lib/geo/haversine.ts                      ← jarak garis lurus (fallback)
src/lib/geo/osrm.ts                           ← estimateDrivingDistance (fetch OSRM) + fallback
src/lib/geo/postal-codes.ts                   ← tabel desa→kode pos Kebumen (subset)
src/components/vendor/VendorVerificationForm.tsx
src/app/api/upload/vendor-doc/route.ts        ← upload handler (validasi tipe/ukuran)
```

Interface:
```ts
// src/lib/geo/osrm.ts
export interface DistanceResult { km: number; minutes: number | null; source: "osrm" | "haversine"; }
export async function estimateDrivingDistance(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<DistanceResult>;

// src/lib/geo/haversine.ts
export function haversineKm(a: {lat:number;lng:number}, b:{lat:number;lng:number}): number;
```

### 3.3 Alur Verifikasi

```
Register OTP (VENDOR) → VendorProfile dibuat, verificationStatus=PENDING, isVerified=false, profileCompleted=false
   ↓ (tidak tampil di katalog, tidak bisa terima order)
/dashboard/vendor/profil → isi data + unggah KTP/foto + pilih titik peta → Simpan
   ↓
Tombol "Ajukan Verifikasi" → validasi server (semua wajib terisi) → profileCompleted=true, submittedAt=now
   ↓
/admin/verifikasi → admin lihat data + foto (zoom) + mini-map → Setujui (APPROVED) / Tolak (REJECTED + catatan)
   ↓
APPROVED → tampil katalog & bisa terima order. REJECTED → vendor perbaiki → ajukan lagi.
```

### 3.4 Peta & Jarak
- `LocationPickerMap`: peta OSM, klik → marker → callback `(lat, lng)`. Tombol "Lokasi saya" (geolocation). Di-load `dynamic(..., { ssr:false })` (Leaflet butuh window).
- `estimateDrivingDistance`: `GET https://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=false` → `routes[0].distance` (m), `duration` (s). Timeout 5s. Bila gagal → Haversine, `source:"haversine"`, `minutes:null`.
- Ditampilkan: **checkout/order client** — "± X km · ± Y menit berkendara" (atau "(perkiraan)" bila fallback).

### 3.5 Upload
- `POST /api/upload/vendor-doc` — terima FormData `file` + `kind` ("ktp"|"business"). Validasi tipe (jpg/png/webp) & ukuran (≤5MB). Simpan nama acak → `public/uploads/vendor/{userId}/{kind}-{random}.{ext}`. Return `{ url }`. Guard: sesi vendor.
- Simpan `url` ke `VendorProfile.ktpPhotoUrl`/`businessPhotoUrl` via form save.
- **Catatan risiko (didokumentasikan):** `public/uploads` berarti file bisa diakses via URL. Untuk fase pilot diterima; produksi → object storage privat + route ber-otorisasi.

### 3.6 Kode Pos
- `postal-codes.ts`: map `{ desa: ["kecamatan", "kodePos"] }` (subset desa Kebumen). Form: saat `desa` + `kecamatan` terisi → auto-fill `postalCode` (bila ada di map; jika tidak, biarkan manual).

### 3.7 Keamanan
- Simpan/filter katalog: query katalog vendor **hanya** `verificationStatus="APPROVED"` (cek & perbaiki jika ada yang belum filter).
- Server action "ajukan verifikasi": validasi kelengkapan wajib **di server** (bukan hanya UI).
- Admin approve/reject: capability `VERIFY_VENDOR` + `recordAdminAudit` (sudah ada — pakai lagi).

## 4. UI/UX

- **Form vendor**: kartu-kartu section (Info Usaha, Pemilik, Alamat+Peta, Rekening, Dokumen, Status). Progress + tombol "Ajukan Verifikasi". Badge status.
- **Admin verifikasi**: kartu vendor diperkaya (semua data, preview foto via modal, mini-map), tombol Setujui/Tolak.
- **Client profil**: tambah "Nama Pasangan" + alamat terstruktur + peta.
- **Order/checkout**: tampilkan estimasi jarak per vendor.
- Semua pakai komponen `components/dashboard/*` (Dash*) & token brand (Charcoal/Taupe/Champagne), ikon Lucide, tanpa emoji.

## 5. File yang Disentuh

| File | Aksi |
|---|---|
| `prisma/schema.prisma` + `schema.sqlite.prisma` | Tambah kolom; default verification PENDING/false |
| `src/lib/geo/{haversine,osrm,postal-codes}.ts` | **Baru** |
| `src/components/maps/{LocationPickerMap,LocationPreviewMap}.tsx` | **Baru** |
| `src/components/vendor/VendorVerificationForm.tsx` | **Baru** |
| `src/app/api/upload/vendor-doc/route.ts` | **Baru** |
| `src/server/actions/vendor-profile.ts` | Update save + ajukan verifikasi |
| `src/app/dashboard/vendor/profil/*` | Integrasi form verifikasi |
| `src/app/admin/verifikasi/*` | Preview dokumen + peta |
| `src/app/client/profil/*` + `src/server/actions/*` client | Alamat + peta |
| `src/app/checkout/page.tsx` (+ query vendor) | Estimasi jarak |
| `prisma/seed.ts` | Vendor demo → APPROVED (agar katalog demo tetap jalan) |
| `package.json` | Tambah `leaflet`, `react-leaflet` |
| `tests/*` | haversine, osrm (mock), validasi, postal-codes |

## 6. Testing

- Unit: `haversineKm` (nilai diketahui), `estimateDrivingDistance` (mock fetch sukses + fallback), `postal-codes` lookup, validasi kelengkapan (helper).
- Verifikasi: `npm run typecheck`, `npm test`, `npm run build`; manual alur vendor→admin; cek peta di 375px.
- Migrasi: buat migration + `migrate deploy` ke Neon sebelum deploy.

## 7. Risiko & Catatan

- **Leaflet SSR**: wajib `dynamic ssr:false`.
- **OSRM demo publik**: rate-limited; fallback Haversine (ditandai "perkiraan"). Produksi → self-host.
- **File di public**: risiko akses; dicatat, produksi → storage privat.
- **Default verification berubah** → seed demo vendor harus `APPROVED` agar katalog tidak kosong.
- **Jangan** ubah cara ledger; **jangan** sentuh alur payment.
- Dua schema Prisma sinkron.
