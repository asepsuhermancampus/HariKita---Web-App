# 💍 HARIKITA (WEB APP) — STATUS PROYEK, ARSITEKTUR & PANDUAN HANDOVER

> **Dokumen Single Source of Truth (SSOT)**  
> *Gunakan dokumen ini untuk memulihkan seluruh konteks proyek saat membuka kembali IDE / sesi percakapan baru.*  
> **Terakhir Diperbarui:** 9 September 2026  
> **Direktori Proyek:** `HariKita - Web App` (Proyek Utama Aktif)  
> **Status Server Lokal:** Aktif di `http://localhost:3000` (Next.js 15.5)

---

## ⚡ 1. PROMPT RESUME CEPAT (Salin & Tempel saat Buka Sesi Baru)

Saat Anda membuka project ini kembali di IDE dan memulai chat baru dengan AI, salin salah satu prompt di bawah ini:

### 👉 Opsi A: Melanjutkan Pekerjaan Secara Umum (Paling Disarankan)
```text
Halo, tolong baca file PROJECT_STATUS.md di root HariKita - Web App. Berikan ringkasan singkat sudah sampai mana progres kita sebelumnya, apa saja yang kurang / backlog yang belum selesai, dan apa rekomendasi langkah berikutnya yang siap kita kerjakan.
```

### 👉 Opsi B: Melanjutkan Integrasi Akses Publik HP (Gratis)
```text
Baca file PROJECT_STATUS.md di HariKita - Web App. Kita lanjutkan rencana Opsi 1 (Cloudflare Quick Tunnel via untun) agar web Next.js 15 dan SQLite lokal kita bisa langsung diakses publik dan diuji coba dari HP saya secara gratis.
```

### 👉 Opsi C: Audit Status & Menjalankan Unit Test
```text
Baca file PROJECT_STATUS.md. Tolong periksa apakah dev server HariKita - Web App sudah aktif di port 3000 dan jalankan automated tests untuk memverifikasi 64 template undangan dan komponen utama.
```

---

## 🏗️ 2. RINGKASAN EKSEKUTIF & TECH STACK

HariKita adalah platform digital *event lamaran & pernikahan intimate hyperlocal* yang menyelaraskan restu keluarga (Boomer), transparansi rincian harga (Milenial), dan estetika visual-first kekinian (Gen Z).

* **Framework:** Next.js 15.5 (App Router, Server Components & Server Actions)
* **UI Engine & Styling:** React 19, Tailwind CSS v4, daisyUI 4/5 semantic components, Lucide React icons
* **Database & ORM:** Prisma Client 6.1.0 dengan database SQLite lokal (`prisma/dev.db`)
* **Arsitektur Port:**
  * `HariKita - Web App` (Aktif): Port `3000`
  * `HariKita - Web` (Lama/Arsip): Port `5173` (**Non-aktif**, sudah di-push bersih ke remote branch)

---

## ✅ 3. STATUS CAPAIAN ("SUDAH SAMPAI MANA?")

### A. 11 Kategori Layanan Modular Marketplace
1. **Pre-wedding:** Paket Studio all-in, Outdoor alam, Casual street style.
2. **Busana & Fitting:** Sewa ready-to-wear, sewa perdana, add-on busana ortu, tracker fitting.
3. **MUA & Hair/Hijab:** Soft glam, Korean glow, adat modern.
4. **Kotak Seserahan & Mahar:** Sewa/hias baki akrilik (5, 7, 9 kotak) & frame mahar estetik.
5. **Dokumentasi Foto-Video:** Liputan lip sync Reels 60s, flash candid, box flashdisk, auto-watermark.
6. **Dekorasi & Florist:** Backdrop lamaran 3x2.5m, pelaminan intimate, buket bunga segar.
7. **Katering & Food Stalls:** Kalkulator Pax dinamis & opsi pemesanan sample box test food.
8. **Kue Acara & Dessert Corner:** Tiered cake, mini sweet table corner, cake taster box.
9. **Souvenir Eksklusif:** Scented candles, pouch linen monogram, kalkulator bertingkat (50, 100, 200 pcs).
10. **Undangan & Amplop Hybrid:** Digital web invitation, cetak fisik wax seal, atau bundel keduanya.
11. **Cute Illustrated Maps:** Generator peta kartun estetik terintegrasi QR code Google Maps.

