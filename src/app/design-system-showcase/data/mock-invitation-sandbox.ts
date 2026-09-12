export interface ArchetypeConfig {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  accentColor: string; // HEX
  secondaryAccent: string; // HEX
  surfaceColor: string; // HEX
  textColor: string; // HEX
  geometryBadge: string;
  cornerRadius: string;
  borderStyle: string;
  keyAssets: string[];
  recommendedFontPair: {
    heading: string;
    body: string;
  };
}

export const ARCHETYPES_CONFIG: ArchetypeConfig[] = [
  {
    id: 'botanical',
    name: 'Botanical Serenade',
    subtitle: 'Alami, Segar & Kebun Romantis',
    description: 'Sentuhan flora tropis dan dedaunan lembut yang melambangkan kesuburan dan cinta abadi keluarga.',
    accentColor: '#5B6E58', // Forest Sage
    secondaryAccent: '#8FA38C', // Muted Moss
    surfaceColor: '#F5F7F4',
    textColor: '#2E3A2D',
    geometryBadge: 'Rounded 16px Floating Card',
    cornerRadius: '16px',
    borderStyle: 'border border-[#5B6E58]/30 shadow-sm',
    keyAssets: ['Flower Accent 01–12', 'Leaf Sprig 01–16', 'Divider Botanical Knot'],
    recommendedFontPair: {
      heading: 'Cormorant Garamond (Medium)',
      body: 'Manrope',
    },
  },
  {
    id: 'javanese',
    name: 'Javanese Royal Heritage',
    subtitle: 'Luhur, Tradisi Keraton & Wingit',
    description: 'Kemegahan adat keraton Jawa dengan ornamen gunungan, lung-lungan klasik, dan kedalaman warna sogan.',
    accentColor: '#5A3825', // Deep Sogan
    secondaryAccent: '#C5A880', // Antique Gilded Gold
    surfaceColor: '#FDFBF7',
    textColor: '#382216',
    geometryBadge: 'Arch Kasunanan & Ornamen Ganda',
    cornerRadius: '12px',
    borderStyle: 'border-2 border-[#5A3825]/40 shadow-md',
    keyAssets: ['Gunungan Classic', 'Kasunanan Arch Frame', 'Vintage Post Stamp EST. 2026'],
    recommendedFontPair: {
      heading: 'Cormorant Garamond (Italic Luxury)',
      body: 'Manrope (Medium)',
    },
  },
  {
    id: 'islamic',
    name: 'Islamic Syar’i & Arabesque',
    subtitle: 'Suci, Teduh & Megah Kontemporer',
    description: 'Kesucian ikrar dalam bingkai gerbang Moroccan arch, kisi geometris arabesque, dan sentuhan warna zamrud mistik.',
    accentColor: '#2C4A3E', // Emerald Mist
    secondaryAccent: '#D1B48C', // Sand Dune Gold
    surfaceColor: '#F4F7F5',
    textColor: '#1A3027',
    geometryBadge: 'Pointed Moroccan Arch',
    cornerRadius: '20px 20px 4px 4px',
    borderStyle: 'border border-[#2C4A3E]/35 shadow-sm',
    keyAssets: ['Moroccan Pointed Arch', 'Arabesque Kisi Pattern', 'Bismillah Crest'],
    recommendedFontPair: {
      heading: 'Cormorant Garamond (Regular)',
      body: 'Manrope (Medium)',
    },
  },
  {
    id: 'minimalist',
    name: 'Minimalist Typographic',
    subtitle: 'Editorial Modern & Presisi Arsitektural',
    description: 'Keanggunan dalam kesederhanaan monokromatik editorial, garis hairline tipis, dan tata tipografi majalah kelas atas.',
    accentColor: '#1F1F1F', // Monolith Charcoal
    secondaryAccent: '#88735B', // HariKita Taupe
    surfaceColor: '#FFFFFF',
    textColor: '#1F1F1F',
    geometryBadge: 'Sharp 0px / Hairline 4px',
    cornerRadius: '0px',
    borderStyle: 'border border-[#1F1F1F]/20',
    keyAssets: ['Minimal Hairline Divider', 'Symbol 01–03', 'Architectural Monogram'],
    recommendedFontPair: {
      heading: 'Cormorant Garamond (Light / Spaced)',
      body: 'Manrope (Bold Uppercase & Regular)',
    },
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold & Copper Luxury',
    subtitle: 'Feminin Mewah, Glamor & Berkilau Halus',
    description: 'Sentuhan nuansa blush hangat berpadu kilau tembaga foil metalik yang menawan dan penuh kelembutan.',
    accentColor: '#C07D6D', // Copper Rose
    secondaryAccent: '#E8C5B8', // Soft Blush
    surfaceColor: '#FDF7F5',
    textColor: '#422822',
    geometryBadge: 'Pill Rounded 24px & Glowing Border',
    cornerRadius: '24px',
    borderStyle: 'border border-[#C07D6D]/30 shadow-[0_4px_20px_rgba(192,125,109,0.12)]',
    keyAssets: ['Texture Gold Foil', 'Wax Seal Official HK', 'Composition Floral 03'],
    recommendedFontPair: {
      heading: 'Cormorant Garamond (Medium Italic)',
      body: 'Manrope',
    },
  },
  {
    id: 'rustic',
    name: 'Rustic Warm Kraft & Pampas',
    subtitle: 'Hangat, Bersahaja & Vintage Intim',
    description: 'Pesona serat kertas alam, bunga kering pampas, dan nuansa terracotta bersahaja untuk perayaan yang hangat.',
    accentColor: '#A35D43', // Terracotta Muted
    secondaryAccent: '#C99E78', // Warm Wheat Kraft
    surfaceColor: '#FAF5EE',
    textColor: '#3B241B',
    geometryBadge: 'Deckle Edge / Tepi Kertas Sobek',
    cornerRadius: '8px',
    borderStyle: 'border-dashed border-2 border-[#A35D43]/40',
    keyAssets: ['Texture Deckle Paper', 'Texture Linen Dark', 'Rustic Pampas Twine'],
    recommendedFontPair: {
      heading: 'Cormorant Garamond (Regular)',
      body: 'Manrope',
    },
  },
  {
    id: 'celestial',
    name: 'Celestial Midnight Starlight',
    subtitle: 'Puitis Malam, Rasi Bintang & Magis',
    description: 'Gemintang malam Kebumen, orbit bulan sabit kosmik, dan misteri biru navy beraksen taburan stardust gold.',
    accentColor: '#1E2638', // Midnight Navy
    secondaryAccent: '#D4AF37', // Stardust Gold
    surfaceColor: '#121722',
    textColor: '#EDE9E3',
    geometryBadge: 'Circular Mask & Concentric Orbit',
    cornerRadius: '9999px',
    borderStyle: 'border border-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.15)]',
    keyAssets: ['Symbol 8-Point Star', 'Symbol Crescent Moon', 'Orbit Concentric Frame'],
    recommendedFontPair: {
      heading: 'Cormorant Garamond (Light Italic)',
      body: 'Manrope (Light / Medium)',
    },
  },
  {
    id: 'cute',
    name: 'Cute & Storybook Pastel',
    subtitle: 'Manis, Ceria & Ramah Keluarga Besar',
    description: 'Karakter visual kartun yang manis, ramah anak dan keluarga besar, dengan bentuk bubble pill dan warna peach ceria.',
    accentColor: '#D97352', // Soft Coral Peach
    secondaryAccent: '#F4C2A1', // Honey Peach
    surfaceColor: '#FFF8F4',
    textColor: '#3E2723',
    geometryBadge: 'Super-ellipse Bubble Pill (28px)',
    cornerRadius: '28px',
    borderStyle: 'border-2 border-[#F4C2A1] shadow-md',
    keyAssets: ['Cute Storybook Mascot', 'Pattern Polka Soft', 'Avatar Wreath Light'],
    recommendedFontPair: {
      heading: 'Cormorant Garamond (Bold)',
      body: 'Manrope (SemiBold)',
    },
  },
];

