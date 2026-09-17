# Arsitektur Registri Aset Template & Individualisasi 48 Master Template Undangan HariKita
## Platform Acara Lamaran & Pernikahan Hyperlocal "HariKita" (Kabupaten Kebumen)
**Tanggal:** 11 September 2026  
**Status:** Approved Architectural Spec  
**Target Lokasi Spec:** `docs/superpowers/specs/2026-09-11-theme-asset-registry-and-individuation-design.md`  

---

## 1. Latar Belakang & Tujuan

Platform HariKita memiliki **64 Master Template Undangan Digital** yang terbagi ke dalam **8 Arketipe Desain Utama (masing-masing 8 template)**. Sebelumnya, 16 template pada arketipe Botanical dan Javanese telah memiliki komponen SVG individual kustom. Sementara itu, repositori baru saja memigrasikan dan menyusun **272 aset vektor SVG murni** (0% raster, 0% `<image>`, 0% base64) di direktori `public/harikita-assets/` dengan taksonomi visual yang presisi.

Dokumen ini memetakan arsitektur pengintegrasian 272 aset tersebut untuk mengindividualisasikan **48 template yang tersisa** pada 6 arketipe:
1. **Syar'i & Islamic Heritage** (8 template)
2. **Minimalist Typographic** (8 template)
3. **Rose Gold & Royal Foil 3D** (8 template)
4. **Celestial Night & Constellations** (8 template)
5. **Rustic Bohemian & Pampas** (8 template)
6. **Cute Illustrated Maps & Storybook** (8 template)

### Prinsip Utama
- **Zero Component Bloat:** Alih-alih membuat ~288 file `.tsx` baru, seluruh aset dihubungkan melalui sebuah konfigurasi registri type-safe terpusat (`THEME_ASSET_REGISTRY`) dan dirender oleh komponen universal `<ThemedAssetOrnament />`.
- **Zero Layout Shift (CLS):** Semua aset SVG memiliki dimensi dan viewBox tetap untuk mencegah pergeseran tata letak saat dimuat.
- **Graceful Degradation:** Jika ornamen opsional tidak tersedia, komponen merender kontainer kosong secara bersih tanpa broken icon atau runtime error.
- **Strictly Hyperlocal Kebumen Guardrails:** Seluruh palet warna dan tipografi mematuhi guardrails HariKita (`#FAF8F5`, `#C5A880`, `#4A2E35`, `#6B5E62`, `#F3EDE6`).

---

## 2. Arsitektur Komponen & Kontrak Data

### A. Tipe Data Kontrak (`src/lib/templates/types.ts` / `src/lib/templates/themeAssetRegistry.ts`)
```typescript
export interface ThemeAssetBundle {
  heroCenterpiece: string;       // Path ke SVG ornamen utama di /harikita-assets/...
  cornerFiligree?: string;       // Path ke SVG hiasan sudut (opsional)
  sectionDivider: string;        // Path ke SVG pemisah horizontal
  cardBorder?: string;           // Path ke SVG bingkai kartu atau foto (opsional)
  backgroundGradient?: string;   // Path ke SVG gradien / tekstur latar (opsional)
  closingSeal?: string;          // Path ke SVG segel penutup / wax seal / doa (opsional)
}

export type ThemeAssetRegistryMap = Record<string, ThemeAssetBundle>;
```

### B. Komponen Universal: `<ThemedAssetOrnament />` (`src/components/invitation/ornaments/ThemedAssetOrnament.tsx`)
Komponen ini bertindak sebagai perender vektor SVG instan:
- Properti:
  - `src: string` (Wajib, relative URL menuju `/harikita-assets/...`)
  - `alt: string` (Wajib untuk aksesibilitas)
  - `size?: number` (Ukuran dasar width/height)
  - `className?: string` (Utilitas Tailwind, misal `w-48 h-auto mx-auto my-4`)
  - `priority?: boolean` (Preload untuk hero centerpiece)
  - `tintColor?: string` (Opsional CSS filter/mask untuk penyesuaian aksen monokrom)
- Keunggulan: Memanfaatkan caching native HTTP browser tanpa overhead rendering JavaScript berlebih.

---

## 3. Pemetaan Visual 6 Arketipe & 48 Template

