'use client';

import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationControlsProps {
  current: number;
  total: number;
  onPrev?: () => void;
  onNext?: () => void;
  className?: string;
}

export function PaginationControls({
  current,
  total,
  onPrev,
  onNext,
  className,
}: PaginationControlsProps) {
  const currentFormatted = String(current).padStart(2, '0');
  const totalFormatted = String(total).padStart(2, '0');

  const canPrev = current > 1;
  const canNext = current < total;

  return (
    <div className={cn('inline-flex items-center gap-4 select-none', className)}>
      <div className="font-editorial text-lg tracking-wider text-hk-charcoal">
        <span className="font-semibold text-hk-taupe">{currentFormatted}</span>
        <span className="mx-1.5 text-hk-champagne">/</span>
        <span className="text-hk-charcoal/60">{totalFormatted}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Halaman sebelumnya"
          disabled={!canPrev}
          onClick={onPrev}
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-full border border-hk-champagne/60',
            'text-hk-taupe transition-all duration-200',
            'hover:border-hk-taupe hover:bg-hk-soft-beige/40 active:scale-95',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hk-champagne',
            'disabled:pointer-events-none disabled:opacity-30'
          )}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          aria-label="Halaman berikutnya"
          disabled={!canNext}
          onClick={onNext}
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-full border border-hk-champagne/60',
            'text-hk-taupe transition-all duration-200',
            'hover:border-hk-taupe hover:bg-hk-soft-beige/40 active:scale-95',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hk-champagne',
            'disabled:pointer-events-none disabled:opacity-30'
          )}
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