export const SANDBOX_COUPLE_DATA = {
  groom: {
    fullName: 'Aditya Pratama Nugraha, S.T.',
    nickName: 'Aditya',
    fatherName: 'H. Bambang Soediro',
    motherName: 'Hj. Siti Rahayu',
    origin: 'Pejagoan, Kebumen',
    instagram: '@aditya.pratama',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    bio: 'Putra pertama yang penuh komitmen, mencintai fotografi dan panorama pantai selatan Kebumen.',
  },
  bride: {
    fullName: 'Ratna Ayu Larasati, S.Farm., Apt.',
    nickName: 'Ratna',
    fatherName: 'Drs. H. Hartono Sudrajat',
    motherName: 'Hj. Endang Sulistyowati',
    origin: 'Gombong, Kebumen',
    instagram: '@ratnalarasati',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    bio: 'Putri kedua yang anggun, pemerhati seni kebaya adat dan pengabdi kesehatan di Kebumen.',
  },
  quote: {
    verse: 'QS. Ar-Rum Ayat 21',
    text: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan-pasangan dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.',
  },
};

export const SANDBOX_STORIES_DATA = [
  {
    id: 'bab-1',
    chapter: 'BAB I',
    title: 'Titik Mula',
    subtitle: 'The Serendipity',
    year: '2022',
    story: 'Pertemuan tak sengaja di kedai kopi lereng bukit Menguneng Kebumen. Pandangan pertama yang membawa percakapan hangat hingga senja memudar.',
  },
  {
    id: 'bab-2',
    chapter: 'BAB II',
    title: 'Menaut Janji',
    subtitle: 'The Journey Together',
    year: '2023',
    story: 'Melewati suka dan duka bersama, belajar saling memahami watak dan mendekatkan dua keluarga besar dengan restu yang tulus.',
  },
  {
    id: 'bab-3',
    chapter: 'BAB III',
    title: 'Restu Semesta',
    subtitle: 'The Proposal',
    year: '2025',
    story: 'Di hadapan kedua orang tua tercinta di Gombong, seuntai cincin disematkan sebagai tanda kesungguhan melangkah ke jenjang ikatan suci.',
  },
  {
    id: 'bab-4',
    chapter: 'BAB IV',
    title: 'Ikrar Penghulu',
    subtitle: 'The Sacred Vow',
    year: '2026',
    story: 'Kini saatnya menyatukan dua hati dan restu keluarga besar dalam mahligai pernikahan yang kekal, berlandaskan iman dan kasih sayang.',
  },
];

