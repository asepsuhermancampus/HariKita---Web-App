/**
 * HariKita - Deterministic Multi-Vendor Catalog Generator
 *
 * Menghasilkan 220 vendor (11 kategori x 20 vendor) dengan 15 produk per vendor
 * = 3.300 produk. Nilai-nilai sepenuhnya deterministik (tidak ada Math.random),
 * sehingga output stabil antar build.
 *
 * Catatan: `GENERATOR_DISTRICTS` sengaja didefinisikan lokal (bukan mengimpor
 * `KEBUMEN_DISTRICTS`) untuk menghindari dependensi melingkar, karena
 * `multi-vendor-catalog.ts` mengimpor generator ini.
 */

import type { VendorProduct, UnitType } from "./product-types";

const GENERATOR_DISTRICTS = [
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

interface ProductTemplate {
  slug: string;
  name: string;
  price: number;
  unitType: UnitType;
  unitLabel: string;
  minQuantity?: number;
  maxQuantity?: number;
  productTags: string[];
}

interface CategoryTemplate {
  categoryId: string;
  categoryTitle: string;
  vendorNames: string[]; // 20 nama vendor
  products: ProductTemplate[]; // 15 produk
}

export interface GeneratorVendor {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  categoryTitle: string;
  district: string;
  avatar: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  bio: string;
  tagline: string;
  products: VendorProduct[];
  portfolio: never[];
  blackoutDates: string[];
}

const VALID_UNSPLASH_IDS = [
  "1519741497674-611481863552",
  "1511285560929-80b456fea0bc",
  "1583939003579-730e3918a45a",
  "1522337360788-8b13dee7a37e",
  "1522673607200-164d1b6ce486",
  "1465495976277-4387d4b0b4c6",
  "1537633552985-df8429e8048b",
  "1509927083803-4bd519298ac4",
  "1492684223066-81342ee5ff30",
  "1518895949257-7621c3c786d7",
  "1529636798458-92182e662485",
  "1606800052052-a08af7148866",
  "1519225421980-715cb0215aed",
  "1520854221256-17451cc331bf",
  "1564507592333-c60657eea523",
  "1542838132-92c53300491e",
  "1507003211169-0a1dd7228f2d",
  "1534528741775-53994a69daeb",
];

/** Unsplash photo-id terkurasi deterministik (valid 100% tanpa 404). */
const IMG = (n: number) => {
  const id = VALID_UNSPLASH_IDS[Math.abs(n) % VALID_UNSPLASH_IDS.length];
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;
};


const PKG = "per paket";
const PAX = "per pax";
const PCS = "per pcs";
const PORSI = "per porsi";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Fitur default per kategori (dipakai di desc/features produk). */
const CATEGORY_FEATURES: Record<string, string[]> = {
  prewed: ["Fotografer & MUA berpengalaman", "Drone 4K aerial", "Unlimited shot", "Album + flashdisk kayu"],
  busana: ["Fitting 2x gratis", "Layanan antar-jemput", "Dry clean sebelum pakai", "Aksesori lengkap"],
  mua: ["Produk premium tahan lama", "Trial makeup gratis", "Melayani adat & modern", "Asisten rias standby"],
  seserahan: ["Custom nama & tanggal", "Bunga segar pilihan", "Kemas rapi & aman", "Konsultasi tema gratis"],
  foto: ["Tim liputan 2 kamera", "Cinematic highlight", "Editing warna konsisten", "Delivery tepat waktu"],
  dekor: ["Bunga segar & artifisial", "Setup + bongkar", "Konsultasi desain", "Tim dekorasi profesional"],
  katering: ["Higienis & profesional", "Pramusaji standby", "Peralatan lengkap", "Bahan segar pilihan"],
  cake: ["Bahan premium", "Desain custom tema", "Pengiriman tepat waktu", "Free topper & lilin"],
  souvenir: ["Packaging eksklusif", "Custom label nama", "Produksi cepat", "Harga grosir"],
  undangan: ["Bisa revisi 3x", "Desain responsif", "Backsound & galeri", "Amplop + kartu ucapan"],
  denah: ["Ilustrasi custom", "QR Google Maps", "File siap cetak", "Revisi minor gratis"],
};

const TEMPLATES: CategoryTemplate[] = [
  // ============================================================
  // 1. KATERING
  // ============================================================
  {
    categoryId: "katering",
    categoryTitle: "Katering Prasmanan & Stall",
    vendorNames: [
      "Dapur Bahagia", "Dapur Nusantara", "Rasa Boga Kebumen", "Catering Sekar Arum",
      "Boga Rasa Gombong", "Dapur Ibu Sari", "Prasmanan Amanah", "Selera Kutowinangun",
      "Katering Berkah", "Dapur Mawar", "Nusa Boga", "Ratu Katering",
      "Prasmanan Lestari", "Dapur Rumahan", "Aroma Boga", "Gizi Prima Catering",
      "Dapur Sederhana", "Kenanga Catering", "Rasa Bunda", "Pesta Rasa",
    ],
    products: [
      { slug: "paket-prasmanan-silver", name: "Paket Prasmanan Silver", price: 35000, unitType: "pax", unitLabel: PAX, minQuantity: 100, productTags: ["prasmanan"] },
      { slug: "paket-prasmanan-gold", name: "Paket Prasmanan Gold", price: 55000, unitType: "pax", unitLabel: PAX, minQuantity: 100, productTags: ["prasmanan"] },
      { slug: "paket-prasmanan-premium", name: "Paket Prasmanan Premium", price: 85000, unitType: "pax", unitLabel: PAX, minQuantity: 100, productTags: ["prasmanan"] },
      { slug: "paket-prasmanan-royal", name: "Paket Prasmanan Royal", price: 125000, unitType: "pax", unitLabel: PAX, minQuantity: 100, productTags: ["prasmanan"] },
      { slug: "stall-bakso", name: "Stall Bakso Sapi", price: 35000, unitType: "pax", unitLabel: PAX, minQuantity: 50, productTags: ["stall"] },
      { slug: "stall-sate", name: "Stall Sate Ayam", price: 38000, unitType: "pax", unitLabel: PAX, minQuantity: 50, productTags: ["stall"] },
      { slug: "stall-soto", name: "Stall Soto Kebumen", price: 32000, unitType: "pax", unitLabel: PAX, minQuantity: 50, productTags: ["stall"] },
      { slug: "stall-mie-ayam", name: "Stall Mie Ayam", price: 30000, unitType: "pax", unitLabel: PAX, minQuantity: 50, productTags: ["stall"] },
      { slug: "stall-siomay", name: "Stall Siomay & Batagor", price: 28000, unitType: "pax", unitLabel: PAX, minQuantity: 50, productTags: ["stall"] },
      { slug: "stall-gudeg", name: "Stall Gudeg Kebumen", price: 33000, unitType: "pax", unitLabel: PAX, minQuantity: 50, productTags: ["stall"] },
      { slug: "dessert-corner", name: "Dessert Corner", price: 25000, unitType: "pax", unitLabel: PAX, minQuantity: 50, productTags: ["dessert"] },
      { slug: "puding", name: "Puding Cup Aneka Rasa", price: 8000, unitType: "piece", unitLabel: PCS, minQuantity: 50, productTags: ["dessert"] },
      { slug: "es-krim", name: "Es Krim Booth", price: 15000, unitType: "piece", unitLabel: PCS, minQuantity: 50, productTags: ["dessert"] },
      { slug: "snack-box", name: "Snack Box", price: 18000, unitType: "piece", unitLabel: PCS, minQuantity: 50, productTags: ["snack"] },
      { slug: "minuman-tradisional", name: "Minuman Tradisional", price: 10000, unitType: "piece", unitLabel: PCS, minQuantity: 50, productTags: ["minuman"] },
    ],
  },

  // ============================================================
  // 2. PRE-WEDDING
  // ============================================================
  {
    categoryId: "prewed",
    categoryTitle: "Pre-wedding Alam & Studio",
    vendorNames: [
      "Menganti Cinematic", "Lensa Walet Studio", "Jatijajar Photo Works", "Bukit Hud Visual",
      "Pantai Ayah Prewed", "Studio Kebumen Raya", "Golden Hour Kebumen", "Aperture Prewedding",
      "Sagara Visual", "Karst Photo House", "Petruk Studio", "Lensa Bumi Kebumen",
      "Cahaya Timur Studio", "Rimba Prewed", "Selatan Photo", "Nusantara Frame",
      "Pesisir Visual", "Bukit Soka Studio", "Ceria Prewedding", "Lensa Adat Jawa",
    ],
    products: [
      { slug: "paket-pantai-menganti-sunset", name: "Paket Pantai Menganti Sunset", price: 3500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["outdoor", "drone"] },
      { slug: "paket-all-day-adventure", name: "Paket All-Day Kebumen Adventure", price: 5500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["outdoor", "drone"] },
      { slug: "paket-studio-minimalis", name: "Paket Studio Minimalis", price: 1800000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["studio", "indoor"] },
      { slug: "paket-studio-premium", name: "Paket Studio Premium 8 Tema", price: 2750000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["studio", "indoor"] },
      { slug: "paket-outdoor-jatijajar", name: "Paket Outdoor Goa Jatijajar", price: 3200000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["outdoor"] },
      { slug: "paket-bukit-hud", name: "Paket Bukit Hud Eksotis", price: 3000000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["outdoor"] },
      { slug: "paket-drone-aerial", name: "Paket Drone Aerial Cinematic", price: 4200000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["drone", "cinematic"] },
      { slug: "paket-prewed-casual", name: "Paket Prewed Casual", price: 1500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["outdoor"] },
      { slug: "paket-prewed-adat", name: "Paket Prewed Adat Jawa", price: 3800000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["studio", "outdoor"] },
      { slug: "paket-prewed-beach", name: "Paket Prewed Beach Walk", price: 3300000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["outdoor"] },
      { slug: "paket-prewed-sunrise", name: "Paket Prewed Sunrise Pantai", price: 3600000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["outdoor"] },
      { slug: "paket-prewed-forest", name: "Paket Prewed Hutan Pinus", price: 2900000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["outdoor"] },
      { slug: "paket-prewed-city", name: "Paket Prewed City Light", price: 2600000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["indoor", "outdoor"] },
      { slug: "album-eksklusif", name: "Album Eksklusif Magnetic", price: 950000, unitType: "piece", unitLabel: PCS, minQuantity: 1, productTags: ["album"] },
      { slug: "video-teaser-60s", name: "Video Teaser 60 Detik 4K", price: 1250000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["cinematic"] },
    ],
  },

  // ============================================================
  // 3. BUSANA
  // ============================================================
  {
    categoryId: "busana",
    categoryTitle: "Busana Pengantin & Fitting",
    vendorNames: [
      "Kebaya Ayu Kebumen", "Sanggar Busana Lestari", "Butik Sekar Melati", "Galeri Gaun Bunda",
      "Busana Adat Nusantara", "Rumah Kebaya Gombong", "Butik Mutiara", "Sanggar Pengantin Jawa",
      "Gaun Modern Kebumen", "Butik Kartika", "Rumah Busana Anggun", "Sanggar Srikandi",
      "Butik Queens Kebumen", "Galeri Pengantin Sakti", "Busana Ratu", "Sanggar Endah",
      "Butik Pesona", "Rumah Pengantin Laras", "Gaun Diva Kebumen", "Sanggar Mawar Putih",
    ],
    products: [
      { slug: "sewa-akad-modern", name: "Sewa Busana Akad Modern", price: 2500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["modern"] },
      { slug: "sewa-resepsi-putih", name: "Sewa Busana Resepsi Putih", price: 3500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["modern"] },
      { slug: "sewa-kebaya-adat", name: "Sewa Kebaya Adat Jawa", price: 4000000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["adat"] },
      { slug: "sewa-beskap-adat", name: "Sewa Beskap & Kebaya Adat", price: 4500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["adat"] },
      { slug: "sewa-paes-keraton", name: "Sewa Paes & Busana Keraton", price: 6000000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["adat"] },
      { slug: "busana-keluarga", name: "Sewa Busana Keluarga (6 org)", price: 3200000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["keluarga"] },
      { slug: "busana-orangtua", name: "Sewa Busana Orang Tua", price: 1500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["keluarga"] },
      { slug: "busana-bridesmaid", name: "Sewa Busana Bridesmaid (per org)", price: 450000, unitType: "piece", unitLabel: PCS, minQuantity: 4, productTags: ["keluarga"] },
      { slug: "sewa-gaun-gaun", name: "Sewa Gaun Pesta Modern", price: 1850000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["modern"] },
      { slug: "sewa-jas-pria", name: "Sewa Jas Pria Tailor", price: 1200000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["modern"] },
      { slug: "sewa-kebaya-bali", name: "Sewa Kebaya Bali & Kamen", price: 3800000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["adat"] },
      { slug: "sewa-busana-sunda", name: "Sewa Busana Adat Sunda", price: 3700000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["adat"] },
      { slug: "aksesori-lengkap", name: "Paket Aksesori Lengkap", price: 750000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["keluarga"] },
      { slug: "fitting-premium", name: "Jasa Fitting & Alterasi Premium", price: 500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["modern"] },
      { slug: "sewa-busana-hamil", name: "Sewa Busana Pengantin Hamil", price: 2900000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["modern"] },
    ],
  },

  // ============================================================
  // 4. MUA
  // ============================================================
  {
    categoryId: "mua",
    categoryTitle: "Makeup Artist (MUA)",
    vendorNames: [
      "MUA Ayu Kebumen", "Rias Cantik Gombong", "Makeup by Sari", "Sanggar Rias Melati",
      "MUA Nirmala", "Rias Pengantin Jawa Kebumen", "Beauty by Dewi", "MUA Kartini",
      "Rias Soft Glam Kebumen", "Makeup Artist Sekar", "MUA Puspita", "Rias Hijab Kebumen",
      "MUA Ratna", "Beauty Studio Kebumen", "Rias Adat Jawa Lestari", "MUA Intan",
      "Makeup by Wulan", "Rias Pengantin Ayu", "MUA Bunga", "Beauty by Citra",
    ],
    products: [
      { slug: "soft-glam-akad", name: "Soft Glam Akad", price: 1800000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["soft-glam"] },
      { slug: "soft-glam-resepsi", name: "Soft Glam Resepsi", price: 2500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["soft-glam"] },
      { slug: "makeup-adat-jawa", name: "Makeup Adat Jawa Keraton", price: 3500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["adat"] },
      { slug: "makeup-adat-sunda", name: "Makeup Adat Sunda", price: 3200000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["adat"] },
      { slug: "makeup-hijab-akad", name: "Makeup Hijab Akad", price: 1900000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["hijab"] },
      { slug: "makeup-hijab-resepsi", name: "Makeup Hijab Resepsi", price: 2600000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["hijab"] },
      { slug: "makeup-engagement", name: "Makeup Engagement", price: 1500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["soft-glam"] },
      { slug: "makeup-sangjit", name: "Makeup Siraman & Sangjit", price: 1200000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["adat"] },
      { slug: "makeup-ibadah", name: "Makeup Ibadah / Akad Sederhana", price: 900000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["hijab"] },
      { slug: "makeup-keluarga", name: "Makeup Keluarga (per org)", price: 450000, unitType: "piece", unitLabel: PCS, minQuantity: 2, productTags: ["soft-glam"] },
      { slug: "makeup-bridesmaid", name: "Makeup Bridesmaid (per org)", price: 400000, unitType: "piece", unitLabel: PCS, minQuantity: 2, productTags: ["soft-glam"] },
      { slug: "hairdo-do", name: "Hair Do & Sanggul Adat", price: 750000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["adat"] },
      { slug: "makeup-trial", name: "Trial Makeup + Konsultasi", price: 350000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["soft-glam"] },
      { slug: "makeup-touchup", name: "Touch-Up On-Site", price: 600000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["soft-glam"] },
      { slug: "makeup-prewed", name: "Makeup Prewedding", price: 1000000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["soft-glam"] },
    ],
  },

  // ============================================================
  // 5. SESERAHAN
  // ============================================================
  {
    categoryId: "seserahan",
    categoryTitle: "Seserahan Akrilik & Mahar",
    vendorNames: [
      "Seserahan Akrilik Kebumen", "Mahar Cantik Gombong", "Galeri Hantaran Lestari", "Seserahan Bunga Ayu",
      "Mahar Kebumen Craft", "Seserahan Adat Jawa", "Galeri Seserahan Mewah", "Seserahan Sekar",
      "Mahar Modern Kebumen", "Seserahan Akrilik Prima", "Galeri Hantaran Ratna", "Seserahan Cantik",
      "Mahar Eksklusif Kebumen", "Seserahan Kartika", "Galeri Mahar Nusantara", "Seserahan Melati",
      "Mahar Kayu Jati", "Seserahan Puspita", "Galeri Seserahan Indah", "Seserahan Bunga Melur",
    ],
    products: [
      { slug: "seserahan-akrilik-7-baki", name: "Seserahan Akrilik 7 Baki", price: 2500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["akrilik"] },
      { slug: "seserahan-akrilik-11-baki", name: "Seserahan Akrilik 11 Baki", price: 3800000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["akrilik"] },
      { slug: "seserahan-akrilik-15-baki", name: "Seserahan Akrilik 15 Baki", price: 5200000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["akrilik"] },
      { slug: "mahar-emas-custom", name: "Mahar Emas Custom Ukir", price: 4500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["mahar"] },
      { slug: "mahar-uang-akrilik", name: "Mahar Uang Akrilik Custom", price: 1200000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["mahar", "akrilik"] },
      { slug: "mahar-sepatu", name: "Mahar Sepatu & Perhiasan", price: 1800000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["mahar"] },
      { slug: "mahar-kayu-jati", name: "Mahar Ukir Kayu Jati", price: 2200000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["jati", "mahar"] },
      { slug: "baki-jati-klasik", name: "Baki Jati Klasik (per buah)", price: 450000, unitType: "piece", unitLabel: PCS, minQuantity: 3, productTags: ["jati"] },
      { slug: "hantaran-kain", name: "Hantaran Kain & Busana", price: 850000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["akrilik"] },
      { slug: "hantaran-kosmetik", name: "Hantaran Kosmetik Premium", price: 1100000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["akrilik"] },
      { slug: "hantaran-makanan", name: "Hantaran Makanan & Kue", price: 750000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["akrilik"] },
      { slug: "dekor-baki-bunga", name: "Dekorasi Baki Bunga Segar", price: 350000, unitType: "piece", unitLabel: PCS, minQuantity: 3, productTags: ["akrilik"] },
      { slug: "seserahan-paket-lengkap", name: "Paket Seserahan Lengkap + Dekor", price: 6500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["akrilik", "mahar"] },
      { slug: "mahar-akrilik-3d", name: "Mahar Akrilik 3D Custom", price: 1650000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["akrilik"] },
      { slug: "kotak-mahar-premium", name: "Kotak Mahar Premium (per buah)", price: 275000, unitType: "piece", unitLabel: PCS, minQuantity: 1, productTags: ["mahar"] },
    ],
  },

  // ============================================================
  // 6. FOTO
  // ============================================================
  {
    categoryId: "foto",
    categoryTitle: "Dokumentasi Foto & Video",
    vendorNames: [
      "Dokumentasi Kebumen Visual", "Lensa Abadi Studio", "Cahaya Film Kebumen", "Sinema Wedding Kebumen",
      "Frame Production", "Kamera Utama Studio", "Visual Story Kebumen", "Moment Capture",
      "Lensa Nusantara", "Cinemagic Kebumen", "Studio Dokumentasi Prima", "Karya Visual Kebumen",
      "Lensa Kenangan", "Focus Production", "Sinema Indah", "Visual Art Kebumen",
      "Kamera Kreatif", "Moment Story", "Lensa Sinema", "Studio Moment Kebumen",
    ],
    products: [
      { slug: "dokumentasi-akad", name: "Dokumentasi Akad", price: 2500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["akad"] },
      { slug: "dokumentasi-resepsi", name: "Dokumentasi Resepsi", price: 3500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["resepsi"] },
      { slug: "dokumentasi-full-day", name: "Dokumentasi Full Day Akad + Resepsi", price: 5500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["akad", "resepsi"] },
      { slug: "video-cinematic-highlight", name: "Video Cinematic Highlight 5 Menit", price: 4500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["cinematic"] },
      { slug: "video-cinematic-documenter", name: "Video Cinematic Documenter 15 Menit", price: 7500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["cinematic"] },
      { slug: "drone-aerial-highlight", name: "Drone Aerial Highlight", price: 2000000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["drone"] },
      { slug: "same-day-edit", name: "Same Day Edit (SDE)", price: 5000000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["cinematic"] },
      { slug: "dokumentasi-siraman", name: "Dokumentasi Siraman & Sangjit", price: 1800000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["akad"] },
      { slug: "dokumentasi-engagement", name: "Dokumentasi Engagement", price: 2200000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["resepsi"] },
      { slug: "album-foto-premium", name: "Album Foto Premium Magnetic", price: 1200000, unitType: "piece", unitLabel: PCS, minQuantity: 1, productTags: ["resepsi"] },
      { slug: "cetak-frame-16rp", name: "Cetak & Frame 16RP (per buah)", price: 150000, unitType: "piece", unitLabel: PCS, minQuantity: 5, productTags: ["resepsi"] },
      { slug: "video-teaser-instagram", name: "Video Teaser Instagram 30s", price: 1500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["cinematic"] },
      { slug: "highlight-4k-drone", name: "Highlight 4K + Drone Combo", price: 6500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["cinematic", "drone"] },
      { slug: "live-streaming", name: "Live Streaming Akad", price: 2800000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["akad"] },
      { slug: "photobooth-instant", name: "Photobooth Instant Print (per jam)", price: 850000, unitType: "piece", unitLabel: PCS, minQuantity: 3, productTags: ["resepsi"] },
    ],
  },

  // ============================================================
  // 7. DEKOR
  // ============================================================
  {
    categoryId: "dekor",
    categoryTitle: "Dekorasi Pelaminan & Florist",
    vendorNames: [
      "Dekorasi Pelaminan Kebumen", "Florist Ayu Gombong", "Sanggar Dekor Melati", "Rias Pelaminan Lestari",
      "Dekorasi Rustic Kebumen", "Bunga Segar Florist", "Dekorasi Modern Kebumen", "Sanggar Bunga Kartika",
      "Pelaminan Minimalis Kebumen", "Florist Sekar Arum", "Dekorasi Adat Jawa", "Sanggar Dekor Ratna",
      "Pelaminan Elegan Kebumen", "Bunga Cantik Florist", "Dekorasi Outdoor Kebumen", "Sanggar Bunga Puspita",
      "Pelaminan Rustic Kebumen", "Florist Indah", "Dekorasi Intimate", "Sanggar Dekor Mawar",
    ],
    products: [
      { slug: "pelaminan-intimate", name: "Pelaminan Intimate", price: 8500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["pelaminan"] },
      { slug: "pelaminan-standar", name: "Pelaminan Standar", price: 15000000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["pelaminan"] },
      { slug: "pelaminan-premium", name: "Pelaminan Premium", price: 25000000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["pelaminan"] },
      { slug: "pelaminan-luxury", name: "Pelaminan Luxury Full Decor", price: 45000000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["pelaminan"] },
      { slug: "dekor-akad-rustic", name: "Dekor Akad Rustic", price: 6500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["rustic"] },
      { slug: "dekor-akad-minimalis", name: "Dekor Akad Minimalis", price: 5500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["pelaminan"] },
      { slug: "dekor-adat-jawa", name: "Dekor Adat Jawa Gebyok", price: 28000000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["pelaminan"] },
      { slug: "photobooth-backdrop", name: "Photobooth & Backdrop", price: 4500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["photobooth"] },
      { slug: "walkway-flower", name: "Walkway & Flower Arch", price: 7500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["rustic"] },
      { slug: "standing-flower", name: "Standing Flower (per buah)", price: 450000, unitType: "piece", unitLabel: PCS, minQuantity: 10, productTags: ["pelaminan"] },
      { slug: "dekor-meja-tamu", name: "Dekor Meja Tamu & Buku", price: 2500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["photobooth"] },
      { slug: "dekor-outdoor-tenda", name: "Dekor Outdoor + Tenda", price: 18000000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["rustic"] },
      { slug: "bunga-hand-bouquet", name: "Hand Bouquet Bunga Segar", price: 350000, unitType: "piece", unitLabel: PCS, minQuantity: 1, productTags: ["pelaminan"] },
      { slug: "dekor-mobil-pengantin", name: "Dekor Mobil Pengantin", price: 1500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["photobooth"] },
      { slug: "lighting-dekor", name: "Lighting & Fairy Lights Decor", price: 3500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["rustic"] },
    ],
  },

  // ============================================================
  // 8. CAKE
  // ============================================================
  {
    categoryId: "cake",
    categoryTitle: "Cakes & Dessert Corner",
    vendorNames: [
      "Kue Pengantin Kebumen", "Cake & Bakery Gombong", "Patisserie Ayu", "Toko Kue Lestari",
      "Sweet Cake Kebumen", "Dessert Corner Kebumen", "Cake Art Kebumen", "Bakery Sekar",
      "Kue Bertingkat Kebumen", "Patisserie Melati", "Cake House Kebumen", "Sweet Moment Bakery",
      "Kue Custom Kebumen", "Dessert Table Kebumen", "Cake Studio Kebumen", "Bakery Kartika",
      "Kue Elegan Kebumen", "Patisserie Ratna", "Cake Design Kebumen", "Sweet Delight Bakery",
    ],
    products: [
      { slug: "kue-2-tingkat", name: "Kue Pengantin 2 Tingkat", price: 1200000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["tiered"] },
      { slug: "kue-3-tingkat", name: "Kue Pengantin 3 Tingkat", price: 2200000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["tiered"] },
      { slug: "kue-4-tingkat", name: "Kue Pengantin 4 Tingkat", price: 3500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["tiered"] },
      { slug: "kue-5-tingkat-premium", name: "Kue Pengantin 5 Tingkat Premium", price: 5500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["tiered"] },
      { slug: "tumpeng-nasi-putih", name: "Tumpeng Nasi Putih", price: 750000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["tumpeng"] },
      { slug: "tumpeng-kuning", name: "Tumpeng Nasi Kuning", price: 850000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["tumpeng"] },
      { slug: "dessert-table-standar", name: "Dessert Table Standar", price: 3500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["dessert-table"] },
      { slug: "dessert-table-premium", name: "Dessert Table Premium", price: 6500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["dessert-table"] },
      { slug: "cupcake-ganache", name: "Cupcake Ganache (per pcs)", price: 15000, unitType: "portion", unitLabel: PORSI, minQuantity: 50, productTags: ["dessert-table"] },
      { slug: "macaron-french", name: "Macaron French (per pcs)", price: 18000, unitType: "portion", unitLabel: PORSI, minQuantity: 50, productTags: ["dessert-table"] },
      { slug: "puding-silky", name: "Puding Silky (per porsi)", price: 12000, unitType: "portion", unitLabel: PORSI, minQuantity: 50, productTags: ["dessert-table"] },
      { slug: "fruit-tart", name: "Fruit Tart (per pcs)", price: 16000, unitType: "portion", unitLabel: PORSI, minQuantity: 30, productTags: ["dessert-table"] },
      { slug: "brownies-box", name: "Brownies Box (per pcs)", price: 20000, unitType: "portion", unitLabel: PORSI, minQuantity: 30, productTags: ["dessert-table"] },
      { slug: "kue-basah-kotak", name: "Kue Basah Kotak (per pcs)", price: 8000, unitType: "portion", unitLabel: PORSI, minQuantity: 50, productTags: ["dessert-table"] },
      { slug: "kue-hantaran", name: "Kue Hantaran Custom", price: 450000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["tiered"] },
    ],
  },

  // ============================================================
  // 9. SOUVENIR
  // ============================================================
  {
    categoryId: "souvenir",
    categoryTitle: "Souvenir & Favors",
    vendorNames: [
      "Souvenir Kebumen Craft", "Favor Ayu Gombong", "Galeri Souvenir Lestari", "Souvenir Pandan Kebumen",
      "Favor Cantik Kebumen", "Galeri Suvenir Melati", "Souvenir Linen Kebumen", "Favor Sekar",
      "Souvenir Anyaman Kebumen", "Galeri Favor Kartika", "Souvenir Elegan Kebumen", "Favor Ratna",
      "Souvenir Cantik Gombong", "Galeri Souvenir Puspita", "Souvenir Custom Kebumen", "Favor Indah",
      "Souvenir Kayu Kebumen", "Galeri Favor Mawar", "Souvenir Eksklusif Kebumen", "Favor Melur",
    ],
    products: [
      { slug: "souvenir-pandan-box", name: "Souvenir Anyaman Pandan (per pcs)", price: 35000, unitType: "piece", unitLabel: PCS, minQuantity: 50, productTags: ["pandan"] },
      { slug: "souvenir-pandan-set", name: "Souvenir Pandan Set Kotak", price: 55000, unitType: "piece", unitLabel: PCS, minQuantity: 50, productTags: ["pandan"] },
      { slug: "souvenir-linen-pouch", name: "Souvenir Pouch Linen (per pcs)", price: 45000, unitType: "piece", unitLabel: PCS, minQuantity: 50, productTags: ["linen"] },
      { slug: "souvenir-linen-tote", name: "Souvenir Tote Bag Linen", price: 65000, unitType: "piece", unitLabel: PCS, minQuantity: 50, productTags: ["linen"] },
      { slug: "souvenir-edible-jar", name: "Souvenir Toples Kue Kering", price: 40000, unitType: "piece", unitLabel: PCS, minQuantity: 50, productTags: ["edible"] },
      { slug: "souvenir-edible-honey", name: "Souvenir Madu Mini Jar", price: 50000, unitType: "piece", unitLabel: PCS, minQuantity: 50, productTags: ["edible"] },
      { slug: "souvenir-edible-coklat", name: "Souvenir Coklat Custom Label", price: 30000, unitType: "piece", unitLabel: PCS, minQuantity: 50, productTags: ["edible"] },
      { slug: "souvenir-kipas", name: "Souvenir Kipas Lipat Custom", price: 28000, unitType: "piece", unitLabel: PCS, minQuantity: 50, productTags: ["pandan"] },
      { slug: "souvenir-tempat-lilin", name: "Souvenir Tempat Lilin Kayu", price: 38000, unitType: "piece", unitLabel: PCS, minQuantity: 50, productTags: ["pandan"] },
      { slug: "souvenir-gelas-custom", name: "Souvenir Gelas Custom Nama", price: 42000, unitType: "piece", unitLabel: PCS, minQuantity: 50, productTags: ["linen"] },
      { slug: "souvenir-tas-spunbond", name: "Souvenir Tas Spunbond Custom", price: 25000, unitType: "piece", unitLabel: PCS, minQuantity: 50, productTags: ["linen"] },
      { slug: "souvenir-sendok-kayu", name: "Souvenir Sendok Kayu Ukir", price: 32000, unitType: "piece", unitLabel: PCS, minQuantity: 50, productTags: ["pandan"] },
      { slug: "souvenir-gantungan", name: "Souvenir Gantungan Kunci Custom", price: 15000, unitType: "piece", unitLabel: PCS, minQuantity: 50, productTags: ["pandan"] },
      { slug: "souvenir-hampers", name: "Souvenir Hampers Mini", price: 85000, unitType: "piece", unitLabel: PCS, minQuantity: 30, productTags: ["edible"] },
      { slug: "souvenir-paket-lengkap", name: "Paket Souvenir + Kartu Ucapan", price: 47000, unitType: "piece", unitLabel: PCS, minQuantity: 50, productTags: ["linen"] },
    ],
  },

  // ============================================================
  // 10. UNDANGAN
  // ============================================================
  {
    categoryId: "undangan",
    categoryTitle: "Undangan Digital & Amplop",
    vendorNames: [
      "Undangan Digital Kebumen", "Invitation Ayu Gombong", "Galeri Undangan Lestari", "Undangan Online Kebumen",
      "Digital Invite Kebumen", "Galeri Undangan Melati", "Undangan Elegan Kebumen", "Invite Sekar",
      "Undangan Custom Kebumen", "Galeri Invite Kartika", "Undangan Modern Kebumen", "Invite Ratna",
      "Undangan Cetak Kebumen", "Galeri Undangan Puspita", "Undangan Digital Online", "Invite Indah",
      "Undangan Wax Seal Kebumen", "Galeri Invite Mawar", "Undangan Eksklusif Kebumen", "Invite Melur",
    ],
    products: [
      { slug: "undangan-digital-basic", name: "Undangan Digital Basic", price: 150000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["digital"] },
      { slug: "undangan-digital-premium", name: "Undangan Digital Premium", price: 350000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["digital"] },
      { slug: "undangan-digital-luxury", name: "Undangan Digital Luxury + Video", price: 650000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["digital"] },
      { slug: "undangan-digital-custom-domain", name: "Undangan Digital Custom Domain", price: 850000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["digital"] },
      { slug: "undangan-cetak-standar", name: "Undangan Cetak Standar (per pcs)", price: 3500, unitType: "piece", unitLabel: PCS, minQuantity: 100, productTags: ["cetak"] },
      { slug: "undangan-cetak-premium", name: "Undangan Cetak Premium (per pcs)", price: 7500, unitType: "piece", unitLabel: PCS, minQuantity: 100, productTags: ["cetak"] },
      { slug: "undangan-cetak-luxury", name: "Undangan Cetak Luxury Gold (per pcs)", price: 12000, unitType: "piece", unitLabel: PCS, minQuantity: 100, productTags: ["cetak"] },
      { slug: "undangan-wax-seal", name: "Undangan Wax Seal Custom (per pcs)", price: 5500, unitType: "piece", unitLabel: PCS, minQuantity: 100, productTags: ["wax-seal"] },
      { slug: "undangan-hardcover", name: "Undangan Hardcover Eksklusif (per pcs)", price: 15000, unitType: "piece", unitLabel: PCS, minQuantity: 100, productTags: ["cetak"] },
      { slug: "amplop-custom", name: "Amplop Custom Nama (per pcs)", price: 2500, unitType: "piece", unitLabel: PCS, minQuantity: 100, productTags: ["cetak"] },
      { slug: "amplop-wax-seal", name: "Amplop Wax Seal (per pcs)", price: 4000, unitType: "piece", unitLabel: PCS, minQuantity: 100, productTags: ["wax-seal"] },
      { slug: "kartu-ucapan", name: "Kartu Ucapan Terpisah (per pcs)", price: 2000, unitType: "piece", unitLabel: PCS, minQuantity: 100, productTags: ["cetak"] },
      { slug: "undangan-digital-qr", name: "Undangan Digital + QR Check-in", price: 450000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["digital"] },
      { slug: "undangan-video-klip", name: "Undangan Video Klip Sinematik", price: 950000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["digital"] },
      { slug: "undangan-paket-lengkap", name: "Paket Undangan Digital + 100 Cetak", price: 1200000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["digital", "cetak"] },
    ],
  },

  // ============================================================
  // 11. DENAH
  // ============================================================
  {
    categoryId: "denah",
    categoryTitle: "Cute Illustrated Maps",
    vendorNames: [
      "Denah Ilustrasi Kebumen", "Map Cartoon Gombong", "Galeri Denah Lestari", "Ilustrasi Peta Kebumen",
      "Denah Kartun Kebumen", "Galeri Map Melati", "Denah Cantik Kebumen", "Ilustrator Map Sekar",
      "Denah Custom Kebumen", "Galeri Denah Kartika", "Peta Ilustrasi Kebumen", "Denah QR Kebumen",
      "Denah Cetak Kebumen", "Galeri Map Puspita", "Ilustrasi Lokasi Kebumen", "Map Indah Kebumen",
      "Denah Wedding Kebumen", "Galeri Peta Mawar", "Denah Eksklusif Kebumen", "Peta Melur Kebumen",
    ],
    products: [
      { slug: "denah-kartun-basic", name: "Denah Kartun Basic", price: 250000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["kartun"] },
      { slug: "denah-kartun-premium", name: "Denah Kartun Premium Full Color", price: 450000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["kartun"] },
      { slug: "denah-kartun-luxury", name: "Denah Kartun Luxury + Animated", price: 850000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["kartun"] },
      { slug: "denah-qr-maps", name: "Denah + QR Google Maps", price: 350000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["qr"] },
      { slug: "denah-qr-live", name: "Denah + QR Live Location", price: 500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["qr"] },
      { slug: "denah-cetak-a3", name: "Denah Cetak A3 (per lembar)", price: 45000, unitType: "piece", unitLabel: PCS, minQuantity: 5, productTags: ["cetak"] },
      { slug: "denah-cetak-a2", name: "Denah Cetak A2 (per lembar)", price: 75000, unitType: "piece", unitLabel: PCS, minQuantity: 5, productTags: ["cetak"] },
      { slug: "denah-cetak-a1", name: "Denah Cetak A1 (per lembar)", price: 120000, unitType: "piece", unitLabel: PCS, minQuantity: 3, productTags: ["cetak"] },
      { slug: "denah-venue-custom", name: "Denah Venue Custom Ilustrasi", price: 950000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["kartun"] },
      { slug: "denah-3d-iso", name: "Denah 3D Isometric", price: 1250000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["kartun"] },
      { slug: "denah-peta-lokasi", name: "Peta Lokasi Akad & Resepsi", price: 400000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["qr"] },
      { slug: "denah-signage", name: "Signage Arah Lokasi (per pcs)", price: 85000, unitType: "piece", unitLabel: PCS, minQuantity: 5, productTags: ["cetak"] },
      { slug: "denah-undangan-integrasi", name: "Denah Terintegrasi Undangan Digital", price: 300000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["qr"] },
      { slug: "denah-paket-lengkap", name: "Paket Denah + Signage + QR", price: 1500000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["kartun", "qr"] },
      { slug: "denah-editable-file", name: "Denah File Editable (AI/PSD)", price: 550000, unitType: "package", unitLabel: PKG, minQuantity: 1, productTags: ["kartun"] },
    ],
  },
];

export function generateCatalog(): GeneratorVendor[] {
  const vendors: GeneratorVendor[] = [];
  let counter = 0;

  for (const t of TEMPLATES) {
    const features = CATEGORY_FEATURES[t.categoryId] ?? [
      "Layanan profesional",
      "Tim berpengalaman",
      "Harga transparan",
      "Respon cepat",
    ];

    for (let vi = 0; vi < t.vendorNames.length; vi++) {
      counter++;
      const num = String(counter).padStart(3, "0");
      const vendorSlug = slugify(t.vendorNames[vi]);
      const district = GENERATOR_DISTRICTS[vi % GENERATOR_DISTRICTS.length];

      const products: VendorProduct[] = t.products.map((p, pi) => ({
        id: `prod_${t.categoryId}_${num}_${String(pi + 1).padStart(2, "0")}`,
        slug: p.slug,
        name: p.name,
        price: p.price,
        unitType: p.unitType,
        unitLabel: p.unitLabel,
        minQuantity: p.minQuantity,
        maxQuantity: p.maxQuantity,
        image: IMG(counter * 100 + pi),
        desc: `${p.name} oleh ${t.vendorNames[vi]}, melayani area ${district} dan sekitarnya.`,
        callTime: "09:00 WIB",
        features,
        productTags: p.productTags,
      }));

      vendors.push({
        id: `v_${t.categoryId}_${num}`,
        slug: vendorSlug,
        name: t.vendorNames[vi],
        categoryId: t.categoryId,
        categoryTitle: t.categoryTitle,
        district,
        avatar: IMG(counter * 3),
        coverImage: IMG(counter * 7),
        rating: Math.round((4.5 + (counter % 5) * 0.1) * 10) / 10,
        reviewCount: 20 + (counter % 80),
        verified: true,
        bio: `${t.vendorNames[vi]} — mitra ${t.categoryTitle.toLowerCase()} terverifikasi di ${district}, Kebumen.`,
        tagline: `Melayani ${district} & sekitarnya`,
        products,
        portfolio: [],
        blackoutDates: [],
      });
    }
  }

  return vendors;
}
