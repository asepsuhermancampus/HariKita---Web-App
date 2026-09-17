import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonGhostProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  arrow?: boolean;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function ButtonGhost({
  children,
  arrow = true,
  size = 'md',
  className,
  disabled,
  ...props
}: ButtonGhostProps) {
  const sizeClasses = {
    sm: 'text-xs gap-1 py-1',
    md: 'text-sm gap-1.5 py-1.5',
    lg: 'text-base gap-2 py-2',
  };

  return (
    <button
      className={cn(
        'group inline-flex items-center font-manrope font-semibold',
        'text-hk-taupe transition-colors duration-200',
        'hover:text-hk-charcoal focus-visible:outline-none focus-visible:underline',
        'disabled:pointer-events-none disabled:opacity-40',
        sizeClasses[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      <span className="relative">
        {children}
        <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-hk-taupe transition-all duration-200 group-hover:w-full" />
      </span>
      {arrow && (
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
      )}
    </button>
  );
}
