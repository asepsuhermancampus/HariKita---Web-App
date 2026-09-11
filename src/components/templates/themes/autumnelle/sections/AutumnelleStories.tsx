"use client";

import React from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { PressedFlowerDivider } from "@/components/invitation/svg/autumnelle";

export const AutumnelleStories: React.FC<{
  storyTimeline: DedicatedTemplateProps["storyTimeline"];
  theme: DedicatedTemplateProps["theme"];
}> = ({ storyTimeline, theme }) => {
  const primaryColor = theme.colors.primary || "#5C6F57";
  const accentColor = theme.colors.accent || "#B85D3B";

  return (
    <section id="stories" className="py-16 px-4 max-w-xl mx-auto space-y-10 text-center">
      <PressedFlowerDivider color={primaryColor} />

      <div className="space-y-2">
        <span
          className="text-xs font-serif font-bold uppercase tracking-widest"
          style={{ color: primaryColor }}
        >
          Kisah Kasih
        </span>
        <h2
          className="text-2xl sm:text-3xl font-serif font-bold"
          style={{ color: theme.colors.text || "#261F23" }}
        >
          Langkah Menuju Hari Bahagia
        </h2>
      </div>

      <div
        className="space-y-8 text-left relative pl-6 sm:pl-8 border-l-2 ml-3 sm:ml-4"
        style={{ borderColor: `${primaryColor}35` }}
      >
        {storyTimeline.map((story, idx) => (
          <div key={idx} className="relative space-y-2 pb-2">
            <div
              className="absolute left-[-25px] sm:left-[-33px] -translate-x-1/2 top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-xs"
              style={{ backgroundColor: primaryColor }}
            />
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-serif uppercase tracking-[0.2em] font-bold px-2.5 py-0.5 rounded-full border"
                style={{
                  backgroundColor: `${accentColor}18`,
                  borderColor: `${accentColor}40`,
                  color: accentColor,
                }}
              >
                TAHUN {story.year}
              </span>
              <span
                className="text-[11px] font-serif font-semibold"
                style={{ color: primaryColor }}
              >
                Bab 0{idx + 1}
              </span>
            </div>
            <h3
              className="font-serif font-bold text-base sm:text-lg leading-snug"
              style={{ color: theme.colors.text || "#261F23" }}
            >
              {story.title}
            </h3>
            <p className="text-xs sm:text-[13px] font-serif text-stone-700 leading-relaxed text-justify sm:text-left">
              {story.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
