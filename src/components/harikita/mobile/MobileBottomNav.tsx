'use client';

import React from 'react';
import { Home, Sparkles, Mail, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MobileBottomNavProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export const MOBILE_NAV_ITEMS = [
  { id: 'beranda', label: 'Beranda', icon: Home, href: '/' },
  { id: 'layanan', label: 'Layanan', icon: Sparkles, href: '/layanan' },
  { id: 'undangan', label: 'Undangan', icon: Mail, href: '/undangan' },
  { id: 'pesanan', label: 'Pesanan', icon: UserCheck, href: '/klien/pesanan' },
];

export function MobileBottomNav({
  activeTab = 'beranda',
  onTabChange,
  className,
}: MobileBottomNavProps) {
  return (
    <nav
      aria-label="Navigasi Bawah Ponsel"
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around',
        'border-t border-hk-champagne/30 bg-white/95 px-2 backdrop-blur-lg',
        'shadow-[0_-2px_10px_rgba(0,0,0,0.04)]',
        className
      )}
    >
      {MOBILE_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange?.(item.id)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center py-1 min-h-[48px] rounded-xl transition-all duration-200',
              isActive
                ? 'text-hk-taupe font-semibold'
                : 'text-hk-charcoal/60 hover:text-hk-charcoal'
            )}
          >
            <div
              className={cn(
                'relative flex h-7 w-7 items-center justify-center rounded-full transition-transform',
                isActive && 'scale-110'
              )}
            >
              <Icon className="h-5 w-5" />
              {isActive && (
                <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-hk-taupe" />
              )}
            </div>
            <span className="mt-0.5 text-[11px] font-manrope tracking-tight">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
