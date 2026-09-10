"use client";

import React from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { Heart, Sparkles, Calendar } from "lucide-react";

export const Stories_MilestoneCards: React.FC<{
  stories: DedicatedTemplateProps["storyTimeline"];
  theme: DedicatedTemplateProps["theme"];
}> = ({ stories, theme }) => {
  const primaryColor = theme?.colors?.primary || "#2D5A27";
  const accentColor = theme?.colors?.accent || "#C5A880";

  return (
    <section id="story" className="py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-3xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-300/40 bg-amber-50 text-amber-900 text-xs font-serif font-bold uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Love Milestones</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900">
            Titik Temu &amp; Janji Suci
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-serif">
            Langkah demi langkah menyatukan dua hati menuju hari yang mulia
          </p>
        </div>

        {/* Milestone Cards Track */}
        <div className="relative border-l-2 border-dashed border-amber-300/60 ml-4 sm:ml-8 pl-6 sm:pl-8 space-y-10">
          {stories.map((item, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline Marker Ring */}
              <div
                className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-md flex items-center justify-center transition-transform group-hover:scale-125"
                style={{ backgroundColor: accentColor }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              {/* Milestone Content Card */}
              <div className="bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xl space-y-2 hover:-translate-y-1 transition-transform">
                <span className="text-xs font-bold font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-900 inline-block">
                  Tahun {item.year}
                </span>
                <h3 className="text-xl font-serif font-bold text-slate-900 pt-1">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
