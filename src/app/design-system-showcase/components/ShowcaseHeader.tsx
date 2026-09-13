'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Palette, Layers, Grid, Smartphone, Info } from 'lucide-react';
import { HariKitaLogo } from '@/components/brand/HariKitaLogo';
import { cn } from '@/lib/utils';

export type ShowcaseHubType = 'brand' | 'invitation';

interface ShowcaseHeaderProps {
  activeHub: ShowcaseHubType;
  onSelectHub: (hub: ShowcaseHubType) => void;
  brandAssetCount: number;
}

export function ShowcaseHeader({
  activeHub,
  onSelectHub,
  brandAssetCount,
}: ShowcaseHeaderProps) {
  return (
    <>
      {/* Reference Notice Banner */}
      <div className="bg-hk-soft-beige/80 border-b border-hk-champagne/40 px-4 py-2 text-center text-xs font-manrope text-hk-charcoal flex items-center justify-center gap-2">
        <Info className="h-4 w-4 text-hk-taupe shrink-0" />
        <span>
          <strong>Living Style Guide &amp; Design System Reference:</strong> Halaman ini khusus untuk acuan sistem desain &amp; katalog visual resmi HariKita (Kabupaten Kebumen).
        </span>
      </div>

      {/* Main Sticky Topbar */}
      <header className="sticky top-0 z-40 border-b border-hk-champagne/40 bg-white/95 px-6 py-3.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Logo & Hub Title */}
          <div className="flex items-center gap-4">
            <HariKitaLogo variant="horizontal" size="sm" asLink={false} />
            <div className="hidden h-5 w-[1px] bg-hk-champagne/40 md:block" />
            <span className="hidden font-editorial text-sm font-medium italic text-hk-taupe md:inline">
              {activeHub === 'brand'
                ? 'HariKita Platform Visual System'
                : 'Undangan Digital Visual System & Sandbox'}
            </span>
          </div>

          {/* Center: Dual-Hub Tab Switcher */}
          <div className="flex items-center justify-center rounded-full border border-hk-champagne/60 bg-hk-ivory p-1 shadow-inner w-full sm:w-auto">
            <button
              title="HariKita Platform Visual System"
              onClick={() => onSelectHub('brand')}
              className={cn(
                'flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-full px-3.5 sm:px-4 py-1.5 text-xs font-manrope font-semibold transition-all duration-200',
                activeHub === 'brand'
                  ? 'bg-hk-taupe text-white shadow-sm'
                  : 'text-hk-charcoal/70 hover:text-hk-charcoal'
              )}
            >
              <Palette className="h-3.5 w-3.5" />
              <span>HariKita DS</span>
            </button>

            <button
              title="Undangan Digital Visual System"
              onClick={() => onSelectHub('invitation')}
              className={cn(
                'flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-full px-3 sm:px-4 py-1.5 text-xs font-manrope font-semibold transition-all duration-200',
                activeHub === 'invitation'
                  ? 'bg-hk-taupe text-white shadow-sm'
                  : 'text-hk-charcoal/70 hover:text-hk-charcoal'
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Undangan DS</span>
              <span className="hidden xs:inline rounded-full bg-hk-champagne/30 px-1.5 py-0.2 text-[9px] text-hk-charcoal font-bold">
                Sandbox
              </span>
            </button>
          </div>

          {/* Right: Dynamic Sub-Navigation Anchor Links (Horizontal Scroll on Mobile) */}
          <nav className="flex items-center gap-1.5 text-xs font-manrope font-semibold overflow-x-auto no-scrollbar w-full md:w-auto py-1 whitespace-nowrap -mx-2 px-2 md:mx-0 md:px-0">
            {activeHub === 'brand' ? (
              <>
                <a
                  href="#palette"
                  className="rounded-full px-3 py-1 text-hk-charcoal transition-colors hover:bg-hk-soft-beige/50 shrink-0"
                >
                  Palet Warna
                </a>
                <a
                  href="#typography"
                  className="rounded-full px-3 py-1 text-hk-charcoal transition-colors hover:bg-hk-soft-beige/50 shrink-0"
                >
                  Tipografi
                </a>
                <a
                  href="#assets"
                  className="rounded-full px-3 py-1 text-hk-charcoal transition-colors hover:bg-hk-soft-beige/50 shrink-0"
                >
                  Aset HariKita ({brandAssetCount})
                </a>
                <a
                  href="#components"
                  className="rounded-full px-3 py-1 text-hk-charcoal transition-colors hover:bg-hk-soft-beige/50 shrink-0"
                >
                  Komponen UI Platform
                </a>
                <a
                  href="#mobile"
                  className="rounded-full px-3 py-1 text-hk-charcoal transition-colors hover:bg-hk-soft-beige/50 shrink-0"
                >
                  Simulator Platform
                </a>
              </>
            ) : (
              <>
                <a
                  href="#archetypes"
                  className="rounded-full px-3 py-1 text-hk-charcoal transition-colors hover:bg-hk-soft-beige/50 shrink-0"
                >
                  8 Arketipe Undangan
                </a>
                <a
                  href="#invitation-assets"
                  className="rounded-full px-3 py-1 text-hk-charcoal transition-colors hover:bg-hk-soft-beige/50 shrink-0"
                >
                  243 Aset Undangan
                </a>
                <a
                  href="#invitation-components"
                  className="rounded-full px-3 py-1 text-hk-charcoal transition-colors hover:bg-hk-soft-beige/50 shrink-0"
                >
                  Playground Undangan
                </a>
                <a
                  href="#sandbox-mobile"
                  className="rounded-full px-3 py-1 text-hk-charcoal transition-colors hover:bg-hk-soft-beige/50 shrink-0"
                >
                  Simulator Undangan (375px)
                </a>
              </>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
