'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { InvitationStudioConfig, SectionOrderItem } from '@/types/invitation-studio';
import { SANDBOX_VENUE_LOCATION_DATA } from '@/app/design-system-showcase/data/mock-invitation-sandbox';
import { VisualEffectsLayer } from './VisualEffectsLayer';
import { Studio3DEnvelopeFlap } from './sections/Studio3DEnvelopeFlap';
import { StudioMuqaddimah } from './sections/StudioMuqaddimah';
import { StudioCoupleSection } from './sections/StudioCoupleSection';
import { StudioLoveStory } from './sections/StudioLoveStory';
import { StudioEventSchedule } from './sections/StudioEventSchedule';
import { StudioLocationCard } from './sections/StudioLocationCard';
import { StudioGallerySection } from './sections/StudioGallerySection';
import { StudioBankGiftSection } from './sections/StudioBankGiftSection';
import { StudioGuestbookRsvp } from './sections/StudioGuestbookRsvp';
import { StudioDresscodeEtiquette } from './sections/StudioDresscodeEtiquette';
import { StudioClosingFamily } from './sections/StudioClosingFamily';
import { sanitizeUrl } from '@/lib/url-delta-codec';
import { DynamicTintIcon } from './DynamicTintIcon';
import { resolveAssetUrl } from './asset-resolver';

const DEFAULT_SECTIONS: SectionOrderItem[] = [
  { id: 'muqaddimah', label: 'Muqaddimah', enabled: true, order: 1 },
  { id: 'couple', label: 'Mempelai', enabled: true, order: 2 },
  { id: 'story', label: 'Love Story', enabled: true, order: 3 },
  { id: 'schedule', label: 'Jadwal Acara', enabled: true, order: 4 },
  { id: 'location', label: 'Lokasi & Maps', enabled: true, order: 5 },
  { id: 'gallery', label: 'Galeri Foto', enabled: true, order: 6 },
  { id: 'gift', label: 'Tanda Kasih', enabled: true, order: 7 },
  { id: 'rsvp', label: 'RSVP & Ucapan', enabled: true, order: 8 },
  { id: 'dresscode', label: 'Dresscode', enabled: true, order: 9 },
  { id: 'closing', label: 'Penutup', enabled: true, order: 10 },
];

interface InvitationDevicePreviewProps {
  config: InvitationStudioConfig;
  onUpdateConfig: (updater: Partial<InvitationStudioConfig>) => void;
  onSelectSection?: (sectionId: string) => void;
}

