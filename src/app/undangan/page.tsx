"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ALL_INVITATION_TEMPLATES, MASTER_ARCHETYPES } from "@/lib/templates/registry";
import { Sparkles, Eye, CheckCircle2, Filter, Search } from "lucide-react";

export default function UndanganCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "All",
    "Botanical",
    "Javanese",
    "Islamic",
    "Minimalist",
    "Rose Gold",
    "Rustic",
    "Celestial",
    "Cute",
  ];

  const filteredThemes = ALL_INVITATION_TEMPLATES.filter((theme) => {
    const matchesCategory =
      selectedCategory === "All" ||
      theme.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      theme.archetypeId.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      theme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.sourceOrigin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gold/15 text-plum-dark text-xs uppercase tracking-widest font-semibold border border-gold/30">
          <Sparkles className="w-3.5 h-3.5 text-gold-dark" />
          <span>Koleksi Terpadu 65+ Desain Undangan</span>
        </div>
        <h1 className="font-serif-luxury text-4xl sm:text-5xl text-plum font-bold tracking-tight">
          Katalog Undangan Digital Eksklusif
        </h1>
        <p className="text-sm text-plum-light leading-relaxed">
          Pilihan template website undangan digital terlengkap yang memadukan kehangatan estetika modern, animasi elegan, ornamen Islami, adat Jawa keraton, hingga amplop segel lilin 3D.
        </p>
      </div>

      {/* 8 Master Archetype Cards (Educational Bar) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {MASTER_ARCHETYPES.map((arch) => (
          <div
            key={arch.id}
            className="p-3 rounded-2xl bg-white/70 border border-gold/25 shadow-xs text-center space-y-1 hover:border-gold transition-colors"
          >
            <span className="text-[10px] font-bold text-gold-dark uppercase tracking-wider block">
              {arch.name.split(" ")[0]}
            </span>
            <p className="text-[9px] text-plum-light line-clamp-2 leading-snug">
              {arch.description}
            </p>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white/80 border border-gold/30 shadow-sm">
        {/* Category Pill Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "gold-gradient-bg text-plum-dark font-bold shadow-sm"
                  : "bg-[#FAF8F5] text-plum-light hover:bg-gold/15 border border-gold/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-plum-light absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tema..."
            className="input input-sm w-full pl-9 bg-[#FAF8F5] border border-gold/30 rounded-full text-xs text-plum focus:border-gold"
          />
        </div>
      </div>

      {/* Theme Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredThemes.map((theme) => (
          <div
            key={theme.id}
            className="group rounded-3xl overflow-hidden bg-white border border-gold/25 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Image Preview Container */}
              <div className="relative h-60 w-full overflow-hidden bg-[#FAF8F5]">
                <Image
                  src={theme.previewImageUrl}
                  alt={theme.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-plum-dark/85 text-white backdrop-blur-xs border border-white/20">
                    {theme.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold bg-white/90 text-plum shadow-xs">
                    {theme.sourceOrigin}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3">
                <div className="space-y-1">
                  <h3 className="font-serif-luxury text-xl font-bold text-plum group-hover:text-gold-dark transition-colors">
                    {theme.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-plum-light">
                    <span>Arketipe:</span>
                    <strong className="text-plum capitalize">{theme.archetypeId.replace("-", " ")}</strong>
                  </div>
                </div>

                {/* Color Palette Indicators */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-plum-light/70 mr-1">Palet:</span>
                  <span
                    className="w-4 h-4 rounded-full border border-gray-300 shadow-2xs"
                    style={{ backgroundColor: theme.colors.primary }}
                    title="Warna Utama"
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-gray-300 shadow-2xs"
                    style={{ backgroundColor: theme.colors.secondary }}
                    title="Warna Sekunder"
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-gray-300 shadow-2xs"
                    style={{ backgroundColor: theme.colors.accent }}
                    title="Warna Aksen"
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-gray-300 shadow-2xs"
                    style={{ backgroundColor: theme.colors.background }}
                    title="Warna Background"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-5 pt-0 grid grid-cols-2 gap-2">
              <Link
                href={`/undangan/demo?theme=${theme.id}&to=Bapak+Joko+dan+Keluarga&sesi=s1`}
                target="_blank"
                className="btn btn-xs btn-outline border-gold/40 text-plum font-bold rounded-full hover:bg-gold/15 flex items-center justify-center gap-1"
              >
                <Eye className="w-3.5 h-3.5 text-gold-dark" />
                <span>Lihat Demo</span>
              </Link>
              <Link
                href={`/builder?selectedTheme=${theme.id}`}
                className="btn btn-xs gold-gradient-bg text-plum-dark font-bold rounded-full border-none shadow-xs hover:brightness-105 flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pilih Tema</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
