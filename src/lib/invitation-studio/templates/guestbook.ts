/**
 * HariKita Invitation Studio — Guestbook Templates
 */
import type { SectionTemplate } from '../section-templates';
import { fadeIn, nodeBase, tfm } from './helpers';

export const GUESTBOOK_TEMPLATES: SectionTemplate[] = [
  {
    id: 'guestbook-default',
    sectionId: 'guestbook',
    name: 'Buku Tamu Klasik',
    thumbnail: '📖',
    description: 'Ucapan dan doa dari tamu undangan',
    nodes: [
      { name: 'Judul Guestbook', ...nodeBase('content'), transform: tfm(10,3,80,8), animation: fadeIn(0), kind: 'text', config: { text: 'Ucapan & Doa', color: '#4A2E35', fontSize: 24, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Deskripsi', ...nodeBase('content'), transform: tfm(10,12,80,8), animation: fadeIn(200), kind: 'text', config: { text: 'Tinggalkan pesan, doa, dan ucapan terbaik Anda\nuntuk kedua mempelai', color: '#88735B', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
      { name: 'Blok Guestbook', ...nodeBase('component'), transform: tfm(0,24,100,64), animation: fadeIn(400), kind: 'component', config: { component: 'guestbook', variant: 'default', title: 'Buku Tamu' } },
      { name: 'Footer', ...nodeBase('content'), transform: tfm(10,90,80,6), animation: fadeIn(600), kind: 'text', config: { text: 'Terima kasih untuk setiap doa yang tulus 💕', color: '#C5A880', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
    ],
  },
  {
    id: 'guestbook-hearts',
    sectionId: 'guestbook',
    name: 'Ucapan Cinta',
    thumbnail: '💝',
    description: 'Guestbook dengan tema hati dan warna hangat',
    nodes: [
      { name: 'Ornamen Hati Atas', ...nodeBase('front-decoration'), transform: tfm(40,3,20,7), animation: fadeIn(0), kind: 'text', config: { text: '💌', color: '#C5A880', fontSize: 30, align: 'center' } },
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,11,80,8), animation: fadeIn(200), kind: 'text', config: { text: 'Kirim Ucapan', color: '#4A2E35', fontSize: 26, align: 'center', fontFamily: 'Great Vibes' } },
      { name: 'Sub-judul', ...nodeBase('content'), transform: tfm(15,21,70,8), animation: fadeIn(400), kind: 'text', config: { text: 'Doa terbaik Anda sangat berarti bagi kami', color: '#88735B', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
      { name: 'Blok Guestbook', ...nodeBase('component'), transform: tfm(0,32,100,58), animation: fadeIn(600), kind: 'component', config: { component: 'guestbook', variant: 'default', title: 'Buku Tamu' } },
      { name: 'Balasan', ...nodeBase('content'), transform: tfm(10,92,80,5), animation: fadeIn(800), kind: 'text', config: { text: '🤍 Ananda & Bintang', color: '#C5A880', fontSize: 12, align: 'center', fontFamily: 'Allura' } },
    ],
  },
  {
    id: 'guestbook-with-photo',
    sectionId: 'guestbook',
    name: 'Guestbook + Foto',
    thumbnail: '🖼️',
    description: 'Guestbook dengan foto couple di bagian atas',
    nodes: [
      { name: 'Foto Couple', ...nodeBase('content'), transform: tfm(30,4,40,20), animation: fadeIn(0), kind: 'image', config: { src: '/assets/harikita/placeholders/photo-circle.svg', fit: 'cover' } },
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,26,80,7), animation: fadeIn(200), kind: 'text', config: { text: 'Tinggalkan Pesan', color: '#4A2E35', fontSize: 22, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Blok Guestbook', ...nodeBase('component'), transform: tfm(0,35,100,58), animation: fadeIn(400), kind: 'component', config: { component: 'guestbook', variant: 'default', title: 'Buku Tamu' } },
      { name: 'Footer', ...nodeBase('content'), transform: tfm(10,94,80,5), animation: fadeIn(600), kind: 'text', config: { text: 'Setiap ucapan adalah hadiah terindah 🙏', color: '#88735B', fontSize: 10, align: 'center', fontFamily: 'Lora', fontStyle: 'italic' } },
    ],
  },
];
