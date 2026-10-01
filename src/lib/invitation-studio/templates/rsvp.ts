/**
 * HariKita Invitation Studio — RSVP Templates
 */
import type { SectionTemplate } from '../section-templates';
import { fadeIn, nodeBase, tfm } from './helpers';

export const RSVP_TEMPLATES: SectionTemplate[] = [
  {
    id: 'rsvp-form',
    sectionId: 'rsvp',
    name: 'Form Konfirmasi',
    thumbnail: '✉️',
    description: 'Form RSVP interaktif untuk konfirmasi kehadiran',
    nodes: [
      { name: 'Judul RSVP', ...nodeBase('content'), transform: tfm(10,3,80,8), animation: fadeIn(0), kind: 'text', config: { text: 'Konfirmasi Kehadiran', color: '#4A2E35', fontSize: 22, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Deskripsi', ...nodeBase('content'), transform: tfm(10,12,80,10), animation: fadeIn(200), kind: 'text', config: { text: 'Merupakan kebahagiaan bagi kami apabila\nBapak/Ibu/Saudara/i dapat hadir di acara kami.', color: '#88735B', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
      { name: 'Blok RSVP', ...nodeBase('component'), transform: tfm(0,25,100,60), animation: fadeIn(400), kind: 'component', config: { component: 'rsvp', variant: 'default', title: 'Form RSVP' } },
      { name: 'Catatan', ...nodeBase('content'), transform: tfm(10,87,80,8), animation: fadeIn(600), kind: 'text', config: { text: 'Mohon konfirmasi kehadiran Anda sebelum tanggal 7 Februari 2026', color: '#88735B', fontSize: 10, align: 'center', fontFamily: 'Lora', fontStyle: 'italic' } },
    ],
  },
  {
    id: 'rsvp-elegant-card',
    sectionId: 'rsvp',
    name: 'Kartu RSVP Elegan',
    thumbnail: '💌',
    description: 'RSVP dengan kartu undangan elegan dan deadline jelas',
    nodes: [
      { name: 'Ornamen', ...nodeBase('front-decoration'), transform: tfm(30,3,40,6), animation: fadeIn(0), kind: 'text', config: { text: '✉ ❋ ✉', color: '#C5A880', fontSize: 18, align: 'center' } },
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,12,80,8), animation: fadeIn(200), kind: 'text', config: { text: 'RSVP', color: '#4A2E35', fontSize: 30, align: 'center', fontFamily: 'Cinzel', letterSpacing: 6 } },
      { name: 'Sub-judul', ...nodeBase('content'), transform: tfm(10,22,80,10), animation: fadeIn(400), kind: 'text', config: { text: 'Kami ingin memastikan tempat duduk Anda.\nSilakan konfirmasi kehadiran melalui form di bawah ini.', color: '#88735B', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
      { name: 'Blok RSVP', ...nodeBase('component'), transform: tfm(0,35,100,50), animation: fadeIn(600), kind: 'component', config: { component: 'rsvp', variant: 'default', title: 'Form RSVP' } },
      { name: 'Deadline', ...nodeBase('content'), transform: tfm(10,88,80,8), animation: fadeIn(800), kind: 'text', config: { text: '⏰ Konfirmasi sebelum 7 Februari 2026', color: '#C5A880', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
    ],
  },
  {
    id: 'rsvp-minimal',
    sectionId: 'rsvp',
    name: 'RSVP Minimalis',
    thumbnail: '✅',
    description: 'Form RSVP ringkas tanpa dekorasi berlebih',
    nodes: [
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,8,80,8), animation: fadeIn(0), kind: 'text', config: { text: 'Akan Hadir?', color: '#4A2E35', fontSize: 26, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Deskripsi', ...nodeBase('content'), transform: tfm(15,19,70,12), animation: fadeIn(200), kind: 'text', config: { text: 'Bantu kami mempersiapkan acara yang lebih baik\ndengan mengisi konfirmasi kehadiran Anda.', color: '#88735B', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
      { name: 'Blok RSVP', ...nodeBase('component'), transform: tfm(0,34,100,58), animation: fadeIn(400), kind: 'component', config: { component: 'rsvp', variant: 'default', title: 'Form RSVP' } },
      { name: 'Terima Kasih', ...nodeBase('content'), transform: tfm(10,93,80,5), animation: fadeIn(600), kind: 'text', config: { text: 'Terima kasih atas perhatiannya 🙏', color: '#C5A880', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
    ],
  },
];
