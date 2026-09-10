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

      <div className="space-y-6 text-left relative pl-6 border-l-2 border-emerald-300/40 ml-4">
        {storyTimeline.map((story, idx) => (
          <div key={idx} className="relative space-y-1.5">
            <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-700 border-2 border-white shadow-xs" />
            <span className="text-xs font-mono font-bold text-amber-800 px-2.5 py-0.5 rounded-full bg-amber-100/60">
              {story.year}
            </span>
            <h3 className="font-serif font-bold text-base text-emerald-950">{story.title}</h3>
            <p className="text-xs font-serif text-slate-600 leading-relaxed">{story.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
