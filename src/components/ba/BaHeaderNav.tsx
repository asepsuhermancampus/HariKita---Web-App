"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Coins,
  Wallet,
  LogOut,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { logoutAction } from "@/server/actions/auth";
import { ROUTES } from "@/lib/routes";

interface BaHeaderNavProps {
  displayName?: string;
  referralCode?: string;
  walletBalance?: number;
}

export function BaHeaderNav({
  displayName,
  referralCode = "-",
  walletBalance = 0,
}: BaHeaderNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Ringkasan", href: ROUTES.BA.DASHBOARD, icon: LayoutDashboard, exact: true },
    { label: "Vendor Rekrutan", href: ROUTES.BA.VENDOR, icon: Store, exact: false },
    { label: "Komisi", href: ROUTES.BA.KOMISI, icon: Coins, exact: false },
    { label: "Dompet", href: ROUTES.BA.DOMPET, icon: Wallet, exact: false },
  ];

  return (
    <div className="bg-white/95 border-b border-hk-champagne/40 shadow-xs sticky top-[57px] z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2 border-b border-hk-soft-beige/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-hk-soft-beige/50 border border-hk-champagne/60 flex items-center justify-center text-hk-charcoal font-editorial font-bold text-sm shadow-2xs">
              BA
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-hk-charcoal font-manrope">
                  {displayName || "Brand Ambassador"}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-hk-soft-beige/80 text-hk-charcoal border border-hk-champagne/40 font-manrope flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-hk-taupe" />
                  <span>Kode: {referralCode}</span>
                </span>
              </div>
              <p className="text-[11px] text-hk-charcoal/70 font-manrope mt-0.5">
                Saldo dompet:{" "}
                <strong className="text-hk-taupe">{formatRupiah(walletBalance)}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.KATEGORI}
              className="text-xs font-manrope font-semibold text-hk-charcoal hover:text-hk-taupe transition-colors px-3 py-1.5 rounded-full border border-hk-champagne/40 bg-hk-ivory/50 flex items-center gap-1.5"
            >
              <ExternalLink className="w-3 h-3 text-hk-taupe" />
              <span>Katalog Publik</span>
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="text-xs font-manrope font-semibold text-red-700 hover:text-red-900 transition-colors px-3 py-1.5 rounded-full border border-red-200 bg-red-50/50 flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Keluar</span>
              </button>
            </form>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-manrope whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? "bg-hk-charcoal text-white font-bold shadow-xs"
                    : "text-hk-charcoal/70 hover:text-hk-charcoal hover:bg-hk-soft-beige/50 font-medium"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-hk-champagne" : "text-hk-charcoal/50"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
