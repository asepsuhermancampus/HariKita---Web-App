/**
 * HariKita Invitation Studio — Dress Code Templates
 * 
 * Template untuk section dress-code: tema busana, protokol acara, etiquette.
 */
import type { SectionTemplate } from '../section-templates';
import { fadeIn, floatAnim, nodeBase, tfm } from './helpers';

export const DRESS_CODE_TEMPLATES: SectionTemplate[] = [
  {
    id: 'dresscode-formal-elegant',
    sectionId: 'dress-code',
    name: 'Formal Elegan',
    thumbnail: '👔',
    description: 'Dress code formal dengan ikon busana dan palet warna',
    nodes: [
      { name: 'Judul Section', ...nodeBase('content'), transform: tfm(10,5,80,8), animation: fadeIn(0), kind: 'text', config: { text: 'Dress Code', color: '#4A2E35', fontSize: 26, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Subtitle', ...nodeBase('content'), transform: tfm(10,14,80,6), animation: fadeIn(200), kind: 'text', config: { text: 'Kami mengundang Anda untuk berpakaian formal elegan', color: '#88735B', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
      { name: 'Divider', ...nodeBase('front-decoration'), transform: tfm(30,22,40,4), animation: fadeIn(400), kind: 'text', config: { text: '—— ✦ ——', color: '#C5A880', fontSize: 14, align: 'center' } },
      
      { name: 'Label Pria', ...nodeBase('content'), transform: tfm(10,30,35,6), animation: fadeIn(600), kind: 'text', config: { text: 'Pria', color: '#4A2E35', fontSize: 14, align: 'center', fontFamily: 'Syncopate', letterSpacing: 2 } },
      { name: 'Icon Pria', ...nodeBase('front-decoration'), transform: tfm(15,38,25,12), animation: floatAnim(700), kind: 'text', config: { text: '👔', color: '#4A2E35', fontSize: 42, align: 'center' } },
      { name: 'Deskripsi Pria', ...nodeBase('content'), transform: tfm(10,52,35,12), animation: fadeIn(800), kind: 'text', config: { text: 'Jas formal\natau batik lengan panjang\nwarna gelap', color: '#6B5E62', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
      
      { name: 'Label Wanita', ...nodeBase('content'), transform: tfm(55,30,35,6), animation: fadeIn(600), kind: 'text', config: { text: 'Wanita', color: '#4A2E35', fontSize: 14, align: 'center', fontFamily: 'Syncopate', letterSpacing: 2 } },
      { name: 'Icon Wanita', ...nodeBase('front-decoration'), transform: tfm(60,38,25,12), animation: floatAnim(900), kind: 'text', config: { text: '👗', color: '#4A2E35', fontSize: 42, align: 'center' } },
      { name: 'Deskripsi Wanita', ...nodeBase('content'), transform: tfm(55,52,35,12), animation: fadeIn(1000), kind: 'text', config: { text: 'Gaun panjang,\nkebaya modern,\natau gamis syar\'i', color: '#6B5E62', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
      
      { name: 'Palet Warna Judul', ...nodeBase('content'), transform: tfm(10,68,80,5), animation: fadeIn(1200), kind: 'text', config: { text: 'Tema Warna Acara', color: '#88735B', fontSize: 11, align: 'center', fontFamily: 'Syncopate', letterSpacing: 2 } },
      { name: 'Palet Kotak 1', ...nodeBase('front-decoration'), transform: tfm(20,75,12,8), animation: fadeIn(1300), kind: 'text', config: { text: '█', color: '#C5A880', fontSize: 52, align: 'center' } },
      { name: 'Palet Kotak 2', ...nodeBase('front-decoration'), transform: tfm(35,75,12,8), animation: fadeIn(1400), kind: 'text', config: { text: '█', color: '#4A2E35', fontSize: 52, align: 'center' } },
      { name: 'Palet Kotak 3', ...nodeBase('front-decoration'), transform: tfm(50,75,12,8), animation: fadeIn(1500), kind: 'text', config: { text: '█', color: '#FAF8F5', fontSize: 52, align: 'center' } },
      { name: 'Palet Kotak 4', ...nodeBase('front-decoration'), transform: tfm(65,75,12,8), animation: fadeIn(1600), kind: 'text', config: { text: '█', color: '#88735B', fontSize: 52, align: 'center' } },
      
      { name: 'Catatan', ...nodeBase('content'), transform: tfm(10,86,80,8), animation: fadeIn(1700), kind: 'text', config: { text: 'Mohon hindari pakaian serba putih atau hitam polos.\nTerima kasih atas perhatiannya.', color: '#6B5E62', fontSize: 10, align: 'center', fontFamily: 'Lora', fontStyle: 'italic' } },
    ],
  },
  {
    id: 'dresscode-casual-garden',
    sectionId: 'dress-code',
    name: 'Casual Garden Party',
    thumbnail: '🌸',
    description: 'Dress code santai untuk outdoor garden wedding',
    nodes: [
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,8,80,8), animation: fadeIn(0), kind: 'text', config: { text: 'Garden Party Attire', color: '#4A2E35', fontSize: 24, align: 'center', fontFamily: 'Great Vibes' } },
      { name: 'Subtitle', ...nodeBase('content'), transform: tfm(10,17,80,8), animation: fadeIn(200), kind: 'text', config: { text: 'Acara outdoor di taman.\nSilakan berpakaian nyaman dan ceria!', color: '#88735B', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
      
      { name: 'Icon Bunga 1', ...nodeBase('front-decoration'), transform: tfm(5,28,15,12), animation: floatAnim(400), kind: 'text', config: { text: '🌸', color: '#C5A880', fontSize: 38, align: 'center' } },
      { name: 'Icon Bunga 2', ...nodeBase('front-decoration'), transform: tfm(80,28,15,12), animation: floatAnim(600), kind: 'text', config: { text: '🌺', color: '#C5A880', fontSize: 38, align: 'center' } },
      
      { name: 'Rekomendasi', ...nodeBase('content'), transform: tfm(15,42,70,24), animation: fadeIn(800), kind: 'text', config: { text: '✓ Sundress atau maxi dress bermotif bunga\n✓ Kemeja linen atau batik casual\n✓ Sepatu flat atau wedges (bukan heels tinggi)\n✓ Warna pastel atau floral print\n✓ Bawa cardigan ringan untuk sore hari', color: '#4A2E35', fontSize: 11, align: 'left', fontFamily: 'Lora' } },
      
      { name: 'Tips Box', ...nodeBase('content'), transform: tfm(10,70,80,16), animation: fadeIn(1000), kind: 'text', config: { text: '💡 Tips: Acara berlangsung di area rumput.\nMohon hindari stiletto heels agar lebih nyaman.\nBawa topi atau payung untuk siang hari yang cerah!', color: '#6B5E62', fontSize: 10, align: 'center', fontFamily: 'Lora', fontStyle: 'italic' } },
    ],
  },
  {
    id: 'dresscode-traditional-adat',
    sectionId: 'dress-code',
    name: 'Busana Adat Tradisional',
    thumbnail: '👘',
    description: 'Dress code tema adat Jawa atau budaya lokal',
    nodes: [
      { name: 'Ornamen Atas', ...nodeBase('front-decoration'), transform: tfm(30,3,40,6), animation: fadeIn(0), kind: 'text', config: { text: '✧ ❋ ✧', color: '#C5A880', fontSize: 18, align: 'center' } },
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,11,80,8), animation: fadeIn(200), kind: 'text', config: { text: 'Busana Adat', color: '#4A2E35', fontSize: 26, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Subtitle', ...nodeBase('content'), transform: tfm(10,20,80,8), animation: fadeIn(400), kind: 'text', config: { text: 'Kami mengundang Bapak/Ibu/Saudara/i\nuntuk mengenakan busana adat atau nasional', color: '#88735B', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
      
      { name: 'Divider', ...nodeBase('front-decoration'), transform: tfm(25,30,50,4), animation: fadeIn(600), kind: 'text', config: { text: '━━━ ❋ ━━━', color: '#C5A880', fontSize: 14, align: 'center' } },
      
      { name: 'Rekomendasi Wanita', ...nodeBase('content'), transform: tfm(10,38,80,16), animation: fadeIn(800), kind: 'text', config: { text: 'Wanita:\n✓ Kebaya Jawa/Sunda dengan kain batik\n✓ Baju Bodo (Makassar) atau Ulos (Batak)\n✓ Gamis syar\'i dengan motif tradisional\n✓ Sanggul atau hijab dengan aksesoris adat', color: '#4A2E35', fontSize: 11, align: 'left', fontFamily: 'Lora' } },
      
      { name: 'Rekomendasi Pria', ...nodeBase('content'), transform: tfm(10,56,80,16), animation: fadeIn(1000), kind: 'text', config: { text: 'Pria:\n✓ Beskap Jawa atau Jas Tutup (Sunda)\n✓ Baju Koko dengan sarung atau batik\n✓ Kampret atau blangkon sebagai penutup kepala\n✓ Sepatu pantofel hitam', color: '#4A2E35', fontSize: 11, align: 'left', fontFamily: 'Lora' } },
      
      { name: 'Catatan Adat', ...nodeBase('content'), transform: tfm(10,75,80,12), animation: fadeIn(1200), kind: 'text', config: { text: '🙏 Jika tidak memiliki busana adat,\nBapak/Ibu dapat mengenakan batik atau busana nasional.\nKami sangat menghargai kehadiran Anda.', color: '#6B5E62', fontSize: 10, align: 'center', fontFamily: 'Lora', fontStyle: 'italic' } },
      
      { name: 'Ornamen Bawah', ...nodeBase('front-decoration'), transform: tfm(30,90,40,6), animation: fadeIn(1400), kind: 'text', config: { text: '✧ ❋ ✧', color: '#C5A880', fontSize: 18, align: 'center' } },
    ],
  },
];
