'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { HariKitaLogo } from '@/components/brand/HariKitaLogo';
import { BadgePremium } from '@/components/harikita/ui';
import { getHariKitaAssets } from '@/lib/harikita-assets';
import { ShowcaseHeader, ShowcaseHubType } from './components/ShowcaseHeader';
import { BrandHubView } from './components/brand-hub/BrandHubView';
import { InvitationHubView } from './components/invitation-hub/InvitationHubView';

function ShowcaseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const hubParam = searchParams.get('hub') as ShowcaseHubType | null;
  const activeHub: ShowcaseHubType = hubParam === 'invitation' ? 'invitation' : 'brand';

  const allAssets = getHariKitaAssets();

  const handleSelectHub = (hub: ShowcaseHubType) => {
    router.push(`/design-system-showcase?hub=${hub}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-hk-ivory text-hk-charcoal selection:bg-hk-champagne selection:text-white">
      {/* Topbar Navigation with Dual-Hub Switcher */}
      <ShowcaseHeader
        activeHub={activeHub}
        onSelectHub={handleSelectHub}
        brandAssetCount={allAssets.length}
      />

      {/* Hero Header */}
      <header className="border-b border-hk-champagne/30 bg-gradient-to-b from-white to-hk-ivory px-6 py-12 text-center">
        <div className="mx-auto max-w-4xl">
          <BadgePremium
            label={activeHub === 'brand' ? 'OFFICIAL BRAND SYSTEM' : 'WEDDING INVITATION SANDBOX'}
            variant="pill"
            className="mb-4"
          />
          <h1 className="font-editorial text-4xl font-normal tracking-tight text-hk-charcoal md:text-6xl">
            {activeHub === 'brand' ? 'HariKita Visual Language' : 'Wedding Invitation Design System'}
          </h1>
          <p className="mt-3 font-editorial text-xl italic text-hk-taupe">
            {activeHub === 'brand'
              ? '"Rangkai Hari Bahagiamu, Menyelaraskan Restu & Impian."'
              : 'Bespoke Individuality (Anti Cookie-Cutter): 8 Arketipe, 243 Aset Fine-Line & 120+ Varian'}
          </p>
          <p className="mx-auto mt-3 max-w-2xl font-manrope text-sm leading-relaxed text-hk-charcoal/80">
            {activeHub === 'brand'
              ? 'Sistem visual komprehensif berstandar editorial luxury untuk platform lamaran & pernikahan hyperlocal Kabupaten Kebumen. Berbasis 5 palet warna resmi, tipografi Cormorant Garamond & Manrope, 134 aset fine-line SVG, dan komponen modular.'
              : 'Sandbox eksplorasi dan laboratorium visual untuk konten template undangan digital HariKita. Menguji varian geometri kartu, ornamen SVG, generator QRIS dinamis, dan efek depth-of-field secara terisolasi tanpa mengubah template produksi.'}
          </p>
        </div>
      </header>

      {/* Main Hub Body */}
      <main className="mx-auto max-w-7xl px-6 py-16">
        {activeHub === 'brand' ? <BrandHubView /> : <InvitationHubView />}
      </main>

      {/* Showcase Dedicated Footer */}
      <footer className="border-t border-hk-champagne/40 bg-white py-12 text-center">
        <div className="mx-auto max-w-4xl px-6">
          <HariKitaLogo variant="horizontal" size="md" asLink={false} />
          <p className="mt-3 font-editorial text-sm italic text-hk-taupe">
            "Rangkai Hari Bahagiamu, Menyelaraskan Restu &amp; Impian."
          </p>
          <p className="mt-4 font-manrope text-xs text-hk-charcoal/60">
            &copy; 2026 HariKita. Design System &amp; Living Style Guide. Hyperlocal Pilot: Kabupaten Kebumen, Jawa Tengah.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function DesignSystemShowcasePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-hk-ivory flex items-center justify-center font-editorial text-2xl text-hk-taupe">
          Memuat HariKita Design System...
        </div>
      }
    >
      <ShowcaseContent />
    </Suspense>
  );
}
