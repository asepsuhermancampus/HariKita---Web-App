"use client";

import React, { useState, useEffect } from "react";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { CoverCardEngine } from "@/components/invitation/cover/CoverCardEngine";
import {
  InvitationDesktopLayout,
  InvitationBottomDock,
  RotatingVinylPlayer,
  ETicketBoardingPass,
  SmoothOutroClosingGate,
} from "@/components/invitation/shell";

// 8 Bespoke Layout Engines
import {
  BotanicalEngine,
  JavaneseEngine,
  IslamicEngine,
  MinimalistEngine,
  RoseGoldEngine,
  RusticEngine,
  CelestialEngine,
  CuteIllustratedEngine,
} from "./engines";

// Dedicated Atomic Templates
import { AutumnelleTemplate } from "./themes/autumnelle";
import { TulivelleTemplate } from "./themes/tulivelle";

export const TemplateEngineResolver: React.FC<DedicatedTemplateProps> = (props) => {
  const [isCoverOpened, setIsCoverOpened] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  // Ensure SFX audio is always enabled by default per user specification
  useEffect(() => {
    soundscape.setMuted(false);
  }, []);

  // Scroll-lock: prevent background content scrolling while cover is visible.
  // IMPORTANT: We only lock overflow — we do NOT set touchAction:none because
  // that would prevent touch events from reaching the fixed-position cover card.
  React.useEffect(() => {
    if (!isCoverOpened) {
      const originalDocOverflow = document.documentElement.style.overflow;
      const originalBodyOverflow = document.body.style.overflow;

      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";

      return () => {
        document.documentElement.style.overflow = originalDocOverflow;
        document.body.style.overflow = originalBodyOverflow;
      };
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
  }, [isCoverOpened]);

  const archetypeId = props.theme?.archetypeId || "botanical";
  const themeId = props.theme?.id;

  const handleOpenCover = () => {
    setIsCoverOpened(true);
    setIsMusicPlaying(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  };

  const handleCloseCover = () => {
    setIsCoverOpened(false);
    setIsMusicPlaying(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  };

  const renderEngine = () => {
    // 1. Dedicated Decoupled Atomic Templates
    switch (themeId) {
      case "autumnelle":
        return <AutumnelleTemplate {...props} />;
      case "tulivelle":
        return <TulivelleTemplate {...props} />;
    }

    // 2. Archetype Engine Fallback for remaining templates
    switch (archetypeId) {
      case "botanical":
      case "romantic-floral":
      case "animated-motion":
        return <BotanicalEngine {...props} />;

      case "javanese":
      case "cultural-traditional":
        return <JavaneseEngine {...props} />;

      case "islamic":
      case "syari-islamic":
        return <IslamicEngine {...props} />;

      case "minimalist":
      case "minimalist-typographic":
        return <MinimalistEngine {...props} />;

      case "rose-gold":
      case "royal-luxury":
        return <RoseGoldEngine {...props} />;

      case "rustic":
        return <RusticEngine {...props} />;

      case "celestial":
      case "fullscreen-prewed":
        return <CelestialEngine {...props} />;

      case "cute-illustrated":
      case "special-family-event":
        return <CuteIllustratedEngine {...props} />;

      default:
        return <BotanicalEngine {...props} />;
    }
  };

  const activeSession = props.sessions[props.activeSessionCode] || props.sessions.s1;

  return (
    <>
      {/* 1. Unique Cover Gate — per-template unique layout via CoverCardEngine */}
      <CoverCardEngine
        theme={props.theme}
        brideName={props.bride.name}
        groomName={props.groom.name}
        guestName={props.guestName}
        eventDate={props.eventDate}
        isOpened={isCoverOpened}
        onOpen={handleOpenCover}
      />

      {/* 2. Desktop Dual-Pane & Mobile Showcase Layout */}
      <InvitationDesktopLayout
        brideName={props.bride.name}
        groomName={props.groom.name}
        eventDate={props.eventDate}
        coverPhoto={props.bride.photo}
        venueName={activeSession.venueName}
        isCoverOpened={isCoverOpened}
        entryAnimId={props.theme?.coverConfig?.entryAnimId || "rise-up"}
      >
        {/* Render the Bespoke Archetype Layout Engine */}
        {renderEngine()}

        {/* Grand Outro Smooth Closing Gate */}
        <SmoothOutroClosingGate
          theme={props.theme}
          brideName={props.bride.name}
          groomName={props.groom.name}
          onCloseInvitation={handleCloseCover}
        />

        {/* 3. Floating Peripherals (Rendered when cover is open) */}
        {isCoverOpened && (
          <>
            {/* Spinning Vinyl Audio Player */}
            <RotatingVinylPlayer
              audioUrl={props.musicUrl}
              isPlaying={isMusicPlaying}
              onTogglePlay={() => setIsMusicPlaying(!isMusicPlaying)}
              albumCoverUrl={props.bride.photo}
              songTitle={`${props.bride.name} & ${props.groom.name} Nuptial`}
            />

            {/* E-Ticket Boarding Pass Trigger & Modal */}
            <ETicketBoardingPass
              guestName={props.guestName}
              sessionTitle={activeSession.title}
              timeSlot={activeSession.timeSlot}
              venueName={activeSession.venueName}
              venueAddress={activeSession.venueAddress}
              qrValue={`HK-${(props.invitationId || "demo00").substring(0, 6).toUpperCase()}-${(props.activeSessionCode || "s1").toUpperCase()}`}
              brideGroomInitials={`${props.bride.name.charAt(0)} & ${props.groom.name.charAt(0)}`}
              isOpen={isTicketOpen}
              onClose={() => setIsTicketOpen(false)}
            />

            {/* Floating Glass Bottom Dock with Scroll-Spy */}
            <InvitationBottomDock isVisible={true} />
          </>
        )}
      </InvitationDesktopLayout>
    </>
  );
};
