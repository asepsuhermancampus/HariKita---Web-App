import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SerifQuoteCardProps {
  quote: string;
  author: string;
  event?: string;
  date?: string;
  rating?: number;
  className?: string;
}

export function SerifQuoteCard({
  quote,
  author,
  event = 'Lamaran & Pernikahan di Kebumen',
  date,
  rating = 5,
  className,
}: SerifQuoteCardProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col justify-between overflow-hidden rounded-2xl',
        'border border-hk-champagne/60 bg-white p-6 md:p-8 shadow-sm',
        'transition-all duration-300 hover:border-hk-taupe hover:shadow-md',
        className
      )}
    >
      {/* Oversized Decorative Serif Quote Mark */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-4 -left-1 font-editorial text-8xl font-normal leading-none text-hk-soft-beige/60 select-none"
      >
        “
      </span>

      <div className="relative z-10">
        {rating > 0 && (
          <div className="mb-4 flex items-center gap-1 text-hk-champagne">
            {Array.from({ length: rating }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
        )}

        <blockquote className="font-editorial text-lg md:text-xl italic leading-relaxed text-hk-charcoal">
          "{quote}"
        </blockquote>
      </div>

      <div className="relative z-10 mt-6 border-t border-hk-soft-beige pt-4 flex items-center justify-between">
        <div>
          <cite className="not-italic font-manrope font-semibold text-sm text-hk-charcoal block">
            {author}
          </cite>
          {event && (
            <p className="font-manrope text-xs text-hk-taupe tracking-wide">
              {event}
            </p>
          )}
        </div>
        {date && (
          <span className="font-manrope text-xs text-hk-taupe/70">
            {date}
          </span>
        )}
      </div>
    </div>
  );
}
