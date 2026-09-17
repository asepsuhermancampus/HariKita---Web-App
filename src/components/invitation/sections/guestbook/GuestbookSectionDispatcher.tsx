"use client";

import React from "react";
import { DedicatedTemplateProps, GuestbookStyleId } from "@/lib/templates/types";
import { Guestbook_StickyNotes } from "./Guestbook_StickyNotes";
import { Guestbook_LuxuryScrollbook } from "./Guestbook_LuxuryScrollbook";
import { Guestbook_MinimalFeed } from "./Guestbook_MinimalFeed";

export const GuestbookSectionDispatcher: React.FC<{
  invitationId?: string;
  defaultGuestName?: string;
  activeSessionCode?: string;
  initialWishes: DedicatedTemplateProps["initialWishes"];
  theme: DedicatedTemplateProps["theme"];
}> = ({ invitationId, defaultGuestName, activeSessionCode, initialWishes, theme }) => {
  let style: GuestbookStyleId = theme?.sectionConfig?.guestbookStyle || "luxury-scrollbook";

  if (!theme?.sectionConfig?.guestbookStyle) {
    const arch = theme?.archetypeId || "botanical";
    if (arch.includes("cute") || arch.includes("family") || arch.includes("animated")) {
      style = "sticky-notes";
    } else if (arch.includes("minimalist")) {
      style = "minimal-feed";
    } else {
      style = "luxury-scrollbook";
    }
  }

  switch (style) {
    case "sticky-notes":
      return (
        <Guestbook_StickyNotes
          invitationId={invitationId}
          defaultGuestName={defaultGuestName}
          activeSessionCode={activeSessionCode}
          initialWishes={initialWishes}
          themePrimary={theme?.colors?.primary}
        />
      );
    case "minimal-feed":
      return (
        <Guestbook_MinimalFeed
          invitationId={invitationId}
          defaultGuestName={defaultGuestName}
          activeSessionCode={activeSessionCode}
          initialWishes={initialWishes}
          themePrimary={theme?.colors?.primary}
        />
      );
    case "luxury-scrollbook":
    default:
      return (
        <Guestbook_LuxuryScrollbook
          invitationId={invitationId}
          defaultGuestName={defaultGuestName}
          activeSessionCode={activeSessionCode}
          initialWishes={initialWishes}
          themePrimary={theme?.colors?.primary}
        />
      );
  }
};
