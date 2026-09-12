# HariKita Brand Guidelines & Design System

## 1. Identitas & Misi Produk
* **Nama Brand:** HariKita
* **Tagline Resmi:** *"Rangkai Hari Bahagiamu, Menyelaraskan Restu & Impian."*
* **Fokus Layanan:** Pre-wedding, Lamaran (*Engagement*), dan Pernikahan Intim (*Wedding*).
* **Fokus Geografis Pilot:** **Kabupaten Kebumen, Jawa Tengah**. Memaksimalkan kurasi vendor lokal terpercaya, kemudahan sesi fisik (fitting busana & test food di Kebumen), serta kedekatan emosional antar keluarga besar.
* **Aturan Privasi Demografi (WAJIB):**
  * **DILARANG** mencantumkan label generasi seperti *"Boomer"*, *"Milenial"*, *"Gen Z"*, atau *"3 Generasi"* di antarmuka publik mana pun.
  * Karakteristik lintas preferensi (kehormatan adat/katering, transparansi kontrak kerja/SLA, proteksi rekening bersama, dan visualisasi estetik modern) diintegrasikan secara implisit, anggun, dan natural.

---

## 2. Logo Resmi HariKita (Terkunci & Preserved)

Logo resmi HariKita adalah lockup monolitik berbasis SVG tunggal berpresisi matematika tinggi:
* **Komponen Kode:** `src/components/brand/HariKitaLogo.tsx`
* **File Master SVG:** `public/brand/harikita-lockup-horizontal.svg` & `public/brand/harikita-symbol.svg`
* **ViewBox:** `0 0 424 100` (aspect ratio 4.24 : 1)
* **Anatomi:**
  * **Simbol Monogram:** Dua sosok melengkung yang bersatu membentuk hati dan siluet cincin pertunangan berbalut laurel wreath.
  * **Wordmark:** Typografi serif editorial *"HariKita"* proporsional dan presisi.
* **Varian Tone:**
  * `dark`: Digunakan pada latar terang (Canvas Ivory `#F8F6F1` atau Putih). Simbol: Taupe `#88735B`, Wordmark: Charcoal `#2B2B2B`.
  * `light`: Digunakan pada latar gelap (Charcoal `#2B2B2B`). Simbol: Champagne `#C9A88A`, Wordmark: Ivory `#F8F6F1`.
  * `currentColor`: Mewarisi warna teks pembungkus CSS secara dinamis.
* **Batasan Penggunaan Logo:**
  * ❌ DILARANG mengubah rasio, memisahkan teks tanpa izin, memutar kemiringan logo, atau menambahkan drop-shadow berlebihan.
  * ✅ Jaga *clear space* minimal sebesar diameter simbol monogram di sekeliling logo.

---

## 3. Palet Warna Resmi (5-Color Palette)

HariKita secara ketat menggunakan sistem 5 warna harmonis bertema *Cashmere Alabaster & Gilded Champagne*:

| Nama Token | Hex Code | RGB | Kelas Tailwind | Peran & Penggunaan Utama |
| :--- | :--- | :--- | :--- | :--- |
| **Charcoal** | `#2B2B2B` | 43, 43, 43 | `bg-hk-charcoal`, `text-hk-charcoal` | Teks utama, latar seksi gelap, aksen deep, kontras tinggi |
| **Taupe** | `#88735B` | 136, 115, 91 | `bg-hk-taupe`, `text-hk-taupe` | Warna primer brand, tombol CTA utama, simbol monogram |
| **Champagne** | `#C9A88A` | 201, 168, 138 | `bg-hk-champagne`, `text-hk-champagne` | Garis batas (*border*), aksen foil, ornamen halus, tombol sekunder |
| **Soft Beige** | `#E8DED1` | 232, 222, 209 | `bg-hk-soft-beige`, `text-hk-soft-beige` | Garis pembagi, permukaan sekunder, badge netral, latar kartu |
| **Ivory** | `#F8F6F1` | 248, 246, 241 | `bg-hk-ivory`, `text-hk-ivory` | Kanvas latar belakang utama aplikasi, permukaan kartu bersih |

### Aturan Warna:
1. **Hindari Kuning Emas Terang:** JANGAN PERNAH menggunakan warna emas kuning neon (`#D4AF37` atau `#FFD700`) sebagai warna primer. Selalu gunakan **Taupe (`#88735B`)** dan **Champagne (`#C9A88A`)**.
2. **Kontras Rasio WCAG AA:** Teks Charcoal pada latar Ivory memiliki rasio kontras 12.5:1 (melebihi standar WCAG AAA).

---

## 4. Tipografi Editorial

Sistem tipografi HariKita memadukan estetika majalah pernikahan kelas dunia dengan ergonomi aplikasi seluler modern:

### 1. Display & Headings: `Cormorant Garamond`
* **Sumber:** Google Fonts (`font-editorial` / `var(--font-display)`)
* **Karakter:** Klasik, anggun, anggun serif editorial, penuh kehangatan emosional.
* **Penggunaan:**
  * Judul Halaman / Hero (`font-editorial font-normal text-3xl md:text-5xl`)
  * Kutipan Testimonial (`font-editorial italic`)
  * Nama Mempelai pada Undangan Digital

### 2. UI, Konten, & Navigasi: `Manrope`
* **Sumber:** Google Fonts (`font-manrope` / `var(--font-body)`)
* **Karakter:** Geometris humanis, keterbacaan tinggi di layar sentuh ponsel, modern.
* **Penggunaan:**
  * Tombol & CTA (`font-manrope font-semibold text-sm`)
  * Paragraf & Deskripsi Layanan (`font-manrope text-sm leading-relaxed`)
  * Angka Harga & Data Tanggal (`font-manrope font-bold text-xs/sm`)
  * Label Navigasi Bawah

---

## 5. Nada Suara & Komunikasi (Tone of Voice)
* **Santun & Menghormati Adat:** Menjunjung tinggi nilai restu keluarga dan adat Jawa Kebumen (contoh: istilah sesi *Lamaran*, *Sungkeman*, *Seserahan*).
* **Transparan & Menenangkan:** Memberikan kejelasan harga (kalkulator pax dinamis) dan rasa aman (rekening bersama DP 30% dan pelunasan 70%).
* **Eksklusif namun Inklusif:** Terasa premium layaknya concierge pernikahan, namun bersahabat dan ramah jempol untuk seluruh anggota keluarga di Kebumen.
