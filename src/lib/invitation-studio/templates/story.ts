/**
 * HariKita Invitation Studio — Story Templates
 */
import type { SectionTemplate } from '../section-templates';
import { fadeIn, floatAnim, nodeBase, tfm, PP, LP } from './helpers';

export const STORY_TEMPLATES: SectionTemplate[] = [
  {
    id: 'story-timeline',
    sectionId: 'story',
    name: 'Timeline Kisah Cinta',
    thumbnail: '❤️',
    description: 'Perjalanan kisah cinta dari pertama bertemu hingga lamaran',
    nodes: [
      { name: 'Judul Love Story', ...nodeBase('content'), transform: tfm(10,2,80,8), animation: fadeIn(0), kind: 'text', config: { text: 'Kisah Kita', color: '#4A2E35', fontSize: 26, align: 'center', fontFamily: 'Great Vibes' } },
      { name: 'Ornamen Hati', ...nodeBase('front-decoration'), transform: tfm(42,10,16,7), animation: floatAnim(200), kind: 'text', config: { text: '♥', color: '#C5A880', fontSize: 26, align: 'center' } },
      { name: 'Tahun Pertemuan', ...nodeBase('content'), transform: tfm(5,19,25,5), animation: fadeIn(300), kind: 'text', config: { text: '2021', color: '#C5A880', fontSize: 15, align: 'right', fontFamily: 'Cinzel' } },
      { name: 'Cerita Pertemuan', ...nodeBase('content'), transform: tfm(33,18,62,10), animation: fadeIn(400), kind: 'text', config: { text: '💫 Pertama Bertemu\nKami bertemu di kampus dalam sebuah kegiatan yang tak terduga. Sebuah senyum mengawali segalanya.', color: '#4A2E35', fontSize: 11, align: 'left', fontFamily: 'Lora' } },
      { name: 'Foto Pertemuan', ...nodeBase('content'), transform: tfm(5,30,28,18), animation: fadeIn(300), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Tahun Mengenal', ...nodeBase('content'), transform: tfm(68,36,27,5), animation: fadeIn(500), kind: 'text', config: { text: '2022', color: '#C5A880', fontSize: 15, align: 'left', fontFamily: 'Cinzel' } },
      { name: 'Cerita Mengenal', ...nodeBase('content'), transform: tfm(33,34,35,10), animation: fadeIn(600), kind: 'text', config: { text: '🌱 Saling Mengenal\nPerlahan tumbuh rasa yang tak bisa dihindari. Kami belajar mencintai perbedaan satu sama lain.', color: '#4A2E35', fontSize: 11, align: 'left', fontFamily: 'Lora' } },
      { name: 'Tahun Lamaran', ...nodeBase('content'), transform: tfm(5,51,25,5), animation: fadeIn(700), kind: 'text', config: { text: '2025', color: '#C5A880', fontSize: 15, align: 'right', fontFamily: 'Cinzel' } },
      { name: 'Cerita Lamaran', ...nodeBase('content'), transform: tfm(33,50,62,10), animation: fadeIn(800), kind: 'text', config: { text: '💍 Lamaran\nDengan restu kedua orang tua, kami memulai langkah baru menuju mahligai pernikahan yang suci.', color: '#4A2E35', fontSize: 11, align: 'left', fontFamily: 'Lora' } },
      { name: 'Foto Lamaran', ...nodeBase('content'), transform: tfm(68,49,27,18), animation: fadeIn(700), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Kalimat Penutup', ...nodeBase('content'), transform: tfm(10,71,80,11), animation: fadeIn(1000), kind: 'text', config: { text: '"Dan kini saatnya kami melangkah bersama\nmenuju hidup baru yang penuh berkah"', color: '#88735B', fontSize: 12, align: 'center', fontFamily: 'Lora', fontStyle: 'italic' } },
    ],
  },
  {
    id: 'story-photo-grid',
    sectionId: 'story',
    name: 'Kisah dalam Foto',
    thumbnail: '📷',
    description: 'Cerita perjalanan cinta dalam grid foto 2x2',
    nodes: [
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,3,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Perjalanan Kami', color: '#4A2E35', fontSize: 24, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Sub-judul', ...nodeBase('content'), transform: tfm(15,11,70,5), animation: fadeIn(200), kind: 'text', config: { text: 'Momen-momen berharga dalam perjalanan cinta kami', color: '#88735B', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
      { name: 'Foto 1 - Pertemuan', ...nodeBase('content'), transform: tfm(5,18,42,26), animation: fadeIn(300), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Caption 1', ...nodeBase('content'), transform: tfm(5,45,42,6), animation: fadeIn(400), kind: 'text', config: { text: '2021 · Pertemuan', color: '#4A2E35', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
      { name: 'Foto 2 - Jadian', ...nodeBase('content'), transform: tfm(53,18,42,26), animation: fadeIn(300), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Caption 2', ...nodeBase('content'), transform: tfm(53,45,42,6), animation: fadeIn(400), kind: 'text', config: { text: '2022 · Jadian', color: '#4A2E35', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
      { name: 'Foto 3 - Liburan', ...nodeBase('content'), transform: tfm(5,53,42,26), animation: fadeIn(500), kind: 'image', config: { src: LP, fit: 'cover' } },
      { name: 'Caption 3', ...nodeBase('content'), transform: tfm(5,80,42,6), animation: fadeIn(600), kind: 'text', config: { text: '2024 · Liburan Bersama', color: '#4A2E35', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
      { name: 'Foto 4 - Lamaran', ...nodeBase('content'), transform: tfm(53,53,42,26), animation: fadeIn(500), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Caption 4', ...nodeBase('content'), transform: tfm(53,80,42,6), animation: fadeIn(600), kind: 'text', config: { text: '2025 · Lamaran', color: '#4A2E35', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
      { name: 'Penutup', ...nodeBase('content'), transform: tfm(10,88,80,8), animation: fadeIn(800), kind: 'text', config: { text: '...dan kisah ini akan terus berlanjut', color: '#C5A880', fontSize: 13, align: 'center', fontFamily: 'Great Vibes' } },
    ],
  },
  {
    id: 'story-narrative',
    sectionId: 'story',
    name: 'Narasi Kisah',
    thumbnail: '📖',
    description: 'Kisah cinta dalam bentuk narasi panjang dan intim',
    nodes: [
      { name: 'Ornamen Atas', ...nodeBase('front-decoration'), transform: tfm(30,4,40,6), animation: fadeIn(0), kind: 'text', config: { text: '❋ ─── ❋', color: '#C5A880', fontSize: 16, align: 'center' } },
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,12,80,7), animation: fadeIn(200), kind: 'text', config: { text: 'Bagaimana Semua Dimulai', color: '#4A2E35', fontSize: 22, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Foto Utama', ...nodeBase('content'), transform: tfm(20,22,60,24), animation: fadeIn(400), kind: 'image', config: { src: LP, fit: 'cover' } },
      { name: 'Narasi', ...nodeBase('content'), transform: tfm(10,49,80,32), animation: fadeIn(600), kind: 'text', config: { text: 'Tahun 2021, di sebuah acara kampus, kami bertemu untuk pertama kalinya. Tidak ada yang istimewa saat itu—hanya dua orang asing yang kebetulan berada di tempat yang sama.\n\nNamun takdir berkata lain. Pertemuan sederhana itu membawa kami pada percakapan panjang, tawa, dan akhirnya cinta yang tumbuh perlahan.\n\nEmpat tahun berlalu, kami melewati suka dan duka bersama. Dan kini, kami siap melangkah ke babak baru: menjadi suami dan istri.', color: '#4A2E35', fontSize: 11, align: 'center', fontFamily: 'Lora', lineHeight: 1.8 } },
      { name: 'Nama Couple', ...nodeBase('content'), transform: tfm(10,83,80,10), animation: fadeIn(800), kind: 'text', config: { text: 'Ananda & Bintang', color: '#C5A880', fontSize: 30, align: 'center', fontFamily: 'Great Vibes' } },
    ],
  },
  {
    id: 'story-milestone',
    sectionId: 'story',
    name: 'Milestone Berpasangan',
    thumbnail: '🗓️',
    description: 'Timeline milestone dengan foto di setiap tahap',
    nodes: [
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,2,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Milestone Cinta', color: '#4A2E35', fontSize: 24, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Milestone 1 Tahun', ...nodeBase('content'), transform: tfm(5,12,25,5), animation: fadeIn(200), kind: 'text', config: { text: '2021', color: '#C5A880', fontSize: 14, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Milestone 1 Teks', ...nodeBase('content'), transform: tfm(5,18,25,16), animation: fadeIn(300), kind: 'text', config: { text: 'Pertama\nBertemu\n\nDi kampus\nsaat ospek', color: '#4A2E35', fontSize: 10, align: 'center', fontFamily: 'Lora' } },
      { name: 'Garis 1', ...nodeBase('front-decoration'), transform: tfm(31,25,4,4), animation: fadeIn(300), kind: 'text', config: { text: '●', color: '#C5A880', fontSize: 14, align: 'center' } },
      { name: 'Milestone 2 Tahun', ...nodeBase('content'), transform: tfm(37,12,25,5), animation: fadeIn(400), kind: 'text', config: { text: '2022', color: '#C5A880', fontSize: 14, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Milestone 2 Teks', ...nodeBase('content'), transform: tfm(37,18,25,16), animation: fadeIn(500), kind: 'text', config: { text: 'Mulai\nPacaran\n\nSetelah\ndeep talk', color: '#4A2E35', fontSize: 10, align: 'center', fontFamily: 'Lora' } },
      { name: 'Milestone 3 Tahun', ...nodeBase('content'), transform: tfm(69,12,25,5), animation: fadeIn(600), kind: 'text', config: { text: '2025', color: '#C5A880', fontSize: 14, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Milestone 3 Teks', ...nodeBase('content'), transform: tfm(69,18,25,16), animation: fadeIn(700), kind: 'text', config: { text: 'Lamaran\n\nDengan restu\nkeluarga', color: '#4A2E35', fontSize: 10, align: 'center', fontFamily: 'Lora' } },
      { name: 'Garis Horizontal Atas', ...nodeBase('front-decoration'), transform: tfm(10,36,80,3), animation: fadeIn(400), kind: 'text', config: { text: '━━━━━━━━━━━━━━━', color: '#C5A880', fontSize: 10, align: 'center' } },
      { name: 'Foto Milestone', ...nodeBase('content'), transform: tfm(20,43,60,30), animation: fadeIn(800), kind: 'image', config: { src: LP, fit: 'cover' } },
      { name: 'Quote', ...nodeBase('content'), transform: tfm(10,76,80,12), animation: fadeIn(1000), kind: 'text', config: { text: '"Setiap tahun membawa kami lebih dekat,\nsetiap momen menguatkan cinta kami."', color: '#88735B', fontSize: 12, align: 'center', fontFamily: 'Lora', fontStyle: 'italic' } },
    ],
  },
];
