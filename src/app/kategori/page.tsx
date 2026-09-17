"use client";

import React from "react";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  Camera,
  Scissors,
  Palette,
  Gift,
  Heart,
  Utensils,
  Cake,
  Mail,
  Map,
  Sparkles,
} from "lucide-react";
import { DecorativeDivider } from "@/components/harikita/ui";

const CATEGORY_DIRECTORY = [
  {
    slug: "prewed",
    title: "Pre-wedding Alam & Studio",
    icon: Camera,
    vendorCount: 18,
    desc: "Spot eksotis Pantai Menganti, Bukit Hud, hingga studio indoor ber-AC di pusat Kebumen Kota.",
    popularVendor: "Menganti Cinematic & Studio",
  },
  {
    slug: "busana",
    title: "Busana Pengantin & Fitting",
    icon: Scissors,
    vendorCount: 24,
    desc: "Sewa perdana kebaya modern, beskap adat Jawa Solo/Yogya halus, lengkap dengan 2x jadwal fitting fisik.",
    popularVendor: "Griya Busana Rarasati",
  },
  {
    slug: "mua",
    title: "Makeup Artist (MUA)",
    icon: Palette,
    vendorCount: 42,
    desc: "Riasan soft glam glowing, paes adat modern, hijab styling syar'i tahan 12 jam dengan ronce melati asli.",
    popularVendor: "Alula MUA & Hijab",
  },
  {
    slug: "seserahan",
    title: "Seserahan Akrilik & Mahar",
    icon: Gift,
    vendorCount: 16,
    desc: "Baki akrilik kristal kombinasi kayu jati, hiasan bunga sutra impor, serta pigura mahar custom 3D.",
    popularVendor: "Hantaran Lestari Kebumen",
  },
  {
    slug: "foto",
    title: "Dokumentasi Foto & Video",
    icon: Camera,
    vendorCount: 22,
    desc: "Liputan penuh akad dan resepsi, video teaser Reels 60s, film dokumenter 4K, dan flashdisk kayu grafir.",
    popularVendor: "Pradana Cinema & Story",
  },
  {
    slug: "dekor",
    title: "Dekorasi Pelaminan & Florist",
    icon: Heart,
    vendorCount: 29,
    desc: "Pelaminan intimate 4-6 meter bunga segar, karpet jalan permadani, dan photobooth lamaran estetik.",
    popularVendor: "Asmara Flora & Pelaminan",
  },
  {
    slug: "katering",
    title: "Katering Prasmanan & Stall",
    icon: Utensils,
    vendorCount: 35,
    desc: "Menu komplit khas Kebumen & nusantara, pramusaji standby, gratis Sample Box Test Food ke rumah.",
    popularVendor: "Dapur Rasa Boga Kebumen",
  },
  {
    slug: "cake",
    title: "Wedding Cake & Dessert",
    icon: Cake,
    vendorCount: 14,
    desc: "Kue pernikahan bertingkat custom senada dekorasi dan meja dessert sweet corner aneka kue mini.",
    popularVendor: "L'Aura Patisserie & Cakes",
  },
  {
    slug: "souvenir",
    title: "Souvenir Anyaman Pandan",
    icon: Gift,
    vendorCount: 19,
    desc: "Pouch ramah lingkungan kombinasi anyaman pandan pengrajin Gombong dan linen inisial nama pengantin.",
    popularVendor: "Kriya Anyam Gombong",
  },
  {
    slug: "undangan",
    title: "Undangan Digital & Wax Seal",
    icon: Mail,
    vendorCount: 12,
    desc: "Website undangan 65+ pilihan tema arketipe dan 100 pcs undangan cetak hardcover segel lilin 3D.",
    popularVendor: "HariKita Digital & Print",
  },
  {
    slug: "denah",
    title: "Cute Illustrated Map",
    icon: Map,
    vendorCount: 8,
    desc: "Ilustrasi peta kartun estetik rute gedung resepsi Kebumen terintegrasi barcode navigasi Google Maps.",
    popularVendor: "Denah Kita Kartun Estetik",
  },
];

export default function KategoriDirectoryPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-hk-soft-beige/80 text-hk-charcoal text-xs font-manrope font-bold uppercase tracking-widest border border-hk-champagne/50">
          <Compass className="w-3.5 h-3.5 text-hk-taupe" />
          <span>Direktori 11 Kategori Layanan Kebumen</span>
        </div>

        <h1 className="font-editorial text-4xl sm:text-6xl text-hk-charcoal font-normal tracking-tight">
          Temukan Vendor Terbaik di Setiap Sudut Kebumen
        </h1>

        <p className="font-manrope text-sm sm:text-base text-hk-charcoal/75 leading-relaxed">
          Lebih dari 200 mitra vendor pernikahan lokal Kebumen terkurasi dalam 11 kategori layanan terpadu. Pilih kategori untuk melihat daftar vendor, galeri portofolio, dan paket harga mereka.
        </p>
      </div>

      <div className="max-w-4xl mx-auto" aria-hidden="true">
        <DecorativeDivider variant="diamond" color="champagne" />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORY_DIRECTORY.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.slug}
              href={`/kategori/${cat.slug}`}
              className="group p-6 rounded-3xl bg-white border border-hk-champagne/50 shadow-xs hover:border-hk-taupe hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-hk-ivory border border-hk-champagne/60 flex items-center justify-center text-hk-taupe group-hover:scale-105 transition-transform shadow-2xs">
                    <Icon className="w-6 h-6 text-hk-taupe" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-manrope font-bold bg-hk-soft-beige text-hk-taupe border border-hk-champagne/40">
                    {cat.vendorCount} Mitra Vendor
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-editorial text-2xl font-bold text-hk-charcoal group-hover:text-hk-taupe transition-colors">
                    {cat.title}
                  </h3>
                  <p className="font-manrope text-xs text-hk-charcoal/70 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-hk-champagne/30 flex items-center justify-between text-xs font-manrope">
                <span className="text-hk-charcoal/60 truncate max-w-[170px]">
                  Contoh: {cat.popularVendor}
                </span>
                <span className="flex items-center gap-1 font-bold text-hk-taupe group-hover:translate-x-1 transition-transform">
                  <span>Lihat Vendor</span>
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
