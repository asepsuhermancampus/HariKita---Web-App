"use client";

import React, { useEffect, useRef, useState } from "react";
import { CoverConfig, TemplateThemePreset } from "@/lib/templates/types";
import { CoverLayout_FloatingCard } from "./layouts/CoverLayout_FloatingCard";
import { CoverLayout_FullBleedText } from "./layouts/CoverLayout_FullBleedText";
import { CoverLayout_SplitPanel } from "./layouts/CoverLayout_SplitPanel";
import { CoverLayout_GateDoors } from "./layouts/CoverLayout_GateDoors";
import { CoverLayout_ScrollUnroll } from "./layouts/CoverLayout_ScrollUnroll";
import { CoverLayout_PostageStamp } from "./layouts/CoverLayout_PostageStamp";
import { CoverLayout_CircleMonogram } from "./layouts/CoverLayout_CircleMonogram";
import { CoverLayout_PolaroidPhoto } from "./layouts/CoverLayout_PolaroidPhoto";
import { CoverLayout_FloralWreath } from "./layouts/CoverLayout_FloralWreath";
import { CoverLayout_IslamicArch } from "./layouts/CoverLayout_IslamicArch";
import { CoverLayout_BookCover } from "./layouts/CoverLayout_BookCover";
import { CoverLayout_KawaiiCard } from "./layouts/CoverLayout_KawaiiCard";

export interface CoverCardEngineProps {
  theme: TemplateThemePreset;
  brideName: string;
  groomName: string;
  guestName: string;
  eventDate: string;
  isOpened: boolean;
  onOpen: () => void;
}

// Shared props for every layout component
export interface CoverLayoutProps {
  theme: TemplateThemePreset;
  brideName: string;
  groomName: string;
  guestName: string;
  formattedDate: string;
  exitClass: string;
  onOpenClick: () => void;
}

