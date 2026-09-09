"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import {
  InvitationDesktopLayout,
  EnvelopeCoverGate,
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
      {/* 1. Universal Envelope Cover Gate (Locks scroll until opened) */}
      <EnvelopeCoverGate
        brideName={props.bride.name}
        groomName={props.groom.name}
        guestName={props.guestName}
        eventDate={props.eventDate}
        onOpen={handleOpenCover}
        isOpened={isCoverOpened}
        archetypeId={archetypeId}
      />

      {/* 2. Desktop Dual-Pane & Mobile Showcase Layout */}
      <InvitationDesktopLayout
        brideName={props.bride.name}
        groomName={props.groom.name}
        eventDate={props.eventDate}
        coverPhoto={props.bride.photo}
        venueName={activeSession.venueName}
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

            {/* Floating Glass Bottom Dock with Scroll-Spy */}
            <InvitationBottomDock isVisible={true} />
          </>
        )}
      </InvitationDesktopLayout>
    </>
  );
};
