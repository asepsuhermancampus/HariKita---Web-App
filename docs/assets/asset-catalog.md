# HariKita Asset Catalog & Architecture Guide

## 1. Dokumentasi Handover: Status Pemurnian Aset & Catatan Perbaikan
> [!IMPORTANT]
> **Status Handover (12 September 2026):**
> * Seluruh 243 aset visual HariKita telah diekstrak secara autentik dan dimurnikan menggunakan pipeline Connected Component Labeling (CCL) dengan *boundary gap isolation*.
> * **Zero Bleed:** Isu kebocoran elemen tetangga (seperti potongan bunga dari kartu tetangga pada `botanical-22.svg` dan bunga lili pada `botanical-23.svg`) telah berhasil dibersihkan 100%. Setiap card di showcase hanya menampilkan tepat 1 subjek independen.
> * **Manual Review Ready:** Dokumen serah terima dan tabel checklist untuk pemeriksaan manual User tersedia lengkap di [HANDOVER_ASSET_PURIFICATION.md](file:///docs/assets/HANDOVER_ASSET_PURIFICATION.md).

---

## 2. Ikhtisar Arsitektur Aset Visual
Aset visual HariKita dibangun untuk merefleksikan keanggunan floral botanical dan ornamen *fine-line luxury* yang menyempurnakan portofolio vendor pernikahan Kebumen.

* **Lokasi Root:** `public/assets/harikita/`
* **Total Aset Terdaftar:** 243 aset visual autentik
* **Standar Vektor XML/SVG:**
  * Semua SVG menggunakan `stroke="currentColor"` atau `fill="currentColor"` agar warna garis dapat diatur secara dinamis melalui kelas Tailwind CSS (`text-hk-taupe`, `text-hk-charcoal`, `text-hk-champagne`).
  * Seluruh garis menggunakan atribut `vector-effect="non-scaling-stroke"` agar ketebalan garis tetap konsisten dan halus saat diperbesar/diperkecil di berbagai resolusi layar.
  * Bersih dari atribut editor (*Inkscape*, *Illustrator*, atau *Canva* metadata).

---

## 3. Rincian 17 Kategori Aset Visual (243 Aset)

| Kategori | Path Direktori | Jumlah | Format | Deskripsi & Kegunaan |
| :--- | :--- | :---: | :---: | :--- |
| **Cards** | `cards/` | 14 | SVG | Template visual kartu undangan digital berbasis 8 arketipe |
| **Ornaments** | `ornaments/` | 32 | SVG | 16 circular floral wreaths & 16 square botanical frames (pure, zero bleed) |
| **Flowers: Single Stem** | `flowers/single-stem/` | 24 | SVG | Ilustrasi bunga tangkai tunggal elegan (mawar, tulip, melati) |
| **Flowers: Blooms** | `flowers/blooms/` | 16 | SVG | Kelopak bunga mekar simetris untuk aksen tengah / header |
| **Flowers: Accents** | `flowers/accents/` | 12 | SVG | Kuncup bunga halus dan ornamen mikro floral |
| **Leaves: Branches** | `leaves/branches/` | 12 | SVG | Ranting zaitun / daun panjang untuk pembungkus teks |
| **Leaves: Sprigs** | `leaves/sprigs/` | 16 | SVG | Ranting daun kecil untuk ornamen tepi |
| **Leaves: Stems** | `leaves/stems/` | 10 | SVG | Tangkai daun vertikal untuk pembatas kolom |
| **Lines & Dividers** | `lines/` | 21 | SVG | Garis pemisah konten dengan aksen simpul pita, diamond, dan loop |
| **Custom Icons** | `icons/` | 20 | SVG | Ikon konsep khusus HariKita (Dua Mempelai, Love Story, Seserahan, dll) |
| **Corners** | `corners/` | 12 | SVG | Ornamen sudut kartu undangan, frame foto, dan modal dialog |
| **Compositions** | `compositions/` | 16 | SVG | Aransemen floral gabungan untuk hero background dan kartu undangan |
| **Abstract Symbols** | `abstract/` | 14 | SVG | Simbol geometris minimalis (bintang 4-titik, cincin, diamond) |
| **Decorative** | `decorative/` | 14 | SVG | Wax seal, stempel pos vintage, frame arch, badge status |
| **Patterns** | `patterns/` | 8 | SVG | Pola berulang mulus (*seamless pattern*) untuk latar belakang |
| **Textures** | `textures/` | 6 | WebP | Tekstur kertas handmade & linen beresolusi tinggi (light & dark) |
| **Avatars** | `avatars/` | 6 | SVG | Profil avatar sosial berbasis monogram logo resmi HariKita |

---

## 4. Integrasi Kode & TypeScript Helper Library

Semua aset terindeks dalam manifest typed JSON dan dapat diakses dengan mudah via modul helper:
* **Tipe Data:** `src/types/harikita-asset.ts`
* **Manifest JSON:** `src/data/harikita-assets.json`
* **Helper Library:** `src/lib/harikita-assets.ts`

### Contoh Penggunaan dalam Komponen React:

```tsx
import Image from 'next/image';
import { getAssetsByCategory, getAssetById } from '@/lib/harikita-assets';

// Mengambil semua bunga tangkai tunggal
const flowerAssets = getAssetsByCategory('flowers-single-stem');

// Mengambil aset ornamen bingkai kotak murni
const frame23 = getAssetById('botanical-23');

export function FloralBanner() {
  return (
    <div className="flex items-center gap-4 text-hk-taupe">
      {/* Warna stroke akan otomatis mewarisi text-hk-taupe */}
      <img
        src="/assets/harikita/ornaments/botanical-23.svg"
        alt="Botanical Square Frame"
        className="h-16 w-16 text-current"
      />
      <h3 className="font-editorial text-xl">Rangkai Hari Bahagiamu</h3>
    </div>
  );
}
```
