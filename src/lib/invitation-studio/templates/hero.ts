/**
 * HariKita Invitation Studio — Hero Templates
 * 
 * Template untuk section hero: opening dramatis, foto prewedding, quote pembuka.
 */
import type { SectionTemplate } from '../section-templates';
import { fadeIn, swayAnim, staticAnim, nodeBase, tfm, PP, LP } from './helpers';

export const HERO_TEMPLATES: SectionTemplate[] = [
  {
    id: 'hero-prewedding',
    sectionId: 'hero',
    name: 'Foto Pre-wedding',
    thumbnail: '📸',
    description: 'Foto pre-wedding besar dengan caption romantis di atasnya',
    nodes: [
      { name: 'Foto Pre-wedding Utama', ...nodeBase('background'), transform: tfm(0,0,100,100), animation: staticAnim(), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Quote Romantis', ...nodeBase('content'), transform: tfm(10,65,80,18), animation: fadeIn(300), kind: 'text', config: { text: '"Dua jiwa menjadi satu\ndalam ikatan suci yang abadi"', color: '#FAF8F5', fontSize: 15, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Nama Singkat', ...nodeBase('front-decoration'), transform: tfm(20,85,60,8), animation: fadeIn(600), kind: 'text', config: { text: '— Ananda & Bintang —', color: '#C5A880', fontSize: 13, align: 'center', fontFamily: 'Lora' } },
    ],
  },
  {
    id: 'hero-quote',
    sectionId: 'hero',
    name: 'Quote & Doa',
    thumbnail: '📖',
    description: 'Ayat Al-Quran atau quote cinta dengan latar champagne',
    nodes: [
      { name: 'Ornamen Atas', ...nodeBase('front-decoration'), transform: tfm(35,5,30,5), animation: swayAnim(0), kind: 'text', config: { text: '✦ ✦ ✦', color: '#C5A880', fontSize: 17, align: 'center' } },
      { name: 'Ayat Al-Quran (Arab)', ...nodeBase('content'), transform: tfm(10,13,80,18), animation: fadeIn(200), kind: 'text', config: { text: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا', color: '#4A2E35', fontSize: 20, align: 'center', fontFamily: 'Amiri' } },
      { name: 'Terjemahan', ...nodeBase('content'), transform: tfm(10,33,80,22), animation: fadeIn(400), kind: 'text', config: { text: '"Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu merasa tenteram kepadanya..."\n\n— QS. Ar-Rum: 21', color: '#6B5E62', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
      { name: 'Pembatas', ...nodeBase('front-decoration'), transform: tfm(30,58,40,4), animation: fadeIn(600), kind: 'text', config: { text: '— ✦ —', color: '#C5A880', fontSize: 15, align: 'center' } },
      { name: 'Nama Couple', ...nodeBase('content'), transform: tfm(10,63,80,12), animation: fadeIn(800), kind: 'text', config: { text: 'Ananda Putri\n&\nBintang Pratama', color: '#4A2E35', fontSize: 22, align: 'center', fontFamily: 'Cinzel' } },
    ],
  },
  {
    id: 'hero-fullscreen-photo',
    sectionId: 'hero',
    name: 'Fullscreen Photo',
    thumbnail: '🖼️',
    description: 'Foto landscape penuh layar dengan overlay nama couple',
    nodes: [
      { name: 'Foto Background', ...nodeBase('background'), transform: tfm(0,0,100,100), animation: staticAnim(), kind: 'image', config: { src: LP, fit: 'cover' } },
      { name: 'Label The Wedding', ...nodeBase('content'), transform: tfm(10,68,80,6), animation: fadeIn(400), kind: 'text', config: { text: 'THE WEDDING OF', color: '#FAF8F5', fontSize: 10, align: 'center', fontFamily: 'Syncopate', letterSpacing: 4 } },
      { name: 'Nama Couple Besar', ...nodeBase('content'), transform: tfm(5,75,90,18), animation: fadeIn(700), kind: 'text', config: { text: 'Ananda & Bintang', color: '#FAF8F5', fontSize: 52, align: 'center', fontFamily: 'Great Vibes' } },
    ],
  },
  {
    id: 'hero-minimalist-text',
    sectionId: 'hero',
    name: 'Minimalist Text Only',
    thumbnail: '✨',
    description: 'Opening minimalis dengan tipografi elegan tanpa foto',
    nodes: [
      { name: 'Ornamen Dekoratif Atas', ...nodeBase('front-decoration'), transform: tfm(35,8,30,8), animation: fadeIn(0), kind: 'text', config: { text: '✧', color: '#C5A880', fontSize: 42, align: 'center' } },
      { name: 'Label Acara', ...nodeBase('content'), transform: tfm(10,18,80,6), animation: fadeIn(300), kind: 'text', config: { text: 'WEDDING CELEBRATION', color: '#88735B', fontSize: 9, align: 'center', fontFamily: 'Syncopate', letterSpacing: 4 } },
      { name: 'Nama Mempelai Wanita', ...nodeBase('content'), transform: tfm(10,28,80,14), animation: fadeIn(600), kind: 'text', config: { text: 'Ananda Putri Andini', color: '#4A2E35', fontSize: 38, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Simbol Dan', ...nodeBase('front-decoration'), transform: tfm(40,44,20,10), animation: fadeIn(900), kind: 'text', config: { text: '&', color: '#C5A880', fontSize: 48, align: 'center', fontFamily: 'Allura' } },
      { name: 'Nama Mempelai Pria', ...nodeBase('content'), transform: tfm(10,56,80,14), animation: fadeIn(1200), kind: 'text', config: { text: 'Bintang Pratama Putra', color: '#4A2E35', fontSize: 38, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Tanggal & Lokasi', ...nodeBase('content'), transform: tfm(15,74,70,8), animation: fadeIn(1500), kind: 'text', config: { text: '14 Februari 2026\nKebumen, Jawa Tengah', color: '#88735B', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
      { name: 'Ornamen Dekoratif Bawah', ...nodeBase('front-decoration'), transform: tfm(35,86,30,8), animation: fadeIn(1800), kind: 'text', config: { text: '✧', color: '#C5A880', fontSize: 42, align: 'center' } },
    ],
  },
  {
    id: 'hero-split-dual',
    sectionId: 'hero',
    name: 'Split Dual Photo',
    thumbnail: '🎭',
    description: 'Dua foto mempelai split screen dengan nama di tengah',
    nodes: [
      { name: 'Foto Wanita Kiri', ...nodeBase('background'), transform: tfm(0,0,50,100), animation: fadeIn(200), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Foto Pria Kanan', ...nodeBase('background'), transform: tfm(50,0,50,100), animation: fadeIn(400), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Divider Tengah', ...nodeBase('front-decoration'), transform: tfm(48,0,4,100), animation: fadeIn(600), kind: 'text', config: { text: '│', color: '#C5A880', fontSize: 120, align: 'center' } },
      { name: 'Nama Couple', ...nodeBase('content'), transform: tfm(20,45,60,12), animation: fadeIn(1200), kind: 'text', config: { text: 'Ananda\n&\nBintang', color: '#4A2E35', fontSize: 32, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Label Wedding', ...nodeBase('content'), transform: tfm(25,35,50,5), animation: fadeIn(1500), kind: 'text', config: { text: 'THE WEDDING OF', color: '#88735B', fontSize: 9, align: 'center', fontFamily: 'Syncopate', letterSpacing: 3 } },
    ],
  },
];
