/**
 * Master Katalog Multi-Vendor Kebumen
 * Menyediakan struktur data multi-vendor di 11 kategori layanan terpadu
 */

export interface VendorPackage {
  id: string;
  name: string;
  price: number; // in IDR
  desc: string;
  callTime: string; // e.g. "05:00 WIB"
  features: string[];
}

export interface VendorPortfolioItem {
  id: string;
  url: string;
  caption: string;
  locationTag: string;
  styleTags: string[];
}

export interface VendorProfile {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  categoryTitle: string;
  district: string; // Kecamatan di Kebumen
  avatar: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  bio: string;
  packages: VendorPackage[];
  portfolio: VendorPortfolioItem[];
  blackoutDates: string[]; // YYYY-MM-DD
}

export const KEBUMEN_DISTRICTS = [
  "Kebumen Kota",
  "Gombong",
  "Karanganyar",
  "Kutowinangun",
  "Ayah",
  "Puring",
  "Petanahan",
  "Prembun",
  "Alian",
  "Sruweng",
  "Klirong",
  "Buluspesantren",
] as const;

export const MULTI_VENDOR_CATALOG: VendorProfile[] = [
  // 1. PRE-WEDDING
  {
    id: "v_prewed_01",
    slug: "menganti-cinematic",
    name: "Menganti Cinematic & Studio",
    categoryId: "prewed",
    categoryTitle: "Pre-wedding Alam & Studio",
    district: "Ayah",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200",
    rating: 4.9,
    reviewCount: 42,
    verified: true,
    bio: "Spesialis pre-wedding alam terbuka di Pantai Menganti, Bukit Hud, dan tebing karang samudra Kebumen. Pilot drone tersertifikasi.",
    packages: [
      {
        id: "pkg_prewed_basic",
        name: "Paket Pantai Menganti Sunset",
        price: 3500000,
        desc: "Spot Pantai Menganti & bukit eksotis, 2 busana, drone aerial, 25 edited photo, teaser 60s.",
        callTime: "14:00 WIB",
        features: ["Spot Pantai Menganti & Bukit Hud", "Drone 4K Aerial Footage", "25 Foto Edit + Flashdisk Kayu", "Teaser Sinematik 60 Detik"],
      },
      {
        id: "pkg_prewed_all_in",
        name: "Paket All-Day Kebumen Adventure",
        price: 5500000,
        desc: "3 Lokasi: Studio Kebumen Kota, Bukit Hud, dan Sunset Menganti. Termasuk gaun prewed & rias.",
        callTime: "07:00 WIB",
        features: ["3 Spot Eksotis Kebumen", "Termasuk 2 Gaun Prewed & Rias MUA", "50 Foto Edit High-Res", "Film Sinematik 3 Menit 4K"],
      },
    ],
    portfolio: [
      {
        id: "p_1",
        url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800",
        caption: "Golden Hour Sunset di Tebing Pantai Menganti",
        locationTag: "Pantai Menganti, Ayah",
        styleTags: ["Outdoor", "Sunset", "Cinematic"],
      },
      {
        id: "p_2",
        url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=800",
        caption: "Prewed Santai Nuansa Casual Bukit Hud",
        locationTag: "Bukit Hud, Ayah",
        styleTags: ["Casual", "Alam", "Romantic"],
      },
    ],
    blackoutDates: ["2026-10-10", "2026-10-17"],
  },
  {
    id: "v_prewed_02",
    slug: "lensa-walet-studio",
    name: "Lensa Walet Studio & Outdoor",
    categoryId: "prewed",
    categoryTitle: "Pre-wedding Alam & Studio",
    district: "Kebumen Kota",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
    coverImage: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200",
    rating: 4.8,
    reviewCount: 38,
    verified: true,
    bio: "Studio pre-wedding indoor ber-AC di pusat Kebumen Kota dengan 8 tema latar estetik serta paket outdoor seputar Alun-Alun dan Goa Jatijajar.",
    packages: [
      {
        id: "pkg_prewed_indoor",
        name: "Paket Studio Intimate Minimalis",
        price: 2200000,
        desc: "Sesi indoor 3 jam studio full AC, 3 background konsep, 20 edited photo, cetak frame 16RP.",
        callTime: "09:00 WIB",
        features: ["8 Tema Background Studio", "Peminjaman Properti Bunga & Kursi Rotan", "20 Edited Photo", "Frame Minimalis 16RP"],
      },
    ],
    portfolio: [
      {
        id: "p_3",
        url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800",
        caption: "Konsep Minimalis Modern Editorial Studio",
        locationTag: "Kebumen Kota",
        styleTags: ["Indoor", "Studio", "Minimalist"],
      },
    ],
    blackoutDates: ["2026-10-25"],
  },

  // 2. BUSANA PENGANTIN & FITTING
  {
    id: "v_busana_01",
    slug: "griya-busana-rarasati",
    name: "Griya Busana Rarasati",
    categoryId: "busana",
    categoryTitle: "Busana Pengantin & Fitting",
    district: "Kebumen Kota",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
    coverImage: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200",
    rating: 4.9,
    reviewCount: 56,
    verified: true,
    bio: "Koleksi kebaya brokat modern, beskap adat Jawa Solo/Yogya halus, dan busana keluarga lengkap dengan 2x jadwal fitting gratis.",
    packages: [
      {
        id: "pkg_busana_akad",
        name: "Sewa Perdana Akad & Resepsi",
        price: 2800000,
        desc: "Sewa perdana kebaya modern / beskap adat Jawa, aksesori lengkap, dan 2x sesi fitting gratis.",
        callTime: "06:00 WIB",
        features: ["Kebaya Brokat Payet Mewah", "Beskap Sikepan Adat Jawa Halus", "Aksesori Lengkap Jarik, Keris, Selop", "2x Sesi Fitting Fisik Gratis"],
      },
      {
        id: "pkg_busana_family",
        name: "Paket Lengkap Pengantin + 4 Orang Tua",
        price: 4500000,
        desc: "Busana pengantin sepasang + 2 kebaya ibu + 2 beskap bapak pengantin & besan.",
        callTime: "05:30 WIB",
        features: ["Busana Pengantin Sepasang", "4 Busana Lengkap Orang Tua & Besan", "Aksesori & Selop Serasi", "Pengantaran & Pengambilan Gratis Kebumen"],
      },
    ],
    portfolio: [
      {
        id: "p_4",
        url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800",
        caption: "Beskap Sikepan Keraton & Kebaya Emas",
        locationTag: "Kebumen Kota",
        styleTags: ["Adat Jawa", "Keraton", "Beskap"],
      },
      {
        id: "p_5",
        url: "https://images.unsplash.com/photo-1529636798458-92182e662485?q=80&w=800",
        caption: "Kebaya Modern Warna Champagne",
        locationTag: "Kebumen Kota",
        styleTags: ["Modern", "Champagne", "Payet"],
      },
    ],
    blackoutDates: ["2026-11-01"],
  },

  // 3. MAKEUP ARTIST (MUA)
  {
    id: "v_mua_01",
    slug: "alula-mua-styling",
    name: "Alula MUA & Hijab Styling",
    categoryId: "mua",
    categoryTitle: "Makeup Artist (MUA)",
    district: "Kebumen Kota",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
    coverImage: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1200",
    rating: 5.0,
    reviewCount: 64,
    verified: true,
    bio: "Rias pengantin soft glam glowing, ronce melati asli keraton, hijab styling syar'i modern tahan 12 jam dengan produk premium internasional.",
    packages: [
      {
        id: "pkg_mua_akad",
        name: "Paket Rias Pengantin Soft Glam",
        price: 2200000,
        desc: "Rias pengantin soft glam / adat, melati segar keraton, hijab styling syar'i, touch-up standby.",
        callTime: "05:00 WIB",
        features: ["Foundation Tahan 12 Jam Flawless", "Ronce Melati Asli Kebumen Segar", "Hijab Styling Syar'i / Paes Modern", "Touch-up Standby hingga Resepsi Usai"],
      },
    ],
    portfolio: [
      {
        id: "p_6",
        url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=800",
        caption: "Soft Glam Makeup Korean Glow Akad Nikah",
        locationTag: "Kebumen Kota",
        styleTags: ["Soft Glam", "Korean Glow", "Melati"],
      },
    ],
    blackoutDates: [],
  },

  // 4. KOTAK SESERAHAN & MAHAR
  {
    id: "v_seserahan_01",
    slug: "hantaran-lestari-kebumen",
    name: "Hantaran Lestari Kebumen",
    categoryId: "seserahan",
    categoryTitle: "Seserahan Akrilik & Mahar",
    district: "Karanganyar",
    avatar: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=200",
    coverImage: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1200",
    rating: 4.9,
    reviewCount: 31,
    verified: true,
    bio: "Sewa baki akrilik kristal kombinasi kayu jati solid, hiasan bunga sutra impor, serta jasa pembuatan pigura mahar logam mulia 3D.",
    packages: [
      {
        id: "pkg_seserahan_7baki",
        name: "Paket 7 Baki Akrilik Kristal Premium",
        price: 1050000,
        desc: "Baki akrilik kristal kombinasi kayu jati, bunga premium, kalkulator fleksibel per kotak.",
        callTime: "H-1 Acara",
        features: ["7 Baki Akrilik Tebal Anti Gores", "Tatakan Kayu Jati Finishing Natural", "Bunga Sutra & Pita Satin Serasi", "Gratis Jasa Tata Seserahan"],
      },
    ],
    portfolio: [
      {
        id: "p_7",
        url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800",
        caption: "Dekorasi 7 Baki Hantaran Nuansa Putih Emas",
        locationTag: "Karanganyar",
        styleTags: ["Akrilik", "Kayu Jati", "Seserahan"],
      },
    ],
    blackoutDates: [],
  },

  // 5. DOKUMENTASI FOTO & VIDEO HARI H
  {
    id: "v_foto_01",
    slug: "pradana-cinema-story",
    name: "Pradana Cinema & Story",
    categoryId: "foto",
    categoryTitle: "Dokumentasi Foto & Video",
    district: "Kebumen Kota",
    avatar: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=200",
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200",
    rating: 4.9,
    reviewCount: 47,
    verified: true,
    bio: "Tim liputan profesional akad dan resepsi dengan pendekatan sinematik emosional. Menangkap setiap tangis haru dan senyum restu orang tua.",
    packages: [
      {
        id: "pkg_foto_wedding",
        name: "Paket Liputan Penuh Akad & Resepsi",
        price: 4200000,
        desc: "Liputan hari H akad & resepsi, video cinematic 7 menit, teaser Reels, flashdisk kayu eksklusif.",
        callTime: "07:30 WIB",
        features: ["2 Fotografer + 1 Videografer Profesional", "Video Sinematik Teaser 60s + Film 7 Menit", "Seluruh Foto High-Res + 60 Edited", "Box Flashdisk Kayu Ukir Inisial"],
      },
    ],
    portfolio: [
      {
        id: "p_8",
        url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800",
        caption: "Ijab Kabul Akad Nikah Khidmat & Sakral",
        locationTag: "Kebumen Kota",
        styleTags: ["Akad", "Sinematik", "Liputan"],
      },
    ],
    blackoutDates: [],
  },

  // 6. DEKORASI & FLORIST
  {
    id: "v_dekor_01",
    slug: "asmara-flora-pelaminan",
    name: "Asmara Flora & Pelaminan",
    categoryId: "dekor",
    categoryTitle: "Dekorasi Pelaminan & Florist",
    district: "Gombong",
    avatar: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=200",
    coverImage: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1200",
    rating: 4.9,
    reviewCount: 52,
    verified: true,
    bio: "Dekorasi pelaminan intimate adat Jawa modern dan rustic elegan dengan rangkaian bunga mawar dan melati segar.",
    packages: [
      {
        id: "pkg_dekor_intimate",
        name: "Pelaminan Intimate 4-6 Meter Bunga Segar",
        price: 5500000,
        desc: "Pelaminan intimate 4-6 meter bunga segar, karpet jalan, photobooth lamaran estetik.",
        callTime: "06:00 WIB",
        features: ["Pelaminan 4-6 Meter Bunga Segar Asli", "Karpet Permadani Jalan Pengantin", "Pergola Pintu Masuk Estetik", "Photobooth Tamu dengan Standing Sign"],
      },
    ],
    portfolio: [
      {
        id: "p_9",
        url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800",
        caption: "Pelaminan Intimate Rustic Floral Kebumen",
        locationTag: "Gombong",
        styleTags: ["Pelaminan", "Bunga Segar", "Rustic"],
      },
    ],
    blackoutDates: [],
  },

  // 7. KATERING & FOOD STALLS
  {
    id: "v_katering_01",
    slug: "dapur-rasa-boga",
    name: "Dapur Rasa Boga Kebumen",
    categoryId: "katering",
    categoryTitle: "Katering Prasmanan & Stall",
    district: "Kutowinangun",
    avatar: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=200",
    coverImage: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1200",
    rating: 4.8,
    reviewCount: 71,
    verified: true,
    bio: "Katering prasmanan higienis bercita rasa khas Kebumen. Gratis Sample Box Test Food diantar langsung ke rumah calon pengantin.",
    packages: [
      {
        id: "pkg_katering_pax",
        name: "Prasmanan Komplit Khas Kebumen",
        price: 45000, // per pax
        desc: "Menu komplit khas Kebumen, waiter standby, gratis Sample Test Food Box sebelum hari H.",
        callTime: "09:30 WIB",
        features: ["Prasmanan 6 Menu Utama + 2 Menu Penutup", "Pramusaji Berseragam Rapi Standby", "Peralatan Roll-Top Chafing Dish Bersih", "Gratis Sample Box Test Food 3 Porsi"],
      },
    ],
    portfolio: [
      {
        id: "p_10",
        url: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800",
        caption: "Sajian Prasmanan Komplit & Higienis",
        locationTag: "Kutowinangun",
        styleTags: ["Prasmanan", "Test Food", "Higienis"],
      },
    ],
    blackoutDates: [],
  },

  // 8. WEDDING CAKE & DESSERT
  {
    id: "v_cake_01",
    slug: "laura-patisserie-cakes",
    name: "L'Aura Patisserie & Cakes",
    categoryId: "cake",
    categoryTitle: "Wedding Cake & Dessert",
    district: "Kebumen Kota",
    avatar: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?q=80&w=200",
    coverImage: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?q=80&w=1200",
    rating: 4.9,
    reviewCount: 29,
    verified: true,
    bio: "Kue pernikahan bertingkat estetik senada warna dekorasi serta meja sweet corner berisi aneka puding cup, macarons, dan mini tart.",
    packages: [
      {
        id: "pkg_cake_tier",
        name: "Tiered Wedding Cake & Sweet Corner",
        price: 1600000,
        desc: "Kue pengantin 2 tingkat senada dekorasi + dessert table (pudding, macarons, cupcakes).",
        callTime: "10:00 WIB",
        features: ["Kue Pengantin 2 Tingkat Custom Desain", "Dessert Table Mini (50 Pcs Aneka Kue)", "Gratis Cake Taster Box 3 Rasa", "Standing Cake Kristal & Pisau Hias"],
      },
    ],
    portfolio: [
      {
        id: "p_11",
        url: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?q=80&w=800",
        caption: "Kue Pengantin 2 Tingkat Aksen Bunga Segar",
        locationTag: "Kebumen Kota",
        styleTags: ["Cake", "2 Tingkat", "Dessert"],
      },
    ],
    blackoutDates: [],
  },

  // 9. SOUVENIR ANYAMAN PANDAN
  {
    id: "v_souvenir_01",
    slug: "kriya-anyam-gombong",
    name: "Kriya Anyam Gombong",
    categoryId: "souvenir",
    categoryTitle: "Souvenir Anyaman Pandan",
    district: "Gombong",
    avatar: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=200",
    coverImage: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200",
    rating: 4.9,
    reviewCount: 34,
    verified: true,
    bio: "Pouch ramah lingkungan kombinasi anyaman serat pandan alami pengrajin lokal Gombong dan kain linen sablon nama pengantin.",
    packages: [
      {
        id: "pkg_souvenir_pouch",
        name: "Pouch Linen Pandan Custom Inisial",
        price: 15000, // per pcs
        desc: "Pouch ramah lingkungan kombinasi anyaman pandan Kebumen & linen inisial nama.",
        callTime: "H-2 Acara",
        features: ["Serat Pandan Asli Pengrajin Gombong", "Cetak Inisial Pengantin Elegan", "Kemas Tali Rami & Kartu Terima Kasih", "Minimal Pesanan 50 Pcs"],
      },
    ],
    portfolio: [
      {
        id: "p_12",
        url: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800",
        caption: "Pouch Anyaman Pandan Khas Gombong",
        locationTag: "Gombong",
        styleTags: ["Pandan", "Ramah Lingkungan", "Pouch"],
      },
    ],
    blackoutDates: [],
  },

  // 10. UNDANGAN DIGITAL & WAX SEAL
  {
    id: "v_undangan_01",
    slug: "harikita-digital-print",
    name: "HariKita Digital & Print",
    categoryId: "undangan",
    categoryTitle: "Undangan Digital & Wax Seal",
    district: "Kebumen Kota",
    avatar: "https://helloguest.id/wp-content/uploads/2025/01/Autumnelle.webp",
    coverImage: "https://helloguest.id/wp-content/uploads/2025/01/Autumnelle.webp",
    rating: 5.0,
    reviewCount: 92,
    verified: true,
    bio: "Website undangan digital responsif dengan 65+ tema estetika, RSVP server action, dan bundel 100 pcs undangan cetak hardcover segel lilin 3D.",
    packages: [
      {
        id: "pkg_undangan_hybrid",
        name: "Bundel Website Undangan + 100 Cetak Wax Seal",
        price: 1250000,
        desc: "Website undangan (65+ varian tema, musik, RSVP) + 100 pcs cetak hardcover segel lilin 3D.",
        callTime: "H-30 Acara",
        features: ["Website Undangan Aktif Selamanya", "Musik Otomatis, RSVP, & Amplop QRIS", "100 Pcs Cetak Hardcover Tebal", "Segel Lilin Asli 3D Custom Inisial"],
      },
    ],
    portfolio: [
      {
        id: "p_13",
        url: "https://helloguest.id/wp-content/uploads/2025/01/Autumnelle.webp",
        caption: "Tema Undangan Digital Autumnelle",
        locationTag: "Kebumen Kota",
        styleTags: ["Digital", "Wax Seal", "Hardcover"],
      },
    ],
    blackoutDates: [],
  },

  // 11. CUTE ILLUSTRATED MAP
  {
    id: "v_denah_01",
    slug: "denah-kita-kartun-estetik",
    name: "Denah Kita Kartun Estetik",
    categoryId: "denah",
    categoryTitle: "Cute Illustrated Map",
    district: "Kebumen Kota",
    avatar: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=200",
    coverImage: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200",
    rating: 4.8,
    reviewCount: 25,
    verified: true,
    bio: "Ilustrasi peta kartun lucu rute lokasi gedung/rumah acara di Kebumen, terintegrasi QR Code navigasi Google Maps dan Waze.",
    packages: [
      {
        id: "pkg_denah_kartun",
        name: "Gambar Ilustrasi Denah Kartun + QR Code",
        price: 250000,
        desc: "Ilustrasi peta kartun rute gedung resepsi Kebumen terintegrasi barcode navigasi Google Maps.",
        callTime: "H-20 Acara",
        features: ["Gambar Ilustrasi Kartun Landmark Kebumen", "Integrasi QR Code Navigasi Google Maps", "Format High-Res Siap Cetak & Kirim WA", "Revisi Posisi Jalan Sampai Akurat"],
      },
    ],
    portfolio: [
      {
        id: "p_14",
        url: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=800",
        caption: "Peta Denah Kartun Gedung Resepsi",
        locationTag: "Kebumen Kota",
        styleTags: ["Kartun", "Denah", "QR Code"],
      },
    ],
    blackoutDates: [],
  },
];
