/**
 * HariKita Invitation Studio — Entourage Templates
 */
import type { SectionTemplate } from '../section-templates';
import { fadeIn, nodeBase, tfm } from './helpers';

export const ENTOURAGE_TEMPLATES: SectionTemplate[] = [
  {
    id: 'entourage-default',
    sectionId: 'entourage',
    name: 'Keluarga & Panitia',
    thumbnail: '👨‍👩‍👧‍👦',
    description: 'Daftar keluarga besar kedua mempelai dan tim panitia',
    nodes: [
      { name: 'Judul Entourage', ...nodeBase('content'), transform: tfm(10,2,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Keluarga & Panitia', color: '#4A2E35', fontSize: 22, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Keluarga Wanita', ...nodeBase('content'), transform: tfm(5,11,44,38), animation: fadeIn(200), kind: 'text', config: { text: '👨‍👩‍👧 Keluarga Mempelai Wanita\n\nAyah: H. Andika Putra\nIbu: Hj. Sri Lestari\nKakak: Dinda Andini\nAdik: Rara Putri\n\nPaman: H. Bambang S.\nBibi: Hj. Sari W.', color: '#4A2E35', fontSize: 11, align: 'left', fontFamily: 'Lora' } },
      { name: 'Keluarga Pria', ...nodeBase('content'), transform: tfm(51,11,44,38), animation: fadeIn(200), kind: 'text', config: { text: '👨‍👩‍👦 Keluarga Mempelai Pria\n\nAyah: H. Pratama Wibowo\nIbu: Hj. Dewi Kusuma\nKakak: Dimas Pratama\nAdik: Bagas Wibowo\n\nPaman: H. Wahyu S.\nBibi: Hj. Endah R.', color: '#4A2E35', fontSize: 11, align: 'left', fontFamily: 'Lora' } },
      { name: 'Tim Panitia', ...nodeBase('content'), transform: tfm(5,52,90,32), animation: fadeIn(400), kind: 'text', config: { text: '🌸 Tim Panitia Pernikahan\n\nKetua Panitia: Andi Setiawan\nSeksi Dokumentasi: Tim HariKita Photography\nSeksi Dekorasi: HariKita Decoration\nSeksi Katering: HariKita Catering Kebumen\nSeksi Hiburan: MC & Entertainment Team', color: '#4A2E35', fontSize: 11, align: 'left', fontFamily: 'Lora' } },
    ],
  },
  {
    id: 'entourage-bridesmaids',
    sectionId: 'entourage',
    name: 'Bridesmaids & Groomsmen',
    thumbnail: '💐',
    description: 'Daftar pendamping pengantin dengan foto',
    nodes: [
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,3,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Our Entourage', color: '#4A2E35', fontSize: 24, align: 'center', fontFamily: 'Great Vibes' } },
      { name: 'Sub - Bridesmaids', ...nodeBase('content'), transform: tfm(5,12,44,5), animation: fadeIn(200), kind: 'text', config: { text: 'Bridesmaids 💐', color: '#C5A880', fontSize: 13, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Bridesmaid 1', ...nodeBase('content'), transform: tfm(5,18,44,5), animation: fadeIn(300), kind: 'text', config: { text: '1. Dinda Andini', color: '#4A2E35', fontSize: 11, align: 'left', fontFamily: 'Lora' } },
      { name: 'Bridesmaid 2', ...nodeBase('content'), transform: tfm(5,24,44,5), animation: fadeIn(350), kind: 'text', config: { text: '2. Rara Putri', color: '#4A2E35', fontSize: 11, align: 'left', fontFamily: 'Lora' } },
      { name: 'Bridesmaid 3', ...nodeBase('content'), transform: tfm(5,30,44,5), animation: fadeIn(400), kind: 'text', config: { text: '3. Sinta Dewi', color: '#4A2E35', fontSize: 11, align: 'left', fontFamily: 'Lora' } },
      { name: 'Bridesmaid 4', ...nodeBase('content'), transform: tfm(5,36,44,5), animation: fadeIn(450), kind: 'text', config: { text: '4. Ayu Lestari', color: '#4A2E35', fontSize: 11, align: 'left', fontFamily: 'Lora' } },
      { name: 'Sub - Groomsmen', ...nodeBase('content'), transform: tfm(51,12,44,5), animation: fadeIn(200), kind: 'text', config: { text: 'Groomsmen 🤵', color: '#C5A880', fontSize: 13, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Groomsman 1', ...nodeBase('content'), transform: tfm(51,18,44,5), animation: fadeIn(300), kind: 'text', config: { text: '1. Dimas Pratama', color: '#4A2E35', fontSize: 11, align: 'left', fontFamily: 'Lora' } },
      { name: 'Groomsman 2', ...nodeBase('content'), transform: tfm(51,24,44,5), animation: fadeIn(350), kind: 'text', config: { text: '2. Bagas Wibowo', color: '#4A2E35', fontSize: 11, align: 'left', fontFamily: 'Lora' } },
      { name: 'Groomsman 3', ...nodeBase('content'), transform: tfm(51,30,44,5), animation: fadeIn(400), kind: 'text', config: { text: '3. Rizky Aditya', color: '#4A2E35', fontSize: 11, align: 'left', fontFamily: 'Lora' } },
      { name: 'Groomsman 4', ...nodeBase('content'), transform: tfm(51,36,44,5), animation: fadeIn(450), kind: 'text', config: { text: '4. Fajar Nugroho', color: '#4A2E35', fontSize: 11, align: 'left', fontFamily: 'Lora' } },
      { name: 'Foto Bersama', ...nodeBase('content'), transform: tfm(15,45,70,35), animation: fadeIn(600), kind: 'image', config: { src: '/assets/harikita/placeholders/photo-landscape.svg', fit: 'cover' } },
      { name: 'Terima Kasih', ...nodeBase('content'), transform: tfm(10,82,80,10), animation: fadeIn(800), kind: 'text', config: { text: 'Terima kasih kepada seluruh keluarga dan sahabat\nyang telah mendukung hari bahagia kami', color: '#88735B', fontSize: 11, align: 'center', fontFamily: 'Lora', fontStyle: 'italic' } },
    ],
  },
  {
    id: 'entourage-organized',
    sectionId: 'entourage',
    name: 'Tersusun Rapi',
    thumbnail: '📋',
    description: 'Daftar keluarga dan panitia dengan struktur kolom rapi',
    nodes: [
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,2,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Yang Berbahagia', color: '#4A2E35', fontSize: 24, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Kolom Orang Tua Wanita', ...nodeBase('content'), transform: tfm(3,11,30,20), animation: fadeIn(200), kind: 'text', config: { text: '👰 Orang Tua\nMempelai Wanita\n\nBpk. H. Andika Putra\nIbu Hj. Sri Lestari', color: '#4A2E35', fontSize: 10, align: 'center', fontFamily: 'Lora' } },
      { name: 'Kolom Orang Tua Pria', ...nodeBase('content'), transform: tfm(35,11,30,20), animation: fadeIn(300), kind: 'text', config: { text: '🤵 Orang Tua\nMempelai Pria\n\nBpk. H. Pratama W.\nIbu Hj. Dewi Kusuma', color: '#4A2E35', fontSize: 10, align: 'center', fontFamily: 'Lora' } },
      { name: 'Kolom Saksi', ...nodeBase('content'), transform: tfm(67,11,30,20), animation: fadeIn(400), kind: 'text', config: { text: '✍️ Saksi\n\nBpk. Ahmad Fauzi\nBpk. Hendra Wijaya', color: '#4A2E35', fontSize: 10, align: 'center', fontFamily: 'Lora' } },
      { name: 'Divider', ...nodeBase('front-decoration'), transform: tfm(20,33,60,3), animation: fadeIn(500), kind: 'text', config: { text: '━━━━━━━━━━━━━', color: '#C5A880', fontSize: 10, align: 'center' } },
      { name: 'Panitia Label', ...nodeBase('content'), transform: tfm(10,38,80,6), animation: fadeIn(600), kind: 'text', config: { text: '🌸 TIM PANITIA', color: '#C5A880', fontSize: 13, align: 'center', fontFamily: 'Syncopate', letterSpacing: 2 } },
      { name: 'Panitia Detail', ...nodeBase('content'), transform: tfm(10,46,80,28), animation: fadeIn(700), kind: 'text', config: { text: 'Ketua: Andi Setiawan\nSekretaris: Putri Handayani\nBendahara: Rina Marlina\nDokumentasi: Tim HariKita Photography\nDekorasi: HariKita Decoration\nKatering: HariKita Catering\nHiburan: MC & Entertainment Team', color: '#4A2E35', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
      { name: 'Penutup', ...nodeBase('content'), transform: tfm(10,76,80,10), animation: fadeIn(900), kind: 'text', config: { text: 'Kami mengucapkan terima kasih yang sebesar-besarnya\natas bantuan dan dukungan semua pihak 🙏', color: '#88735B', fontSize: 11, align: 'center', fontFamily: 'Lora', fontStyle: 'italic' } },
    ],
  },
];
