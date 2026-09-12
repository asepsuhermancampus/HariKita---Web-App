'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Copy,
  Check,
  Heart,
  Share2,
  Bookmark,
  ArrowRight,
  Smartphone,
  Layers,
  Palette,
  Type,
  Grid,
} from 'lucide-react';
import { HariKitaLogo } from '@/components/brand/HariKitaLogo';
import {
  ButtonPrimary,
  ButtonSecondary,
  ButtonGhost,
  ButtonDark,
  IconButtonCircle,
  ToggleSwitch,
  PaginationControls,
  BadgePremium,
  BadgeNew,
  WaxSealBadge,
  VintageStampBadge,
  ArchFrameCard,
  DecorativeDivider,
  SerifQuoteCard,
  FloralCornerCard,
} from '@/components/harikita/ui';
import {
  MobileHeader,
  MobileHero,
  MobileServiceCard,
  MobileInvitationPreview,
  MobileBottomNav,
  MobileStickyBookingBar,
} from '@/components/harikita/mobile';
import { getHariKitaAssets, getAllCategories } from '@/lib/harikita-assets';

export default function DesignSystemShowcasePage() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [assetColor, setAssetColor] = useState<'taupe' | 'charcoal' | 'champagne' | 'soft-beige'>('taupe');
  const [toggleState, setToggleState] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mobileTab, setMobileTab] = useState<string>('beranda');

  const allAssets = getHariKitaAssets();
  const categories = ['all', ...getAllCategories()];

  const filteredAssets =
    activeCategory === 'all'
      ? allAssets
      : allAssets.filter((a) => a.category === activeCategory);

  const colors = [
    { name: 'Charcoal', hex: '#2B2B2B', rgb: '43, 43, 43', usage: 'Primary Text, Dark Sections, Deep Accents', class: 'bg-hk-charcoal', textClass: 'text-hk-charcoal' },
    { name: 'Taupe', hex: '#88735B', rgb: '136, 115, 91', usage: 'Primary Brand Color, Primary Buttons, Symbols', class: 'bg-hk-taupe', textClass: 'text-hk-taupe' },
    { name: 'Champagne', hex: '#C9A88A', rgb: '201, 168, 138', usage: 'Borders, Outlines, Muted Accents, Foil', class: 'bg-hk-champagne', textClass: 'text-hk-champagne' },
    { name: 'Soft Beige', hex: '#E8DED1', rgb: '232, 222, 209', usage: 'Dividers, Secondary Surfaces, Subtle Pills', class: 'bg-hk-soft-beige', textClass: 'text-hk-soft-beige' },
    { name: 'Ivory', hex: '#F8F6F1', rgb: '248, 246, 241', usage: 'Background Canvas, Card Containers', class: 'bg-hk-ivory', textClass: 'text-hk-ivory' },
  ];

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const assetColorClasses = {
    taupe: 'text-hk-taupe',
    charcoal: 'text-hk-charcoal',
    champagne: 'text-hk-champagne',
    'soft-beige': 'text-hk-soft-beige',
  };

  return (
    <div className="min-h-screen bg-hk-ivory text-hk-charcoal selection:bg-hk-champagne selection:text-white">
      {/* Sticky Showcase Topbar */}
      <nav className="sticky top-0 z-50 border-b border-hk-champagne/40 bg-white/90 px-6 py-3.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <HariKitaLogo variant="horizontal" size="sm" asLink={false} />
            <div className="hidden h-5 w-[1px] bg-hk-champagne/40 md:block" />
            <span className="hidden font-editorial text-sm font-medium italic text-hk-taupe md:inline">
              Design System &amp; Visual Rebuild
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-manrope font-semibold">
            <a href="#palette" className="rounded-full px-3 py-1.5 text-hk-charcoal transition-colors hover:bg-hk-soft-beige/50">
              Palet
            </a>
            <a href="#typography" className="rounded-full px-3 py-1.5 text-hk-charcoal transition-colors hover:bg-hk-soft-beige/50">
              Tipografi
            </a>
            <a href="#assets" className="rounded-full px-3 py-1.5 text-hk-charcoal transition-colors hover:bg-hk-soft-beige/50">
              Aset ({allAssets.length})
            </a>
            <a href="#components" className="rounded-full px-3 py-1.5 text-hk-charcoal transition-colors hover:bg-hk-soft-beige/50">
              Komponen UI
            </a>
            <a href="#mobile" className="rounded-full px-3 py-1.5 text-hk-charcoal transition-colors hover:bg-hk-soft-beige/50">
              Mobile Simulator
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="border-b border-hk-champagne/30 bg-gradient-to-b from-white to-hk-ivory px-6 py-16 text-center">
        <div className="mx-auto max-w-4xl">
          <BadgePremium label="OFFICIAL DESIGN SYSTEM" variant="pill" className="mb-4" />
          <h1 className="font-editorial text-4xl font-normal tracking-tight text-hk-charcoal md:text-6xl">
            HariKita Visual Language
          </h1>
          <p className="mt-4 font-editorial text-xl italic text-hk-taupe">
            "Rangkai Hari Bahagiamu, Menyelaraskan Restu &amp; Impian."
          </p>
          <p className="mx-auto mt-3 max-w-2xl font-manrope text-sm leading-relaxed text-hk-charcoal/80">
            Sistem visual komprehensif berstandar editorial luxury untuk platform lamaran &amp; pernikahan
            hyperlocal Kabupaten Kebumen. Berbasis 5 palet warna resmi, tipografi Cormorant Garamond &amp; Manrope,
            134 aset fine-line SVG, dan komponen modular.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16 space-y-24">
        {/* SECTION 1: 5-COLOR PALETTE */}
        <section id="palette" className="scroll-mt-20">
          <div className="mb-8 flex items-center justify-between border-b border-hk-champagne/40 pb-4">
            <div>
              <div className="flex items-center gap-2 text-hk-taupe">
                <Palette className="h-5 w-5" />
                <span className="font-manrope text-xs font-bold uppercase tracking-widest">
                  Brand Foundation
                </span>
              </div>
              <h2 className="mt-1 font-editorial text-3xl font-normal text-hk-charcoal">
                5-Color Palette
              </h2>
            </div>
            <p className="font-manrope text-xs text-hk-taupe">
              Klik swatch untuk menyalin kode HEX
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {colors.map((c) => (
              <div
                key={c.name}
                onClick={() => handleCopy(c.hex)}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-hk-champagne/40 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-hk-taupe hover:shadow-md cursor-pointer"
              >
                <div
                  className={`h-36 w-full rounded-xl ${c.class} relative flex items-end justify-end p-3 transition-transform group-hover:scale-[1.02]`}
                >
                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-manrope font-semibold text-hk-charcoal backdrop-blur-sm">
                    {copiedColor === c.hex ? (
                      <span className="flex items-center gap-1 text-emerald-700">
                        <Check className="h-3 w-3" /> Tersalin
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy className="h-3 w-3" /> Salin
                      </span>
                    )}
                  </span>
                </div>
                <div className="pt-3 pb-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-editorial text-xl font-medium text-hk-charcoal">
                      {c.name}
                    </h3>
                    <code className="font-mono text-xs font-bold text-hk-taupe">
                      {c.hex}
                    </code>
                  </div>
                  <p className="mt-0.5 text-[11px] font-mono text-hk-charcoal/60">
                    RGB: {c.rgb}
                  </p>
                  <p className="mt-2 text-xs font-manrope text-hk-charcoal/80 line-clamp-2">
                    {c.usage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: TYPOGRAPHY SPECIMEN */}
        <section id="typography" className="scroll-mt-20">
          <div className="mb-8 flex items-center justify-between border-b border-hk-champagne/40 pb-4">
            <div>
              <div className="flex items-center gap-2 text-hk-taupe">
                <Type className="h-5 w-5" />
                <span className="font-manrope text-xs font-bold uppercase tracking-widest">
                  Editorial Hierarchy
                </span>
              </div>
              <h2 className="mt-1 font-editorial text-3xl font-normal text-hk-charcoal">
                Typography Specimen
              </h2>
            </div>
            <span className="font-manrope text-xs text-hk-taupe">
              Cormorant Garamond + Manrope
            </span>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Display Font */}
            <div className="rounded-2xl border border-hk-champagne/40 bg-white p-8 shadow-sm">
              <span className="rounded-full bg-hk-soft-beige px-3 py-1 font-manrope text-xs font-bold uppercase tracking-wider text-hk-taupe">
                Display &amp; Headings
              </span>
              <h3 className="mt-4 font-editorial text-4xl text-hk-charcoal">
                Cormorant Garamond
              </h3>
              <p className="mt-2 font-editorial text-lg italic text-hk-taupe">
                Elegan, hangat, dan sarat kehormatan adat &amp; keanggunan modern.
              </p>

              <div className="mt-6 space-y-4 border-t border-hk-soft-beige pt-6">
                <div>
                  <span className="font-manrope text-[11px] uppercase tracking-wider text-hk-champagne">
                    Display Title (60px)
                  </span>
                  <div className="font-editorial text-4xl md:text-5xl text-hk-charcoal leading-tight">
                    Rangkai Hari Bahagiamu
                  </div>
                </div>
                <div>
                  <span className="font-manrope text-[11px] uppercase tracking-wider text-hk-champagne">
                    Heading 2 (36px)
                  </span>
                  <div className="font-editorial text-2xl md:text-3xl text-hk-charcoal">
                    Menyelaraskan Restu &amp; Impian
                  </div>
                </div>
                <div>
                  <span className="font-manrope text-[11px] uppercase tracking-wider text-hk-champagne">
                    Editorial Italic (24px)
                  </span>
                  <div className="font-editorial text-xl md:text-2xl italic text-hk-taupe">
                    "Dari Menganti hingga pusat Kebumen, setiap detail tertata sempurna."
                  </div>
                </div>
              </div>
            </div>

            {/* Body Font */}
            <div className="rounded-2xl border border-hk-champagne/40 bg-white p-8 shadow-sm">
              <span className="rounded-full bg-hk-soft-beige px-3 py-1 font-manrope text-xs font-bold uppercase tracking-wider text-hk-taupe">
                UI &amp; Body Text
              </span>
              <h3 className="mt-4 font-manrope text-3xl font-bold text-hk-charcoal">
                Manrope
              </h3>
              <p className="mt-2 font-manrope text-sm text-hk-taupe">
                Modern, ergonomis, berkejelasan tinggi pada layar ponsel keluarga.
              </p>

              <div className="mt-6 space-y-4 border-t border-hk-soft-beige pt-6">
                <div>
                  <span className="font-manrope text-[11px] uppercase tracking-wider text-hk-champagne">
                    Button &amp; Navigation (14px Bold / Uppercase)
                  </span>
                  <div className="font-manrope text-sm font-semibold tracking-wider text-hk-charcoal">
                    MULAI SEKARANG • JELAJAHI VENDOR • BOOKING TANGGAL
                  </div>
                </div>
                <div>
                  <span className="font-manrope text-[11px] uppercase tracking-wider text-hk-champagne">
                    Body Regular (15px)
                  </span>
                  <p className="font-manrope text-sm leading-relaxed text-hk-charcoal/80">
                    HariKita memberikan perlindungan rekening bersama (escrow) terpercaya,
                    kontrak digital transparan, serta kurasi vendor lokal terbaik di Kebumen
                    tanpa biaya tersembunyi.
                  </p>
                </div>
                <div>
                  <span className="font-manrope text-[11px] uppercase tracking-wider text-hk-champagne">
                    Numerical Data &amp; Badges (12px SemiBold)
                  </span>
                  <div className="font-manrope text-xs font-semibold text-hk-taupe">
                    IDR 15.000.000 • DP 30% H-30 • PELUNASAN H-7 ACARA
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: ASSET CATALOG GALLERY */}
        <section id="assets" className="scroll-mt-20">
          <div className="mb-6 flex flex-col gap-4 border-b border-hk-champagne/40 pb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-hk-taupe">
                <Grid className="h-5 w-5" />
                <span className="font-manrope text-xs font-bold uppercase tracking-widest">
                  Vector Visual Assets
                </span>
              </div>
              <h2 className="mt-1 font-editorial text-3xl font-normal text-hk-charcoal">
                Asset Catalog ({filteredAssets.length} / {allAssets.length})
              </h2>
            </div>

            {/* Live Color Swapper for Assets */}
            <div className="flex items-center gap-2">
              <span className="font-manrope text-xs font-semibold text-hk-charcoal/70">
                Warna Stroke:
              </span>
              <div className="flex rounded-full border border-hk-champagne/60 bg-white p-1">
                {(['taupe', 'charcoal', 'champagne', 'soft-beige'] as const).map((clr) => (
                  <button
                    key={clr}
                    onClick={() => setAssetColor(clr)}
                    className={`rounded-full px-3 py-1 text-xs font-manrope font-semibold capitalize transition-colors ${
                      assetColor === clr
                        ? 'bg-hk-taupe text-white shadow-sm'
                        : 'text-hk-charcoal/70 hover:text-hk-charcoal'
                    }`}
                  >
                    {clr}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 pb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-manrope font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-hk-taupe text-white font-semibold shadow-sm'
                    : 'bg-white border border-hk-champagne/40 text-hk-charcoal hover:border-hk-taupe'
                }`}
              >
                {cat.replace(/-/g, ' ')}
              </button>
            ))}
          </div>

          {/* Asset Grid */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="group flex flex-col items-center justify-between rounded-xl border border-hk-champagne/40 bg-white p-3 shadow-sm transition-all hover:border-hk-taupe hover:shadow-md"
              >
                {/* Asset Preview Container */}
                <div
                  className={`flex h-28 w-full items-center justify-center rounded-lg bg-hk-ivory p-2 ${assetColorClasses[assetColor]}`}
                >
                  <img
                    src={asset.path}
                    alt={asset.name}
                    className="max-h-full max-w-full object-contain text-current"
                  />
                </div>

                {/* Asset Metadata */}
                <div className="mt-2 w-full text-center">
                  <p className="truncate font-manrope text-[11px] font-semibold text-hk-charcoal">
                    {asset.name}
                  </p>
                  <span className="font-mono text-[9px] text-hk-taupe/80">
                    {asset.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: 15 UI COMPONENT VARIANTS */}
        <section id="components" className="scroll-mt-20">
          <div className="mb-8 flex items-center justify-between border-b border-hk-champagne/40 pb-4">
            <div>
              <div className="flex items-center gap-2 text-hk-taupe">
                <Layers className="h-5 w-5" />
                <span className="font-manrope text-xs font-bold uppercase tracking-widest">
                  Component System
                </span>
              </div>
              <h2 className="mt-1 font-editorial text-3xl font-normal text-hk-charcoal">
                15 UI Component Variants
              </h2>
            </div>
            <span className="font-manrope text-xs text-hk-taupe">
              Tailwind Tokens + Accessibility Ready
            </span>
          </div>

          <div className="space-y-12">
            {/* 1. Buttons Suite */}
            <div className="rounded-2xl border border-hk-champagne/40 bg-white p-6 md:p-8 shadow-sm">
              <h3 className="font-editorial text-2xl font-normal text-hk-charcoal mb-4">
                1. Button &amp; Control Variants
              </h3>
              <div className="flex flex-wrap items-center gap-4">
                <ButtonPrimary>Mulai Sekarang</ButtonPrimary>
                <ButtonSecondary>Lihat Detail Vendor</ButtonSecondary>
                <ButtonGhost>Selengkapnya</ButtonGhost>
                <ButtonPrimary size="sm">Ukuran Kecil</ButtonPrimary>
                <ButtonPrimary size="lg">Ukuran Besar</ButtonPrimary>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl bg-hk-charcoal p-6 text-white">
                <span className="font-manrope text-xs font-semibold text-hk-champagne">
                  Dark Mode / Charcoal Section:
                </span>
                <ButtonDark arrow={true}>Booking Eksklusif</ButtonDark>
                <ButtonDark size="sm">Pelajari Layanan</ButtonDark>
              </div>
            </div>

            {/* 2. Icon Buttons, Toggles, and Pagination */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Icon Buttons */}
              <div className="rounded-2xl border border-hk-champagne/40 bg-white p-6 shadow-sm">
                <h4 className="font-editorial text-xl font-normal text-hk-charcoal mb-4">
                  2. Circular Action Buttons
                </h4>
                <div className="flex items-center gap-3">
                  <IconButtonCircle icon={<Heart className="h-4 w-4" />} variant="taupe" label="Suka" />
                  <IconButtonCircle icon={<Bookmark className="h-4 w-4" />} variant="champagne" label="Simpan" />
                  <IconButtonCircle icon={<Share2 className="h-4 w-4" />} variant="outline" label="Bagikan" />
                  <IconButtonCircle icon={<ArrowRight className="h-4 w-4" />} variant="surface" label="Lanjut" />
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="rounded-2xl border border-hk-champagne/40 bg-white p-6 shadow-sm">
                <h4 className="font-editorial text-xl font-normal text-hk-charcoal mb-4">
                  3. Interactive Toggle Switch
                </h4>
                <ToggleSwitch
                  checked={toggleState}
                  onChange={setToggleState}
                  label="Sample Box Test Food"
                  description="Kirim tester katering ke rumah"
                />
              </div>

              {/* Pagination Controls */}
              <div className="rounded-2xl border border-hk-champagne/40 bg-white p-6 shadow-sm">
                <h4 className="font-editorial text-xl font-normal text-hk-charcoal mb-4">
                  4. Pagination Slide Indicator
                </h4>
                <PaginationControls
                  current={currentPage}
                  total={8}
                  onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  onNext={() => setCurrentPage((p) => Math.min(8, p + 1))}
                />
              </div>
            </div>

            {/* 3. Badges, Wax Seal, & Stamps */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-hk-champagne/40 bg-white p-6 text-center shadow-sm">
                <span className="font-manrope text-[11px] font-semibold text-hk-taupe mb-3">
                  Badge Premium &amp; New
                </span>
                <div className="flex flex-col gap-2">
                  <BadgePremium label="PREMIUM PILOT" />
                  <BadgeNew label="NEW VENDOR" />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl border border-hk-champagne/40 bg-white p-6 text-center shadow-sm">
                <span className="font-manrope text-[11px] font-semibold text-hk-taupe mb-3">
                  Badge Scalloped Rosette
                </span>
                <BadgePremium label="VIP" variant="scalloped" />
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl border border-hk-champagne/40 bg-white p-6 text-center shadow-sm">
                <span className="font-manrope text-[11px] font-semibold text-hk-taupe mb-3">
                  Wax Seal Official Crest
                </span>
                <WaxSealBadge size="md" />
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl border border-hk-champagne/40 bg-white p-6 text-center shadow-sm">
                <span className="font-manrope text-[11px] font-semibold text-hk-taupe mb-1">
                  Vintage Postal Stamp
                </span>
                <VintageStampBadge size="md" date="EST. 2026" location="KEBUMEN" />
              </div>
            </div>

            {/* 4. Decorative Dividers */}
            <div className="rounded-2xl border border-hk-champagne/40 bg-white p-6 md:p-8 shadow-sm">
              <h4 className="font-editorial text-2xl font-normal text-hk-charcoal mb-4">
                5. Decorative Dividers
              </h4>
              <div className="space-y-4">
                <div>
                  <span className="font-manrope text-xs text-hk-taupe">Variant: Diamond Center</span>
                  <DecorativeDivider variant="diamond" color="taupe" />
                </div>
                <div>
                  <span className="font-manrope text-xs text-hk-taupe">Variant: Botanical Center</span>
                  <DecorativeDivider variant="botanical" color="champagne" />
                </div>
                <div>
                  <span className="font-manrope text-xs text-hk-taupe">Variant: Symmetrical Loop</span>
                  <DecorativeDivider variant="loop" color="taupe" />
                </div>
                <div>
                  <span className="font-manrope text-xs text-hk-taupe">Variant: Minimal Hairline</span>
                  <DecorativeDivider variant="minimal" color="champagne" />
                </div>
              </div>
            </div>

            {/* 5. Editorial Cards */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Arch Frame Card */}
              <div>
                <ArchFrameCard
                  category="PREWEDDING ALAM"
                  caption="Bukit Menguneng &amp; Pantai Menganti"
                  accentBotanical={true}
                />
              </div>

              {/* Serif Quote Card */}
              <div>
                <SerifQuoteCard
                  quote="Proses lamaran kami berjalan sangat syahdu. Pihak keluarga besar sangat mengapresiasi transparansi dan kehangatan vendor Kebumen."
                  author="Dian &amp; Baskara"
                  event="Lamaran Intim di Karanganyar, Kebumen"
                  rating={5}
                />
              </div>

              {/* Floral Corner Card */}
              <div>
                <FloralCornerCard
                  title="Garansi Rekening Bersama"
                  subtitle="PROTEKSI KELUARGA"
                >
                  <p className="font-manrope text-xs leading-relaxed text-hk-charcoal/80 text-center">
                    Dana DP 30% mengunci tanggal vendor. 70% pelunasan dijaga aman di rekening bersama
                    dan baru diteruskan setelah acara selesai dengan memuaskan.
                  </p>
                  <div className="mt-4 flex justify-center">
                    <ButtonPrimary size="sm">Pelajari Sistem Escrow</ButtonPrimary>
                  </div>
                </FloralCornerCard>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: INTERACTIVE MOBILE VIEWPORT SIMULATOR */}
        <section id="mobile" className="scroll-mt-20">
          <div className="mb-8 flex items-center justify-between border-b border-hk-champagne/40 pb-4">
            <div>
              <div className="flex items-center gap-2 text-hk-taupe">
                <Smartphone className="h-5 w-5" />
                <span className="font-manrope text-xs font-bold uppercase tracking-widest">
                  Mobile-First Experience
                </span>
              </div>
              <h2 className="mt-1 font-editorial text-3xl font-normal text-hk-charcoal">
                Interactive Mobile Simulator (375px)
              </h2>
            </div>
            <span className="font-manrope text-xs text-hk-taupe">
              Uji Coba Sentuh &amp; Responsivitas
            </span>
          </div>

          <div className="flex flex-col items-center justify-center">
            {/* Phone Bezel Simulator Frame */}
            <div className="relative w-full max-w-[390px] overflow-hidden rounded-[40px] border-[8px] border-hk-charcoal bg-hk-ivory shadow-2xl">
              {/* Phone Speaker Notch */}
              <div className="absolute top-2 left-1/2 z-50 h-4 w-28 -translate-x-1/2 rounded-full bg-hk-charcoal" />

              {/* Mobile Screen Scrollable Area */}
              <div className="relative h-[680px] overflow-y-auto pb-24">
                {/* Mobile Header */}
                <MobileHeader />

                {/* Mobile Hero */}
                <MobileHero />

                {/* Mobile Services Section */}
                <div className="px-4 py-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-editorial text-xl font-medium text-hk-charcoal">
                      Layanan Terpadu Kebumen
                    </h3>
                    <ButtonGhost size="sm">Lihat Semua</ButtonGhost>
                  </div>

                  <MobileServiceCard
                    title="Busana &amp; Kebaya Adat"
                    category="BUSANA"
                    priceHint="Mulai Rp 2.500.000"
                    iconSrc="/assets/harikita/icons/icon-love-story.svg"
                    badge="Fitting Gratis"
                  />

                  <MobileServiceCard
                    title="Liputan Foto &amp; Cinematic Reels"
                    category="DOKUMENTASI"
                    priceHint="Mulai Rp 3.200.000"
                    iconSrc="/assets/harikita/icons/icon-two-people.svg"
                  />
                </div>

                {/* Mobile Invitation Preview Section */}
                <div className="px-4 py-6 bg-white border-t border-hk-soft-beige">
                  <h3 className="font-editorial text-xl font-medium text-hk-charcoal text-center mb-4">
                    Undangan Digital Eksklusif
                  </h3>
                  <MobileInvitationPreview />
                </div>

                {/* Mobile Sticky Booking Bar */}
                <MobileStickyBookingBar
                  price="Rp 8.500.000"
                  priceLabel="Estimasi Paket Intim"
                />

                {/* Mobile Bottom Nav */}
                <MobileBottomNav
                  activeTab={mobileTab}
                  onTabChange={setMobileTab}
                />
              </div>
            </div>

            <p className="mt-4 font-manrope text-xs text-hk-taupe">
              * Simulator 375px mensimulasikan layar iPhone SE / smartphone standar keluarga di Kebumen.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-hk-champagne/40 bg-white py-12 text-center">
        <div className="mx-auto max-w-4xl px-6">
          <HariKitaLogo variant="horizontal" size="md" asLink={false} />
          <p className="mt-3 font-editorial text-sm italic text-hk-taupe">
            "Rangkai Hari Bahagiamu, Menyelaraskan Restu &amp; Impian."
          </p>
          <p className="mt-4 font-manrope text-xs text-hk-charcoal/60">
            &copy; 2026 HariKita. All Rights Reserved. Hyperlocal Pilot: Kabupaten Kebumen, Jawa Tengah.
          </p>
        </div>
      </footer>
    </div>
  );
}
