'use client';

import React from 'react';
import { Mail, Calendar, MapPin } from 'lucide-react';
import { WaxSealBadge } from '../ui/WaxSealBadge';
import { ButtonPrimary } from '../ui/ButtonPrimary';
import { cn } from '@/lib/utils';

export interface MobileInvitationPreviewProps {
  coupleNames?: string;
  date?: string;
  location?: string;
  themeName?: string;
  imageSrc?: string;
  onOpen?: () => void;
  className?: string;
}

export function MobileInvitationPreview({
  coupleNames = 'Rama & Shinta',
  date = 'Sabtu, 24 Oktober 2026',
  location = 'Gombong, Kebumen',
  themeName = 'Royal Wax & Adat Klasik',
  imageSrc = '/assets/harikita/cards/card-invitation-01.svg',
  onOpen,
  className,
}: MobileInvitationPreviewProps) {
  return (
    <div
      className={cn(
        'relative mx-auto flex w-full max-w-[320px] flex-col items-center overflow-hidden',
        'rounded-3xl border-2 border-hk-champagne/60 bg-white p-5 shadow-lg',
        className
      )}
    >
      {/* Archetype Label */}
      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-hk-soft-beige/60 px-3 py-0.5">
        <Mail className="h-3 w-3 text-hk-taupe" />
        <span className="font-manrope text-[10px] font-bold uppercase tracking-wider text-hk-taupe">
          {themeName}
        </span>
      </div>

      {/* Invitation Card Mask */}
      <div className="relative w-full aspect-[4/5] overflow-hidden rounded-2xl border border-hk-champagne/40 bg-hk-ivory">
        <img
          src={imageSrc}
          alt="Digital Invitation Card"
          className="h-full w-full object-cover"
        />

        {/* Center Wax Seal Seal */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-hk-charcoal/20 backdrop-blur-[1px]">
          <WaxSealBadge size="lg" className="animate-pulse" />
          <span className="mt-2 font-editorial text-sm font-semibold italic text-white drop-shadow-md">
            Ketuk Untuk Membuka
          </span>
        </div>
      </div>

      {/* Couple Names & Details */}
      <div className="mt-4 w-full text-center">
        <h3 className="font-editorial text-2xl font-normal text-hk-charcoal">
          {coupleNames}
        </h3>

        <div className="mt-2 flex flex-col items-center gap-1 text-xs font-manrope text-hk-charcoal/80">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-hk-taupe" />
            {date}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-hk-taupe" />
            {location}
          </span>
        </div>
      </div>

      {/* Open Button CTA */}
      <div className="mt-4 w-full">
        <ButtonPrimary
          fullWidth
          size="md"
          onClick={onOpen}
          arrow={true}
        >
          Buka Undangan Digital
        </ButtonPrimary>
      </div>
    </div>
  );
}
