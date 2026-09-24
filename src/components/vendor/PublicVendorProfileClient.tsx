"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageCircle,
  ChevronLeft,
  Check,
  Heart,
  Images,
} from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { ROUTES } from "@/lib/routes";
import type { PublicVendor, PublicVendorProduct } from "@/server/queries/catalog";

/**
 * Profil publik vendor (client) — data dari DB (PublicVendor).
 */
export function PublicVendorProfileClient({ vendor }: { vendor: PublicVendor }) {
  const [activeTab, setActiveTab] = useState<"portfolio" | "produk">("portfolio");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [postPhotoIdx, setPostPhotoIdx] = useState(0);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const { addItem } = useCart();

  const handleAddProduct = (product: PublicVendorProduct) => {
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

  const isApproved = vendor.verificationStatus === "APPROVED";

  return (
    <div className="min-h-screen pb-20 bg-hk-ivory/30">
      {/* Banner status verifikasi: hanya untuk vendor yang belum tayang penuh */}
      {!isApproved && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="mx-auto flex max-w-6xl items-start gap-2.5 px-4 py-3 sm:px-6">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
            <p className="font-manrope text-xs leading-relaxed text-amber-900 sm:text-sm">
              <strong className="font-bold">Profil ini sedang menunggu verifikasi.</strong>{" "}
              Data ditampilkan sebagai pratinjau dan belum sepenuhnya tayang di direktori publik
              sampai disetujui oleh tim HariKita.
            </p>
          </div>
        </div>
      )}

      {/* Cover Banner */}
      <div className="relative h-64 sm:h-80 w-full bg-hk-charcoal overflow-hidden">
        {vendor.coverImage && (
          <Image
            src={vendor.coverImage}
            alt={vendor.name}
            fill
            className="object-cover opacity-80"
            sizes="100vw"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-hk-charcoal via-hk-charcoal/40 to-transparent" />

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
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-hk-ivory shrink-0">
                {vendor.avatar && (
                  <Image src={vendor.avatar} alt={vendor.name} fill className="object-cover" />
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full text-xs font-manrope font-bold uppercase tracking-wider bg-hk-soft-beige text-hk-taupe border border-hk-champagne/40">
                    {vendor.categoryTitle}
                  </span>
                  {isApproved ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-manrope font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Mitra Terverifikasi HariKita</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-manrope font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      <span>Menunggu Verifikasi</span>
                    </span>
                  )}
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

          {vendor.bio && (
            <div className="p-4 rounded-2xl bg-hk-ivory/50 border border-hk-champagne/30 text-xs sm:text-sm font-manrope text-hk-charcoal/80 leading-relaxed">
              {vendor.bio}
            </div>
          )}

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

        {/* TAB 1: PORTFOLIO */}
        {activeTab === "portfolio" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-editorial text-2xl font-bold text-hk-charcoal">
                Galeri Foto Dokumentasi &amp; Kreasi
              </h3>
              <p className="font-manrope text-xs text-hk-charcoal/70">
                Hasil karya asli di lokasi-lokasi terbaik Kabupaten Kebumen.
              </p>
            </div>

            {vendor.portfolio.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-hk-champagne/50 bg-hk-ivory/50 p-8 text-center text-xs font-manrope text-hk-charcoal/60">
                Belum ada portofolio.
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-hk-champagne/50 bg-hk-charcoal">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-0">
                  {vendor.portfolio.map((item, idx) => {
                    const cover = item.images[0] ?? item.url;
                    const multi = item.images.length > 1;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => {
                          setSelectedPost(idx);
                          setPostPhotoIdx(0);
                        }}
                        className="group relative aspect-square w-full overflow-hidden focus-ring"
                        aria-label={item.title}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cover}
                          alt={item.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* Overlay hover (detail singkat) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        {/* Ikon multi-foto (kanan atas) */}
                        {multi && (
                          <span className="absolute right-2 top-2 text-white drop-shadow-md" aria-label="Memiliki beberapa foto">
                            <Images className="h-4 w-4" />
                          </span>
                        )}
                        {/* Ikon love (kanan bawah) */}
                        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 text-white drop-shadow-md">
                          <Heart className="h-4 w-4 fill-white" />
                          <span className="text-[10px] font-manrope font-semibold">{item.likes}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
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
                    className="rounded-3xl bg-white border border-hk-champagne/60 shadow-xs hover:border-hk-taupe hover:shadow-md transition-all flex flex-col overflow-hidden"
                  >
                    <Link href={ROUTES.PRODUCT(vendor.slug, product.slug)} className="group block">
                      <div className="relative aspect-[4/3] w-full bg-hk-soft-beige/40 overflow-hidden">
                        {product.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-hk-taupe">
                            <Sparkles className="h-7 w-7" />
                          </div>
                        )}
                        <span className="absolute left-3 top-3 px-2.5 py-0.5 rounded-full text-[10px] font-manrope font-bold uppercase tracking-wider bg-white/90 text-hk-taupe border border-hk-champagne/50 backdrop-blur-sm">
                          {product.unitLabel}
                        </span>
                        {product.galleryImages.length > 1 && (
                          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-manrope font-semibold text-white backdrop-blur-sm">
                            <Images className="h-3 w-3" /> {product.galleryImages.length}
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                    <Link href={ROUTES.PRODUCT(vendor.slug, product.slug)} className="space-y-3 group">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full text-[10px] font-manrope font-bold uppercase tracking-wider bg-hk-soft-beige text-hk-taupe border border-hk-champagne/40">
                          {product.unitLabel}
                        </span>
                        <span className="text-xs font-mono font-semibold text-hk-taupe flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{product.callTime}</span>
                        </span>
                      </div>

                      <h4 className="font-editorial text-2xl font-bold text-hk-charcoal group-hover:text-hk-taupe transition-colors">
                        {product.name}
                      </h4>

                      <p className="font-manrope text-xs text-hk-charcoal/75 leading-relaxed line-clamp-3">
                        {product.desc}
                      </p>

                      {product.features.length > 0 && (
                        <div className="p-3 rounded-2xl bg-hk-ivory/60 border border-hk-champagne/40 space-y-2">
                          <span className="text-[10px] font-manrope font-bold text-hk-charcoal/70 uppercase tracking-wider block">
                            Kelengkapan Produk:
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
                      )}
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
                          isAdded ? "bg-emerald-600 text-white" : "bg-hk-taupe text-white hover:bg-hk-charcoal"
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
                <h4 className="font-editorial text-lg font-bold text-hk-charcoal">{vendor.name}</h4>
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
      {/* Post Detail Modal (gaya IG) */}
      {selectedPost !== null && vendor.portfolio[selectedPost] && (() => {
        const post = vendor.portfolio[selectedPost];
        const photos = post.images.length > 0 ? post.images : [post.url];
        const active = photos[Math.min(postPhotoIdx, photos.length - 1)];
        return (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedPost(null)}
          >
            <div
              className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-hk-champagne/60 grid grid-cols-1 md:grid-cols-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Foto besar */}
              <div className="relative aspect-square w-full bg-hk-charcoal">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={active} alt={post.title} className="h-full w-full object-cover" />
                {photos.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {photos.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 w-1.5 rounded-full ${i === Math.min(postPhotoIdx, photos.length - 1) ? "bg-white" : "bg-white/50"}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Detail */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-hk-champagne/30">
                  <span className="font-editorial text-lg font-bold text-hk-charcoal">{post.title}</span>
                  <button onClick={() => setSelectedPost(null)} className="text-hk-charcoal/60 hover:text-hk-charcoal text-lg leading-none">✕</button>
                </div>

                <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                  <span className="inline-flex items-center gap-1.5 text-xs font-manrope font-semibold text-hk-taupe">
                    <MapPin className="w-3.5 h-3.5" /> {post.locationTag || "Kebumen"}
                  </span>
                  <p className="font-manrope text-sm text-hk-charcoal/80 leading-relaxed">{post.caption}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {post.styleTags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-manrope font-semibold bg-hk-ivory text-hk-taupe border border-hk-champagne/40">#{tag}</span>
                    ))}
                  </div>
                </div>

                {photos.length > 1 && (
                  <div className="p-4 border-t border-hk-champagne/30 flex gap-2 overflow-x-auto">
                    {photos.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setPostPhotoIdx(i)}
                        className={`relative h-14 w-14 shrink-0 rounded-lg overflow-hidden border-2 ${i === Math.min(postPhotoIdx, photos.length - 1) ? "border-hk-taupe" : "border-transparent"}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-4 border-t border-hk-champagne/30 flex items-center gap-2">
                  <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  <span className="text-xs font-manrope font-bold text-hk-charcoal">{post.likes} suka</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
