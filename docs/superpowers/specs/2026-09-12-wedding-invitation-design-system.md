# Spesifikasi Desain Sistem & Arsitektur Komponen Undangan Pernikahan Mewah
**Basis Referensi:** *HariKita Visual Language & Living Style Guide (Kabupaten Kebumen)*  
**Target Output:** 8 Arketipe × 15–19 Template Unik (120+ Desain Sistem Mandiri Tanpa Efek Cookie-Cutter)  
**Dokumentasi:** `docs/superpowers/specs/2026-09-12-wedding-invitation-design-system.md`  
**Status:** Validated & Approved

---

## 1. Visi & Filosofi Sistem Desain

Sistem desain ini dirancang untuk menghadirkan platform undangan pernikahan digital kelas atas (*editorial luxury & hyperlocal craftsmanship*). Filosofi utamanya adalah **Bespoke Individuality (Anti Cookie-Cutter)**:
* Calon pengantin dan keluarga besar berhak mendapatkan undangan yang eksklusif, personal, dan mencerminkan kehormatan adat maupun selera modern mereka.
* Setiap template (dari total 120+ template yang terbagi ke dalam 8 arketipe) memiliki **Design System Mandiri**: geometri card yang khas, tipografi pendamping yang dikurasi, palet aksen turunan, serta interaksi mikro yang unik.
* Seluruh template tetap berlabuh pada standar mutu, keanggunan, dan ergonomi mobile dari bahasa visual resmi **HariKita**.

---

## 2. Fondasi Inti Bahasa Visual HariKita (Core Tokens)

### 2.1 Palet Warna Resmi (5-Color Palette)
| Nama Warna | Kode HEX | Nilai RGB | Peran Sistem Desain |
| :--- | :--- | :--- | :--- |
| **Charcoal** | `#2B2B2B` | `rgb(43, 43, 43)` | Teks primer, latar belakang section gelap mewah, aksen kontras tinggi |
| **Taupe** | `#88735B` | `rgb(136, 115, 91)` | Warna brand primer, tombol aksi utama, simbol resmi, stempel wax seal |
| **Champagne** | `#C9A88A` | `rgb(201, 168, 138)` | Garis batas halus (*hairline border*), outline, aksen foil metalik |
| **Soft Beige** | `#E8DED1` | `rgb(232, 222, 209)` | Garis pembatas (*dividers*), permukaan kartu sekunder, pill badge lembut |
| **Ivory** | `#F8F6F1` | `rgb(248, 246, 241)` | Kanvas latar belakang utama, kontainer kartu putih hangat |

### 2.2 Hirarki Tipografi Editorial Luxury
* **Display & Headings:** `Cormorant Garamond`
  * *Display Title:* 44px – 60px (Light / Medium) – Digunakan pada nama mempelai, cover, dan judul utama.
  * *Heading 2:* 32px – 36px (Regular / Italic) – Digunakan pada judul section dan nama bab.
  * *Editorial Italic:* 20px – 24px (Italic) – Digunakan pada kutipan puitis, pepatah adat, dan ayat suci.
* **UI, Data, & Body Text:** `Manrope`
  * *Button & Navigation:* 14px (Bold / Uppercase, letter-spacing 1.5px – 2px).
  * *Body Regular:* 14px – 15px (Regular / Medium, line-height 1.7 – 1.8) – Ergonomis untuk layar smartphone keluarga.
  * *Numerical Data & Badges:* 12px – 13px (Semibold) – Tanggal, countdown, nomor rekening, jam acara.

### 2.3 Sistem Aset Vektor Fine-Line (243 Aset Resmi)
* **Dividers & Lines (01–21):** Garis dekoratif beraksen *diamond center*, *symmetrical floral*, *minimal hairline*, dan *botanical knot*.
* **Borders & Arches (Frame Arch 01–02, Mask Arch 01, Card Invitation 01–14):** Bingkai lengkung arsitektural, sudut ornamen klasik, dan batas asimetris.
* **Botanical Ornaments (Botanical 01–32, Flower Accent 01–12, Single Stem 01–24, Leaf Sprig 01–16):** Ilustrasi botani garis halus yang melambangkan kesuburan, cinta, dan ketulusan.
* **Badges, Seals, & Stamps:** `Wax Seal Official Crest`, `Stamp Harikita EST. 2026`, `Badge Scalloped Rosette`, dan `VIP Crest`.
* **Ikonografi Tematik Pernikahan:** *Bridal Dress, Groom Attire, Wedding Rings, Ceremony Arch, Illustrated Map, Digital Invitation, Love Story, Seserahan Box, Souvenir Candle, Tiered Cake, Video Cinematic*.
* **Tekstur Lembut:** *Texture Linen Light/Dark, Texture Deckle Paper, Texture Canvas Woven, Texture Gold Foil, Texture Parchment Antique*.

