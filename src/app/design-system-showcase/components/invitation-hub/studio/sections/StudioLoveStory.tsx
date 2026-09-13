'use client';

import React from 'react';
import { Heart, Calendar } from 'lucide-react';
import { SANDBOX_STORIES_DATA } from '../../../../data/mock-invitation-sandbox';

interface StudioLoveStoryProps {
  themeColor: string;
}

export function StudioLoveStory({ themeColor }: StudioLoveStoryProps) {
  return (
    <div className="space-y-6 px-4 py-4 text-hk-charcoal">
      <div className="text-center">
        <span
          className="font-manrope text-[10px] font-bold uppercase tracking-widest"
          style={{ color: themeColor }}
        >
          Kisah &amp; Perjalanan Cinta
        </span>
        <h3 className="font-editorial text-2xl font-medium text-hk-charcoal mt-0.5">
          Our Love Story
        </h3>
      </div>

      {/* Story Timeline Milestones */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-hk-champagne/40">
        {SANDBOX_STORIES_DATA.map((story) => (
          <div key={story.id} className="relative space-y-1">
            {/* Timeline Dot */}
            <div
              className="absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white text-white shadow-2xs"
              style={{ backgroundColor: themeColor }}
            >
              <Heart className="h-2 w-2 fill-white" />
            </div>

            <div className="flex items-center gap-2">
              <span
                className="font-mono text-[10px] font-bold uppercase tracking-wider"
                style={{ color: themeColor }}
              >
                {story.year}
              </span>
              <span className="text-[10px] font-manrope text-hk-charcoal/50">• {story.title}</span>
            </div>

            <div className="rounded-xl border border-hk-champagne/40 bg-white p-3 shadow-2xs">
              <p className="font-manrope text-xs text-hk-charcoal/80 leading-relaxed">
                {story.story}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
