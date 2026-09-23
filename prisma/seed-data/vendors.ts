/**
 * Generator data vendor untuk seeder: 25 vendor per kategori (11 kategori = 275).
 * Setiap vendor HANYA satu kategori (tidak tercampur).
 */

export interface VendorSeed {
  businessName: string;
  category: string;
  district: string;
  address: string;
  rating: number;
  reviewCount: number;
  igHandle: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
}

const DISTRICTS = [
  "Kebumen", "Gombong", "Kutowinangun", "Karanganyar", "Alian", "Prembun",
  "Ayah", "Pejagoan", "Poncowarno", "Kuwarasan", "Buluspesantren", "Sruweng",
  "Adimulyo", "Puring", "Mirit", "Bonorowo", "Klirong", "Rowe", "Petanahan",
  "Ambal", "Kemusuk", "Padureso", "Sempor", "Sadang", "Karangsambung", "Poncowati",
];

const BANKS = ["BCA", "Mandiri", "BNI", "BRI", "BSI", "CIMB Niaga"];

const BRAND_PREFIX: Record<string, string[]> = {
  "Pre-wedding": ["Menganti", "Pradana", "Lumiere", "Aluna", "Kala", "Aksara", "Selaras", "Cahaya"],
  "Busana Pengantin & Fitting": ["Rarasati", "Griya", "Kartika", "Ayodya", "Sekar", "Dyandra", "Ayu", "Larasati"],
  "Makeup Artist (MUA)": ["Alula", "Sekar", "Mayang", "Kasih", "Ayunda", "Binar", "Kirana", "Melati"],
  "Kotak Seserahan & Mahar": ["Lestari", "Hantaran", "Puspa", "Kanti", "Dewi", "Wangi", "Ratih", "Sari"],
  "Dokumentasi Foto-Video": ["Pradana", "Lumen", "Focal", "Kriya", "Frame", "Sinema", "Rana", "Bingkai"],
  "Dekorasi & Florist": ["Asmara", "Flora", "Cempaka", "Taman", "Kembang", "Riang", "Anjani", "Seruni"],
  "Katering & Food Stalls": ["Dapur", "Rasa", "Boga", "Sari", "Warung", "Nusantara", "Gudeg", "Liwet"],
  "Cakes & Dessert Corner": ["L'Aura", "Manis", "Kue", "Sweet", "Pati", "Sugary", "Tart", "Bakehouse"],
  "Souvenir & Favors": ["Kriya", "Anyam", "Bingkisan", "Kenang", "Hadiah", "Souvenir", "Pandan", "Pita"],
  "Undangan Digital & Amplop": ["HariKita", "Kartu", "Undang", "Digital", "Aksara", "Wax", "Foil", "Lembar"],
  "Cute Illustrated Maps": ["Denah", "Kartun", "Peta", "Sketsa", "Ilustra", "Rute", "Arah", "Lokasi"],
};

const SUFFIX = [
  "Studio", "Kebumen", "House", "Works", "Galeri",
  "Kolektif", "Signature", "Pratama", "Kencana", "Aditya",
];

const CATEGORIES = Object.keys(BRAND_PREFIX);

export function generateVendors(): VendorSeed[] {
  const out: VendorSeed[] = [];
  for (const category of CATEGORIES) {
    const prefixes = BRAND_PREFIX[category];
    for (let i = 0; i < 25; i++) {
      const prefix = prefixes[i % prefixes.length];
      const suffix = SUFFIX[i % SUFFIX.length];
      const n = i + 1;
      const idx = out.length;
      const businessName = `${prefix} ${suffix} ${n}`.replace(/\s+/g, " ").trim();
      const district = DISTRICTS[idx % DISTRICTS.length];
      const rating = Math.round((4.6 + ((idx % 5) * 0.1)) * 10) / 10;
      out.push({
        businessName,
        category,
        district,
        address: `Jl. ${prefix} No. ${n}, ${district}, Kebumen`,
        rating,
        reviewCount: 8 + ((idx * 3) % 60),
        igHandle: `@${prefix.toLowerCase().replace(/[^a-z]/g, "")}.${n}`,
        bankName: BANKS[idx % BANKS.length],
        bankAccount: String(1000000000 + idx * 7919),
        bankHolder: businessName,
      });
    }
  }
  return out;
}

export { CATEGORIES as VENDOR_SEED_CATEGORIES };
