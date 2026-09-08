# HariKita - Web App (Kebumen Hyperlocal Event & Wedding Platform)

Platform terpadu untuk merangkai acara Pre-wedding, Lamaran (*Engagement*), dan Pernikahan Intim (*Wedding*) di wilayah **Kabupaten Kebumen, Jawa Tengah**.

## 🌟 Fitur Utama
1. **11 Kategori Jasa Terpadu:** Pre-wedding, Busana Pengantin & Fitting, MUA, Seserahan & Mahar, Dokumentasi Foto-Video, Dekorasi & Florist, Katering & Test Food, Cakes & Dessert, Souvenir, Undangan Digital & Cetak, serta Cute Illustrated Maps.
2. **Mesin Undangan Digital Dinamis (8 Arketipe & 65+ Presets):**
   * Diadaptasi dari referensi UndanganDigital.id & HelloGuest.id.
   * 8 Arketipe: *Animated Motion*, *Minimalist Typographic*, *Fullscreen Prewed*, *Botanical Floral*, *Syar'i Islamic*, *Traditional Cultural*, *Royal Luxury Foil & Wax Seal*, dan *Event Khusus*.
   * 14 Fitur Interaktif: Wax Seal 3D, Musik Floating Otomatis, Personalisasi Tamu (`?to=...`), Multi-Sesi (`?sesi=s1`), Countdown & Add to Calendar, Denah Kartun, Love Story Timeline, Galeri Lightbox, Buku Tamu RSVP Server Action, Amplop Digital QRIS, Kirim Kado, Live Stream, Proteksi Darkmode, & Barcode QR Meja Resepsionis.
3. **Interactive Mix-and-Match Builder:** Live price counter seketika saat mengganti vendor atau mengubah kuota tamu.
4. **Lazy Registration Checkout:** Pemesanan instan cukup dengan Nama & nomor WhatsApp.
5. **Sistem Rekening Bersama (Escrow):** Skema proteksi termin DP 30% dan Pelunasan 70%.
6. **Portal 3 Role Pengguna:**
   * Klien: Tracker invoice, digital contract signed, jadwal fitting busana & test food katering.
   * Vendor: Self-service CMS paket, kalender blackout date offline, dompet saldo payout.
   * Super Admin: Master multi-vendor calendar se-Kebumen, master 10-tahapan conversion funnel, invoice viewer, & resolution center.

---

## 🛠️ Tech Stack
* **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions, TypeScript)
* **Styling & UI:** [Tailwind CSS](https://tailwindcss.com/), [daisyUI](https://daisyui.com/), [Shadcn / Radix UI](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/)
* **Database & ORM:** [Prisma ORM](https://www.prisma.io/) + SQLite (`prisma/dev.db`, siap migrasi ke PostgreSQL)
* **Desain Palet:** *Cashmere Alabaster & Gilded Champagne* (`#FAF8F5`, `#C5A880`, `#4A2E35`, `#6B5E62`)

---

## 🚀 Memulai Proyek

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Konfigurasi Database & Seed
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 3. Menjalankan Server Development
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

---

## 📁 Struktur Direktori
```
HariKita - Web App/
├── prisma/
│   ├── schema.prisma          # Skema database relasional
│   └── seed.ts                # Seeder 11 kategori vendor lokal Kebumen
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout & font
│   │   ├── globals.css        # Design tokens & utilities
│   │   ├── page.tsx           # Landing page Kebumen
│   │   ├── builder/           # Interactive mix-and-match simulator
│   │   ├── undangan/[slug]/   # Dynamic public digital invitation
│   │   ├── client/            # Portal klien & pelacak jadwal
│   │   ├── vendor/            # Portal mitra vendor & blackout calendar
│   │   └── admin/             # Super Admin control center
│   ├── components/
│   │   ├── layout/            # Navbar, Drawer, Footer
│   │   ├── invitation/        # 14 komponen interaktif undangan
│   │   ├── templates/         # 8 arketipe visual undangan
│   │   └── ui/                # Reusable Radix & DaisyUI primitives
│   └── lib/
│       ├── prisma.ts          # Singleton Prisma Client
│       └── templates/         # Registry 65+ tema & konfigurasi preset
├── docs/superpowers/
│   ├── specs/                 # Dokumen spesifikasi arsitektur
│   └── plans/                 # Rencana eksekusi bertahap
├── AGENTS.md                  # Pedoman & tata kelola AI agent
└── README.md                  # Dokumentasi proyek
```
