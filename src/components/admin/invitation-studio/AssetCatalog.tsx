"use client";

import React, { useMemo, useState } from 'react';
import { listStudioAssets, type StudioAsset } from '@/lib/invitation-studio/assets';
import { ChevronDown, ChevronRight } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  floral:       '🌸 Floral',
  decorative:   '✨ Dekorasi',
  frames:       '🖼️ Bingkai',
  icons:        '🔮 Ikon',
  backgrounds:  '🎨 Background',
  brand:        '🏷️ Brand',
  'event-icon': '📅 Event',
  image:        '🖼️ Gambar',
  frame:        '🖼️ Bingkai',
  abstract:     '🌀 Abstrak',
  avatars:      '👤 Avatar',
  cards:        '🃏 Kartu',
  compositions: '🎭 Komposisi',
  corners:      '📐 Sudut',
  flowers:      '🌺 Bunga',
  leaves:       '🍃 Daun',
  lines:        '〰️ Garis',
  ornaments:    '🎀 Ornamen',
  patterns:     '🔷 Pola',
  textures:     '🧵 Tekstur',
};

export function AssetCatalog({
  onAdd,
  disabled,
}: {
  onAdd: (asset: StudioAsset) => void;
  disabled: boolean;
}) {
  const allAssets = useMemo(() => listStudioAssets(), []);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, StudioAsset[]>();
    for (const a of allAssets) {
      const cat = a.category ?? 'other';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(a);
    }
    return map;
  }, [allAssets]);

  // All categories expanded by default (first 3 open, rest closed)
  const allCats = useMemo(() => Array.from(grouped.keys()), [grouped]);
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(allCats.slice(0, 3))
  );

  const toggle = (cat: string) =>
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  return (
    <div className="flex flex-col gap-1">
      {/* Total count */}
      <p className="shrink-0 mb-1 text-[10px] text-hk-taupe text-right">
        {allAssets.length} aset tersedia
      </p>

      {/* Category accordions */}
      {allCats.map(cat => {
        const assets = grouped.get(cat)!;
        const isOpen = expanded.has(cat);
        const label = CATEGORY_LABELS[cat] ?? cat;

        return (
          <div key={cat} className="rounded-xl border border-hk-soft-beige bg-white overflow-hidden">
            {/* Category header */}
            <button
              type="button"
              onClick={() => toggle(cat)}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#FAF8F5] transition"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[11px] font-bold text-hk-charcoal truncate">{label}</span>
                <span className="text-[10px] text-hk-taupe/70 shrink-0">({assets.length})</span>
              </div>
              {isOpen
                ? <ChevronDown className="h-3.5 w-3.5 text-hk-taupe shrink-0" />
                : <ChevronRight className="h-3.5 w-3.5 text-hk-taupe shrink-0" />
              }
            </button>

            {/* Asset grid */}
            {isOpen && (
              <div className="grid grid-cols-3 gap-1.5 px-2 pb-2.5">
                {assets.map(asset => (
                  <button
                    key={asset.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => onAdd(asset)}
                    title={asset.label ?? asset.id.replace(/^[ab]-/, '').replace(/-/g, ' ')}
                    className="group flex flex-col items-center gap-1 rounded-lg border border-transparent bg-[#FAF8F5] p-1.5 transition hover:border-[#C5A880] hover:bg-white hover:shadow-sm disabled:opacity-40"
                  >
                    <div className="flex h-12 w-full items-center justify-center overflow-hidden rounded-md bg-white">
                      <img
                        src={asset.path}
                        alt=""
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                    <span className="block w-full truncate text-center text-[9px] font-medium text-hk-taupe leading-tight group-hover:text-hk-charcoal">
                      {(asset.label ?? asset.id.replace(/^[ab]-/, '').replace(/-/g, ' ')).slice(0, 16)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
