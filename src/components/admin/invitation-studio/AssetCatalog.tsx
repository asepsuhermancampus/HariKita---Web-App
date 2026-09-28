"use client";

import React, { useMemo, useState } from 'react';
import {
  filterStudioAssets,
  listStudioAssets,
  listAssetCategories,
  listAssetSubCategories,
  type StudioAsset,
} from '@/lib/invitation-studio/assets';
import { Search, Type, LayoutTemplate, Palette, X, ChevronDown } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  // Sumber A — harikita-assets/
  floral:       'Floral',
  decorative:   'Dekorasi',
  frames:       'Bingkai',
  icons:        'Ikon',
  backgrounds:  'Background',
  brand:        'Brand',
  'event-icon': 'Event',
  image:        'Gambar',
  frame:        'Bingkai',
  // Sumber B — assets/harikita/
  abstract:     'Abstrak',
  avatars:      'Avatar',
  cards:        'Kartu',
  compositions: 'Komposisi',
  corners:      'Sudut',
  flowers:      'Bunga',
  leaves:       'Daun',
  lines:        'Garis',
  ornaments:    'Ornamen',
  patterns:     'Pola',
  textures:     'Tekstur',
};

/** SubCategory label yang lebih ramah */
const SUBCATEGORY_LABELS: Record<string, string> = {
  // flowers sub
  blooms:        'Mekar Penuh',
  accents:       'Aksen Bunga',
  'single-stem': 'Tangkai Tunggal',
  // leaves sub
  branches:      'Ranting',
  sprigs:        'Sprigs',
  stems:         'Tangkai',
  // decorative sub
  'stars-sparkles': 'Bintang & Kilau',
  // floral sub (Sumber A)
  'bouquets':    'Buket',
  'wreaths':     'Karangan',
  'single':      'Tunggal',
};



export function AssetCatalog({
  onAdd,
  disabled,
}: {
  onAdd: (asset: StudioAsset | 'text' | 'component') => void;
  disabled: boolean;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');

  const allAssets = useMemo(() => listStudioAssets(), []);
  const categories = useMemo(() => listAssetCategories(), []);
  const subCategories = useMemo(
    () => listAssetSubCategories(category || undefined),
    [category]
  );

  const filteredAssets = useMemo(
    () =>
      filterStudioAssets({
        category: category || undefined,
        subCategory: subCategory || undefined,
        query: query || undefined,
      }),
    [query, category, subCategory]
  );

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setSubCategory('');
  };

  return (
    <section className="flex flex-col h-full min-h-0 gap-3">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-[#C5A880]" />
          <h2 className="text-sm font-bold text-hk-charcoal">Katalog Aset</h2>
        </div>
        <span className="text-[11px] text-hk-taupe">
          {filteredAssets.length}/{allAssets.length} aset
        </span>
      </div>

      {/* Quick Add Primitives */}
      <div className="shrink-0 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAdd('text')}
          className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-hk-soft-beige bg-[#FAF8F5] text-xs font-semibold text-[#4A2E35] shadow-2xs transition hover:border-[#C5A880] hover:bg-[#F3EDE6] disabled:opacity-40"
        >
          <Type className="h-3.5 w-3.5 text-[#C5A880]" />
          <span>Tambah Teks</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onAdd('component')}
          className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-hk-soft-beige bg-[#FAF8F5] text-xs font-semibold text-[#4A2E35] shadow-2xs transition hover:border-[#C5A880] hover:bg-[#F3EDE6] disabled:opacity-40"
        >
          <LayoutTemplate className="h-3.5 w-3.5 text-[#C5A880]" />
          <span>Tambah Blok</span>
        </button>
      </div>

      {/* Search */}
      <div className="shrink-0 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-hk-taupe/70 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari ornamen, bunga, bingkai..."
          className="h-9 w-full rounded-xl border border-hk-soft-beige bg-[#FAF8F5] pl-9 pr-8 text-xs text-hk-charcoal placeholder-hk-taupe/60 transition focus:border-[#C5A880] focus:bg-white focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-hk-taupe hover:text-hk-charcoal"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Category Chips */}
      <div className="shrink-0 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => handleCategoryChange('')}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition border ${
            !category
              ? 'bg-[#C5A880] text-white border-[#C5A880] shadow-2xs'
              : 'bg-white border-hk-soft-beige text-hk-taupe hover:border-[#C5A880] hover:text-hk-charcoal'
          }`}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => handleCategoryChange(cat)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition border ${
              category === cat
                ? 'bg-[#C5A880] text-white border-[#C5A880] shadow-2xs'
                : 'bg-white border-hk-soft-beige text-hk-taupe hover:border-[#C5A880] hover:text-hk-charcoal'
            }`}
          >
            {CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* SubCategory Filter (show only when a category has subcategories) */}
      {subCategories.length > 0 && (
        <div className="shrink-0 relative">
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-hk-taupe pointer-events-none" />
          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="h-8 w-full appearance-none rounded-lg border border-hk-soft-beige bg-white pl-3 pr-7 text-xs text-hk-charcoal transition focus:border-[#C5A880] focus:outline-none"
          >
            <option value="">Semua sub-kategori</option>
            {subCategories.map((sc) => (
              <option key={sc} value={sc}>
                {SUBCATEGORY_LABELS[sc] ?? sc.replace(/-/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Asset Grid — scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
        {filteredAssets.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 pb-2">
            {filteredAssets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                disabled={disabled}
                onClick={() => onAdd(asset)}
                title={`Klik untuk menambahkan ${asset.label ?? asset.id}`}
                className="group flex flex-col items-center gap-1.5 rounded-xl border border-hk-soft-beige bg-white p-2 text-center transition hover:border-[#C5A880] hover:bg-[#FAF8F5] hover:shadow-2xs disabled:opacity-40"
              >
                <div className="flex h-14 w-full items-center justify-center rounded-lg bg-[#FAF8F5] p-1.5 transition group-hover:scale-105">
                  <img
                    src={asset.path}
                    alt=""
                    loading="lazy"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <span className="block w-full truncate text-[10px] font-medium text-hk-charcoal leading-tight">
                  {asset.label ?? asset.id.replace(/^[ab]-/, '').replace(/-/g, ' ')}
                </span>
                {asset.subCategory && (
                  <span className="block text-[9px] text-hk-taupe/70 truncate w-full">
                    {SUBCATEGORY_LABELS[asset.subCategory] ?? asset.subCategory.replace(/-/g, ' ')}
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-xs text-hk-taupe">
            Tidak ada aset yang sesuai filter.
          </p>
        )}
      </div>
    </section>
  );
}
