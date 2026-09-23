"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, CheckCircle2, Minus, Plus, Sparkles, Check, Clock, MapPin } from "lucide-react";
import { getVendorBySlug, getProduct } from "@/lib/vendor-categories";
import { useCart } from "@/lib/cart-store";
import { isReservedVendorSlug } from "@/lib/routes";

interface PageProps {
  params: Promise<{ slug: string; productSlug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { slug, productSlug } = use(params);
  const vendor = isReservedVendorSlug(slug) ? undefined : getVendorBySlug(slug);
  const product = vendor ? getProduct(slug, productSlug) : undefined;
  const { addItem } = useCart();
  const [qty, setQty] = useState(product?.minQuantity ?? 1);
  const [added, setAdded] = useState(false);

  if (!vendor || !product) {
    return (
      <div className="min-h-screen py-20 px-4 max-w-3xl mx-auto text-center space-y-4">
        <h1 className="font-editorial text-3xl text-hk-charcoal">Produk tidak ditemukan</h1>
        <Link href="/vendor" className="text-hk-taupe font-manrope font-bold hover:underline">
          Kembali ke Katalog Vendor
        </Link>
      </div>
    );
  }

  const locked = product.unitType === "package";
  const min = product.minQuantity ?? 1;
  const max = product.maxQuantity;
  const estimate = product.price * (locked ? 1 : qty);

  const clampQty = (value: number) => {
    const lower = Math.max(min, value);
    return typeof max === "number" ? Math.min(lower, max) : lower;
  };

  const handleAdd = () => {
    addItem({
      categoryId: vendor.categoryId,
      categoryTitle: vendor.categoryTitle,
      vendorId: vendor.id,
      vendorName: vendor.name,
      district: vendor.district,
      packageId: product.id,
      packageName: product.name,
      unitPrice: product.price,
      quantity: locked ? 1 : qty,
      callTime: product.callTime,
      notes: product.desc,
      unitLabel: product.unitLabel,
      productSlug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-wrap items-center gap-2 text-xs font-manrope text-hk-charcoal/70">
        <Link href="/vendor" className="hover:text-hk-charcoal">Katalog</Link>
        <span>/</span>
        <Link href={`/vendor/kategori/${vendor.categoryId}`} className="hover:text-hk-charcoal">
          {vendor.categoryTitle}
        </Link>
        <span>/</span>
        <Link href={`/vendor/${vendor.slug}`} className="hover:text-hk-charcoal">{vendor.name}</Link>
        <span>/</span>
        <span className="text-hk-charcoal font-bold">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-hk-champagne/50 bg-hk-charcoal">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width:1024px) 100vw, 600px"
          />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-manrope font-bold uppercase tracking-wider bg-hk-soft-beige text-hk-taupe border border-hk-champagne/40">
              {vendor.categoryTitle}
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-hk-charcoal">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs font-manrope text-hk-charcoal/70">
              <span className="flex items-center gap-1 font-semibold text-hk-taupe">
                <MapPin className="w-3.5 h-3.5" />
                {vendor.name} · Kec. {vendor.district}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {product.callTime}
              </span>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <span className="font-mono text-3xl font-bold text-hk-charcoal">
              Rp {product.price.toLocaleString("id-ID")}
            </span>
            <span className="text-sm font-manrope text-hk-charcoal/60 mb-1">{product.unitLabel}</span>
          </div>

          <p className="font-manrope text-sm text-hk-charcoal/75 leading-relaxed">{product.desc}</p>

          <div className="p-4 rounded-2xl bg-hk-ivory/60 border border-hk-champagne/40 space-y-2">
            <span className="text-[10px] font-manrope font-bold text-hk-charcoal/70 uppercase tracking-wider block">
              Kelengkapan:
            </span>
            {product.features.map((feat) => (
              <div key={feat} className="flex items-start gap-2 text-xs font-manrope text-hk-charcoal/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-hk-taupe shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {!locked && (
            <div className="space-y-2">
              <span className="text-xs font-manrope font-bold text-hk-charcoal/70">
                Jumlah ({product.unitLabel})
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQty((q) => clampQty(q - 1))}
                  className="w-10 h-10 rounded-full border border-hk-champagne/60 bg-white flex items-center justify-center hover:bg-hk-ivory"
                  aria-label="Kurangi jumlah"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={qty}
                  min={min}
                  max={max}
                  onChange={(e) => setQty(clampQty(Number(e.target.value) || min))}
                  className="w-24 text-center rounded-xl border border-hk-champagne/60 py-2 font-mono font-bold"
                  aria-label="Jumlah"
                />
                <button
                  type="button"
                  onClick={() => setQty((q) => clampQty(q + 1))}
                  className="w-10 h-10 rounded-full border border-hk-champagne/60 bg-white flex items-center justify-center hover:bg-hk-ivory"
                  aria-label="Tambah jumlah"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-xs font-manrope text-hk-charcoal/60">
                  Min. {min}
                  {typeof max === "number" ? ` · Maks. ${max}` : ""}
                </span>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-hk-champagne/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-manrope text-hk-charcoal/60 block">Estimasi Total:</span>
              <span className="font-mono text-xl font-bold text-hk-charcoal">
                Rp {estimate.toLocaleString("id-ID")}
              </span>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              className={`flex items-center gap-1.5 px-6 py-3 rounded-full text-sm font-manrope font-bold transition-all shadow-xs ${
                added ? "bg-emerald-600 text-white" : "bg-hk-taupe text-white hover:bg-hk-charcoal"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tersimpan di Keranjang!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Tambah ke Keranjang</span>
                </>
              )}
            </button>
          </div>

          <Link
            href={`/vendor/${vendor.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-manrope font-semibold text-hk-taupe hover:underline"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke {vendor.name}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
