/**
 * HariKita Invitation Studio — Closing Templates
 */
import type { SectionTemplate } from '../section-templates';
import { fadeIn, floatAnim, nodeBase, tfm } from './helpers';

export const CLOSING_TEMPLATES: SectionTemplate[] = [
  {
    id: 'closing-thanks',
    sectionId: 'closing',
    name: 'Terima Kasih',
    thumbnail: '🙏',
    description: 'Ucapan terima kasih penutup dengan nama couple',
    nodes: [
      { name: 'Ornamen Atas', ...nodeBase('front-decoration'), transform: tfm(35,8,30,8), animation: fadeIn(0), kind: 'text', config: { text: '❋', color: '#C5A880', fontSize: 40, align: 'center' } },
      { name: 'Judul Terima Kasih', ...nodeBase('content'), transform: tfm(10,19,80,8), animation: fadeIn(200), kind: 'text', config: { text: 'Terima Kasih', color: '#4A2E35', fontSize: 32, align: 'center', fontFamily: 'Great Vibes' } },
      { name: 'Pesan', ...nodeBase('content'), transform: tfm(10,30,80,16), animation: fadeIn(400), kind: 'text', config: { text: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami\napabila Bapak/Ibu/Saudara/i berkenan hadir\ndi hari bahagia kami.', color: '#4A2E35', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
      { name: 'Salam', ...nodeBase('content'), transform: tfm(10,49,80,8), animation: fadeIn(600), kind: 'text', config: { text: 'Kami yang berbahagia,', color: '#88735B', fontSize: 13, align: 'center', fontFamily: 'Lora', fontStyle: 'italic' } },
      { name: 'Nama Couple', ...nodeBase('content'), transform: tfm(10,58,80,14), animation: fadeIn(800), kind: 'text', config: { text: 'Ananda Putri\n&\nBintang Pratama', color: '#4A2E35', fontSize: 30, align: 'center', fontFamily: 'Great Vibes' } },
      { name: 'Keluarga', ...nodeBase('content'), transform: tfm(10,74,80,10), animation: fadeIn(1000), kind: 'text', config: { text: 'Beserta Keluarga Besar\nBpk. H. Andika Putra & Bpk. H. Pratama Wibowo', color: '#88735B', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
      { name: 'Ornamen Bawah', ...nodeBase('front-decoration'), transform: tfm(35,86,30,8), animation: fadeIn(1200), kind: 'text', config: { text: '❋', color: '#C5A880', fontSize: 40, align: 'center' } },
    ],
  },
  {
    id: 'closing-wassalam',
    sectionId: 'closing',
    name: 'Wassalamualaikum',
    thumbnail: '🤲',
    description: 'Penutup bernuansa islami dengan salam dan doa',
    nodes: [
      { name: 'Kaligrafi', ...nodeBase('content'), transform: tfm(10,6,80,12), animation: fadeIn(0), kind: 'text', config: { text: '﷽', color: '#C5A880', fontSize: 42, align: 'center', fontFamily: 'Amiri' } },
      { name: 'Doa Penutup', ...nodeBase('content'), transform: tfm(10,20,80,12), animation: fadeIn(200), kind: 'text', config: { text: 'Jazakumullahu khairan katsiran\nSemoga Allah membalas segala kebaikan Anda', color: '#4A2E35', fontSize: 13, align: 'center', fontFamily: 'Lora' } },
      { name: 'Salam', ...nodeBase('content'), transform: tfm(10,34,80,10), animation: fadeIn(400), kind: 'text', config: { text: 'Wassalamualaikum Warahmatullahi Wabarakatuh', color: '#C5A880', fontSize: 14, align: 'center', fontFamily: 'Lora', fontStyle: 'italic' } },
      { name: 'Divider', ...nodeBase('front-decoration'), transform: tfm(30,46,40,4), animation: fadeIn(600), kind: 'text', config: { text: '—— ✦ ——', color: '#C5A880', fontSize: 14, align: 'center' } },
      { name: 'Salam Hormat', ...nodeBase('content'), transform: tfm(10,53,80,8), animation: fadeIn(800), kind: 'text', config: { text: 'Kami yang berbahagia,', color: '#88735B', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
      { name: 'Nama Couple', ...nodeBase('content'), transform: tfm(10,62,80,14), animation: fadeIn(1000), kind: 'text', config: { text: 'Siti Nur Aini\n&\nM. Rizky Ramadhan', color: '#4A2E35', fontSize: 26, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Keluarga', ...nodeBase('content'), transform: tfm(10,78,80,10), animation: fadeIn(1200), kind: 'text', config: { text: 'Beserta Keluarga Besar', color: '#88735B', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
    ],
  },
  {
    id: 'closing-photo-thanks',
    sectionId: 'closing',
    name: 'Terima Kasih + Foto',
    thumbnail: '📸',
    description: 'Penutup dengan foto couple besar dan pesan hangat',
    nodes: [
      { name: 'Foto Background', ...nodeBase('background'), transform: tfm(0,0,100,100), animation: fadeIn(0), kind: 'image', config: { src: '/assets/harikita/placeholders/photo-landscape.svg', fit: 'cover' } },
      { name: 'Judul Thanks', ...nodeBase('content'), transform: tfm(10,55,80,10), animation: fadeIn(400), kind: 'text', config: { text: 'Thank You', color: '#FAF8F5', fontSize: 42, align: 'center', fontFamily: 'Great Vibes' } },
      { name: 'Pesan', ...nodeBase('content'), transform: tfm(10,68,80,10), animation: fadeIn(600), kind: 'text', config: { text: 'Kehadiran dan doa Anda adalah hadiah terindah bagi kami', color: '#FAF8F5', fontSize: 13, align: 'center', fontFamily: 'Lora' } },
      { name: 'Nama Couple', ...nodeBase('content'), transform: tfm(10,79,80,10), animation: fadeIn(800), kind: 'text', config: { text: 'Ananda & Bintang', color: '#C5A880', fontSize: 32, align: 'center', fontFamily: 'Allura' } },
      { name: 'Tanggal', ...nodeBase('content'), transform: tfm(10,90,80,6), animation: fadeIn(1000), kind: 'text', config: { text: '14 · 02 · 2026', color: '#C5A880', fontSize: 13, align: 'center', fontFamily: 'Cinzel' } },
    ],
  },
  {
    id: 'closing-family-signature',
    sectionId: 'closing',
    name: 'Tanda Tangan Keluarga',
    thumbnail: '✍️',
    description: 'Penutup formal dengan tanda tangan kedua keluarga',
    nodes: [
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,5,80,8), animation: fadeIn(0), kind: 'text', config: { text: 'Hormat Kami', color: '#4A2E35', fontSize: 24, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Divider', ...nodeBase('front-decoration'), transform: tfm(30,14,40,4), animation: fadeIn(200), kind: 'text', config: { text: '━━━ ✦ ━━━', color: '#C5A880', fontSize: 14, align: 'center' } },
      { name: 'Keluarga Wanita', ...nodeBase('content'), transform: tfm(5,22,44,30), animation: fadeIn(400), kind: 'text', config: { text: 'Keluarga Mempelai Wanita\n\n\n\nBpk. H. Andika Putra\n& Ibu Hj. Sri Lestari', color: '#4A2E35', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
      { name: 'Keluarga Pria', ...nodeBase('content'), transform: tfm(51,22,44,30), animation: fadeIn(500), kind: 'text', config: { text: 'Keluarga Mempelai Pria\n\n\n\nBpk. H. Pratama Wibowo\n& Ibu Hj. Dewi Kusuma', color: '#4A2E35', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
      { name: 'Nama Mempelai', ...nodeBase('content'), transform: tfm(10,55,80,14), animation: fadeIn(700), kind: 'text', config: { text: 'Ananda Putri & Bintang Pratama', color: '#C5A880', fontSize: 28, align: 'center', fontFamily: 'Great Vibes' } },
      { name: 'Pesan Akhir', ...nodeBase('content'), transform: tfm(10,72,80,12), animation: fadeIn(900), kind: 'text', config: { text: 'Semoga Allah SWT senantiasa melimpahkan\nrahmat, berkah, dan hidayah-Nya kepada kita semua.\nAamiin Ya Rabbal Alamin.', color: '#4A2E35', fontSize: 11, align: 'center', fontFamily: 'Lora', fontStyle: 'italic' } },
    ],
  },
];