export const SANDBOX_SCHEDULE_DATA = [
  {
    id: 'akad',
    type: 'Akad Nikah',
    badge: 'Keluarga Inti & Saksi',
    date: 'Sabtu, 24 Oktober 2026',
    time: '08.00 – 10.00 WIB',
    venue: 'Masjid Agung Kebumen',
    address: 'Jl. Pahlawan No. 1, Kauman, Kebumen, Jawa Tengah',
    mapUrl: 'https://maps.google.com/?q=Masjid+Agung+Kebumen',
  },
  {
    id: 'resepsi-1',
    type: 'Resepsi Sesi I (Umum)',
    badge: 'Tamu Kehormatan & Rekan',
    date: 'Sabtu, 24 Oktober 2026',
    time: '11.00 – 14.00 WIB',
    venue: 'Ballroom Hotel Grand Kebumen',
    address: 'Jl. Pemuda No. 45, Kebumen, Jawa Tengah',
    mapUrl: 'https://maps.google.com/?q=Kebumen',
  },
  {
    id: 'resepsi-2',
    type: 'Resepsi Sesi II (Intimate Dinner)',
    badge: 'Sahabat Dekat & Keluarga',
    date: 'Sabtu, 24 Oktober 2026',
    time: '18.30 – 21.00 WIB',
    venue: 'Pendopo Selera Alam Kebumen',
    address: 'Jl. Karanganyar KM 5, Kebumen, Jawa Tengah',
    mapUrl: 'https://maps.google.com/?q=Kebumen',
  },
];

