# Design Specification: HariKita Custom Invitation Studio & Design System Overhaul

- **Project:** HariKita (Hyperlocal Wedding & Engagement Platform Kebumen)
- **Document Date:** 2026-09-13
- **Author:** Antigravity AI Pair Programmer & Lead Product Architect
- **Status:** Approved Architecture Specification
- **Path:** `docs/superpowers/specs/2026-09-13-invitation-ds-custom-studio-design.md`

---

## 1. Executive Summary & Product Mission

HariKita adalah platform pernikahan dan lamaran hibrida berakar lokal di Kabupaten Kebumen, Jawa Tengah, dengan komitmen menghadirkan keanggunan visual tingkat tinggi (*Cashmere Alabaster, Gilded Champagne, Deep Plum Charcoal*).

Spesifikasi ini menetapkan perombakan arsitektur modul **Undangan Digital Design System (DS)** dari showcase komponen bertumpuk menjadi **Studio Racik Undangan Kustom (Split-Screen Studio)**. Sistem ini memberdayakan calon pengantin untuk meracik undangan impian secara bebas (*mix-and-match*) lintas template arketipe, dengan jaminan bahwa setiap hasil racikan selalu tampil anggun, proporsional, eksklusif, responsif 100% di semua smartphone, dan bebas dari kejanggalan visual melalui sistem *Visual Guardrails*.

---

## 2. Urutan 11 Section Undangan Sistematis & Elegan

Hierarki urutan section dirancang secara ketat memadukan etika kesantunan adat (khususnya adat Jawa Kebumen) dan ergonomi antarmuka digital mobile:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Cover & Gatekeeper (Amplop Digital + 3D Wax Seal)        │ ──► Sakralitas, privasi personal (?to=...), audio unlock
├─────────────────────────────────────────────────────────────┤
│ 2. Muqaddimah & Salam Pembuka (Basmalah & Kutipan Suci)      │ ──► Landasan spiritual & kesantunan keluarga
├─────────────────────────────────────────────────────────────┤
│ 3. The Bride & The Groom (Profil Mempelai & Orang Tua)      │ ──► 8 varian arketipe eksklusif & berkarakter
├─────────────────────────────────────────────────────────────┤
│ 4. Love Story / Milestone Timeline (Kisah Cinta Puitis)     │ ──► Ikatan emosional perjalanan kedua mempelai
├─────────────────────────────────────────────────────────────┤
│ 5. Rangkaian Acara (Akad Nikah & Resepsi + Calendar)        │ ──► Kepastian tanggal, jam WIB, countdown timer
├─────────────────────────────────────────────────────────────┤
│ 6. Lokasi Acara & Navigasi Cerdas (Smart Venue & QR Maps)   │ ──► Peta Kebumen, tombol Waze/GMaps, QR navigasi ponsel
├─────────────────────────────────────────────────────────────┤
│ 7. Galeri Pre-wedding & Sinematik (Visual Showcase)         │ ──► 8 gaya tampilan foto/video pre-wedding
├─────────────────────────────────────────────────────────────┤
│ 8. Tanda Kasih & Rekening Bank (Murni Hadiah/Kado)          │ ──► Rekening bank resmi (salin 1-klik) & alamat kado
├─────────────────────────────────────────────────────────────┤
│ 9. Buku Tamu, RSVP & Doa Restu (Interaksi Tamu)             │ ──► Form kehadiran berdasar sesi & papan doa restu
├─────────────────────────────────────────────────────────────┤
│ 10. Protokol Acara & Panduan Busana (Dresscode & Adab)      │ ──► Himbauan warna pakaian & tata krama acara
├─────────────────────────────────────────────────────────────┤
│ 11. Penutup Puitis & Takzim Keluarga Besar                  │ ──► Salam syukur kedua keluarga & footer HariKita
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Arsitektur 8 Varian Kartu "The Bride & The Groom"

Setiap arketipe dari 8 arketipe resmi HariKita memiliki desain kartu profil mempelai yang sepenuhnya independen dan berkarakter:

