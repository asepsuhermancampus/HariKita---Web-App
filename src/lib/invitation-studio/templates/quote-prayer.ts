/**
 * HariKita Invitation Studio — Quote & Prayer Templates
 * 
 * Template untuk section quote-prayer: ayat suci, doa, quote romantis.
 */
import type { SectionTemplate } from '../section-templates';
import { fadeIn, swayAnim, nodeBase, tfm, PP, LP } from './helpers';

export const QUOTE_PRAYER_TEMPLATES: SectionTemplate[] = [
  {
    id: 'quote-quran-arrum',
    sectionId: 'quote-prayer',
    name: 'Ayat Ar-Rum 21',
    thumbnail: '☪️',
    description: 'Ayat tentang pasangan dengan kaligrafi Arab dan terjemahan',
    nodes: [
      { name: 'Ornamen Atas', ...nodeBase('front-decoration'), transform: tfm(35,5,30,5), animation: swayAnim(0), kind: 'text', config: { text: '✦ ✧ ✦', color: '#C5A880', fontSize: 17, align: 'center' } },
      { name: 'Ayat Al-Quran (Arab)', ...nodeBase('content'), transform: tfm(10,13,80,18), animation: fadeIn(200), kind: 'text', config: { text: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا', color: '#4A2E35', fontSize: 20, align: 'center', fontFamily: 'Amiri' } },
      { name: 'Terjemahan', ...nodeBase('content'), transform: tfm(10,33,80,22), animation: fadeIn(400), kind: 'text', config: { text: '"Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu merasa tenteram kepadanya..."\n\n— QS. Ar-Rum: 21', color: '#6B5E62', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
      { name: 'Pembatas', ...nodeBase('front-decoration'), transform: tfm(30,58,40,4), animation: fadeIn(600), kind: 'text', config: { text: '—— ✦ ——', color: '#C5A880', fontSize: 15, align: 'center' } },
      { name: 'Nama Couple', ...nodeBase('content'), transform: tfm(10,63,80,12), animation: fadeIn(800), kind: 'text', config: { text: 'Ananda Putri\n&\nBintang Pratama', color: '#4A2E35', fontSize: 22, align: 'center', fontFamily: 'Cinzel' } },
    ],
  },
  {
    id: 'quote-romantic-love',
    sectionId: 'quote-prayer',
    name: 'Quote Romantis',
    thumbnail: '💕',
    description: 'Quote cinta dengan foto couple background soft',
    nodes: [
      { name: 'Foto Background Soft', ...nodeBase('background'), transform: tfm(0,0,100,100), animation: fadeIn(0), kind: 'image', config: { src: LP, fit: 'cover' } },
      { name: 'Quote Pembuka', ...nodeBase('content'), transform: tfm(10,25,80,8), animation: fadeIn(300), kind: 'text', config: { text: '"Cinta sejati dimulai ketika tidak ada yang diharapkan sebagai balasannya"', color: '#4A2E35', fontSize: 16, align: 'center', fontFamily: 'Playfair Display', fontStyle: 'italic' } },
      { name: 'Penulis Quote', ...nodeBase('content'), transform: tfm(20,35,60,5), animation: fadeIn(500), kind: 'text', config: { text: '— Antoine de Saint-Exupéry', color: '#88735B', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
      { name: 'Divider', ...nodeBase('front-decoration'), transform: tfm(30,43,40,4), animation: fadeIn(700), kind: 'text', config: { text: '♥ ♥ ♥', color: '#C5A880', fontSize: 14, align: 'center' } },
      { name: 'Pesan Couple', ...nodeBase('content'), transform: tfm(10,50,80,18), animation: fadeIn(900), kind: 'text', config: { text: 'Dari pertemuan sederhana, tumbuh cinta yang mendalam.\nKami bersyukur dapat merayakan cinta ini bersama kalian.', color: '#4A2E35', fontSize: 13, align: 'center', fontFamily: 'Lora' } },
      { name: 'Nama Couple', ...nodeBase('content'), transform: tfm(15,72,70,10), animation: fadeIn(1100), kind: 'text', config: { text: 'Ananda & Bintang', color: '#C5A880', fontSize: 28, align: 'center', fontFamily: 'Great Vibes' } },
    ],
  },
  {
    id: 'quote-doa-pernikahan',
    sectionId: 'quote-prayer',
    name: 'Doa Pernikahan',
    thumbnail: '🤲',
    description: 'Doa untuk mempelai dengan desain syar\'i minimalis',
    nodes: [
      { name: 'Bismillah Kaligrafi', ...nodeBase('content'), transform: tfm(10,8,80,10), animation: fadeIn(0), kind: 'text', config: { text: '﷽', color: '#C5A880', fontSize: 38, align: 'center', fontFamily: 'Amiri' } },
      { name: 'Judul Doa', ...nodeBase('content'), transform: tfm(10,20,80,6), animation: fadeIn(200), kind: 'text', config: { text: 'DOA UNTUK MEMPELAI', color: '#88735B', fontSize: 10, align: 'center', fontFamily: 'Syncopate', letterSpacing: 3 } },
      { name: 'Doa Arab', ...nodeBase('content'), transform: tfm(10,28,80,16), animation: fadeIn(400), kind: 'text', config: { text: 'بَارَكَ اللّٰهُ لَكَ وَبَارَكَ عَلَيْكَ\nوَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ', color: '#4A2E35', fontSize: 18, align: 'center', fontFamily: 'Amiri' } },
      { name: 'Terjemahan Doa', ...nodeBase('content'), transform: tfm(10,46,80,16), animation: fadeIn(600), kind: 'text', config: { text: '"Semoga Allah memberkahimu,\nmelimpahkan keberkahan atasmu,\ndan mengumpulkan kalian berdua dalam kebaikan."', color: '#6B5E62', fontSize: 12, align: 'center', fontFamily: 'Lora', fontStyle: 'italic' } },
      { name: 'Hadits Reference', ...nodeBase('content'), transform: tfm(10,64,80,5), animation: fadeIn(800), kind: 'text', config: { text: '— HR. Abu Dawud & Tirmidzi', color: '#88735B', fontSize: 10, align: 'center', fontFamily: 'Lora' } },
      { name: 'Ornamen Bawah', ...nodeBase('front-decoration'), transform: tfm(30,72,40,5), animation: fadeIn(1000), kind: 'text', config: { text: '✧ ❀ ✧', color: '#C5A880', fontSize: 16, align: 'center' } },
      { name: 'Penutup', ...nodeBase('content'), transform: tfm(10,80,80,10), animation: fadeIn(1200), kind: 'text', config: { text: 'Doa terbaik untuk pernikahan yang diberkahi,\npenuh cinta, dan penuh rahmat.', color: '#4A2E35', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
    ],
  },
];
