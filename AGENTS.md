# AI AGENT GUARDRAILS & SCOPE GOVERNANCE
## Proyek: "HariKita" (Platform Event Lamaran & Pernikahan Hyperlocal Kebumen)

Dokumen ini adalah **pedoman wajib (non-negotiable rules)** bagi setiap AI Agent yang bekerja pada repositori proyek **HariKita - Web App**. Setiap agen wajib mematuhi batasan ruang lingkup (*scope*), aturan desain teknis, dan metodologi pengembangan berikut.

---

## 1. Identitas & Misi Produk
* **Nama Produk:** HariKita
* **Tagline:** *"Rangkai Hari Bahagiamu, Menyelaraskan Restu & Impian."*
* **Fokus Layanan:** Acara Pre-wedding, Lamaran (*Engagement*), dan Pernikahan Intim (*Wedding*).
* **Fokus Geografis:** **Hyperlocal Pilot: Kabupaten Kebumen, Jawa Tengah**. Memaksimalkan kurasi vendor lokal Kebumen terpercaya, kemudahan sesi fisik (fitting busana & test food), dan kedekatan emosional antar keluarga.
* **ATURAN PRIVASI DEMOGRAFI (WAJIB):**
  * **JANGAN PERNAH** menampilkan label generasi seperti *"Boomer"*, *"Milenial"*, *"Gen Z"*, atau *"3 Generasi"* di antarmuka publik website.
  * Karakteristik lintas preferensi (kehormatan adat/katering, transparansi kontrak kerja/SLA, proteksi rekening bersama, dan visualisasi estetik modern) wajib diintegrasikan secara implisit, elegan, dan natural tanpa melabeli pengguna.

---

## 2. STRICT IN-SCOPE (Wajib Dibangun & Dijaga)

Setiap fitur yang dikembangkan HANYA berputar di sekitar 5 pilar utama berikut:

### Pilar 1: 11 Kategori Layanan Terpadu (Modular Marketplace Kebumen)
1. **Pre-wedding:** Studio all-in, outdoor alam pantai/bukit Kebumen (Menganti, Menguneng, dll), casual street style.
2. **Busana Pengantin & Fitting:** Sewa jadi (*ready-to-wear*), sewa perdana, kebaya/beskap adat, add-on busana orang tua, terintegrasi pelacak jadwal 1st & final fitting.
3. **Makeup Artist (MUA & Hair/Hijab):** Soft glam, korean glow, adat Jawa/Sunda modern, hijab styling syar'i.
4. **Kotak Seserahan, Hantaran & Mahar Estetik:** Sewa & hias baki akrilik/kaca (kalkulator per-kotak 5, 7, 9 baki) & pigura mahar custom.
5. **Dokumentasi Foto-Video Hari H:** Liputan acara, cinematic teaser Reels/TikTok, box flashdisk eksklusif.
6. **Dekorasi & Florist:** Backdrop lamaran 3x2.5m, pelaminan intimate adat/modern, buket bunga segar.
7. **Katering & Food Stalls:** Kalkulator Pax dinamis (harga menyesuaikan jumlah tamu) & opsi pesan *Sample Box Test Food*.
8. **Kue Acara & Dessert Corner (Cakes & Dessert):** Tiered engagement/wedding cake, mini dessert table/sweet corner, dan pemesanan *Cake Taster Box*.
9. **Souvenir & Wedding Favors Eksklusif:** Scented candles, pouch linen custom inisial, kerajinan tangan lokal estetik, lengkap dengan kalkulator jumlah pesanan (50, 100, 200 pcs).
10. **Undangan Digital & Amplop Hybrid:**
    * Digital Invitation (Website interaktif dengan 65+ presets via 8 arketipe induk, musik floating, multi-sesi URL, RSVP server action, amplop digital QRIS).
    * Undangan Cetak Hardcover + Wax Seal, atau Bundel Keduanya.
11. **Cute Illustrated Maps:** Generator denah lokasi kartun lucu terintegrasi QR Code navigasi Google Maps & Waze.

### Pilar 2: Alur Pengalaman Pengguna (UX)
* **Lazy Registration (Frictionless):** Pengunjung bebas jelajah portofolio, cek harga, dan meracik simulator TANPA akun. Akun singkat (nama & WhatsApp) HANYA dibuat saat klik *"Ajukan Pesanan & Booking Tanggal"*.
* **Interactive Mix-and-Match Builder:** Live price counter seketika saat ganti vendor, tambah baki seserahan, atau ubah pax katering.
* **Multi-Vendor Availability Matrix:** Deteksi ketersediaan seluruh vendor terpilih di tanggal yang sama di Kebumen.
* **Event Rundown Generator Otomatis:** Susunan jadwal hari H yang sinkron ke dashboard vendor terpilih.

