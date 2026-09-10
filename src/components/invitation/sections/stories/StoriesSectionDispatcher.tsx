"use client";

import React from "react";
import { DedicatedTemplateProps, StoriesStyleId } from "@/lib/templates/types";
import { Stories_FilmstripScroll } from "./Stories_FilmstripScroll";
import { Stories_ChatJourney } from "./Stories_ChatJourney";
import { Stories_MilestoneCards } from "./Stories_MilestoneCards";
import { Stories_MagazineArticle } from "./Stories_MagazineArticle";

export const StoriesSectionDispatcher: React.FC<{
  stories: DedicatedTemplateProps["storyTimeline"];
  theme: DedicatedTemplateProps["theme"];
}> = ({ stories, theme }) => {
  let style: StoriesStyleId = theme?.sectionConfig?.storiesStyle || "milestone-cards";

  if (!theme?.sectionConfig?.storiesStyle) {
    const arch = theme?.archetypeId || "botanical";
    if (arch.includes("cute") || arch.includes("family") || arch.includes("animated")) {
      style = "chat-journey";
    } else if (arch.includes("minimalist")) {
      style = "magazine-article";
    } else if (arch.includes("celestial") || arch.includes("prewed") || arch.includes("royal")) {
      style = "filmstrip-scroll";
    } else {
      style = "milestone-cards";
    }
  }

  switch (style) {
    case "filmstrip-scroll":
      return <Stories_FilmstripScroll stories={stories} theme={theme} />;
    case "chat-journey":
      return <Stories_ChatJourney stories={stories} theme={theme} />;
    case "magazine-article":
      return <Stories_MagazineArticle stories={stories} theme={theme} />;
    case "milestone-cards":
    default:
      return <Stories_MilestoneCards stories={stories} theme={theme} />;
  }
};
