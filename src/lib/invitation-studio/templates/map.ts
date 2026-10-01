/**
 * HariKita Invitation Studio — Map Templates
 */
import type { SectionTemplate } from '../section-templates';
import { fadeIn, nodeBase, tfm, VP, LP } from './helpers';

export const MAP_TEMPLATES: SectionTemplate[] = [
  {
    id: 'map-default',
    sectionId: 'map',
    name: 'Peta Lokasi Acara',
    thumbnail: '📍',
    description: 'Foto venue + alamat + blok peta interaktif',
    nodes: [
      { name: 'Judul Lokasi', ...nodeBase('content'), transform: tfm(10,2,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Lokasi Acara', color: '#4A2E35', fontSize: 22, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Foto Venue', ...nodeBase('content'), transform: tfm(5,10,90,34), animation: fadeIn(200), kind: 'image', config: { src: VP, fit: 'cover' } },
      { name: 'Nama Venue', ...nodeBase('content'), transform: tfm(10,46,80,7), animation: fadeIn(400), kind: 'text', config: { text: 'Gedung Serbaguna Wisma Praja', color: '#4A2E35', fontSize: 16, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Alamat Lengkap', ...nodeBase('content'), transform: tfm(10,54,80,10), animation: fadeIn(500), kind: 'text', config: { text: 'Jl. Pahlawan No. 45, Kebumen\nKabupaten Kebumen, Jawa Tengah 54311', color: '#88735B', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
      { name: 'Blok Peta Interaktif', ...nodeBase('component'), transform: tfm(0,66,100,34), animation: fadeIn(600), kind: 'component', config: { component: 'map', variant: 'default', title: 'Peta Interaktif' } },
    ],
  },
  {
    id: 'map-multi-venue',
    sectionId: 'map',
    name: 'Multi Venue',
    thumbnail: '🗺️',
    description: 'Dua lokasi berbeda: akad dan resepsi',
    nodes: [
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,2,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Lokasi & Venue', color: '#4A2E35', fontSize: 22, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Label Akad', ...nodeBase('content'), transform: tfm(5,11,42,5), animation: fadeIn(200), kind: 'text', config: { text: '📍 Akad Nikah', color: '#C5A880', fontSize: 13, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Foto Akad', ...nodeBase('content'), transform: tfm(5,17,42,24), animation: fadeIn(300), kind: 'image', config: { src: VP, fit: 'cover' } },
      { name: 'Detail Akad', ...nodeBase('content'), transform: tfm(5,42,42,10), animation: fadeIn(400), kind: 'text', config: { text: 'Masjid Al-Falah\nJl. Pahlawan No. 12, Kebumen\n08.00 WIB', color: '#4A2E35', fontSize: 10, align: 'center', fontFamily: 'Lora' } },
      { name: 'Label Resepsi', ...nodeBase('content'), transform: tfm(53,11,42,5), animation: fadeIn(200), kind: 'text', config: { text: '📍 Resepsi', color: '#C5A880', fontSize: 13, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Foto Resepsi', ...nodeBase('content'), transform: tfm(53,17,42,24), animation: fadeIn(300), kind: 'image', config: { src: LP, fit: 'cover' } },
      { name: 'Detail Resepsi', ...nodeBase('content'), transform: tfm(53,42,42,10), animation: fadeIn(400), kind: 'text', config: { text: 'Gedung Wisma Praja\nJl. Pahlawan No. 45, Kebumen\n10.00 – 14.00 WIB', color: '#4A2E35', fontSize: 10, align: 'center', fontFamily: 'Lora' } },
      { name: 'Blok Peta', ...nodeBase('component'), transform: tfm(0,55,100,45), animation: fadeIn(600), kind: 'component', config: { component: 'map', variant: 'default', title: 'Peta Interaktif' } },
    ],
  },
  {
    id: 'map-simple-address',
    sectionId: 'map',
    name: 'Alamat Sederhana',
    thumbnail: '🏛️',
    description: 'Alamat lengkap tanpa foto venue, fokus ke peta',
    nodes: [
      { name: 'Ornamen Atas', ...nodeBase('front-decoration'), transform: tfm(35,4,30,6), animation: fadeIn(0), kind: 'text', config: { text: '✧ 📍 ✧', color: '#C5A880', fontSize: 17, align: 'center' } },
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,13,80,7), animation: fadeIn(200), kind: 'text', config: { text: 'Temukan Kami Di', color: '#4A2E35', fontSize: 24, align: 'center', fontFamily: 'Great Vibes' } },
      { name: 'Nama Venue', ...nodeBase('content'), transform: tfm(10,23,80,6), animation: fadeIn(400), kind: 'text', config: { text: 'Gedung Serbaguna Wisma Praja', color: '#C5A880', fontSize: 16, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Alamat', ...nodeBase('content'), transform: tfm(10,31,80,12), animation: fadeIn(600), kind: 'text', config: { text: 'Jl. Pahlawan No. 45\nKel. Kebumen, Kec. Kebumen\nKabupaten Kebumen, Jawa Tengah 54311', color: '#4A2E35', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
      { name: 'Blok Peta', ...nodeBase('component'), transform: tfm(0,46,100,54), animation: fadeIn(800), kind: 'component', config: { component: 'map', variant: 'default', title: 'Peta Interaktif' } },
    ],
  },
];