### B. 3 Multi-Role Dashboards & Builder Interaktif
* **Portal Klien (`/client`):** Katalog vendor lokal, filter kategori, invoice tracker, jadwal fitting, unduh kontrak digital.
* **Portal Vendor Mitra (`/vendor`):** CMS portofolio mandiri, manajemen blackout dates (kunci tanggal offline), dompet payout saldo.
* **Portal Super Admin (`/admin`):** Master calendar multi-vendor, funnel 10 konversi, resolution center sengketa, leaderboard vendor populer.
* **Interactive Mix-and-Match Builder (`/builder`):** Live price simulator, deteksi ketersediaan multi-vendor, lazy registration (booking tanpa wajib login diawal).

### C. 64 Template Undangan Digital Terindividuasi Penuh
Seluruh 64 template undangan memiliki metadata mandiri, palet warna tematik, ornamen SVG elegan, backsound audio, serta menggunakan salah satu dari **8 Dedicated Layout Engines**:
1. **Adat Nusantara:** *Surya Majapahit, Parang Kencana, Songket Minang, Sirih Pinang, Batak Ulos, Dayak Mandau, Toraja Pa'ssura, Asmat Papua*.
2. **Elegant Minimalist:** *Ivory Silk, Champagne Luxe, Slate Monochrome, Alabaster Pure, Cashmere Rose, Pearl Essence, Linen Grace, Obsidian Chic*.
3. **Botanical Garden:** *Eucalyptus Mist, Olive Grove, Sakura Blossom, Wildflower Meadow, Fern Canopy, Terracotta Bloom, Lavender Breeze, Magnolia Petals*.
4. **Royal Velvet Luxury:** *Emerald Opulence, Midnight Sapphire, Ruby Grandeur, Gilded Amethyst, Velvet Noir, Imperial Gold, Royale Burgundy, Crown Jewel*.
5. **Muslim Syar'i:** *Ar-Rahman, Firdaus Green, Nur Medina, Qalbi Gold, Barakah White, Marwah Blossom, Safa Elegance, Tasnim Blue*.
6. **Chinese Oriental Modern:** *Double Happiness Red, Chinoiserie Porcelain, Peony Jade, Crimson Lantern, Golden Dynasty, Lotus Zen, Dragon Phoenix, Imperial Silk*.
7. **Retro Vintage Rustic:** *Boho Pampas, Vintage Macrame, Kraft Rustic, Sepia Memories, Victorian Rose, Polaroid Nostalgia, Heritage Wood, Farmhouse Warmth*.
8. **Gen-Z Playful Y2K:** *Cyber Pastel, Neon Cyber, Retro Pop Art, Matcha Latte, Y2K Bubblegum, Cloud Nine, Sunset Gradient, Holographic Dream*.

### D. Fitur-Fitur Khusus Undangan
* **Cover Depan (Gate):** Wax seal badge, nama tamu kustom (`?to=NamaTamu`), tombol "Buka Undangan" dengan animasi smooth unroll.
* **Interactive Story Timeline:** Perjalanan cinta dari perkenalan hingga pelaminan.
* **Gift Registry & QRIS:** Nomor rekening bank dengan fitur 1-klik salin, alamat kirim kado, dan modal QRIS dinamis.
* **Live RSVP & Wishes:** Form kehadiran langsung terhubung ke database SQLite via Prisma API.
* **Smooth Auto-Closing Effect:** Efek penutup anggun saat tamu mencapai bagian paling bawah halaman undangan.

### E. Progressive Web App (PWA) & Mobile Polish (BARU SELESAI)
* **Web App Manifest (`src/app/manifest.ts` & `public/manifest.json`):** Konfigurasi App Router standalone mode, palet Cashmere Alabaster (`#FAF8F5`) & Gilded Champagne (`#C5A880`), serta 3 shortcut langsung (Builder, Undangan, Klien).
* **Aset Ikon PWA Komprehensif:** Ikon 192x192, 512x512, maskable squircle (Android 13+), Apple touch icon iOS, dan favicon.ico.
* **Vanilla Service Worker (`public/sw.js`):** Caching aset statis (stale-while-revalidate), navigasi network-first aman tanpa konflik Next.js 15 / React 19.
* **Add to Home Screen (A2HS) Component (`InstallPrompt.tsx`):** Banner floating elegan di layar sentuh mobile, deteksi instalasi Android Chrome via `beforeinstallprompt`, modal panduan visual khusus Safari iOS, dan batas cooldown dismiss 7 hari.
* **Automated Unit Tests:** 18/18 test passing (`tests/*.test.ts`).

