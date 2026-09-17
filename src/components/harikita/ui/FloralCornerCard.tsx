import React from 'react';
import { cn } from '@/lib/utils';

export interface FloralCornerCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  cornerStyle?: 'delicate' | 'botanical' | 'minimal';
}

export function FloralCornerCard({
  children,
  title,
  subtitle,
  className,
  cornerStyle = 'delicate',
}: FloralCornerCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-hk-champagne/50 bg-hk-ivory p-6 md:p-8 shadow-sm',
        'transition-all duration-300 hover:border-hk-taupe hover:shadow-md',
        className
      )}
    >
      {/* Top Left Corner */}
      <div className="pointer-events-none absolute top-2 left-2 h-10 w-10 text-hk-champagne/80">
        <img
          src="/assets/harikita/corners/corner-01.svg"
          alt=""
          className="h-full w-full object-contain"
        />
      </div>

      {/* Top Right Corner */}
      <div className="pointer-events-none absolute top-2 right-2 h-10 w-10 rotate-90 text-hk-champagne/80">
        <img
          src="/assets/harikita/corners/corner-01.svg"
          alt=""
          className="h-full w-full object-contain"
        />
      </div>

      {/* Bottom Right Corner */}
      <div className="pointer-events-none absolute bottom-2 right-2 h-10 w-10 rotate-180 text-hk-champagne/80">
        <img
          src="/assets/harikita/corners/corner-01.svg"
          alt=""
          className="h-full w-full object-contain"
        />
      </div>

      {/* Bottom Left Corner */}
      <div className="pointer-events-none absolute bottom-2 left-2 h-10 w-10 -rotate-90 text-hk-champagne/80">
        <img
          src="/assets/harikita/corners/corner-01.svg"
          alt=""
          className="h-full w-full object-contain"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10">
        {(title || subtitle) && (
          <div className="mb-4 text-center">
            {subtitle && (
              <p className="font-manrope text-xs font-semibold uppercase tracking-widest text-hk-taupe">
                {subtitle}
              </p>
            )}
            {title && (
              <h3 className="mt-1 font-editorial text-2xl font-normal text-hk-charcoal">
                {title}
              </h3>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