### Pilar 3: Arsitektur 3 Role Pengguna
* **Klien:** Katalog lokal Kebumen, mix-and-match cart, invoice center, kontrak digital signed, jadwal fitting tracker, chat bantuan WhatsApp.
* **Mitra Vendor:** Self-service CMS portofolio, edit harga paket mandiri, **Kalender Blackout Dates** (kunci tanggal offline), dompet saldo payout.
* **Super Admin:** Master Multi-Vendor Calendar (peta jadwal se-Kebumen), Master Funnel 10 Tahapan Konversi, Pricing & Commission Engine, Resolution Center.

### Pilar 4: Sistem Invoicing & Rekening Bersama (Escrow)
* **Termin Pembayaran:** Invoice DP 30% (mengunci tanggal) dan Invoice Pelunasan 70% pada H-7 acara.
* **Mekanisme Escrow:** 30% hak vendor cair H-3 acara (operasional), 70% cair H+2 pasca-acara setelah konfirmasi sukses klien.

### Pilar 5: Mesin Undangan Digital (Digital Invitation Engine)
* **8 Arketipe Mesin Induk:** 1. Animated Motion, 2. Minimalist Typographic, 3. Fullscreen Prewed Photo, 4. Romantic Botanical Floral, 5. Syar'i & Islamic Heritage, 6. Traditional Cultural Adat, 7. Royal Foil & Wax Seal 3D, 8. Event Khusus & Acara Keluarga.
* **14 Fitur Interaktif Terpadu:** Wax Seal Opening, Floating Music Player, Personalisasi Tamu (`?to=...`), Multi-Sesi (`?sesi=s1`), Countdown & Add to Calendar, Maps & Cartoon Map, Love Story Timeline, Photo Lightbox, RSVP Server Actions, Amplop Digital QRIS, Kirim Kado, Live Stream & IG Filter, Darkmode Protection, dan Reception QR Check-in.

---

## 3. STRICT OUT-OF-SCOPE (Dilarang Dikerjakan / Anti Scope Creep)

Agen AI **DILARANG KERAS** menambahkan hal-hal berikut tanpa persetujuan eksplisit pengguna:
1. ❌ **E-commerce Ritel Umum:** Menjual baju eceran non-event. HariKita adalah platform jasa acara, bukan e-commerce pakaian umum.
2. ❌ **Ekspansi Multi-Kota Nasional Skala Penuh:** Jangan membuat dropdown ratusan kota di Indonesia saat ini. Fokus strictly pada **Kebumen**.
3. ❌ **Fitur Virtual Reality (VR) / 3D Venue 360 yang Berat:** Menghambat performa web dan tidak esensial untuk tahap MVP.
4. ❌ **Sistem Penggajian (Payroll) Karyawan Vendor:** Platform hanya mengurus dompet penarikan dana (*payout*) vendor, bukan manajemen gaji internal kru vendor.
5. ❌ **Integrasi Akun Bank / Payment Gateway Live Production Sebelum Uji Coba Beres:** Selalu gunakan simulasi payment/escrow yang interaktif dan andal terlebih dahulu.

---

## 4. Batasan Teknologi & Aturan Desain (*Engineering Guardrails*)

1. **Tech Stack Resmi:**
   * **Framework:** Next.js 15 (App Router) + React 18/19 + TypeScript.
   * **Styling:** Tailwind CSS + DaisyUI + Shadcn/Radix UI primitives + Lucide React.
   * **Database & ORM:** Prisma ORM + SQLite (`prisma/dev.db`, siap migrasi ke PostgreSQL).
   * **State & Data:** Next.js Server Actions & React Hooks.
2. **Palet Warna Resmi (*Cashmere Alabaster & Gilded Champagne*):**
   * Background Canvas: `#FAF8F5`
   * Gilded Gold / Accent: `#C5A880`
   * Deep Plum Charcoal / Text: `#4A2E35`
   * Muted Plum: `#6B5E62`
   * Champagne Surface: `#F3EDE6`
3. **Desain Mobile-First & Responsif 100%:**
   * Tampil sempurna tanpa *horizontal overflow* di ponsel (`375px`), tablet (`768px`), dan laptop (`>1024px`).
   * Tombol sentuh minimal 44px (ramah jempol keluarga).
