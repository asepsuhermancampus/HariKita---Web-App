"use client";

export type StudioFontCategory =
  | 'calligraphy'
  | 'signature'
  | 'editorial-serif'
  | 'classic-serif'
  | 'clean-sans'
  | 'luxury-sans'
  | 'playful'
  | 'islamic';

export interface StudioFontOption {
  name: string;
  category: StudioFontCategory;
  categoryLabel: string;
  fallback: 'serif' | 'sans-serif' | 'cursive';
  sample?: string;
  weights?: number[];
}

export const STUDIO_FONT_CATEGORIES: { id: StudioFontCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Semua Font (135)' },
  { id: 'calligraphy', label: 'Romantic Calligraphy (25)' },
  { id: 'signature', label: 'Modern Signature (20)' },
  { id: 'editorial-serif', label: 'Editorial Serif (25)' },
  { id: 'classic-serif', label: 'Classic & Royal Serif (20)' },
  { id: 'clean-sans', label: 'Clean Sans-Serif (20)' },
  { id: 'luxury-sans', label: 'Luxury & Geometric (10)' },
  { id: 'playful', label: 'Cute & Playful (10)' },
  { id: 'islamic', label: 'Islamic Heritage (5)' },
];

export const STUDIO_FONTS: StudioFontOption[] = [
  // ── 1. Romantic Calligraphy & Formal Script (25) ──────────────────────────
  { name: 'Great Vibes', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'cursive', sample: 'Ananda & Bintang' },
  { name: 'Alex Brush', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'cursive', sample: 'Raisya Putri' },
  { name: 'Pinyon Script', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'cursive', sample: 'The Wedding Of' },
  { name: 'Allura', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'cursive', sample: 'Undangan Bahagia' },
  { name: 'Parisienne', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'cursive', sample: 'Dua Jiwa Satu Restu' },
  { name: 'Tangerine', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'cursive', sample: 'Walimatul Ursy' },
  { name: 'Italianno', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'cursive', sample: 'Akad & Resepsi' },
  { name: 'Monsieur La Doulaise', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'cursive', sample: 'A & B' },
  { name: 'Miss Fajardose', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'cursive', sample: 'Monogram' },
  { name: 'Herr Von Muellerhoff', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'cursive', sample: 'Save The Date' },
  { name: 'Rouge Script', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'cursive', sample: 'Forever & Always' },
  { name: 'Marck Script', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'cursive', sample: 'Bismillah' },
  { name: 'Lovers Quarrel', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'cursive', sample: 'Love Story' },
  { name: 'Qwigley', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'cursive', sample: 'Our Wedding' },
  { name: 'Aguafina Script', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'cursive', sample: 'Janji Suci' },
  { name: 'Ruthie', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'cursive', sample: 'Kisah Kami' },
  { name: 'Clicker Script', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'cursive', sample: 'Wedding Day' },
  { name: 'Bilbo Swash Caps', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'cursive', sample: 'R & D' },
  { name: 'Euphoria Script', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'cursive', sample: 'Momen Bahagia' },
  { name: 'Felipa', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'cursive', sample: 'Kebumen' },
  { name: 'Meie Script', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'cursive', sample: 'Hari Kita' },
  { name: 'Dr Sugiyama', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'cursive', sample: 'Artistic Love' },
  { name: 'Suez One', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'serif', sample: 'Intimate Gathering' },
  { name: 'Rochester', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'cursive', sample: 'Vintage Romance' },
  { name: 'Fondamento', category: 'calligraphy', categoryLabel: 'Romantic Calligraphy', fallback: 'cursive', sample: 'Mengharap Doa Restu' },

  // ── 2. Modern Signature & Casual Handwriting (20) ─────────────────────────
  { name: 'Dancing Script', category: 'signature', categoryLabel: 'Modern Signature', fallback: 'cursive', sample: 'Ananda & Bintang' },
  { name: 'Caveat', category: 'signature', categoryLabel: 'Modern Signature', fallback: 'cursive', sample: 'With love & joy' },
  { name: 'Sacramento', category: 'signature', categoryLabel: 'Modern Signature', fallback: 'cursive', sample: 'Together forever' },
  { name: 'Satisfy', category: 'signature', categoryLabel: 'Modern Signature', fallback: 'cursive', sample: 'You are invited' },
  { name: 'Pacifico', category: 'signature', categoryLabel: 'Modern Signature', fallback: 'cursive', sample: 'Special Celebration' },
  { name: 'Yellowtail', category: 'signature', categoryLabel: 'Modern Signature', fallback: 'cursive', sample: 'Save our date' },
  { name: 'Kaushan Script', category: 'signature', categoryLabel: 'Modern Signature', fallback: 'cursive', sample: 'Rustic Love' },
  { name: 'Courgette', category: 'signature', categoryLabel: 'Modern Signature', fallback: 'cursive', sample: 'Menuju Hari Bahagia' },
  { name: 'Gochi Hand', category: 'signature', categoryLabel: 'Modern Signature', fallback: 'cursive', sample: 'Lokasi Acara' },
  { name: 'Kalam', category: 'signature', categoryLabel: 'Modern Signature', fallback: 'cursive', sample: 'Doa Restu Anda' },
  { name: 'Shadows Into Light', category: 'signature', categoryLabel: 'Modern Signature', fallback: 'cursive', sample: 'Two souls one heart' },
  { name: 'Nothing You Could Do', category: 'signature', categoryLabel: 'Modern Signature', fallback: 'cursive', sample: 'Prewedding Notes' },
  { name: 'Reenie Beanie', category: 'signature', categoryLabel: 'Modern Signature', fallback: 'cursive', sample: 'Photo Memories' },
  { name: 'Indie Flower', category: 'signature', categoryLabel: 'Modern Signature', fallback: 'cursive', sample: 'Cute Illustrated Map' },
  { name: 'Covered By Your Grace', category: 'signature', categoryLabel: 'Modern Signature', fallback: 'cursive', sample: 'Kirim Doa & Ucapan' },
  { name: 'Just Another Hand', category: 'signature', categoryLabel: 'Modern Signature', fallback: 'cursive', sample: 'Menghitung Hari' },
  { name: 'La Belle Aurore', category: 'signature', categoryLabel: 'Modern Signature', fallback: 'cursive', sample: 'Amplop Digital QRIS' },
  { name: 'Kristi', category: 'signature', categoryLabel: 'Modern Signature', fallback: 'cursive', sample: 'Romantic Melody' },
  { name: 'Meddon', category: 'signature', categoryLabel: 'Modern Signature', fallback: 'cursive', sample: 'Arsip Cinta Abadi' },
  { name: 'Zeyada', category: 'signature', categoryLabel: 'Modern Signature', fallback: 'cursive', sample: 'Casual Prewed' },

  // ── 3. High-Fashion & Editorial Serif (25) ────────────────────────────────
  { name: 'Cormorant Garamond', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'serif', sample: 'THE WEDDING OF', weights: [400, 600, 700] },
  { name: 'Playfair Display', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'serif', sample: 'Raisya & Daffa', weights: [400, 600, 700] },
  { name: 'Cinzel', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'serif', sample: 'WALIMATUL URSY', weights: [400, 700] },
  { name: 'Prata', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'serif', sample: 'Perayaan Cinta' },
  { name: 'Bodoni Moda', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'serif', sample: 'CONTEMPORARY', weights: [400, 700] },
  { name: 'DM Serif Display', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'serif', sample: 'Rangkaian Hari Bahagia' },
  { name: 'Castoro Titling', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'serif', sample: 'MEMPELAI KAMI' },
  { name: 'Aboreto', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'serif', sample: 'EXCLUSIVE EVENT' },
  { name: 'Bellefair', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'serif', sample: 'Akad Nikah Suci' },
  { name: 'Cinzel Decorative', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'serif', sample: 'ROYAL WEDDING', weights: [700] },
  { name: 'Forum', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'serif', sample: 'Upacara Pernikahan' },
  { name: 'Italiana', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'serif', sample: 'CHIC & ELEGANT' },
  { name: 'Marcellus', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'serif', sample: 'Kebumen Jawa Tengah' },
  { name: 'Oranienbaum', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'serif', sample: 'Dua Hati Bersatu' },
  { name: 'Rozha One', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'serif', sample: 'HAUTE COUTURE' },
  { name: 'Spectral', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'serif', sample: 'Tanda Syukur & Bahagia', weights: [400, 600] },
  { name: 'Yeseva One', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'serif', sample: 'Janji Setia' },
  { name: 'Cormorant Upright', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'serif', sample: 'Raisya Putri Andini' },
  { name: 'Cardo', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'serif', sample: 'Doa Pernikahan' },
  { name: 'El Messiri', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'sans-serif', sample: 'Bismillahirahmanirrahim', weights: [600, 700] },
  { name: 'Ovo', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'serif', sample: 'Resepsi Pernikahan' },
  { name: 'Faustina', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'serif', sample: 'QS. Ar-Rum Ayat 21' },
  { name: 'Vidaloka', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'serif', sample: 'Sweet Moment' },
  { name: 'Cinzel Bold', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'serif', sample: 'RESEPSI UTAMA' },
  { name: 'Cormorant Infant', category: 'editorial-serif', categoryLabel: 'Editorial Serif', fallback: 'serif', sample: 'Pemberkatan & Restu' },

  // ── 4. Classic, Royal & Heritage Serif (20) ───────────────────────────────
  { name: 'EB Garamond', category: 'classic-serif', categoryLabel: 'Classic & Royal Serif', fallback: 'serif', sample: 'Maha Suci Allah', weights: [400, 600, 700] },
  { name: 'Lora', category: 'classic-serif', categoryLabel: 'Classic & Royal Serif', fallback: 'serif', sample: 'Sabtu, 14 Februari 2026', weights: [400, 500, 600] },
  { name: 'Merriweather', category: 'classic-serif', categoryLabel: 'Classic & Royal Serif', fallback: 'serif', sample: 'Gedung Pertemuan Kebumen', weights: [400, 700] },
  { name: 'Libre Baskerville', category: 'classic-serif', categoryLabel: 'Classic & Royal Serif', fallback: 'serif', sample: 'Keluarga Besar', weights: [400, 700] },
  { name: 'PT Serif', category: 'classic-serif', categoryLabel: 'Classic & Royal Serif', fallback: 'serif', sample: 'Rundown Sesi Acara', weights: [400, 700] },
  { name: 'Arapey', category: 'classic-serif', categoryLabel: 'Classic & Royal Serif', fallback: 'serif', sample: 'Dengan Penuh Syukur' },
  { name: 'Sorts Mill Goudy', category: 'classic-serif', categoryLabel: 'Classic & Royal Serif', fallback: 'serif', sample: 'Adat Jawa Kebumen' },
  { name: 'Gentium Book Plus', category: 'classic-serif', categoryLabel: 'Classic & Royal Serif', fallback: 'serif', sample: 'Terjemahan Ayat Suci' },
  { name: 'Bona Nova', category: 'classic-serif', categoryLabel: 'Classic & Royal Serif', fallback: 'serif', sample: 'Kehormatan Keluarga' },
  { name: 'Newsreader', category: 'classic-serif', categoryLabel: 'Classic & Royal Serif', fallback: 'serif', sample: 'Kisah Perjalanan Cinta' },
  { name: 'Vollkorn', category: 'classic-serif', categoryLabel: 'Classic & Royal Serif', fallback: 'serif', sample: 'Doa Restu Orang Tua' },
  { name: 'Tinos', category: 'classic-serif', categoryLabel: 'Classic & Royal Serif', fallback: 'serif', sample: 'Waktu & Tempat Pelaksanaan' },
  { name: 'Marcellus SC', category: 'classic-serif', categoryLabel: 'Classic & Royal Serif', fallback: 'serif', sample: 'AHAD, 18 JANUARI 2026' },
  { name: 'Besley', category: 'classic-serif', categoryLabel: 'Classic & Royal Serif', fallback: 'serif', sample: 'Rustic Wedding Kebumen' },
  { name: 'Frank Ruhl Libre', category: 'classic-serif', categoryLabel: 'Classic & Royal Serif', fallback: 'serif', sample: 'Undangan Intim' },
  { name: 'Alice', category: 'classic-serif', categoryLabel: 'Classic & Royal Serif', fallback: 'serif', sample: 'Mekar Mewangi Bunga' },
  { name: 'Gilda Display', category: 'classic-serif', categoryLabel: 'Classic & Royal Serif', fallback: 'serif', sample: 'Putra & Putri Tercinta' },
  { name: 'Almendra', category: 'classic-serif', categoryLabel: 'Classic & Royal Serif', fallback: 'serif', sample: 'Keraton & Adat Leluhur' },
  { name: 'Petrona', category: 'classic-serif', categoryLabel: 'Classic & Royal Serif', fallback: 'serif', sample: 'Profil Mempelai' },
  { name: 'Cormorant SC', category: 'classic-serif', categoryLabel: 'Classic & Royal Serif', fallback: 'serif', sample: 'KEPADA YTH. BAPAK/IBU' },

  // ── 5. Modern Minimalist & Clean Sans-Serif (20) ──────────────────────────
  { name: 'Plus Jakarta Sans', category: 'clean-sans', categoryLabel: 'Clean Sans-Serif', fallback: 'sans-serif', sample: 'HariKita Event Platform', weights: [400, 500, 600, 700] },
  { name: 'Montserrat', category: 'clean-sans', categoryLabel: 'Clean Sans-Serif', fallback: 'sans-serif', sample: 'BUKA UNDANGAN', weights: [400, 600, 700] },
  { name: 'Inter', category: 'clean-sans', categoryLabel: 'Clean Sans-Serif', fallback: 'sans-serif', sample: 'Formulir Konfirmasi RSVP', weights: [400, 500, 600] },
  { name: 'Outfit', category: 'clean-sans', categoryLabel: 'Clean Sans-Serif', fallback: 'sans-serif', sample: 'Modern Intimate Wedding', weights: [400, 600] },
  { name: 'Manrope', category: 'clean-sans', categoryLabel: 'Clean Sans-Serif', fallback: 'sans-serif', sample: 'Rekening Bersama Escrow', weights: [400, 600, 700] },
  { name: 'Poppins', category: 'clean-sans', categoryLabel: 'Clean Sans-Serif', fallback: 'sans-serif', sample: 'Selamat Datang Tamu Terhormat', weights: [400, 500, 600] },
  { name: 'Raleway', category: 'clean-sans', categoryLabel: 'Clean Sans-Serif', fallback: 'sans-serif', sample: 'Countdown 14 Hari Lagi', weights: [400, 600] },
  { name: 'Jost', category: 'clean-sans', categoryLabel: 'Clean Sans-Serif', fallback: 'sans-serif', sample: 'Simpel Elegan & Bersih', weights: [400, 500, 600] },
  { name: 'Urbanist', category: 'clean-sans', categoryLabel: 'Clean Sans-Serif', fallback: 'sans-serif', sample: 'Sesi 1: 09.00 - 11.00 WIB', weights: [400, 600] },
  { name: 'Tenor Sans', category: 'clean-sans', categoryLabel: 'Clean Sans-Serif', fallback: 'sans-serif', sample: 'Koleksi Busana & Fitting' },
  { name: 'Quicksand', category: 'clean-sans', categoryLabel: 'Clean Sans-Serif', fallback: 'sans-serif', sample: 'Terima kasih atas doa Anda', weights: [400, 600] },
  { name: 'Nunito Sans', category: 'clean-sans', categoryLabel: 'Clean Sans-Serif', fallback: 'sans-serif', sample: 'Informasi Parkir & Protokol', weights: [400, 600] },
  { name: 'Work Sans', category: 'clean-sans', categoryLabel: 'Clean Sans-Serif', fallback: 'sans-serif', sample: 'Buka Navigasi Google Maps', weights: [400, 500] },
  { name: 'Be Vietnam Pro', category: 'clean-sans', categoryLabel: 'Clean Sans-Serif', fallback: 'sans-serif', sample: 'Profil Vendor Terkurasi' },
  { name: 'DM Sans', category: 'clean-sans', categoryLabel: 'Clean Sans-Serif', fallback: 'sans-serif', sample: 'Jadwal Acara Hari H', weights: [400, 500, 700] },
  { name: 'Syne', category: 'clean-sans', categoryLabel: 'Clean Sans-Serif', fallback: 'sans-serif', sample: 'CREATIVE INVITATION', weights: [600, 700] },
  { name: 'Kumbh Sans', category: 'clean-sans', categoryLabel: 'Clean Sans-Serif', fallback: 'sans-serif', sample: 'Amplop Digital Aman', weights: [400, 600] },
  { name: 'Albert Sans', category: 'clean-sans', categoryLabel: 'Clean Sans-Serif', fallback: 'sans-serif', sample: 'Minimalist Clean Touch', weights: [400, 600] },
  { name: 'Nunito', category: 'clean-sans', categoryLabel: 'Clean Sans-Serif', fallback: 'sans-serif', sample: 'Ramah Jempol Keluarga', weights: [400, 600] },
  { name: 'Rubik', category: 'clean-sans', categoryLabel: 'Clean Sans-Serif', fallback: 'sans-serif', sample: 'Check-in QR Tamu Undangan', weights: [400, 500] },

  // ── 6. Geometric, All-Caps & Luxury Sans (10) ─────────────────────────────
  { name: 'Syncopate', category: 'luxury-sans', categoryLabel: 'Luxury & Geometric', fallback: 'sans-serif', sample: 'SAVE THE DATE', weights: [400, 700] },
  { name: 'Bebas Neue', category: 'luxury-sans', categoryLabel: 'Luxury & Geometric', fallback: 'sans-serif', sample: '14 · 02 · 2026' },
  { name: 'Oswald', category: 'luxury-sans', categoryLabel: 'Luxury & Geometric', fallback: 'sans-serif', sample: 'PUKUL 08.00 WIB', weights: [400, 600] },
  { name: 'Six Caps', category: 'luxury-sans', categoryLabel: 'Luxury & Geometric', fallback: 'sans-serif', sample: '2026' },
  { name: 'League Spartan', category: 'luxury-sans', categoryLabel: 'Luxury & Geometric', fallback: 'sans-serif', sample: 'THE WEDDING', weights: [600, 700] },
  { name: 'Antonio', category: 'luxury-sans', categoryLabel: 'Luxury & Geometric', fallback: 'sans-serif', sample: 'LIVE STREAMING', weights: [600, 700] },
  { name: 'Julius Sans One', category: 'luxury-sans', categoryLabel: 'Luxury & Geometric', fallback: 'sans-serif', sample: 'THE CELEBRATION OF LOVE' },
  { name: 'Federo', category: 'luxury-sans', categoryLabel: 'Luxury & Geometric', fallback: 'sans-serif', sample: 'CINEMATIC TEASER' },
  { name: 'Krona One', category: 'luxury-sans', categoryLabel: 'Luxury & Geometric', fallback: 'sans-serif', sample: 'BUKA UNDANGAN' },
  { name: 'Metrophobic', category: 'luxury-sans', categoryLabel: 'Luxury & Geometric', fallback: 'sans-serif', sample: 'NAVIGASI LOKASI' },

  // ── 7. Cute, Playful & Illustrated Maps Display (10) ──────────────────────
  { name: 'Fredoka', category: 'playful', categoryLabel: 'Cute & Playful', fallback: 'sans-serif', sample: 'Denah Lokasi Lucu', weights: [400, 600] },
  { name: 'Comfortaa', category: 'playful', categoryLabel: 'Cute & Playful', fallback: 'cursive', sample: 'Rute Menuju Venue', weights: [400, 600] },
  { name: 'Sniglet', category: 'playful', categoryLabel: 'Cute & Playful', fallback: 'cursive', sample: 'Titik Kumpul Tamu', weights: [400, 800] },
  { name: 'Amatic SC', category: 'playful', categoryLabel: 'Cute & Playful', fallback: 'cursive', sample: 'KADO PERNIKAHAN KAMI', weights: [700] },
  { name: 'Patrick Hand', category: 'playful', categoryLabel: 'Cute & Playful', fallback: 'cursive', sample: 'Catatan Khusus Tamu' },
  { name: 'Grandstander', category: 'playful', categoryLabel: 'Cute & Playful', fallback: 'cursive', sample: 'Sweet Dessert Table', weights: [500, 700] },
  { name: 'DynaPuff', category: 'playful', categoryLabel: 'Cute & Playful', fallback: 'cursive', sample: 'Stiker Cinta Lucu', weights: [500, 700] },
  { name: 'Mali', category: 'playful', categoryLabel: 'Cute & Playful', fallback: 'cursive', sample: 'Cerita Hari Bahagia', weights: [400, 600] },
  { name: 'Gaegu', category: 'playful', categoryLabel: 'Cute & Playful', fallback: 'cursive', sample: 'Korean Prewed Style', weights: [400, 700] },
  { name: 'Pangolin', category: 'playful', categoryLabel: 'Cute & Playful', fallback: 'cursive', sample: 'Suvenir & Kenang-kenangan' },

  // ── 8. Islamic & Heritage Calligraphy Compatible (5) ──────────────────────
  { name: 'Amiri', category: 'islamic', categoryLabel: 'Islamic Heritage', fallback: 'serif', sample: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', weights: [400, 700] },
  { name: 'Aref Ruqaa', category: 'islamic', categoryLabel: 'Islamic Heritage', fallback: 'serif', sample: 'بَارَكَ اللَّهُ لَكُمَا', weights: [400, 700] },
  { name: 'Reem Kufi', category: 'islamic', categoryLabel: 'Islamic Heritage', fallback: 'sans-serif', sample: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم', weights: [500, 700] },
  { name: 'Katibeh', category: 'islamic', categoryLabel: 'Islamic Heritage', fallback: 'serif', sample: 'نَسْأَلُ اللَّهَ الْبَرَكَةَ' },
  { name: 'Scheherazade New', category: 'islamic', categoryLabel: 'Islamic Heritage', fallback: 'serif', sample: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا', weights: [400, 700] },
];

/**
 * Cache Set untuk melacak font Google yang sudah di-load di DOM browser.
 */
const loadedGoogleFonts = new Set<string>();

/**
 * Memuat font Google secara dinamis ke document.head saat dipilih / dirender.
 */
export function loadGoogleFont(fontName?: string): void {
  if (!fontName || typeof window === 'undefined' || typeof document === 'undefined') return;
  const trimmed = fontName.trim();
  if (!trimmed || loadedGoogleFonts.has(trimmed)) return;

  const fontOption = STUDIO_FONTS.find((f) => f.name.toLowerCase() === trimmed.toLowerCase());
  const actualName = fontOption?.name ?? trimmed;

  try {
    const linkId = `google-font-${actualName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    if (document.getElementById(linkId)) {
      loadedGoogleFonts.add(trimmed);
      return;
    }

    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    const familyParam = actualName.replace(/ /g, '+');
    const weightsParam = fontOption?.weights && fontOption.weights.length > 0
      ? `:wght@${fontOption.weights.join(';')}`
      : ':ital,wght@0,400;0,600;0,700;1,400';

    link.href = `https://fonts.googleapis.com/css2?family=${familyParam}${weightsParam}&display=swap`;
    document.head.appendChild(link);
    loadedGoogleFonts.add(trimmed);
  } catch (err) {
    console.warn(`[HariKita Font Loader] Gagal memuat Google Font: ${actualName}`, err);
  }
}

/**
 * Menghasilkan CSS font-family string lengkap dengan fallback yang aman.
 */
export function getFontFamilyCss(fontName?: string): string {
  if (!fontName) return 'inherit';
  const opt = STUDIO_FONTS.find((f) => f.name.toLowerCase() === fontName.toLowerCase());
  const fallback = opt?.fallback ?? 'sans-serif';
  return `"${opt?.name ?? fontName}", ${fallback}`;
}
