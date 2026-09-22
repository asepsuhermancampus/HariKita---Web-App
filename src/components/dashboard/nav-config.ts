import {
  LayoutDashboard,
  ShieldCheck,
  Landmark,
  Scale,
  Megaphone,
  CalendarDays,
  FileSearch,
  Settings,
  Inbox,
  Wallet,
  Package,
  ImageIcon,
  UserRound,
  Store,
  Coins,
  ReceiptText,
  CalendarClock,
  Mail,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}
export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const ADMIN_NAV: NavGroup[] = [
  {
    group: "Operasional",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Verifikasi Vendor", href: "/admin/verifikasi", icon: ShieldCheck },
      { label: "Kliring & Settlement", href: "/admin/escrow", icon: Landmark },
      { label: "Dispute", href: "/admin/dispute", icon: Scale },
    ],
  },
  {
    group: "Pertumbuhan",
    items: [
      { label: "Brand Ambassador", href: "/admin/ba", icon: Megaphone },
      { label: "Kalender", href: "/admin/kalender", icon: CalendarDays },
      { label: "Audit Konten", href: "/admin/audit-konten", icon: FileSearch },
    ],
  },
  {
    group: "Konfigurasi",
    items: [{ label: "Pengaturan Platform", href: "/admin/pengaturan", icon: Settings }],
  },
];

export const VENDOR_NAV: NavGroup[] = [
  {
    group: "Operasional",
    items: [
      { label: "Ringkasan", href: "/dashboard/vendor", icon: LayoutDashboard },
      { label: "Kotak Masuk Order", href: "/dashboard/vendor/inbox", icon: Inbox },
      { label: "Kalender Blackout", href: "/dashboard/vendor/kalender", icon: CalendarDays },
      { label: "Dompet Saldo Escrow", href: "/dashboard/vendor/dompet", icon: Wallet },
    ],
  },
  {
    group: "Katalog",
    items: [
      { label: "Paket & Layanan", href: "/dashboard/vendor/paket", icon: Package },
      { label: "Portofolio & Feed", href: "/dashboard/vendor/portofolio", icon: ImageIcon },
    ],
  },
  {
    group: "Akun",
    items: [{ label: "Data Diri & Profil", href: "/dashboard/vendor/profil", icon: UserRound }],
  },
];

export const BA_NAV: NavGroup[] = [
  {
    group: "Kemitraan",
    items: [
      { label: "Ringkasan", href: "/dashboard/ba", icon: LayoutDashboard },
      { label: "Vendor Rekrutan", href: "/dashboard/ba/vendor", icon: Store },
      { label: "Komisi", href: "/dashboard/ba/komisi", icon: Coins },
      { label: "Dompet", href: "/dashboard/ba/dompet", icon: Wallet },
    ],
  },
];

export const CLIENT_NAV: NavGroup[] = [
  {
    group: "Acara Saya",
    items: [
      { label: "Ringkasan", href: "/client", icon: LayoutDashboard },
      { label: "Pesanan & Escrow", href: "/client/pesanan", icon: ReceiptText },
      { label: "Jadwal Fitting & Sesi", href: "/client/jadwal", icon: CalendarClock },
      { label: "Undangan Digital & Tamu", href: "/client/undangan", icon: Mail },
    ],
  },
  {
    group: "Akun",
    items: [{ label: "Data Diri & Profil", href: "/client/profil", icon: UserRound }],
  },
];
