'use client';

import React from 'react';
import { ButtonPrimary } from '../ui/ButtonPrimary';
import { ArchFrameCard } from '../ui/ArchFrameCard';
import { BadgePremium } from '../ui/BadgePremium';
import { cn } from '@/lib/utils';

export interface MobileHeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  imageSrc?: string;
  tagline?: string;
  className?: string;
}

export function MobileHero({
  title = 'Rangkai Hari Bahagiamu, Menyelaraskan Restu & Impian',
  subtitle = 'Kurasi vendor pernikahan intim & lamaran terbaik di Kabupaten Kebumen dengan transparansi penuh.',
  ctaText = 'Mulai Rangkai Acara',
  onCtaClick,
  imageSrc,
  tagline = 'HYPERLOCAL KEBUMEN PILOT',
  className,
}: MobileHeroProps) {
  return (
    <section
      className={cn(
        'relative flex flex-col items-center px-4 pt-6 pb-10 text-center overflow-hidden bg-hk-ivory',
        className
      )}
    >
      {/* Decorative Botanical Background Accent */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 opacity-20">
        <img
          src="/assets/harikita/compositions/composition-01.svg"
          alt=""
          className="h-full w-full object-contain text-hk-taupe"
        />
      </div>

      {/* Top Tagline Badge */}
      <div className="mb-4">
        <BadgePremium label={tagline} variant="pill" />
      </div>

      {/* Hero Headline */}
      <h1 className="font-editorial text-3xl font-normal leading-tight text-hk-charcoal max-w-sm">
        {title}
      </h1>

      {/* Subtitle */}
      <p className="mt-3 font-manrope text-sm text-hk-charcoal/75 leading-relaxed max-w-xs">
        {subtitle}
      </p>

      {/* Arch Photo Mask */}
      <div className="mt-6 w-full max-w-[280px]">
        <ArchFrameCard
          imageSrc={imageSrc}
          imageAlt="HariKita Kebumen Event"
          aspectRatio="portrait"
          accentBotanical={true}
        />
      </div>

      {/* Primary Action Button */}
      <div className="mt-6 w-full max-w-xs">
        <ButtonPrimary
          fullWidth
          size="lg"
          onClick={onCtaClick}
          className="shadow-md"
        >
          {ctaText}
        </ButtonPrimary>
      </div>

      {/* Trust Points */}
      <div className="mt-5 flex items-center justify-center gap-4 text-xs font-manrope text-hk-taupe">
        <span className="flex items-center gap-1">✓ Escrow Terlindungi</span>
        <span>•</span>
        <span className="flex items-center gap-1">✓ Vendor Terkurasi</span>
      </div>
    </section>
  );
}
