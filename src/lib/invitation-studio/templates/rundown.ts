/**
 * HariKita Invitation Studio — Rundown Templates
 */
import type { SectionTemplate } from '../section-templates';
import { fadeIn, nodeBase, tfm } from './helpers';

export const RUNDOWN_TEMPLATES: SectionTemplate[] = [
  {
    id: 'rundown-default',
    sectionId: 'rundown',
    name: 'Susunan Acara',
    thumbnail: '📋',
    description: 'Rundown lengkap acara pernikahan dengan timeline',
    nodes: [
      { name: 'Judul Rundown', ...nodeBase('content'), transform: tfm(10,3,80,8), animation: fadeIn(0), kind: 'text', config: { text: 'Susunan Acara', color: '#4A2E35', fontSize: 24, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Sub-judul', ...nodeBase('content'), transform: tfm(15,12,70,6), animation: fadeIn(200), kind: 'text', config: { text: 'Rangkaian acara pernikahan kami', color: '#88735B', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
      { name: 'Blok Rundown', ...nodeBase('component'), transform: tfm(0,22,100,68), animation: fadeIn(400), kind: 'component', config: { component: 'rundown', variant: 'default', title: 'Susunan Acara' } },
      { name: 'Catatan', ...nodeBase('content'), transform: tfm(10,92,80,6), animation: fadeIn(600), kind: 'text', config: { text: '* Jadwal dapat berubah sesuai kondisi di lapangan', color: '#88735B', fontSize: 10, align: 'center', fontFamily: 'Lora', fontStyle: 'italic' } },
    ],
  },
  {
    id: 'rundown-simple-timeline',
    sectionId: 'rundown',
    name: 'Timeline Sederhana',
    thumbnail: '⏰',
    description: 'Rundown ringkas dengan 5 kegiatan utama',
    nodes: [
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,3,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Timeline Hari Bahagia', color: '#4A2E35', fontSize: 22, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Waktu 1', ...nodeBase('content'), transform: tfm(5,13,20,5), animation: fadeIn(200), kind: 'text', config: { text: '08.00', color: '#C5A880', fontSize: 13, align: 'right', fontFamily: 'Cinzel' } },
      { name: 'Kegiatan 1', ...nodeBase('content'), transform: tfm(28,13,67,5), animation: fadeIn(300), kind: 'text', config: { text: 'Prosesi Akad Nikah', color: '#4A2E35', fontSize: 12, align: 'left', fontFamily: 'Lora' } },
      { name: 'Waktu 2', ...nodeBase('content'), transform: tfm(5,26,20,5), animation: fadeIn(400), kind: 'text', config: { text: '10.00', color: '#C5A880', fontSize: 13, align: 'right', fontFamily: 'Cinzel' } },
      { name: 'Kegiatan 2', ...nodeBase('content'), transform: tfm(28,26,67,5), animation: fadeIn(500), kind: 'text', config: { text: 'Penyambutan Tamu', color: '#4A2E35', fontSize: 12, align: 'left', fontFamily: 'Lora' } },
      { name: 'Waktu 3', ...nodeBase('content'), transform: tfm(5,39,20,5), animation: fadeIn(600), kind: 'text', config: { text: '11.00', color: '#C5A880', fontSize: 13, align: 'right', fontFamily: 'Cinzel' } },
      { name: 'Kegiatan 3', ...nodeBase('content'), transform: tfm(28,39,67,5), animation: fadeIn(700), kind: 'text', config: { text: 'Prosesi Adat & Sungkeman', color: '#4A2E35', fontSize: 12, align: 'left', fontFamily: 'Lora' } },
      { name: 'Waktu 4', ...nodeBase('content'), transform: tfm(5,52,20,5), animation: fadeIn(800), kind: 'text', config: { text: '12.00', color: '#C5A880', fontSize: 13, align: 'right', fontFamily: 'Cinzel' } },
      { name: 'Kegiatan 4', ...nodeBase('content'), transform: tfm(28,52,67,5), animation: fadeIn(900), kind: 'text', config: { text: 'Makan Siang Bersama', color: '#4A2E35', fontSize: 12, align: 'left', fontFamily: 'Lora' } },
      { name: 'Waktu 5', ...nodeBase('content'), transform: tfm(5,65,20,5), animation: fadeIn(1000), kind: 'text', config: { text: '14.00', color: '#C5A880', fontSize: 13, align: 'right', fontFamily: 'Cinzel' } },
      { name: 'Kegiatan 5', ...nodeBase('content'), transform: tfm(28,65,67,5), animation: fadeIn(1100), kind: 'text', config: { text: 'Sesi Foto & Penutup', color: '#4A2E35', fontSize: 12, align: 'left', fontFamily: 'Lora' } },
      { name: 'Blok Rundown', ...nodeBase('component'), transform: tfm(0,73,100,25), animation: fadeIn(1200), kind: 'component', config: { component: 'rundown', variant: 'default', title: 'Susunan Acara' } },
    ],
  },
  {
    id: 'rundown-dua-hari',
    sectionId: 'rundown',
    name: 'Acara Dua Hari',
    thumbnail: '🗓️',
    description: 'Rundown untuk acara yang berlangsung dua hari (akad & resepsi terpisah)',
    nodes: [
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,2,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Rangkaian Acara', color: '#4A2E35', fontSize: 22, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Hari 1 Label', ...nodeBase('content'), transform: tfm(10,11,80,6), animation: fadeIn(200), kind: 'text', config: { text: '📅 JUMAT, 13 FEBRUARI 2026', color: '#C5A880', fontSize: 13, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Hari 1 Detail', ...nodeBase('content'), transform: tfm(10,18,80,14), animation: fadeIn(300), kind: 'text', config: { text: '14.00 — Prosesi Lamaran\n16.00 — Ramah Tamah\n19.00 — Makan Malam Bersama', color: '#4A2E35', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
      { name: 'Divider', ...nodeBase('front-decoration'), transform: tfm(30,34,40,4), animation: fadeIn(400), kind: 'text', config: { text: '━━━ ✦ ━━━', color: '#C5A880', fontSize: 14, align: 'center' } },
      { name: 'Hari 2 Label', ...nodeBase('content'), transform: tfm(10,41,80,6), animation: fadeIn(500), kind: 'text', config: { text: '📅 SABTU, 14 FEBRUARI 2026', color: '#C5A880', fontSize: 13, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Hari 2 Detail', ...nodeBase('content'), transform: tfm(10,48,80,16), animation: fadeIn(600), kind: 'text', config: { text: '08.00 — Akad Nikah\n10.00 — Resepsi \n12.00 — Makan Siang\n14.00 — Sesi Foto Bersama', color: '#4A2E35', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
      { name: 'Blok Rundown', ...nodeBase('component'), transform: tfm(0,66,100,32), animation: fadeIn(800), kind: 'component', config: { component: 'rundown', variant: 'default', title: 'Susunan Acara' } },
    ],
  },
];
