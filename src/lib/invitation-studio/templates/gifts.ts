/**
 * HariKita Invitation Studio — Gifts Templates
 */
import type { SectionTemplate } from '../section-templates';
import { fadeIn, floatAnim, nodeBase, tfm } from './helpers';

export const GIFTS_TEMPLATES: SectionTemplate[] = [
  {
    id: 'gifts-default',
    sectionId: 'gifts',
    name: 'Amplop Digital',
    thumbnail: '💝',
    description: 'Info rekening bank untuk kirim hadiah digital',
    nodes: [
      { name: 'Judul Gifts', ...nodeBase('content'), transform: tfm(10,3,80,8), animation: fadeIn(0), kind: 'text', config: { text: 'Kirim Hadiah', color: '#4A2E35', fontSize: 24, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Deskripsi', ...nodeBase('content'), transform: tfm(10,12,80,8), animation: fadeIn(200), kind: 'text', config: { text: 'Doa restu Anda adalah hadiah terbaik.\nNamun jika ingin memberi hadiah, kami sediakan via:', color: '#88735B', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
      { name: 'Ikon Hadiah', ...nodeBase('front-decoration'), transform: tfm(42,21,16,8), animation: floatAnim(300), kind: 'text', config: { text: '🎁', color: '#C5A880', fontSize: 32, align: 'center' } },
      { name: 'Blok Gifts', ...nodeBase('component'), transform: tfm(0,32,100,50), animation: fadeIn(500), kind: 'component', config: { component: 'gifts', variant: 'default', title: 'Info Hadiah' } },
      { name: 'Alamat Kirim', ...nodeBase('content'), transform: tfm(10,84,80,12), animation: fadeIn(700), kind: 'text', config: { text: '📍 Alamat Pengiriman Kado:\nKediaman Mempelai\nJl. Melati No. 5, Kebumen, Jawa Tengah', color: '#4A2E35', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
    ],
  },
  {
    id: 'gifts-bank-transfer',
    sectionId: 'gifts',
    name: 'Transfer Bank',
    thumbnail: '🏦',
    description: 'Fokus info rekening bank dengan detail lengkap',
    nodes: [
      { name: 'Ornamen', ...nodeBase('front-decoration'), transform: tfm(35,3,30,6), animation: fadeIn(0), kind: 'text', config: { text: '✧ 💳 ✧', color: '#C5A880', fontSize: 17, align: 'center' } },
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,12,80,8), animation: fadeIn(200), kind: 'text', config: { text: 'Wedding Gift', color: '#4A2E35', fontSize: 26, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Pesan', ...nodeBase('content'), transform: tfm(10,22,80,8), animation: fadeIn(400), kind: 'text', config: { text: '"Tidak ada yang lebih berharga dari doa restu Anda"', color: '#88735B', fontSize: 12, align: 'center', fontFamily: 'Lora', fontStyle: 'italic' } },
      { name: 'Blok Gifts', ...nodeBase('component'), transform: tfm(0,34,100,50), animation: fadeIn(600), kind: 'component', config: { component: 'gifts', variant: 'default', title: 'Info Hadiah' } },
      { name: 'Konfirmasi', ...nodeBase('content'), transform: tfm(10,86,80,10), animation: fadeIn(800), kind: 'text', config: { text: 'Konfirmasi pengiriman hadiah:\nWA: 0812-3456-7890 (Ananda)', color: '#4A2E35', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
    ],
  },
  {
    id: 'gifts-e-wallet',
    sectionId: 'gifts',
    name: 'E-Wallet & QRIS',
    thumbnail: '📱',
    description: 'Info e-wallet modern (GoPay, OVO, Dana) dan QRIS',
    nodes: [
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,4,80,8), animation: fadeIn(0), kind: 'text', config: { text: 'Digital Gift', color: '#4A2E35', fontSize: 26, align: 'center', fontFamily: 'Great Vibes' } },
      { name: 'Sub-judul', ...nodeBase('content'), transform: tfm(15,14,70,8), animation: fadeIn(200), kind: 'text', config: { text: 'Kirim hadiah melalui e-wallet atau QRIS', color: '#88735B', fontSize: 12, align: 'center', fontFamily: 'Lora' } },
      { name: 'Ikon E-Wallet', ...nodeBase('front-decoration'), transform: tfm(40,24,20,8), animation: floatAnim(300), kind: 'text', config: { text: '📲', color: '#C5A880', fontSize: 34, align: 'center' } },
      { name: 'Blok Gifts', ...nodeBase('component'), transform: tfm(0,35,100,55), animation: fadeIn(500), kind: 'component', config: { component: 'gifts', variant: 'default', title: 'Info Hadiah' } },
      { name: 'Terima Kasih', ...nodeBase('content'), transform: tfm(10,92,80,5), animation: fadeIn(700), kind: 'text', config: { text: 'Terima kasih atas kebaikan Anda 🙏', color: '#C5A880', fontSize: 11, align: 'center', fontFamily: 'Lora' } },
    ],
  },
  {
    id: 'gifts-multi-method',
    sectionId: 'gifts',
    name: 'Multi Metode',
    thumbnail: '🎀',
    description: 'Kombinasi bank transfer, e-wallet, dan alamat kirim kado',
    nodes: [
      { name: 'Judul', ...nodeBase('content'), transform: tfm(10,2,80,7), animation: fadeIn(0), kind: 'text', config: { text: 'Wedding Gift', color: '#4A2E35', fontSize: 24, align: 'center', fontFamily: 'Playfair Display' } },
      { name: 'Metode 1 Label', ...nodeBase('content'), transform: tfm(5,11,29,5), animation: fadeIn(200), kind: 'text', config: { text: '🏦 Bank', color: '#C5A880', fontSize: 12, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Metode 1 Detail', ...nodeBase('content'), transform: tfm(5,17,29,16), animation: fadeIn(300), kind: 'text', config: { text: 'BCA\n1234 5678 90\nAnanda Putri', color: '#4A2E35', fontSize: 10, align: 'center', fontFamily: 'Lora' } },
      { name: 'Metode 2 Label', ...nodeBase('content'), transform: tfm(36,11,29,5), animation: fadeIn(200), kind: 'text', config: { text: '📱 E-Wallet', color: '#C5A880', fontSize: 12, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Metode 2 Detail', ...nodeBase('content'), transform: tfm(36,17,29,16), animation: fadeIn(300), kind: 'text', config: { text: 'GoPay / OVO / Dana\n0812-3456-7890\nAnanda Putri', color: '#4A2E35', fontSize: 10, align: 'center', fontFamily: 'Lora' } },
      { name: 'Metode 3 Label', ...nodeBase('content'), transform: tfm(67,11,29,5), animation: fadeIn(200), kind: 'text', config: { text: '🎁 Kado', color: '#C5A880', fontSize: 12, align: 'center', fontFamily: 'Cinzel' } },
      { name: 'Metode 3 Detail', ...nodeBase('content'), transform: tfm(67,17,29,16), animation: fadeIn(300), kind: 'text', config: { text: 'Jl. Melati No. 5\nKebumen\nJawa Tengah 54311', color: '#4A2E35', fontSize: 10, align: 'center', fontFamily: 'Lora' } },
      { name: 'Blok Gifts', ...nodeBase('component'), transform: tfm(0,36,100,56), animation: fadeIn(500), kind: 'component', config: { component: 'gifts', variant: 'default', title: 'Info Hadiah' } },
      { name: 'Penutup', ...nodeBase('content'), transform: tfm(10,93,80,5), animation: fadeIn(700), kind: 'text', config: { text: 'Terima kasih atas cinta dan doa Anda 💕', color: '#88735B', fontSize: 10, align: 'center', fontFamily: 'Lora' } },
    ],
  },
];
