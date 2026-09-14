/**
 * HariKita Master Route Registry & URL Taxonomy
 * Single Source of Truth untuk seluruh navigasi, breadcrumb, dan route-guard.
 */

export const ROUTES = {
  // 1. Publik & Katalog Hyperlocal
  HOME: '/',
  KATEGORI: '/kategori',
  KATEGORI_DETAIL: (slug: string) => `/kategori/${slug}`,
  VENDOR_PROFILE: (slug: string) => `/vendor/${slug}`,
  UNDANGAN: '/undangan',
  UNDANGAN_DETAIL: (slug: string) => `/undangan/${slug}`,
  BUILDER: '/builder',
  HUB_KOORDINASI: '/hub-koordinasi',

  // 2. Transaksi & Pembayaran Escrow
  CHECKOUT: '/checkout',
  PEMBAYARAN: (bookingId: string) => `/pembayaran/${bookingId}`,
  INVOICE: (bookingId: string) => `/pesanan/${bookingId}/invoice`,

  // 3. Portal Klien / Calon Pengantin
  CLIENT: {
    DASHBOARD: '/client',
    PESANAN: '/client/pesanan',
    JADWAL: '/client/jadwal',
    UNDANGAN: '/client/undangan',
  },

  // 4. Portal Mitra Vendor
  VENDOR: {
    DASHBOARD: '/vendor',
    INBOX: '/vendor/inbox',
    PORTOFOLIO: '/vendor/portofolio',
    PAKET: '/vendor/paket',
    KALENDER: '/vendor/kalender',
    DOMPET: '/vendor/dompet',
  },

  // 5. Portal Super Admin
  ADMIN: {
    DASHBOARD: '/admin',
    KALENDER: '/admin/kalender',
    VERIFIKASI: '/admin/verifikasi',
    ESCROW: '/admin/escrow',
    AUDIT_KONTEN: '/admin/audit-konten',
  },

  // 6. Autentikasi
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REGISTER_VENDOR: '/auth/register-vendor',
  },

  // 7. Showcase
  DESIGN_SYSTEM: '/design-system-showcase',
} as const;

/**
 * Daftar kata kunci terlarang (Reserved Slugs) untuk profil dinamis vendor /vendor/[slug]
 * Mencegah tabrakan rute statis portal vendor dengan slug toko vendor
 */
export const RESERVED_VENDOR_SLUGS = new Set([
  'inbox',
  'portofolio',
  'paket',
  'kalender',
  'dompet',
  'dashboard',
  'settings',
  'profile',
  'auth',
  'api',
  'admin',
  'client',
  'builder',
  'checkout',
  'pembayaran',
  'pesanan',
]);

export function isReservedVendorSlug(slug: string): boolean {
  return RESERVED_VENDOR_SLUGS.has(slug.toLowerCase().trim());
}

/**
 * Metadata Navigasi untuk Breadcrumb & Navbars
 */
export interface RouteMeta {
  path: string;
  label: string;
  category: 'public' | 'client' | 'vendor' | 'admin' | 'auth';
  badge?: string;
}

export const ROUTE_REGISTRY: RouteMeta[] = [
  // Public
  { path: '/', label: 'Beranda', category: 'public' },
  { path: '/kategori', label: '11 Kategori Layanan', category: 'public' },
  { path: '/undangan', label: 'Undangan Digital', category: 'public' },
  { path: '/builder', label: 'Racik Sendiri (Builder)', category: 'public' },
  { path: '/hub-koordinasi', label: 'Hub Koordinasi', category: 'public', badge: '9Router' },
  
  // Checkout & Payment
  { path: '/checkout', label: 'Checkout & Booking', category: 'public' },

  // Client
  { path: '/client', label: 'Dashboard Pengantin', category: 'client' },
  { path: '/client/pesanan', label: 'Riwayat Pesanan', category: 'client' },
  { path: '/client/jadwal', label: 'Jadwal Fitting & Sesi', category: 'client' },
  { path: '/client/undangan', label: 'Buku Tamu Digital', category: 'client' },

  // Vendor
  { path: '/vendor', label: 'Ringkasan Toko', category: 'vendor' },
  { path: '/vendor/inbox', label: 'Kotak Masuk Order', category: 'vendor' },
  { path: '/vendor/portofolio', label: 'Portofolio Mandiri', category: 'vendor' },
  { path: '/vendor/paket', label: 'Daftar Paket & Harga', category: 'vendor' },
  { path: '/vendor/kalender', label: 'Kalender Blackout Dates', category: 'vendor' },
  { path: '/vendor/dompet', label: 'Dompet Saldo Escrow', category: 'vendor' },

  // Admin
  { path: '/admin', label: 'Executive Radar', category: 'admin' },
  { path: '/admin/kalender', label: 'Master Kalender Kebumen', category: 'admin' },
  { path: '/admin/verifikasi', label: 'Verifikasi Mitra Baru', category: 'admin' },
  { path: '/admin/escrow', label: 'Otorisasi Dana Escrow', category: 'admin' },
  { path: '/admin/audit-konten', label: 'Audit Sensor Kontak', category: 'admin' },

  // Auth
  { path: '/auth/login', label: 'Masuk Akun', category: 'auth' },
  { path: '/auth/register', label: 'Daftar Calon Pengantin', category: 'auth' },
  { path: '/auth/register-vendor', label: 'Gabung Mitra Vendor', category: 'auth' },
];
