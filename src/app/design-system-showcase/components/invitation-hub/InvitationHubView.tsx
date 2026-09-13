'use client';

import React from 'react';
import { Sparkles, ShieldCheck, Layers } from 'lucide-react';
import { ArchetypesMatrixSection } from './ArchetypesMatrixSection';
import { InvitationAssetCatalogSection } from './InvitationAssetCatalogSection';
import { InvitationPlaygroundSection } from './InvitationPlaygroundSection';
import { InvitationMobileFrameSection } from './InvitationMobileFrameSection';

export function InvitationHubView() {
  return (
    <div className="space-y-24">
      {/* Sandbox Guarantees Banner */}
      <div className="rounded-2xl border border-hk-champagne/60 bg-gradient-to-r from-hk-ivory via-white to-hk-soft-beige/40 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hk-taupe text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-editorial text-2xl text-hk-charcoal">
                  Undangan Digital Visual System (Sandbox Mode)
                </h3>
                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-manrope font-bold text-emerald-800">
                  Zero Regression Active
                </span>
              </div>
              <p className="mt-1 font-manrope text-xs leading-relaxed text-hk-charcoal/75 max-w-3xl">
                Laboratorium visual terisolasi: eksplorasi 8 arketipe, 243 aset fine-line, 8 varian galeri, generator QRIS dinamis, dan buku tamu kedalaman optik (Focus-Blur) menggunakan data dummy tanpa memodifikasi template produksi yang sedang aktif.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 rounded-xl border border-hk-champagne/40 bg-white px-3 py-2 text-xs font-manrope text-hk-taupe font-semibold shadow-2xs">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <span>Templates Produksi Terlindungi</span>
          </div>
        </div>
      </div>

      {/* 1. Archetypes Matrix Section */}
      <ArchetypesMatrixSection />

      {/* 2. Vector Assets Catalog Section */}
      <InvitationAssetCatalogSection />

      {/* 3. Interactive Components Playground */}
      <InvitationPlaygroundSection />

      {/* 4. Full Mobile Viewport Simulator */}
      <InvitationMobileFrameSection />
    </div>
  );
}
