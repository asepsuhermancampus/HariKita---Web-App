"use client";

import React from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { PressedFlowerDivider } from "@/components/invitation/svg/autumnelle";

export const AutumnelleStories: React.FC<{
  storyTimeline: DedicatedTemplateProps["storyTimeline"];
  theme: DedicatedTemplateProps["theme"];
}> = ({ storyTimeline, theme }) => {
  const primaryColor = theme.colors.primary || "#5C6F57";

  return (
    <section id="stories" className="py-16 px-4 max-w-xl mx-auto space-y-10 text-center">
      <PressedFlowerDivider size="80%" color={primaryColor} />

      <div className="space-y-2">
        <span className="text-xs font-serif font-bold uppercase tracking-widest text-emerald-800">
          Kisah Kasih
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-emerald-950">
          Langkah Menuju Hari Bahagia
        </h2>
      </div>

      <div className="space-y-8 text-left relative pl-6 sm:pl-8 border-l-2 border-emerald-300/50 ml-3 sm:ml-4">
        {storyTimeline.map((story, idx) => (
          <div key={idx} className="relative space-y-2 pb-2">
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-emerald-800 border-2 border-white shadow-xs" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-amber-900 px-2.5 py-0.5 rounded-full bg-amber-100/80 border border-amber-300/50">
                TAHUN {story.year}
              </span>
              <span className="text-[11px] font-serif text-emerald-800 font-semibold">
                Bab 0{idx + 1}
              </span>
            </div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-emerald-950 leading-snug">
              {story.title}
            </h3>
            <p className="text-xs sm:text-[13px] font-serif text-slate-700 leading-relaxed text-justify sm:text-left">
              {story.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
