# Spesifikasi Desain: Dual-Hub Architecture untuk HariKita Design System Showcase
**Basis Referensi:** `docs/superpowers/specs/2026-09-12-wedding-invitation-design-system.md`  
**Target Route:** `http://localhost:3000/design-system-showcase`  
**Status:** In Review (Brainstorming Validated)  
**Prinsip Utama:** *Non-Destructive Sandbox Isolation & Bespoke Editorial Experience*

---

## 1. Latar Belakang & Tujuan

HariKita memiliki dua ranah bahasa visual yang kaya:
1. **Core Brand & App Foundation:** Identitas visual platform umum, palet 5 warna primer, tipografi editorial luxury (*Cormorant Garamond & Manrope*), komponen UI platform, dan simulator aplikasi mobile hyperlocal Kebumen.
2. **Wedding Invitation Design System:** Sistem desain khusus konten undangan digital yang menaungi 8 arketipe induk, 243 aset vektor *fine-line*, serta modul-modul komponen interaktif (8 varian galeri, 4 geometri kartu mempelai, generator QRIS dinamis, dan buku tamu dengan efek *depth-of-field*).

Tujuan spesifikasi ini adalah merombak halaman `http://localhost:3000/design-system-showcase` menjadi **Dual-Hub Showcase**:
* Memisahkan kedua domain tersebut secara rapi melalui sistem navigasi tab (*Dual-Hub Tabs*).
* Menjadikan tab sistem undangan sebagai **Sandbox Eksperimental (Laboratorium Visual)** untuk menguji palet warna, ornamen SVG, dan komponen interaktif menggunakan data *dummy*.
* **Zero Regression Guarantee:** Menjamin 100% bahwa seluruh template yang sudah aktif di `src/components/templates/*` tidak disentuh atau diubah sedikit pun pada tahap ini.

---

## 2. Arsitektur Navigasi Dual-Hub (Information Architecture)

### 2.1 Tab Switcher Utama (Sticky Header)
Header showcase dilengkapi dengan navigasi tingkat atas:
* **Tab 1: `Core Brand & Foundation`** (`?hub=brand`)
* **Tab 2: `Wedding Invitation System`** (`?hub=invitation`) dilengkapi badge *"Sandbox & 8 Archetypes"*

Navigasi ini tersinkronisasi secara dua arah dengan URL parameter `?hub=...` menggunakan `useSearchParams` Next.js App Router (dengan fallback default ke `brand` atau tab aktif terakhir).

### 2.2 Sub-Navigasi Kontekstual
Sub-navigasi di bawah header otomatis berganti sesuai tab aktif:
* **Saat Tab 1 Aktif:** Anchor links ke `#palette`, `#typography`, `#assets`, `#components`, `#mobile`.
* **Saat Tab 2 Aktif:** Anchor links ke `#archetypes`, `#invitation-assets`, `#invitation-components`, `#sandbox-mobile`.

---

## 3. Spesifikasi Konten Tab 1: Core Brand & Foundation

Tab ini mempertahankan dan merapikan seluruh fungsionalitas yang telah ada di halaman saat ini:
1. **5-Color Palette Section:** Swatch warna *Charcoal `#2B2B2B`*, *Taupe `#88735B`*, *Champagne `#C9A88A`*, *Soft Beige `#E8DED1`*, dan *Ivory `#F8F6F1`* dengan fitur salin HEX satu ketukan.
2. **Typography Specimen:** Hirarki ukuran dan perbandingan *Cormorant Garamond* (Display/Heading) dan *Manrope* (UI/Body).
3. **Core Vector Assets Catalog:** Katalog aset umum yang terdaftar di `harikita-assets.json` dengan switcher warna stroke.
4. **General UI Components:** Tombol *Primary, Secondary, Ghost, Dark*, badge premium, wax seal badge, dan *ArchFrameCard*.
5. **Mobile Brand Simulator:** Simulasi halaman beranda HariKita mobile (Header, Hero, Service Cards, Booking Sticky Bar).

---

## 4. Spesifikasi Konten Tab 2: Wedding Invitation System (Sandbox)

Tab ini merupakan implementasi representasi visual dari dokumen `2026-09-12-wedding-invitation-design-system.md`:

### 4.1 Live Archetypes Matrix Inspector (`#archetypes`)
* **8 Arketipe Bar:**
  1. *Botanical Serenade* (Forest Sage `#5B6E58`, Muted Moss, Sudut Rounded 16px)
  2. *Javanese Royal* (Deep Sogan `#5A3825`, Antique Gold, Kasunanan Arch)
  3. *Islamic Syar'i* (Emerald Mist `#2C4A3E`, Sand Dune, Moroccan Arch)
  4. *Minimalist Editorial* (Monolith Charcoal `#1F1F1F`, Pure White, Sharp 0px / Hairline 4px)
  5. *Rose Gold Luxury* (Soft Blush `#E8C5B8`, Copper Foil, Pill Rounded 24px)
  6. *Rustic Pampas* (Terracotta Muted `#A35D43`, Kraft Paper, Deckle Edge)
  7. *Celestial Starlight* (Midnight Navy `#1E2638`, Stardust Gold, Mask Bulat/Orbit)
  8. *Cute & Warm Family* (Honey Peach `#F4C2A1`, Butter Cream, Super-ellipse 28px)
* **Live Token Card Preview:** Menampilkan kartu contoh miniatur yang secara dinamis menerapkan warna permukaan, border, geometri sudut, dan jenis ornamen khas arketipe yang dipilih.

### 4.2 Katalog 243 Aset Vektor Fine-Line (`#invitation-assets`)
* **Data Source:** Menampilkan seluruh aset undangan dari `src/data/harikita-assets.json` yang tersimpan di `public/assets/harikita/`.
* **Kategori Filter:**
  * *Card Frames & Boxes* (Card Invitation 01–14, Frame Arch 01–02, Mask Arch 01)
  * *Botanical Ornaments* (Single Stem 01–24, Leaf Sprig 01–16, Flower Accent 01–12, Botanical 01–32)
  * *Dividers & Lines* (Lines 01–21: Diamond Center, Floral Knot, Minimal Line)
  * *Badges, Stamps & Seals* (Wax Seal Official Crest, Stempel Pos Kebumen EST. 2026, VIP Crest)
  * *Wedding Iconography* (Cincin, Gaun, Jas, Flashdisk Box, Peta Lucu)
  * *Authentic Textures* (Linen Light/Dark, Deckle Paper, Woven Canvas, Gold Foil)
* **Interaktivitas:**
  * Live stroke color switcher (*Taupe, Charcoal, Champagne, Soft-Beige, atau Aksen Arketipe Aktif*).
  * Tombol *Salin Path SVG* (`/assets/harikita/...`).
  * Tombol *Salin JSX Component* (`<ThemedAssetOrnament ... />`).
  * Modal perbesaran vektor (*Zoom Modal*) untuk memverifikasi kurva halus.

### 4.3 Interactive Component Playground (`#invitation-components`)
Lingkungan uji coba mandiri menggunakan data *dummy* (`mock-invitation-sandbox.ts`):
1. **Galeri Pengantin (Selector 8 Gaya):**
   * *Infinite Running Marquee* (Pause on hover/touch)
   * *Luxury Bento Grid* (Modular bento diselingi kutipan cinta)
   * *3D Stacked Deck Swipe* (Efek kartu bertumpuk)
   * *Polaroid Pinboard* (Kartu berpolaroid dengan selotip transparan)
   * *Cinema Film Strip* (Pita rol film 35mm gulir halus)
   * *Arch Portal Carousel* (Gerbang lengkung dengan indikator slide)
   * *Architectural Accordion* (Kolom vertikal rapat yang melebar saat disentuh)
   * *Celestial Orbit Sphere* (Foto lingkaran berputar halus)
   * *Lightbox Preview*: Klik foto pada semua gaya galeri memicu pop-up layar penuh.
2. **Card Mempelai (Selector 4 Geometri):**
   * *Twin Arches*
   * *Overlapping Editorial*
   * *Vintage Medallion*
   * *Interactive Profile Switcher* (Sudut 3° miring dengan efek kedalaman)
3. **Tanda Kasih & Generator QRIS Dinamis:**
   * Kotak input nominal rupiah + tombol chip cepat (*Rp 100k, Rp 250k, Rp 500k, Rp 1jt*).
   * Generator QRIS visual mockup real-time sesuai nominal yang dipilih.
   * Kartu nomor rekening bank (BCA/Mandiri) dengan tombol salin dan feedback *toast*.