---

## 3. Matriks 8 Arketipe & Aturan Desain Sistem Mandiri

Setiap arketipe memayungi 15–19 template. Aturan pembeda visual diterapkan pada **geometri kartu**, **warna aksen sekunder**, dan **karakter ornamen**:

```
                               ┌─────────────────────────────┐
                               │  Husa Brand: HariKita Core  │
                               │  (5 Warna, Cormorant/Manrope│
                               │   & 243 Fine-Line Vectors)  │
                               └──────────────┬──────────────┘
                                              │
    ┌──────────┬──────────┬──────────┬────────┼──────────┬──────────┬──────────┬──────────┐
    ▼          ▼          ▼          ▼        ▼          ▼          ▼          ▼          ▼
Botanical  Javanese   Islamic   Minimalist Rose Gold   Rustic   Celestial    Cute    (Lainnya)
(15-19 ds) (15-19 ds) (15-19 ds) (15-19 ds)(15-19 ds) (15-19 ds)(15-19 ds) (15-19 ds)
```

| Arketipe | Target Rasa & Karakter | Aksen Sekunder & Permukaan | Geometri Card & Sudut | Aset Kunci HariKita |
| :--- | :--- | :--- | :--- | :--- |
| **Botanical** | Alami, segar, kebun romantis | Forest Sage (`#5B6E58`), Muted Moss | Rounded soft (16px), floating card | Flower Accent 01–12, Leaf Sprig 01–16 |
| **Javanese** | Luhur, tradisi keraton, wingit | Deep Sogan (`#5A3825`), Antique Gold | Arch Kasunanan, batas berornamen ganda | Ornaments 01–06, Divider 15, Vintage Stamp |
| **Islamic** | Syar'i, suci, megah kontemporer | Emerald Mist (`#2C4A3E`), Sand Dune | Pointed Moroccan Arch, kisi geometris | Pattern 01, Frame Arch 01–02, Divider 18 |
| **Minimalist** | Editorial modern, arsitektural | Monolith Charcoal (`#1F1F1F`), Pure White | Sharp 0px atau hairline 4px presisi | Minimal Hairline Divider, Symbol 01–03 |
| **Rose Gold** | Feminin mewah, glamor lembut | Soft Blush (`#E8C5B8`), Copper Foil | Pill rounded (24px), glowing borders | Texture Gold Foil, Wax Seal HK, Composition 03 |
| **Rustic** | Hangat, bersahaja, vintage intim| Terracotta Muted (`#A35D43`), Kraft Paper | Deckle edge (tepi sobek), tekstur serat | Texture Deckle Paper, Texture Linen Light/Dark |
| **Celestial** | Puitis malam, rasi bintang, magis| Midnight Navy (`#1E2638`), Stardust Gold | Circular mask, orbit concentric lines | Symbol 02 (8-Point Star), Symbol 07 (Crescent) |
| **Cute** | Hangat, manis, ramah keluarga | Honey Peach (`#F4C2A1`), Butter Cream | Super-ellipse / Bubble pill (28px) | Symbol 05, Pattern 03, Avatar Wreath Light |

---

## 4. Spesifikasi Komponen: Cover Undangan (Opening & Closing)

### 4.1 Opening Cover (Sebelum Dibuka / The Gatekeeper)
Fungsi: Menjaga privasi undangan, memverifikasi tamu kehormatan, dan membangun rasa penasaran sebelum masuk ke isi acara.

#### Varian 1: *The Royal Envelope & Wax Seal Flap*
* **Layout:** Tampilan amplop tertutup digital dengan tekstur `Texture Linen Light`.
* **Elemen:**
  * Label: *"The Wedding Celebration of"* (Cormorant Garamond Italic 18px).
  * Monogram inisial kedua mempelai.
  * Card Tamu: Kontainer mengambang berbingkai `Champagne` bertuliskan *"Kepada Yth. Bapak/Ibu/Saudara/i: [Nama Tamu Kehormatan]"*.
  * Wax Seal: Aset timbul 3D `Wax Seal Official Crest` warna Taupe dengan bayangan realistis.
* **Interaksi:** Mengetuk Wax Seal memicu suara klik haptic lembut, segel amplop terbuka ke atas (*flap unseal*), dan layar mengalir (*fade & slide*) ke konten utama.

