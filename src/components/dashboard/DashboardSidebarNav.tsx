"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
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
  Image as ImageIcon,
  UserRound,
  Store,
  Coins,
  ReceiptText,
  CalendarClock,
  Mail,
  type LucideIcon,
} from "lucide-react";
import type { NavGroup, NavIconName } from "./nav-config";

/** Peta nama ikon (string, aman lintas server→client) → komponen Lucide. */
const ICONS: Record<NavIconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  shield: ShieldCheck,
  landmark: Landmark,
  scale: Scale,
  megaphone: Megaphone,
  calendar: CalendarDays,
  fileSearch: FileSearch,
  settings: Settings,
  inbox: Inbox,
  wallet: Wallet,
  package: Package,
  image: ImageIcon,
  user: UserRound,
  store: Store,
  coins: Coins,
  receipt: ReceiptText,
  calendarClock: CalendarClock,
  mail: Mail,
};

export function DashboardSidebarNav({
  nav,
  roleLabel,
  homeHref,
}: {
  nav: NavGroup[];
  roleLabel: string;
  homeHref: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const body = (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
      {nav.map((g) => (
        <div key={g.group}>
          <div className="px-3 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
            {g.group}
          </div>
          {g.items.map((it) => {
            const active =
              it.href === homeHref ? pathname === it.href : pathname.startsWith(it.href);
            const Icon = ICONS[it.icon];
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors ${
                  active
                    ? "bg-hk-champagne/20 font-bold text-hk-champagne"
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

  const brand = (
    <div className="flex items-center gap-2.5 px-2.5 pb-4 pt-1.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-hk-champagne to-hk-taupe font-extrabold text-white">
        H
      </div>
      <div>
        <div className="text-sm font-bold text-white">HariKita</div>
        <div className="text-[10px] uppercase tracking-[0.12em] text-hk-champagne">{roleLabel}</div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka menu"
        className="focus-ring fixed left-4 top-4 z-30 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-hk-soft-beige bg-white text-hk-charcoal lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col bg-hk-charcoal p-3.5 lg:flex">
        {brand}
        {body}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col bg-hk-charcoal p-3.5">
            <div className="flex items-center justify-between">
              {brand}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
                className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {body}
          </aside>
        </div>
      )}
    </>
  );
}