4. **Buku Tamu & Feed Doa (Focus & Blur Sandbox):**
   * Logika kondisional: Memilih kehadiran *"Kirim Doa dari Jauh"* langsung memunculkan respon santun dan tombol pintas ke Tanda Kasih QRIS.
   * Feed doa dengan efek kedalaman optik: Kartu aktif jernih (100%), kartu latar bertumpuk dengan filter `blur(4px)` lembut.

### 4.4 Mobile Frame Sandbox (`#sandbox-mobile`)
Simulator layar ponsel *iPhone SE (375px)* di mana penguji dapat melihat gabungan komponen dummy terpilih di dalam satu scroll vertikal undangan yang utuh.

---

## 5. Arsitektur File & Organisasi Kode

Untuk menjaga keterbacaan kode dan mencegah file raksasa (>1.000 baris), halaman dipecah secara modular:

```
src/app/design-system-showcase/
├── page.tsx                                  # Orchestrator & Client State (Hub Switcher)
├── data/
│   └── mock-invitation-sandbox.ts            # Data dummy terisolasi (nama pengantin, foto, rekening)
└── components/
    ├── brand-hub/                            # Modul Tab 1 (Brand Foundation)
    │   ├── PaletteSection.tsx
    │   ├── TypographySection.tsx
    │   ├── CoreAssetsSection.tsx
    │   ├── UIComponentsSection.tsx
    │   └── MobileBrandSimulator.tsx
    └── invitation-hub/                       # Modul Tab 2 (Wedding Invitation Sandbox)
        ├── InvitationHubView.tsx             # Root container Tab 2
        ├── ArchetypesMatrixSection.tsx       # Matriks 8 Arketipe & Live Swatch
        ├── InvitationAssetCatalogSection.tsx # Katalog 243 Aset Fine-Line & Stroke Switcher
        ├── InvitationPlaygroundSection.tsx   # Playground Komponen (8 Galeri, Mempelai, QRIS, RSVP)
        ├── InvitationMobileFrameSection.tsx  # Simulator Smartphone 375px
        └── playground/                       # Sub-komponen simulator mandiri
            ├── SandboxGalleryViewer.tsx
            ├── SandboxCoupleViewer.tsx
            ├── SandboxQrisGenerator.tsx
            └── SandboxGuestbookBlur.tsx
```

---

## 6. Jaminan Isolasi & Nol Regresi (*Zero Regression*)

1. **Folder `src/components/templates/*`:** Tidak disentuh sama sekali. Template produksi tetap bekerja normal menggunakan data dan engine aslinya.
2. **Folder `src/components/invitation/*`:** Tidak ada modifikasi destruktif pada komponen eksisting; komponen sandbox bersifat *consumer* mandiri.
3. **Data Independen:** Data dummy yang digunakan pada sandbox disimpan khusus di `src/app/design-system-showcase/data/mock-invitation-sandbox.ts` dan tidak mengotori *store* atau database utama.

---

## 7. Rencana Pengujian & Verifikasi

1. **URL Parameter Testing:**
   * Uji pergantian tab dari `?hub=brand` ke `?hub=invitation` dan sebaliknya via browser.
   * Uji navigasi anchor link (`#archetypes`, `#invitation-assets`, dsb.) berjalan mulus.
2. **Performa Rendering Aset:**
   * Pemuatan 243 aset SVG terverifikasi ringan melalui *in-memory cache* (`svgCache`).
   * Pergantian warna stroke (*Taupe, Charcoal, Champagne, Soft-Beige*) terjadi seketika tanpa *re-fetching*.
3. **Interaktivitas Sandbox:**
   * Uji seluruh 8 gaya galeri dapat diganti dan menampilkan foto *dummy* dengan benar.
   * Uji input nominal QRIS otomatis memperbarui tampilan QR mockup.
   * Uji pemilihan *"Kirim Doa dari Jauh"* membuka alur Tanda Kasih.
4. **Responsivitas & Tampilan Mobile:**
   * Uji tampilan mobile 375px bebas dari *horizontal scrollbar overflow*.
5. **Type Safety & Build Check:**
   * Menjalankan TypeScript type check dan verifikasi `npm run build` bebas error.
