/**
 * Konfigurasi navigasi sidebar tiap role.
 *
 * PENTING: `icon` disimpan sebagai NAMA (string), bukan komponen fungsi Lucide.
 * Alasan: konfigurasi ini menyeberangi batas Server Component → Client Component
 * (DashboardShell adalah server, DashboardSidebarNav adalah client); fungsi
 * (termasuk komponen React) TIDAK dapat diserialisasi lintas batas tersebut.
 * Pemetaan nama → komponen dilakukan di `DashboardSidebarNav` (client-side).
 */

export type NavIconName =
  | "dashboard"
  | "shield"
  | "landmark"
  | "scale"
  | "megaphone"
  | "calendar"
  | "fileSearch"
  | "settings"
  | "inbox"
  | "wallet"
  | "package"
  | "image"
  | "user"
  | "store"
  | "coins"
  | "receipt"
  | "calendarClock"
  | "mail";

export interface NavItem {
  label: string;
  href: string;
  icon: NavIconName;
}
export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const ADMIN_NAV: NavGroup[] = [
  {
    group: "Operasional",
    items: [
      { label: "Dashboard", href: "/admin", icon: "dashboard" },
      { label: "Verifikasi Vendor", href: "/admin/verifikasi", icon: "shield" },
      { label: "Kliring & Settlement", href: "/admin/escrow", icon: "landmark" },
      { label: "Dispute", href: "/admin/dispute", icon: "scale" },
    ],
  },
  {
    group: "Pertumbuhan",
    items: [
      { label: "Brand Ambassador", href: "/admin/ba", icon: "megaphone" },
      { label: "Kalender", href: "/admin/kalender", icon: "calendar" },
      { label: "Audit Konten", href: "/admin/audit-konten", icon: "fileSearch" },
    ],
  },
  {
    group: "Konfigurasi",
    items: [{ label: "Pengaturan Platform", href: "/admin/pengaturan", icon: "settings" }],
  },
];

export const VENDOR_NAV: NavGroup[] = [
  {
    group: "Operasional",
    items: [
      { label: "Ringkasan", href: "/dashboard/vendor", icon: "dashboard" },
      { label: "Kotak Masuk Order", href: "/dashboard/vendor/inbox", icon: "inbox" },
      { label: "Kalender Blackout", href: "/dashboard/vendor/kalender", icon: "calendar" },
      { label: "Dompet Saldo Escrow", href: "/dashboard/vendor/dompet", icon: "wallet" },
    ],
  },
  {
    group: "Katalog",
    items: [
      { label: "Paket & Layanan", href: "/dashboard/vendor/paket", icon: "package" },
      { label: "Portofolio & Feed", href: "/dashboard/vendor/portofolio", icon: "image" },
    ],
  },
  {
    group: "Akun",
    items: [{ label: "Data Diri & Profil", href: "/dashboard/vendor/profil", icon: "user" }],
  },
];

export const BA_NAV: NavGroup[] = [
  {
    group: "Kemitraan",
    items: [
      { label: "Ringkasan", href: "/dashboard/ba", icon: "dashboard" },
      { label: "Vendor Rekrutan", href: "/dashboard/ba/vendor", icon: "store" },
      { label: "Komisi", href: "/dashboard/ba/komisi", icon: "coins" },
      { label: "Dompet", href: "/dashboard/ba/dompet", icon: "wallet" },
    ],
  },
];

export const CLIENT_NAV: NavGroup[] = [
  {
    group: "Acara Saya",
    items: [
      { label: "Ringkasan", href: "/client", icon: "dashboard" },
      { label: "Pesanan & Escrow", href: "/client/pesanan", icon: "receipt" },
      { label: "Jadwal Fitting & Sesi", href: "/client/jadwal", icon: "calendarClock" },
      { label: "Undangan Digital & Tamu", href: "/client/undangan", icon: "mail" },
    ],
  },
  {
    group: "Akun",
    items: [{ label: "Data Diri & Profil", href: "/client/profil", icon: "user" }],
  },
];
