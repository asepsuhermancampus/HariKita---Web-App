"use client";

import React, { useRef } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import { Film, ChevronLeft, ChevronRight, Heart } from "lucide-react";

export const Stories_FilmstripScroll: React.FC<{
  stories: DedicatedTemplateProps["storyTimeline"];
  theme: DedicatedTemplateProps["theme"];
}> = ({ stories, theme }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const primaryColor = theme?.colors?.primary || "#C5A880";

  const handleScroll = (direction: "left" | "right") => {
    soundscape.playTick();
    if (scrollRef.current) {
      const amount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <section id="story" className="py-20 px-4 sm:px-6 relative overflow-hidden bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Film Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs uppercase font-mono tracking-widest text-amber-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Film className="w-3.5 h-3.5" />
              <span>Cinematic Love Memories</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              Kilas Balik Cerita Cinta
            </h2>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScroll("left")}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleScroll("right")}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filmstrip Reel Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory pt-2 px-1"
        >
          {stories.map((item, idx) => (
            <div
              key={idx}
              className="snap-center shrink-0 w-[84vw] max-w-[340px] sm:w-[380px] bg-slate-800/95 rounded-3xl p-6 sm:p-7 border border-slate-700/80 shadow-2xl space-y-4 flex flex-col justify-between min-h-[350px] sm:min-h-[360px] relative overflow-hidden group hover:border-amber-400/40 transition-colors"
            >
              {/* Top Film Sprocket Perforation Line */}
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <div className="flex items-center gap-1.5 opacity-40">
                  <div className="w-2.5 h-3 rounded-xs border border-white/60 bg-white/20" />
                  <div className="w-2.5 h-3 rounded-xs border border-white/60 bg-white/20" />
                  <div className="w-2.5 h-3 rounded-xs border border-white/60 bg-white/20" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider">
                    BAB 0{idx + 1}
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-slate-300">
                    {item.year}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 opacity-40">
                  <div className="w-2.5 h-3 rounded-xs border border-white/60 bg-white/20" />
                  <div className="w-2.5 h-3 rounded-xs border border-white/60 bg-white/20" />
                  <div className="w-2.5 h-3 rounded-xs border border-white/60 bg-white/20" />
                </div>
              </div>

              {/* Story Title & Long Narrative Description */}
              <div className="space-y-3 py-1 flex-1">
                <h3 className="text-lg sm:text-xl font-serif font-bold text-white leading-snug tracking-wide">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed font-sans text-justify sm:text-left">
                  {item.desc}
                </p>
              </div>

              {/* Bottom Film Sprocket Line & Footer Accent */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span className="font-serif italic text-[11px] text-slate-400">
                  &ldquo;Rangkai Cerita Menuju Pelaminan&rdquo;
                </span>
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400/80" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
