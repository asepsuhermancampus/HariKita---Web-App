/**
 * HariKita Invitation Studio — Section Content Templates
 *
 * Library template konten siap pakai untuk 16 section undangan.
 * Setiap template berisi node-node siap edit (teks, foto placeholder,
 * dekorasi, dan blok komponen interaktif).
 *
 * Cashmere Alabaster & Gilded Champagne palette:
 *   Canvas:  #FAF8F5  |  Gold:    #C5A880
 *   Plum:    #4A2E35  |  Champagne: #F3EDE6  |  Taupe: #88735B
 */
import type { StudioNode, StudioSectionId } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Public Types
// ─────────────────────────────────────────────────────────────────────────────
export interface SectionTemplate {
  id: string;
  sectionId: StudioSectionId;
  name: string;
  description: string;
  /** Emoji shown as thumbnail in the picker UI */
  thumbnail: string;
  nodes: Omit<StudioNode, 'id'>[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers — keep DRY
// ─────────────────────────────────────────────────────────────────────────────
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
const swayAnim = (delayMs = 0) => ({
  preset: 'sway' as const, durationMs: 6000, delayMs,
  entrance: { enabled: true, durationMs: 800, delayMs, direction: 'up' as const, intensity: 0 },
  loop: { preset: 'sway' as const, durationMs: 6000, intensity: 5, repeat: 0 },
  exit: { enabled: false, durationMs: 600, delayMs: 0 },
});
const staticAnim = () => ({
  preset: 'none' as const, durationMs: 800, delayMs: 0,
  entrance: { enabled: false, durationMs: 800, delayMs: 0 },
  loop: { preset: 'none' as const, durationMs: 3000, intensity: 5, repeat: 0 },
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

// Photo placeholder SVGs (portrait & landscape & venue)
const PP = 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22400%22%20viewBox%3D%220%200%20300%20400%22%3E%3Crect%20width%3D%22300%22%20height%3D%22400%22%20fill%3D%22%23F3EDE6%22%2F%3E%3Crect%20x%3D%221%22%20y%3D%221%22%20width%3D%22298%22%20height%3D%22398%22%20rx%3D%228%22%20stroke%3D%22%23C5A880%22%20stroke-width%3D%222%22%20stroke-dasharray%3D%228%204%22%2F%3E%3Ccircle%20cx%3D%22150%22%20cy%3D%22155%22%20r%3D%2245%22%20fill%3D%22%23D4C4B5%22%2F%3E%3Cellipse%20cx%3D%22150%22%20cy%3D%22305%22%20rx%3D%2270%22%20ry%3D%2245%22%20fill%3D%22%23D4C4B5%22%2F%3E%3Ctext%20x%3D%22150%22%20y%3D%22360%22%20text-anchor%3D%22middle%22%20font-family%3D%22Georgia%2Cserif%22%20font-size%3D%2213%22%20fill%3D%22%2388735B%22%3EKlik%20untuk%20ganti%20foto%3C%2Ftext%3E%3Ctext%20x%3D%22150%22%20y%3D%22380%22%20text-anchor%3D%22middle%22%20font-family%3D%22Georgia%2Cserif%22%20font-size%3D%2211%22%20fill%3D%22%23C5A880%22%3EFoto%20Couple%20%2F%20Prewedding%3C%2Ftext%3E%3C%2Fsvg%3E';
const LP = 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22250%22%20viewBox%3D%220%200%20400%20250%22%3E%3Crect%20width%3D%22400%22%20height%3D%22250%22%20fill%3D%22%23F3EDE6%22%2F%3E%3Crect%20x%3D%221%22%20y%3D%221%22%20width%3D%22398%22%20height%3D%22248%22%20rx%3D%228%22%20stroke%3D%22%23C5A880%22%20stroke-width%3D%222%22%20stroke-dasharray%3D%228%204%22%2F%3E%3Crect%20x%3D%2230%22%20y%3D%2230%22%20width%3D%22340%22%20height%3D%22170%22%20rx%3D%226%22%20fill%3D%22%23E8DED1%22%2F%3E%3Ccircle%20cx%3D%22130%22%20cy%3D%22110%22%20r%3D%2238%22%20fill%3D%22%23D4C4B5%22%2F%3E%3Ccircle%20cx%3D%22270%22%20cy%3D%22110%22%20r%3D%2238%22%20fill%3D%22%23D4C4B5%22%2F%3E%3Ccircle%20cx%3D%22200%22%20cy%3D%22100%22%20r%3D%2232%22%20fill%3D%22%23D4C4B5%22%2F%3E%3Ctext%20x%3D%22200%22%20y%3D%22225%22%20text-anchor%3D%22middle%22%20font-family%3D%22Georgia%2Cserif%22%20font-size%3D%2212%22%20fill%3D%22%2388735B%22%3EKlik%20untuk%20ganti%20foto%3C%2Ftext%3E%3C%2Fsvg%3E';
const VP = 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22280%22%20viewBox%3D%220%200%20400%20280%22%3E%3Crect%20width%3D%22400%22%20height%3D%22280%22%20fill%3D%22%23F3EDE6%22%2F%3E%3Crect%20x%3D%221%22%20y%3D%221%22%20width%3D%22398%22%20height%3D%22278%22%20rx%3D%228%22%20stroke%3D%22%23C5A880%22%20stroke-width%3D%222%22%20stroke-dasharray%3D%228%204%22%2F%3E%3Crect%20x%3D%2220%22%20y%3D%2220%22%20width%3D%22360%22%20height%3D%22200%22%20rx%3D%226%22%20fill%3D%22%23E8DED1%22%2F%3E%3Crect%20x%3D%2250%22%20y%3D%2280%22%20width%3D%22300%22%20height%3D%22140%22%20rx%3D%224%22%20fill%3D%22%23D4C4B5%22%2F%3E%3Crect%20x%3D%22160%22%20y%3D%22130%22%20width%3D%2280%22%20height%3D%2290%22%20rx%3D%222%22%20fill%3D%22%23BDA98F%22%2F%3E%3Crect%20x%3D%2280%22%20y%3D%22110%22%20width%3D%2250%22%20height%3D%2250%22%20rx%3D%222%22%20fill%3D%22%23BDA98F%22%2F%3E%3Crect%20x%3D%22270%22%20y%3D%22110%22%20width%3D%2250%22%20height%3D%2250%22%20rx%3D%222%22%20fill%3D%22%23BDA98F%22%2F%3E%3Cpolygon%20points%3D%22200%2C60%20100%2C100%20300%2C100%22%20fill%3D%22%23C8B5A0%22%2F%3E%3Ctext%20x%3D%22200%22%20y%3D%22255%22%20text-anchor%3D%22middle%22%20font-family%3D%22Georgia%2Cserif%22%20font-size%3D%2212%22%20fill%3D%22%2388735B%22%3EKlik%20untuk%20ganti%20foto%20venue%3C%2Ftext%3E%3C%2Fsvg%3E';

// ─────────────────────────────────────────────────────────────────────────────
// 1. COVER (3 templates)
// ─────────────────────────────────────────────────────────────────────────────
const COVER_TEMPLATES: SectionTemplate[] = [
  {
    id: 'cover-romantic', sectionId: 'cover',
    name: 'Romantis Klasik', thumbnail: '🌸',
    description: 'Cover elegan dengan foto couple besar dan ornamen bunga',
    nodes: [
      { name: 'Background Foto', ...nodeBase('background'), transform: tfm(0,0,100,100), animation: staticAnim(), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Bismillah / Opening', ...nodeBase('content'), transform: tfm(10,38,80,8), animation: fadeIn(0), kind: 'text', config: { text: '\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650', color: '#C5A880', fontSize: 18, align: 'center', fontFamily: 'Amiri' } },
      { name: 'Label Undangan', ...nodeBase('content'), transform: tfm(10,48,80,6), animation: fadeIn(300), kind: 'text', config: { text: 'Undangan Pernikahan', color: '#FAF8F5', fontSize: 13, align: 'center', fontFamily: 'Plus Jakarta Sans', letterSpacing: 2 } },
      { name: 'Nama Pengantin', ...nodeBase('content'), transform: tfm(5,55,90,18), animation: fadeIn(600), kind: 'text', config: { text: 'Ananda & Bintang', color: '#FAF8F5', fontSize: 48, align: 'center', fontFamily: 'Great Vibes' } },
      { name: 'Tanggal Pernikahan', ...nodeBase('content'), transform: tfm(15,74,70,7), animation: fadeIn(900), kind: 'text', config: { text: 'Sabtu, 14 Februari 2026', color: '#C5A880', fontSize: 14, align: 'center', fontFamily: 'Cormorant Garamond' } },
      { name: 'Gulir ke Bawah', ...nodeBase('front-decoration'), transform: tfm(35,88,30,6), animation: floatAnim(1200), kind: 'text', config: { text: '\u2193 Buka Undangan \u2193', color: '#FAF8F5', fontSize: 11, align: 'center', fontFamily: 'Plus Jakarta Sans' } },
    ],
  },
  {
    id: 'cover-modern', sectionId: 'cover',
    name: 'Modern Minimalis', thumbnail: '\u2728',
    description: 'Cover bersih dengan tipografi bold dan foto prewedding',
    nodes: [
      { name: 'Garis Dekorasi Atas', ...nodeBase('front-decoration'), transform: tfm(25,5,50,4), animation: fadeIn(0), kind: 'text', config: { text: '\u2014 \u2726 \u2014', color: '#C5A880', fontSize: 14, align: 'center' } },
      { name: 'Label THE WEDDING OF', ...nodeBase('content'), transform: tfm(10,10,80,6), animation: fadeIn(200), kind: 'text', config: { text: 'THE WEDDING OF', color: '#88735B', fontSize: 11, align: 'center', fontFamily: 'Syncopate', letterSpacing: 3 } },
      { name: 'Nama Mempelai Wanita', ...nodeBase('content'), transform: tfm(5,17,90,14), animation: fadeIn(400), kind: 'text', config: { text: 'Raisya Putri', color: '#4A2E35', fontSize: 44, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Simbol Dan', ...nodeBase('front-decoration'), transform: tfm(38,32,24,9), animation: fadeIn(600), kind: 'text', config: { text: '&', color: '#C5A880', fontSize: 34, align: 'center', fontFamily: 'Allura' } },
      { name: 'Nama Mempelai Pria', ...nodeBase('content'), transform: tfm(5,42,90,14), animation: fadeIn(800), kind: 'text', config: { text: 'Daffa Pratama', color: '#4A2E35', fontSize: 44, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Foto Couple', ...nodeBase('behind-content'), transform: tfm(15,57,70,32), animation: fadeIn(500), kind: 'image', config: { src: LP, fit: 'cover' } },
      { name: 'Tanggal & Kota', ...nodeBase('content'), transform: tfm(15,91,70,6), animation: fadeIn(1000), kind: 'text', config: { text: '14 \u00b7 02 \u00b7 2026  |  Kebumen, Jawa Tengah', color: '#4A2E35', fontSize: 11, align: 'center', fontFamily: 'Plus Jakarta Sans', letterSpacing: 1 } },
    ],
  },
  {
    id: 'cover-syari', sectionId: 'cover',
    name: "Syar'i & Islami", thumbnail: '\ud83d\udd4c',
    description: 'Cover bernuansa islami dengan kaligrafi dan ayat suci',
    nodes: [
      { name: 'Kaligrafi Bismillah', ...nodeBase('content'), transform: tfm(10,5,80,12), animation: fadeIn(0), kind: 'text', config: { text: '\ufdfd', color: '#C5A880', fontSize: 38, align: 'center', fontFamily: 'Amiri' } },
      { name: 'Ayat Taaruf', ...nodeBase('content'), transform: tfm(10,18,80,8), animation: fadeIn(200), kind: 'text', config: { text: '"Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu..."\n\u2014 QS. Ar-Rum: 21', color: '#88735B', fontSize: 11, align: 'center', fontFamily: 'EB Garamond' } },
      { name: 'Label Undangan', ...nodeBase('content'), transform: tfm(10,30,80,6), animation: fadeIn(400), kind: 'text', config: { text: 'Undangan Pernikahan', color: '#4A2E35', fontSize: 13, align: 'center', fontFamily: 'Plus Jakarta Sans', letterSpacing: 2 } },
      { name: 'Nama Couple', ...nodeBase('content'), transform: tfm(5,37,90,18), animation: fadeIn(600), kind: 'text', config: { text: 'Siti Nur Aini\n& M. Rizky Ramadhan', color: '#4A2E35', fontSize: 32, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Foto Pasangan', ...nodeBase('behind-content'), transform: tfm(25,56,50,28), animation: fadeIn(400), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Tanggal Hijriah & Masehi', ...nodeBase('content'), transform: tfm(10,86,80,11), animation: fadeIn(800), kind: 'text', config: { text: 'Ahad, 20 Rajab 1447 H\n18 Januari 2026 M\nKebumen, Jawa Tengah', color: '#4A2E35', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. HERO (2 templates)
// ─────────────────────────────────────────────────────────────────────────────
const HERO_TEMPLATES: SectionTemplate[] = [
  {
    id: 'hero-prewedding', sectionId: 'hero',
    name: 'Foto Pre-wedding', thumbnail: '\ud83d\udcf8',
    description: 'Foto pre-wedding besar dengan caption romantis di atasnya',
    nodes: [
      { name: 'Foto Pre-wedding Utama', ...nodeBase('background'), transform: tfm(0,0,100,100), animation: staticAnim(), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Quote Romantis', ...nodeBase('content'), transform: tfm(10,65,80,18), animation: fadeIn(300), kind: 'text', config: { text: '"Dua jiwa menjadi satu\ndalam ikatan suci yang abadi"', color: '#FAF8F5', fontSize: 15, align: 'center' } },
      { name: 'Nama Singkat', ...nodeBase('front-decoration'), transform: tfm(20,85,60,8), animation: fadeIn(600), kind: 'text', config: { text: '\u2014 Ananda & Bintang \u2014', color: '#C5A880', fontSize: 13, align: 'center' } },
    ],
  },
  {
    id: 'hero-quote', sectionId: 'hero',
    name: 'Quote & Doa', thumbnail: '\ud83d\udcd6',
    description: 'Ayat Al-Quran atau quote cinta dengan latar champagne',
    nodes: [
      { name: 'Ornamen Atas', ...nodeBase('front-decoration'), transform: tfm(35,5,30,5), animation: swayAnim(0), kind: 'text', config: { text: '\u2726 \u2726 \u2726', color: '#C5A880', fontSize: 17, align: 'center' } },
      { name: 'Ayat Al-Quran (Arab)', ...nodeBase('content'), transform: tfm(10,13,80,18), animation: fadeIn(200), kind: 'text', config: { text: '\u0648\u064e\u0645\u0650\u0646\u0652 \u0622\u064a\u064e\u0627\u062a\u0650\u0647\u0650 \u0623\u064e\u0646\u0652 \u062e\u064e\u0644\u064e\u0642\u064e \u0644\u064e\u0643\u064f\u0645 \u0645\u0651\u0650\u0646\u0652 \u0623\u064e\u0646\u0641\u064f\u0633\u0650\u0643\u064f\u0645\u0652 \u0623\u064e\u0632\u0652\u0648\u064e\u0627\u062c\u064b\u0627', color: '#4A2E35', fontSize: 20, align: 'center' } },
      { name: 'Terjemahan', ...nodeBase('content'), transform: tfm(10,33,80,22), animation: fadeIn(400), kind: 'text', config: { text: '"Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu merasa tenteram kepadanya..."\n\n\u2014 QS. Ar-Rum: 21', color: '#6B5E62', fontSize: 12, align: 'center' } },
      { name: 'Pembatas', ...nodeBase('front-decoration'), transform: tfm(30,58,40,4), animation: fadeIn(600), kind: 'text', config: { text: '\u2014 \u2726 \u2014', color: '#C5A880', fontSize: 15, align: 'center' } },
      { name: 'Nama Couple', ...nodeBase('content'), transform: tfm(10,63,80,12), animation: fadeIn(800), kind: 'text', config: { text: 'Ananda Putri\n&\nBintang Pratama', color: '#4A2E35', fontSize: 22, align: 'center' } },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. COUPLE PROFILE (2 templates)
// ─────────────────────────────────────────────────────────────────────────────
const COUPLE_TEMPLATES: SectionTemplate[] = [
  {
    id: 'couple-classic', sectionId: 'couple',
    name: 'Profil Couple Klasik', thumbnail: '\ud83d\udc6b',
    description: 'Dua profil berdampingan dengan foto, nama, dan silsilah orang tua',
    nodes: [
      { name: 'Judul Section', ...nodeBase('content'), transform: tfm(10,3,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Mempelai Kami', color: '#4A2E35', fontSize: 24, align: 'center' } },
      { name: 'Garis Emas', ...nodeBase('front-decoration'), transform: tfm(35,10,30,3), animation: fadeIn(200), kind: 'text', config: { text: '\u2500\u2500\u2500 \u2726 \u2500\u2500\u2500', color: '#C5A880', fontSize: 12, align: 'center' } },
      { name: 'Foto Mempelai Wanita', ...nodeBase('content'), transform: tfm(5,15,40,34), animation: fadeIn(300), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Nama Wanita', ...nodeBase('content'), transform: tfm(5,50,40,7), animation: fadeIn(400), kind: 'text', config: { text: 'Raisya Putri Andini', color: '#4A2E35', fontSize: 15, align: 'center' } },
      { name: 'Putri dari', ...nodeBase('content'), transform: tfm(5,57,40,12), animation: fadeIn(500), kind: 'text', config: { text: 'Putri dari:\nBpk. H. Andika Putra\n& Ibu Hj. Sri Lestari', color: '#88735B', fontSize: 11, align: 'center' } },
      { name: 'Simbol Cinta', ...nodeBase('front-decoration'), transform: tfm(43,27,14,12), animation: floatAnim(600), kind: 'text', config: { text: '\u2665', color: '#C5A880', fontSize: 34, align: 'center' } },
      { name: 'Foto Mempelai Pria', ...nodeBase('content'), transform: tfm(55,15,40,34), animation: fadeIn(300), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Nama Pria', ...nodeBase('content'), transform: tfm(55,50,40,7), animation: fadeIn(400), kind: 'text', config: { text: 'Daffa Pratama Putra', color: '#4A2E35', fontSize: 15, align: 'center' } },
      { name: 'Putra dari', ...nodeBase('content'), transform: tfm(55,57,40,12), animation: fadeIn(500), kind: 'text', config: { text: 'Putra dari:\nBpk. H. Pratama Wibowo\n& Ibu Hj. Dewi Kusuma', color: '#88735B', fontSize: 11, align: 'center' } },
      { name: 'Blok Data Couple', ...nodeBase('component'), transform: tfm(0,71,100,29), animation: fadeIn(600), kind: 'component', config: { component: 'couple', variant: 'default', title: 'Data Couple' } },
    ],
  },
  {
    id: 'couple-stacked', sectionId: 'couple',
    name: 'Profil Bertumpuk', thumbnail: '\ud83d\udc91',
    description: 'Satu foto bersama besar dengan bio lengkap di bawahnya',
    nodes: [
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,2,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Yang Berbahagia', color: '#4A2E35', fontSize: 22, align: 'center' } },
      { name: 'Foto Couple Bersama', ...nodeBase('content'), transform: tfm(15,10,70,36), animation: fadeIn(200), kind: 'image', config: { src: LP, fit: 'cover' } },
      { name: 'Nama Lengkap', ...nodeBase('content'), transform: tfm(5,48,90,12), animation: fadeIn(400), kind: 'text', config: { text: 'Raisya Putri Andini, S.Kep\n&\nDaffa Pratama Putra, S.T.', color: '#4A2E35', fontSize: 17, align: 'center' } },
      { name: 'Data Orang Tua Wanita', ...nodeBase('content'), transform: tfm(5,62,44,16), animation: fadeIn(500), kind: 'text', config: { text: 'Putri ke-1 dari:\nBpk. H. Andika Putra\n& Ibu Hj. Sri Lestari', color: '#88735B', fontSize: 11, align: 'center' } },
      { name: 'Data Orang Tua Pria', ...nodeBase('content'), transform: tfm(51,62,44,16), animation: fadeIn(500), kind: 'text', config: { text: 'Putra ke-2 dari:\nBpk. H. Pratama W.\n& Ibu Hj. Dewi Kusuma', color: '#88735B', fontSize: 11, align: 'center' } },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. EVENTS (2 templates)
// ─────────────────────────────────────────────────────────────────────────────
const EVENTS_TEMPLATES: SectionTemplate[] = [
  {
    id: 'events-two', sectionId: 'events',
    name: 'Akad & Resepsi', thumbnail: '\ud83c\udf8a',
    description: 'Dua kartu acara lengkap: Akad Nikah & Resepsi Pernikahan',
    nodes: [
      { name: 'Judul Acara', ...nodeBase('content'), transform: tfm(10,2,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Rangkaian Acara', color: '#4A2E35', fontSize: 22, align: 'center' } },
      { name: 'Ikon Akad', ...nodeBase('front-decoration'), transform: tfm(40,10,20,8), animation: floatAnim(200), kind: 'text', config: { text: '\ud83d\udc8d', color: '#C5A880', fontSize: 28, align: 'center' } },
      { name: 'Label Akad Nikah', ...nodeBase('content'), transform: tfm(10,19,80,6), animation: fadeIn(300), kind: 'text', config: { text: 'Akad Nikah', color: '#C5A880', fontSize: 18, align: 'center' } },
      { name: 'Tanggal Akad', ...nodeBase('content'), transform: tfm(10,26,80,6), animation: fadeIn(400), kind: 'text', config: { text: 'Sabtu, 14 Februari 2026', color: '#4A2E35', fontSize: 14, align: 'center' } },
      { name: 'Waktu Akad', ...nodeBase('content'), transform: tfm(15,33,70,5), animation: fadeIn(500), kind: 'text', config: { text: '08.00 WIB \u2013 Selesai', color: '#88735B', fontSize: 12, align: 'center' } },
      { name: 'Lokasi Akad', ...nodeBase('content'), transform: tfm(10,39,80,9), animation: fadeIn(600), kind: 'text', config: { text: '\ud83d\udccd Masjid Al-Falah\nJl. Pahlawan No. 12, Kebumen', color: '#4A2E35', fontSize: 12, align: 'center' } },
      { name: 'Pemisah', ...nodeBase('front-decoration'), transform: tfm(25,50,50,3), animation: fadeIn(600), kind: 'text', config: { text: '\u2022 \u2022 \u2022', color: '#C5A880', fontSize: 14, align: 'center' } },
      { name: 'Ikon Resepsi', ...nodeBase('front-decoration'), transform: tfm(40,54,20,8), animation: floatAnim(400), kind: 'text', config: { text: '\ud83c\udf8a', color: '#C5A880', fontSize: 28, align: 'center' } },
      { name: 'Label Resepsi', ...nodeBase('content'), transform: tfm(10,63,80,6), animation: fadeIn(500), kind: 'text', config: { text: 'Resepsi Pernikahan', color: '#C5A880', fontSize: 18, align: 'center' } },
      { name: 'Tanggal Resepsi', ...nodeBase('content'), transform: tfm(10,70,80,6), animation: fadeIn(600), kind: 'text', config: { text: 'Sabtu, 14 Februari 2026', color: '#4A2E35', fontSize: 14, align: 'center' } },
      { name: 'Waktu Resepsi', ...nodeBase('content'), transform: tfm(15,77,70,5), animation: fadeIn(700), kind: 'text', config: { text: '10.00 \u2013 14.00 WIB', color: '#88735B', fontSize: 12, align: 'center' } },
      { name: 'Lokasi Resepsi', ...nodeBase('content'), transform: tfm(10,83,80,10), animation: fadeIn(800), kind: 'text', config: { text: '\ud83d\udccd Gedung Serbaguna Wisma Praja\nJl. Pahlawan No. 45, Kebumen, Jawa Tengah', color: '#4A2E35', fontSize: 12, align: 'center' } },
      { name: 'Blok Event Interaktif', ...nodeBase('component'), transform: tfm(0,94,100,6), animation: fadeIn(1000), kind: 'component', config: { component: 'events', variant: 'default', title: 'Detail Acara' } },
    ],
  },
  {
    id: 'events-lamaran', sectionId: 'events',
    name: 'Lamaran & Akad', thumbnail: '\ud83d\udc90',
    description: 'Tiga acara berurutan: Lamaran, Akad Nikah, dan Tasyakuran',
    nodes: [
      { name: 'Judul Section', ...nodeBase('content'), transform: tfm(10,2,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Jadwal Rangkaian Acara', color: '#4A2E35', fontSize: 20, align: 'center' } },
      { name: 'Lamaran Label', ...nodeBase('content'), transform: tfm(10,11,80,6), animation: fadeIn(200), kind: 'text', config: { text: '\ud83d\udc90 Prosesi Lamaran', color: '#C5A880', fontSize: 15, align: 'center' } },
      { name: 'Lamaran Detail', ...nodeBase('content'), transform: tfm(10,18,80,10), animation: fadeIn(300), kind: 'text', config: { text: "Jum'at, 13 Februari 2026 \u00b7 14.00 WIB\nKediaman Keluarga Wanita\nJl. Melati No. 5, Kebumen", color: '#4A2E35', fontSize: 12, align: 'center' } },
      { name: 'Pemisah 1', ...nodeBase('front-decoration'), transform: tfm(35,29,30,3), animation: fadeIn(350), kind: 'text', config: { text: '\u00b7 \u00b7 \u00b7', color: '#C5A880', fontSize: 15, align: 'center' } },
      { name: 'Akad Label', ...nodeBase('content'), transform: tfm(10,33,80,6), animation: fadeIn(400), kind: 'text', config: { text: '\ud83d\udc8d Akad Nikah', color: '#C5A880', fontSize: 15, align: 'center' } },
      { name: 'Akad Detail', ...nodeBase('content'), transform: tfm(10,40,80,10), animation: fadeIn(500), kind: 'text', config: { text: 'Sabtu, 14 Februari 2026 \u00b7 08.00 WIB\nMasjid Al-Falah\nJl. Pahlawan No. 12, Kebumen', color: '#4A2E35', fontSize: 12, align: 'center' } },
      { name: 'Pemisah 2', ...nodeBase('front-decoration'), transform: tfm(35,51,30,3), animation: fadeIn(550), kind: 'text', config: { text: '\u00b7 \u00b7 \u00b7', color: '#C5A880', fontSize: 15, align: 'center' } },
      { name: 'Resepsi Label', ...nodeBase('content'), transform: tfm(10,55,80,6), animation: fadeIn(600), kind: 'text', config: { text: '\ud83c\udf8a Resepsi & Tasyakuran', color: '#C5A880', fontSize: 15, align: 'center' } },
      { name: 'Resepsi Detail', ...nodeBase('content'), transform: tfm(10,62,80,10), animation: fadeIn(700), kind: 'text', config: { text: 'Sabtu, 14 Februari 2026 \u00b7 10.00 \u2013 14.00 WIB\nGedung Serbaguna Wisma Praja\nJl. Pahlawan No. 45, Kebumen', color: '#4A2E35', fontSize: 12, align: 'center' } },
      { name: 'Catatan Dress Code', ...nodeBase('content'), transform: tfm(10,74,80,8), animation: fadeIn(800), kind: 'text', config: { text: '\u2728 Dress Code: Pastel & Formal\nKami sangat mengharapkan kehadiran Bapak/Ibu/Saudara/i', color: '#88735B', fontSize: 11, align: 'center' } },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. COUNTDOWN (1 template)
// ─────────────────────────────────────────────────────────────────────────────
const COUNTDOWN_TEMPLATES: SectionTemplate[] = [
  {
    id: 'countdown-default', sectionId: 'countdown',
    name: 'Hitung Mundur', thumbnail: '\u23f3',
    description: 'Komponen countdown interaktif menuju hari pernikahan',
    nodes: [
      { name: 'Judul Countdown', ...nodeBase('content'), transform: tfm(10,5,80,8), animation: fadeIn(0), kind: 'text', config: { text: 'Menuju Hari Bahagia', color: '#4A2E35', fontSize: 20, align: 'center' } },
      { name: 'Ornamen Jam Pasir', ...nodeBase('front-decoration'), transform: tfm(40,14,20,10), animation: swayAnim(200), kind: 'text', config: { text: '\u231b', color: '#C5A880', fontSize: 34, align: 'center' } },
      { name: 'Tanggal Target', ...nodeBase('content'), transform: tfm(10,26,80,6), animation: fadeIn(400), kind: 'text', config: { text: 'Sabtu, 14 Februari 2026', color: '#C5A880', fontSize: 13, align: 'center' } },
      { name: 'Blok Countdown', ...nodeBase('component'), transform: tfm(0,34,100,44), animation: fadeIn(600), kind: 'component', config: { component: 'countdown', variant: 'default', title: 'Countdown Timer' } },
      { name: 'Quote Motivasi', ...nodeBase('content'), transform: tfm(10,81,80,11), animation: fadeIn(800), kind: 'text', config: { text: '"Setiap detik adalah langkah menuju momen yang paling indah dalam hidup kami"', color: '#88735B', fontSize: 11, align: 'center' } },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 6. LOVE STORY (1 template)
// ─────────────────────────────────────────────────────────────────────────────
const STORY_TEMPLATES: SectionTemplate[] = [
  {
    id: 'story-timeline', sectionId: 'story',
    name: 'Timeline Kisah Cinta', thumbnail: '\u2764\ufe0f',
    description: 'Perjalanan kisah cinta dari pertama bertemu hingga lamaran',
    nodes: [
      { name: 'Judul Love Story', ...nodeBase('content'), transform: tfm(10,2,80,8), animation: fadeIn(0), kind: 'text', config: { text: 'Kisah Kita', color: '#4A2E35', fontSize: 26, align: 'center' } },
      { name: 'Ornamen Hati', ...nodeBase('front-decoration'), transform: tfm(42,10,16,7), animation: floatAnim(200), kind: 'text', config: { text: '\u2665', color: '#C5A880', fontSize: 26, align: 'center' } },
      { name: 'Tahun Pertemuan', ...nodeBase('content'), transform: tfm(5,19,25,5), animation: fadeIn(300), kind: 'text', config: { text: '2021', color: '#C5A880', fontSize: 15, align: 'right' } },
      { name: 'Cerita Pertemuan', ...nodeBase('content'), transform: tfm(33,18,62,10), animation: fadeIn(400), kind: 'text', config: { text: '\ud83d\udcab Pertama Bertemu\nKami bertemu di kampus dalam sebuah kegiatan yang tak terduga. Sebuah senyum mengawali segalanya.', color: '#4A2E35', fontSize: 11, align: 'left' } },
      { name: 'Foto Pertemuan', ...nodeBase('content'), transform: tfm(5,30,28,18), animation: fadeIn(300), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Tahun Mengenal', ...nodeBase('content'), transform: tfm(68,36,27,5), animation: fadeIn(500), kind: 'text', config: { text: '2022', color: '#C5A880', fontSize: 15, align: 'left' } },
      { name: 'Cerita Mengenal', ...nodeBase('content'), transform: tfm(33,34,35,10), animation: fadeIn(600), kind: 'text', config: { text: '\ud83c\udf31 Saling Mengenal\nPerlahan tumbuh rasa yang tak bisa dihindari. Kami belajar mencintai perbedaan satu sama lain.', color: '#4A2E35', fontSize: 11, align: 'left' } },
      { name: 'Tahun Lamaran', ...nodeBase('content'), transform: tfm(5,51,25,5), animation: fadeIn(700), kind: 'text', config: { text: '2025', color: '#C5A880', fontSize: 15, align: 'right' } },
      { name: 'Cerita Lamaran', ...nodeBase('content'), transform: tfm(33,50,62,10), animation: fadeIn(800), kind: 'text', config: { text: '\ud83d\udc8d Lamaran\nDengan restu kedua orang tua, kami memulai langkah baru menuju mahligai pernikahan yang suci.', color: '#4A2E35', fontSize: 11, align: 'left' } },
      { name: 'Foto Lamaran', ...nodeBase('content'), transform: tfm(68,49,27,18), animation: fadeIn(700), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Kalimat Penutup', ...nodeBase('content'), transform: tfm(10,71,80,11), animation: fadeIn(1000), kind: 'text', config: { text: '"Dan kini saatnya kami melangkah bersama\nmenuju hidup baru yang penuh berkah"', color: '#88735B', fontSize: 12, align: 'center' } },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 7. GALLERY (1 template)
// ─────────────────────────────────────────────────────────────────────────────
const GALLERY_TEMPLATES: SectionTemplate[] = [
  {
    id: 'gallery-grid', sectionId: 'gallery',
    name: 'Galeri Foto Grid', thumbnail: '\ud83d\uddbc\ufe0f',
    description: 'Grid foto prewedding 2x3 yang elegan dan siap diganti',
    nodes: [
      { name: 'Judul Galeri', ...nodeBase('content'), transform: tfm(10,2,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Momen Bersama', color: '#4A2E35', fontSize: 22, align: 'center' } },
      { name: 'Sub-judul', ...nodeBase('content'), transform: tfm(15,9,70,5), animation: fadeIn(200), kind: 'text', config: { text: 'Kenangan Indah Pre-wedding Kami', color: '#88735B', fontSize: 11, align: 'center' } },
      { name: 'Foto 1', ...nodeBase('content'), transform: tfm(2,15,46,24), animation: fadeIn(300), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Foto 2', ...nodeBase('content'), transform: tfm(52,15,46,24), animation: fadeIn(400), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Foto 3 (Landscape)', ...nodeBase('content'), transform: tfm(2,40,96,22), animation: fadeIn(500), kind: 'image', config: { src: LP, fit: 'cover' } },
      { name: 'Foto 4', ...nodeBase('content'), transform: tfm(2,63,46,24), animation: fadeIn(600), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Foto 5', ...nodeBase('content'), transform: tfm(52,63,46,24), animation: fadeIn(700), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Caption Galeri', ...nodeBase('front-decoration'), transform: tfm(10,89,80,6), animation: fadeIn(800), kind: 'text', config: { text: '\u2728 Klik foto untuk tampilan penuh', color: '#88735B', fontSize: 10, align: 'center' } },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 8. MAP (1 template)
// ─────────────────────────────────────────────────────────────────────────────
const MAP_TEMPLATES: SectionTemplate[] = [
  {
    id: 'map-default', sectionId: 'map',
    name: 'Peta Lokasi Acara', thumbnail: '\ud83d\udccd',
    description: 'Foto venue + alamat + blok peta interaktif',
    nodes: [
      { name: 'Judul Lokasi', ...nodeBase('content'), transform: tfm(10,2,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Lokasi Acara', color: '#4A2E35', fontSize: 22, align: 'center' } },
      { name: 'Foto Venue', ...nodeBase('content'), transform: tfm(5,10,90,34), animation: fadeIn(200), kind: 'image', config: { src: VP, fit: 'cover' } },
      { name: 'Nama Venue', ...nodeBase('content'), transform: tfm(10,46,80,7), animation: fadeIn(400), kind: 'text', config: { text: 'Gedung Serbaguna Wisma Praja', color: '#4A2E35', fontSize: 16, align: 'center' } },
      { name: 'Alamat Lengkap', ...nodeBase('content'), transform: tfm(10,54,80,10), animation: fadeIn(500), kind: 'text', config: { text: 'Jl. Pahlawan No. 45, Kebumen\nKabupaten Kebumen, Jawa Tengah 54311', color: '#88735B', fontSize: 12, align: 'center' } },
      { name: 'Blok Peta Interaktif', ...nodeBase('component'), transform: tfm(0,66,100,34), animation: fadeIn(600), kind: 'component', config: { component: 'map', variant: 'default', title: 'Peta Interaktif' } },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 9. RSVP (1 template)
// ─────────────────────────────────────────────────────────────────────────────
const RSVP_TEMPLATES: SectionTemplate[] = [
  {
    id: 'rsvp-default', sectionId: 'rsvp',
    name: 'Form Konfirmasi Kehadiran', thumbnail: '\ud83d\udccb',
    description: 'Form RSVP interaktif dengan deadline konfirmasi',
    nodes: [
      { name: 'Judul RSVP', ...nodeBase('content'), transform: tfm(10,2,80,8), animation: fadeIn(0), kind: 'text', config: { text: 'Konfirmasi Kehadiran', color: '#4A2E35', fontSize: 22, align: 'center' } },
      { name: 'Sub-teks RSVP', ...nodeBase('content'), transform: tfm(10,11,80,11), animation: fadeIn(200), kind: 'text', config: { text: 'Kehadiran Anda adalah kebahagiaan terbesar kami. Mohon konfirmasi kehadiran sebelum\n\ud83d\udcc5 7 Februari 2026', color: '#88735B', fontSize: 12, align: 'center' } },
      { name: 'Blok RSVP Interaktif', ...nodeBase('component'), transform: tfm(0,23,100,77), animation: fadeIn(400), kind: 'component', config: { component: 'rsvp', variant: 'default', title: 'Form RSVP' } },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 10. GUESTBOOK (1 template)
// ─────────────────────────────────────────────────────────────────────────────
const GUESTBOOK_TEMPLATES: SectionTemplate[] = [
  {
    id: 'guestbook-default', sectionId: 'guestbook',
    name: 'Buku Tamu Digital', thumbnail: '\ud83d\udcdd',
    description: 'Buku tamu interaktif untuk ucapan dan doa tamu undangan',
    nodes: [
      { name: 'Judul Guestbook', ...nodeBase('content'), transform: tfm(10,2,80,8), animation: fadeIn(0), kind: 'text', config: { text: 'Ucapan & Doa', color: '#4A2E35', fontSize: 22, align: 'center' } },
      { name: 'Sub-teks', ...nodeBase('content'), transform: tfm(10,11,80,9), animation: fadeIn(200), kind: 'text', config: { text: 'Doa dan ucapan tulus Anda adalah hadiah terindah bagi kami. Titipkan doa terbaik Anda untuk perjalanan hidup kami', color: '#88735B', fontSize: 12, align: 'center' } },
      { name: 'Blok Guestbook', ...nodeBase('component'), transform: tfm(0,21,100,79), animation: fadeIn(400), kind: 'component', config: { component: 'guestbook', variant: 'default', title: 'Buku Tamu' } },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 11. GIFTS (1 template)
// ─────────────────────────────────────────────────────────────────────────────
const GIFTS_TEMPLATES: SectionTemplate[] = [
  {
    id: 'gifts-default', sectionId: 'gifts',
    name: 'Kirim Hadiah & Angpao', thumbnail: '\ud83c\udf81',
    description: 'Info rekening bank dan alamat pengiriman hadiah fisik',
    nodes: [
      { name: 'Judul Hadiah', ...nodeBase('content'), transform: tfm(10,2,80,8), animation: fadeIn(0), kind: 'text', config: { text: 'Kirim Hadiah & Doa', color: '#4A2E35', fontSize: 20, align: 'center' } },
      { name: 'Intro', ...nodeBase('content'), transform: tfm(10,11,80,10), animation: fadeIn(200), kind: 'text', config: { text: 'Kehadiran Anda adalah hadiah terbesar bagi kami. Namun jika ingin mengungkapkan kasih sayang, berikut informasinya:', color: '#88735B', fontSize: 11, align: 'center' } },
      { name: 'Label Transfer Bank', ...nodeBase('content'), transform: tfm(10,23,80,6), animation: fadeIn(300), kind: 'text', config: { text: '\ud83c\udfe6 Transfer Bank', color: '#C5A880', fontSize: 14, align: 'center' } },
      { name: 'Info Rekening', ...nodeBase('content'), transform: tfm(10,30,80,18), animation: fadeIn(400), kind: 'text', config: { text: 'Bank BCA \u00b7 1234567890\na.n. Raisya Putri Andini\n\nBank Mandiri \u00b7 0987654321\na.n. Daffa Pratama Putra', color: '#4A2E35', fontSize: 13, align: 'center' } },
      { name: 'Blok Hadiah Interaktif', ...nodeBase('component'), transform: tfm(0,50,100,50), animation: fadeIn(600), kind: 'component', config: { component: 'gifts', variant: 'default', title: 'Hadiah Digital' } },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 12. RUNDOWN (1 template)
// ─────────────────────────────────────────────────────────────────────────────
const RUNDOWN_TEMPLATES: SectionTemplate[] = [
  {
    id: 'rundown-default', sectionId: 'rundown',
    name: 'Susunan Acara Hari H', thumbnail: '\ud83d\udcc5',
    description: 'Rundown kronologis acara dari pagi hingga sore',
    nodes: [
      { name: 'Judul Rundown', ...nodeBase('content'), transform: tfm(10,2,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Susunan Acara Hari H', color: '#4A2E35', fontSize: 20, align: 'center' } },
      { name: 'Tanggal Acara', ...nodeBase('content'), transform: tfm(20,10,60,5), animation: fadeIn(200), kind: 'text', config: { text: 'Sabtu, 14 Februari 2026', color: '#C5A880', fontSize: 12, align: 'center' } },
      { name: '08.00 Akad', ...nodeBase('content'), transform: tfm(5,17,90,7), animation: fadeIn(300), kind: 'text', config: { text: '08.00 \u2013 09.00   \ud83d\udc8d Akad Nikah', color: '#4A2E35', fontSize: 13, align: 'left' } },
      { name: '09.00 Foto', ...nodeBase('content'), transform: tfm(5,25,90,7), animation: fadeIn(400), kind: 'text', config: { text: '09.00 \u2013 09.30   \ud83d\udcf8 Sesi Foto Keluarga', color: '#4A2E35', fontSize: 13, align: 'left' } },
      { name: '10.00 Resepsi', ...nodeBase('content'), transform: tfm(5,33,90,7), animation: fadeIn(500), kind: 'text', config: { text: '10.00 \u2013 12.00   \ud83c\udf8a Resepsi & Penyambutan Tamu', color: '#4A2E35', fontSize: 13, align: 'left' } },
      { name: '12.00 Makan', ...nodeBase('content'), transform: tfm(5,41,90,7), animation: fadeIn(600), kind: 'text', config: { text: '12.00 \u2013 12.30   \ud83d\ude4f Makan Siang Bersama', color: '#4A2E35', fontSize: 13, align: 'left' } },
      { name: '12.30 Hiburan', ...nodeBase('content'), transform: tfm(5,49,90,7), animation: fadeIn(700), kind: 'text', config: { text: '12.30 \u2013 13.00   \ud83c\udfa4 Sambutan & Hiburan', color: '#4A2E35', fontSize: 13, align: 'left' } },
      { name: '13.00 Pelepasan', ...nodeBase('content'), transform: tfm(5,57,90,7), animation: fadeIn(800), kind: 'text', config: { text: '13.00 \u2013 14.00   \ud83d\udc90 Pelepasan Tamu', color: '#4A2E35', fontSize: 13, align: 'left' } },
      { name: 'Blok Rundown Interaktif', ...nodeBase('component'), transform: tfm(0,66,100,34), animation: fadeIn(1000), kind: 'component', config: { component: 'rundown', variant: 'default', title: 'Rundown Acara' } },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 13. DRESS CODE (1 template)
// ─────────────────────────────────────────────────────────────────────────────
const DRESS_CODE_TEMPLATES: SectionTemplate[] = [
  {
    id: 'dress-code-pastel', sectionId: 'dress-code',
    name: 'Dress Code Pastel', thumbnail: '\ud83d\udc57',
    description: 'Panduan berpakaian tamu dengan palet warna pastel formal',
    nodes: [
      { name: 'Judul Dress Code', ...nodeBase('content'), transform: tfm(10,2,80,8), animation: fadeIn(0), kind: 'text', config: { text: 'Dress Code', color: '#4A2E35', fontSize: 26, align: 'center' } },
      { name: 'Sub-judul', ...nodeBase('content'), transform: tfm(10,11,80,6), animation: fadeIn(200), kind: 'text', config: { text: 'Panduan Berpakaian Tamu Undangan', color: '#88735B', fontSize: 12, align: 'center' } },
      { name: 'Tema Warna', ...nodeBase('content'), transform: tfm(10,19,80,6), animation: fadeIn(300), kind: 'text', config: { text: '\ud83c\udfa8 Pastel Formal \u2014 Cream, Sage, Dusty Rose', color: '#C5A880', fontSize: 13, align: 'center' } },
      { name: 'Panduan Wanita', ...nodeBase('content'), transform: tfm(5,27,44,32), animation: fadeIn(400), kind: 'text', config: { text: '\ud83d\udc69 Tamu Wanita\n\n\u2022 Kebaya / Dress Formal\n\u2022 Warna: Cream, Sage, Blush\n\u2022 Panjang hingga mata kaki\n\u2022 Hijab dianjurkan\n\u2022 Hindari warna putih & hitam', color: '#4A2E35', fontSize: 11, align: 'left' } },
      { name: 'Panduan Pria', ...nodeBase('content'), transform: tfm(51,27,44,32), animation: fadeIn(400), kind: 'text', config: { text: '\ud83d\udc68 Tamu Pria\n\n\u2022 Kemeja / Batik Formal\n\u2022 Beskap / Setelan Jas\n\u2022 Warna: Navy, Sage, Tan\n\u2022 Celana panjang rapi\n\u2022 Sepatu tertutup', color: '#4A2E35', fontSize: 11, align: 'left' } },
      { name: 'Catatan', ...nodeBase('content'), transform: tfm(10,61,80,10), animation: fadeIn(600), kind: 'text', config: { text: '\ud83d\udca1 Dianjurkan menghindari warna putih dan hitam pekat. Kami sangat menghargai penampilan rapi dan sopan Anda.', color: '#88735B', fontSize: 11, align: 'center' } },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 14. ENTOURAGE (1 template)
// ─────────────────────────────────────────────────────────────────────────────
const ENTOURAGE_TEMPLATES: SectionTemplate[] = [
  {
    id: 'entourage-default', sectionId: 'entourage',
    name: 'Keluarga & Panitia', thumbnail: '\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66',
    description: 'Daftar keluarga besar kedua mempelai dan tim panitia',
    nodes: [
      { name: 'Judul Entourage', ...nodeBase('content'), transform: tfm(10,2,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Keluarga & Panitia', color: '#4A2E35', fontSize: 22, align: 'center' } },
      { name: 'Keluarga Wanita', ...nodeBase('content'), transform: tfm(5,11,44,38), animation: fadeIn(200), kind: 'text', config: { text: '\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67 Keluarga Mempelai Wanita\n\nAyah: H. Andika Putra\nIbu: Hj. Sri Lestari\nKakak: Dinda Andini\nAdik: Rara Putri\n\nPaman: H. Bambang S.\nBibi: Hj. Sari W.', color: '#4A2E35', fontSize: 11, align: 'left' } },
      { name: 'Keluarga Pria', ...nodeBase('content'), transform: tfm(51,11,44,38), animation: fadeIn(200), kind: 'text', config: { text: '\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc66 Keluarga Mempelai Pria\n\nAyah: H. Pratama Wibowo\nIbu: Hj. Dewi Kusuma\nKakak: Dimas Pratama\nAdik: Bagas Wibowo\n\nPaman: H. Wahyu S.\nBibi: Hj. Endah R.', color: '#4A2E35', fontSize: 11, align: 'left' } },
      { name: 'Tim Panitia', ...nodeBase('content'), transform: tfm(5,52,90,32), animation: fadeIn(400), kind: 'text', config: { text: '\ud83c\udf38 Tim Panitia Pernikahan\n\nKetua Panitia: Andi Setiawan\nSeksi Dokumentasi: Tim HariKita Photography\nSeksi Dekorasi: HariKita Decoration\nSeksi Katering: HariKita Catering Kebumen\nSeksi Hiburan: MC & Entertainment Team', color: '#4A2E35', fontSize: 11, align: 'left' } },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 15. QUOTE / PRAYER (1 template)
// ─────────────────────────────────────────────────────────────────────────────
const QUOTE_PRAYER_TEMPLATES: SectionTemplate[] = [
  {
    id: 'quote-prayer-doa', sectionId: 'quote-prayer',
    name: 'Doa & Harapan', thumbnail: '\ud83e\udd32',
    description: 'Doa penutup dengan ayat Al-Quran dan harapan tulus couple',
    nodes: [
      { name: 'Ornamen Atas', ...nodeBase('front-decoration'), transform: tfm(35,3,30,7), animation: swayAnim(0), kind: 'text', config: { text: '\u2726 \u2726 \u2726', color: '#C5A880', fontSize: 17, align: 'center' } },
      { name: 'Judul Doa', ...nodeBase('content'), transform: tfm(10,11,80,7), animation: fadeIn(200), kind: 'text', config: { text: 'Doa & Harapan Kami', color: '#4A2E35', fontSize: 20, align: 'center' } },
      { name: 'Ayat Arab Doa', ...nodeBase('content'), transform: tfm(10,19,80,12), animation: fadeIn(400), kind: 'text', config: { text: '\u0631\u064e\u0628\u0651\u064e\u0646\u064e\u0627 \u0647\u064e\u0628\u0652 \u0644\u064e\u0646\u064e\u0627 \u0645\u0650\u0646\u0652 \u0623\u064e\u0632\u0652\u0648\u064e\u0627\u062c\u0650\u0646\u064e\u0627 \u0648\u064e\u0630\u064f\u0631\u0651\u0650\u064a\u0651\u064e\u0627\u062a\u0650\u0646\u064e\u0627 \u0642\u064f\u0631\u0651\u064e\u0629\u064e \u0623\u064e\u0639\u0652\u064a\u064f\u0646\u0648\u0646\u064e', color: '#C5A880', fontSize: 18, align: 'center' } },
      { name: 'Terjemahan Doa', ...nodeBase('content'), transform: tfm(10,33,80,15), animation: fadeIn(600), kind: 'text', config: { text: '"Ya Tuhan kami, anugerahkanlah kepada kami pasangan kami dan keturunan kami sebagai penyenang hati (kami)..."\n\n\u2014 QS. Al-Furqan: 74', color: '#4A2E35', fontSize: 12, align: 'center' } },
      { name: 'Harapan Couple', ...nodeBase('content'), transform: tfm(10,50,80,22), animation: fadeIn(800), kind: 'text', config: { text: 'Kami berharap pernikahan ini menjadi awal dari kehidupan yang penuh cinta, berkah, dan ridho Allah SWT.\n\nSemoga keluarga kecil kami menjadi keluarga yang sakinah, mawaddah, warahmah.\n\nAmiin Ya Rabbal Alamin \ud83e\udd32', color: '#88735B', fontSize: 12, align: 'center' } },
      { name: 'Tanda Tangan', ...nodeBase('front-decoration'), transform: tfm(20,74,60,8), animation: fadeIn(1000), kind: 'text', config: { text: '\u2014 Raisya & Daffa \u2014', color: '#C5A880', fontSize: 16, align: 'center' } },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 16. CLOSING (2 templates)
// ─────────────────────────────────────────────────────────────────────────────
const CLOSING_TEMPLATES: SectionTemplate[] = [
  {
    id: 'closing-warm', sectionId: 'closing',
    name: 'Penutup Hangat', thumbnail: '\ud83c\udf3a',
    description: 'Penutupan undangan dengan ucapan terima kasih dan foto bersama',
    nodes: [
      { name: 'Ornamen Bunga', ...nodeBase('front-decoration'), transform: tfm(30,3,40,9), animation: swayAnim(0), kind: 'text', config: { text: '\ud83c\udf38 \u2726 \ud83c\udf38', color: '#C5A880', fontSize: 22, align: 'center' } },
      { name: 'Ucapan Terima Kasih', ...nodeBase('content'), transform: tfm(10,13,80,8), animation: fadeIn(200), kind: 'text', config: { text: 'Terima Kasih', color: '#4A2E35', fontSize: 28, align: 'center' } },
      { name: 'Pesan Terima Kasih', ...nodeBase('content'), transform: tfm(10,22,80,18), animation: fadeIn(400), kind: 'text', config: { text: 'Terima kasih atas segala doa, restu, dan kasih sayang yang telah Bapak/Ibu/Saudara/i berikan.\n\nKehadiran Anda di hari bahagia kami adalah kenangan tak ternilai yang akan selalu kami jaga.', color: '#4A2E35', fontSize: 12, align: 'center' } },
      { name: 'Foto Bersama Keluarga', ...nodeBase('content'), transform: tfm(15,42,70,24), animation: fadeIn(300), kind: 'image', config: { src: LP, fit: 'cover' } },
      { name: 'Salam Penutup', ...nodeBase('content'), transform: tfm(10,68,80,8), animation: fadeIn(600), kind: 'text', config: { text: 'Wassalamualaikum Wr. Wb.\nHormat kami,', color: '#88735B', fontSize: 12, align: 'center' } },
      { name: 'Nama Couple Penutup', ...nodeBase('content'), transform: tfm(10,78,80,9), animation: fadeIn(800), kind: 'text', config: { text: 'Raisya & Daffa', color: '#4A2E35', fontSize: 22, align: 'center' } },
      { name: 'Keluarga Besar', ...nodeBase('content'), transform: tfm(10,89,80,6), animation: fadeIn(1000), kind: 'text', config: { text: 'beserta seluruh keluarga besar', color: '#88735B', fontSize: 11, align: 'center' } },
    ],
  },
  {
    id: 'closing-social', sectionId: 'closing',
    name: 'Penutup + Social Media', thumbnail: '\ud83d\udcf1',
    description: 'Penutupan dengan hashtag pernikahan dan info live streaming',
    nodes: [
      { name: 'Ucapan Terima Kasih', ...nodeBase('content'), transform: tfm(10,3,80,8), animation: fadeIn(0), kind: 'text', config: { text: 'Terima Kasih \ud83d\ude4f', color: '#4A2E35', fontSize: 24, align: 'center' } },
      { name: 'Pesan Singkat', ...nodeBase('content'), transform: tfm(10,12,80,12), animation: fadeIn(200), kind: 'text', config: { text: 'Terima kasih telah menjadi bagian dari momen paling berharga dalam hidup kami. Semoga Allah membalas kebaikan Anda berlipat ganda.', color: '#88735B', fontSize: 12, align: 'center' } },
      { name: 'Foto Couple', ...nodeBase('content'), transform: tfm(20,25,60,26), animation: fadeIn(300), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Label Hashtag', ...nodeBase('content'), transform: tfm(10,53,80,6), animation: fadeIn(500), kind: 'text', config: { text: '\ud83d\udcf1 Ikuti Momen Kami di Social Media', color: '#C5A880', fontSize: 13, align: 'center' } },
      { name: 'Hashtag Pernikahan', ...nodeBase('front-decoration'), transform: tfm(10,60,80,8), animation: floatAnim(400), kind: 'text', config: { text: '#RaisyaDaffa2026\n#HariKita #WeddingDay', color: '#4A2E35', fontSize: 15, align: 'center' } },
      { name: 'Info Live Streaming', ...nodeBase('content'), transform: tfm(10,70,80,8), animation: fadeIn(700), kind: 'text', config: { text: '\ud83c\udfa5 Live Streaming tersedia di:\nyoutube.com/@RaisyaDaffa2026', color: '#88735B', fontSize: 11, align: 'center' } },
      { name: 'Nama Pasangan Final', ...nodeBase('content'), transform: tfm(10,80,80,10), animation: fadeIn(900), kind: 'text', config: { text: 'With Love,\nRaisya & Daffa \ud83d\udc95', color: '#4A2E35', fontSize: 16, align: 'center' } },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Master registry & lookup
// ─────────────────────────────────────────────────────────────────────────────
export const SECTION_TEMPLATES: readonly SectionTemplate[] = [
  ...COVER_TEMPLATES,
  ...HERO_TEMPLATES,
  ...COUPLE_TEMPLATES,
  ...EVENTS_TEMPLATES,
  ...COUNTDOWN_TEMPLATES,
  ...STORY_TEMPLATES,
  ...GALLERY_TEMPLATES,
  ...MAP_TEMPLATES,
  ...RSVP_TEMPLATES,
  ...GUESTBOOK_TEMPLATES,
  ...GIFTS_TEMPLATES,
  ...RUNDOWN_TEMPLATES,
  ...DRESS_CODE_TEMPLATES,
  ...ENTOURAGE_TEMPLATES,
  ...QUOTE_PRAYER_TEMPLATES,
  ...CLOSING_TEMPLATES,
];

export function getTemplatesForSection(sectionId: StudioSectionId): SectionTemplate[] {
  return SECTION_TEMPLATES.filter(t => t.sectionId === sectionId);
}