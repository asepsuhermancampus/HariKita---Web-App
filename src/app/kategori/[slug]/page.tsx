"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Star,
  ShieldCheck,
  ArrowRight,
  Filter,
  CheckCircle2,
  ChevronLeft,
  Sparkles,
  Eye,
} from "lucide-react";
import {
  MULTI_VENDOR_CATALOG,
  KEBUMEN_DISTRICTS,
  VendorProfile,
} from "@/data/multi-vendor-catalog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryVendorListPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const categorySlug = resolvedParams.slug;

  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");

  // Filter vendors matching category
  const categoryVendors = MULTI_VENDOR_CATALOG.filter(
    (v) => v.categoryId === categorySlug
  );

  const activeCategory = categoryVendors[0]
    ? categoryVendors[0].categoryTitle
    : "Kategori Layanan Kebumen";

  const filteredVendors = categoryVendors.filter((v) => {
    if (selectedDistrict === "all") return true;
    return v.district.toLowerCase() === selectedDistrict.toLowerCase();
  });

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs font-manrope text-hk-charcoal/70">
        <Link href="/" className="hover:text-hk-charcoal">
          Beranda
        </Link>
        <span>/</span>
        <Link href="/kategori" className="hover:text-hk-charcoal">
          11 Kategori
        </Link>
        <span>/</span>
        <span className="text-hk-charcoal font-bold">{activeCategory}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-hk-champagne/40 pb-6">
        <div className="space-y-2">
          <Link
            href="/kategori"
            className="inline-flex items-center gap-1.5 text-xs font-manrope font-semibold text-hk-taupe hover:underline mb-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Semua Kategori</span>
          </Link>
          <h1 className="font-editorial text-3xl sm:text-5xl text-hk-charcoal font-normal">
            Daftar Mitra Vendor: {activeCategory}
          </h1>
          <p className="font-manrope text-sm text-hk-charcoal/70 max-w-2xl leading-relaxed">
            Pilih vendor terpercaya di wilayah Kabupaten Kebumen. Seluruh mitra terverifikasi, menyediakan jadwal sesi fisik langsung, dan dilindungi oleh Rekening Bersama HariKita.
          </p>
        </div>

        {/* District Filter Dropdown */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Filter className="w-4 h-4 text-hk-taupe" />
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="rounded-full border border-hk-champagne/60 bg-white px-4 py-2 text-xs font-manrope font-semibold text-hk-charcoal shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-hk-taupe"
          >
            <option value="all">Semua Kecamatan di Kebumen</option>
            {KEBUMEN_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                Kecamatan {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vendors Listing Grid */}
      {filteredVendors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="group rounded-3xl bg-white border border-hk-champagne/50 shadow-xs hover:border-hk-taupe hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Cover Image with District Badge */}
                <div className="relative h-48 w-full bg-hk-charcoal overflow-hidden">
                  <Image
                    src={vendor.coverImage}
                    alt={vendor.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-manrope font-bold uppercase tracking-wider bg-white/90 text-hk-charcoal border border-hk-champagne/40 shadow-2xs flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-hk-taupe" />
                      <span>Kec. {vendor.district}</span>
                    </span>
                    {vendor.verified && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-manrope font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        <span>Terverifikasi</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-editorial text-2xl font-bold leading-tight">
                      {vendor.name}
                    </h3>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-manrope">
                    <div className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{vendor.rating}</span>
                      <span className="text-hk-charcoal/50 font-normal">
                        ({vendor.reviewCount} ulasan)
                      </span>
                    </div>

                    <span className="text-hk-charcoal/60 text-[11px]">
                      {vendor.packages.length} Pilihan Paket
                    </span>
                  </div>

                  <p className="font-manrope text-xs text-hk-charcoal/70 leading-relaxed line-clamp-2">
                    {vendor.bio}
                  </p>

                  {/* Lowest Price Callout */}
                  {vendor.packages[0] && (
                    <div className="pt-3 border-t border-hk-champagne/30 flex items-center justify-between text-xs font-manrope">
                      <div>
                        <span className="text-[10px] text-hk-charcoal/60 block">Mulai dari:</span>
                        <span className="font-mono font-bold text-hk-charcoal">
                          Rp {vendor.packages[0].price.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <span className="text-[10px] text-hk-taupe font-semibold bg-hk-soft-beige/70 px-2 py-0.5 rounded-full">
                        Call Time: {vendor.packages[0].callTime}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-5 pt-0 flex items-center gap-2">
                <Link
                  href={`/vendor/${vendor.slug}`}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-hk-champagne/60 bg-hk-ivory px-4 py-2 text-xs font-manrope font-bold text-hk-charcoal hover:bg-hk-taupe hover:text-white transition-all shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Portofolio</span>
                </Link>

                <Link
                  href={`/builder?cat=${vendor.categoryId}&vendor=${vendor.id}`}
                  className="rounded-full bg-hk-taupe text-white px-4 py-2 text-xs font-manrope font-bold hover:bg-hk-charcoal transition-all shadow-xs"
                >
                  Pilih
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white border border-hk-champagne/40 space-y-3">
          <p className="font-editorial text-2xl text-hk-charcoal">
            Belum ada mitra vendor di Kecamatan {selectedDistrict} untuk kategori ini.
          </p>
          <p className="font-manrope text-xs text-hk-charcoal/60">
            Coba pilih &quot;Semua Kecamatan di Kebumen&quot; untuk melihat seluruh mitra terdekat lainnya.
          </p>
          <button
            onClick={() => setSelectedDistrict("all")}
            className="px-5 py-2 rounded-full bg-hk-taupe text-white text-xs font-manrope font-bold hover:bg-hk-charcoal transition-all"
          >
            Reset Filter Kecamatan
          </button>
        </div>
      )}
    </div>
  );
}
