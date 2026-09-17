import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonDarkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  arrow?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function ButtonDark({
  children,
  arrow = false,
  size = 'md',
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonDarkProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs min-h-[38px]',
    md: 'px-6 py-3 text-sm min-h-[44px]',
    lg: 'px-8 py-4 text-base min-h-[50px]',
  };

  return (
    <button
      className={cn(
        'group inline-flex items-center justify-center gap-2 rounded-full font-manrope font-semibold',
        'border border-hk-champagne/60 bg-[#2B2B2B] text-hk-ivory transition-all duration-200',
        'hover:border-hk-champagne hover:bg-[#383838] hover:text-white active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hk-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-hk-charcoal',
        'disabled:pointer-events-none disabled:opacity-40',
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled}
      {...props}
    >
      <span>{children}</span>
      {arrow && (
        <ArrowRight className="h-4 w-4 text-hk-champagne transition-transform duration-200 group-hover:translate-x-1" />
      )}
    </button>
  );
}
