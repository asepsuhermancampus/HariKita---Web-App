# 📁 Referensi Desain Undangan AWH (Assets Harvest)
> Sumber: `https://undangan.awh.co.id/select-theme?type=wedding&theme=lite`  
> Diunduh: 11 September 2026

Direktori ini berisi seluruh aset referensi visual, tekstur background, dan sampel desain yang berhasil dipanen dari situs AWH untuk keperluan studi komparasi desain HariKita.

---

## 📂 Struktur Berkas

### 1. `covers/` (16 Tema Utama)
Pratinjau kartu cover dari setiap tema yang ada di katalog:
- `cover-lavenderhaven.png`
- `cover-terrahertitageessence.png`
- `cover-tropicalcocoa.png`
- `cover-follagebrown.png`
- `cover-fallenleave.png`
- `cover-madisonred.png`
- `cover-mistyreverie.png`
- `cover-nature.png`
- `cover-miracle.png`
- `cover-skymistazure.png`
- `cover-warmbrickember.png`
- `cover-leavyolive.png`
- `cover-goldensunnyleaf.png`
- `cover-fleurdejoy.png`
- `cover-sapphirebliss.png`
- `cover-larosegarden.png`

### 2. `backgrounds/` (16 Tekstur Full-Res)
Tekstur latar belakang utuh dengan resolusi tinggi (300KB - 850KB per file) untuk setiap tema.

### 3. `ornaments/`
Sampel media galeri, splash screen kartu mempelai, dan ornamen yang aktif pada server CDN live AWH.

---

## 💡 Catatan Teknis untuk Tim HariKita
- Sebagian ornamen frame lokal pada situs AWH (misal `grid-1.png` atau `Headline Frame.png`) menghasilkan status HTTP 404 pada server mereka sendiri karena inkonsistensi path internal CMS mereka.
- Ini membuktikan keunggulan arsitektur **Inline Vector React SVG (`.tsx`)** pada HariKita: **100% andal, 0 dependensi link eksternal, tajam di semua layar, dan tidak pernah 404!**
