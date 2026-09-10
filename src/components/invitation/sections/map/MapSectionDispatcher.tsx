"use client";

import React from "react";
import { DedicatedTemplateProps, MapStyleId } from "@/lib/templates/types";
import { Map_InteractiveClean } from "./Map_InteractiveClean";
import { Map_IllustratedCute } from "./Map_IllustratedCute";
import { Map_MinimalistGuide } from "./Map_MinimalistGuide";

export const MapSectionDispatcher: React.FC<{
  venueName: string;
  venueAddress: string;
  googleMapsUrl: string;
  theme: DedicatedTemplateProps["theme"];
}> = ({ venueName, venueAddress, googleMapsUrl, theme }) => {
  let style: MapStyleId = theme?.sectionConfig?.mapStyle || "interactive-clean";

  if (!theme?.sectionConfig?.mapStyle) {
    const arch = theme?.archetypeId || "botanical";
    if (arch.includes("cute") || arch.includes("family") || arch.includes("animated")) {
      style = "illustrated-cute";
    } else if (arch.includes("minimalist")) {
      style = "minimalist-guide";
    } else {
      style = "interactive-clean";
    }
  }

  switch (style) {
    case "illustrated-cute":
      return (
        <Map_IllustratedCute
          venueName={venueName}
          venueAddress={venueAddress}
          googleMapsUrl={googleMapsUrl}
          themePrimary={theme?.colors?.primary}
        />
      );
    case "minimalist-guide":
      return (
        <Map_MinimalistGuide
          venueName={venueName}
          venueAddress={venueAddress}
          googleMapsUrl={googleMapsUrl}
          themePrimary={theme?.colors?.primary}
        />
      );
    case "interactive-clean":
    default:
      return (
        <Map_InteractiveClean
          venueName={venueName}
          venueAddress={venueAddress}
          googleMapsUrl={googleMapsUrl}
          themePrimary={theme?.colors?.primary}
        />
      );
  }
};
