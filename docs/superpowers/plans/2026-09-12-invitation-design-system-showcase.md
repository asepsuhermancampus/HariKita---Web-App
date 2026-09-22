# Dual-Hub HariKita Design System Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Membangun arsitektur Dual-Hub pada halaman `http://localhost:3000/design-system-showcase` yang memisahkan Core Brand Foundation dengan Wedding Invitation System (Sandbox Eksperimental 8 Arketipe, 243 Aset Vektor Fine-Line, dan Playground Komponen Interaktif).

**Architecture:** Memecah halaman monolitik `page.tsx` menjadi arsitektur modular berbasis tab (`?hub=brand` vs `?hub=invitation`). Tab undangan beroperasi secara mandiri (*sandbox isolated*) menggunakan data dummy lokal tanpa menyentuh atau memodifikasi file template produksi yang sudah ada di `src/components/templates/*`.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, DaisyUI, Lucide React, Framer Motion / CSS GPU Transforms.

**Spec:** `docs/superpowers/specs/2026-09-12-invitation-design-system-showcase-design.md`

## Global Constraints

- Template produksi di `src/components/templates/*` **TIDAK BOLEH** diubah atau disentuh sama sekali (Zero Regression Guarantee).
- Palet warna resmi: Charcoal (`#2B2B2B`), Taupe (`#88735B`), Champagne (`#C9A88A`), Soft Beige (`#E8DED1`), Ivory (`#F8F6F1`).
- Standar tipografi: `Cormorant Garamond` (Display/Headings) dan `Manrope` (UI/Body/Data).
- Seluruh tombol memiliki area sentuh minimum 44px × 44px dan responsif mobile 375px tanpa horizontal overflow.
- Animasi menggunakan akselerasi GPU (`transform: translate3d`, `opacity`).

---

### Task 1: Data Dummy Terisolasi & Tipe Data Sandbox

**Files:**
- Create: `src/app/design-system-showcase/data/mock-invitation-sandbox.ts`

**Interfaces:**
- Produces: `SANDBOX_COUPLE_DATA`, `SANDBOX_STORIES_DATA`, `SANDBOX_SCHEDULE_DATA`, `SANDBOX_GALLERY_PHOTOS`, `SANDBOX_GIFT_DATA`, `SANDBOX_GUESTBOOK_WISHES`, `ARCHETYPES_CONFIG`

- [x] **Step 1: Tulis skema data dan tipe dummy sandbox**
Buat file `src/app/design-system-showcase/data/mock-invitation-sandbox.ts` yang memuat data pasangan pengantin fiktif (Aditya & Ratna - Kebumen), 4 babak cerita cinta, jadwal akad & 2 sesi resepsi, 8 foto prewedding Kebumen (landscape/portrait dengan aspect ratio terdefinisi), nomor rekening BCA/Mandiri dummy, daftar ucapan doa dummy, serta konfigurasi 8 arketipe lengkap (nama, warna sekunder, geometri kartu, dan aset kunci).

- [x] **Step 2: Verifikasi eksport data dengan skrip typecheck sederhana**
Jalankan kompilasi TypeScript untuk memastikan tidak ada kesalahan sintaks atau tipe pada file mock data:
Run: `npx tsc --noEmit src/app/design-system-showcase/data/mock-invitation-sandbox.ts`
Expected: PASS tanpa error.

- [x] **Step 3: Commit data mock**
```bash
git add src/app/design-system-showcase/data/mock-invitation-sandbox.ts
git commit -m "feat(showcase): add isolated mock data for invitation design system sandbox"
```

---

### Task 2: Modularisasi Tab 1 (Brand Hub Components)

**Files:**
- Create: `src/app/design-system-showcase/components/brand-hub/PaletteSection.tsx`
- Create: `src/app/design-system-showcase/components/brand-hub/TypographySection.tsx`
- Create: `src/app/design-system-showcase/components/brand-hub/CoreAssetsSection.tsx`
- Create: `src/app/design-system-showcase/components/brand-hub/UIComponentsSection.tsx`
- Create: `src/app/design-system-showcase/components/brand-hub/MobileBrandSimulator.tsx`
- Create: `src/app/design-system-showcase/components/brand-hub/BrandHubView.tsx`