| No | Arketipe Induk | Nama Varian Kartu | Karakteristik Visual & Elemen Desain |
| :--- | :--- | :--- | :--- |
| 1 | **Animated Motion** | *Floating Soft Glass Cards* | Permukaan kaca berembun, badge inisial modern dengan animasi pendaran melingkar (*motion glow*), susunan dinamis mengambang. |
| 2 | **Minimalist Typographic** | *Editorial Serif Monolith* | Format majalah seni tinggi (*Kinfolk/Vogue*), tipografi serif monumental, tata letak teks asimetris elegan, foto *soft duotone*. |
| 3 | **Fullscreen Prewed Photo** | *Cinematic Vertical Split* | Potret vertikal penuh layar (*full-bleed*) dengan gradasi bayangan dramatis di bagian bawah dan teks overlay berkilau emas. |
| 4 | **Romantic Botanical** | *Twin Arches Floral* | Bingkai lengkungan kubah kembar organik khas flora tropis Kebumen, dibalut dedaunan halus di sudut lengkungan. |
| 5 | **Syar'i & Islamic Heritage** | *Mihrab Arch Arabesque* | Kubah lengkung arsitektur mihrab masjid yang teduh, hiasan ornamen arabesque simetris, tata letak anggun menjaga kesantunan. |
| 6 | **Traditional Cultural Adat** | *Javanese Gunungan & Ukiran* | Bingkai berpola ukiran klasik Jawa sogan, inisial aksara Jawa halus, dan ornamen gunungan wayang Kebumen. |
| 7 | **Royal Foil & Wax Seal 3D** | *Vintage Royal Medallion* | Bingkai oval bertekstur emas timbul (*gilded gold foil*), pita virtual berbayangan nyata dengan cap segel lilin monogram 3D. |
| 8 | **Modern Intimate / Event** | *Polaroid Scrapbook & Stamp* | Format kartu foto polaroid dengan rotasi miring alami (3°), aksen solasi/stempel pos Kebumen yang hangat dan akrab. |

---

## 4. Pemisahan Rekening Bank & Transformasi QRIS Menjadi Smart Location Card

### 4.1. Kartu Rekening Bank Murni (Digital Gift & Kado Fisik)
* **Tujuan:** Menjaga kesantunan dan kehormatan tanda kasih tanpa bercampur aduk dengan QRIS komersial.
* **Fitur:**
  * Kartu rekening bank resmi (BCA, Mandiri, BRI, BSI) dengan badge bank terverifikasi.
  * Tombol interaktif "Salin Rekening" dengan transisi status "Tersalin!" (ikon centang hijau zamrud).
  * Kartu alamat pengiriman kado fisik di Kebumen lengkap dengan tombol salin alamat lengkap.

### 4.2. Smart Location Card (Transformasi dari QRIS Generator)
* **Tujuan:** Memberikan kemudahan navigasi rute fisik ke lokasi acara di Kebumen bagi para tamu.
* **Fitur:**
  * **Venue & Alamat:** Nama gedung/kediaman, jalan, kecamatan, dan kabupaten Kebumen.
  * **Tombol Navigasi Instan:** Buka langsung di Google Maps atau Waze.
  * **QR Code Navigasi Lokasi Real-time:** Menampilkan QR Code dinamis yang menampung deep-link navigasi Google Maps. Tamu yang membuka undangan di laptop atau tablet dapat memindai QR code ini dengan smartphone mereka untuk seketika memulai navigasi GPS tanpa perlu mengetik ulang alamat.

---

## 5. Mesin Normalisasi Pewarnaan SVG Dinamis & Palet Kurasi

### 5.1. Akar Masalah & Mekanisme Normalizer (`DynamicSvgRenderer`)
* **Masalah:** Aset SVG pihak ketiga memiliki atribut `stroke="#..."` atau `fill="#..."` hardcoded di elemen internal (`<path>`, `<circle>`, `<g>`), sehingga kelas warna pembungkus `text-*` tidak tembus.
* **Solusi Normalizer:**
  * Parser memproses konten SVG secara aman:
    * Mengganti `stroke="[nilai-apapun]"` (selain `none`) menjadi `stroke="currentColor"`.
    * Mengganti `fill="[nilai-apapun]"` (selain `none` dan `url(...)`) menjadi `fill="currentColor"`.
  * Penambahan CSS Utility selektor bertingkat:
    `[&_path]:stroke-current [&_circle]:stroke-current [&_rect]:stroke-current [&_line]:stroke-current [&_polygon]:stroke-current [&_polyline]:stroke-current`.
  * Hasil: **100% dari 254 aset visual patuh seketika** terhadap warna yang dipilih pengguna.