#### Varian 2: *Editorial Arch Curtain Reveal*
* **Layout:** Gerbang lengkung `Mask Arch 01` di tengah layar yang menampilkan video potret bergerak lambat (*cinemagraph*) calon pengantin.
* **Elemen:** Countdown timer ringkas (*H-xx Hari*), nama tamu, dan tombol pill *"Buka Undangan"*.
* **Interaksi:** Menekan tombol memicu transisi gerbang lengkung melebar ke seluruh layar (*curtain reveal effect*).

#### Varian 3: *Typographic Minimalist Split*
* **Layout:** Layar terbagi dua vertikal secara presisi dengan tipografi huruf besar editorial.
* **Interaksi:** Menekan *"Buka Undangan"* membuat paruh atas meluncur ke atas dan paruh bawah meluncur ke bawah seperti pintu galeri seni rupa.

### 4.2 Closing Outro (Sesudah Ditutup / Bagian Terbawah Layar)
Fungsi: Memberikan penutup teatrikal setelah seluruh informasi dan ucapan selesai dibaca.
* **Latar Belakang:** Warna `Charcoal #2B2B2B` dengan tekstur `Texture Paper Dark`.
* **Komponen:**
  * Inisial Monogram berlingkar `Avatar Wreath Dark`.
  * Stempel Pos: `Stamp Harikita` bertuliskan *"KEBUMEN - EST. 2026"*.
  * Teks Reflektif: *"Terima kasih atas doa & restu yang tulus. Sampai jumpa di hari bahagia kami."*
* **3 Tombol Aksi:**
  1. *"Kembali ke Atas"* (Smooth scroll ke hero section).
  2. *"Bagikan Undangan"* (Share link ke WhatsApp/Media Sosial).
  3. *"Tutup & Kunci Undangan"* (Mengembalikan undangan ke status amplop tertutup).

---

## 5. Spesifikasi Komponen: Card Kedua Mempelai (The Bride & Groom)

### 5.1 Struktur Data Mempelai
* **Foto Profil:** Resolusi tinggi dengan aspect ratio 3:4 atau 1:1 masked.
* **Nama Panggilan:** Cormorant Garamond 36px – 40px.
* **Nama Lengkap & Gelar:** Manrope Bold 16px Uppercase.
* **Silsilah Keluarga Adat:**
  * *"Putri pertama dari Bapak [Nama Ayah] & Ibu [Nama Ibu]"*
  * *"Putra kedua dari Bapak [Nama Ayah] & Ibu [Nama Ibu]"*
* **Tautan Media Sosial:** Ikon bulat mikro Instagram (`@username`).
* **Kutipan Suci / Romansa:** Tersemat di bawah profil berbalut `Quote Mark` (misal QS. Ar-Rum: 21 atau sajak sastra).

### 5.2 4 Varian Gaya Card Mempelai
1. **Symmetrical Twin Arches (Javanese & Islamic):** Foto wanita dan pria dibingkai gerbang lengkung berdampingan dengan ornamen ampersand kaligrafi di tengah.
2. **Editorial Overlapping Cards (Minimalist & Botanical):** Foto bergaya majalah fesyen dengan posisi kartu sedikit bertumpuk asimetris (*offset z-index*).
3. **Vintage Portrait Medallion (Rustic & Rose Gold):** Foto berbentuk oval dengan tepian kertas berserat (*deckle edge*) dan aksen foil berkilau.
4. **Interactive Profile Switcher (Cute & Celestial):** Card profil mempelai dapat digeser (*swipe*); kartu pasangan berada di belakang dengan sudut miring 3° dan efek kedalaman.

---

## 6. Spesifikasi Komponen: Rangkaian Acara (Akad & Dual Resepsi)

### 6.1 Struktur Informasi Acara
Sistem mendukung hingga 3 sesi terpisah:
1. **Akad Nikah:** Tanggal, Pukul 08.00–10.00 WIB, Lokasi Masjid/Gedung, Alamat Lengkap, Badge: *"Keluarga Inti"*.
2. **Resepsi Sesi 1 (Publik):** Pukul 11.00–14.00 WIB, Lokasi Ballroom, Alamat Lengkap, Badge: *"Tamu Umum & Rekan"*.
3. **Resepsi Sesi 2 (Intimate):** Pukul 18.30–21.30 WIB, Area Garden/Lounge, Alamat Lengkap, Badge: *"Intimate Dinner"*.

### 6.2 Utilitas Interaktif Terintegrasi
* **Tombol *"Buka Google Maps"*:** Dilengkapi `Icon Illustrated Map`. Mengarahkan rute navigasi presisi ke aplikasi peta.
* **Tombol *"Simpan ke Kalender"*:** Menghasilkan link Google Calendar dan file `.ics` (iCal/Outlook) dengan pengingat H-1 otomatis.
* **Live Countdown Timer:** 4 unit waktu (*Hari, Jam, Menit, Detik*) berbingkai garis halus `Champagne`.
* **Dresscode & Panduan:** Palet warna busana yang direkomendasikan dengan lingkaran warna kecil.

