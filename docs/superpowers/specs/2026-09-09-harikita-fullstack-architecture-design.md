# HariKita Fullstack Architecture & Digital Invitation Ecosystem Design

## 1. Executive Summary & Vision
* **Product Name:** HariKita
* **Tagline:** *"Rangkai Hari Bahagiamu, Menyelaraskan Restu & Impian."*
* **Architecture:** Fullstack Next.js 15 (App Router) + TypeScript + Tailwind CSS + DaisyUI + Shadcn/Radix UI + Prisma ORM (SQLite / PostgreSQL ready).
* **Hyperlocal Pilot:** Kebumen (fokus kurasi vendor lokal terpercaya, kemudahan sesi fisik fitting busana & test food katering).
* **Demographic Privacy Rule:** Seluruh optimasi lintas preferensi keluarga (kehormatan adat/katering, kepraktisan kontrak/SLA, estetika visual & undangan web) diintegrasikan secara elegan dan implisit tanpa melabeli istilah generasi ("Boomer", "Milenial", "Gen Z") di antarmuka publik.

---

## 2. Directory & Superpowers Governance
Proyek baru dibangun bersih di direktori `HariKita - Web App`:
* **AI Governance:** `AGENTS.md` memuat batas ruang lingkup non-negotiable (*strict in-scope* 11 kategori layanan, anti scope creep, SLA escrow 30%/70%).
* **Superpowers Integration:** Terhubung dengan metodologi spesifikasi bertahap (`docs/superpowers/specs/` dan `docs/superpowers/plans/`), skill governance, dan sistem commit atomik.
* **Documentation:** `README.md` komprehensif memuat panduan instalasi, struktur folder, skema database, dan alur kerja pengembang.

---

## 3. Database Schema Architecture (Prisma ORM)

Skema database SQLite lokal (`dev.db`) dirancang fleksibel untuk langsung bermigrasi ke PostgreSQL untuk fase produksi:

### Entitas Inti
1. **User:** Role `CLIENT`, `VENDOR`, `ADMIN`. Autentikasi ramah pengguna (*lazy registration* via nomor WhatsApp & Nama).
2. **VendorProfile:** Toko/studio vendor, rating, deskripsi, alamat lokal Kebumen, link portofolio Instagram/TikTok, rekening bank penerima payout.
3. **BlackoutDate:** Kalender pemblokiran tanggal offline vendor agar tidak bentrok dengan pesanan HariKita.
4. **ServicePackage:** Katalog 11 kategori jasa (Pre-wedding, Busana, MUA, Seserahan, Dokumentasi, Dekorasi, Katering, Cakes & Dessert, Souvenir, Undangan Digital/Fisik, Cartoon Map) dengan harga dasar, harga per pax/baki/pcs, dan SLA kerja.
5. **Order & OrderItem:** Pesanan mix-and-match gabungan multi-vendor dengan kode booking unik, status pelacakan, dan total nilai transaksi.
6. **EscrowTransaction:** Rekening bersama proteksi pembayaran dengan termin DP 30% (kunci tanggal, rilis H-3) dan Pelunasan 70% (rilis H+2 setelah konfirmasi sukses).
7. **DigitalContract:** Kontrak kerja digital berkekuatan hukum dengan SLA tertulis dan tanda tangan digital instan.
8. **PhysicalSession:** Pelacak jadwal sesi fisik (1st Fitting, Final Fitting Busana, dan Sesi Test Food Katering).
9. **EventRundown:** Susunan jadwal hari H acara yang otomatis tersinkronisasi ke dashboard vendor terkait.
10. **DigitalInvitation:** Konfigurasi template undangan digital terpilih (65+ varian via 8 arketipe induk), profil kedua mempelai, jadwal acara multi-sesi, galeri, bank amplop digital, link siaran langsung, dan filter Instagram.
11. **RsvpWish:** Catatan konfirmasi kehadiran tamu (hadir/tidak hadir/ragu, jumlah pax, kode sesi) beserta ucapan doa restu real-time.
12. **AnalyticsTelemetry:** Pencatatan peristiwa konversi 10 tahapan funnel, views vendor, dan klik pricelist.

---

## 4. Digital Invitation Engine: 8 Arketipe & 65+ Varian Tema

Sistem mengadopsi **Data-Driven Dynamic Template Engine** yang memetakan 65+ template dari referensi (UndanganDigital.id & HelloGuest.id) ke dalam **8 Arketipe Mesin Induk**:

```
                                  ┌──────────────────────────────┐
                                  │   Registry & Preset System   │
                                  │   (65+ Theme Configurations) │
                                  └──────────────┬───────────────┘
                                                 │
          ┌─────────────────┬────────────────────┼───────────────────┬─────────────────┐
          │                 │                    │                   │                 │
┌─────────▼────────┐┌───────▼────────┐┌──────────▼─────────┐┌────────▼────────┐┌───────▼────────┐
│ 1. Animated      ││ 2. Minimalist  ││ 3. Fullscreen Prewed││ 4. Romantic     ││ 5. Syar'i       │
│ Motion & Cartoon ││ Typographic    ││ Photo Couple       ││ Botanical Floral││ Islamic Heritage│
└──────────────────┘└────────────────┘└─────────────────────┘└─────────────────┘└────────────────┘
          │                 │                    │
┌─────────▼────────┐┌───────▼────────┐┌──────────▼─────────┐
│ 6. Cultural      ││ 7. Royal Foil  ││ 8. Event Khusus &  │
│ Traditional Adat ││ & Wax Seal 3D  ││ Acara Keluarga     │
└──────────────────┘└────────────────┘└─────────────────────┘
```

