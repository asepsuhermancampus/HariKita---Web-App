'use client';

import React from 'react';
import { Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ThemePalette {
  id: string;
  name: string;
  hex: string;
  textColor: string;
  mood: string;
}

export const CURATED_THEME_PALETTES: ThemePalette[] = [
  { id: 'taupe', name: 'HariKita Taupe', hex: '#88735B', textColor: '#FFFFFF', mood: 'Hangat & Timeless' },
  { id: 'gilded-gold', name: 'Gilded Gold', hex: '#C5A880', textColor: '#2B2B2B', mood: 'Mewah & Kerajaan' },
  { id: 'plum-charcoal', name: 'Plum Charcoal', hex: '#4A2E35', textColor: '#FFFFFF', mood: 'Wibawa & Berkelas' },
  { id: 'champagne', name: 'Champagne Warm', hex: '#F3EDE6', textColor: '#4A2E35', mood: 'Bersih & Suci' },
  { id: 'botanical-sage', name: 'Botanical Sage', hex: '#5B6E58', textColor: '#FFFFFF', mood: 'Segar & Alami' },
  { id: 'javanese-sogan', name: 'Javanese Sogan', hex: '#5A3825', textColor: '#FFFFFF', mood: 'Tradisi Keraton' },
  { id: 'islamic-emerald', name: 'Islamic Emerald', hex: '#2C4A3E', textColor: '#FFFFFF', mood: 'Teduh & Syar’i' },
  { id: 'rose-gold', name: 'Rose Gold Copper', hex: '#C07D6D', textColor: '#FFFFFF', mood: 'Romantis Manis' },
  { id: 'rustic-terracotta', name: 'Rustic Terracotta', hex: '#A35D43', textColor: '#FFFFFF', mood: 'Boho & Hangat' },
  { id: 'celestial-midnight', name: 'Celestial Midnight', hex: '#1E2638', textColor: '#FFFFFF', mood: 'Malam Puitis' },
  { id: 'coral-peach', name: 'Coral Peach', hex: '#D97352', textColor: '#FFFFFF', mood: 'Ceria & Berseri' },
  { id: 'olive-woodland', name: 'Olive Woodland', hex: '#6B705C', textColor: '#FFFFFF', mood: 'Abadi & Bersahaja' },
];

interface StudioColorPalettePickerProps {
  selectedColor: string;
  onSelectColor: (hex: string) => void;
  className?: string;
}

export function StudioColorPalettePicker({
  selectedColor,
  onSelectColor,
  className,
}: StudioColorPalettePickerProps) {
  const currentPalette = CURATED_THEME_PALETTES.find(
    (p) => p.hex.toLowerCase() === selectedColor.toLowerCase()
  ) || {
    id: 'custom',
    name: 'Warna Kustom',
    hex: selectedColor,
    textColor: '#FFFFFF',
    mood: 'Personalisasi Mandiri',
  };

  return (
    <div className={cn('rounded-2xl border border-hk-champagne/50 bg-white p-5 shadow-xs', className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-hk-champagne/30 pb-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg shadow-2xs transition-colors"
            style={{ backgroundColor: selectedColor }}
          >
            <Palette className="h-4 w-4" style={{ color: currentPalette.textColor }} />
          </div>
          <div>
            <h4 className="font-editorial text-lg text-hk-charcoal font-medium leading-none">
              Palet 12 Warna Kurasi HariKita
            </h4>
            <p className="font-manrope text-[11px] text-hk-charcoal/60 mt-0.5">
              Dipilih: <span className="font-semibold text-hk-charcoal">{currentPalette.name}</span> ({selectedColor}) • {currentPalette.mood}
            </p>
          </div>
        </div>

        {/* Live Hex Value Badge */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-hk-ivory px-3 py-1 border border-hk-champagne/40 text-[11px] font-mono font-bold text-hk-taupe">
          <span
            className="h-2.5 w-2.5 rounded-full border border-black/10"
            style={{ backgroundColor: selectedColor }}
          />
          <span>{selectedColor.toUpperCase()}</span>
        </div>
      </div>

      {/* 12 Swatches Grid */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {CURATED_THEME_PALETTES.map((palette) => {
          const isSelected = selectedColor.toLowerCase() === palette.hex.toLowerCase();
          return (
            <button
              key={palette.id}
              onClick={() => onSelectColor(palette.hex)}
              className={cn(
                'group relative flex items-center gap-2.5 rounded-xl border p-2 text-left transition-all',
                isSelected
                  ? 'border-hk-charcoal bg-hk-ivory/80 shadow-xs ring-1 ring-hk-charcoal'
                  : 'border-hk-champagne/40 bg-white hover:border-hk-taupe hover:bg-hk-ivory/40'
              )}
            >
              <div
                className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-black/10 shadow-2xs transition-transform group-hover:scale-105"
                style={{ backgroundColor: palette.hex }}
              >
                {isSelected && (
                  <Check className="h-4 w-4 drop-shadow-xs" style={{ color: palette.textColor }} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-manrope text-xs font-semibold text-hk-charcoal">
                  {palette.name}
                </p>
                <span className="block truncate font-mono text-[10px] text-hk-charcoal/60">
                  {palette.hex}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
