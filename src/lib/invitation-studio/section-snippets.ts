/**
 * HariKita Invitation Studio — Section Snippet Library
 *
 * Pustaka elemen pengisi (snippets) siap pakai untuk meracik layout Cover kustom.
 * Setiap snippet adalah satu node mandiri yang bisa ditambahkan ke section mana pun.
 *
 * Cashmere Alabaster & Gilded Champagne palette:
 *   Canvas:  #FAF8F5  |  Gold:    #C5A880
 *   Plum:    #4A2E35  |  Champagne: #F3EDE6  |  Taupe: #88735B
 */
import type { StudioNode } from './types';

const PP = '/assets/harikita/placeholders/photo-portrait.svg';
const LP = '/assets/harikita/placeholders/photo-landscape.svg';
const CP = '/assets/harikita/placeholders/photo-circle.svg';
const PLP = '/assets/harikita/placeholders/photo-polaroid.svg';

const fadeIn = (delayMs = 0) => ({
  preset: 'none' as const, durationMs: 1200, delayMs,
  entrance: { enabled: true, durationMs: 1200, delayMs, direction: 'up' as const, intensity: 5 },
  loop: { preset: 'none' as const, durationMs: 3000, intensity: 5, repeat: 0 },
  exit: { enabled: false, durationMs: 800, delayMs: 0 },
});
const floatAnim = (delayMs = 0) => ({
  preset: 'float' as const, durationMs: 4000, delayMs,
  entrance: { enabled: true, durationMs: 1000, delayMs, direction: 'up' as const, intensity: 3 },
  loop: { preset: 'float' as const, durationMs: 4000, intensity: 8, repeat: 0 },
  exit: { enabled: false, durationMs: 800, delayMs: 0 },
});

type NodeBase = Pick<StudioNode, 'layer' | 'visible' | 'locked' | 'appearance' | 'accessibility'>;
const nodeBase = (layer: StudioNode['layer'] = 'content', opacity = 100): NodeBase => ({
  layer, visible: true, locked: false,
  appearance: { opacity, overflow: 'visible' },
  accessibility: { label: 'Elemen undangan' },
});
const tfm = (x: number, y: number, w: number, h: number, rot = 0) => ({
  x, y, width: w, height: h, rotation: rot, flipX: false, flipY: false,
});

export interface SectionSnippet {
  id: string;
  category: 'photo' | 'text' | 'decoration' | 'shape';
  name: string;
  thumbnail: string;
  node: Omit<StudioNode, 'id'>;
}

