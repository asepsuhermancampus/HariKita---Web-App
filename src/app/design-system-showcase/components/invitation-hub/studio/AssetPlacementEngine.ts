import { PlacementStyleId, SlotZoneId } from '@/types/invitation-studio';
import { HariKitaAsset } from '@/types/harikita-asset';

export interface PlacementStyleDefinition {
  id: PlacementStyleId;
  name: string;
  subtitle: string;
  description: string;
  recommendedFor: string;
  iconType: string;
  defaultSlots: {
    corner: string;
    monogram: string;
    divider: string;
    coupleSurround: string;
    iconMarker: string;
    tailpiece: string;
  };
}

export const PLACEMENT_STYLES_CATALOG: PlacementStyleDefinition[] = [
  {
    id: 'royal-symmetrical',
    name: '1. Royal Symmetrical Crest',
    subtitle: 'Keagungan Simetris & Berwibawa',
    description: 'Tata letak tegak lurus seimbang: lencana monogram di puncak, garis swirl ganda simetris, dan tailpiece mahkota kerajaan.',
    recommendedFor: 'Royal Foil, Pernikahan Akbar di Ballroom',
    iconType: 'crown',
    defaultSlots: {
      corner: 'corners/corner-01.svg',
      monogram: 'ornaments/ornament-01.svg',
      divider: 'lines/line-01.svg',
      coupleSurround: 'leaves/branches/branch-01.svg',
      iconMarker: 'icons/icon-01.svg',
      tailpiece: 'ornaments/ornament-02.svg',
    },
  },
  {
    id: 'botanical-hug',
    name: '2. Botanical Garland Hug',
    subtitle: 'Pelukan Ranting & Daun Tropis',
    description: 'Ranting lengkung dan dedaunan halus memeluk sisi luar foto mempelai dan kartu jadwal acara secara alami.',
    recommendedFor: 'Romantic Botanical, Garden Party Kebumen',
    iconType: 'flower',
    defaultSlots: {
      corner: 'corners/corner-02.svg',
      monogram: 'flowers/blooms/bloom-01.svg',
      divider: 'lines/line-02.svg',
      coupleSurround: 'leaves/branches/branch-02.svg',
      iconMarker: 'icons/icon-02.svg',
      tailpiece: 'flowers/accents/accent-01.svg',
    },
  },
  {
    id: 'asymmetric-editorial',
    name: '3. Asymmetric Editorial Vogue',
    subtitle: 'Dinamisme Majalah Seni Tinggi',
    description: 'Gaya tata letak modern asimetris: single-stem tegak di margin kiri, teks mengalir dinamis, dan garis minimalis.',
    recommendedFor: 'Minimalist Typographic, Contemporary Intimate',
    iconType: 'layout',
    defaultSlots: {
      corner: 'corners/corner-03.svg',
      monogram: 'abstract/symbol-01.svg',
      divider: 'lines/line-03.svg',
      coupleSurround: 'flowers/single-stem/flower-01.svg',
      iconMarker: 'icons/icon-03.svg',
      tailpiece: 'abstract/symbol-02.svg',
    },
  },
  {
    id: 'heritage-gunungan',
    name: '4. Heritage Gunungan Adat',
    subtitle: 'Adiluhung Tradisi Jawa & Sogan',
    description: 'Nuansa keraton sakral: puncak gunungan wayang Kebumen, sudut ukiran sogan, dan garis pembatas aksara Jawa.',
    recommendedFor: 'Adat Jawa Kebumen, Resepsi Tradisional',
    iconType: 'landmark',
    defaultSlots: {
      corner: 'corners/corner-04.svg',
      monogram: 'ornaments/ornament-03.svg',
      divider: 'lines/line-04.svg',
      coupleSurround: 'ornaments/ornament-04.svg',
      iconMarker: 'icons/icon-04.svg',
      tailpiece: 'ornaments/ornament-05.svg',
    },
  },
  {
    id: 'mihrab-syari',
    name: '5. Architectural Mihrab Syar’i',
    subtitle: 'Kesucian Lengkung Islami & Arabesque',
    description: 'Bingkai kubah mihrab yang teduh, ornamen geometris arabesque halus, dan susunan profil yang santun penuh adab.',
    recommendedFor: 'Syar’i & Islamic Heritage, Akad di Masjid',
    iconType: 'moon',
    defaultSlots: {
      corner: 'corners/corner-05.svg',
      monogram: 'ornaments/ornament-06.svg',
      divider: 'lines/line-05.svg',
      coupleSurround: 'ornaments/ornament-07.svg',
      iconMarker: 'icons/icon-05.svg',
      tailpiece: 'ornaments/ornament-08.svg',
    },
  },
  {
    id: 'twin-arch',
    name: '6. Twin Arch Enclosed',
    subtitle: 'Bingkai Lengkung Arsitektural Kembar',
    description: 'Kubah ganda arsitektur membungkus foto kedua pengantin dengan garis batas lengkung terstruktur rapi.',
    recommendedFor: 'Twin Arches, Intimate Elegance',
    iconType: 'columns',
    defaultSlots: {
      corner: 'corners/corner-06.svg',
      monogram: 'ornaments/ornament-09.svg',
      divider: 'lines/line-06.svg',
      coupleSurround: 'cards/card-01.svg',
      iconMarker: 'icons/icon-06.svg',
      tailpiece: 'ornaments/ornament-10.svg',
    },
  },
  {
    id: 'corner-baroque',
    name: '7. Corner Flourish Baroque',
    subtitle: 'Sentuhan 4 Sudut Kartu Fisik Mewah',
    description: 'Empat sudut ukiran klasik di tepi layar dipadukan dengan segel lilin monogram 3D memberi ilusi kartu cetak 600 gsm.',
    recommendedFor: 'Undangan Formal, Wax Seal Enthusiasts',
    iconType: 'square',
    defaultSlots: {
      corner: 'corners/corner-07.svg',
      monogram: 'ornaments/ornament-11.svg',
      divider: 'lines/line-07.svg',
      coupleSurround: 'corners/corner-08.svg',
      iconMarker: 'icons/icon-07.svg',
      tailpiece: 'ornaments/ornament-12.svg',
    },
  },
  {
    id: 'minimalist-stems',
    name: '8. Minimalist Stems & Airy',
    subtitle: 'Ruang Napas Luas & Sentuhan Puitis',
    description: 'Estetika hening dengan ruang putih bersih, aksen satu tangkai bunga halus di margin samping, dan garis hairline.',
    recommendedFor: 'Modern Minimalist, Outdoor Menguneng',
    iconType: 'feather',
    defaultSlots: {
      corner: 'corners/corner-01.svg',
      monogram: 'abstract/symbol-03.svg',
      divider: 'lines/line-08.svg',
      coupleSurround: 'flowers/single-stem/flower-02.svg',
      iconMarker: 'icons/icon-08.svg',
      tailpiece: 'abstract/symbol-04.svg',
    },
  },
  {
    id: 'celestial-flow',
    name: '9. Celestial Diagonal Flow',
    subtitle: 'Aliran Bintang Malam Menganti',
    description: 'Ornamen mengalir diagonal lembut dari kiri bawah ke kanan atas, menghadirkan nuansa malam sakral berbintang Pantai Menganti.',
    recommendedFor: 'Evening Wedding, Sunset Reception Kebumen',
    iconType: 'sparkles',
    defaultSlots: {
      corner: 'corners/corner-02.svg',
      monogram: 'abstract/symbol-05.svg',
      divider: 'lines/line-09.svg',
      coupleSurround: 'ornaments/ornament-13.svg',
      iconMarker: 'icons/icon-09.svg',
      tailpiece: 'abstract/symbol-06.svg',
    },
  },
  {
    id: 'postage-ribbon',
    name: '10. Postage & Seal Ribbon',
    subtitle: 'Pita Nostalgia & Surat Cinta Klasik',
    description: 'Aksen pita vertikal surat cinta vintage, garis pembatas perangko berpori halus, dan cap stempel inisial estetik.',
    recommendedFor: 'Polaroid Scrapbook, Intimate Family Gathering',
    iconType: 'bookmark',
    defaultSlots: {
      corner: 'corners/corner-03.svg',
      monogram: 'ornaments/ornament-14.svg',
      divider: 'lines/line-10.svg',
      coupleSurround: 'leaves/sprigs/sprig-01.svg',
      iconMarker: 'icons/icon-10.svg',
      tailpiece: 'ornaments/ornament-15.svg',
    },
  },
];