---

## 7. Spesifikasi Komponen: Hari Kasih / Love Story (BAB I–IV)

### 7.1 Babak Narasi Cinta Bertahap
* **BAB I: Titik Mula (*The Serendipity*):** Tempat & tahun pertemuan pertama.
* **BAB II: Menaut Janji (*The Journey Together*):** Kisah kedekatan, komitmen, dan saling mengenal keluarga.
* **BAB III: Restu Semesta (*The Proposal*):** Momen lamaran resmi dan tukar cincin di hadapan orang tua.
* **BAB IV: Ikrar di Depan Penghulu (*The Sacred Vow*):** Puncak janji suci di depan saksi dan penghulu.

### 7.2 Varian Tampilan Love Story
1. **Vertical Fine-Line Timeline:** Titik-titik waktu dihubungkan garis putus-putus dengan pin bunga `Flower Single Stem`.
2. **Storybook Accordion Chapters:** Daftar bab yang dapat diketuk untuk membuka teks cerita secara mulus.
3. **Horizontal Slide Memoir:** Kartu cerita digeser menyamping dengan indikator halaman `01 / 04` khas HariKita.

---

## 8. Spesifikasi Komponen: Galeri Pengantin (8 Varian Sistem Galeri)

Dirancang khusus agar 60+ template tidak mengalami kejenuhan visual:

| No | Gaya Galeri | Karakter Interaksi | Cocok untuk Arketipe |
| :--- | :--- | :--- | :--- |
| 1 | **Infinite Running Marquee** | Foto bergerak horizontal otomatis tanpa jeda (bisa single/dual-track), berhenti saat disentuh (*pause on hover/touch*). | *Minimalist, Editorial* |
| 2 | **Luxury Bento Grid** | Kotak modular asimetris (hero 2x2, portrait, landscape) diselingi 1 slot kartu kutipan tipografi puitis. | *Minimalist, Islamic, Rose Gold* |
| 3 | **3D Stacked Deck Swipe** | Tumpukan kartu foto 3D; tamu menggeser (*swipe*) kartu teratas untuk melihat foto di bawahnya. | *Cute, Celestial, Rose Gold* |
| 4 | **Polaroid Pinboard** | Foto berbingkai kertas polaroid dengan selotip washi tape transparan dan catatan tulisan tangan puitis. | *Rustic, Botanical, Javanese* |
| 5 | **Cinema Film Strip** | Pita rol film sinematik 35mm dengan nomor frame dan geseran momentum inersia halus. | *Retro, Minimalist, Rustic* |
| 6 | **Arch Portal Carousel** | Foto utama diapit gerbang lengkung `Frame Arch 01`, foto samping mengabur halus dengan indikator `01 / 08`. | *Javanese, Islamic, Celestial* |
| 7 | **Architectural Accordion** | Kolom vertikal rapat yang melebar otomatis saat disentuh tamu. | *Minimalist Architectural* |
| 8 | **Celestial Orbit Sphere** | Foto lingkaran dengan garis orbit berputar lambat dan taburan rasi bintang berkilau. | *Celestial, Cute* |

*Semua varian galeri wajib terhubung ke **Interactive Lightbox Viewer** (tampilan layar penuh, pinch-to-zoom, dan tombol unduh foto kenangan).*

---

## 9. Spesifikasi Komponen: Tanda Kasih & Kehormatan (Amplop Digital, QR Dinamis, & Kado Fisik)

### 9.1 Narasi Santun Beradab
> *"Doa restu Anda merupakan karunia terindah bagi kami. Namun apabila Bapak/Ibu/Saudara/i bermaksud memberikan tanda kasih sebagai bekal langkah baru kami, dengan penuh kerendahan hati kami menyediakan sarana berikut:"*

### 9.2 Tiga Saluran Tanda Kasih
1. **Rekening Bank Mempelai:**
   * Menampilkan logo bank resmi, nomor rekening berukuran besar, dan nama pemilik rekening.
   * **Tombol *"Salin Nomor Rekening"*:** Menyalin instan ke clipboard dengan feedback toast: *"Nomor rekening berhasil disalin!"*.
2. **Generator QRIS Dinamis (Input Nominal Tamu):**
   * Tamu memasukkan nominal rupiah (atau memilih *quick chips*: Rp 100k, Rp 250k, Rp 500k, Rp 1jt).
   * Menghasilkan gambar QRIS resmi secara real-time yang memuat nominal presisi tersebut.
   * Tamu tinggal scan via mobile banking/e-wallet apa pun tanpa perlu mengetik nominal lagi.
