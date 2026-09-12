'use client';

import React, { useState } from 'react';
import { Layers, Palette } from 'lucide-react';
import { SandboxGalleryViewer } from './playground/SandboxGalleryViewer';
import { SandboxCoupleViewer } from './playground/SandboxCoupleViewer';
import { SandboxQrisGenerator } from './playground/SandboxQrisGenerator';
import { SandboxGuestbookBlur } from './playground/SandboxGuestbookBlur';
import { cn } from '@/lib/utils';

export function InvitationPlaygroundSection() {
  const [themeAccent, setThemeAccent] = useState<string>('#88735B'); // Default Taupe

  const themeOptions = [
    { id: '#88735B', label: 'HariKita Taupe', color: '#88735B' },
    { id: '#5B6E58', label: 'Botanical Sage', color: '#5B6E58' },
    { id: '#5A3825', label: 'Javanese Sogan', color: '#5A3825' },
    { id: '#2C4A3E', label: 'Islamic Emerald', color: '#2C4A3E' },
    { id: '#C07D6D', label: 'Rose Gold Copper', color: '#C07D6D' },
    { id: '#A35D43', label: 'Rustic Terracotta', color: '#A35D43' },
    { id: '#1E2638', label: 'Celestial Midnight', color: '#1E2638' },
    { id: '#D97352', label: 'Cute Coral Peach', color: '#D97352' },
  ];

  return (
    <section id="invitation-components" className="scroll-mt-24">
      {/* Section Header */}
      <div className="mb-8 flex flex-col gap-4 border-b border-hk-champagne/40 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-hk-taupe">
            <Layers className="h-5 w-5" />
            <span className="font-manrope text-xs font-bold uppercase tracking-widest">
              Interactive Component Sandbox
            </span>
          </div>
          <h2 className="mt-1 font-editorial text-3xl font-normal text-hk-charcoal">
            Playground Komponen Konten Undangan
          </h2>
        </div>

        {/* Global Playground Theme Accent Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-manrope font-semibold text-hk-charcoal/80">
            <Palette className="h-3.5 w-3.5 text-hk-taupe" />
            <span>Tema Aksen Uji Coba:</span>
          </div>
          <div className="flex flex-wrap rounded-full border border-hk-champagne/60 bg-white p-1 shadow-xs">
            {themeOptions.map((t) => (
              <button
                key={t.id}
                onClick={() => setThemeAccent(t.color)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-manrope font-semibold transition-all',
                  themeAccent === t.color
                    ? 'bg-hk-taupe text-white shadow-xs'
                    : 'text-hk-charcoal/70 hover:text-hk-charcoal'
                )}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full border border-black/10"
                  style={{ backgroundColor: t.color }}
                />
                <span className="hidden sm:inline">{t.label.split(' ')[1] || t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stacked Sub-Playgrounds */}
      <div className="space-y-12">
        {/* 1. Gallery 8 Styles */}
        <SandboxGalleryViewer accentColor={themeAccent} />

        {/* 2. Couple Card 4 Variants */}
        <SandboxCoupleViewer accentColor={themeAccent} />

        {/* 3. Dynamic QRIS & Gift Transfer */}
        <SandboxQrisGenerator accentColor={themeAccent} />

        {/* 4. Guestbook RSVP & Depth Focus-Blur */}
        <SandboxGuestbookBlur accentColor={themeAccent} />
      </div>
    </section>
  );
}
