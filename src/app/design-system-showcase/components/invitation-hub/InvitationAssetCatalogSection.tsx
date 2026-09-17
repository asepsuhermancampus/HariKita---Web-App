'use client';

import React, { useState, useMemo } from 'react';
import { Grid, Search, ZoomIn, Copy, Check, FileCode, SlidersHorizontal } from 'lucide-react';
import { getHariKitaAssets, getHariKitaAssetSummary } from '@/lib/harikita-assets';
import { HariKitaAsset } from '@/types/harikita-asset';
import { SvgAssetViewer } from '../brand-hub/CoreAssetsSection';
import { AssetZoomModal } from './AssetZoomModal';
import { cn } from '@/lib/utils';

type FilterGroup =
  | 'all'
  | 'cards'
  | 'botanical'
  | 'lines'
  | 'badges'
  | 'icons'
  | 'textures';

export function InvitationAssetCatalogSection() {
  const [activeGroup, setActiveGroup] = useState<FilterGroup>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [strokeColor, setStrokeColor] = useState<string>('taupe');
  const [selectedAsset, setSelectedAsset] = useState<HariKitaAsset | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allAssets = getHariKitaAssets();
  const assetSummary = useMemo(() => getHariKitaAssetSummary(), []);


  const colorClassMap: Record<string, string> = {
    taupe: 'text-hk-taupe',
    charcoal: 'text-hk-charcoal',
    champagne: 'text-hk-champagne',
    'soft-beige': 'text-hk-soft-beige',
    'forest-sage': 'text-[#5B6E58]',
    'deep-sogan': 'text-[#5A3825]',
    emerald: 'text-[#2C4A3E]',
  };

  const filteredAssets = useMemo(() => {
    return allAssets.filter((asset) => {
      // Group category matching
      if (activeGroup === 'cards') {
        if (!['cards', 'corners'].includes(asset.category)) return false;
      } else if (activeGroup === 'botanical') {
        if (!asset.category.startsWith('flowers') && !asset.category.startsWith('leaves'))
          return false;
      } else if (activeGroup === 'lines') {
        if (asset.category !== 'lines') return false;
      } else if (activeGroup === 'badges') {
        if (!['avatars', 'abstract', 'ornaments'].includes(asset.category))
          return false;
      } else if (activeGroup === 'icons') {
        if (asset.category !== 'icons') return false;
      } else if (activeGroup === 'textures') {
        if (!['textures', 'patterns'].includes(asset.category)) return false;
      }

      // Search query matching
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = asset.name.toLowerCase().includes(query);
        const matchId = asset.id.toLowerCase().includes(query);
        const matchCategory = asset.category.toLowerCase().includes(query);
        const matchTags = asset.tags?.some((t) => t.toLowerCase().includes(query));
        return matchName || matchId || matchCategory || matchTags;
      }

      return true;
    });
  }, [allAssets, activeGroup, searchQuery]);

  const handleQuickCopyPath = (e: React.MouseEvent, asset: HariKitaAsset) => {
    e.stopPropagation();
    navigator.clipboard.writeText(asset.filePath);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <section id="invitation-assets" className="scroll-mt-24">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-hk-champagne/40 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-hk-taupe">
            <Grid className="h-5 w-5" />
            <span className="font-manrope text-xs font-bold uppercase tracking-widest">
              Craftsmanship Library
            </span>
          </div>
          <h2 className="mt-1 font-editorial text-3xl font-normal text-hk-charcoal">
            Katalog {assetSummary.total} Aset Desain ({filteredAssets.length} Ditampilkan)
          </h2>
          <p className="mt-1 font-manrope text-xs text-hk-charcoal/70">
            Terdiri dari {assetSummary.vectorCount} ornamen vektor fine-line SVG dan {assetSummary.textureCount} tekstur permukaan autentik.
          </p>
        </div>

        {/* Live Color Stroke Swapper */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-manrope text-xs font-semibold text-hk-charcoal/70">
            Warna Tinta:
          </span>
          <div className="flex rounded-full border border-hk-champagne/60 bg-white p-1 shadow-xs">
            {[
              { id: 'taupe', label: 'Taupe' },
              { id: 'charcoal', label: 'Charcoal' },
              { id: 'champagne', label: 'Champagne' },
              { id: 'forest-sage', label: 'Sage' },
              { id: 'deep-sogan', label: 'Sogan' },
              { id: 'emerald', label: 'Emerald' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setStrokeColor(c.id)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-manrope font-semibold transition-colors',
                  strokeColor === c.id
                    ? 'bg-hk-taupe text-white shadow-xs'
                    : 'text-hk-charcoal/70 hover:text-hk-charcoal'
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pb-4">
        {/* Category Pill Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: `Semua (${assetSummary.total})` },
            { id: 'cards', label: 'Cards & Frames' },
            { id: 'botanical', label: 'Botanical Ornaments' },
            { id: 'lines', label: 'Dividers & Lines' },
            { id: 'badges', label: 'Badges & Seals' },
            { id: 'icons', label: 'Wedding Icons' },
            { id: 'textures', label: `Textures (${assetSummary.textureCount})` },
          ].map((grp) => (
            <button
              key={grp.id}
              onClick={() => setActiveGroup(grp.id as FilterGroup)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-manrope font-medium transition-all',
                activeGroup === grp.id
                  ? 'bg-hk-taupe text-white font-semibold shadow-xs'
                  : 'bg-white border border-hk-champagne/40 text-hk-charcoal hover:border-hk-taupe'
              )}
            >
              {grp.label}
            </button>
          ))}
        </div>

        {/* Search Input Box */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-hk-taupe/70" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari aset (nama, id, tag)..."
            className="w-full rounded-full border border-hk-champagne/50 bg-white py-1.5 pl-8 pr-3 text-xs font-manrope placeholder:text-hk-charcoal/50 focus:border-hk-taupe focus:outline-hidden"
          />
        </div>
      </div>

      {/* Asset Grid Display */}
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => setSelectedAsset(asset)}
            className="group relative flex flex-col items-center justify-between rounded-xl border border-hk-champagne/40 bg-white p-3 shadow-xs transition-all hover:border-hk-taupe hover:shadow-md cursor-pointer"
          >
            {/* Quick Zoom Pill Button on Hover */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-hk-taupe shadow-xs backdrop-blur-xs">
                <ZoomIn className="h-3.5 w-3.5" />
              </span>
            </div>

            {/* Asset Preview Container */}
            <div className="flex h-28 w-full items-center justify-center rounded-lg bg-hk-ivory p-3 overflow-hidden">
              <SvgAssetViewer
                asset={asset}
                colorClass={colorClassMap[strokeColor] || 'text-hk-taupe'}
              />
            </div>

            {/* Metadata & Quick Copy Action */}
            <div className="mt-2 w-full text-center">
              <p className="truncate font-manrope text-[11px] font-semibold text-hk-charcoal">
                {asset.name}
              </p>
              <span className="font-mono text-[9px] text-hk-taupe/80 truncate block">
                {asset.category}
              </span>

              {/* Quick Copy Path Button */}
              <button
                onClick={(e) => handleQuickCopyPath(e, asset)}
                className="mt-2 flex w-full items-center justify-center gap-1 rounded bg-hk-soft-beige/60 py-1 text-[10px] font-manrope font-semibold text-hk-charcoal/80 hover:bg-hk-soft-beige hover:text-hk-charcoal transition-colors"
              >
                {copiedId === asset.id ? (
                  <>
                    <Check className="h-2.5 w-2.5 text-emerald-700" />
                    <span className="text-emerald-700">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-2.5 w-2.5 text-hk-taupe" />
                    <span>Salin Path</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="py-16 text-center text-hk-charcoal/60 font-manrope text-sm border border-dashed border-hk-champagne/40 rounded-2xl">
          Tidak ada aset yang cocok dengan pencarian "{searchQuery}".
        </div>
      )}

      {/* Asset Zoom Modal */}
      {selectedAsset && (
        <AssetZoomModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          colorClass={colorClassMap[strokeColor] || 'text-hk-taupe'}
        />
      )}
    </section>
  );
}
