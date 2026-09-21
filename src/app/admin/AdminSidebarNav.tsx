"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  Landmark,
  Scale,
  Megaphone,
  CalendarDays,
  FileSearch,
  Settings,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}
interface NavGroup {
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

function SidebarBrand() {
  return (
    <div className="flex items-center gap-2.5 px-2.5 pb-4 pt-1.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-gold-light to-gold-dark font-extrabold text-plum-dark">
        H
      </div>
      <div>
        <div className="text-sm font-bold text-white">HariKita</div>
        <div className="text-[10px] uppercase tracking-[0.12em] text-gold-light">Super Admin</div>
      </div>
    </div>
  );
}

export function AdminSidebarNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
      {ADMIN_NAV.map((g) => (
        <div key={g.group}>
          <div className="px-3 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
            {g.group}
          </div>
          {g.items.map((it) => {
            const active =
              it.href === "/admin" ? pathname === "/admin" : pathname.startsWith(it.href);
            const Icon = it.icon;
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors ${
                  active
                    ? "bg-gold/25 font-bold text-gold-light"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                <span>{it.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Tombol hamburger (mobile) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka menu admin"
        className="focus-ring fixed left-4 top-4 z-30 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-hk-soft-beige bg-white text-hk-charcoal lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col bg-plum-dark p-3.5 lg:flex">
        <SidebarBrand />
        {nav}
      </aside>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col bg-plum-dark p-3.5">
            <div className="flex items-center justify-between">
              <SidebarBrand />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup menu admin"
                className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
