"use client";
import React, { useState } from 'react';
import { filterStudioAssets, listStudioAssets, type StudioAsset, type StudioAssetCategory } from '@/lib/invitation-studio/assets';

export function AssetCatalog({ onAdd, disabled }: { onAdd: (asset: StudioAsset | 'text' | 'component') => void; disabled: boolean }) {
  const [query, setQuery] = useState(''), [category, setCategory] = useState(''), [tag, setTag] = useState('');
  const assets = listStudioAssets();
  const field = 'min-h-11 w-full min-w-0 rounded border border-hk-soft-beige p-2';
  return <section className="space-y-2"><h2 className="font-bold">Asset catalog</h2>
    <label className="block text-sm">Cari asset<input className={field} value={query} onChange={e => setQuery(e.target.value)} /></label>
    <label className="block text-sm">Kategori<select className={field} value={category} onChange={e => setCategory(e.target.value)}><option value="">Semua kategori</option>{[...new Set(assets.map(a => a.category))].map(c => <option key={c}>{c}</option>)}</select></label>
    <label className="block text-sm">Tag<select className={field} value={tag} onChange={e => setTag(e.target.value)}><option value="">Semua tag</option>{[...new Set(assets.flatMap(a => [...a.tags]))].map(t => <option key={t}>{t}</option>)}</select></label>
    <div className="grid grid-cols-2 gap-2">{filterStudioAssets({ query, category: category ? category as StudioAssetCategory : undefined, tag: tag || undefined }).map(asset => <button key={asset.id} disabled={disabled} onClick={() => onAdd(asset)} className="min-h-11 min-w-0 rounded border p-2 text-xs"><img src={asset.path} alt="" loading="lazy" className="mx-auto h-12 w-12 object-contain" /><span className="break-words">{asset.id}</span></button>)}</div>
    <button disabled={disabled} className={field} onClick={() => onAdd('text')}>Tambah teks</button>
    <button disabled={disabled} className={field} onClick={() => onAdd('component')}>Tambah blok section</button>
  </section>;
}
