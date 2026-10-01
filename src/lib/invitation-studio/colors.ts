"use client";

import type { CSSProperties } from 'react';
import type { StudioBackground, StudioBackgroundTexture } from './types';

export interface ColorSwatch {
  name: string;
  hex: string;
  desc?: string;
}

export interface ColorPaletteGroup {
  id: string;
  name: string;
  description: string;
  colors: ColorSwatch[];
}

export const HARIKITA_WEDDING_PALETTES: ColorPaletteGroup[] = [
  {
    id: 'signature',
    name: 'HariKita Signature & Gold',
    description: 'Palet resmi HariKita dengan paduan champagne, emas, dan plum mewah.',
    colors: [
      { name: 'Deep Plum Charcoal', hex: '#4A2E35', desc: 'Warna teks utama berkelas' },
      { name: 'Gilded Gold', hex: '#C5A880', desc: 'Aksen emas mewah resmi' },
      { name: 'Metallic Imperial Gold', hex: '#D4AF37', desc: 'Emas kilau elegan' },
      { name: 'Warm Taupe', hex: '#88735B', desc: 'Coklat taupe hangat' },
      { name: 'Gilded Champagne', hex: '#C9A88A', desc: 'Champagne lembut' },
      { name: 'Antique Bronze', hex: '#996515', desc: 'Perunggu tembaga antik' },
      { name: 'Cashmere Canvas', hex: '#FAF8F5', desc: 'Krem latar belakang' },
      { name: 'Champagne Surface', hex: '#F3EDE6', desc: 'Permukaan kartu lembut' },
    ],
  },
  {
    id: 'romance',
    name: 'Romance & Dusty Blush',
    description: 'Kombinasi warna romantis lembut, dusty rose, peach, dan merah marun intim.',
    colors: [
      { name: 'Dusty Rose', hex: '#D88A8A', desc: 'Mawar lembut' },
      { name: 'Blush Pink', hex: '#E8A598', desc: 'Merah muda hangat' },
      { name: 'Soft Petal', hex: '#F3C5B8', desc: 'Kelopak bunga pastel' },
      { name: 'Muted Mauve', hex: '#C47474', desc: 'Mauve tenang' },
      { name: 'Deep Berry Maroon', hex: '#6B3B48', desc: 'Marun anggun' },
      { name: 'Crimson Rosewood', hex: '#8A3B4A', desc: 'Kayu mawar gelap' },
      { name: 'Pale Blush', hex: '#FDF2F0', desc: 'Putih semu blush' },
      { name: 'Burgundy Velvet', hex: '#581825', desc: 'Beludru merah darah' },
    ],
  },
  {
    id: 'botanical',
    name: 'Botanical Sage & Earth',
    description: 'Harmoni alam dedaunan sage, zaitun, terracotta, dan kehangatan tanah.',
    colors: [
      { name: 'Sage Green', hex: '#6B8E6B', desc: 'Hijau sage estetik' },
      { name: 'Olive Leaf', hex: '#4F6B4F', desc: 'Zaitun hijau alami' },
      { name: 'Eucalyptus Frost', hex: '#8FA88F', desc: 'Eukaliptus lembut' },
      { name: 'Deep Forest Pine', hex: '#2F482F', desc: 'Hijau hutan pinus' },
      { name: 'Terracotta Rust', hex: '#C86446', desc: 'Tanah liat panggang' },
      { name: 'Warm Terracotta', hex: '#A24830', desc: 'Bata merah klasik' },
      { name: 'Golden Olive', hex: '#7D7048', desc: 'Zaitun keemasan' },
      { name: 'Clay Sand', hex: '#D9B48F', desc: 'Pasir gurun hangat' },
    ],
  },
  {
    id: 'royal-navy',
    name: 'Royal Navy & Twilight Slate',
    description: 'Kemegahan malam, biru safir keraton, slate arsitektural, dan abu grafit.',
    colors: [
      { name: 'Midnight Navy', hex: '#2B3E50', desc: 'Biru navy pekat' },
      { name: 'Royal Sapphire', hex: '#1E2D3D', desc: 'Safir bangsawan' },
      { name: 'Dusk Slate', hex: '#4A5F73', desc: 'Abu kebiruan senja' },
      { name: 'Deep Ocean', hex: '#141E28', desc: 'Samudra tenang' },
      { name: 'Steel Blue', hex: '#5C768D', desc: 'Baja modern' },
      { name: 'Imperial Violet', hex: '#3C2A3E', desc: 'Ungu kerajaan gelap' },
      { name: 'Charcoal Indigo', hex: '#232938', desc: 'Arang beraksen nila' },
      { name: 'Mist Blue', hex: '#E6ECF2', desc: 'Kabut pagi biru' },
    ],
  },
  {
    id: 'monochrome',
    name: 'Neutral & Monochrome Chic',
    description: 'Kemewahan minimalis hitam, putih gading, perak, dan abu netral.',
    colors: [
      { name: 'Pure White', hex: '#FFFFFF', desc: 'Putih bersih' },
      { name: 'Alabaster Ivory', hex: '#F9F8F6', desc: 'Gading alabaster' },
      { name: 'Soft Oyster', hex: '#E8DED1', desc: 'Kerang mutiara' },
      { name: 'Silver Ash', hex: '#D1D5DB', desc: 'Perak lembut' },
      { name: 'Slate Gray', hex: '#6B7280', desc: 'Abu-abu sedang' },
      { name: 'Dark Graphite', hex: '#374151', desc: 'Grafit arang' },
      { name: 'Near Black', hex: '#1F2937', desc: 'Hitam arang elegan' },
      { name: 'Absolute Black', hex: '#111827', desc: 'Hitam tegas pekat' },
    ],
  },
];

