/**
 * HariKita Invitation Studio — Countdown Templates
 */
import type { SectionTemplate } from '../section-templates';
import { fadeIn, swayAnim, floatAnim, nodeBase, tfm } from './helpers';

export const COUNTDOWN_TEMPLATES: SectionTemplate[] = [
  {
    id: 'countdown-default',
    sectionId: 'countdown',
    name: 'Hitung Mundur Klasik',
    thumbnail: '⏳',
    description: 'Komponen countdown interaktif menuju hari pernikahan',
    nodes: [
      { name: 'Judul Countdown', ...nodeBase('content'), transform: tfm(10,5,80,8), animation: fadeIn(0), kind: 'text', config: { text: 'Menuju Hari Bahagia', color: '#4A2E35', fontSize: 20, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Ornamen Jam Pasir', ...nodeBase('front-decoration'), transform: tfm(40,14,20,10), animation: swayAnim(200), kind: 'text', config: { text: '⏳', color: '#C5A880', fontSize: 34, align: 'center' } },
      { name: 'Tanggal Target', ...nodeBase('content'), transform: tfm(10,26,80,6), animation: fadeIn(400), kind: 'text', config: { text: 'Sabtu, 14 Februari 2026', color: '#C5A880', fontSize: 13, align: 'center', fontFamily: 'Lora' } },
      { name: 'Blok Countdown', ...nodeBase('component'), transform: tfm(0,34,100,44), animation: fadeIn(600), kind: 'component', config: { component: 'countdown', variant: 'default', title: 'Countdown Timer' } },
      { name: 'Quote Motivasi', ...nodeBase('content'), transform: tfm(10,81,80,11), animation: fadeIn(800), kind: 'text', config: { text: '"Setiap detik adalah langkah menuju momen yang paling indah dalam hidup kami"', color: '#88735B', fontSize: 11, align: 'center', fontFamily: 'Lora', fontStyle: 'italic' } },
    ],
  },
  {
    id: 'countdown-elegant',
    sectionId: 'countdown',
    name: 'Hitung Mundur Elegan',
    thumbnail: '✨',
    description: 'Countdown dengan ornamen mewah dan nama couple',
    nodes: [
      { name: 'Ornamen Atas', ...nodeBase('front-decoration'), transform: tfm(30,3,40,6), animation: fadeIn(0), kind: 'text', config: { text: '✧ ─── ✧', color: '#C5A880', fontSize: 16, align: 'center' } },
      { name: 'Label Counting', ...nodeBase('content'), transform: tfm(10,11,80,6), animation: fadeIn(200), kind: 'text', config: { text: 'COUNTING DOWN TO', color: '#88735B', fontSize: 10, align: 'center', fontFamily: 'Syncopate', letterSpacing: 4 } },
      { name: 'Nama Couple', ...nodeBase('content'), transform: tfm(10,19,80,12), animation: fadeIn(400), kind: 'text', config: { text: 'Ananda & Bintang', color: '#4A2E35', fontSize: 34, align: 'center', fontFamily: 'Great Vibes' } },
      { name: 'Blok Countdown', ...nodeBase('component'), transform: tfm(0,34,100,42), animation: fadeIn(600), kind: 'component', config: { component: 'countdown', variant: 'default', title: 'Countdown Timer' } },
      { name: 'Detail Tanggal', ...nodeBase('content'), transform: tfm(10,79,80,10), animation: fadeIn(800), kind: 'text', config: { text: 'Sabtu, 14 Februari 2026\nGedung Serbaguna Wisma Praja, Kebumen', color: '#88735B', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
    ],
  },
  {
    id: 'countdown-hearts',
    sectionId: 'countdown',
    name: 'Hitung Mundur Hati',
    thumbnail: '💕',
    description: 'Countdown playful dengan ikon hati mengambang',
    nodes: [
      { name: 'Hati Kiri', ...nodeBase('front-decoration'), transform: tfm(8,8,15,10), animation: floatAnim(0), kind: 'text', config: { text: '💕', color: '#C5A880', fontSize: 32, align: 'center' } },
      { name: 'Hati Kanan', ...nodeBase('front-decoration'), transform: tfm(77,8,15,10), animation: floatAnim(500), kind: 'text', config: { text: '💕', color: '#C5A880', fontSize: 32, align: 'center' } },
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,6,80,8), animation: fadeIn(0), kind: 'text', config: { text: 'Menuju Hari Spesial', color: '#4A2E35', fontSize: 22, align: 'center', fontFamily: 'Great Vibes' } },
      { name: 'Blok Countdown', ...nodeBase('component'), transform: tfm(0,20,100,46), animation: fadeIn(400), kind: 'component', config: { component: 'countdown', variant: 'default', title: 'Countdown Timer' } },
      { name: 'Nama Couple', ...nodeBase('content'), transform: tfm(10,70,80,10), animation: fadeIn(600), kind: 'text', config: { text: 'Ananda & Bintang', color: '#C5A880', fontSize: 30, align: 'center', fontFamily: 'Allura' } },
      { name: 'Tanggal', ...nodeBase('content'), transform: tfm(15,82,70,8), animation: fadeIn(800), kind: 'text', config: { text: '14 Februari 2026', color: '#88735B', fontSize: 13, align: 'center', fontFamily: 'Lora' } },
    ],
  },
];