3. **Kirim Kado Fisik ke Alamat Mempelai:**
   * Memuat nama penerima, nomor HP kurir, alamat rumah lengkap (RT/RW, Desa, Kecamatan, Kab. Kebumen, Kode Pos), dan patokan rumah.
   * **Tombol *"Salin Alamat Lengkap"*:** 1 ketukan untuk menempelkan alamat ke aplikasi e-commerce atau jasa kurir.

---

## 10. Spesifikasi Komponen: Buku Tamu & Feed Doa (Interaksi Focus & Blur)

### 10.1 Form RSVP & Logika Khusus "Kirim Doa dari Jauh"
* **Field Nama:** Otomatis mendeteksi nama dari query parameter `?to=Nama+Tamu`.
* **Pilihan Kehadiran:**
  * `Hadir Langsung (Bersama Pasangan / Sendiri)`
  * **`Kirim Doa dari Jauh (Berhalangan Hadir)`** -> **Memicu Logika Khusus:**
    * Sistem memunculkan ucapan terima kasih tulus dari kejauhan.
    * Otomatis memunculkan tombol/modal menuju **Tanda Kasih Digital & QRIS** (memudahkan tamu luar kota menitipkan kado kasih).
* **Field Doa Restu:** Area teks doa dan wejangan.
* **Tombol Kirim:** Animasi konfirmasi berstempel `Wax Seal HK`.

### 10.2 Feed Doa dengan Efek Kedalaman (Focus & Blur)
Untuk menghindari daftar pesan yang monoton, feed ucapan dilengkapi efek optik:
1. **3D Stacked Depth Deck:** Kartu yang sedang aktif berada di depan (tajam, skala 100%). Kartu-kartu di belakangnya bertumpuk dengan filter kabur Gaussian blur (`blur(4px)` hingga `blur(8px)`) dan redup transparan. Saat diswipe, kartu di belakangnya meluncur ke depan dan otomatis berubah jernih (*unblur*).
2. **Spotlight Horizontal Ribbon:** Scroll mendatar dengan kartu tengah menyala terang, sementara kartu di sisi luar menjadi blur halus.
3. **Vertical Focus Wheel:** Roda vertikal di mana kartu yang berada tepat di tengah viewport smartphone menjadi tajam, sedangkan kartu atas/bawah mengalami *depth-of-field blur*.
4. **Whisper Message Clouds:** Gelembung doa pastel yang membesar saat disentuh dan memburamkan gelembung lainnya.
*Fitur tambahan: Pinning doa keluarga inti dengan badge `VIP Crest` dan balasan resmi dari mempelai (*Bride & Groom Note*).*

---

## 11. Spesifikasi Komponen: Section "Dengan Penuh Rasa Syukur" & Outro

### 11.1 Anatomi Section Syukur
* **Judul:** *Dengan Penuh Rasa Syukur* (Cormorant Garamond 36px Italic).
* **Kalimat Kehormatan:**
  > *"Merupakan suatu kehormatan dan kebahagiaan bagi kami sekeluarga apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kami."*
* **Garis Pembatas HariKita:** Aset `Section Line 01` (aksen diamond di tengah) warna `Champagne`.
* **Nama Mempelai & Keluarga:**
  * *"Kami yang berbahagia,"*
  * **[Nama Mempelai Wanita] & [Nama Mempelai Pria]**
  * *"Beserta segenap keluarga besar kedua belah pihak"*
  * Susunan nama kedua pasang orang tua berdampingan rapi.
* **Kalimat Penutup Luhur:**
  > **"Doa Restu Anda Adalah Kehormatan Terindah Bagi Kami."**
  * Diakhiri ornamen `Wax Seal Official Crest` atau `Avatar Wreath Light`.

---

## 12. Panduan Implementasi & Standar Aksesibilitas
* **Viewport Target:** Mobile-First 375px (iPhone SE hingga smartphone Android standar).
* **Sentuhan Layar (Touch Target):** Seluruh tombol memiliki minimum area sentuh 44px × 44px.
* **Kontras Warna:** Memenuhi standar WCAG AA (teks `Charcoal #2B2B2B` di atas kanvas `Ivory #F8F6F1` memiliki rasio kontras 12.8:1).
* **Performa Animasi:** Semua transisi kartu (marquee, stacked cards, blur) menggunakan properti `transform: translate3d()` dan `opacity` yang diakselerasi GPU (*hardware accelerated* 60fps).
