'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Palette,
  Smartphone,
  Check,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Sliders,
  Maximize2,
} from 'lucide-react';
import {
  InvitationStudioConfig,
  CoupleCardVariantId,
  PlacementStyleId,
  SlotZoneId,
  DeviceFrameId,
  AnimationMoodPreset,
  VisualEffectId,
  MicroAnimationId,
} from '@/types/invitation-studio';
import { SANDBOX_STUDIO_DEFAULTS } from '@/app/design-system-showcase/data/mock-invitation-sandbox';
import { StudioColorPalettePicker } from './StudioColorPalettePicker';
import { StudioPlacementPicker } from './StudioPlacementPicker';
import { StudioEffectsController } from './StudioEffectsController';
import { StudioSlotAssetModal } from './StudioSlotAssetModal';
import { DeviceFrameContainer } from './DeviceFrameContainer';
import { InvitationDevicePreview } from './InvitationDevicePreview';
import { SLOT_ZONE_RULES } from './AssetPlacementEngine';
import { cn } from '@/lib/utils';

export function InvitationStudioBuilder() {
  const [config, setConfig] = useState<InvitationStudioConfig>(SANDBOX_STUDIO_DEFAULTS);
  const [activeSlotModal, setActiveSlotModal] = useState<SlotZoneId | null>(null);

  const updateConfig = (updater: Partial<InvitationStudioConfig>) => {
    setConfig((prev) => ({ ...prev, ...updater }));
  };

  const handleSelectColor = (hex: string) => {
    updateConfig({ themeColor: hex });
  };

  const handleSelectPlacementStyle = (styleId: PlacementStyleId) => {
    updateConfig({ placementStyle: styleId });
  };

  const handleSelectCoupleVariant = (variant: CoupleCardVariantId) => {
    updateConfig({ coupleVariant: variant });
  };

  const handleSelectGalleryVariant = (variant: string) => {
    updateConfig({ galleryVariant: variant });
  };

  const handleApplyMood = (mood: AnimationMoodPreset) => {
    if (mood === 'serene') {
      updateConfig({
        animationMood: 'serene',
        activeEffects: ['frosted-glassmorphism', 'cotton-paper-texture'],
        activeAnimations: [],
      });
    } else if (mood === 'graceful') {
      updateConfig({
        animationMood: 'graceful',
        activeEffects: [
          'specular-gold-shimmer',
          'frosted-glassmorphism',
          'inner-gilded-rim-light',
          'cotton-paper-texture',
          'floating-petals',
        ],
        activeAnimations: [
          'svg-path-stroke-draw',
          'botanical-sway',
          'narrative-reveal',
          'gatefold-wax-open',
          'heartbeat-pulse',
          'morphing-copy-btn',
        ],
      });
    } else {
      // Cinematic wonder
      updateConfig({
        animationMood: 'cinematic',
        activeEffects: [
          'specular-gold-shimmer',
          'frosted-glassmorphism',
          'inner-gilded-rim-light',
          'cotton-paper-texture',
          'floating-petals',
          'radial-vignette-depth',
          'aurora-halo-glow',
          'physical-drop-shadow',
          'stardust-twinkle',
        ],
        activeAnimations: [
          'svg-path-stroke-draw',
          'botanical-sway',
          'narrative-reveal',
          'gatefold-wax-open',
          'heartbeat-pulse',
          'parallax-depth',
          'inertia-tilt',
          'countdown-ticker',
          'music-equalizer-wave',
          'rsvp-petal-burst',
          'elastic-wax-press',
          'morphing-copy-btn',
        ],
      });
    }
  };

  const handleToggleEffect = (effectId: VisualEffectId) => {
    const active = config.activeEffects.includes(effectId);
    updateConfig({
      activeEffects: active
        ? config.activeEffects.filter((e) => e !== effectId)
        : [...config.activeEffects, effectId],
    });
  };

  const handleToggleAnimation = (animId: MicroAnimationId) => {
    const active = config.activeAnimations.includes(animId);
    updateConfig({
      activeAnimations: active
        ? config.activeAnimations.filter((a) => a !== animId)
        : [...config.activeAnimations, animId],
    });
  };

  const handleResetToDefaults = () => {
    setConfig(SANDBOX_STUDIO_DEFAULTS);
  };

  const coupleVariantsList: { id: CoupleCardVariantId; label: string; desc: string }[] = [
    { id: 'twin-arches', label: '1. Twin Arches Floral', desc: 'Kubah ganda klasik flora' },
    { id: 'floating-glass', label: '2. Floating Soft Glass', desc: 'Kaca kristal kedalaman' },
    { id: 'editorial-serif', label: '3. Editorial Serif Vogue', desc: 'Format majalah seni tinggi' },
    { id: 'fullscreen-prewed', label: '4. Fullscreen Sinematik', desc: 'Potret penuh dramatis' },
    { id: 'mihrab-arabesque', label: '5. Mihrab Islami Syar’i', desc: 'Kubah arabesque suci' },
    { id: 'javanese-gunungan', label: '6. Javanese Gunungan', desc: 'Adiluhung Jawa & sogan' },
    { id: 'royal-medallion', label: '7. Royal Medallion 3D', desc: 'Oval emas segel lilin' },
    { id: 'polaroid-scrapbook', label: '8. Polaroid Scrapbook', desc: 'Stempel pos hangat' },
  ];

  const galleryVariantsList = [
    { id: 'editorial-masonry', label: 'Editorial Masonry' },
    { id: 'filmstrip-reel', label: 'Horizontal Filmstrip' },
    { id: 'polaroid-scatter', label: 'Cascading Polaroids' },
    { id: 'classic-grid', label: 'Square Clean Grid' },
  ];

  return (
    <section id="invitation-studio" className="scroll-mt-24 space-y-8">
      {/* Studio Header Banner */}
      <div className="flex flex-col gap-4 rounded-2xl border border-hk-champagne/60 bg-gradient-to-r from-hk-ivory via-white to-hk-soft-beige/40 p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-hk-taupe">
            <Sliders className="h-5 w-5" />
            <span className="font-manrope text-xs font-bold uppercase tracking-widest">
              Live Mix-and-Match Customizer
            </span>
          </div>
          <h2 className="mt-1 font-editorial text-3xl font-normal text-hk-charcoal">
            Studio Racik Undangan Digital Kustom
          </h2>
          <p className="font-manrope text-xs text-hk-charcoal/70 mt-1 max-w-2xl leading-relaxed">
            Rancang undangan pernikahan impian Anda secara bebas: pilih style dari arketipe manapun, ganti palet warna, atur posisi ornamen bersistem guardrails, dan uji tampilan secara langsung di simulator ponsel sebelah kanan.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 rounded-xl border border-hk-champagne/50 bg-white px-3 py-2 text-xs font-manrope font-semibold text-hk-charcoal hover:border-hk-taupe shadow-2xs transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5 text-hk-taupe" />
            <span>Reset Bawaan</span>
          </button>
        </div>
      </div>

      {/* Split-Screen Studio Layout (65% Builder Left : 35% Sticky Smartphone Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT COLUMN: BUILDER CONTROLS (7/12 ~ 65%) ================= */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1: 12-Color Palette Swapper */}
          <StudioColorPalettePicker
            selectedColor={config.themeColor}
            onSelectColor={handleSelectColor}
          />

          {/* Step 2: 10 Asset Placement Styles */}
          <StudioPlacementPicker
            selectedStyle={config.placementStyle}
            onSelectStyle={handleSelectPlacementStyle}
            themeColor={config.themeColor}
          />

          {/* Step 3: Curated Slot Ornaments Customizer */}
          <div className="rounded-2xl border border-hk-champagne/50 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between border-b border-hk-champagne/30 pb-3">
              <div>
                <h4 className="font-editorial text-xl text-hk-charcoal font-medium leading-none">
                  Kustomisasi 6 Zona Slot Ornamen Vektor
                </h4>
                <p className="font-manrope text-xs text-hk-charcoal/60 mt-0.5">
                  Tukar ornamen satuan sesuai selera. Sistem otomatis menyaring aset yang cocok via Visual Guardrails:
                </p>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-manrope font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="h-3 w-3 text-emerald-700" />
                <span>Auto-Filtered</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(SLOT_ZONE_RULES) as SlotZoneId[]).map((slotId) => {
                const rule = SLOT_ZONE_RULES[slotId];
                const activeAsset = (config.slotAssets as any)[slotId] || 'Bawaan Gaya';
                return (
                  <div
                    key={slotId}
                    className="flex items-center justify-between rounded-xl border border-hk-champagne/40 bg-hk-ivory/40 p-3"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-manrope text-[9px] font-bold uppercase tracking-wider text-hk-taupe">
                        {rule.label.split(':')[0]}
                      </span>
                      <p className="font-editorial text-sm font-semibold text-hk-charcoal truncate">
                        {rule.label.split(':')[1]}
                      </p>
                      <span className="font-mono text-[9px] text-hk-charcoal/60 block truncate">
                        Aset: {String(activeAsset).split('/').pop() || activeAsset}
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveSlotModal(slotId)}
                      className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-manrope font-semibold text-white shadow-2xs transition-transform active:scale-95"
                      style={{ backgroundColor: config.themeColor }}
                    >
                      Ganti Aset
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 4: 8 Distinct The Bride & The Groom Variants */}
          <div className="rounded-2xl border border-hk-champagne/50 bg-white p-5 shadow-xs space-y-4">
            <div className="border-b border-hk-champagne/30 pb-3">
              <h4 className="font-editorial text-xl text-hk-charcoal font-medium leading-none">
                Pilih 8 Varian Kartu "The Bride &amp; The Groom"
              </h4>
              <p className="font-manrope text-xs text-hk-charcoal/60 mt-0.5">
                Setiap varian mengusung arketipe berbeda dan bebas dipadukan dengan tema manapun:
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {coupleVariantsList.map((v) => {
                const isSelected = config.coupleVariant === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => handleSelectCoupleVariant(v.id)}
                    className={cn(
                      'flex flex-col justify-between rounded-xl border p-2.5 text-left transition-all',
                      isSelected
                        ? 'border-hk-charcoal bg-hk-ivory shadow-xs ring-1 ring-hk-charcoal'
                        : 'border-hk-champagne/40 bg-white hover:border-hk-taupe'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-hk-taupe font-bold">
                          {v.id.split('-')[0]}
                        </span>
                        {isSelected && (
                          <span
                            className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-white text-[8px]"
                            style={{ backgroundColor: config.themeColor }}
                          >
                            <Check className="h-2 w-2" />
                          </span>
                        )}
                      </div>
                      <p className="font-editorial text-xs font-bold text-hk-charcoal mt-1 leading-snug">
                        {v.label}
                      </p>
                    </div>
                    <span className="font-manrope text-[9px] text-hk-charcoal/60 mt-1 block">
                      {v.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 5: Gallery Layouts */}
          <div className="rounded-2xl border border-hk-champagne/50 bg-white p-5 shadow-xs space-y-3">
            <div className="border-b border-hk-champagne/30 pb-2">
              <h4 className="font-editorial text-lg text-hk-charcoal font-medium leading-none">
                Gaya Layout Galeri Pre-wedding
              </h4>
              <p className="font-manrope text-xs text-hk-charcoal/60 mt-0.5">
                Pilih format susunan foto momen bahagia mempelai:
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {galleryVariantsList.map((gv) => (
                <button
                  key={gv.id}
                  onClick={() => handleSelectGalleryVariant(gv.id)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-manrope font-semibold transition-all border',
                    config.galleryVariant === gv.id
                      ? 'border-transparent text-white shadow-2xs'
                      : 'border-hk-champagne/50 bg-hk-ivory text-hk-charcoal hover:border-hk-taupe'
                  )}
                  style={{
                    backgroundColor: config.galleryVariant === gv.id ? config.themeColor : undefined,
                  }}
                >
                  {gv.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 6: 15 Optical Effects & 15 Micro-Animations */}
          <StudioEffectsController
            activeEffects={config.activeEffects}
            activeAnimations={config.activeAnimations}
            currentMood={config.animationMood}
            onApplyMood={handleApplyMood}
            onToggleEffect={handleToggleEffect}
            onToggleAnimation={handleToggleAnimation}
            themeColor={config.themeColor}
          />
        </div>

        {/* ================= RIGHT COLUMN: STICKY SMARTPHONE SIMULATOR (5/12 ~ 35%) ================= */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-1.5 text-xs font-manrope font-bold text-hk-charcoal">
              <Smartphone className="h-4 w-4 text-hk-taupe" />
              <span>Live Sticky Smartphone Simulator</span>
            </div>
            {/* Quick Open/Close Gatekeeper Toggle */}
            <button
              onClick={() => updateConfig({ isGatekeeperOpened: !config.isGatekeeperOpened })}
              className="text-[10px] font-manrope font-semibold text-hk-taupe hover:underline"
            >
              {config.isGatekeeperOpened ? '↺ Tutup Amplop' : '✦ Buka Undangan'}
            </button>
          </div>

          <DeviceFrameContainer
            activeFrame={config.activeFrame}
            onChangeFrame={(f) => updateConfig({ activeFrame: f })}
          >
            <InvitationDevicePreview
              config={config}
              onUpdateConfig={updateConfig}
            />
          </DeviceFrameContainer>
        </div>
      </div>

      {/* Asset Swap Modal */}
      {activeSlotModal && (
        <StudioSlotAssetModal
          slot={activeSlotModal}
          activeAssetId={(config.slotAssets as any)[activeSlotModal] || ''}
          placementStyle={config.placementStyle}
          themeColor={config.themeColor}
          onSelectAsset={(filePath) => {
            updateConfig({
              slotAssets: {
                ...config.slotAssets,
                [activeSlotModal]: filePath,
              },
            });
          }}
          onClose={() => setActiveSlotModal(null)}
        />
      )}
    </section>
  );
}