export function InvitationDevicePreview({
  config,
  onUpdateConfig,
  onSelectSection,
}: InvitationDevicePreviewProps) {
  const {
    isGatekeeperOpened,
    themeColor,
    coupleVariant,
    placementStyle = 'royal-symmetrical',
    galleryVariant,
    activeEffects,
    activeAnimations,
    content,
    audioUrl,
  } = config;

  const [isMusicActive, setIsMusicActive] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Active section array sorted by order
  const activeSections = React.useMemo(() => {
    const list = config.sections && config.sections.length > 0 ? config.sections : DEFAULT_SECTIONS;
    return [...list]
      .filter((s) => s.enabled !== false)
      .sort((a, b) => a.order - b.order);
  }, [config.sections]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleToggleMusic = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const safeAudio = sanitizeUrl(audioUrl);
    if (!safeAudio) {
      setIsMusicActive((prev) => !prev);
      return;
    }

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(safeAudio);
        audioRef.current.loop = true;
      }

      if (isMusicActive) {
        audioRef.current.pause();
        setIsMusicActive(false);
      } else {
        audioRef.current.play().then(() => {
          setIsMusicActive(true);
        }).catch(console.warn);
      }
    } catch {
      setIsMusicActive((prev) => !prev);
    }
  };

  const renderSectionItem = (sectionId: string) => {
    switch (sectionId) {
      case 'muqaddimah':
        return <StudioMuqaddimah themeColor={themeColor} />;
      case 'couple':
        return (
          <StudioCoupleSection
            variant={coupleVariant}
            themeColor={themeColor}
            ornamentId={config.slotAssets.coupleSurround}
            content={content}
          />
        );
      case 'story':
        return <StudioLoveStory themeColor={themeColor} />;
      case 'schedule':
        return <StudioEventSchedule themeColor={themeColor} />;
      case 'location':
        return (
          <StudioLocationCard
            venue={{
              ...SANDBOX_VENUE_LOCATION_DATA,
              venueName: content?.venueName || SANDBOX_VENUE_LOCATION_DATA.venueName,
              address: content?.venueAddress || SANDBOX_VENUE_LOCATION_DATA.address,
              googleMapsUrl: sanitizeUrl(content?.locationMapsUrl) || SANDBOX_VENUE_LOCATION_DATA.googleMapsUrl,
            }}
            themeColor={themeColor}
            ornamentId={config.slotAssets.iconMarker}
          />
        );
      case 'gallery':
        return (
          <StudioGallerySection
            galleryVariant={galleryVariant}
            themeColor={themeColor}
          />
        );
      case 'gift':
        return (
          <StudioBankGiftSection
            themeColor={themeColor}
            ornamentId={config.slotAssets.iconMarker}
          />
        );
      case 'rsvp':
        return <StudioGuestbookRsvp themeColor={themeColor} />;
      case 'dresscode':
        return <StudioDresscodeEtiquette themeColor={themeColor} />;
      case 'closing':
        return (
          <StudioClosingFamily
            themeColor={themeColor}
            onCloseInvitation={() => onUpdateConfig({ isGatekeeperOpened: false })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <VisualEffectsLayer
      activeEffects={activeEffects}
      activeAnimations={activeAnimations}
      themeColor={themeColor}
      className="h-full w-full bg-[#FAF8F5]"
    >
      {/* 1. GATEKEEPER / 3D ENVELOPE COVER (BEFORE OPEN) */}
      {!isGatekeeperOpened ? (
        <Studio3DEnvelopeFlap
          themeColor={themeColor}
          groomName={content?.groomName || 'Aditya'}
          brideName={content?.brideName || 'Ratna'}
          weddingDate={content?.weddingDate || '24 . 10 . 2026'}
          audioUrl={audioUrl}
          isOpened={isGatekeeperOpened}
          onOpen={() => {
            onUpdateConfig({ isGatekeeperOpened: true });
            if (audioUrl) setIsMusicActive(true);
          }}
          onToggleMusic={setIsMusicActive}
        />
      ) : (
        /* 2. OPENED INVITATION STREAM (DYNAMICALLY ORDERED SECTIONS) */
        <div id="inv-section-stream" className="space-y-4 pb-6 animate-in fade-in duration-300 relative min-h-full">
          
          {/* ================= LAYER 0: CORNER ANCHORS & PLACEMENT ACCENTS (z-0, pointer-events-none) ================= */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
            {/* 4 Corners (Zona 1: Sudut Bingkai) */}
            <div className="absolute top-1.5 left-1.5 opacity-70">
              <DynamicTintIcon
                src={resolveAssetUrl(config.slotAssets.corner || 'assets/harikita/corners/corner-01.svg')}
                color={themeColor}
                size={placementStyle === 'corner-baroque' ? 44 : 32}
                alt="Corner TL"
              />
            </div>
            <div className="absolute top-1.5 right-1.5 opacity-70 transform -scale-x-100">
              <DynamicTintIcon
                src={resolveAssetUrl(config.slotAssets.corner || 'assets/harikita/corners/corner-01.svg')}
                color={themeColor}
                size={placementStyle === 'corner-baroque' ? 44 : 32}
                alt="Corner TR"
              />
            </div>
            <div className="absolute bottom-1.5 left-1.5 opacity-70 transform -scale-y-100">
              <DynamicTintIcon
                src={resolveAssetUrl(config.slotAssets.corner || 'assets/harikita/corners/corner-01.svg')}
                color={themeColor}
                size={placementStyle === 'corner-baroque' ? 44 : 32}
                alt="Corner BL"
              />
            </div>
            <div className="absolute bottom-1.5 right-1.5 opacity-70 transform -scale-x-100 -scale-y-100">
              <DynamicTintIcon
                src={resolveAssetUrl(config.slotAssets.corner || 'assets/harikita/corners/corner-01.svg')}
                color={themeColor}
                size={placementStyle === 'corner-baroque' ? 44 : 32}
                alt="Corner BR"
              />
            </div>

            {/* Placement-Specific Curated Overlays */}
            {placementStyle === 'botanical-hug' && (
              <>
                <div className="absolute top-36 -left-3 opacity-35">
                  <DynamicTintIcon
                    src={resolveAssetUrl(config.slotAssets.coupleSurround || 'assets/harikita/leaves/branches/branch-02.svg')}
                    color={themeColor}
                    size={64}
                    alt="Botanical Hug Left"
                  />
                </div>
                <div className="absolute top-72 -right-3 opacity-35 transform -scale-x-100">
                  <DynamicTintIcon
                    src={resolveAssetUrl(config.slotAssets.coupleSurround || 'assets/harikita/leaves/branches/branch-02.svg')}
                    color={themeColor}
                    size={64}
                    alt="Botanical Hug Right"
                  />
                </div>
              </>
            )}

            {placementStyle === 'asymmetric-editorial' && (
              <div className="absolute top-20 left-1 opacity-25 flex flex-col items-center gap-14">
                <div className="w-0.5 h-36 bg-hk-charcoal/30" />
                <DynamicTintIcon
                  src={resolveAssetUrl('assets/harikita/abstract/symbol-01.svg')}
                  color={themeColor}
                  size={20}
                  alt="Editorial Glyph"
                />
              </div>
            )}

            {placementStyle === 'celestial-flow' && (
              <>
                <div className="absolute top-16 left-3 opacity-30 animate-pulse">
                  <DynamicTintIcon
                    src={resolveAssetUrl('assets/harikita/abstract/symbol-05.svg')}
                    color={themeColor}
                    size={28}
                    alt="Celestial Starburst"
                  />
                </div>
                <div className="absolute top-80 right-2 opacity-30 animate-pulse">
                  <DynamicTintIcon
                    src={resolveAssetUrl('assets/harikita/abstract/symbol-06.svg')}
                    color={themeColor}
                    size={24}
                    alt="Celestial Orbit"
                  />
                </div>
              </>
            )}

            {placementStyle === 'heritage-gunungan' && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 opacity-15">
                <DynamicTintIcon
                  src={resolveAssetUrl('assets/harikita/ornaments/ornament-03.svg')}
                  color="#5A3825"
                  size={88}
                  alt="Gunungan Watermark"
                />
              </div>
            )}

            {placementStyle === 'postage-ribbon' && (
              <div className="absolute top-0 right-3 w-5 h-24 bg-gradient-to-b from-amber-700/80 to-amber-600/30 shadow-xs border-x border-dashed border-amber-900/30 flex items-center justify-center pt-2">
                <span className="font-editorial text-[8px] text-white rotate-90 whitespace-nowrap tracking-widest font-bold">
                  POSTAGE
                </span>
              </div>
            )}
          </div>

          {/* ================= LAYER 10: STREAM CONTENT WITH MONOGRAM, DIVIDERS & TAILPIECE ================= */}
          
          {/* Layer 10.1: Apex Monogram Crest (Zona 2: Lencana Monogram) */}
          <div className="flex flex-col items-center justify-center pt-4 pb-1 text-center relative z-10">
            <div className="relative p-1.5 rounded-full border border-hk-champagne/40 bg-white/70 shadow-2xs">
              <DynamicTintIcon
                src={resolveAssetUrl(config.slotAssets.monogram || 'assets/harikita/ornaments/ornament-01.svg')}
                color={themeColor}
                size={40}
                alt="Monogram Crest"
                className="opacity-90"
              />
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="h-px w-4 bg-hk-champagne/60" />
              <span className="font-editorial text-[10px] italic tracking-widest text-hk-taupe uppercase">
                {placementStyle === 'heritage-gunungan'
                  ? 'Serat Palakrama'
                  : placementStyle === 'mihrab-syari'
                  ? 'Baitul Sakinah'
                  : placementStyle === 'royal-symmetrical'
                  ? 'Royal Union'
                  : placementStyle === 'asymmetric-editorial'
                  ? 'The Monograph'
                  : 'The Sacred Vow'}
              </span>
              <span className="h-px w-4 bg-hk-champagne/60" />
            </div>
          </div>

          {/* Layer 10.2: Section Nodes with Inter-section Vector Dividers */}
          {activeSections.map((sec, idx) => (
            <React.Fragment key={sec.id}>
              {/* Inter-section Vector Divider (Zona 3: Garis Pembatas) */}
              {idx > 0 && (
                <div className="flex items-center justify-center py-1.5 px-4 pointer-events-none relative z-10">
                  <DynamicTintIcon
                    src={resolveAssetUrl(config.slotAssets.divider || 'assets/harikita/lines/line-01.svg')}
                    color={themeColor}
                    width="70%"
                    height="18px"
                    className="opacity-65 object-contain"
                    alt="Section Divider"
                  />
                </div>
              )}

              <div
                id={`inv-section-${sec.id}`}
                className="group relative transition-all z-10"
              >
                {/* Hotspot Floating Pin / Edit Quick-Jump */}
                <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => onSelectSection?.(sec.id)}
                    className="flex items-center gap-1 rounded-full bg-hk-charcoal/90 hover:bg-hk-taupe text-white px-2.5 py-1 text-[9px] font-manrope font-bold shadow-md backdrop-blur-xs transition-colors"
                  >
                    <span>✎ Edit {sec.label}</span>
                  </button>
                </div>

                {/* Render Section Content */}
                {renderSectionItem(sec.id)}
              </div>
            </React.Fragment>
          ))}

          {/* Layer 10.3: Ornamen Penutup (Zona 6: Tailpiece) */}
          <div className="flex flex-col items-center justify-center pt-3 pb-4 text-center pointer-events-none relative z-10">
            <DynamicTintIcon
              src={resolveAssetUrl(config.slotAssets.tailpiece || 'assets/harikita/ornaments/ornament-02.svg')}
              color={themeColor}
              size={36}
              alt="Closing Tailpiece"
              className="opacity-75"
            />
            <div className="mt-1 flex items-center gap-2 text-[9px] font-mono text-hk-taupe">
              <span className="h-px w-5 bg-hk-champagne/60" />
              <span className="capitalize">{placementStyle.replace('-', ' ')}</span>
              <span className="h-px w-5 bg-hk-champagne/60" />
            </div>
          </div>

          {/* ================= LAYER 20: FLOATING AUDIO CONTROLLER (WCAG SC 1.4.2) ================= */}
          <div className="sticky bottom-3 right-3 z-40 flex justify-end px-3 pointer-events-none">
            <button
              type="button"
              onClick={handleToggleMusic}
              title={isMusicActive ? 'Bisukan Musik' : 'Putar Musik'}
              className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-white/95 border border-hk-champagne/70 px-3 py-1.5 text-[10px] font-manrope font-semibold text-hk-charcoal shadow-md backdrop-blur-xs hover:border-hk-taupe transition-all active:scale-95"
            >
              {isMusicActive ? (
                <>
                  <Volume2 className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                  <span>Musik Aktif</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-3.5 w-3.5 text-hk-taupe" />
                  <span>Musik Hening</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}
    </VisualEffectsLayer>
  );
}

