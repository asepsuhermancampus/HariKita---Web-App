"use client";

import React from "react";
import Link from "next/link";
import {
  Camera, Scissors, Palette, Gift, Heart, Utensils, Cake, Mail, Map,
  ArrowRight, Sparkles, Compass, Store,
} from "lucide-react";
import { VENDOR_CATEGORIES, getVendorsByCategory } from "@/lib/vendor-categories";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Camera, Scissors, Palette, Gift, Heart, Utensils, Cake, Mail, Map,
};

export default function VendorCatalogIndexPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-hk-soft-beige/70 text-hk-taupe text-xs font-manrope font-bold uppercase tracking-widest border border-hk-champagne/40">
          <Compass className="w-3.5 h-3.5" />
          <span>Katalog Vendor Kebumen</span>
        </div>
        <h1 className="font-editorial text-4xl sm:text-5xl text-hk-charcoal">
          11 Jenis Layanan Vendor Kebumen
        </h1>
        <p className="font-manrope text-sm text-hk-charcoal/70 leading-relaxed">
          Kenali setiap kategori layanan, lalu pilih vendor perorangan favorit Anda
          dan kumpulkan ke dalam rencana sebelum meracik paket di simulator.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/builder"
            className="inline-flex items-center gap-1.5 rounded-full bg-hk-taupe px-5 py-2.5 text-xs font-manrope font-bold text-white shadow-xs hover:bg-hk-charcoal transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Racik Paket Hari H</span>
          </Link>
        </div>
      </div>

      {/* Category Directory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {VENDOR_CATEGORIES.map((cat) => {
          const Icon = ICONS[cat.iconName] ?? Store;
          const vendorCount = getVendorsByCategory(cat.id).length;
          return (
            <Link
              key={cat.id}
              href={`/vendor/kategori/${cat.id}`}
              className="group relative p-6 rounded-3xl bg-white border border-hk-champagne/50 shadow-xs hover:border-hk-taupe hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col gap-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-hk-ivory border border-hk-champagne/60 flex items-center justify-center text-hk-taupe group-hover:scale-105 transition-transform shadow-2xs">
                <Icon className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="font-editorial text-2xl font-bold text-hk-charcoal group-hover:text-hk-taupe transition-colors">
                  {cat.title}
                </h2>
                <p className="font-manrope text-xs text-hk-charcoal/70 leading-relaxed">
                  {cat.shortDesc}
                </p>
              </div>
              <div className="mt-auto pt-3 border-t border-hk-champagne/40 flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-manrope font-bold uppercase tracking-wider bg-hk-soft-beige/70 text-hk-taupe border border-hk-champagne/40">
                  {vendorCount} vendor tersedia
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-manrope font-bold text-hk-charcoal group-hover:text-hk-taupe">
                  Lihat
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
