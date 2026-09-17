'use client';

import React, { useState, useMemo } from 'react';
import { X, Search, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { SlotZoneId, PlacementStyleId } from '@/types/invitation-studio';
import { getHariKitaAssets } from '@/lib/harikita-assets';
import { HariKitaAsset } from '@/types/harikita-asset';
import {
  SLOT_ZONE_RULES,
  isAssetCompatibleWithSlot,
  getSlotHarmonyStatus,
} from './AssetPlacementEngine';
import { DynamicSvgRenderer } from './DynamicSvgRenderer';
import { cn } from '@/lib/utils';

interface StudioSlotAssetModalProps {
  slot: SlotZoneId;
  activeAssetId: string;
  placementStyle: PlacementStyleId;
  themeColor: string;
  onSelectAsset: (assetFilePath: string) => void;
  onClose: () => void;
}

export function StudioSlotAssetModal({
  slot,
  activeAssetId,
  placementStyle,
  themeColor,
  onSelectAsset,
  onClose,
}: StudioSlotAssetModalProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const allAssets = useMemo(() => getHariKitaAssets(), []);
  const rule = SLOT_ZONE_RULES[slot];

  // Filter assets that are compatible with this slot
  const compatibleAssets = useMemo(() => {
    return allAssets.filter((a) => {
      if (!isAssetCompatibleWithSlot(a, slot)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allAssets, slot, searchQuery]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-hk-champagne/60 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-hk-champagne/40 p-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-hk-ivory px-2.5 py-0.5 text-[10px] font-manrope font-bold text-hk-taupe uppercase border border-hk-champagne/40">
                Slot Ornamen
              </span>
              <span className="flex items-center gap-1 text-[10px] font-manrope font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="h-3 w-3 text-emerald-700" />
                <span>Visual Guardrails Active</span>
              </span>
            </div>
            <h3 className="mt-1 font-editorial text-2xl text-hk-charcoal font-semibold">
              {rule?.label || slot}
            </h3>
            <p className="font-manrope text-xs text-hk-charcoal/70 mt-0.5">
              {rule?.description} (Hanya menampilkan aset kategori: {rule?.allowedCategories.join(', ')})
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-hk-charcoal/60 hover:bg-hk-ivory hover:text-hk-charcoal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-hk-champagne/30 bg-hk-ivory/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-hk-taupe" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari aset untuk slot ini..."
              className="w-full rounded-xl border border-hk-champagne/50 bg-white py-2 pl-8 pr-3 text-xs font-manrope text-hk-charcoal focus:border-hk-taupe focus:outline-hidden"
            />
          </div>
        </div>

        {/* Compatible Assets Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {compatibleAssets.map((asset) => {
              const isSelected =
                activeAssetId.includes(asset.id) || activeAssetId.includes(asset.filePath);
              const harmony = getSlotHarmonyStatus(asset, slot, placementStyle);

              return (
                <div
                  key={asset.id}
                  onClick={() => {
                    onSelectAsset(asset.filePath);
                    onClose();
                  }}
                  className={cn(
                    'group relative flex flex-col items-center justify-between rounded-xl border p-2.5 text-center cursor-pointer transition-all',
                    isSelected
                      ? 'border-hk-charcoal bg-hk-ivory shadow-xs ring-1 ring-hk-charcoal'
                      : 'border-hk-champagne/40 bg-white hover:border-hk-taupe hover:shadow-xs'
                  )}
                >
                  {/* Harmony Badge */}
                  <div className="w-full flex justify-between items-center mb-1">
                    {harmony === 'perfect' ? (
                      <span className="flex items-center gap-0.5 rounded-full bg-emerald-100/90 text-emerald-800 text-[8px] font-manrope font-bold px-1.5 py-0.2">
                        <Sparkles className="h-2 w-2" />
                        <span>Harmonis</span>
                      </span>
                    ) : (
                      <span className="text-[8px] font-manrope text-hk-charcoal/50">Cocok</span>
                    )}

                    {isSelected && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-hk-charcoal text-white text-[9px]">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </div>

                  {/* SVG Asset Preview Container */}
                  <div className="flex h-20 w-full items-center justify-center rounded-lg bg-hk-ivory/50 p-2">
                    <DynamicSvgRenderer
                      asset={asset}
                      color={themeColor}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  {/* Asset Label */}
                  <div className="mt-1.5 w-full">
                    <p className="truncate font-manrope text-[10px] font-semibold text-hk-charcoal">
                      {asset.name}
                    </p>
                    <span className="font-mono text-[8px] text-hk-taupe/80 truncate block">
                      {asset.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {compatibleAssets.length === 0 && (
            <div className="py-12 text-center text-xs font-manrope text-hk-charcoal/60">
              Tidak ada aset yang cocok dengan pencarian "{searchQuery}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
