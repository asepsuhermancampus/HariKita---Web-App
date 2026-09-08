import React from "react";
import { Heart } from "lucide-react";

interface StoryItem {
  year: string;
  title: string;
  desc: string;
}

interface LoveStoryTimelineProps {
  stories: StoryItem[];
}

export const LoveStoryTimeline: React.FC<LoveStoryTimelineProps> = ({ stories }) => {
  if (!stories || stories.length === 0) return null;

  return (
    <section className="py-20 px-4 max-w-3xl mx-auto space-y-12 text-center">
      <div className="space-y-3">
        <span className="text-xs uppercase tracking-widest text-gold-dark font-bold">
          Our Journey
        </span>
        <h2 className="font-serif-luxury text-3xl sm:text-4xl text-plum font-bold">
          Kisah Cinta Kami
        </h2>
        <p className="text-xs text-plum-light font-medium">
          Setiap babak perjalanan yang mengantarkan langkah kami ke pelaminan
        </p>
      </div>

      <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
        {stories.map((item, index) => {
          const isEven = index % 2 === 0;
          return (
            <li key={index}>
              {index > 0 && <hr className="bg-gold/40" />}
              <div className="timeline-middle">
                <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold flex items-center justify-center text-plum shadow-sm">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                </div>
              </div>
              <div
                className={`${
                  isEven ? "timeline-start md:text-end" : "timeline-end md:text-start"
                } mb-10 p-5 rounded-2xl bg-white/80 border border-gold/25 shadow-sm space-y-2 max-w-sm`}
              >
                <time className="text-xs font-mono font-bold text-gold-dark px-2.5 py-0.5 rounded-full bg-gold/10 inline-block">
                  {item.year}
                </time>
                <div className="font-serif-luxury text-lg font-bold text-plum">
                  {item.title}
                </div>
                <p className="text-xs text-plum-light leading-relaxed">
                  {item.desc}
                </p>
              </div>
              {index < stories.length - 1 && <hr className="bg-gold/40" />}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