### 1. Arketipe Syar'i & Islamic Heritage (8 Template)
*Karakter:* Simetris, ornamen kubah mihrab, bintang segi delapan, sulur arabesque emas.
1. `arabesque-royal`: Centerpiece kaligrafi emas + filigree corner gold + divider geometris simetris.
2. `emerald-syari`: Centerpiece kubah zamrud + aksen daun geometri Madinah + divider arabesque.
3. `walimatul-ursy`: Centerpiece kaligrafi Thuluth melingkar + divider pita berkatup doa barakah.
4. `al-fatih`: Centerpiece ornamen mozaik Utsmani + sudut kubah + divider garis ganda emas.
5. `salsabila`: Centerpiece mata air jannah + sudut bunga melati air + divider lengkung lembut.
6. `ar-rahman`: Centerpiece bintang 8 penjuru gurun + filigree corner emas + divider mozaik.
7. `nur-jannah`: Centerpiece pendaran cahaya perak kaligrafi + divider garis pendaran.
8. `barakah-gold`: Centerpiece lengkung bunga rose gold + divider kubah feminin + segel doa barakah.

### 2. Arketipe Minimalist Typographic (8 Template)
*Karakter:* Garis 1px, sudut tajam/bersih, aksen tipis, tekstur kertas halus, negative space luas.
1. `editorial-vogue`: Monogram serif 1px + divider garis horizontal presisi + kartu border minimal.
2. `minimal-noir`: Stark monochrome fold + divider garis ganda hitam-putih kontras tinggi.
3. `kinfolk-odyssey`: Tekstur serat kertas kraft (`backgrounds/textures/`) + divider titik geometris.
4. `blanc-pure`: Bayangan kartu floating putih + divider ultra-halus 0.5px.
5. `harmony-gray`: Garis arsitektur modern + sudut siku presisi.
6. `clay-peak`: Siluet blok warna tanah liat adobe + divider terracotta lurus.
7. `marble-mist`: Urat marmer Carrara tipis + divider pelat batu halus.
8. `serenity-sky`: Garis horizon cakrawala biru lembut + divider garis tipis senja.

### 3. Arketipe Rose Gold & Royal Foil 3D (8 Template)
*Karakter:* Aksen lelehan foil metalik, mawar mekar royal, stempel lilin 3D, kemewahan ballroom.
1. `aurum-velvet`: English Rose Ivory centerpiece + filigree corner emas + wax seal stamp 3D leleh.
2. `glamour-grey`: Mawar perak holografis + platinum filigree corners + wax seal platinum.
3. `black-diamond`: Kristal berlian hitam faset + divider lengkung foil obsidian + wax seal obsidian.
4. `burgundy-bliss`: Mawar beludru marun mekar + filigree corner wine-red + wax seal burgundy.
5. `emerald-seafoam`: Aliran foil emas cair di atas toska + divider sulur laut + wax seal emerald.
6. `royal-amethyst`: Bunga violet berhias prada ungu muda + divider pita permata + wax seal amethyst.
7. `copper-canyon`: Daun tembaga bergradasi terracotta + divider kawat tembaga bakar + wax seal copper.
8. `midnight-gilded`: Ranting emas berkilau di atas hitam arang + divider taburan serbuk emas + wax seal night.

### 4. Arketipe Celestial Night & Constellations (8 Template)
*Karakter:* Malam safir, bintang faset, rasi bintang, zodiak garis halus, nebula ungu.
1. `celestial-starlight`: Star sparkle gold (`decorative/stars-sparkles/star-sparkle-gold-01.svg`) + divider bintang micro-dot.
2. `lunar-aurora`: Bulan sabit artistik + pendaran aurora safir + divider gelombang langit.
3. `midnight-galaxy`: Taburan bintang faset + border kartu nebula gelap + divider orbit planet.
4. `cosmic-romance`: Rasi bintang kembar berpadu sulur emas + divider lintasan komet.
5. `astral-whisper`: Pendar bintang perak lembut + filigree sudut bintang + divider garis orbit.
6. `solstice-glow`: Mahkota cahaya matahari malam + divider busur konstelasi.
7. `nebula-dust`: Partikel debu kosmik melingkar + background gradien midnight blue to deep plum.
8. `orion-constellation`: Pola rasi Orion geometris + divider panah bintang.

