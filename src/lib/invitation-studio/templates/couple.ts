/**
 * HariKita Invitation Studio — Couple Templates
 * 
 * Template untuk section couple: profil mempelai, foto, dan silsilah keluarga.
 */
import type { SectionTemplate } from '../section-templates';
import { fadeIn, floatAnim, staticAnim, nodeBase, tfm, PP, LP, CP, PLP } from './helpers';

export const COUPLE_TEMPLATES: SectionTemplate[] = [
  {
    id: 'couple-classic',
    sectionId: 'couple',
    name: 'Profil Couple Klasik',
    thumbnail: '👫',
    description: 'Dua profil berdampingan dengan foto, nama, dan silsilah orang tua',
    nodes: [
      { name: 'Judul Section', ...nodeBase('content'), transform: tfm(10,3,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Mempelai Kami', color: '#4A2E35', fontSize: 24, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Garis Emas', ...nodeBase('front-decoration'), transform: tfm(35,10,30,3), animation: fadeIn(200), kind: 'text', config: { text: '─── ✦ ───', color: '#C5A880', fontSize: 12, align: 'center' } },
      { name: 'Foto Mempelai Wanita', ...nodeBase('content'), transform: tfm(5,15,40,34), animation: fadeIn(300), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Nama Wanita', ...nodeBase('content'), transform: tfm(5,50,40,7), animation: fadeIn(400), kind: 'text', config: { text: 'Raisya Putri Andini', color: '#4A2E35', fontSize: 15, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Putri dari', ...nodeBase('content'), transform: tfm(5,57,40,12), animation: fadeIn(500), kind: 'text', config: { text: 'Putri dari:\nBpk. H. Andika Putra\n& Ibu Hj. Sri Lestari', color: '#88735B', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
      { name: 'Simbol Cinta', ...nodeBase('front-decoration'), transform: tfm(43,27,14,12), animation: floatAnim(600), kind: 'text', config: { text: '♥', color: '#C5A880', fontSize: 34, align: 'center' } },
      { name: 'Foto Mempelai Pria', ...nodeBase('content'), transform: tfm(55,15,40,34), animation: fadeIn(300), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Nama Pria', ...nodeBase('content'), transform: tfm(55,50,40,7), animation: fadeIn(400), kind: 'text', config: { text: 'Daffa Pratama Putra', color: '#4A2E35', fontSize: 15, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Putra dari', ...nodeBase('content'), transform: tfm(55,57,40,12), animation: fadeIn(500), kind: 'text', config: { text: 'Putra dari:\nBpk. H. Pratama Wibowo\n& Ibu Hj. Dewi Kusuma', color: '#88735B', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
      { name: 'Blok Data Couple', ...nodeBase('component'), transform: tfm(0,71,100,29), animation: fadeIn(600), kind: 'component', config: { component: 'couple', variant: 'default', title: 'Data Couple' } },
    ],
  },
  {
    id: 'couple-stacked',
    sectionId: 'couple',
    name: 'Profil Bertumpuk',
    thumbnail: '💑',
    description: 'Satu foto bersama besar dengan bio lengkap di bawahnya',
    nodes: [
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,2,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Yang Berbahagia', color: '#4A2E35', fontSize: 22, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Foto Couple Bersama', ...nodeBase('content'), transform: tfm(15,10,70,36), animation: fadeIn(200), kind: 'image', config: { src: LP, fit: 'cover' } },
      { name: 'Nama Lengkap', ...nodeBase('content'), transform: tfm(5,48,90,12), animation: fadeIn(400), kind: 'text', config: { text: 'Raisya Putri Andini, S.Kep\n&\nDaffa Pratama Putra, S.T.', color: '#4A2E35', fontSize: 17, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Data Orang Tua Wanita', ...nodeBase('content'), transform: tfm(5,62,44,16), animation: fadeIn(500), kind: 'text', config: { text: 'Putri ke-1 dari:\nBpk. H. Andika Putra\n& Ibu Hj. Sri Lestari', color: '#88735B', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
      { name: 'Data Orang Tua Pria', ...nodeBase('content'), transform: tfm(51,62,44,16), animation: fadeIn(500), kind: 'text', config: { text: 'Putra ke-2 dari:\nBpk. H. Pratama W.\n& Ibu Hj. Dewi Kusuma', color: '#88735B', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
    ],
  },
  {
    id: 'couple-circle-frame',
    sectionId: 'couple',
    name: 'Circle Photo Frame',
    thumbnail: '⭕',
    description: 'Foto mempelai dalam frame lingkaran elegan',
    nodes: [
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,5,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Pengantin Kami', color: '#4A2E35', fontSize: 24, align: 'center', fontFamily: 'Great Vibes' } },
      { name: 'Divider', ...nodeBase('front-decoration'), transform: tfm(30,13,40,4), animation: fadeIn(200), kind: 'text', config: { text: '✧ ❀ ✧', color: '#C5A880', fontSize: 16, align: 'center' } },
      
      { name: 'Foto Circle Wanita', ...nodeBase('content'), transform: tfm(8,20,38,32), animation: fadeIn(400), kind: 'image', config: { src: CP, fit: 'cover' } },
      { name: 'Nama Wanita', ...nodeBase('content'), transform: tfm(8,53,38,6), animation: fadeIn(600), kind: 'text', config: { text: 'Raisya Putri Andini', color: '#4A2E35', fontSize: 14, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Bio Wanita', ...nodeBase('content'), transform: tfm(8,60,38,10), animation: fadeIn(700), kind: 'text', config: { text: 'Putri dari:\nBpk. H. Andika Putra\n& Ibu Hj. Sri Lestari', color: '#88735B', fontSize: 10, align: 'center', fontFamily: 'Lora' } },
      
      { name: 'Simbol Dan Tengah', ...nodeBase('front-decoration'), transform: tfm(43,32,14,12), animation: floatAnim(800), kind: 'text', config: { text: '&', color: '#C5A880', fontSize: 42, align: 'center', fontFamily: 'Allura' } },
      
      { name: 'Foto Circle Pria', ...nodeBase('content'), transform: tfm(54,20,38,32), animation: fadeIn(400), kind: 'image', config: { src: CP, fit: 'cover' } },
      { name: 'Nama Pria', ...nodeBase('content'), transform: tfm(54,53,38,6), animation: fadeIn(600), kind: 'text', config: { text: 'Daffa Pratama Putra', color: '#4A2E35', fontSize: 14, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Bio Pria', ...nodeBase('content'), transform: tfm(54,60,38,10), animation: fadeIn(700), kind: 'text', config: { text: 'Putra dari:\nBpk. H. Pratama W.\n& Ibu Hj. Dewi Kusuma', color: '#88735B', fontSize: 10, align: 'center', fontFamily: 'Lora' } },
    ],
  },
  {
    id: 'couple-polaroid-style',
    sectionId: 'couple',
    name: 'Polaroid Style',
    thumbnail: '📷',
    description: 'Foto polaroid casual dengan tulisan tangan',
    nodes: [
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,5,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Our Story Begins...', color: '#4A2E35', fontSize: 22, align: 'center', fontFamily: 'Great Vibes' } },
      
      { name: 'Polaroid Wanita', ...nodeBase('content'), transform: tfm(10,15,35,36), animation: fadeIn(300), kind: 'image', config: { src: PLP, fit: 'cover' } },
      { name: 'Caption Wanita', ...nodeBase('content'), transform: tfm(10,52,35,5), animation: fadeIn(500), kind: 'text', config: { text: 'Raisya ♥', color: '#4A2E35', fontSize: 16, align: 'center', fontFamily: 'Great Vibes' } },
      { name: 'Bio Wanita', ...nodeBase('content'), transform: tfm(10,58,35,12), animation: fadeIn(600), kind: 'text', config: { text: 'S.Kep, Perawat\nPutri dari:\nH. Andika & Hj. Sri', color: '#88735B', fontSize: 10, align: 'center', fontFamily: 'Lora' } },
      
      { name: 'Icon Dan', ...nodeBase('front-decoration'), transform: tfm(43,30,14,12), animation: floatAnim(700), kind: 'text', config: { text: '➕', color: '#C5A880', fontSize: 38, align: 'center' } },
      
      { name: 'Polaroid Pria', ...nodeBase('content'), transform: tfm(55,15,35,36), animation: fadeIn(300), kind: 'image', config: { src: PLP, fit: 'cover' } },
      { name: 'Caption Pria', ...nodeBase('content'), transform: tfm(55,52,35,5), animation: fadeIn(500), kind: 'text', config: { text: 'Daffa ♥', color: '#4A2E35', fontSize: 16, align: 'center', fontFamily: 'Great Vibes' } },
      { name: 'Bio Pria', ...nodeBase('content'), transform: tfm(55,58,35,12), animation: fadeIn(600), kind: 'text', config: { text: 'S.T, Engineer\nPutra dari:\nH. Pratama & Hj. Dewi', color: '#88735B', fontSize: 10, align: 'center', fontFamily: 'Lora' } },
      
      { name: 'Footer', ...nodeBase('content'), transform: tfm(10,73,80,8), animation: fadeIn(900), kind: 'text', config: { text: '"Dua hati, satu tujuan:\nMembangun keluarga yang penuh cinta dan berkah"', color: '#6B5E62', fontSize: 11, align: 'center', fontFamily: 'Lora', fontStyle: 'italic' } },
    ],
  },
  {
    id: 'couple-full-bio',
    sectionId: 'couple',
    name: 'Full Bio Detail',
    thumbnail: '📋',
    description: 'Profil lengkap dengan pendidikan, hobi, dan akun sosial',
    nodes: [
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,3,80,6), animation: fadeIn(0), kind: 'text', config: { text: 'Tentang Kami', color: '#4A2E35', fontSize: 22, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Divider', ...nodeBase('front-decoration'), transform: tfm(30,10,40,3), animation: fadeIn(200), kind: 'text', config: { text: '━━━ ✦ ━━━', color: '#C5A880', fontSize: 12, align: 'center' } },
      
      { name: 'Foto Wanita', ...nodeBase('content'), transform: tfm(8,15,35,28), animation: fadeIn(400), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Nama Wanita Full', ...nodeBase('content'), transform: tfm(8,44,35,5), animation: fadeIn(500), kind: 'text', config: { text: 'Raisya Putri Andini, S.Kep', color: '#4A2E35', fontSize: 13, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Detail Wanita', ...nodeBase('content'), transform: tfm(8,50,35,20), animation: fadeIn(600), kind: 'text', config: { text: 'Putri dari:\nH. Andika Putra & Hj. Sri Lestari\n\nPerawat di RS Kebumen\nHobi: Membaca & Memasak\nIG: @raisyaputri', color: '#88735B', fontSize: 9, align: 'center', fontFamily: 'Lora' } },
      
      { name: 'Simbol Tengah', ...nodeBase('front-decoration'), transform: tfm(43,28,14,12), animation: floatAnim(700), kind: 'text', config: { text: '💕', color: '#C5A880', fontSize: 36, align: 'center' } },
      
      { name: 'Foto Pria', ...nodeBase('content'), transform: tfm(57,15,35,28), animation: fadeIn(400), kind: 'image', config: { src: PP, fit: 'cover' } },
      { name: 'Nama Pria Full', ...nodeBase('content'), transform: tfm(57,44,35,5), animation: fadeIn(500), kind: 'text', config: { text: 'Daffa Pratama Putra, S.T.', color: '#4A2E35', fontSize: 13, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Detail Pria', ...nodeBase('content'), transform: tfm(57,50,35,20), animation: fadeIn(600), kind: 'text', config: { text: 'Putra dari:\nH. Pratama W. & Hj. Dewi Kusuma\n\nSoftware Engineer\nHobi: Traveling & Fotografi\nIG: @daffapratama', color: '#88735B', fontSize: 9, align: 'center', fontFamily: 'Lora' } },
      
      { name: 'Quote Penutup', ...nodeBase('content'), transform: tfm(10,73,80,10), animation: fadeIn(900), kind: 'text', config: { text: '"Dari pertemanan yang tulus,\ntumbuh cinta yang tak terduga.\nAlhamdulillah, kami menemukan jodoh terbaik."', color: '#6B5E62', fontSize: 10, align: 'center', fontFamily: 'Lora', fontStyle: 'italic' } },
    ],
  },
];
