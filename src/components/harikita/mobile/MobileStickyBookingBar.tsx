'use client';

import React from 'react';
import { ButtonPrimary } from '../ui/ButtonPrimary';
import { cn } from '@/lib/utils';

export interface MobileStickyBookingBarProps {
  price: string;
  priceLabel?: string;
  subtext?: string;
  ctaText?: string;
  onBookingClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function MobileStickyBookingBar({
  price,
  priceLabel = 'Estimasi Paket',
  subtext = 'DP 30% • Proteksi Escrow',
  ctaText = 'Booking Tanggal',
  onBookingClick,
  disabled = false,
  className,
}: MobileStickyBookingBarProps) {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-4',
        'border-t border-hk-champagne/40 bg-white/95 px-4 py-3 backdrop-blur-md',
        'shadow-[0_-4px_20px_rgba(0,0,0,0.08)]',
        className
      )}
    >
      {/* Price Summary Column */}
      <div className="flex flex-col">
        <span className="font-manrope text-[10px] font-semibold uppercase tracking-wider text-hk-taupe">
          {priceLabel}
        </span>
        <span className="font-editorial text-xl font-bold leading-tight text-hk-charcoal">
          {price}
        </span>
        {subtext && (
          <span className="font-manrope text-[10px] text-hk-taupe/80">
            {subtext}
          </span>
        )}
      </div>

      {/* CTA Button Action */}
      <div className="shrink-0">
        <ButtonPrimary
          size="md"
          arrow={true}
          disabled={disabled}
          onClick={onBookingClick}
        >
          {ctaText}
        </ButtonPrimary>
      </div>
    </div>
  );
}
