# Panduan Testing HariKita (Lokal)

Panduan langkah demi langkah untuk menguji semua fitur terbaru di lokal.

## 0. Persiapan (sekali)

```powershell
# Di terminal project
Remove-Item -Recurse -Force .next   # bersihkan cache (penting bila pernah error)
npm run dev
```

Tunggu sampai muncul `✓ Ready` / `Local: http://localhost:3000`.

> ⚠️ JANGAN jalankan `npm run build` bersamaan dengan `npm run dev` (folder `.next` sama → bisa korup).

**Data sudah ter-seed ke Neon** (DB aktif). Semua akun PIN: `123456`.

## Akun Demo

| Peran | No. HP | Login di |
|---|---|---|
| Super Admin | `081234567890` | `/auth/login/admin` |
| Vendor PENDING (uji verifikasi) | `081300000099` | `/auth/login` |
| Vendor APPROVED | `081300000001` | `/auth/login` |
| Client Uji (punya order demo + peta) | `081900000099` | `/auth/login` |
| Client (Bima & Citra) | `081987654321` | `/auth/login` |
| Brand Ambassador | `081200000001` | `/auth/login/ba` |

---

## 1. Dashboard SaaS (semua role)

Login tiap role → pastikan **sidebar kiri (Charcoal)** muncul dengan menu:
- **Admin**: Dashboard, Verifikasi Vendor, Kliring & Settlement, Dispute, Brand Ambassador, Kalender, Audit Konten, Pengaturan Platform
- **Vendor**: Ringkasan, Kotak Masuk Order, Kalender Blackout, Dompet, Paket, Portofolio, Data Diri & Profil
- **BA**: Ringkasan, Vendor Rekrutan, Komisi, Dompet
- **Client**: Ringkasan, Pesanan & Escrow, Jadwal, Undangan, Profil

Uji **mobile**: perkecil jendela < 1024px → tombol **☰** kiri-atas → drawer sidebar.

---

## 2. OTP Email

Email penerima: `asepsuherman.workmail@gmail.com` (satu-satunya yang aktif di mode testing Resend).

### a) Verifikasi email Super Admin (gembok edit)
1. Login admin `081234567890` → `/admin/pengaturan`
2. Klik **Kirim Kode OTP** → cek inbox → masukkan kode → **Verifikasi**
3. Mode **Edit** terbuka → ubah angka → **Simpan** → form terkunci lagi

### b) Register Client
1. `/auth/register` → isi nama, HP baru, email `asepsuherman.workmail@gmail.com`
2. Kirim OTP → cek inbox → masukkan → selesai

### c) Register Vendor
1. `/auth/register-vendor` → sama (+ kolom referral opsional)

> Kode OTP **acak** (bukan 123456). `123456` hanya dari script uji.

---

## 3. Verifikasi Vendor (alur utama)

### a) Vendor mengajukan
1. Login `081300000099` / `123456` → `/dashboard/vendor/profil`
2. Scroll ke **"Data Usaha & Verifikasi Mitra"** (di atas)
3. Isi: Nama Usaha, Kategori, Nama Pemilik, No WA, **No KTP**
4. **Unggah Foto KTP** (JPG/PNG/WEBP ≤5MB)
5. Alamat: RT, RW, Dusun, Desa, Kecamatan → **Kode Pos auto terisi**
6. **Titik Lokasi**: klik peta untuk tandai lokasi usaha
7. Rekening: pilih Bank/E-Wallet → isi detail
8. **Unggah Foto Usaha**
9. Klik **Simpan Draf** → lalu **Ajukan Verifikasi**
10. Status berubah jadi **Menunggu Verifikasi** (kuning)

### b) Admin menyetujui
1. Login `081234567890` → `/admin/verifikasi`
2. Cari vendor PENDING → lihat data, **klik foto untuk zoom**, lihat **mini-map**
3. Klik **Setujui & Terbitkan** (atau **Tolak** + catatan)
4. Vendor jadi APPROVED

---

## 4. Peta & Alamat Client

1. Login `081900000099` → `/client/profil`
2. Lihat bagian **"Alamat Lengkap & Titik Lokasi Acara"**
3. Isi alamat + klik peta → Simpan
4. Nama pasangan juga bisa diisi

## 5. Estimasi Jarak (OSRM)

1. Login `081900000099` → `/client/pesanan`
2. Order `HK-DEMO-0001` → lihat badge **"± X km · ± Y menit"** per vendor
   (rute berkendara nyata via OSRM, bukan garis lurus)
3. Kalau koordinat tidak lengkap → badge tidak muncul (normal)

---

## 6. Fitur lain untuk dicek

| Fitur | Cara |
|---|---|
| Kliring & Escrow | admin `/admin/escrow` |
| Dispute | admin `/admin/dispute` |
| Audit Konten | admin `/admin/audit-konten` |
| Kalender | admin `/admin/kalender` |
| BA komisi & dompet | BA `/dashboard/ba/komisi`, `/dompet` |
| Vendor paket/portofolio/kalender/inbox/dompet | vendor sidebar |
| Vendor baca rincian fee | vendor `/dashboard/vendor/paket` → dropdown komisi |

---

## Kalau Error

**Error "Cannot find module './xxxx.js'"** atau halaman error aneh:
```powershell
# Hentikan dev (Ctrl+C), lalu:
Remove-Item -Recurse -Force .next
npm run dev
```

**Lihat pesan error asli**: buka terminal tempat `npm run dev` jalan — stack trace lengkap ada di sana (browser hanya menampilkan digest).

## Reset Data Uji

Kalau ingin vendor PENDING kembali:
```powershell
# via prisma studio atau minta agent reset
npm run db:studio
```
Atau jalankan ulang seed (menghapus semua data):
```powershell
npm run db:seed
```
