"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Star,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Share2,
  Heart,
  ChevronLeft,
  Check,
} from "lucide-react";
import { MULTI_VENDOR_CATALOG } from "@/data/multi-vendor-catalog";
import type { VendorProduct } from "@/data/product-types";
import { getVendorBySlug } from "@/lib/vendor-categories";
import { useCart } from "@/lib/cart-store";
import { isReservedVendorSlug, ROUTES } from "@/lib/routes";
import { usePortfolio } from "@/lib/portfolio-store";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function PublicVendorProfilePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const vendorSlug = resolvedParams.slug;

  const vendor =
    (isReservedVendorSlug(vendorSlug) ? undefined : getVendorBySlug(vendorSlug)) ||
    MULTI_VENDOR_CATALOG[0]; // fallback for demo

  const dynamicPosts = usePortfolio(vendorSlug);

  const mergedPortfolio = [
    ...dynamicPosts.map((p) => ({
      id: p.id,
      url: p.imageUrl,
      caption: p.caption,
      locationTag: p.locationTag,
      styleTags: p.styleTags,
    })),
    ...vendor.portfolio.filter((p) => !dynamicPosts.some((dp) => dp.id === p.id)),
  ];

  const [activeTab, setActiveTab] = useState<"portfolio" | "produk">("portfolio");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const { addItem } = useCart();

  const handleAddProduct = (product: VendorProduct) => {
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
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2500);
  };

  const waContactMessage = encodeURIComponent(
    `Halo Tim HariKita Kebumen, saya ingin menanyakan jadwal ketersediaan untuk mitra vendor "${vendor.name}" (Kategori: ${vendor.categoryTitle}). Mohon info tanggal yang masih terbuka.`
  );

  return (
    <div className="min-h-screen pb-20 bg-hk-ivory/30">
      {/* Cover Banner */}
      <div className="relative h-64 sm:h-80 w-full bg-hk-charcoal overflow-hidden">
        <Image
          src={vendor.coverImage}
          alt={vendor.name}
          fill
          className="object-cover opacity-80"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-hk-charcoal via-hk-charcoal/40 to-transparent" />

        {/* Back Link */}
        <div className="absolute top-4 left-4 sm:left-8 z-10">
          <Link
            href={ROUTES.KATEGORI_DETAIL(vendor.categoryId)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-manrope font-semibold backdrop-blur-md hover:bg-black/80 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Daftar {vendor.categoryTitle}</span>
          </Link>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-20 relative z-20 space-y-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-hk-champagne/60 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar Studio */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-hk-ivory shrink-0">
                <Image
                  src={vendor.avatar}
                  alt={vendor.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Title & Category */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full text-xs font-manrope font-bold uppercase tracking-wider bg-hk-soft-beige text-hk-taupe border border-hk-champagne/40">
                    {vendor.categoryTitle}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-manrope font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Mitra Terverifikasi HariKita</span>
                  </span>
                </div>

                <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-hk-charcoal leading-tight">
                  {vendor.name}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-xs font-manrope text-hk-charcoal/70">
                  <span className="flex items-center gap-1 font-semibold text-hk-taupe">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Kecamatan {vendor.district}, Kebumen</span>
                  </span>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{vendor.rating}</span>
                    <span className="text-hk-charcoal/50 font-normal">
                      ({vendor.reviewCount} ulasan pengantin)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <a
                href={`https://wa.me/6281234567890?text=${waContactMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-hk-champagne/60 bg-white text-xs font-manrope font-semibold text-hk-charcoal hover:bg-hk-ivory transition-all shadow-2xs"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Tanya Jadwal via HariKita</span>
              </a>

              <Link
                href="/builder"
                className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-hk-taupe text-white text-xs font-manrope font-bold hover:bg-hk-charcoal transition-all shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Buka Racikan</span>
              </Link>
            </div>
          </div>

          {/* Bio Description (Sanitized Content) */}
          <div className="p-4 rounded-2xl bg-hk-ivory/50 border border-hk-champagne/30 text-xs sm:text-sm font-manrope text-hk-charcoal/80 leading-relaxed">
            {vendor.bio}
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 border-b border-hk-champagne/40 pt-2">
            <button
              onClick={() => setActiveTab("portfolio")}
              className={`px-5 py-2.5 text-xs font-manrope font-bold border-b-2 transition-all ${
                activeTab === "portfolio"
                  ? "border-hk-taupe text-hk-charcoal"
                  : "border-transparent text-hk-charcoal/60 hover:text-hk-charcoal"
              }`}
            >
              Galeri Portofolio Hasil Karya ({vendor.portfolio.length})
            </button>
            <button
              onClick={() => setActiveTab("produk")}
              className={`px-5 py-2.5 text-xs font-manrope font-bold border-b-2 transition-all ${
                activeTab === "produk"
                  ? "border-hk-taupe text-hk-charcoal"
                  : "border-transparent text-hk-charcoal/60 hover:text-hk-charcoal"
              }`}
            >
              Pilihan Produk Layanan ({vendor.products.length})
            </button>
          </div>
        </div>

        {/* TAB 1: SOCIAL-MEDIA STYLE PORTFOLIO FEED */}
        {activeTab === "portfolio" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-editorial text-2xl font-bold text-hk-charcoal">
                  Galeri Foto Dokumentasi &amp; Kreasi
                </h3>
                <p className="font-manrope text-xs text-hk-charcoal/70">
                  Hasil karya asli di lokasi-lokasi terbaik Kabupaten Kebumen.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mergedPortfolio.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedPhoto(item.url)}
                  className="group rounded-3xl bg-white border border-hk-champagne/50 shadow-xs hover:border-hk-taupe hover:shadow-lg transition-all overflow-hidden cursor-pointer"
                >
                  <div className="relative aspect-[4/3] w-full bg-hk-charcoal overflow-hidden">
                    <Image
                      src={item.url}
                      alt={item.caption}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
                      <p className="font-manrope text-xs font-semibold">{item.caption}</p>
                      <p className="text-[10px] text-hk-champagne flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{item.locationTag}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <p className="font-manrope text-xs text-hk-charcoal font-medium">
                      {item.caption}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.styleTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full text-[10px] font-manrope font-semibold bg-hk-ivory text-hk-taupe border border-hk-champagne/40"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS & PRICING */}
        {activeTab === "produk" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-editorial text-2xl font-bold text-hk-charcoal">
                Daftar Produk &amp; Harga Resmi
              </h3>
              <p className="font-manrope text-xs text-hk-charcoal/70">
                Pilih produk untuk diatur jumlahnya, atau langsung masukkan ke racikan acara Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vendor.products.map((product) => {
                const isAdded = addedProductId === product.id;
                const locked = product.unitType === "package";
                return (
                  <div
                    key={product.id}
                    className="p-6 rounded-3xl bg-white border border-hk-champagne/60 shadow-xs space-y-4 hover:border-hk-taupe hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <Link
                      href={ROUTES.PRODUCT(vendor.slug, product.slug)}
                      className="space-y-3 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full text-[10px] font-manrope font-bold uppercase tracking-wider bg-hk-soft-beige text-hk-taupe border border-hk-champagne/40">
                          {product.unitLabel}
                        </span>
                        <span className="text-xs font-mono font-semibold text-hk-taupe flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Call Time: {product.callTime}</span>
                        </span>
                      </div>

                      <h4 className="font-editorial text-2xl font-bold text-hk-charcoal group-hover:text-hk-taupe transition-colors">
                        {product.name}
                      </h4>

                      <p className="font-manrope text-xs text-hk-charcoal/75 leading-relaxed">
                        {product.desc}
                      </p>

                      <div className="p-3 rounded-2xl bg-hk-ivory/60 border border-hk-champagne/40 space-y-2">
                        <span className="text-[10px] font-manrope font-bold text-hk-charcoal/70 uppercase tracking-wider block">
                          Kelengkapan Produk (Inclusions):
                        </span>
                        <div className="space-y-1.5">
                          {product.features.map((feat, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs font-manrope text-hk-charcoal/80">
                              <CheckCircle2 className="w-3.5 h-3.5 text-hk-taupe shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Link>

                    <div className="pt-4 border-t border-hk-champagne/40 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-manrope text-hk-charcoal/60 block">
                          Harga {locked ? "Paket" : "Satuan"}:
                        </span>
                        <span className="font-mono text-xl font-bold text-hk-charcoal">
                          Rp {product.price.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddProduct(product)}
                        className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-manrope font-bold transition-all shadow-xs ${
                          isAdded
                            ? "bg-emerald-600 text-white"
                            : "bg-hk-taupe text-white hover:bg-hk-charcoal"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Tersimpan di Draf!</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Pilih ke Racikan</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-hk-champagne/60"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/10] w-full bg-hk-charcoal">
              <Image
                src={selectedPhoto}
                alt="Portofolio Estetik HariKita"
                fill
                className="object-contain"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all text-xs"
              >
                ✕
              </button>
            </div>
            <div className="p-5 bg-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-manrope font-bold uppercase tracking-wider text-hk-taupe">
                  Dokumentasi Estetik Kebumen
                </span>
                <h4 className="font-editorial text-lg font-bold text-hk-charcoal">
                  {vendor.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="px-4 py-1.5 rounded-full bg-hk-taupe text-white text-xs font-manrope font-semibold hover:bg-hk-charcoal transition-colors"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
