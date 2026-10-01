/**
 * HariKita Invitation Studio — Events Templates
 * 
 * Template untuk section events: akad, resepsi, lamaran, tasyakuran.
 */
import type { SectionTemplate } from '../section-templates';
import { fadeIn, floatAnim, nodeBase, tfm } from './helpers';

export const EVENTS_TEMPLATES: SectionTemplate[] = [
  {
    id: 'events-two',
    sectionId: 'events',
    name: 'Akad & Resepsi',
    thumbnail: '🎊',
    description: 'Dua kartu acara lengkap: Akad Nikah & Resepsi Pernikahan',
    nodes: [
      { name: 'Judul Acara', ...nodeBase('content'), transform: tfm(10,2,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Rangkaian Acara', color: '#4A2E35', fontSize: 22, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Ikon Akad', ...nodeBase('front-decoration'), transform: tfm(40,10,20,8), animation: floatAnim(200), kind: 'text', config: { text: '💍', color: '#C5A880', fontSize: 28, align: 'center' } },
      { name: 'Label Akad Nikah', ...nodeBase('content'), transform: tfm(10,19,80,6), animation: fadeIn(300), kind: 'text', config: { text: 'Akad Nikah', color: '#C5A880', fontSize: 18, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Tanggal Akad', ...nodeBase('content'), transform: tfm(10,26,80,6), animation: fadeIn(400), kind: 'text', config: { text: 'Sabtu, 14 Februari 2026', color: '#4A2E35', fontSize: 14, align: 'center', fontFamily: 'Lora' } },
      { name: 'Waktu Akad', ...nodeBase('content'), transform: tfm(15,33,70,5), animation: fadeIn(500), kind: 'text', config: { text: '08.00 WIB – Selesai', color: '#88735B', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
      { name: 'Lokasi Akad', ...nodeBase('content'), transform: tfm(10,39,80,9), animation: fadeIn(600), kind: 'text', config: { text: '📍 Masjid Al-Falah\nJl. Pahlawan No. 12, Kebumen', color: '#4A2E35', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
      { name: 'Pemisah', ...nodeBase('front-decoration'), transform: tfm(25,50,50,3), animation: fadeIn(600), kind: 'text', config: { text: '• • •', color: '#C5A880', fontSize: 14, align: 'center' } },
      { name: 'Ikon Resepsi', ...nodeBase('front-decoration'), transform: tfm(40,54,20,8), animation: floatAnim(400), kind: 'text', config: { text: '🎊', color: '#C5A880', fontSize: 28, align: 'center' } },
      { name: 'Label Resepsi', ...nodeBase('content'), transform: tfm(10,63,80,6), animation: fadeIn(500), kind: 'text', config: { text: 'Resepsi Pernikahan', color: '#C5A880', fontSize: 18, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Tanggal Resepsi', ...nodeBase('content'), transform: tfm(10,70,80,6), animation: fadeIn(600), kind: 'text', config: { text: 'Sabtu, 14 Februari 2026', color: '#4A2E35', fontSize: 14, align: 'center', fontFamily: 'Lora' } },
      { name: 'Waktu Resepsi', ...nodeBase('content'), transform: tfm(15,77,70,5), animation: fadeIn(700), kind: 'text', config: { text: '10.00 – 14.00 WIB', color: '#88735B', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
      { name: 'Lokasi Resepsi', ...nodeBase('content'), transform: tfm(10,83,80,10), animation: fadeIn(800), kind: 'text', config: { text: '📍 Gedung Serbaguna Wisma Praja\nJl. Pahlawan No. 45, Kebumen, Jawa Tengah', color: '#4A2E35', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
      { name: 'Blok Event Interaktif', ...nodeBase('component'), transform: tfm(0,94,100,6), animation: fadeIn(1000), kind: 'component', config: { component: 'events', variant: 'default', title: 'Detail Acara' } },
    ],
  },
  {
    id: 'events-lamaran',
    sectionId: 'events',
    name: 'Lamaran & Akad',
    thumbnail: '💐',
    description: 'Tiga acara berurutan: Lamaran, Akad Nikah, dan Tasyakuran',
    nodes: [
      { name: 'Judul Section', ...nodeBase('content'), transform: tfm(10,2,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Jadwal Rangkaian Acara', color: '#4A2E35', fontSize: 20, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Lamaran Label', ...nodeBase('content'), transform: tfm(10,11,80,6), animation: fadeIn(200), kind: 'text', config: { text: '💐 Prosesi Lamaran', color: '#C5A880', fontSize: 15, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Lamaran Detail', ...nodeBase('content'), transform: tfm(10,18,80,10), animation: fadeIn(300), kind: 'text', config: { text: "Jum'at, 13 Februari 2026 · 14.00 WIB\nKediaman Keluarga Wanita\nJl. Melati No. 5, Kebumen", color: '#4A2E35', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
      { name: 'Pemisah 1', ...nodeBase('front-decoration'), transform: tfm(35,29,30,3), animation: fadeIn(350), kind: 'text', config: { text: '· · ·', color: '#C5A880', fontSize: 15, align: 'center' } },
      { name: 'Akad Label', ...nodeBase('content'), transform: tfm(10,33,80,6), animation: fadeIn(400), kind: 'text', config: { text: '💍 Akad Nikah', color: '#C5A880', fontSize: 15, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Akad Detail', ...nodeBase('content'), transform: tfm(10,40,80,10), animation: fadeIn(500), kind: 'text', config: { text: 'Sabtu, 14 Februari 2026 · 08.00 WIB\nMasjid Al-Falah\nJl. Pahlawan No. 12, Kebumen', color: '#4A2E35', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
      { name: 'Pemisah 2', ...nodeBase('front-decoration'), transform: tfm(35,51,30,3), animation: fadeIn(550), kind: 'text', config: { text: '· · ·', color: '#C5A880', fontSize: 15, align: 'center' } },
      { name: 'Resepsi Label', ...nodeBase('content'), transform: tfm(10,55,80,6), animation: fadeIn(600), kind: 'text', config: { text: '🎊 Resepsi & Tasyakuran', color: '#C5A880', fontSize: 15, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Resepsi Detail', ...nodeBase('content'), transform: tfm(10,62,80,10), animation: fadeIn(700), kind: 'text', config: { text: 'Sabtu, 14 Februari 2026 · 10.00 – 14.00 WIB\nGedung Serbaguna Wisma Praja\nJl. Pahlawan No. 45, Kebumen', color: '#4A2E35', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
      { name: 'Catatan Dress Code', ...nodeBase('content'), transform: tfm(10,74,80,8), animation: fadeIn(800), kind: 'text', config: { text: '✨ Dress Code: Pastel & Formal\nKami sangat mengharapkan kehadiran Bapak/Ibu/Saudara/i', color: '#88735B', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
    ],
  },
  {
    id: 'events-resepsi-only',
    sectionId: 'events',
    name: 'Resepsi Saja',
    thumbnail: '🥂',
    description: 'Template ringkas untuk acara resepsi tanpa detail akad',
    nodes: [
      { name: 'Ornamen Atas', ...nodeBase('front-decoration'), transform: tfm(35,6,30,6), animation: fadeIn(0), kind: 'text', config: { text: '✧ ✦ ✧', color: '#C5A880', fontSize: 17, align: 'center' } },
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,15,80,8), animation: fadeIn(200), kind: 'text', config: { text: 'Resepsi Pernikahan', color: '#4A2E35', fontSize: 24, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Nama Couple', ...nodeBase('content'), transform: tfm(10,25,80,10), animation: fadeIn(400), kind: 'text', config: { text: 'Ananda & Bintang', color: '#C5A880', fontSize: 28, align: 'center', fontFamily: 'Great Vibes' } },
      { name: 'Hari & Tanggal', ...nodeBase('content'), transform: tfm(10,38,80,8), animation: fadeIn(600), kind: 'text', config: { text: 'Sabtu, 14 Februari 2026\n10.00 – 14.00 WIB', color: '#4A2E35', fontSize: 15, align: 'center', fontFamily: 'Lora' } },
      { name: 'Lokasi', ...nodeBase('content'), transform: tfm(10,48,80,12), animation: fadeIn(800), kind: 'text', config: { text: '📍 Gedung Serbaguna Wisma Praja\nJl. Pahlawan No. 45\nKebumen, Jawa Tengah', color: '#4A2E35', fontSize: 13, align: 'center', fontFamily: 'Lora' } },
      { name: 'Pesan', ...nodeBase('content'), transform: tfm(10,63,80,10), animation: fadeIn(1000), kind: 'text', config: { text: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami\napabila Bapak/Ibu/Saudara/i berkenan hadir', color: '#88735B', fontSize: 11, align: 'center', fontFamily: 'Lora', fontStyle: 'italic' } },
      { name: 'Blok Event', ...nodeBase('component'), transform: tfm(0,76,100,24), animation: fadeIn(1200), kind: 'component', config: { component: 'events', variant: 'default', title: 'Detail Acara' } },
    ],
  },
  {
    id: 'events-countdown-heavy',
    sectionId: 'events',
    name: 'Acara + Countdown',
    thumbnail: '⏱️',
    description: 'Detail acara dengan countdown timer dan tombol save-the-date',
    nodes: [
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,3,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Save The Date', color: '#4A2E35', fontSize: 26, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Tanggal Besar', ...nodeBase('front-decoration'), transform: tfm(10,12,80,10), animation: fadeIn(200), kind: 'text', config: { text: '14 . 02 . 2026', color: '#C5A880', fontSize: 32, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Countdown', ...nodeBase('component'), transform: tfm(0,25,100,35), animation: fadeIn(400), kind: 'component', config: { component: 'countdown', variant: 'default', title: 'Countdown Timer' } },
      { name: 'Detail Acara', ...nodeBase('content'), transform: tfm(10,62,80,14), animation: fadeIn(600), kind: 'text', config: { text: 'Akad Nikah — 08.00 WIB\nResepsi — 10.00 – 14.00 WIB\nGedung Serbaguna Wisma Praja, Kebumen', color: '#4A2E35', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
      { name: 'Blok Event', ...nodeBase('component'), transform: tfm(0,78,100,22), animation: fadeIn(800), kind: 'component', config: { component: 'events', variant: 'default', title: 'Detail Acara' } },
    ],
  },
];
