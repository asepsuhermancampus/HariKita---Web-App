import React from 'react';
import { cn } from '@/lib/utils';

export interface ArchFrameCardProps {
  imageSrc?: string;
  imageAlt?: string;
  caption?: string;
  category?: string;
  accentBotanical?: boolean;
  children?: React.ReactNode;
  className?: string;
  aspectRatio?: 'portrait' | 'square' | 'tall';
}

export function ArchFrameCard({
  imageSrc,
  imageAlt = 'HariKita Arch Visual',
  caption,
  category,
  accentBotanical = true,
  children,
  className,
  aspectRatio = 'portrait',
}: ArchFrameCardProps) {
  const aspectClasses = {
    portrait: 'aspect-[3/4]',
    tall: 'aspect-[2/3]',
    square: 'aspect-square',
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col items-center overflow-hidden',
        'rounded-t-[120px] rounded-b-2xl border border-hk-champagne/60 bg-white p-3 shadow-sm',
        'transition-all duration-300 hover:border-hk-taupe hover:shadow-md',
        className
      )}
    >
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-t-[108px] rounded-b-xl bg-hk-soft-beige/30',
          aspectClasses[aspectRatio]
        )}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={imageAlt}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
            {accentBotanical && (
              <img
                src="/assets/harikita/flowers/single-stem/flower-single-stem-01.svg"
                alt="Botanical Accent"
                className="h-20 w-20 text-hk-taupe/40 mb-3 object-contain"
              />
            )}
            <span className="font-editorial text-xl italic text-hk-taupe">
              HariKita
            </span>
          </div>
        )}

        {/* Soft gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-hk-charcoal/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {(caption || category || children) && (
        <div className="w-full pt-3 pb-1 text-center">
          {category && (
            <p className="font-manrope text-[11px] font-semibold uppercase tracking-widest text-hk-champagne">
              {category}
            </p>
          )}
          {caption && (
            <h4 className="mt-0.5 font-editorial text-lg font-medium text-hk-charcoal line-clamp-1">
              {caption}
            </h4>
          )}
          {children}
        </div>
      )}
    </div>
  );
}
