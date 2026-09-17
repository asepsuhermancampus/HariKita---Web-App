# HariKita Component System Guide

## 1. Ikhtisar Pustaka Komponen UI

Komponen antarmuka HariKita dirancang dengan standar aksesibilitas tinggi (*touch targets $\ge 44\text{px}$* untuk kenyamanan seluruh anggota keluarga), transisi halus, serta integrasi token desain resmi (*Taupe, Charcoal, Champagne, Soft Beige, Ivory*).

* **Komponen Desktop & Umum:** `src/components/harikita/ui/`
* **Komponen Khusus Mobile:** `src/components/harikita/mobile/`

---

## 2. 15 Varian Komponen UI (`src/components/harikita/ui/`)

### 1. `ButtonPrimary`
* **Styling:** Solid Taupe (`#88735B`), teks putih, Manrope 600, micro-arrow opsional.
* **Props:** `arrow?: boolean`, `size?: 'sm' | 'md' | 'lg'`, `fullWidth?: boolean`, `disabled?: boolean`.
* **Kegunaan:** Tombol aksi utama (Booking, Lanjutkan, Mulai Sekarang).

### 2. `ButtonSecondary`
* **Styling:** Outline Champagne (`#C9A88A`), teks Taupe, efek hover lembut.
* **Props:** `arrow?: boolean`, `size?: 'sm' | 'md' | 'lg'`, `fullWidth?: boolean`.
* **Kegunaan:** Tombol aksi sekunder (Lihat Detail, Cek Portofolio).

### 3. `ButtonGhost`
* **Styling:** Tautan teks tanpa border dengan animasi garis bawah halus dan micro-arrow.
* **Props:** `arrow?: boolean`, `size?: 'sm' | 'md' | 'lg'`.
* **Kegunaan:** Tautan teks navigasi *"Selengkapnya →"*.

### 4. `ButtonDark`
* **Styling:** Dioptimalkan untuk section gelap Charcoal (`#2B2B2B`) dengan border Champagne dan teks Ivory.
* **Props:** `arrow?: boolean`, `size?: 'sm' | 'md' | 'lg'`, `fullWidth?: boolean`.

### 5. `IconButtonCircle`
* **Styling:** Tombol aksi melingkar minimalis dengan target sentuh $\ge 44\text{px}$.
* **Props:** `icon: React.ReactNode`, `variant?: 'taupe' | 'champagne' | 'outline' | 'ghost' | 'surface'`, `size?: 'sm' | 'md' | 'lg'`.
* **Kegunaan:** Tombol Favorit (Heart), Simpan (Bookmark), Bagikan (Share).

### 6. `ToggleSwitch`
* **Styling:** Switch pil interaktif dengan transisi mulus.
* **Props:** `checked: boolean`, `onChange: (val: boolean) => void`, `label?: string`, `description?: string`.
* **Kegunaan:** Toggle add-on layanan (misal: "Sample Box Test Food", "Fitting di Rumah").

### 7. `PaginationControls`
* **Styling:** Indikator nomor halaman editorial bergaya slide majalah (`01 / 08 ← →`).
* **Props:** `current: number`, `total: number`, `onPrev?: () => void`, `onNext?: () => void`.

### 8. `BadgePremium`
* **Styling:** Badge pil atau scalloped rosette beraksen Champagne & Taupe.
* **Props:** `label?: string`, `variant?: 'pill' | 'scalloped' | 'minimal'`.

### 9. `BadgeNew`
* **Styling:** Badge oktagonal berpotongan sudut unik dengan teks huruf kapital tegas.
* **Props:** `label?: string`, `variant?: 'octagonal' | 'pill'`.

### 10. `WaxSealBadge`
* **Styling:** Segel lilin realistis dengan efek drop-shadow dan monogram resmi HariKita.
* **Props:** `size?: 'sm' | 'md' | 'lg'`, `onClick?: () => void`.
* **Kegunaan:** Penutup interaktif surat undangan digital.

### 11. `VintageStampBadge`
* **Styling:** Cap pos pembatalan surat vintage bergaris putus-putus dengan sudut miring dinamis.
* **Props:** `date?: string`, `location?: string`, `rotation?: number`, `size?: 'sm' | 'md' | 'lg'`.

### 12. `ArchFrameCard`
* **Styling:** Bingkai foto berbentuk kubah lengkung Romawi (*cathedral arch*) beraksen floral.
* **Props:** `imageSrc?: string`, `caption?: string`, `category?: string`, `aspectRatio?: 'portrait' | 'square' | 'tall'`.

### 13. `DecorativeDivider`
* **Styling:** Garis pembatas bagian berornamen tengah (diamond, botanical, loop, minimal).
* **Props:** `variant?: 'diamond' | 'botanical' | 'minimal' | 'loop'`, `color?: 'taupe' | 'champagne' | 'charcoal'`.

### 14. `SerifQuoteCard`
* **Styling:** Kartu testimonial klien dengan tanda petik pembuka serif ukuran raksasa (*oversized quote mark*).
* **Props:** `quote: string`, `author: string`, `event?: string`, `rating?: number`.

### 15. `FloralCornerCard`
* **Styling:** Wadah kartu dengan ornamen floral di keempat sudutnya.
* **Props:** `children: React.ReactNode`, `title?: string`, `subtitle?: string`.

---

## 3. 6 Komponen Khusus Mobile (`src/components/harikita/mobile/`)

1. **`MobileHeader`**: Top bar lengket 56px (*sticky*) berlogo HariKita dengan tombol pencarian dan toggle menu.
2. **`MobileHero`**: Hero touch-first dengan top-tagline, tipografi editorial Cormorant Garamond, arch mask foto, dan CTA utama.
3. **`MobileServiceCard`**: Kartu jasa kompak untuk daftar 11 kategori vendor Kebumen dengan ikon konsep visual dan estimasi harga.
4. **`MobileInvitationPreview`**: Mockup smartphone undangan digital berfitur wax seal sentuh dan tombol RSVP.
5. **`MobileBottomNav`**: Navigasi jempol 4-tab (Beranda, Layanan, Undangan, Pesanan) dengan area sentuh ramah keluarga.
6. **`MobileStickyBookingBar`**: Bar bawah mengambang untuk halaman detail layanan dengan informasi harga transparan dan tombol satu-sentuhan booking.