**Interfaces:**
- Consumes: Komponen UI `src/components/harikita/ui` dan mobile `src/components/harikita/mobile`
- Produces: `<BrandHubView />` yang merangkum seluruh konten tab Core Brand tanpa mengurangi fungsionalitas eksisting.

- [x] **Step 1: Ekstraksi komponen PaletteSection dan TypographySection**
Pindahkan kode swatch 5 warna dan spesimen tipografi dari `page.tsx` ke komponen modular yang rapi di `components/brand-hub/`.

- [x] **Step 2: Ekstraksi CoreAssetsSection, UIComponentsSection, dan MobileBrandSimulator**
Pindahkan logika visual vector assets, showcase button/badge, dan frame mobile beranda ke komponen masing-masing.

- [x] **Step 3: Rakit BrandHubView.tsx**
Satukan kelima section tersebut ke dalam container `<BrandHubView />`.

- [x] **Step 4: Uji integrasi BrandHubView**
Pastikan `BrandHubView` mengekspor komponen React murni tanpa error import:
Run: `npx tsc --noEmit`
Expected: PASS.

- [x] **Step 5: Commit modularisasi brand hub**
```bash
git add src/app/design-system-showcase/components/brand-hub/
git commit -m "refactor(showcase): modularize existing core brand sections into brand-hub components"
```

---

### Task 3: Dual-Hub Topbar & Orchestrator Page

**Files:**
- Modify: `src/app/design-system-showcase/page.tsx`
- Create: `src/app/design-system-showcase/components/ShowcaseHeader.tsx`

**Interfaces:**
- Consumes: `<BrandHubView />`, `<InvitationHubView />` (placeholder awal)
- Produces: Tampilan halaman `/design-system-showcase` yang memiliki tab switcher `?hub=brand` dan `?hub=invitation` dengan `Suspense` wrapper.

- [x] **Step 1: Buat ShowcaseHeader.tsx**
Buat komponen header sticky dengan logo HariKita, tab switcher pill bergaya luxury (`Core Brand & Foundation` vs `Wedding Invitation System [Sandbox]`), serta sub-nav link yang dinamis berganti tergantung tab yang sedang aktif.

- [x] **Step 2: Update page.tsx dengan state URL ?hub=...**
Gunakan `useSearchParams` untuk membaca parameter `hub`. Tampilkan `<BrandHubView />` jika `hub === 'brand'` dan `<InvitationHubView />` jika `hub === 'invitation'`. Bungkus pemanggilan `useSearchParams` dalam `<Suspense>` bawaan Next.js.

- [x] **Step 3: Uji fungsi tab switching**
Jalankan dev server dan buka browser untuk memverifikasi klik tab berpindah URL secara mulus tanpa reload halaman penuh:
Run: Buka `http://localhost:3000/design-system-showcase?hub=brand` dan `http://localhost:3000/design-system-showcase?hub=invitation`.
Expected: Header beralih aktif dan sub-navigation link berganti sesuai tab.

- [x] **Step 4: Commit orchestrator header & page**
```bash
git add src/app/design-system-showcase/components/ShowcaseHeader.tsx src/app/design-system-showcase/page.tsx
git commit -m "feat(showcase): implement dual-hub topbar and url tab switching orchestrator"
```

---

### Task 4: Matriks 8 Arketipe Section

**Files:**
- Create: `src/app/design-system-showcase/components/invitation-hub/ArchetypesMatrixSection.tsx`

**Interfaces:**
- Consumes: `ARCHETYPES_CONFIG` dari `mock-invitation-sandbox.ts`
- Produces: Komponen interaktif selector 8 arketipe dengan preview token warna, border geometry, dan mini mock card.

- [x] **Step 1: Implementasi grid selector 8 arketipe**
Tampilkan 8 kartu ringkas arketipe (*Botanical, Javanese, Islamic, Minimalist, Rose Gold, Rustic, Celestial, Cute*) dengan indikator aktif.

- [x] **Step 2: Implementasi Live Token Inspector**
Saat salah satu arketipe dipilih, panel kanan menampilkan:
- Palet warna turunan dengan tombol salin HEX satu ketukan.
- Keterangan bentuk kartu & sudut (misal: *Kasunanan Arch*, *Pill 24px*, *Deckle Edge*).
- Mini mock preview card yang merefleksikan gaya arketipe tersebut secara real-time.