### 5.2. Palet 12 Warna Kurasi HariKita
1. *HariKita Taupe* (`#88735B`) - Karakter hangat, bersahaja, timeless.
2. *Gilded Gold* (`#C5A880`) - Kemewahan kerajaan, kilau emas lembut.
3. *Deep Plum Charcoal* (`#4A2E35`) - Kontras berwibawa, kedalaman emosional.
4. *Champagne Surface* (`#F3EDE6`) - Lembut, bersih, bercahaya.
5. *Botanical Sage* (`#5B6E58`) - Kesegaran alam tropis, damai.
6. *Javanese Sogan* (`#5A3825`) - Adiluhung adat keraton Jawa.
7. *Islamic Emerald* (`#2C4A3E`) - Nuansa teduh, hijau permata islami.
8. *Rose Gold Copper* (`#C07D6D`) - Sentuhan romantis modern, manis.
9. *Rustic Terracotta* (`#A35D43`) - Kehangatan tanah liat alami, bohemian chic.
10. *Celestial Midnight* (`#1E2638`) - Kedalaman malam berbintang Pantai Menganti.
11. *Coral Peach* (`#D97352`) - Keceriaan cerah, akrab, berseri.
12. *Olive Woodland* (`#6B705C`) - Ranting zaitun keabadian, bersahaja.

---

## 6. Tata Letak Split Studio (Undangan DS)

