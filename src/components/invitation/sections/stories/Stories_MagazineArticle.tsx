"use client";

import React from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { BookOpen, Quote } from "lucide-react";

export const Stories_MagazineArticle: React.FC<{
  stories: DedicatedTemplateProps["storyTimeline"];
  theme: DedicatedTemplateProps["theme"];
}> = ({ stories }) => {
  return (
    <section id="story" className="py-24 px-4 sm:px-6 relative overflow-hidden bg-stone-50">
      <div className="max-w-3xl mx-auto space-y-16">
        <div className="space-y-4 text-center sm:text-left border-b border-stone-300 pb-8">
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-stone-500 block">
            EDITORIAL SPECIAL EDITION • CHAPTER OF LOVE
          </span>
          <h2 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-stone-900">
            Jejak Langkah &amp; Kenangan
          </h2>
          <p className="text-sm text-stone-600 font-serif italic max-w-xl">
            Sebuah narasi sederhana tentang takdir, penerimaan, dan komitmen abadi dua manusia di bumi Kebumen.
          </p>
        </div>

        {/* Stories Magazine Articles */}
        <div className="space-y-12 divide-y divide-stone-200">
          {stories.map((item, idx) => (
            <div key={idx} className="pt-8 first:pt-0 grid grid-cols-1 sm:grid-cols-4 gap-6 items-baseline">
              <div className="sm:col-span-1 space-y-1">
                <span className="text-3xl font-serif font-bold text-stone-400">0{idx + 1}.</span>
                <span className="text-xs font-mono uppercase tracking-widest text-stone-500 block">
                  TAHUN {item.year}
                </span>
              </div>

              <div className="sm:col-span-3 space-y-3">
                <h3 className="text-2xl font-serif font-bold text-stone-900">{item.title}</h3>
                <p className="text-sm text-stone-700 leading-relaxed font-serif">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
