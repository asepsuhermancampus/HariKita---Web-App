"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HariKitaLogo } from "@/components/brand/HariKitaLogo";
import { Sparkles, Compass, Mail, UserCheck, Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Navbar = ({ isLoggedIn = false }: { isLoggedIn?: boolean }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isInvitationDetailPage =
    pathname && pathname.startsWith("/undangan/") && pathname !== "/undangan";
  const isDesignSystemShowcase = pathname === "/design-system-showcase";

  if (isInvitationDetailPage || isDesignSystemShowcase) {
    return null;
  }

  const navLinks = [
    { label: "11 Layanan Kebumen", href: "/#layanan", icon: Compass },
    { label: "Hub Koordinasi", href: "/hub-koordinasi", icon: Sparkles },
    { label: "Tema Undangan (65+)", href: "/undangan", icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-hk-champagne/40 bg-white/95 px-4 sm:px-6 py-3.5 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        
        {/* Sisi Kiri: Murni Logo Saja */}
        <div className="flex items-center shrink-0">
          <HariKitaLogo variant="horizontal" size="sm" asLink={true} href="/" />
        </div>

        {/* Sisi Tengah: Tautan Teks Navigasi Asli (Tanpa Kapsul Switcher) */}
        <nav
          aria-label="Navigasi Utama"
          className="hidden md:flex items-center gap-8"
        >
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-hk-charcoal font-semibold"
                    : "text-hk-charcoal/70 hover:text-hk-charcoal"
                )}
              >
                <Icon className="w-4 h-4 text-hk-taupe" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sisi Kanan: Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Login Button — hanya tampil bila belum login */}
          {!isLoggedIn && (
            <Link
              href="/auth/login"
              className="flex h-8 items-center gap-1.5 rounded-full border border-hk-champagne/60 bg-white px-4 text-xs font-manrope font-semibold text-hk-charcoal shadow-2xs hover:border-hk-taupe hover:bg-hk-ivory transition-all"
            >
              <UserCheck className="h-3.5 w-3.5 text-hk-taupe" />
              <span>Login</span>
            </Link>
          )}

          {/* Builder CTA Button */}
          <Link
            href="/builder"
            className="flex h-8 items-center gap-1.5 rounded-full bg-hk-taupe px-4 text-xs font-manrope font-bold text-white shadow-sm hover:bg-hk-charcoal transition-all shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Racik Paket Hari H</span>
          </Link>
        </div>

        {/* Mobile Actions: Racik Button + Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/builder"
            className="flex h-8 items-center gap-1 rounded-full bg-hk-taupe px-3 text-[11px] font-manrope font-bold text-white shadow-2xs hover:bg-hk-charcoal shrink-0"
          >
            <Sparkles className="h-3 w-3" />
            <span>Racik</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-xl border border-hk-champagne/60 bg-white text-hk-charcoal hover:bg-hk-ivory transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Expanded Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="md:hidden border-t border-hk-champagne/40 bg-white/98 px-4 pt-3 pb-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 mt-2"
        >
          <div className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-manrope font-semibold text-hk-charcoal hover:bg-hk-ivory transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-hk-taupe" />
                    <span>{item.label}</span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-hk-taupe/60" />
                </Link>
              );
            })}
          </div>

          {/* Login Link — hanya tampil bila belum login */}
          {!isLoggedIn && (
            <div className="pt-2 border-t border-hk-champagne/40">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full rounded-xl border border-hk-champagne/60 bg-white py-2.5 text-xs font-manrope font-semibold text-hk-charcoal shadow-2xs hover:bg-hk-ivory transition-all"
              >
                <UserCheck className="h-4 w-4 text-hk-taupe" />
                <span>Login</span>
              </Link>
            </div>
          )}

          {/* Full-width Builder Button */}
          <div className="pt-1">
            <Link
              href="/builder"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-hk-taupe py-2.5 text-xs font-manrope font-bold text-white shadow-sm hover:bg-hk-charcoal transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>Mulai Racik Paket Hari H</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