/**
 * Palet ringkas cepat yang selalu tersedia di toolbar cepat swatch.
 */
export const QUICK_ACCENT_COLORS = [
  '#4A2E35', // Deep Plum
  '#C5A880', // Gilded Gold
  '#D4AF37', // Imperial Gold
  '#88735B', // Warm Taupe
  '#D88A8A', // Dusty Rose
  '#6B8E6B', // Sage Green
  '#C86446', // Terracotta
  '#2B3E50', // Midnight Navy
  '#111827', // Absolute Black
  '#FFFFFF', // Pure White
];

/**
 * Memvalidasi apakah string merupakan format warna CSS yang sah.
 */
export function isValidColorString(color: string): boolean {
  if (!color || typeof color !== 'string') return false;
  const trimmed = color.trim();
  // Hex #RGB, #RGBA, #RRGGBB, #RRGGBBAA
  if (/^#([\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(trimmed)) return true;
  // rgb(...) / rgba(...)
  if (/^rgba?\([^)]+\)$/i.test(trimmed)) return true;
  // hsl(...) / hsla(...)
  if (/^hsla?\([^)]+\)$/i.test(trimmed)) return true;
  return false;
}

/** Cream Canvas (#FAF8F5) — the original hardcoded canvas colour, used as fallback. */
export const DEFAULT_CANVAS_BACKGROUND = '#FAF8F5';

/** Texture presets selectable in the studio, with a human label + description. */
export const STUDIO_BACKGROUND_TEXTURES: ReadonlyArray<{ id: StudioBackgroundTexture; label: string; desc: string }> = [
  { id: 'noise', label: 'Noise Halus', desc: 'Bintik lembut seperti kertas beri' },
  { id: 'grain', label: 'Grain Foto', desc: 'Butiran tipis ala film analog' },
  { id: 'linen', label: 'Linen', desc: 'Garis tenun kain linen' },
  { id: 'marble', label: 'Marble', desc: 'Alur marmer ringan' },
  { id: 'dots', label: 'Polkadot', desc: 'Titik rapi berulang' },
  { id: 'rays', label: 'Rays', desc: 'Garis diagonal diagonal' },
];

/**
 * Peta tekstur -> CSS `background-image` (murni gradien CSS, tanpa berkas gambar).
 * `base` adalah warna dasar di bawah tekstur, `accent` warna motif, `intensity` 0-100
 * mengatur kepekatan motif.
 */
function textureLayers(texture: StudioBackgroundTexture, base: string, accent: string, intensity: number): string {
  const t = Math.min(100, Math.max(0, intensity)) / 100;
  switch (texture) {
    case 'noise':
      return `radial-gradient(${accent} 0.5px, transparent 0.5px), radial-gradient(${accent} 0.5px, ${base} 0.5px)`;
    case 'grain':
      return `repeating-linear-gradient(0deg, ${accent} 0px, ${accent} 1px, transparent 1px, transparent 3px), repeating-linear-gradient(90deg, ${accent} 0px, ${accent} 1px, transparent 1px, transparent 4px)`;
    case 'linen':
      return `repeating-linear-gradient(0deg, ${accent} 0px, ${accent} 1px, transparent 1px, transparent 4px), repeating-linear-gradient(90deg, ${accent} 0px, ${accent} 1px, transparent 1px, transparent 4px)`;
    case 'marble':
      return `repeating-linear-gradient(115deg, transparent 0px, ${accent} 2px, transparent 6px, transparent 22px), repeating-linear-gradient(65deg, transparent 0px, ${accent} 1px, transparent 5px, transparent 28px)`;
    case 'dots':
      return `radial-gradient(${accent} 1.5px, transparent 1.5px)`;
    case 'rays':
      return `repeating-linear-gradient(45deg, ${accent} 0px, ${accent} 2px, transparent 2px, transparent 12px)`;
    default:
      return `none`;
  }
}

/** Ukuran tile default per tekstur (px). */
function textureSize(texture: StudioBackgroundTexture): string {
  switch (texture) {
    case 'noise': return '3px 3px, 6px 6px';
    case 'grain': case 'linen': return 'auto';
    case 'marble': return 'auto';
    case 'dots': return '16px 16px';
    case 'rays': return 'auto';
    default: return 'auto';
  }
}

/**
 * Mengubah StudioBackground menjadi CSS `style` inline yang siap dipasang pada
 * elemen latar kanvas. Menghasilkan `backgroundColor` + `backgroundImage`.
 *
 * Tanpa `background` (dokumen lama) → Cream Canvas solid.
 */
export function backgroundToCss(bg?: StudioBackground | null): CSSProperties {
  if (!bg) return { backgroundColor: DEFAULT_CANVAS_BACKGROUND };
  if (bg.kind === 'solid') {
    return { backgroundColor: isValidColorString(bg.color) ? bg.color : DEFAULT_CANVAS_BACKGROUND };
  }
  if (bg.kind === 'gradient') {
    const from = isValidColorString(bg.from) ? bg.from : DEFAULT_CANVAS_BACKGROUND;
    const to = isValidColorString(bg.to) ? bg.to : DEFAULT_CANVAS_BACKGROUND;
    const angle = Number.isFinite(bg.angle) ? bg.angle : 135;
    return { backgroundImage: `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)` };
  }
  // texture
  const base = isValidColorString(bg.baseColor) ? bg.baseColor : DEFAULT_CANVAS_BACKGROUND;
  const accent = isValidColorString(bg.accentColor) ? bg.accentColor : '#C5A88033';
  return {
    backgroundColor: base,
    backgroundImage: textureLayers(bg.texture, base, accent, bg.intensity),
    backgroundSize: textureSize(bg.texture),
  };
}
