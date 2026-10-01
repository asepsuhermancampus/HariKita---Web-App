/**
 * HariKita Invitation Studio — Gallery Templates
 */
import type { SectionTemplate } from '../section-templates';
import { fadeIn, nodeBase, tfm, PP, LP } from './helpers';

export const GALLERY_TEMPLATES: SectionTemplate[] = [
  {
    id: 'gallery-grid',
    sectionId: 'gallery',
    name: 'Galeri Foto Grid',
    thumbnail: '🖼️',
    description: 'Grid foto prewedding 2x3 yang elegan dan siap diganti',
    nodes: [
      { name: 'Judul Galeri', ...nodeBase('content'), transform: tfm(10,2,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Momen Bersama', color: '#4A2E35', fontSize: 22, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Sub-judul', ...nodeBase('content'), transform: tfm(15,9,70,5), animation: fadeIn(200), kind: 'text', config: { text: 'Kenangan Indah Pre-wedding Kami', color: '#88735B', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
      { name: 'Foto 1', ...nodeBase('content'), transform: tfm(2,15,46,24), animation: fadeIn(300), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Foto 2', ...nodeBase('content'), transform: tfm(52,15,46,24), animation: fadeIn(400), kind: 'image', config: { src: LP, fit: 'cover' } },
      { name: 'Foto 3', ...nodeBase('content'), transform: tfm(2,41,46,24), animation: fadeIn(500), kind: 'image', config: { src: LP, fit: 'cover' } },
      { name: 'Foto 4', ...nodeBase('content'), transform: tfm(52,41,46,24), animation: fadeIn(600), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Foto 5', ...nodeBase('content'), transform: tfm(2,67,46,24), animation: fadeIn(700), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Foto 6', ...nodeBase('content'), transform: tfm(52,67,46,24), animation: fadeIn(800), kind: 'image', config: { src: LP, fit: 'cover' } },
      { name: 'Caption Bawah', ...nodeBase('content'), transform: tfm(10,93,80,6), animation: fadeIn(1000), kind: 'text', config: { text: 'Setiap foto menyimpan cerita dan kenangan', color: '#C5A880', fontSize: 11, align: 'center', fontFamily: 'Lora', fontStyle: 'italic' } },
    ],
  },
  {
    id: 'gallery-masonry',
    sectionId: 'gallery',
    name: 'Masonry Fotos',
    thumbnail: '🧩',
    description: 'Layout masonry dengan foto ukuran bervariasi',
    nodes: [
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,2,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Our Gallery', color: '#4A2E35', fontSize: 26, align: 'center', fontFamily: 'Great Vibes' } },
      { name: 'Foto Besar Kiri', ...nodeBase('content'), transform: tfm(3,11,44,40), animation: fadeIn(200), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Foto Kecil Kanan Atas', ...nodeBase('content'), transform: tfm(50,11,47,19), animation: fadeIn(300), kind: 'image', config: { src: LP, fit: 'cover' } },
      { name: 'Foto Kecil Kanan Bawah', ...nodeBase('content'), transform: tfm(50,32,47,19), animation: fadeIn(400), kind: 'image', config: { src: LP, fit: 'cover' } },
      { name: 'Foto Wide', ...nodeBase('content'), transform: tfm(3,53,94,24), animation: fadeIn(500), kind: 'image', config: { src: LP, fit: 'cover' } },
      { name: 'Foto 3 Kolom 1', ...nodeBase('content'), transform: tfm(3,79,30,17), animation: fadeIn(600), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Foto 3 Kolom 2', ...nodeBase('content'), transform: tfm(35,79,30,17), animation: fadeIn(700), kind: 'image', config: { src: LP, fit: 'cover' } },
      { name: 'Foto 3 Kolom 3', ...nodeBase('content'), transform: tfm(67,79,30,17), animation: fadeIn(800), kind: 'image', config: { src: PP, fit: 'cover' } },
    ],
  },
  {
    id: 'gallery-carousel',
    sectionId: 'gallery',
    name: 'Carousel Foto',
    thumbnail: '🎞️',
    description: 'Galeri dengan 1 foto besar sebagai highlight',
    nodes: [
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,3,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Momen Terbaik', color: '#4A2E35', fontSize: 24, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Foto Highlight', ...nodeBase('content'), transform: tfm(10,13,80,45), animation: fadeIn(300), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Caption Highlight', ...nodeBase('content'), transform: tfm(10,60,80,6), animation: fadeIn(500), kind: 'text', config: { text: 'Momen paling berkesan dalam perjalanan kami', color: '#4A2E35', fontSize: 12, align: 'center', fontFamily: 'Lora', fontStyle: 'italic' } },
      { name: 'Foto Thumbnail 1', ...nodeBase('content'), transform: tfm(10,69,18,18), animation: fadeIn(600), kind: 'image', config: { src: LP, fit: 'cover' } },
      { name: 'Foto Thumbnail 2', ...nodeBase('content'), transform: tfm(31,69,18,18), animation: fadeIn(700), kind: 'image', config: { src: LP, fit: 'cover' } },
      { name: 'Foto Thumbnail 3', ...nodeBase('content'), transform: tfm(52,69,18,18), animation: fadeIn(800), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Foto Thumbnail 4', ...nodeBase('content'), transform: tfm(73,69,18,18), animation: fadeIn(900), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Blok Gallery', ...nodeBase('component'), transform: tfm(0,90,100,10), animation: fadeIn(1000), kind: 'component', config: { component: 'gallery', variant: 'default', title: 'Galeri Foto' } },
    ],
  },
  {
    id: 'gallery-polaroid-wall',
    sectionId: 'gallery',
    name: 'Polaroid Wall',
    thumbnail: '📌',
    description: 'Dinding polaroid dengan beragam sudut dan rotasi',
    nodes: [
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,3,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Polaroid Wall', color: '#4A2E35', fontSize: 24, align: 'center', fontFamily: 'Great Vibes' } },
      { name: 'Polaroid 1', ...nodeBase('content'), transform: tfm(5,13,26,24, -4), animation: fadeIn(200), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Polaroid 2', ...nodeBase('content'), transform: tfm(37,11,26,24, 3), animation: fadeIn(300), kind: 'image', config: { src: LP, fit: 'cover' } },
      { name: 'Polaroid 3', ...nodeBase('content'), transform: tfm(69,14,26,24, -3), animation: fadeIn(400), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Polaroid 4', ...nodeBase('content'), transform: tfm(5,42,26,24, 5), animation: fadeIn(500), kind: 'image', config: { src: LP, fit: 'cover' } },
      { name: 'Polaroid 5', ...nodeBase('content'), transform: tfm(37,40,26,24, -2), animation: fadeIn(600), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Polaroid 6', ...nodeBase('content'), transform: tfm(69,43,26,24, 4), animation: fadeIn(700), kind: 'image', config: { src: LP, fit: 'cover' } },
      { name: 'Polaroid 7', ...nodeBase('content'), transform: tfm(20,70,26,24, -3), animation: fadeIn(800), kind: 'image', config: { src: LP, fit: 'cover' } },
      { name: 'Polaroid 8', ...nodeBase('content'), transform: tfm(53,68,26,24, 3), animation: fadeIn(900), kind: 'image', config: { src: PP, fit: 'cover' } },
    ],
  },
];
