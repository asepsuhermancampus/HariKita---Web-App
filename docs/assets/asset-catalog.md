# HariKita Asset Catalog & Architecture Guide

## 1. Ikhtisar Arsitektur Aset Visual
Aset visual HariKita dibangun untuk merefleksikan keanggunan floral botanical dan ornamen *fine-line luxury* yang menyempurnakan portofolio vendor pernikahan Kebumen.

* **Lokasi Root:** `public/assets/harikita/`
* **Total Aset Terdaftar:** 134 aset visual
* **Standar Vektor XML/SVG:**
  * Semua SVG menggunakan `stroke="currentColor"` agar warna garis dapat diatur secara dinamis melalui kelas Tailwind CSS (`text-hk-taupe`, `text-hk-charcoal`, `text-hk-champagne`).
  * Seluruh garis menggunakan atribut `vector-effect="non-scaling-stroke"` agar ketebalan garis tetap konsisten dan halus saat diperbesar/diperkecil di berbagai resolusi layar.
  * Bersih dari atribut editor (*Inkscape*, *Illustrator*, atau *Canva* metadata).

---

## 2. Rincian 17 Kategori Aset Visual

| Kategori | Path Direktori | Jumlah | Format | Deskripsi & Kegunaan |
| :--- | :--- | :--- | :--- | :--- |
| **Ornaments** | `ornaments/` | 12 | SVG | Botanical filigree, motif dedaunan, aksen kepala bagian |
| **Lines & Dividers** | `lines/` | 12 | SVG | Garis pemisah konten dengan aksen diamond, loop, dan botanical |
| **Corners** | `corners/` | 8 | SVG | Ornamen sudut kartu undangan, frame foto, dan modal dialog |
| **Abstract Symbols** | `abstract/` | 10 | SVG | Simbol geometris minimalis (bintang 4-titik, cincin, diamond) |
| **Flowers: Single Stem** | `flowers/single-stem/` | 12 | SVG | Ilustrasi bunga tangkai tunggal elegan (mawar, tulip, melati) |
| **Flowers: Blooms** | `flowers/blooms/` | 6 | SVG | Kelopak bunga mekar simetris untuk aksen tengah / header |
| **Flowers: Accents** | `flowers/accents/` | 6 | SVG | Kuncup bunga halus dan ornamen mikro floral |
| **Leaves: Sprigs** | `leaves/sprigs/` | 8 | SVG | Ranting daun kecil untuk ornamen tepi |
| **Leaves: Branches** | `leaves/branches/` | 4 | SVG | Ranting zaitun / daun panjang untuk pembungkus teks |
| **Leaves: Stems** | `leaves/stems/` | 4 | SVG | Tangkai daun vertikal untuk pembatas kolom |
| **Compositions** | `compositions/` | 8 | SVG | Aransemen floral gabungan untuk hero background dan kartu undangan |
| **Patterns** | `patterns/` | 8 | SVG | Pola berulang mulus (*seamless pattern*) untuk latar belakang |
| **Textures** | `textures/` | 4 | WebP | Tekstur kertas handmade & linen beresolusi tinggi (light & dark) |
| **Icons** | `icons/` | 6 | SVG | Ikon konsep khusus HariKita (Dua Mempelai, Love Story, dll) |
| **Decorative** | `decorative/` | 12 | SVG | Wax seal, stempel pos vintage, frame arch, badge status |
| **Cards** | `cards/` | 8 | SVG | Template visual kartu undangan digital berbasis 8 arketipe |
| **Avatars** | `avatars/` | 6 | SVG | Profil avatar sosial berbasis monogram logo resmi HariKita |

---

## 3. Integrasi Kode & TypeScript Helper Library

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

// Mengambil aset dekoratif tertentu
const waxSeal = getAssetById('decorative-wax-seal-hk');

export function FloralBanner() {
  return (
    <div className="flex items-center gap-4 text-hk-taupe">
      {/* Warna stroke akan otomatis mewarisi text-hk-taupe */}
      <img
        src="/assets/harikita/ornaments/botanical-01.svg"
        alt="Botanical Ornament"
        className="h-8 w-8 text-current"
      />
      <h3 className="font-editorial text-xl">Rangkai Hari Bahagiamu</h3>
    </div>
  );
}
```
