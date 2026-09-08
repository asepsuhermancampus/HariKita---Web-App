"use client";

import React from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { AutumnelleAnimatedTemplate } from "./AutumnelleAnimatedTemplate";
import { SeraphicusMinimalistTemplate } from "./SeraphicusMinimalistTemplate";
import { LunarMelodyPrewedTemplate } from "./LunarMelodyPrewedTemplate";
import { FloralSerenityTemplate } from "./FloralSerenityTemplate";
import { SyariIslamicTemplate } from "./SyariIslamicTemplate";
import { JavaneseRoyalTemplate } from "./JavaneseRoyalTemplate";
import { RoseGoldLuxuryTemplate } from "./RoseGoldLuxuryTemplate";
import { KhitananFamilyTemplate } from "./KhitananFamilyTemplate";

export const TemplateEngineResolver: React.FC<DedicatedTemplateProps> = (props) => {
  const archetypeId = props.theme?.archetypeId;

  switch (archetypeId) {
    case "animated-motion":
      return <AutumnelleAnimatedTemplate {...props} />;
    case "minimalist-typographic":
      return <SeraphicusMinimalistTemplate {...props} />;
    case "fullscreen-prewed":
      return <LunarMelodyPrewedTemplate {...props} />;
    case "romantic-floral":
      return <FloralSerenityTemplate {...props} />;
    case "syari-islamic":
      return <SyariIslamicTemplate {...props} />;
    case "cultural-traditional":
      return <JavaneseRoyalTemplate {...props} />;
    case "royal-luxury":
      return <RoseGoldLuxuryTemplate {...props} />;
    case "special-family-event":
      return <KhitananFamilyTemplate {...props} />;
    default:
      return <AutumnelleAnimatedTemplate {...props} />;
  }
};
