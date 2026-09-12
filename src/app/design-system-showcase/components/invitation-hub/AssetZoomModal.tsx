'use client';

import React, { useState } from 'react';
import { X, Copy, Check, ZoomIn, FileCode } from 'lucide-react';
import { HariKitaAsset } from '@/types/harikita-asset';
import { SvgAssetViewer } from '../brand-hub/CoreAssetsSection';

interface AssetZoomModalProps {
  asset: HariKitaAsset | null;
  onClose: () => void;
  colorClass: string;
}

export function AssetZoomModal({
  asset,
  onClose,
  colorClass,
}: AssetZoomModalProps) {
  const [copiedType, setCopiedType] = useState<'path' | 'jsx' | null>(null);

  if (!asset) return null;

  const handleCopyPath = () => {
    navigator.clipboard.writeText(asset.filePath);
    setCopiedType('path');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyJsx = () => {
    const jsx = `<ThemedAssetOrnament assetId="${asset.id}" category="${asset.category}" />`;
    navigator.clipboard.writeText(jsx);
    setCopiedType('jsx');
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-hk-champagne/60 bg-white p-4 sm:p-6 md:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (min 44px touch target) */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 flex h-11 w-11 items-center justify-center rounded-full text-hk-charcoal/70 hover:bg-hk-soft-beige/50 hover:text-hk-charcoal transition-colors z-20"
          aria-label="Tutup"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-4 sm:mb-6 pr-8">
          <span className="rounded-full bg-hk-soft-beige px-3 py-1 font-manrope text-xs font-bold uppercase tracking-wider text-hk-taupe">
            {asset.categoryLabel || asset.category}
          </span>
          <h3 className="mt-2 font-editorial text-2xl sm:text-3xl text-hk-charcoal">
            {asset.name}
          </h3>
          <p className="font-mono text-[11px] text-hk-taupe truncate">{asset.filePath}</p>
        </div>

        {/* Large Vector Canvas Area with Checkerboard Background */}
        <div className="relative flex h-52 sm:h-72 w-full items-center justify-center rounded-xl border border-hk-champagne/40 bg-[linear-gradient(45deg,#f8f6f1_25%,transparent_25%),linear-gradient(-45deg,#f8f6f1_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f8f6f1_75%),linear-gradient(-45deg,transparent_75%,#f8f6f1_75%)] bg-[size:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px] p-4 sm:p-6 shadow-inner">
          <div className="h-full w-full flex items-center justify-center [&>div]:max-h-full [&>div]:max-w-full">
            <SvgAssetViewer asset={asset} colorClass={colorClass} />
          </div>
        </div>

        {/* Metadata Details */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-xs font-manrope sm:grid-cols-4 border-t border-hk-soft-beige pt-4">
          <div>
            <span className="block text-hk-charcoal/60 text-[10px] uppercase tracking-wider">
              Asset ID:
            </span>
            <span className="font-mono font-bold text-hk-charcoal">{asset.id}</span>
          </div>
          <div>
            <span className="block text-hk-charcoal/60 text-[10px] uppercase tracking-wider">
              Format:
            </span>
            <span className="font-semibold uppercase text-hk-taupe">
              {asset.format}
            </span>
          </div>
          <div>
            <span className="block text-hk-charcoal/60 text-[10px] uppercase tracking-wider">
              Rasio Aspek:
            </span>
            <span className="font-semibold text-hk-charcoal">
              {asset.aspectRatio || '1:1'}
            </span>
          </div>
          <div>
            <span className="block text-hk-charcoal/60 text-[10px] uppercase tracking-wider">
              Saran Penggunaan:
            </span>
            <span className="font-medium text-hk-charcoal truncate block">
              {asset.suggestedUsage || 'Ornamen Konten'}
            </span>
          </div>
        </div>

        {/* Action Buttons: Copy Path & Copy JSX */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-hk-soft-beige">
          <button
            onClick={handleCopyPath}
            className="flex items-center gap-1.5 rounded-lg border border-hk-champagne/60 bg-hk-ivory px-4 py-2 font-manrope text-xs font-semibold text-hk-charcoal hover:border-hk-taupe transition-colors"
          >
            {copiedType === 'path' ? (
              <>
                <Check className="h-4 w-4 text-emerald-700" />
                <span className="text-emerald-700">Path Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-hk-taupe" />
                <span>Salin Path SVG</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopyJsx}
            className="flex items-center gap-1.5 rounded-lg bg-hk-taupe px-4 py-2 font-manrope text-xs font-semibold text-white hover:bg-hk-charcoal transition-colors shadow-sm"
          >
            {copiedType === 'jsx' ? (
              <>
                <Check className="h-4 w-4 text-emerald-300" />
                <span>Komponen JSX Tersalin!</span>
              </>
            ) : (
              <>
                <FileCode className="h-4 w-4" />
                <span>Salin Komponen JSX</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
