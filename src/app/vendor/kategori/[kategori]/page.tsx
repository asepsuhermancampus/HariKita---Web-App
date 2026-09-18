"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Star, CheckCircle2, ArrowRight, Filter, ChevronLeft,
  Sparkles, Eye, Plus, Check,
} from "lucide-react";
import { KEBUMEN_DISTRICTS, type VendorProfile } from "@/data/multi-vendor-catalog";
import { getVendorCategory, getVendorsByCategory } from "@/lib/vendor-categories";
import { useCart } from "@/lib/cart-store";

interface PageProps {
  params: Promise<{ kategori: string }>;
}

export default function VendorCategoryDetailPage({ params }: PageProps) {
  const { kategori } = use(params);
  const category = getVendorCategory(kategori);
  const vendors = getVendorsByCategory(kategori);

  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [pendingSwap, setPendingSwap] = useState<VendorProfile | null>(null);

  const { items, addItem } = useCart();

  const allTags = Array.from(
    new Set(vendors.flatMap((v) => v.products.flatMap((p) => p.productTags)))
  ).sort();

  const filteredVendors = vendors.filter((v) => {
    const districtOk =
      selectedDistrict === "all" ||
      v.district.toLowerCase() === selectedDistrict.toLowerCase();
    const tagOk =
      selectedTag === "all" ||
      v.products.some((p) => p.productTags.includes(selectedTag));
    return districtOk && tagOk;
  });

  const plannedCount = items.length;
  const isPlanned = (vendorId: string) =>
    items.some((i) => i.vendorId === vendorId);

  const addVendorToPlan = (vendor: VendorProfile) => {
    const product = vendor.products[0];
    if (!product) return;
    addItem({
      categoryId: vendor.categoryId,
      categoryTitle: vendor.categoryTitle,
      vendorId: vendor.id,
      vendorName: vendor.name,
      district: vendor.district,
      packageId: product.id,
      packageName: product.name,
      unitPrice: product.price,
      quantity: product.unitType === "package" ? 1 : (product.minQuantity ?? 1),
      callTime: product.callTime,
      notes: product.desc,
      unitLabel: product.unitLabel,
      productSlug: product.slug,
    });
  };

  const handlePlanClick = (vendor: VendorProfile) => {
    const existing = items.find((i) => i.categoryId === vendor.categoryId);
    if (existing && existing.vendorId !== vendor.id) {
      setPendingSwap(vendor);
      return;
    }
    addVendorToPlan(vendor);
  };

  const confirmSwap = () => {
    if (pendingSwap) addVendorToPlan(pendingSwap);
    setPendingSwap(null);
  };

  if (!category) {
    return (
      <div className="min-h-screen py-20 px-4 max-w-3xl mx-auto text-center space-y-4">
        <h1 className="font-editorial text-3xl text-hk-charcoal">
          Kategori tidak ditemukan
        </h1>
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
            href="/vendor"
            className="inline-flex items-center gap-1.5 text-xs font-manrope font-semibold text-hk-taupe hover:underline mb-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Semua Kategori</span>
          </Link>
          <h1 className="font-editorial text-3xl sm:text-5xl text-hk-charcoal">
            Vendor {category.title}
          </h1>
          <p className="font-manrope text-sm text-hk-charcoal/70 max-w-2xl leading-relaxed">
            {vendors.length} mitra terverifikasi siap berkolaborasi. Tambahkan ke
            rencana Anda, lalu racik paketnya di simulator.
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

          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="rounded-full border border-hk-champagne/60 bg-white px-4 py-2 text-xs font-manrope font-semibold text-hk-charcoal shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-hk-taupe"
            aria-label="Filter jenis produk"
          >
            <option value="all">Semua Jenis</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>#{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Vendor Grid */}
      {filteredVendors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => {
            const planned = isPlanned(vendor.id);
            return (
              <div
                key={vendor.id}
                className="group rounded-3xl bg-white border border-hk-champagne/50 shadow-xs hover:border-hk-taupe hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
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
                    {planned && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-manrope font-bold bg-hk-taupe text-white shadow-2xs flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Di Rencana</span>
                      </span>
                    )}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-editorial text-2xl font-bold leading-tight">
                        {vendor.name}
                      </h3>
                    </div>
                  </div>

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
                        {vendor.products.length} Pilihan Produk
                      </span>
                    </div>
                    <p className="font-manrope text-xs text-hk-charcoal/70 leading-relaxed line-clamp-2">
                      {vendor.bio}
                    </p>
                    {vendor.products[0] && (
                      <div className="pt-3 border-t border-hk-champagne/30 flex items-center justify-between text-xs font-manrope">
                        <div>
                          <span className="text-[10px] text-hk-charcoal/60 block">Mulai dari:</span>
                          <span className="font-mono font-bold text-hk-charcoal">
                            Rp {vendor.products[0].price.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <span className="text-[10px] text-hk-taupe font-semibold bg-hk-soft-beige/70 px-2 py-0.5 rounded-full">
                          Call Time: {vendor.products[0].callTime}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePlanClick(vendor)}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-manrope font-bold transition-all shadow-2xs ${
                      planned
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-hk-taupe text-white hover:bg-hk-charcoal"
                    }`}
                  >
                    {planned ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{planned ? "Sudah di Rencana" : "+ Rencana"}</span>
                  </button>
                  <Link
                    href={`/vendor/${vendor.slug}`}
                    className="flex items-center justify-center gap-1.5 rounded-full border border-hk-champagne/60 bg-hk-ivory px-4 py-2 text-xs font-manrope font-bold text-hk-charcoal hover:bg-hk-taupe hover:text-white transition-all shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Profil</span>
                  </Link>
                </div>
              </div>
            );
          })}
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

      {/* Sticky Summary Bar */}
      {plannedCount > 0 && (
        <div className="sticky bottom-4 z-30 mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-3 rounded-full bg-hk-charcoal text-white px-5 py-3 shadow-xl">
            <span className="font-manrope text-xs font-semibold">
              {plannedCount} layanan di rencana
            </span>
            <Link
              href="/builder"
              className="inline-flex items-center gap-1.5 rounded-full bg-hk-taupe px-4 py-1.5 text-xs font-manrope font-bold hover:bg-white hover:text-hk-charcoal transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Racik sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Swap Confirmation Modal */}
      {pendingSwap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 space-y-4 shadow-2xl">
            <h2 className="font-editorial text-2xl text-hk-charcoal">
              Ganti vendor {category.title}?
            </h2>
            <p className="font-manrope text-sm text-hk-charcoal/70 leading-relaxed">
              Kategori ini sudah berisi pilihan lain. Mengganti akan menghapus
              pilihan sebelumnya dan memakai{" "}
              <strong className="text-hk-charcoal">{pendingSwap.name}</strong>.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPendingSwap(null)}
                className="rounded-full border border-hk-champagne/60 bg-white px-4 py-2 text-xs font-manrope font-bold text-hk-charcoal hover:bg-hk-ivory transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmSwap}
                className="rounded-full bg-hk-taupe px-4 py-2 text-xs font-manrope font-bold text-white hover:bg-hk-charcoal transition-all"
              >
                Ganti Vendor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
