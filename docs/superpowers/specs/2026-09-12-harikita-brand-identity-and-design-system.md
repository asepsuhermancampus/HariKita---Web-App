# Spesifikasi Sistem Identitas Merek & Desain Terpadu "HariKita"
## Platform Event Lamaran & Pernikahan Hyperlocal Kebumen

**Tanggal:** 12 September 2026  
**Status:** Approved Architectural Spec  
**Target Dokumen Spec:** `docs/superpowers/specs/2026-09-12-harikita-brand-identity-and-design-system.md`  
**Referensi Utama:** `public/HariKita-Design.png`

---

## 1. Latar Belakang & Visi Merek

"HariKita" merepresentasikan filosofi *"Your Day. Our Story"* — pertemuan dua perjalanan personal yang berbeda, yang menyatu menjadi satu kisah cinta dan hari bahagia bersama.

Platform mengadopsi identitas visual baru yang modern, mewah, editorial, dan timeless, beralih dari ornamen bros/cameo floral lama ke arah identitas teknologi gaya hidup pernikahan kontemporer (*contemporary wedding & event lifestyle platform*).

### Batasan Negatif Identitas (Strict Prohibitions):
1. ❌ Tanpa ilustrasi kartun figur pengantin generik.
2. ❌ Tanpa cincin pernikahan atau mahkota.
3. ❌ Tanpa karangan bunga melingkar (*floral wreath / circular cameo frame*).
4. ❌ Tanpa efek 3D emboss atau metallic chrome yang berlebihan.
5. ❌ Tanpa warna emas kuning mencolok (*yellow gold* `#D4AF37`).

---

## 2. Monogram Vektor H + K (Simbol Merek)

Monogram inti dibentuk secara presisi dari pertemuan geometris kurva Bézier:
$$\mathbf{H + K} \quad + \quad \text{Two People (Together)} \quad + \quad \text{Shared Journey (Infinity)} \quad = \quad \mathcal{h}\mathcal{K}\text{ Monogram}$$

### Karakteristik Vektor:
* **Two People (Together):** Dua lingkaran kepala di bagian atas dengan jarak dan proporsi optis seimbang.
* **The H / Left Stem:** Batang kurva vertikal anggun yang meliuk di bagian pinggang membentuk sambungan busur kontinu ke kanan.
* **The K / Shared Journey:** Aliran lengkung tengah yang menyatu ke lengan kanan atas dan kaki kanan bawah dengan *calligraphic terminal flare*.
* **Spesifikasi SVG:**
  * 100% kurva vektor SVG murni (0% raster, 0% filter blur, 0% bitmap).
  * Ukuran file hanya ~6 KB, sangat ringan dan cepat di-render.
  * Mendukung penuh `fill="currentColor"`.
  * Bebas dari offset tersembunyi (`viewBox="602 13 741 678"` terkalibrasi presisi).

---

## 3. Sistem Palet Warna Resmi (6 Core Tokens)