export const SECTION_SNIPPETS: SectionSnippet[] = [
  {
    id: 'photo-portrait-center',
    category: 'photo',
    name: 'Foto Portrait Tengah',
    thumbnail: '🖼️',
    node: { name: 'Foto Portrait', ...nodeBase('content'), transform: tfm(25,20,50,50), animation: fadeIn(0), kind: 'image', config: { src: PP, fit: 'cover' } },
  },
  {
    id: 'photo-landscape-wide',
    category: 'photo',
    name: 'Foto Landscape Lebar',
    thumbnail: '🌄',
    node: { name: 'Foto Landscape', ...nodeBase('content'), transform: tfm(10,30,80,35), animation: fadeIn(0), kind: 'image', config: { src: LP, fit: 'cover' } },
  },
  {
    id: 'photo-circle-small',
    category: 'photo',
    name: 'Foto Lingkaran Kecil',
    thumbnail: '⭕',
    node: { name: 'Foto Circle', ...nodeBase('content'), transform: tfm(35,25,30,30), animation: fadeIn(0), kind: 'image', config: { src: CP, fit: 'cover' } },
  },
  {
    id: 'photo-polaroid-left',
    category: 'photo',
    name: 'Polaroid Kiri',
    thumbnail: '📸',
    node: { name: 'Polaroid', ...nodeBase('behind-content'), transform: tfm(10,15,35,32), animation: fadeIn(0), kind: 'image', config: { src: PLP, fit: 'cover' } },
  },
  {
    id: 'photo-polaroid-right',
    category: 'photo',
    name: 'Polaroid Kanan',
    thumbnail: '📷',
    node: { name: 'Polaroid', ...nodeBase('behind-content'), transform: tfm(55,15,35,32), animation: fadeIn(0), kind: 'image', config: { src: PLP, fit: 'cover' } },
  },
  {
    id: 'text-couple-names-script',
    category: 'text',
    name: 'Nama Couple Script',
    thumbnail: '✍️',
    node: { name: 'Nama Couple', ...nodeBase('content'), transform: tfm(10,40,80,18), animation: fadeIn(0), kind: 'text', config: { text: 'Ananda & Bintang', color: '#4A2E35', fontSize: 44, align: 'center', fontFamily: 'Great Vibes' } },
  },
  {
    id: 'text-couple-names-serif',
    category: 'text',
    name: 'Nama Couple Serif',
    thumbnail: '📝',
    node: { name: 'Nama Couple', ...nodeBase('content'), transform: tfm(10,40,80,16), animation: fadeIn(0), kind: 'text', config: { text: 'Ananda & Bintang', color: '#4A2E35', fontSize: 38, align: 'center', fontFamily: 'Playfair Display' } },
  },
  {
    id: 'text-label-wedding',
    category: 'text',
    name: 'Label THE WEDDING OF',
    thumbnail: '💍',
    node: { name: 'Label', ...nodeBase('content'), transform: tfm(10,10,80,6), animation: fadeIn(0), kind: 'text', config: { text: 'THE WEDDING OF', color: '#88735B', fontSize: 10, align: 'center', fontFamily: 'Syncopate', letterSpacing: 3 } },
  },
  {
    id: 'text-date-simple',
    category: 'text',
    name: 'Tanggal Sederhana',
    thumbnail: '📅',
    node: { name: 'Tanggal', ...nodeBase('content'), transform: tfm(20,75,60,6), animation: fadeIn(0), kind: 'text', config: { text: '14 Februari 2026', color: '#88735B', fontSize: 13, align: 'center', fontFamily: 'Lora' } },
  },
  {
    id: 'text-bismillah-arabic',
    category: 'text',
    name: 'Bismillah Arab',
    thumbnail: '☪️',
    node: { name: 'Bismillah', ...nodeBase('content'), transform: tfm(10,8,80,10), animation: fadeIn(0), kind: 'text', config: { text: '\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650', color: '#C5A880', fontSize: 18, align: 'center', fontFamily: 'Amiri' } },
  },
  {
    id: 'decoration-divider-gold',
    category: 'decoration',
    name: 'Garis Pembatas Emas',
    thumbnail: '✦',
    node: { name: 'Pembatas', ...nodeBase('front-decoration'), transform: tfm(30,45,40,4), animation: fadeIn(0), kind: 'text', config: { text: '—— ✦ ——', color: '#C5A880', fontSize: 14, align: 'center' } },
  },
  {
    id: 'decoration-ornament-top',
    category: 'decoration',
    name: 'Ornamen Atas',
    thumbnail: '✨',
    node: { name: 'Ornamen', ...nodeBase('front-decoration'), transform: tfm(35,5,30,6), animation: fadeIn(0), kind: 'text', config: { text: '✦ ✧ ✦', color: '#C5A880', fontSize: 18, align: 'center' } },
  },
  {
    id: 'decoration-ornament-bottom',
    category: 'decoration',
    name: 'Ornamen Bawah',
    thumbnail: '💫',
    node: { name: 'Ornamen', ...nodeBase('front-decoration'), transform: tfm(35,88,30,6), animation: fadeIn(0), kind: 'text', config: { text: '✧ ✦ ✧', color: '#C5A880', fontSize: 18, align: 'center' } },
  },
  {
    id: 'decoration-leaf-left',
    category: 'decoration',
    name: 'Daun Kiri',
    thumbnail: '🌿',
    node: { name: 'Daun Kiri', ...nodeBase('front-decoration'), transform: tfm(2,10,20,18), animation: fadeIn(0), kind: 'text', config: { text: '🌿', color: '#88735B', fontSize: 48, align: 'left' } },
  },
  {
    id: 'decoration-leaf-right',
    category: 'decoration',
    name: 'Daun Kanan',
    thumbnail: '🍃',
    node: { name: 'Daun Kanan', ...nodeBase('front-decoration'), transform: tfm(78,10,20,18), animation: fadeIn(0), kind: 'text', config: { text: '🍃', color: '#88735B', fontSize: 48, align: 'right' } },
  },
  {
    id: 'decoration-ampersand-float',
    category: 'decoration',
    name: 'Ampersand Mengambang',
    thumbnail: '&',
    node: { name: 'Ampersand', ...nodeBase('front-decoration'), transform: tfm(43,40,14,12), animation: floatAnim(0), kind: 'text', config: { text: '&', color: '#C5A880', fontSize: 42, align: 'center', fontFamily: 'Allura' } },
  },
  {
    id: 'decoration-heart-icon',
    category: 'decoration',
    name: 'Ikon Hati',
    thumbnail: '❤️',
    node: { name: 'Hati', ...nodeBase('front-decoration'), transform: tfm(43,42,14,10), animation: floatAnim(0), kind: 'text', config: { text: '♥', color: '#C5A880', fontSize: 32, align: 'center' } },
  },
  {
    id: 'decoration-scroll-cta',
    category: 'decoration',
    name: 'CTA Gulir',
    thumbnail: '⬇️',
    node: { name: 'CTA Scroll', ...nodeBase('front-decoration'), transform: tfm(30,88,40,6), animation: floatAnim(0), kind: 'text', config: { text: '↓ Buka Undangan ↓', color: '#C5A880', fontSize: 11, align: 'center', fontFamily: 'Plus Jakarta Sans' } },
  },
];

export function getSnippetsByCategory(category: SectionSnippet['category']): SectionSnippet[] {
  return SECTION_SNIPPETS.filter(s => s.category === category);
}

export function getSnippetById(id: string): SectionSnippet | undefined {
  return SECTION_SNIPPETS.find(s => s.id === id);
}
