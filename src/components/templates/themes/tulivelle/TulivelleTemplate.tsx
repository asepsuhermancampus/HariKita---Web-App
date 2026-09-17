"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { FloatingPetalsCanvas } from "@/components/invitation/canvas/FloatingPetalsCanvas";
import { TulipCluster } from "@/components/invitation/svg/tulivelle";
import { TulivelleHero } from "./sections/TulivelleHero";
import { TulivelleCouple } from "./sections/TulivelleCouple";
import { TulivelleSchedule } from "./sections/TulivelleSchedule";
import { TulivelleStories } from "./sections/TulivelleStories";
import { TulivelleGallery } from "./sections/TulivelleGallery";
import {
  GiftSectionDispatcher,
  GuestbookSectionDispatcher,
  ClosingSectionDispatcher,
} from "@/components/invitation/sections";

export const TulivelleTemplate: React.FC<DedicatedTemplateProps> = (props) => {
  const { theme, bride, groom, sessions, activeSessionCode, googleMapsUrl, storyTimeline, galleryPhotos, giftInfo, initialWishes } = props;
  const [selectedSession] = useState<"s1" | "s2" | "s3">(activeSessionCode || "s1");
  const activeSession = sessions[selectedSession] || sessions.s1;
  const primaryColor = theme.colors.primary || "#7A8C74";
  const accentColor = theme.colors.accent || "#D48B72";

  return (
    <div
      className="relative w-full min-h-screen font-serif overflow-x-hidden selection:bg-rose-200"
      style={{ backgroundColor: theme.colors.background || "#FCFAF8", color: theme.colors.text || "#2B2428" }}
    >
      {/* Signature Floating Blossom Petals Canvas */}
      <FloatingPetalsCanvas className="opacity-60 z-10" />

      {/* Decorative Tulivelle Cluster Corner Flourishes */}
      <TulipCluster size={80} color={primaryColor} secondaryColor={accentColor} className="absolute top-0 left-0 pointer-events-none z-20 opacity-40" />
      <TulipCluster size={80} color={primaryColor} secondaryColor={accentColor} className="absolute top-0 right-0 pointer-events-none z-20 opacity-40 -scale-x-100" />

      {/* Atomic Sections */}
      <TulivelleHero
        bride={bride}
        groom={groom}
        activeSession={activeSession}
        theme={theme}
        couplePhoto={props.couplePhoto}
      />
      <TulivelleCouple bride={bride} groom={groom} theme={theme} />
      <TulivelleSchedule sessions={sessions} googleMapsUrl={googleMapsUrl} theme={theme} />
      <TulivelleStories storyTimeline={storyTimeline} theme={theme} />
      <TulivelleGallery galleryPhotos={galleryPhotos} theme={theme} />

      {/* Shared Standard Functional Sections */}
      <GiftSectionDispatcher giftInfo={giftInfo} theme={theme} />
      <GuestbookSectionDispatcher
        invitationId={theme?.id}
        defaultGuestName={props.guestName}
        activeSessionCode={selectedSession}
        initialWishes={initialWishes}
        theme={theme}
      />
      <ClosingSectionDispatcher
        brideName={bride.name}
        groomName={groom.name}
        theme={theme}
        onCloseInvitation={props.onCloseInvitation}
      />
    </div>
  );
};