- [x] **Step 3: Uji interaksi klik arketipe**
Pastikan pergantian arketipe merespons instan dan data token sesuai spesifikasi desain sistem:
Run: `npx tsc --noEmit`
Expected: PASS.

- [x] **Step 4: Commit archetypes matrix section**
```bash
git add src/app/design-system-showcase/components/invitation-hub/ArchetypesMatrixSection.tsx
git commit -m "feat(showcase): add interactive 8 archetypes visual matrix and live token inspector"
```

---

### Task 5: Katalog 243 Aset Vektor Fine-Line

**Files:**
- Create: `src/app/design-system-showcase/components/invitation-hub/InvitationAssetCatalogSection.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/AssetZoomModal.tsx`

**Interfaces:**
- Consumes: `getHariKitaAssets()` dari `src/lib/harikita-assets.ts`
- Produces: Grid katalog aset undangan terfilter dengan switcher warna stroke, tombol salin path/JSX, dan modal perbesaran kurva vektor.

- [x] **Step 1: Implementasi tab filter kategori aset undangan**
Kategori mencakup: `Semua`, `Cards & Frames`, `Botanical Ornaments`, `Dividers & Lines`, `Badges & Seals`, `Wedding Icons`, dan `Textures`.

- [x] **Step 2: Implementasi kontrol warna stroke & kartu aset**
Sediakan pilihan stroke warna: *Taupe, Charcoal, Champagne, Soft Beige, dan Aksen Arketipe*. Setiap kartu memiliki tombol *"Salin Path"* dan *"Salin JSX"*.

- [x] **Step 3: Implementasi AssetZoomModal**
Klik pada kartu aset membuka modal perbesaran vektor dengan latar belakang *checkerboard* transparan untuk memverifikasi kehalusan garis potrace.

- [x] **Step 4: Uji rendering aset dan filter**
Verifikasi pemuatan aset berjalan lancar dan modal perbesaran terbuka/tutup tanpa bug:
Run: `npx tsc --noEmit`
Expected: PASS.

- [x] **Step 5: Commit asset catalog section**
```bash
git add src/app/design-system-showcase/components/invitation-hub/InvitationAssetCatalogSection.tsx src/app/design-system-showcase/components/invitation-hub/AssetZoomModal.tsx
git commit -m "feat(showcase): add invitation fine-line asset catalog with stroke switcher and zoom modal"
```

---

### Task 6: Interactive Component Playground (Sandbox 8 Galeri, Mempelai, QRIS, RSVP)

**Files:**
- Create: `src/app/design-system-showcase/components/invitation-hub/playground/SandboxGalleryViewer.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/playground/SandboxCoupleViewer.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/playground/SandboxQrisGenerator.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/playground/SandboxGuestbookBlur.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/InvitationPlaygroundSection.tsx`

**Interfaces:**
- Consumes: Data dari `mock-invitation-sandbox.ts`
- Produces: Playground terpadu untuk menguji 8 varian galeri, 4 varian kartu mempelai, generator QRIS dinamis, dan feed doa berkedalaman optik (*depth-of-field*).

- [x] **Step 1: Buat SandboxGalleryViewer.tsx (8 Varian Galeri)**
Implementasikan selector 8 gaya galeri:
1. *Infinite Running Marquee*
2. *Luxury Bento Grid*
3. *3D Stacked Deck Swipe*
4. *Polaroid Pinboard*
5. *Cinema Film Strip*
6. *Arch Portal Carousel*
7. *Architectural Accordion*
8. *Celestial Orbit Sphere*
Lengkap dengan integrasi modal Lightbox saat foto diklik.

- [x] **Step 2: Buat SandboxCoupleViewer.tsx (4 Varian Geometri Mempelai)**
Tampilkan 4 gaya kartu: *Twin Arches*, *Overlapping Editorial*, *Vintage Medallion*, dan *Interactive Profile Switcher*.

- [x] **Step 3: Buat SandboxQrisGenerator.tsx (Tanda Kasih & QRIS Dinamis)**
Sediakan input nominal rupiah + chip nominal (*Rp 100k, Rp 250k, Rp 500k, Rp 1jt*). Render gambar QRIS mockup dinamis yang mencerminkan nominal tersebut dan sediakan nomor rekening dengan tombol salin.

