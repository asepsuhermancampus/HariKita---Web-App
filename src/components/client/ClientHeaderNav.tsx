"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  LayoutDashboard,
  CreditCard,
  Calendar,
  Mail,
  LogOut,
  Sparkles,
} from "lucide-react";
import { logoutAction } from "@/server/actions/auth";

interface ClientHeaderNavProps {
  userName?: string;
  userPhone?: string;
}

export function ClientHeaderNav({ userName, userPhone }: ClientHeaderNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Data Diri & Profil",
      href: "/client/profil",
      icon: User,
      exact: true,
    },
    {
      label: "Ringkasan Portal",
      href: "/client",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Pesanan & Escrow",
      href: "/client/pesanan",
      icon: CreditCard,
      exact: false,
    },
    {
      label: "Jadwal Fitting & Sesi",
      href: "/client/jadwal",
      icon: Calendar,
      exact: false,
    },
    {
      label: "Undangan Digital & Tamu",
      href: "/client/undangan",
      icon: Mail,
      exact: false,
    },
  ];

  return (
    <div className="bg-white/95 border-b border-hk-champagne/40 shadow-xs sticky top-[57px] z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2 border-b border-hk-soft-beige/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-hk-soft-beige/50 border border-hk-champagne/60 flex items-center justify-center text-hk-charcoal font-editorial font-bold text-sm shadow-2xs">
              HK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-hk-charcoal font-manrope">
                  {userName || "Calon Pengantin"}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-hk-soft-beige text-hk-charcoal border border-hk-champagne/60 font-manrope">
                  Klien Terverifikasi
                </span>
              </div>
              {userPhone && (
                <p className="text-[11px] text-hk-charcoal/70 font-mono">
                  {userPhone} • Kabupaten Kebumen, Jawa Tengah
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Link
              href="/builder"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-hk-taupe text-white text-xs font-manrope font-semibold hover:bg-[#78644e] transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-hk-champagne" />
              <span>Racik Paket Baru</span>
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-manrope font-semibold text-hk-charcoal/70 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer min-h-[36px]"
                title="Keluar dari Portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </form>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav
          className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar"
          aria-label="Navigasi Portal Klien"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-manrope whitespace-nowrap transition-all shrink-0 min-h-[40px] ${
                  isActive
                    ? "bg-hk-charcoal text-white shadow-xs font-bold"
                    : "text-hk-charcoal/70 hover:text-hk-charcoal hover:bg-hk-soft-beige/40 font-medium"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? "text-hk-champagne" : "text-hk-taupe"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