export const CoverCardEngine: React.FC<CoverCardEngineProps> = ({
  theme,
  brideName,
  groomName,
  guestName,
  eventDate,
  isOpened,
  onOpen,
}) => {
  const [shouldRender, setShouldRender] = useState(!isOpened);
  const [exitClass, setExitClass] = useState("");
  const [isExiting, setIsExiting] = useState(false);

  const formattedDate = new Date(eventDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Fallback for legacy presets that don't have coverConfig defined
  const coverConfig = theme.coverConfig ?? {
    layoutId: "FloatingCard" as const,
    exitAnimId: "slide-up" as const,
    entryAnimId: "rise-up" as const,
    bgVariant: "default",
  };

  useEffect(() => {
    if (!isOpened) {
      document.body.style.overflow = "hidden";
      setShouldRender(true);
      setExitClass("");
      setIsExiting(false);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpened]);

  const handleOpenClick = () => {
    if (isExiting) return;
    setIsExiting(true);
    const { exitAnimId } = coverConfig;
    setExitClass(EXIT_ANIM_CLASSES[exitAnimId] ?? "animate-cover-slide-up");
    setTimeout(() => {
      setShouldRender(false);
      onOpen();
    }, 850);
  };

  if (!shouldRender) return null;

  const { layoutId } = coverConfig;

  const sharedProps: CoverLayoutProps = {
    theme,
    brideName,
    groomName,
    guestName,
    formattedDate,
    exitClass,
    onOpenClick: handleOpenClick,
  };

  return (
    <>
      <style>{COVER_KEYFRAMES}</style>
      {layoutId === "FloatingCard" && <CoverLayout_FloatingCard {...sharedProps} />}
      {layoutId === "FullBleedText" && <CoverLayout_FullBleedText {...sharedProps} />}
      {layoutId === "SplitPanelHorizontal" && <CoverLayout_SplitPanel {...sharedProps} />}
      {layoutId === "GateDoors" && <CoverLayout_GateDoors {...sharedProps} />}
      {layoutId === "ScrollUnroll" && <CoverLayout_ScrollUnroll {...sharedProps} />}
      {layoutId === "PostageStamp" && <CoverLayout_PostageStamp {...sharedProps} />}
      {layoutId === "CircleMonogram" && <CoverLayout_CircleMonogram {...sharedProps} />}
      {layoutId === "PolaroidPhoto" && <CoverLayout_PolaroidPhoto {...sharedProps} />}
      {layoutId === "FloralWreath" && <CoverLayout_FloralWreath {...sharedProps} />}
      {layoutId === "IslamicArch" && <CoverLayout_IslamicArch {...sharedProps} />}
      {layoutId === "BookCover" && <CoverLayout_BookCover {...sharedProps} />}
      {layoutId === "KawaiiCard" && <CoverLayout_KawaiiCard {...sharedProps} />}
    </>
  );
};

// Exit animation class map
export const EXIT_ANIM_CLASSES: Record<string, string> = {
  "slide-up": "animate-cover-slide-up",
  "slide-down": "animate-cover-slide-down",
  "gate-open": "animate-cover-gate-open",
  "scroll-roll": "animate-cover-scroll-roll",
  "flip-3d": "animate-cover-flip-3d",
  "zoom-away": "animate-cover-zoom-away",
  "dissolve-particles": "animate-cover-dissolve",
  "curtain-reveal": "animate-cover-curtain",
  "page-turn": "animate-cover-page-turn",
  "fade-drop": "animate-cover-fade-drop",
};

// All CSS keyframes injected globally
export const COVER_KEYFRAMES = `
  @keyframes coverSlideUp {
    0%   { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-110vh); opacity: 0.6; }
  }
  @keyframes coverSlideDown {
    0%   { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(110vh); opacity: 0.6; }
  }
  @keyframes coverScrollRoll {
    0%   { transform: scaleY(1) translateY(0); opacity: 1; transform-origin: top center; }
    60%  { transform: scaleY(0.05) translateY(-50%); opacity: 0.5; transform-origin: top center; }
    100% { transform: scaleY(0) translateY(-110vh); opacity: 0; transform-origin: top center; }
  }
  @keyframes coverFlip3D {
    0%   { transform: perspective(1200px) rotateY(0deg); opacity: 1; }
    100% { transform: perspective(1200px) rotateY(-90deg); opacity: 0; }
  }
  @keyframes coverZoomAway {
    0%   { transform: scale(1); opacity: 1; }
    40%  { transform: scale(1.08); opacity: 1; }
    100% { transform: scale(2.5); opacity: 0; }
  }
  @keyframes coverDissolve {
    0%   { filter: blur(0px); opacity: 1; transform: scale(1); }
    50%  { filter: blur(6px); opacity: 0.5; transform: scale(1.04); }
    100% { filter: blur(20px); opacity: 0; transform: scale(1.12); }
  }
  @keyframes coverPageTurn {
    0%   { transform: perspective(1400px) rotateY(0deg); opacity: 1; transform-origin: left center; }
    100% { transform: perspective(1400px) rotateY(-110deg); opacity: 0; transform-origin: left center; }
  }
  @keyframes coverFadeDrop {
    0%   { transform: translateY(0); opacity: 1; }
    30%  { opacity: 0.8; }
    100% { transform: translateY(60px); opacity: 0; }
  }

  .animate-cover-slide-up   { animation: coverSlideUp 0.8s cubic-bezier(0.4,0,0.2,1) forwards; }
  .animate-cover-slide-down { animation: coverSlideDown 0.8s cubic-bezier(0.4,0,0.2,1) forwards; }
  .animate-cover-scroll-roll{ animation: coverScrollRoll 0.85s cubic-bezier(0.4,0,0.2,1) forwards; }
  .animate-cover-flip-3d    { animation: coverFlip3D 0.75s cubic-bezier(0.4,0,0.2,1) forwards; }
  .animate-cover-zoom-away  { animation: coverZoomAway 0.8s cubic-bezier(0.4,0,0.2,1) forwards; }
  .animate-cover-dissolve   { animation: coverDissolve 0.85s ease-out forwards; }
  .animate-cover-page-turn  { animation: coverPageTurn 0.85s cubic-bezier(0.4,0,0.2,1) forwards; }
  .animate-cover-fade-drop  { animation: coverFadeDrop 0.7s ease-out forwards; }

  /* Gate open & curtain handled in GateDoors and shared wrappers */
  .animate-cover-gate-open  { animation: coverFadeDrop 0.85s ease-out forwards; }
  .animate-cover-curtain    { animation: coverSlideUp 0.8s cubic-bezier(0.4,0,0.2,1) forwards; }
`;
