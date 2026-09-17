"use client";

import React from "react";
import { DedicatedTemplateProps, ScheduleStyleId } from "@/lib/templates/types";
import { Schedule_BoardingPass } from "./Schedule_BoardingPass";
import { Schedule_VerticalTimeline } from "./Schedule_VerticalTimeline";
import { Schedule_CalendarGrid } from "./Schedule_CalendarGrid";
import { Schedule_TwinArchGate } from "./Schedule_TwinArchGate";

export const ScheduleSectionDispatcher: React.FC<{
  eventDate: string;
  sessions: DedicatedTemplateProps["sessions"];
  activeSessionCode: DedicatedTemplateProps["activeSessionCode"];
  googleMapsUrl: string;
  theme: DedicatedTemplateProps["theme"];
}> = ({ eventDate, sessions, activeSessionCode, googleMapsUrl, theme }) => {
  let style: ScheduleStyleId = theme?.sectionConfig?.scheduleStyle || "boarding-pass";

  if (!theme?.sectionConfig?.scheduleStyle) {
    const arch = theme?.archetypeId || "botanical";
    if (arch.includes("islamic") || arch.includes("syari")) {
      style = "twin-arch-gate";
    } else if (arch.includes("javanese") || arch.includes("royal") || arch.includes("rose-gold")) {
      style = "vertical-timeline";
    } else if (arch.includes("minimalist") || arch.includes("cute") || arch.includes("family")) {
      style = "calendar-grid";
    } else {
      style = "boarding-pass";
    }
  }

  switch (style) {
    case "vertical-timeline":
      return (
        <Schedule_VerticalTimeline
          eventDate={eventDate}
          sessions={sessions}
          activeSessionCode={activeSessionCode}
          googleMapsUrl={googleMapsUrl}
          theme={theme}
        />
      );
    case "calendar-grid":
      return (
        <Schedule_CalendarGrid
          eventDate={eventDate}
          sessions={sessions}
          activeSessionCode={activeSessionCode}
          googleMapsUrl={googleMapsUrl}
          theme={theme}
        />
      );
    case "twin-arch-gate":
      return (
        <Schedule_TwinArchGate
          eventDate={eventDate}
          sessions={sessions}
          activeSessionCode={activeSessionCode}
          googleMapsUrl={googleMapsUrl}
          theme={theme}
        />
      );
    case "boarding-pass":
    default:
      return (
        <Schedule_BoardingPass
          eventDate={eventDate}
          sessions={sessions}
          activeSessionCode={activeSessionCode}
          googleMapsUrl={googleMapsUrl}
          theme={theme}
        />
      );
  }
};
