import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonPrimaryProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  arrow?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function ButtonPrimary({
  children,
  arrow = true,
  size = 'md',
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonPrimaryProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs min-h-[38px]',
    md: 'px-6 py-3 text-sm min-h-[44px]',
    lg: 'px-8 py-4 text-base min-h-[50px]',
  };

  return (
    <button
      className={cn(
        'group inline-flex items-center justify-center gap-2 rounded-full font-manrope font-semibold',
        'bg-hk-taupe text-white transition-all duration-200',
        'hover:bg-[#78644e] hover:shadow-md active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hk-champagne focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none',
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled}
      {...props}
    >
      <span>{children}</span>
      {arrow && (
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      )}
    </button>
  );
}
