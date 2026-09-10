"use client";

import React from "react";
import { DedicatedTemplateProps, ClosingStyleId } from "@/lib/templates/types";
import { Closing_WaxSealSignature } from "./Closing_WaxSealSignature";
import { Closing_PoeticPhotoOutro } from "./Closing_PoeticPhotoOutro";
import { Closing_CuteWavingOutro } from "./Closing_CuteWavingOutro";

export const ClosingSectionDispatcher: React.FC<{
  brideName: string;
  groomName: string;
  theme: DedicatedTemplateProps["theme"];
  onCloseInvitation?: () => void;
}> = ({ brideName, groomName, theme, onCloseInvitation }) => {
  let style: ClosingStyleId = theme?.sectionConfig?.closingStyle || "wax-seal-signature";

  if (!theme?.sectionConfig?.closingStyle) {
    const arch = theme?.archetypeId || "botanical";
    if (arch.includes("cute") || arch.includes("family")) {
      style = "cute-waving-outro";
    } else if (arch.includes("celestial") || arch.includes("prewed") || arch.includes("minimalist")) {
      style = "poetic-photo-outro";
    } else {
      style = "wax-seal-signature";
    }
  }

  switch (style) {
    case "cute-waving-outro":
      return <Closing_CuteWavingOutro brideName={brideName} groomName={groomName} theme={theme} onCloseInvitation={onCloseInvitation} />;
    case "poetic-photo-outro":
      return <Closing_PoeticPhotoOutro brideName={brideName} groomName={groomName} theme={theme} onCloseInvitation={onCloseInvitation} />;
    case "wax-seal-signature":
    default:
      return <Closing_WaxSealSignature brideName={brideName} groomName={groomName} theme={theme} onCloseInvitation={onCloseInvitation} />;
  }
};