### 5. Arketipe Rustic Bohemian & Pampas (8 Template)
*Karakter:* Kering, hangat, terracotta, pampas, makrame, kayu, dedaunan liar.
1. `rustic-wood`: Buket bunga kering sage (`centerpiece-bouquet-sage-01.svg`) + divider ranting kayu.
2. `boho-terracotta`: Side cascade terracotta (`cascade-side-terracotta-01.svg`) + divider anyaman tali.
3. `pampas-grass`: Rumput pampas melengkung mekar + border kartu serat alami + divider malai rumput.
4. `vintage-kraft`: Tekstur kertas kraft berpori + aksen stempel pos retro + divider jahitan benang.
5. `rustic-macrame`: Sulur makrame rumbai simpul geometris + divider gantung rami.
6. `wildflower-meadow`: Bunga liar padang rumput aneka warna + divider kelopak daun melayang.
7. `desert-dune`: Bukit pasir meliuk hangat + cascade daun palem kering + divider garis pasir.
8. `warm-amber`: Kaca amber hangat berhias pampas + divider ranting berdaun cokelat keemasan.

### 6. Arketipe Cute Illustrated Maps & Storybook (8 Template)
*Karakter:* Hangat, pastel, doodle manis, ramah keluarga, ikon navigasi Kebumen imut.
1. `storybook-garden`: Buket cat air pastel melingkar + divider jalan setapak berumput.
2. `pastel-watercolor`: Sapuan kuas cat air persik & mint + divider cipratan cat lembut.
3. `whimsical-bloom`: Bunga doodle kartun tersenyum + border kartu awan lembut.
4. `cozy-cottage`: Siluet rumah pedesaan manis + divider pagar kayu mini berhias bunga.
5. `charming-doodle`: Garis doodle cinta spontan + divider pita berpita simpul lucu.
6. `playful-meadow`: Kupu-kupu kartun & kumbang kecil + divider ranting berdaun mungil.
7. `fairytale-dream`: Kastel impian cat air + divider bintang kartun berkelap-kelip.
8. `sweet-wonder`: Ikon balon & kado manis (`icons/events/`) + kartu bersudut membulat lembut.

---

## 4. Rencana Integrasi Mesin Template (Engine Dispatchers)

Masing-masing dari 6 berkas engine berikut akan diperbarui untuk mengonsumsi `THEME_ASSET_REGISTRY`:
- `src/components/templates/engines/IslamicEngine.tsx`
- `src/components/templates/engines/MinimalistEngine.tsx`
- `src/components/templates/engines/RoseGoldEngine.tsx`
- `src/components/templates/engines/CelestialEngine.tsx`
- `src/components/templates/engines/RusticEngine.tsx`
- `src/components/templates/engines/CuteIllustratedEngine.tsx`

Setiap engine akan:
1. Mengambil `const assetBundle = THEME_ASSET_REGISTRY[theme.id] || DEFAULT_ARCHETYPE_FALLBACK[archetypeId]`.
2. Menyuntikkan `assetBundle.heroCenterpiece` dan `assetBundle.sectionDivider` ke Section Hero.
3. Menyuntikkan `assetBundle.cornerFiligree` pada kartu dan kontainer utama.
4. Membagikan divider di antara dispatcher babak (Akad, Resepsi, Kisah Cinta, Galeri).
5. Menyematkan `assetBundle.closingSeal` pada gerbang penutup undangan.

---

## 5. Rencana Verifikasi & Testing

1. **Skrip Verifikasi Otomatis (`scripts/verify_theme_asset_registry.js`):**
   - Menguji ke-64 pemetaan template pada `THEME_ASSET_REGISTRY`.
   - Menjamin 100% path aset yang tertera benar-benar ada di `public/harikita-assets/` dengan ukuran > 0 byte.
   - Menguji tidak ada duplikasi kunci tema atau ID yang hilang.
2. **Kompilasi TypeScript (`npx tsc --noEmit`):**
   - Menjamin tidak ada type mismatch, missing props, atau lint error.
3. **Smoke Test Render Antarmuka:**
   - Memastikan contoh template dari masing-masing 6 arketipe berhasil merender ornamen SVG secara mulus dan responsif di resolusi layar mobile (375px) dan desktop (>1024px).
