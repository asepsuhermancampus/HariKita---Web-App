"use client";

import React from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { MessageCircleHeart, Heart } from "lucide-react";

export const Stories_ChatJourney: React.FC<{
  stories: DedicatedTemplateProps["storyTimeline"];
  theme: DedicatedTemplateProps["theme"];
}> = ({ stories }) => {
  return (
    <section id="story" className="py-20 px-4 sm:px-6 relative overflow-hidden bg-rose-50/40">
      <div className="max-w-2xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider">
            <MessageCircleHeart className="w-4 h-4 text-rose-500" />
            <span>Chat Logs &amp; Sweet Memories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            Bagaimana Cerita Kita Dimulai
          </h2>
          <p className="text-xs text-slate-500">Rekam jejak pesan manis yang mengantar kami ke pelaminan</p>
        </div>

        {/* Chat Phone Simulator Frame */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-100 space-y-6 max-w-lg mx-auto">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                👰🤵
              </div>
              <div>
                <strong className="text-sm text-slate-800 block">Kisah Bahagia Kita 💕</strong>
                <span className="text-[10px] text-emerald-600 font-semibold">Online • Bersemi Selamanya</span>
              </div>
            </div>
            <Heart className="w-5 h-5 text-rose-400 fill-rose-400 animate-pulse" />
          </div>

          {/* Chat Bubbles */}
          <div className="space-y-4 pt-2">
            {stories.map((item, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isEven ? "items-start" : "items-end"} space-y-1`}
                >
                  <span className="text-[10px] text-slate-400 font-mono px-2">
                    Tahun {item.year}
                  </span>
                  <div
                    className={`max-w-[92%] sm:max-w-[88%] p-4 sm:p-5 rounded-2xl shadow-sm text-xs sm:text-[13px] space-y-2 ${
                      isEven
                        ? "bg-slate-100 text-slate-800 rounded-tl-xs"
                        : "bg-rose-500 text-white rounded-tr-xs"
                    }`}
                  >
                    <strong className="block font-bold text-sm sm:text-base leading-snug">{item.title}</strong>
                    <p className={`leading-relaxed font-sans ${isEven ? "text-slate-600" : "text-rose-100"}`}>
                      {item.desc}
                    </p>
                    <div className="text-[10px] text-right opacity-70 font-mono">Dibaca ✓✓</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