- [x] **Step 4: Buat SandboxGuestbookBlur.tsx (RSVP & Focus-Blur Feed)**
Implementasikan form kehadiran dengan deteksi opsi *"Kirim Doa dari Jauh"* yang memunculkan ucapan terima kasih tulus, serta feed doa dengan kartu depan tajam (100%) dan kartu belakang berfilter Gaussian blur `blur(4px)`.

- [x] **Step 5: Susun InvitationPlaygroundSection.tsx**
Satukan keempat sub-playground ke dalam satu kontainer dengan bar uji coba palet (*Live Palette Tester*).

- [x] **Step 6: Uji fungsionalitas interaktif playground**
Pastikan pergantian 8 galeri berjalan mulus, perhitungan QRIS dinamis responsif, dan efek blur doa tampil estetik:
Run: `npx tsc --noEmit`
Expected: PASS.

- [x] **Step 7: Commit component playground**
```bash
git add src/app/design-system-showcase/components/invitation-hub/playground/ src/app/design-system-showcase/components/invitation-hub/InvitationPlaygroundSection.tsx
git commit -m "feat(showcase): implement interactive sandbox playground for 8 galleries, couple cards, dynamic qris, and rsvp"
```

---

### Task 7: Mobile Frame Sandbox & Container InvitationHubView

**Files:**
- Create: `src/app/design-system-showcase/components/invitation-hub/InvitationMobileFrameSection.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/InvitationHubView.tsx`

**Interfaces:**
- Consumes: Seluruh section undangan (Archetypes, Assets, Playground)
- Produces: `<InvitationHubView />` yang diekspor dan ditampilkan di `page.tsx` saat `hub === 'invitation'`.

- [x] **Step 1: Buat InvitationMobileFrameSection.tsx**
Buat bingkai mockup smartphone (iPhone SE 375px) yang merender alur vertikal mini undangan pernikahan dummy secara elegan (Cover amplop -> Mempelai -> Acara -> Galeri terpilih -> RSVP & QRIS).

- [x] **Step 2: Satukan semua seksi ke dalam InvitationHubView.tsx**
Rakit `ArchetypesMatrixSection`, `InvitationAssetCatalogSection`, `InvitationPlaygroundSection`, dan `InvitationMobileFrameSection` ke dalam `InvitationHubView`.

- [x] **Step 3: Uji tampilan menyeluruh Tab 2 di browser**
Buka `http://localhost:3000/design-system-showcase?hub=invitation` dan verifikasi bahwa semua anchor link (`#archetypes`, `#invitation-assets`, `#invitation-components`, `#sandbox-mobile`) dapat diakses lancar.

- [x] **Step 4: Commit mobile frame dan invitation hub view**
```bash
git add src/app/design-system-showcase/components/invitation-hub/InvitationMobileFrameSection.tsx src/app/design-system-showcase/components/invitation-hub/InvitationHubView.tsx
git commit -m "feat(showcase): assemble invitation hub view and 375px mobile simulation frame"
```

---

### Task 8: Pengujian Menyeluruh, Responsivitas, & Build Verification

**Files:**
- Verify: Seluruh file di `src/app/design-system-showcase/`
- Verify: `src/components/templates/*` (pastikan tidak ada file yang termodifikasi / zero regression)

**Interfaces:**
- Produces: Build produksi yang bersih dan validasi visual tanpa error.

- [x] **Step 1: Jalankan Typecheck TypeScript**
Run: `npx tsc --noEmit`
Expected: 0 errors.

- [x] **Step 2: Jalankan Next.js Production Build**
Run: `npm run build`
Expected: Build sukses tanpa error atau peringatan kritis.

- [x] **Step 3: Verifikasi Nol-Regresi Git Status**
Run: `git status --porcelain src/components/templates/`
Expected: Output kosong (tidak ada modifikasi apa pun pada template asli).

- [x] **Step 4: Uji Responsivitas & Tampilan di Browser**
Verifikasi via browser pada resolusi 375px (iPhone SE), 768px (iPad), dan 1440px (Desktop):
- Tidak ada *horizontal scrollbar overflow*.
- Tab switching antara `?hub=brand` dan `?hub=invitation` bekerja instan.
- Semua 8 gaya galeri dan generator QRIS berfungsi interaktif.

- [x] **Step 5: Commit finalisasi verifikasi**
```bash
git commit --allow-empty -m "chore(showcase): verify zero-regression and complete dual-hub design system integration"
```