export interface SlotZoneRule {
  id: SlotZoneId;
  label: string;
  description: string;
  allowedCategories: string[];
  maxScaleClamping: string;
}

export const SLOT_ZONE_RULES: Record<SlotZoneId, SlotZoneRule> = {
  corner: {
    id: 'corner',
    label: 'Zona 1: Sudut Bingkai (Corner Flourish)',
    description: 'Ditempatkan di sudut atas & bawah bingkai kartu amplop cover.',
    allowedCategories: ['corners'],
    maxScaleClamping: 'max-w-[48px] max-h-[48px]',
  },
  monogram: {
    id: 'monogram',
    label: 'Zona 2: Lencana Monogram (Crest Badge)',
    description: 'Ditempatkan di atas nama mempelai atau puncak cover.',
    allowedCategories: ['ornaments', 'abstract', 'flowers/blooms', 'avatars'],
    maxScaleClamping: 'max-w-[64px] max-h-[64px]',
  },
  divider: {
    id: 'divider',
    label: 'Zona 3: Garis Pembatas (Section Divider)',
    description: 'Pemisah horizontal antar-section di bawah judul konten.',
    allowedCategories: ['lines'],
    maxScaleClamping: 'w-full max-w-[85%] max-h-[28px]',
  },
  'couple-surround': {
    id: 'couple-surround',
    label: 'Zona 4: Hiasan Foto Mempelai (Surround)',
    description: 'Membingkai atau memeluk sisi foto pengantin pria & wanita.',
    allowedCategories: [
      'leaves/branches',
      'leaves/sprigs',
      'leaves/stems',
      'flowers/single-stem',
      'flowers/accents',
      'cards',
      'ornaments',
      'compositions',
    ],
    maxScaleClamping: 'max-w-[120px] max-h-[140px]',
  },
  'icon-marker': {
    id: 'icon-marker',
    label: 'Zona 5: Ikon Informasi Fine-Line (Marker)',
    description: 'Penanda baris waktu acara, peta lokasi, dan rekening bank.',
    allowedCategories: ['icons', 'flowers/accents'],
    maxScaleClamping: 'w-5 h-5',
  },
  tailpiece: {
    id: 'tailpiece',
    label: 'Zona 6: Ornamen Penutup (Tailpiece)',
    description: 'Ornamen anggun penutup di atas footer takzim keluarga.',
    allowedCategories: ['ornaments', 'abstract', 'flowers/accents'],
    maxScaleClamping: 'max-w-[72px] max-h-[36px]',
  },
};

export function getSlotAllowedCategories(slot: SlotZoneId): string[] {
  return SLOT_ZONE_RULES[slot]?.allowedCategories || [];
}

export function isAssetCompatibleWithSlot(asset: HariKitaAsset, slot: SlotZoneId): boolean {
  if (!asset || !slot) return false;
  const allowed = getSlotAllowedCategories(slot);
  return allowed.some((cat) => asset.category === cat || asset.category.startsWith(`${cat}/`));
}

export function getSlotHarmonyStatus(
  asset: HariKitaAsset,
  slot: SlotZoneId,
  styleId: PlacementStyleId
): 'perfect' | 'alternative' | 'incompatible' {
  if (!isAssetCompatibleWithSlot(asset, slot)) {
    return 'incompatible';
  }

  const styleDef = PLACEMENT_STYLES_CATALOG.find((s) => s.id === styleId);
  if (!styleDef) return 'alternative';

  const defaultAsset = (styleDef.defaultSlots as any)[slot];
  if (defaultAsset && defaultAsset.includes(asset.id)) {
    return 'perfect';
  }

  return 'alternative';
}