---

## ⏳ 4. ITEM YANG KURANG / BACKLOG ("KURANG APA SAJA?")

Berikut adalah daftar prioritas pengembangan berikutnya:

1. **Akses Publik Gratis untuk Testing HP (Prioritas Terdekat):**
   * Menyiapkan script npm (misal `npm run tunnel` menggunakan Cloudflare Quick Tunnel via `untun`) agar web lokal port 3000 dapat langsung dibuka di HP melalui HTTPS publik lengkap dengan QR Code terminal.
2. **Migrasi Database untuk Cloud Deployment (Opsional jika ingin online 24/7):**
   * Saat ini SQLite bersifat lokal (`dev.db`). Jika ingin dideploy ke Vercel/Netlify permanen, perlu integrasi ke database cloud serverless gratis seperti **Turso LibSQL** atau **Supabase**.
3. **Live Payment Gateway:**
   * Menggantikan simulator escrow DP 30% dan Pelunasan 70% dengan webhook Midtrans / Xendit Sandbox.
4. **WhatsApp Automation Gateway:**
   * Integrasi notifikasi booking otomatis ke nomor WhatsApp vendor dan pasangan pengantin saat status pesanan terkonfirmasi.

---

## 🔧 5. CATATAN TEKNIS & PERBAIKAN PENTING

> [!IMPORTANT]
> **Aturan Dynamic Rendering pada Halaman Undangan (`/undangan/[slug]`):**
> File `src/app/undangan/[slug]/page.tsx` wajib menyertakan `export const dynamic = 'force-dynamic';`. Hal ini mencegah Next.js mencoba melakukan static prerender saat build yang dapat menyebabkan error `searchParams` atau kegagalan query database SQLite.

> [!NOTE]
> **Penanganan Data Demo vs Data Database:**
> Halaman `/undangan/[slug]` telah dilengkapi fallback cerdas: Jika slug dicari tidak ada di database, sistem otomatis mencocokkan dengan data katalog template 64 tema bawaan (`ALL_INVITATION_TEMPLATES`). Sehingga `/undangan/demo?theme=nama-tema` atau `/undangan/nama-tema` selalu bisa dibuka kapan saja.

---

## 🗺️ 6. SITEMAP & RUTE PENGUJIAN UTAMA

| Halaman | Rute URL | Deskripsi |
| :--- | :--- | :--- |
| **Landing Page** | `http://localhost:3000/` | Beranda utama, hero editorial, moodboard filter, ribbon kategori |
| **Mix & Match Builder** | `http://localhost:3000/builder` | Simulator racik paket pernikahan dan hitung total estimasi harga |
| **Portal Klien** | `http://localhost:3000/client` | Dashboard calon pengantin, riwayat invoice, fitting tracker |
| **Portal Vendor** | `http://localhost:3000/vendor` | Dashboard mitra, kalender blackout date, kelola harga paket |
| **Super Admin** | `http://localhost:3000/admin` | Master multi-vendor calendar, 10-step conversion funnel, resolution |
| **Demo Undangan Digital** | `http://localhost:3000/undangan/demo?theme=ivory-silk` | Pengujian 64 template (ganti query `theme` sesuai ID template) |
| **Manifest Web App** | `http://localhost:3000/manifest.webmanifest` | Verifikasi metadata PWA JSON |

---

## 🧪 7. PERINTAH VERIFIKASI & PERAWATAN

* **Menjalankan Dev Server:**
  ```powershell
  npm run dev
  ```
* **Menjalankan Automated Tests (18 Tests):**
  ```powershell
  npx tsx --test tests/*.test.ts
  ```
* **Mengecek Schema Database:**
  ```powershell
  npx prisma studio
  ```
* **Sinkronisasi Database SQLite:**
  ```powershell
  npx prisma db push
  ```

