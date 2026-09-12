import React from 'react';
import { cn } from '@/lib/utils';

export interface IconButtonCircleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'taupe' | 'champagne' | 'outline' | 'ghost' | 'surface';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function IconButtonCircle({
  icon,
  variant = 'outline',
  size = 'md',
  label,
  className,
  disabled,
  ...props
}: IconButtonCircleProps) {
  const sizeClasses = {
    sm: 'w-9 h-9 min-w-[36px] min-h-[36px] text-xs',
    md: 'w-11 h-11 min-w-[44px] min-h-[44px] text-sm',
    lg: 'w-14 h-14 min-w-[56px] min-h-[56px] text-base',
  };

  const variantClasses = {
    taupe: 'bg-hk-taupe text-white hover:bg-[#78644e] shadow-sm',
    champagne: 'bg-hk-champagne text-hk-charcoal hover:bg-[#ba9676] shadow-sm',
    outline: 'border border-hk-champagne/60 bg-transparent text-hk-taupe hover:border-hk-taupe hover:bg-hk-soft-beige/30',
    ghost: 'bg-transparent text-hk-taupe hover:bg-hk-soft-beige/30 hover:text-hk-charcoal',
    surface: 'bg-white border border-hk-soft-beige text-hk-taupe hover:border-hk-champagne hover:shadow-sm',
  };

  return (
    <button
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center rounded-full transition-all duration-200 active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hk-champagne focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-40',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {icon}
    </button>
  );
}
