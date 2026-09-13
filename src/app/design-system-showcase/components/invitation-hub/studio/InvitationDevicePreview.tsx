'use client';

import React from 'react';
import { InvitationStudioConfig } from '@/types/invitation-studio';
import { SANDBOX_VENUE_LOCATION_DATA } from '../../../../data/mock-invitation-sandbox';
import { VisualEffectsLayer } from './VisualEffectsLayer';
import { StudioGatekeeperCover } from './sections/StudioGatekeeperCover';
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

interface InvitationDevicePreviewProps {
  config: InvitationStudioConfig;
  onUpdateConfig: (updater: Partial<InvitationStudioConfig>) => void;
}

export function InvitationDevicePreview({
  config,
  onUpdateConfig,
}: InvitationDevicePreviewProps) {
  const { isGatekeeperOpened, themeColor, coupleVariant, galleryVariant, activeEffects, activeAnimations } =
    config;

  return (
    <VisualEffectsLayer
      activeEffects={activeEffects}
      activeAnimations={activeAnimations}
      themeColor={themeColor}
      className="h-full w-full bg-[#FAF8F5]"
    >
      {/* 1. GATEKEEPER / ENVELOPE COVER (BEFORE OPEN) */}
      {!isGatekeeperOpened ? (
        <StudioGatekeeperCover
          isOpened={isGatekeeperOpened}
          themeColor={themeColor}
          onOpen={() => onUpdateConfig({ isGatekeeperOpened: true })}
        />
      ) : (
        /* 2. OPENED INVITATION STREAM (SECTIONS 2 TO 11) */
        <div className="space-y-6 pb-2 animate-in fade-in duration-300">
          {/* Section 2: Muqaddimah & Salam Pembuka */}
          <StudioMuqaddimah themeColor={themeColor} />

          {/* Section 3: The Bride & The Groom (8 Variants) */}
          <StudioCoupleSection
            variant={coupleVariant}
            themeColor={themeColor}
            ornamentId={config.slotAssets.coupleSurround}
          />

          {/* Section 4: Love Story / Milestone Timeline */}
          <StudioLoveStory themeColor={themeColor} />

          {/* Section 5: Rangkaian Acara Akad & Resepsi */}
          <StudioEventSchedule themeColor={themeColor} />

          {/* Section 6: Smart Location & GPS QR Maps Navigation */}
          <StudioLocationCard
            venue={SANDBOX_VENUE_LOCATION_DATA}
            themeColor={themeColor}
            ornamentId={config.slotAssets.iconMarker}
          />

          {/* Section 7: Galeri Pre-wedding */}
          <StudioGallerySection
            galleryVariant={galleryVariant}
            themeColor={themeColor}
          />

          {/* Section 8: Tanda Kasih & Rekening Bank Murni */}
          <StudioBankGiftSection
            themeColor={themeColor}
            ornamentId={config.slotAssets.iconMarker}
          />

          {/* Section 9: RSVP & Buku Tamu */}
          <StudioGuestbookRsvp themeColor={themeColor} />

          {/* Section 10: Dress Code & Etiket Tamu */}
          <StudioDresscodeEtiquette themeColor={themeColor} />

          {/* Section 11: Penutup & Takzim Keluarga */}
          <StudioClosingFamily
            themeColor={themeColor}
            onCloseInvitation={() => onUpdateConfig({ isGatekeeperOpened: false })}
          />
        </div>
      )}
    </VisualEffectsLayer>
  );
}