Tata letak antarmuka di `src/app/design-system-showcase/` dirancang dengan arsitektur split terpadu:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ NAVBAR SHOWCASE: HariKita Design System (Tab: Undangan DS Studio)          │
├─────────────────────────────────────────────────────────────────────────────┤
│ HEADER: Undangan Digital Custom Studio (Mode Racik Bebas & Matriks Aset)   │
├────────────────────────────────────────┬────────────────────────────────────┤
│ PANEL KONTROL RACIKAN (65% LEBAR LAYAR)│ STICKY SMARTPHONE PREVIEW (35%)    │
│ (Scrollable, Bertahap Sistematis)      │ (Fixed top-24, Tidak Ikut Scroll)  │
│                                        │                                    │
│ 1. Arketipe Bawaan & Palet 12 Warna    │ [Device Switcher: iPhone 15 Pro ▼] │
│ 2. Gaya Penataan Posisi Aset (10 Gaya) │ ┌────────────────────────────────┐ │
│ 3. Slot Penukaran Aset (6 Zona Kurasi) │ │ [Notch / Dynamic Island]       │ │
│ 4. Pemilih Varian Section:             │ │                                │ │
│    • Cover & Gatekeeper                │ │  LIVE HASIL RACIKAN UNDANGAN   │ │
│    • 8 Varian The Bride & Groom        │ │  (Scrollable di dalam bezel,   │ │
│    • Rangkaian Acara                   │ │   animasi & warna terupdate    │ │
│    • Smart Location & Maps QR          │ │   seketika tanpa jeda)         │ │
│    • 8 Varian Galeri Pre-wedding       │ │                                │ │
│    • Rekening Bank & Kado Murni        │ │                                │ │
│    • Buku Tamu RSVP & Doa Restu        │ │                                │ │
│ 5. Kontrol 15 Efek Optik & 15 Animasi  │ └────────────────────────────────┘ │
└────────────────────────────────────────┴────────────────────────────────────┘
```

### Multi-Device Frame Selector
Pengguna dapat menguji tampilan pada 5 profil viewport smartphone:
1. **iPhone 15 Pro** (393 × 852 px, bezel membulat modern + Dynamic Island).
2. **iPhone SE / Compact** (375 × 667 px, home button, layar kompak).
3. **Samsung Galaxy S24** (412 × 915 px, punch hole camera, bezel ultra-tipis).
4. **Google Pixel 8** (412 × 892 px, rounded corner khas Android).
5. **Large Viewport Max** (430 × 932 px, pengujian resolusi layar terbesar).

---

## 7. Sistem 10 Gaya Penataan Posisi Aset & Morfologi Visual

### 7.1. Taksonomi Morfologi 254 Aset Visual
Setiap aset di repositori HariKita diklasifikasikan ke dalam tipe morfologi geometris:
1. **Linear Horizontal (`lines/`, 21 aset):** Rasio ~10:1. Khusus untuk pembatas section dan garis bawah judul.
2. **Corner Orthogonal (`corners/`, 8 aset):** Rasio 1:1 sudut siku. Khusus untuk 4 sudut amplop cover dan kartu profil.
3. **Arch & Enclosure (`cards/`, 14 aset):** Rasio vertikal 3:4/9:16. Khusus untuk bingkai foto mempelai dan jadwal acara.
4. **Curving Branch (`leaves/branches`, `compositions`, 20 aset):** Rasio diagonal 2:1. Khusus memeluk foto (*hugging*).
5. **Tall Single-Stem (`flowers/single-stem`, 34 aset):** Rasio tegak 1:3. Khusus untuk margin samping teks kutipan/jadwal.
6. **Radial Medallion (`ornaments/`, 71 aset):** Rasio simetris 1:1. Khusus untuk lencana monogram, centerpiece, dan tailpiece.
7. **Fine-Line Icons (`icons/`, 50 aset):** Ukuran kompak 24–48px. Khusus penanda jam, kalender, bank, dan peta.
8. **Surface Atmosphere (`textures/`, 20 aset):** Kanvas penuh. Khusus lapisan latar belakang (opasitas 4%–6%).

### 7.2. 10 Gaya Komposisi Posisi Aset
1. **Royal Symmetrical Crest:** Keagungan simetris lencana tengah, garis flourish simetris, dan tailpiece mahkota.
2. **Botanical Garland Hug:** Ranting lengkung memeluk foto pengantin dan kartu jadwal acara secara organik.
3. **Asymmetric Editorial Vogue:** Tata letak majalah seni tinggi, monogram kiri atas, single-stem tegak di margin kiri.
4. **Heritage Gunungan Adat:** Puncak gunungan wayang Kebumen, sudut ukiran sogan, dan garis pembatas aksara Jawa.
5. **Architectural Mihrab Syar'i:** Kubah lengkung islami teduh, ornamen arabesque suci, dan pilar ornamen kaki.
6. **Twin Arch Enclosed:** Bingkai kubah ganda berjejer membungkus foto kedua mempelai secara arsitektural.
7. **Corner Flourish Baroque:** 4 sudut ukiran kartu fisik klasik dipadu segel lilin monogram 3D di tengah.
8. **Minimalist Stems & Airy:** Ruang napas visual luas, satu tangkai bunga tipis di samping ayat & aksen diamond halus.
9. **Celestial Diagonal Flow:** Aliran ornamen diagonal dari kiri-bawah ke kanan-atas bernuansa malam sakral Menganti.
10. **Postage & Seal Ribbon:** Aksen pita vertikal surat cinta vintage, garis perangko, dan stempel cap pos inisial.

### 7.3. Sistem Visual Guardrails
* **Smart Slot Auto-Filter:** Saat pengguna mengklik slot "Garis Pembatas", sistem HANYA memfilter kategori `lines`. Aset yang tidak cocok secara geometris otomatis tidak ditampilkan pada slot tersebut.
* **Indikator Harmoni Visual:** Lencana status (🟢 *Harmoni Sempurna*, 🟡 *Eksplorasi Alternatif*, 🔒 *Dilindungi Sistem*).
* **Golden Ratio Auto-Scaling:** Skala aset dikunci otomatis menggunakan batas aman CSS viewport (`clamp(...)`) agar tidak pernah menabrak teks atau menyebabkan *horizontal overflow*.

---

## 8. Sistem 15 Efek Visual & 15 Animasi Mikro

### 8.1. 15 Efek Visual & Optik Mewah (Hardware-Accelerated)
1. **Specular Gold Foil Shimmer:** Kilau pantulan cahaya diagonal tipis melintas di atas lencana emas tiap 7 detik.
2. **Frosted Crystal Glassmorphism:** Permukaan `backdrop-blur-md` dengan latar putih susu hangat transparan 88%.
3. **Inner Gilded Rim Light:** Garis tepi 1px dengan gradasi emas sampanye menangkap bias cahaya dinamis.
4. **Authentic Cotton Paper Texture:** Lapisan serat kertas fisik mewah (opasitas 4%–6%) bertekstur 600 gsm.
5. **Ambient Floating Petals / Gold Dust:** Partikel kelopak bunga melati atau debu emas melayang lembut di latar belakang.
6. **Radial Vignette Focus-Depth:** Gradasi lembut di tepi layar yang memusatkan fokus penglihatan ke inti kartu.
7. **Embossed Letterpress:** Bayangan mikro 1px pada inisial yang memberi ilusi cetakan mesin press timbul.
8. **Dew Droplet Condensation:** Pantulan cahaya titik embun pagi pada ornamen daun tropis Kebumen.
9. **Gilded Edge Bevel 3D:** Efek sudut kartu melengkung tebal dengan gradasi bevel 3D bertepi emas.
10. **Soft Warm Film Grain:** Filter foto pre-wedding berkarakter hangat, kontras seimbang, dan tekstur film vintage puitis.
11. **Ambient Aurora Halo Glow:** Pendaran cahaya pastel hangat yang berpendar lembut di balik foto mempelai.
12. **Physical Drop-Shadow Depth:** Bayangan bertingkat di bawah pita dan segel lilin memberi ilusi benda fisik nyata.
13. **Monochromatic Adat Sogan Vignette:** Nuansa warna sepia-sogan klasik dengan batas gradasi lembut untuk arketipe tradisional.
14. **Star Dust Twinkle:** Kilauan 4-titik mikro pada cincin atau inisial nama yang berkedip sangat lembut.
15. **Lens Bokeh Blur Transition:** Latar belakang mengalami blur lembut seperti bukaan lensa kamera f/1.4 saat modal terbuka.

### 8.2. 15 Animasi Mikro & Interaksi Elegan (60 FPS CSS GPU)
1. **SVG Calligraphic Path Draw:** Ornamen garis dan bunga terlukis dinamis saat di-scroll via `stroke-dashoffset`.
2. **Gentle Botanical Sway:** Aset ranting dan dedaunan mengayun lembut 1.5° dengan ritme lambat 5.5 detik.
3. **Staggered Narrative Reveal:** Elemen muncul berurutan (Header ➔ Lencana ➔ Judul ➔ Garis ➔ Foto ➔ Teks).
4. **3D Gatefold Wax Seal Opening:** Animasi membuka lipatan amplop 3D ke samping saat segel lilin ditekan.
5. **Slow Heartbeat Pulse:** Monogram inisial dan ikon cincin berdenyut tenang (scale 1.0 ke 1.028).
6. **Parallax Portrait Depth:** Foto pengantin bergeser dengan kecepatan 0.15x relatif terhadap bingkainya saat digulir.
7. **Smooth Inertia Tilt:** Kartu merespons sentuhan jempol dengan sudut kemiringan perspektif 3D maksimal 3°.
8. **Live Countdown Number Ticker:** Angka hitung mundur hari H berputar mulus saat pertama kali terlihat di layar.
9. **Floating Music Equalizer Bar:** Gelombang nada pengiring bernuansa akustik/gamelan bergetar lembut di sudut layar.
10. **Doa Restu Petal Burst on RSVP:** Letupan partikel kelopak bunga melati mikro yang anggun saat tamu mengirim doa.
11. **Elastic Wax Press Response:** Sensasi penekanan fisik segel lilin (*scale 0.94*) sebelum merekah memancarkan cahaya emas.
12. **Cubic-Bezier Anchor Glide:** Perpindahan antar-section menggunakan kurva perlambatan sutra (`cubic-bezier(0.25, 1, 0.5, 1)`).
13. **Fluid Accordion Unfold:** Pemekaran kartu rincian acara secara cair dan natural tanpa patah-patah.
14. **Infinite Puitis Story Marquee:** Teks kata mutiara mengalir tenang horizontal tanpa putus di sela transisi section.
15. **Morphing Copy-to-Clipboard:** Ikon salin rekening bertransformasi mulus menjadi tanda centang hijau zamrud (*micro-spring*).

---

## 9. Struktur Komponen & Berkas Implementasi

```
src/app/design-system-showcase/
├── components/
│   ├── invitation-hub/
│   │   ├── InvitationHubView.tsx            ──► Mengadopsi Split-Screen Layout Studio (65:35)
│   │   ├── studio/
│   │   │   ├── InvitationStudioBuilder.tsx  ──► Panel Kontrol Racik Kiri (65%)
│   │   │   ├── InvitationDevicePreview.tsx  ──► Sticky Smartphone Preview Kanan (35%)
│   │   │   ├── DeviceFrameContainer.tsx     ──► Bezel 5 model HP (iPhone 15 Pro, SE, S24, Pixel 8, Max)
│   │   │   ├── DynamicSvgRenderer.tsx       ──► Mesin Normalisasi SVG currentColor & auto-recolor
│   │   │   ├── VisualEffectsLayer.tsx       ──► Layer 15 Efek Optik & 15 Animasi Mikro
│   │   │   └── sections/
│   │   │       ├── StudioGatekeeperCover.tsx──► Section 1: Cover & Wax Seal
│   │   │       ├── StudioMuqaddimah.tsx     ──► Section 2: Basmalah & Doa
│   │   │       ├── StudioCoupleSection.tsx  ──► Section 3: 8 Varian The Bride & Groom
│   │   │       ├── StudioLoveStory.tsx      ──► Section 4: Milestone Timeline
│   │   │       ├── StudioEventSchedule.tsx  ──► Section 5: Akad & Resepsi
│   │   │       ├── StudioLocationCard.tsx   ──► Section 6: Smart Location & Maps QR
│   │   │       ├── StudioGallerySection.tsx ──► Section 7: 8 Varian Galeri Foto
│   │   │       ├── StudioBankGiftSection.tsx──► Section 8: Rekening Murni & Kado
│   │   │       ├── StudioGuestbookRsvp.tsx  ──► Section 9: RSVP & Doa
│   │   │       ├── StudioDresscodeEtiquette.tsx ► Section 10: Panduan Busana
│   │   │       └── StudioClosingFamily.tsx  ──► Section 11: Penutup & Keluarga
│   │   ├── ArchetypesMatrixSection.tsx      ──► Referensi 8 Arketipe Induk
│   │   └── InvitationAssetCatalogSection.tsx──► Katalog 254 Aset Lengkap
├── data/
│   └── mock-invitation-sandbox.ts           ──► Data dummy komprehensif Kebumen
└── types/
    └── invitation-studio.ts                 ──► Tipe data konfigurasi racikan kustom