export const SANDBOX_GALLERY_PHOTOS = [
  {
    id: 'g-1',
    src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
    title: 'Semilir Angin Menganti',
    subtitle: 'Pantai Menganti, Kebumen',
    orientation: 'landscape',
  },
  {
    id: 'g-2',
    src: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    title: 'Keanggunan Beskap & Kebaya',
    subtitle: 'Sesi Busana Adat Keraton',
    orientation: 'portrait',
  },
  {
    id: 'g-3',
    src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80',
    title: 'Taut Jemari Restu',
    subtitle: 'Studio HariKita Kebumen',
    orientation: 'landscape',
  },
  {
    id: 'g-4',
    src: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80',
    title: 'Binar Mata Bahagia',
    subtitle: 'Bukit Menguneng',
    orientation: 'portrait',
  },
  {
    id: 'g-5',
    src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1000&q=80',
    title: 'Langkah Bersama',
    subtitle: 'Pesisir Ayah Kebumen',
    orientation: 'landscape',
  },
  {
    id: 'g-6',
    src: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80',
    title: 'Bunga & Janji Hati',
    subtitle: 'Taman Bunga Kebumen',
    orientation: 'portrait',
  },
  {
    id: 'g-7',
    src: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80',
    title: 'Kidung Senja Bahagia',
    subtitle: 'Pantai Logending',
    orientation: 'portrait',
  },
  {
    id: 'g-8',
    src: 'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1000&q=80',
    title: 'Menuju Hari Bahagia',
    subtitle: 'Alun-alun Pancasila Kebumen',
    orientation: 'landscape',
  },
];

export const SANDBOX_GIFT_DATA = {
  bankAccounts: [
    {
      bank: 'BCA (Bank Central Asia)',
      accountNumber: '0987-6543-2100',
      holderName: 'Aditya Pratama Nugraha',
      badge: 'Rekening Mempelai Pria',
    },
    {
      bank: 'Bank Mandiri',
      accountNumber: '137-00-1234567-8',
      holderName: 'Ratna Ayu Larasati',
      badge: 'Rekening Mempelai Wanita',
    },
  ],
  qris: {
    merchantName: 'HariKita Escrow / Aditya & Ratna Wedding',
    nmid: 'ID1020261024HK01',
    description: 'Pindai kode QRIS menggunakan mobile banking atau e-wallet apa pun',
  },
  physicalGift: {
    recipientName: 'Aditya Pratama (c/o Keluarga H. Bambang Soediro)',
    phone: '0812-3456-7890',
    address: 'Jl. Cendrawasih No. 18, RT 02/RW 04, Pejagoan, Kabupaten Kebumen, Jawa Tengah 54361',
    notes: 'Mohon konfirmasi nomor resi pengiriman via WhatsApp keluarga.',
  },
};

export const SANDBOX_GUESTBOOK_WISHES = [
  {
    id: 'w-1',
    name: 'Ir. H. Sudirman & Ibu',
    relation: 'Keluarga Besar Trah Kebumen',
    attendance: 'hadir',
    message: 'Selamat berbahagia ananda Aditya dan Ratna. Semoga menjadi keluarga yang sakinah, mawaddah, warahmah serta senantiasa dalam ridho Allah SWT.',
    timestamp: '2 jam yang lalu',
    isVip: true,
  },
  {
    id: 'w-2',
    name: 'Dimas Wicaksono',
    relation: 'Rekan Kerja Aditya',
    attendance: 'hadir',
    message: 'Barakallahu lakuma bro Adit & Mbak Ratna! Doa terbaik untuk petualangan baru berdua.',
    timestamp: '5 jam yang lalu',
    isVip: false,
  },
  {
    id: 'w-3',
    name: 'dr. Annisa Larasati',
    relation: 'Sahabat SMA Ratna',
    attendance: 'kirim-doa',
    message: 'Mohon maaf belum bisa hadir langsung karena dinas di luar kota. Turut berbahagia dari kejauhan, peluk hangat untuk Ratna & Mas Aditya!',
    timestamp: 'Kemarin',
    isVip: true,
  },
  {
    id: 'w-4',
    name: 'Keluarga Besar Bani H. Mansyur',
    relation: 'Kerabat Gombong',
    attendance: 'hadir',
    message: 'Mugi tansah pinaringan berkah, ayem tentrem, lan lancar sadaya tata adicara ngantos paripurna.',
    timestamp: '2 hari yang lalu',
    isVip: false,
  },
];
