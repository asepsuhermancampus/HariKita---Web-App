"use client";

import React, { useState, useEffect } from "react";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { CoverCardEngine } from "@/components/invitation/cover/CoverCardEngine";
import {
  InvitationDesktopLayout,
  InvitationBottomDock,
  RotatingVinylPlayer,
  AutoScrollButton,
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

export const TemplateEngineResolver: React.FC<DedicatedTemplateProps> = (props) => {
  const [isCoverOpened, setIsCoverOpened] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [sfxMuted, setSfxMuted] = useState(() => soundscape.isMuted());

  // Sync sfxMuted state with the singleton
  useEffect(() => {
    const unsub = soundscape.subscribe((muted) => setSfxMuted(muted));
    return unsub;
  }, []);

  const handleToggleSfx = () => {
    const nowMuted = soundscape.toggleMute();
    if (!nowMuted) soundscape.playTick(); // confirm sound when unmuting
  };

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

  const handleOpenCover = () => {
    setIsCoverOpened(true);
    setIsMusicPlaying(true);
  };

  const renderEngine = () => {
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

            {/* Hands-Free Auto Scroll Button */}
            <AutoScrollButton
              isAutoScrolling={isAutoScrolling}
              onToggleAutoScroll={() => setIsAutoScrolling(!isAutoScrolling)}
              isVisible={true}
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

            {/* SFX Mute Toggle — floating pill above bottom dock */}
            <button
              id="sfx-toggle-btn"
              aria-label={sfxMuted ? "Aktifkan suara efek" : "Matikan suara efek"}
              onClick={handleToggleSfx}
              style={{
                position: "fixed",
                bottom: "84px",
                right: "16px",
                zIndex: 9997,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(15,23,42,0.72)",
                backdropFilter: "blur(12px)",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                transition: "opacity 0.2s",
              }}
            >
              <span style={{ fontSize: "16px" }}>{sfxMuted ? "🔇" : "🔊"}</span>
              <span>{sfxMuted ? "SFX Off" : "SFX On"}</span>
            </button>

            {/* Floating Glass Bottom Dock with Scroll-Spy */}
            <InvitationBottomDock isVisible={true} />
          </>
        )}
      </InvitationDesktopLayout>
    </>
  );
};
