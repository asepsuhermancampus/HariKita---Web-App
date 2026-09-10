"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { FloatingPetalsCanvas } from "@/components/invitation/canvas/FloatingPetalsCanvas";
import { EucalyptusCorner } from "@/components/invitation/svg/autumnelle";
import { AutumnelleHero } from "./sections/AutumnelleHero";
import { AutumnelleCouple } from "./sections/AutumnelleCouple";
import { AutumnelleSchedule } from "./sections/AutumnelleSchedule";
import { AutumnelleStories } from "./sections/AutumnelleStories";
import { AutumnelleGallery } from "./sections/AutumnelleGallery";
import {
  GiftSectionDispatcher,
  GuestbookSectionDispatcher,
  ClosingSectionDispatcher,
} from "@/components/invitation/sections";

export const AutumnelleTemplate: React.FC<DedicatedTemplateProps> = (props) => {
  const { theme, bride, groom, sessions, activeSessionCode, googleMapsUrl, storyTimeline, galleryPhotos, giftInfo, initialWishes } = props;
  const [selectedSession] = useState<"s1" | "s2" | "s3">(activeSessionCode || "s1");
  const activeSession = sessions[selectedSession] || sessions.s1;
  const primaryColor = theme.colors.primary || "#5C6F57";

  return (
    <div
      className="relative w-full min-h-screen font-serif overflow-x-hidden selection:bg-emerald-200"
      style={{ backgroundColor: theme.colors.background || "#FAF7F5", color: theme.colors.text || "#261F23" }}
    >
      {/* Signature Floating Autumn Petals Canvas */}
      <FloatingPetalsCanvas className="opacity-55 z-10" />

      {/* Decorative Autumnelle Eucalyptus Corner Flourishes */}
      <EucalyptusCorner size={85} color={primaryColor} className="absolute top-0 left-0 pointer-events-none z-20 opacity-40" />
      <EucalyptusCorner size={85} color={primaryColor} className="absolute top-0 right-0 pointer-events-none z-20 opacity-40 -scale-x-100" />

      {/* Atomic Sections */}
      <AutumnelleHero
        bride={bride}
        groom={groom}
        activeSession={activeSession}
        theme={theme}
        couplePhoto={props.couplePhoto}
      />
      <AutumnelleCouple bride={bride} groom={groom} theme={theme} />
      <AutumnelleSchedule sessions={sessions} googleMapsUrl={googleMapsUrl} theme={theme} />
      <AutumnelleStories storyTimeline={storyTimeline} theme={theme} />
      <AutumnelleGallery galleryPhotos={galleryPhotos} theme={theme} />

      {/* Shared Standard Functional Sections */}
      <GiftSectionDispatcher giftInfo={giftInfo} theme={theme} />
      <GuestbookSectionDispatcher
        invitationId={theme?.id}
        defaultGuestName={props.guestName}
        activeSessionCode={selectedSession}
        initialWishes={initialWishes}
        theme={theme}
      />
      <ClosingSectionDispatcher brideName={bride.name} groomName={groom.name} theme={theme} />
    </div>
  );
};