Sistem warna dikalibrasi langsung dari sampling visual [HariKita-Design.png](file:///c:/Users/asep.suherman/SETTUP%20TESTING/Build%20Project%20In%20Here/IDE/HariKita%20-%20Web%20App/public/HariKita-Design.png) dan diselaraskan dengan arsitektur tema HariKita:

| CSS Custom Property | Nilai Hex | Peran dalam Antarmuka |
|---|---|---|
| `--hk-canvas` | `#FAF8F5` | Latar belakang kanvas website keseluruhan (*Cashmere Alabaster*). |
| `--hk-ivory` | `#F8F6F1` | Permukaan kartu primer, teks wordmark pada latar gelap. |
| `--hk-soft-beige` | `#E5DED5` | Permukaan kartu sekunder, border pemisah halus, container aksen netral. |
| `--hk-charcoal` | `#2B2B2B` | Teks judul utama, wordmark pada latar terang, latar dark mode & footer. |
| `--hk-taupe` | `#88735B` | Simbol logo utama, sub-teks *WEDDING & EVENTS*, background app icon squircle. |
| `--hk-champagne` | `#C5B39F` | Simbol logo pada latar gelap, border aksen mewah, badge eksklusif (*Muted Cashmere*). |

---

## 4. Sistem Tipografi

1. **Wordmark Utama & Headings (Display, H1, H2):**
   * Font: **Cormorant Garamond** (SemiBold / Medium)
   * Teks: `HariKita`
   * Karakteristik: High-contrast editorial serif, anggun, berwibawa.
2. **Sub-label & Kategori:**
   * Teks: `WEDDING & EVENTS`
   * Karakteristik: Clean geometric sans (Manrope), All-Caps, `letter-spacing: 0.28em`.
3. **Tagline Merek:**
   * Teks: *`Your Day. Our Story`*
   * Karakteristik: Italic Cormorant Garamond, warna Taupe (`#88735B`) atau Muted Champagne (`#C5B39F`).
4. **UI, Body, Navigasi, & Tombol:**
   * Font: **Manrope** (ditambahkan pada Google Fonts di `src/app/layout.tsx`).

---

## 5. Arsitektur Komponen & Distribusi Aset

### 5.1 Komponen Reusable `<HariKitaLogo />`
Lokasi baru: `src/components/brand/HariKitaLogo.tsx`

```typescript
interface HariKitaLogoProps {
  variant?: 'horizontal' | 'stacked' | 'symbol';
  tone?: 'dark' | 'light' | 'monochrome-black' | 'monochrome-white' | 'currentColor';
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  showTagline?: boolean;
  showSubtitle?: boolean;
  asLink?: boolean;
  className?: string;
}
```

* **Varian Horizontal:**
  * Simbol di kiri + Wordmark "HariKita" dan "WEDDING & EVENTS" di kanan.
  * Digunakan pada **Navbar** (`Navbar.tsx`) dan **Footer** (`Footer.tsx`).
* **Varian Stacked:**
  * Simbol di atas + Wordmark di tengah + Subtitle + Hairline Divider + Tagline *"Your Day. Our Story"*.
  * Digunakan pada Hero Section, Dokumen Invoicing, dan Splash/PWA Screen.
* **Varian Symbol:**
  * Simbol `hK` mandiri untuk avatar, watermark foto vendor, dan button icon.

### 5.2 Refaktor `LogoBadge.tsx`
* File `src/components/layout/LogoBadge.tsx` direfaktor sebagai adapter ramah-kompatibilitas yang membungkus `<HariKitaLogo />`.
* Menghapus referensi ke gambar raster `/logo_badge.png` lama.
* Menjamin tidak ada regresi pada halaman mana pun yang telah mengimpor `LogoBadge`.

### 5.3 Aset Berkas Vektor Standar (`public/brand/`)
* `public/brand/harikita-symbol.svg` (Vektor simbol murni, `currentColor`)
* `public/brand/harikita-logo-horizontal.svg` (Logo horizontal standar)
* `public/brand/harikita-logo-stacked.svg` (Logo stacked lengkap)
* `public/favicon.svg` (Favicon squircle SVG murni)
* `public/favicon.ico` & `public/icons/icon-*.png` (PWA launcher icons)

---

## 6. Pembaruan Token Tailwind & CSS

### 6.1 `src/app/globals.css`
Menambahkan blok token CSS resmi:
```css
:root {
  --hk-canvas: #FAF8F5;
  --hk-ivory: #F8F6F1;
  --hk-soft-beige: #E5DED5;
  --hk-charcoal: #2B2B2B;
  --hk-taupe: #88735B;
  --hk-champagne: #C5B39F;
}
```

### 6.2 `tailwind.config.ts`
Mendaftarkan token ke dalam theme Tailwind:
```typescript
colors: {
  hk: {
    canvas: "var(--hk-canvas)",
    ivory: "var(--hk-ivory)",
    "soft-beige": "var(--hk-soft-beige)",
    charcoal: "var(--hk-charcoal)",
    taupe: "var(--hk-taupe)",
    champagne: "var(--hk-champagne)",
  }
}
```

### 6.3 `src/app/layout.tsx`
Memperbarui link Google Fonts untuk menyertakan `Manrope`:
```html
family=Manrope:wght@300;400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400
```

---

## 7. Rencana Verifikasi & Uji Kualitas

1. **Uji Skalabilitas SVG:**
   * Memastikan logo tajam sempurna pada ukuran 16px (favicon), 32px (mobile navbar), hingga 512px (app launcher) tanpa blur.
2. **Uji Keterbacaan & Kontras Mobile:**
   * Memverifikasi tampilan header pada viewport mobile 375px (bebas overflow horizontal).
3. **Uji Integritas Tipe TypeScript:**
   * Menjalankan `npx tsc --noEmit` untuk memastikan nol error tipe pada komponen baru dan pemanggilnya.
4. **Uji Build Produksi Next.js:**
   * Memvalidasi kompilasi `npm run build` berjalan mulus.
