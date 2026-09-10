"use client";

import React from "react";
import { DedicatedTemplateProps, GiftStyleId } from "@/lib/templates/types";
import { Gift_EmbossedCards } from "./Gift_EmbossedCards";
import { Gift_AngpaoEnvelope } from "./Gift_AngpaoEnvelope";
import { Gift_CleanPills } from "./Gift_CleanPills";

export const GiftSectionDispatcher: React.FC<{
  giftInfo: DedicatedTemplateProps["giftInfo"];
  theme: DedicatedTemplateProps["theme"];
}> = ({ giftInfo, theme }) => {
  let style: GiftStyleId = theme?.sectionConfig?.giftStyle || "embossed-cards";

  if (!theme?.sectionConfig?.giftStyle) {
    const arch = theme?.archetypeId || "botanical";
    if (arch.includes("cute") || arch.includes("family")) {
      style = "angpao-envelope";
    } else if (arch.includes("minimalist")) {
      style = "clean-pills";
    } else {
      style = "embossed-cards";
    }
  }

  switch (style) {
    case "angpao-envelope":
      return <Gift_AngpaoEnvelope giftInfo={giftInfo} themePrimary={theme?.colors?.primary} />;
    case "clean-pills":
      return <Gift_CleanPills giftInfo={giftInfo} themePrimary={theme?.colors?.primary} />;
    case "embossed-cards":
    default:
      return <Gift_EmbossedCards giftInfo={giftInfo} themePrimary={theme?.colors?.primary} />;
  }
};