```

---

## 10. Rencana Verifikasi & Penjaminan Kualitas

1. **Pengujian Responsivitas Multi-Device:**
   * Pengujian frame 375px (iPhone SE), 393px (iPhone 15 Pro), 412px (Galaxy S24 / Pixel 8), dan 430px (Pro Max).
   * Memastikan nol *horizontal overflow* (`overflow-x: hidden` & fluid spacing).
2. **Pengujian Pewarnaan Aset SVG Dinamis:**
   * Pengujian ke-12 swatch warna terhadap aset dari kategori `lines`, `corners`, `cards`, `flowers`, `leaves`, dan `ornaments`.
   * Memastikan seluruh path SVG berubah warna secara serentak.
3. **Pengujian Switch 8 Varian Mempelai:**
   * Memastikan masing-masing dari ke-8 varian kartu mempelai merender data kedua pengantin dan orang tua tanpa glitch visual.
4. **Pengujian Transformasi QRIS ke Location Card:**
   * Verifikasi tombol buka Google Maps & Waze dan rendering QR code navigasi lokasi Kebumen.
5. **Pengujian Salin Rekening:**
   * Menekan tombol salin nomor rekening dan memastikan teks berhasil tersalin ke clipboard serta status UI berubah menjadi sukses.
6. **Performa & Animasi (60 FPS):**
   * Verifikasi beban animasi CSS GPU agar tetap ringan, sejuk di perangkat pengguna, dan tidak ada frame drop.
