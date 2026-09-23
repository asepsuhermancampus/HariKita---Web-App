"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin, Star, CheckCircle2, ArrowRight, Filter, ChevronLeft,
  Sparkles, Eye,
} from "lucide-react";
import { KEBUMEN_DISTRICTS } from "@/data/multi-vendor-catalog";
import { VENDOR_CATEGORIES } from "@/lib/vendor-categories";
import type { HomeVendorCard } from "@/server/queries/catalog";

function slugToCategory(id: string) {
  return VENDOR_CATEGORIES.find((c) => c.id === id);
}

export function VendorCategoryClient({
  categoryId,
  vendors,
}: {
  categoryId: string;
  vendors: HomeVendorCard[];
}) {
  const category = slugToCategory(categoryId);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");

  const filteredVendors = vendors.filter(
    (v) =>
      selectedDistrict === "all" ||
      v.district.toLowerCase() === selectedDistrict.toLowerCase()
  );

  if (!category) {
    return (
      <div className="min-h-screen py-20 px-4 max-w-3xl mx-auto text-center space-y-4">
        <h1 className="font-editorial text-3xl text-hk-charcoal">Kategori tidak ditemukan</h1>
        <Link href="/vendor" className="text-hk-taupe font-manrope font-bold hover:underline">
          Kembali ke Katalog Vendor
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-manrope text-hk-charcoal/70">
        <Link href="/vendor" className="hover:text-hk-charcoal">Katalog Vendor</Link>
        <span>/</span>
        <span className="text-hk-charcoal font-bold">{category.title}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-hk-champagne/40 pb-6">
        <div className="space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-manrope font-semibold text-hk-taupe hover:underline mb-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <h1 className="font-editorial text-3xl sm:text-5xl text-hk-charcoal">
            Vendor {category.title}
          </h1>
          <p className="font-manrope text-sm text-hk-charcoal/70 max-w-2xl leading-relaxed">
            {vendors.length} mitra terverifikasi siap berkolaborasi di Kebumen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <Filter className="w-4 h-4 text-hk-taupe" />
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="rounded-full border border-hk-champagne/60 bg-white px-4 py-2 text-xs font-manrope font-semibold text-hk-charcoal shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-hk-taupe"
          >
            <option value="all">Semua Kecamatan di Kebumen</option>
            {KEBUMEN_DISTRICTS.map((d) => (
              <option key={d} value={d}>Kecamatan {d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Vendor Grid */}
      {filteredVendors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.slug}
              className="group rounded-3xl bg-white border border-hk-champagne/50 shadow-xs hover:border-hk-taupe hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden flex flex-col"
            >
              <Link href={`/vendor/${vendor.slug}`} className="flex flex-col">
                <div className="relative h-48 w-full bg-hk-soft-beige/40 overflow-hidden">
                  {vendor.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={vendor.imageUrl}
                      alt={vendor.businessName}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-hk-taupe">
                      <Eye className="h-7 w-7" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-manrope font-bold uppercase tracking-wider bg-white/90 text-hk-charcoal border border-hk-champagne/40 shadow-2xs flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-hk-taupe" />
                      <span>Kec. {vendor.district}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-manrope font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      <span>Terverifikasi</span>
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-editorial text-2xl font-bold leading-tight line-clamp-1">
                      {vendor.businessName}
                    </h3>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-manrope">
                    <div className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{vendor.rating.toFixed(1)}</span>
                      <span className="text-hk-charcoal/50 font-normal">({vendor.reviewCount} ulasan)</span>
                    </div>
                  </div>
                  {vendor.priceFrom != null && (
                    <div className="pt-3 border-t border-hk-champagne/30 flex items-center justify-between text-xs font-manrope">
                      <div>
                        <span className="text-[10px] text-hk-charcoal/60 block">Mulai dari:</span>
                        <span className="font-mono font-bold text-hk-charcoal">
                          Rp {vendor.priceFrom.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-5 pt-0">
                <Link
                  href={`/vendor/${vendor.slug}`}
                  className="flex items-center justify-center gap-1.5 rounded-full border border-hk-champagne/60 bg-hk-ivory px-4 py-2 text-xs font-manrope font-bold text-hk-charcoal hover:bg-hk-taupe hover:text-white transition-all shadow-2xs w-full"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Profil Vendor</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white border border-hk-champagne/40 space-y-3">
          <p className="font-editorial text-2xl text-hk-charcoal">
            Belum ada mitra di Kecamatan {selectedDistrict}.
          </p>
          <button
            onClick={() => setSelectedDistrict("all")}
            className="px-5 py-2 rounded-full bg-hk-taupe text-white text-xs font-manrope font-bold hover:bg-hk-charcoal transition-all"
          >
            Reset Filter Kecamatan
          </button>
        </div>
      )}

      {/* CTA racik */}
      <div className="flex justify-center pt-2">
        <Link
          href="/builder"
          className="inline-flex items-center gap-2 rounded-full bg-hk-taupe px-6 py-3 text-sm font-manrope font-bold text-white shadow-md hover:bg-hk-charcoal transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Racik Paket Acara</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
