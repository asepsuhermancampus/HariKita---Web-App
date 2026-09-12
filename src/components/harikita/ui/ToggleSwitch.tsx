'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
  className,
}: ToggleSwitchProps) {
  const switchId = id || (label ? `toggle-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <button
        id={switchId}
        role="switch"
        type="button"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hk-champagne focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-hk-taupe' : 'bg-hk-soft-beige'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col cursor-pointer" onClick={() => !disabled && onChange(!checked)}>
          {label && (
            <span className="text-sm font-manrope font-medium text-hk-charcoal select-none">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs font-manrope text-hk-taupe/80 select-none">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
