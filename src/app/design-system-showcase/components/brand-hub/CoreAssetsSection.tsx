'use client';

import React, { useState, useEffect } from 'react';
import { Grid } from 'lucide-react';
import { getHariKitaAssets, getAllCategories } from '@/lib/harikita-assets';
import { HariKitaAsset } from '@/types/harikita-asset';
import { cn } from '@/lib/utils';

// In-memory cache for loaded SVG contents
const svgCache: Record<string, string> = {};

export function SvgAssetViewer({
  asset,
  colorClass,
}: {
  asset: HariKitaAsset;
  colorClass: string;
}) {
  const [svgContent, setSvgContent] = useState<string | null>(
    svgCache[asset.filePath] || null
  );
  const src = `/${asset.filePath.replace(/^\//, '')}`;

  useEffect(() => {
    if (asset.format === 'webp') return;
    if (svgCache[asset.filePath]) {
      setSvgContent(svgCache[asset.filePath]);
      return;
    }

    let isMounted = true;
    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((data) => {
        if (isMounted) {
          svgCache[asset.filePath] = data;
          setSvgContent(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load asset:', src, err);
      });

    return () => {
      isMounted = false;
    };
  }, [asset.filePath, asset.format, src]);

  if (asset.format === 'webp') {
    return (
      <img
        src={src}
        alt={asset.name}
        className="h-full w-full object-cover rounded-md"
        loading="lazy"
      />
    );
  }

  if (!svgContent) {
    return (
      <div className="flex h-full w-full items-center justify-center opacity-30">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center transition-colors duration-200',
        '[&>svg]:max-h-full [&>svg]:max-w-full [&>svg]:object-contain',
        colorClass
      )}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}

export function CoreAssetsSection() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [assetColor, setAssetColor] = useState<
    'taupe' | 'charcoal' | 'champagne' | 'soft-beige'
  >('taupe');

  const allAssets = getHariKitaAssets();
  const categories = ['all', ...getAllCategories()];

  const filteredAssets =
    activeCategory === 'all'
      ? allAssets
      : allAssets.filter((a) => a.category === activeCategory);

  const assetColorClasses = {
    taupe: 'text-hk-taupe',
    charcoal: 'text-hk-charcoal',
    champagne: 'text-hk-champagne',
    'soft-beige': 'text-hk-soft-beige',
  };

  return (
    <section id="assets" className="scroll-mt-24">
      <div className="mb-6 flex flex-col gap-4 border-b border-hk-champagne/40 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-hk-taupe">
            <Grid className="h-5 w-5" />
            <span className="font-manrope text-xs font-bold uppercase tracking-widest">
              Vector Visual Assets
            </span>
          </div>
          <h2 className="mt-1 font-editorial text-3xl font-normal text-hk-charcoal">
            Core Asset Catalog ({filteredAssets.length} / {allAssets.length})
          </h2>
        </div>

        {/* Live Color Swapper for Assets */}
        <div className="flex items-center gap-2">
          <span className="font-manrope text-xs font-semibold text-hk-charcoal/70">
            Warna Stroke:
          </span>
          <div className="flex rounded-full border border-hk-champagne/60 bg-white p-1 shadow-sm">
            {(['taupe', 'charcoal', 'champagne', 'soft-beige'] as const).map(
              (clr) => (
                <button
                  key={clr}
                  onClick={() => setAssetColor(clr)}
                  className={`rounded-full px-3 py-1 text-xs font-manrope font-semibold capitalize transition-colors ${
                    assetColor === clr
                      ? 'bg-hk-taupe text-white shadow-sm'
                      : 'text-hk-charcoal/70 hover:text-hk-charcoal'
                  }`}
                >
                  {clr}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-3 py-1 text-xs font-manrope font-medium transition-all ${
              activeCategory === cat
                ? 'bg-hk-taupe text-white font-semibold shadow-sm'
                : 'bg-white border border-hk-champagne/40 text-hk-charcoal hover:border-hk-taupe'
            }`}
          >
            {cat.replace(/-/g, ' ')}
          </button>
        ))}
      </div>

      {/* Asset Grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="group flex flex-col items-center justify-between rounded-xl border border-hk-champagne/40 bg-white p-3 shadow-sm transition-all hover:border-hk-taupe hover:shadow-md"
          >
            {/* Asset Preview Container with Dynamic SvgAssetViewer */}
            <div className="flex h-28 w-full items-center justify-center rounded-lg bg-hk-ivory p-3 overflow-hidden">
              <SvgAssetViewer
                asset={asset}
                colorClass={assetColorClasses[assetColor]}
              />
            </div>

            {/* Asset Metadata */}
            <div className="mt-2 w-full text-center">
              <p className="truncate font-manrope text-[11px] font-semibold text-hk-charcoal">
                {asset.name}
              </p>
              <span className="font-mono text-[9px] text-hk-taupe/80">
                {asset.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
