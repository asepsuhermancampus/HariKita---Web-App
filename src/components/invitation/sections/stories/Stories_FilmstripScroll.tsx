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
          className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory pt-2"
        >
          {stories.map((item, idx) => (
            <div
              key={idx}
              className="snap-center shrink-0 w-72 sm:w-80 bg-slate-800/90 rounded-3xl p-6 border-2 border-slate-700 shadow-2xl space-y-4 flex flex-col justify-between"
            >
              {/* Film Sprocket Holes Decorative Header */}
              <div className="flex justify-between items-center py-1 border-b border-white/10 text-[10px] font-mono text-slate-400">
                <span className="bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold">
                  CHAPTER {idx + 1}
                </span>
                <span>TAHUN {item.year}</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-white leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{item.desc}</p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span className="font-serif italic">&ldquo;Hari Bahagia Menanti&rdquo;</span>
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