### 14 Fitur Interaktif Terpadu:
1. **Cover Envelope & Wax Seal Unfold:** Animasi pembuka amplop lilin segel 3D yang mulus.
2. **Floating Audio Controller:** Pemutar musik latar vinil berputar otomatis saat tombol *"Buka Undangan"* diklik (mematuhi aturan autoplay iOS/Android), dilengkapi 3 track instrumental royalty-free + input MP3 custom.
3. **Personalisasi Nama Tamu:** Parsing URL query `?to=Bapak+Joko` secara instan tanpa delay render.
4. **Multi-Sesi Otomatis:** Filter sesi acara via `?sesi=s1` (Akad), `s2` (Resepsi Siang), atau `s3` (Resepsi Malam).
5. **Countdown Timer & Add to Calendar:** Hitung mundur live + tombol satu-klik sinkronisasi ke Google Calendar & iCal.
6. **Denah Kartun & Navigasi Maps:** Ilustrasi peta estetik + tombol arah langsung ke Google Maps & Waze.
7. **Love Story Timeline:** Komponen garis waktu kisah cinta interaktif menggunakan semantic DaisyUI `timeline`.
8. **Galeri Sinematik Lightbox:** Slider foto sentuh (Shadcn/UI Embla Carousel) + pop-up modal fullscreen + video embed prewed.
9. **Buku Tamu & Form RSVP:** Pengiriman kehadiran & ucapan instan via Next.js Server Actions ke tabel `RsvpWish`.
10. **Amplop Digital & QRIS:** Kartu rekening bank dengan tombol salin instan (disertai feedback toast sonner) dan QRIS SVG viewer.
11. **Kirim Kado Fisik:** Detail alamat pengiriman kurir lengkap dengan nomor telepon penerima dan tombol salin alamat.
12. **Live Streaming & IG Filter:** Kartu siaran virtual (Instagram Live, YouTube, Zoom) + tautan direct ke filter foto Instagram.
13. **Proteksi Dark Mode:** Mengunci palet warna agar teks dan ornamen tidak terbalik oleh fitur forced dark mode browser ponsel.
14. **QR Code Check-in Resepsionis:** Barcode/QR unik per undangan untuk di-scan oleh penerima tamu pada pintu resepsi.

---

## 5. Rencana Tahapan Eksekusi (5-Phase Roadmap)

### Fase 1: Inisialisasi Fondasi Proyek & Tata Kelola AI
* Inisialisasi Next.js 15 App Router + TypeScript di direktori `HariKita - Web App`.
* Konfigurasi Tailwind CSS, DaisyUI, Shadcn/Radix UI, Lucide React.
* Konfigurasi Prisma ORM dengan SQLite `dev.db`, skema lengkap, dan script migrasi.
* Instalasi struktur `superpowers`, penyusunan `AGENTS.md`, dan `README.md`.

### Fase 2: Design System & Shared Fullstack Shell
* Menerapkan palet warna resmi *Cashmere Alabaster & Gilded Champagne* (`#FAF8F5`, `#C5A880`, `#4A2E35`, `#6B5E62`).
* Komponen Logo Cameo HariKita beresolusi tinggi.
* Shell navigasi publik (Navbar desktop, Mobile bottom bar / drawer, Footer informatif).
* Database Seed: 11 Kategori Vendor Lokal Kebumen dengan data portofolio, SLA, dan pricelist realistis.

### Fase 3: Engine Undangan Digital Lengkap (65+ Presets via 8 Arketipe)
* Pembuatan `registry.ts` yang memetakan 65+ nama tema dari referensi ke 8 Arketipe Induk.
* Router dinamis `/undangan/[slug]` dan `/undangan/[slug]/preview`.
* Seluruh 14 komponen interaktif (Wax Seal, Music Player, Multi-Sesi, Countdown, Maps, Love Story, Lightbox, RSVP Server Action, Amplop Digital QRIS, dsb.).

### Fase 4: Portal Pengguna Klien & Mix-and-Match Builder Interaktif
* Landing page utama HariKita dengan showcase 11 kategori layanan terpadu Kebumen.
* Live Simulator Mix-and-Match: Live price counter saat ganti vendor, ubah pax katering, atau pilih paket undangan.
* Lazy Registration Checkout: Pengisian Nama & WhatsApp saat booking tanggal tanpa hambatan form registrasi yang rumit.
* Portal Klien: Pelacak invoice, digital contract signed, jadwal fitting & test food tracker.

### Fase 5: Dashboard Vendor & Super Admin Control Center
* Portal Vendor: CMS edit paket, kalender blackout date mandiri, penarikan saldo dompet (*payout*), dan matriks performa.
* Super Admin: Master 10-Tahapan Funnel Analytics, Master Multi-Vendor Calendar (peta jadwal se-Kebumen), Resolution Center, dan Escrow Payment Management.
