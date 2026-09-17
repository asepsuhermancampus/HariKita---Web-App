'use client';

import React from 'react';
import { Menu, X, Search, Bell } from 'lucide-react';
import { HariKitaLogo } from '@/components/brand/HariKitaLogo';
import { cn } from '@/lib/utils';

export interface MobileHeaderProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
  showSearch?: boolean;
  showNotification?: boolean;
  className?: string;
}

export function MobileHeader({
  onMenuToggle,
  isMenuOpen = false,
  showSearch = true,
  showNotification = false,
  className,
}: MobileHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-14 w-full items-center justify-between',
        'border-b border-hk-soft-beige/80 bg-white/95 px-4 backdrop-blur-md',
        className
      )}
    >
      {/* Brand Logo Lockup */}
      <div className="flex items-center">
        <HariKitaLogo variant="horizontal" size="sm" asLink href="/" />
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1">
        {showSearch && (
          <button
            type="button"
            aria-label="Cari Vendor atau Layanan"
            className="flex h-11 w-11 items-center justify-center rounded-full text-hk-taupe transition-colors hover:bg-hk-soft-beige/40 active:scale-95"
          >
            <Search className="h-5 w-5" />
          </button>
        )}

        {showNotification && (
          <button
            type="button"
            aria-label="Notifikasi"
            className="flex h-11 w-11 items-center justify-center rounded-full text-hk-taupe transition-colors hover:bg-hk-soft-beige/40 active:scale-95"
          >
            <Bell className="h-5 w-5" />
          </button>
        )}

        {onMenuToggle && (
          <button
            type="button"
            aria-label={isMenuOpen ? 'Tutup Menu' : 'Buka Menu'}
            onClick={onMenuToggle}
            className="flex h-11 w-11 items-center justify-center rounded-full text-hk-charcoal transition-colors hover:bg-hk-soft-beige/40 active:scale-95"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}
      </div>
    </header>
  );
}
