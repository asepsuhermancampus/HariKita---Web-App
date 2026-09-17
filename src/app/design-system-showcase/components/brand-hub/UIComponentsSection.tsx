'use client';

import React, { useState } from 'react';
import {
  Layers,
  Heart,
  Bookmark,
  Share2,
  ArrowRight,
} from 'lucide-react';
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

export function UIComponentsSection() {
  const [toggleState, setToggleState] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);

  return (
    <section id="components" className="scroll-mt-24">
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
              <IconButtonCircle
                icon={<Heart className="h-4 w-4" />}
                variant="taupe"
                label="Suka"
              />
              <IconButtonCircle
                icon={<Bookmark className="h-4 w-4" />}
                variant="champagne"
                label="Simpan"
              />
              <IconButtonCircle
                icon={<Share2 className="h-4 w-4" />}
                variant="outline"
                label="Bagikan"
              />
              <IconButtonCircle
                icon={<ArrowRight className="h-4 w-4" />}
                variant="surface"
                label="Lanjut"
              />
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
              <span className="font-manrope text-xs text-hk-taupe">
                Variant: Diamond Center
              </span>
              <DecorativeDivider variant="diamond" color="taupe" />
            </div>
            <div>
              <span className="font-manrope text-xs text-hk-taupe">
                Variant: Botanical Center
              </span>
              <DecorativeDivider variant="botanical" color="champagne" />
            </div>
            <div>
              <span className="font-manrope text-xs text-hk-taupe">
                Variant: Symmetrical Loop
              </span>
              <DecorativeDivider variant="loop" color="taupe" />
            </div>
            <div>
              <span className="font-manrope text-xs text-hk-taupe">
                Variant: Minimal Hairline
              </span>
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
                Dana DP 30% mengunci tanggal vendor. 70% pelunasan dijaga aman di
                rekening bersama dan baru diteruskan setelah acara selesai dengan
                memuaskan.
              </p>
              <div className="mt-4 flex justify-center">
                <ButtonPrimary size="sm">Pelajari Sistem Escrow</ButtonPrimary>
              </div>
            </FloralCornerCard>
          </div>
        </div>
      </div>
    </section>
  );
}
