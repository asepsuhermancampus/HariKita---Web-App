'use client';

import React from 'react';
import {
  Crown,
  Flower2,
  Layout,
  Landmark,
  Moon,
  Columns,
  Square,
  Feather,
  Sparkles,
  Bookmark,
  Check,
} from 'lucide-react';
import { PlacementStyleId } from '@/types/invitation-studio';
import { PLACEMENT_STYLES_CATALOG } from './AssetPlacementEngine';
import { cn } from '@/lib/utils';

interface StudioPlacementPickerProps {
  selectedStyle: PlacementStyleId;
  onSelectStyle: (style: PlacementStyleId) => void;
  themeColor: string;
  className?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  crown: <Crown className="h-4 w-4" />,
  flower: <Flower2 className="h-4 w-4" />,
  layout: <Layout className="h-4 w-4" />,
  landmark: <Landmark className="h-4 w-4" />,
  moon: <Moon className="h-4 w-4" />,
  columns: <Columns className="h-4 w-4" />,
  square: <Square className="h-4 w-4" />,
  feather: <Feather className="h-4 w-4" />,
  sparkles: <Sparkles className="h-4 w-4" />,
  bookmark: <Bookmark className="h-4 w-4" />,
};

export function StudioPlacementPicker({
  selectedStyle,
  onSelectStyle,
  themeColor,
  className,
}: StudioPlacementPickerProps) {
  return (
    <div className={cn('rounded-2xl border border-hk-champagne/50 bg-white p-5 shadow-xs', className)}>
      <div className="border-b border-hk-champagne/30 pb-3">
        <h4 className="font-editorial text-xl text-hk-charcoal font-medium leading-none">
          10 Gaya Penataan Posisi Aset (Komposisi Kurasi)
        </h4>
        <p className="font-manrope text-xs text-hk-charcoal/60 mt-1">
          Pilih karakter komposisi visual yang diinginkan. Posisi ornamen otomatis beradaptasi dengan proporsional:
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PLACEMENT_STYLES_CATALOG.map((style) => {
          const isSelected = selectedStyle === style.id;
          return (
            <button
              key={style.id}
              onClick={() => onSelectStyle(style.id)}
              className={cn(
                'group relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all',
                isSelected
                  ? 'border-hk-charcoal bg-hk-ivory shadow-xs ring-1 ring-hk-charcoal'
                  : 'border-hk-champagne/40 bg-white hover:border-hk-taupe hover:bg-hk-ivory/30'
              )}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg shadow-2xs transition-colors"
                    style={{
                      backgroundColor: isSelected ? themeColor : '#F5F2ED',
                      color: isSelected ? '#FFFFFF' : '#4A2E35',
                    }}
                  >
                    {iconMap[style.iconType] || <Sparkles className="h-4 w-4" />}
                  </div>

                  {isSelected && (
                    <span
                      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-manrope font-bold uppercase tracking-wider text-white shadow-2xs"
                      style={{ backgroundColor: themeColor }}
                    >
                      <Check className="h-2.5 w-2.5" />
                      <span>Aktif</span>
                    </span>
                  )}
                </div>

                <h5 className="mt-2 font-editorial text-base font-semibold text-hk-charcoal leading-snug">
                  {style.name}
                </h5>
                <span className="block font-manrope text-[10px] font-bold text-hk-taupe">
                  {style.subtitle}
                </span>
                <p className="font-manrope text-[11px] text-hk-charcoal/70 mt-1 line-clamp-2 leading-relaxed">
                  {style.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-hk-champagne/30">
                <span className="font-mono text-[9px] text-hk-charcoal/60 block truncate">
                  Cocok: <strong className="text-hk-charcoal">{style.recommendedFor}</strong>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
