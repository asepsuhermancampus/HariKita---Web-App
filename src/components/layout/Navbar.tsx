"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoBadge } from "./LogoBadge";
import { Sparkles, Compass, Mail, SlidersHorizontal, UserCheck, Menu, X, ShieldCheck } from "lucide-react";

export const Navbar = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "11 Layanan Kebumen", href: "/#layanan", icon: Compass },
    { label: "Tema Undangan (65+)", href: "/undangan", icon: Mail },
    { label: "Simulator Racik Paket", href: "/builder", icon: SlidersHorizontal },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-gold/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <LogoBadge />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive ? "text-gold-dark font-semibold" : "text-plum-light hover:text-plum"
                }`}
              >
                <Icon className="w-4 h-4 text-gold" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Quick Role Switcher */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-sm btn-ghost gap-2 text-plum border border-gold/30 hover:bg-gold/10">
              <UserCheck className="w-4 h-4 text-gold-dark" />
              <span>Akses Portal</span>
            </label>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-gold/20 mt-2 z-50">
              <li>
                <Link href="/client" className="hover:bg-gold/10 text-plum font-medium">
                  Portal Klien (Pesanan & Fitting)
                </Link>
              </li>
              <li>
                <Link href="/vendor" className="hover:bg-gold/10 text-plum font-medium">
                  Portal Mitra Vendor Kebumen
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:bg-gold/10 text-plum font-medium">
                  Super Admin (Master Kalender)
                </Link>
              </li>
            </ul>
          </div>

          {/* Builder Button */}
          <Link
            href="/builder"
            className="btn btn-sm gold-gradient-bg text-plum-dark font-bold shadow-sm hover:brightness-105 border-none px-4 rounded-full"
          >
            <Sparkles className="w-4 h-4" />
            Racik Paket Hari H
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-plum hover:bg-gold/10 focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-gold/20 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-plum font-medium hover:bg-gold/15 transition-colors"
              >
                <Icon className="w-5 h-5 text-gold-dark" />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-gold/20 space-y-2">
            <span className="text-xs uppercase tracking-wider text-plum-light font-bold px-3">
              Pilih Akses Masuk:
            </span>
            <div className="grid grid-cols-3 gap-2 px-1">
              <Link
                href="/client"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-xs btn-outline border-gold/40 text-plum hover:bg-gold/20"
              >
                Klien
              </Link>
              <Link
                href="/vendor"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-xs btn-outline border-gold/40 text-plum hover:bg-gold/20"
              >
                Vendor
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-xs btn-outline border-gold/40 text-plum hover:bg-gold/20"
              >
                Admin
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/builder"
              onClick={() => setMobileMenuOpen(false)}
              className="btn w-full gold-gradient-bg text-plum-dark font-bold border-none rounded-full shadow-md"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Mulai Racik Paket
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
