'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MobileServiceCardProps {
  title: string;
  category: string;
  priceHint: string;
  iconSrc?: string;
  badge?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function MobileServiceCard({
  title,
  category,
  priceHint,
  iconSrc = '/assets/harikita/icons/icon-two-people.svg',
  badge,
  onClick,
  className,
}: MobileServiceCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      className={cn(
        'group relative flex items-center justify-between gap-3 p-3.5',
        'rounded-2xl border border-hk-champagne/40 bg-white shadow-sm',
        'transition-all duration-200 active:scale-[0.98] hover:border-hk-taupe hover:shadow-md cursor-pointer',
        className
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Service Icon Container */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-hk-soft-beige/50 text-hk-taupe group-hover:bg-hk-champagne/20 transition-colors">
          <img
            src={iconSrc}
            alt=""
            className="h-7 w-7 object-contain text-current"
          />
        </div>

        {/* Text Details */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-manrope text-[10px] font-bold uppercase tracking-wider text-hk-taupe">
              {category}
            </span>
            {badge && (
              <span className="rounded-full bg-hk-champagne/30 px-2 py-0.2 text-[9px] font-bold text-hk-charcoal">
                {badge}
              </span>
            )}
          </div>
          <h4 className="font-editorial text-base font-medium text-hk-charcoal truncate mt-0.5">
            {title}
          </h4>
          <p className="font-manrope text-xs font-semibold text-hk-taupe mt-0.5">
            {priceHint}
          </p>
        </div>
      </div>

      {/* Trailing Chevron Action */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-hk-champagne transition-colors group-hover:text-hk-taupe">
        <ChevronRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    </div>
  );
}
