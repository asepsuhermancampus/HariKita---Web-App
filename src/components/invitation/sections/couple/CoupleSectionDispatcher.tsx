"use client";

import React from "react";
import { DedicatedTemplateProps, CoupleStyleId } from "@/lib/templates/types";
import { Couple_SplitDiagonal } from "./Couple_SplitDiagonal";
import { Couple_ArchClassic } from "./Couple_ArchClassic";
import { Couple_PolaroidSticker } from "./Couple_PolaroidSticker";
import { Couple_RoyalMedallion } from "./Couple_RoyalMedallion";

export const CoupleSectionDispatcher: React.FC<{
  bride: DedicatedTemplateProps["bride"];
  groom: DedicatedTemplateProps["groom"];
  theme: DedicatedTemplateProps["theme"];
}> = ({ bride, groom, theme }) => {
  // Determine style from sectionConfig or archetype fallback
  let style: CoupleStyleId = theme?.sectionConfig?.coupleStyle || "split-diagonal";

  if (!theme?.sectionConfig?.coupleStyle) {
    const arch = theme?.archetypeId || "botanical";
    if (arch.includes("islamic") || arch.includes("syari") || arch.includes("botanical")) {
      style = "arch-classic";
    } else if (arch.includes("javanese") || arch.includes("cultural") || arch.includes("royal") || arch.includes("rose-gold")) {
      style = "royal-medallion";
    } else if (arch.includes("cute") || arch.includes("family") || arch.includes("animated")) {
      style = "polaroid-sticker";
    } else {
      style = "split-diagonal";
    }
  }

  switch (style) {
    case "arch-classic":
      return <Couple_ArchClassic bride={bride} groom={groom} theme={theme} />;
    case "polaroid-sticker":
      return <Couple_PolaroidSticker bride={bride} groom={groom} theme={theme} />;
    case "royal-medallion":
      return <Couple_RoyalMedallion bride={bride} groom={groom} theme={theme} />;
    case "split-diagonal":
    default:
      return <Couple_SplitDiagonal bride={bride} groom={groom} theme={theme} />;
  }
};
