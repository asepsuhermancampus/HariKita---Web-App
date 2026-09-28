"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  LogOut,
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
  Layout,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import type { NavGroup, NavIconName } from "./nav-config";
import { logoutAction } from "@/server/actions/auth";

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
  layout: Layout,
};

export function DashboardSidebarNav({
  nav,
  roleLabel,
  homeHref,
  userName,
}: {
  nav: NavGroup[];
  roleLabel: string;
  homeHref: string;
  userName?: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // ── Brand ─────────────────────────────────────────────────────────────────
  const BrandBlock = ({ forMobile = false }: { forMobile?: boolean }) => (
    <div className={`flex items-center gap-2.5 px-2 pb-4 pt-1.5 ${!forMobile && collapsed ? "justify-center" : ""}`}>
      <div className="relative shrink-0">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-hk-champagne to-hk-taupe text-[15px] font-extrabold text-white shadow">
          H
        </div>
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-hk-charcoal bg-emerald-400" />
      </div>
      {(forMobile || !collapsed) && (
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="truncate text-[13px] font-bold leading-tight text-white">
            {userName || "HariKita"}
          </div>
          <div className="truncate text-[10px] uppercase tracking-[0.12em] text-hk-champagne">
            {roleLabel}
          </div>
        </div>
      )}
    </div>
  );

  // ── Nav body ──────────────────────────────────────────────────────────────
  const NavBody = ({ forMobile = false }: { forMobile?: boolean }) => (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
      {nav.map((g) => (
        <div key={g.group}>
          {!forMobile && collapsed ? (
            <div className="mx-3 my-2 h-px bg-white/10" />
          ) : (
            <div className="px-3 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
              {g.group}
            </div>
          )}

          {g.items.map((it) => {
            const active = it.href === homeHref ? pathname === it.href : pathname.startsWith(it.href);
            const Icon = ICONS[it.icon];
            const isCollapsed = !forMobile && collapsed;

            return (
              <div key={it.href} className="group/item relative">
                <Link
                  href={it.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-all duration-150 ${
                    isCollapsed ? "justify-center" : ""
                  } ${active
                    ? "bg-hk-champagne/20 font-bold text-hk-champagne"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  {!isCollapsed && <span className="truncate">{it.label}</span>}
                </Link>

                {isCollapsed && (
                  <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#1a1a2e] px-3 py-1.5 text-[12px] font-semibold text-white opacity-0 shadow-xl ring-1 ring-white/10 transition-opacity group-hover/item:opacity-100">
                    {it.label}
                    <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#1a1a2e]" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </nav>
  );

  // ── Bottom area ───────────────────────────────────────────────────────────
  // Layout:
  //   [Toggle sidebar button]   <-- di atas garis, bagian dari nav scroll
  //   ─── garis border ───
  //   [Keluar]
  const BottomActions = ({ forMobile = false }: { forMobile?: boolean }) => {
    const isCollapsed = !forMobile && collapsed;
    return (
      <div className="flex flex-col gap-0.5">

        {/* ── Toggle collapse — di ATAS garis, tidak berdekatan dengan Keluar ── */}
        {!forMobile && (
          <div className="group/tog relative pb-1">
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              title={collapsed ? "Perluas sidebar" : "Perkecil sidebar"}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-white/40 transition-colors hover:bg-white/8 hover:text-white/80 ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <svg
                className={`h-[18px] w-[18px] shrink-0 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
                <path d="M14 9l-3 3 3 3" />
              </svg>
              {!isCollapsed && <span>{collapsed ? "Perluas" : "Perkecil"} Sidebar</span>}
            </button>
            {isCollapsed && (
              <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#1a1a2e] px-3 py-1.5 text-[12px] font-semibold text-white opacity-0 shadow-xl ring-1 ring-white/10 transition-opacity group-hover/tog:opacity-100">
                Perluas Sidebar
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#1a1a2e]" />
              </span>
            )}
          </div>
        )}

        {/* ── Garis pemisah — di antara toggle dan Keluar ── */}
        <div className="border-t border-white/10" />

        {/* ── Keluar (dengan konfirmasi popup) ── */}
        <div className="group/out relative pt-1">
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            title="Keluar"
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-white/70 transition-colors hover:bg-red-500/15 hover:text-red-300 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            {!isCollapsed && <span>Keluar</span>}
          </button>
          {isCollapsed && (
            <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#1a1a2e] px-3 py-1.5 text-[12px] font-semibold text-red-300 opacity-0 shadow-xl ring-1 ring-white/10 transition-opacity group-hover/out:opacity-100">
              Keluar
              <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#1a1a2e]" />
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ── Mobile hamburger ─────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Buka menu"
        className="focus-ring fixed left-4 top-4 z-30 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-hk-soft-beige bg-white text-hk-charcoal lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* ── Desktop sidebar ──────────────────────────────────────────────────── */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col bg-hk-charcoal p-3 transition-all duration-300 ease-in-out lg:flex ${
          collapsed ? "w-[72px]" : "w-[264px]"
        }`}
      >
        <BrandBlock />
        <NavBody />
        <BottomActions />
      </aside>

      {/* ── Mobile drawer ────────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col bg-hk-charcoal p-3.5">
            <div className="flex items-center justify-between">
              <BrandBlock forMobile />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Tutup menu"
                className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <NavBody forMobile />
            <BottomActions forMobile />
          </aside>
        </div>
      )}

      {/* ── Logout Confirmation Modal ─────────────────────────────────────────── */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-dialog-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          />

          {/* Dialog card */}
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-red-400 via-red-500 to-rose-500" />

            <div className="p-6">
              {/* Icon */}
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 ring-1 ring-red-100">
                <AlertTriangle className="h-7 w-7 text-red-500" />
              </div>

              {/* Text */}
              <h2 id="logout-dialog-title" className="mb-1 text-[17px] font-bold text-gray-900">
                Konfirmasi Keluar
              </h2>
              <p className="text-[13px] leading-relaxed text-gray-500">
                Apakah Anda yakin ingin keluar dari akun ini? Anda perlu masuk kembali untuk mengakses dashboard.
              </p>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                {/* Cancel */}
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-[13px] font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
                >
                  Batal
                </button>

                {/* Confirm logout */}
                <form action={logoutAction} className="flex-1">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-red-600 active:scale-95"
                  >
                    <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                    Ya, Keluar
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}