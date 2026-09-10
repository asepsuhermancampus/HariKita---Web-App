"use client";

import React from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { TulipDivider, TulipCluster } from "@/components/invitation/svg/tulivelle";

export const TulivelleStories: React.FC<{
  storyTimeline: DedicatedTemplateProps["storyTimeline"];
  theme: DedicatedTemplateProps["theme"];
}> = ({ storyTimeline, theme }) => {
  const primaryColor = theme.colors.primary || "#7A8C74";
  const accentColor = theme.colors.accent || "#D48B72";

  return (
    <section id="stories" className="py-16 px-4 max-w-xl mx-auto space-y-10 text-center">
      <TulipDivider size="80%" color={primaryColor} secondaryColor={accentColor} />

      <div className="space-y-2">
        <span className="text-xs font-serif font-bold uppercase tracking-widest text-rose-800">
          Perjalanan Hati
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-rose-950">
          Untaian Kisah Bersama
        </h2>
      </div>

      <div className="space-y-6 text-left relative pl-6 border-l-2 border-rose-300/50 ml-4">
        {storyTimeline.map((story, idx) => (
          <div key={idx} className="relative space-y-1.5">
            <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white shadow-xs" />
            <span className="text-xs font-mono font-bold text-rose-800 px-2.5 py-0.5 rounded-full bg-rose-100/70">
              {story.year}
            </span>
            <h3 className="font-serif font-bold text-base text-rose-950">{story.title}</h3>
            <p className="text-xs font-serif text-slate-600 leading-relaxed">{story.desc}</p>
          </div>
        ))}
      </div>

      <div className="pt-4 flex justify-center opacity-60">
        <TulipCluster size={50} color={primaryColor} secondaryColor={accentColor} />
      </div>
    </section>
  );
};
