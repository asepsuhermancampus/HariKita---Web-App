import React from 'react';
import { cn } from '@/lib/utils';

export interface WaxSealBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  title?: string;
}

export function WaxSealBadge({
  size = 'md',
  className,
  onClick,
  title = 'HariKita Official Seal',
}: WaxSealBadgeProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      title={title}
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 select-none transition-transform duration-200',
        'drop-shadow-[0_4px_8px_rgba(136,115,91,0.35)]',
        onClick && 'cursor-pointer hover:scale-105 active:scale-95',
        sizeClasses[size],
        className
      )}
    >
      <img
        src="/assets/harikita/decorative/wax-seal-hk.svg"
        alt={title}
        className="h-full w-full object-contain"
        draggable={false}
      />
    </div>
  );
}
