"use client";

import React from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { TulipCalendar, TulipPin, TulipDivider } from "@/components/invitation/svg/tulivelle";
import { Clock } from "lucide-react";

export const TulivelleSchedule: React.FC<{
  sessions: DedicatedTemplateProps["sessions"];
  googleMapsUrl: string;
  theme: DedicatedTemplateProps["theme"];
}> = ({ sessions, googleMapsUrl, theme }) => {
  const primaryColor = theme.colors.primary || "#7A8C74";
  const accentColor = theme.colors.accent || "#D48B72";
  const sessionList = Object.values(sessions);

  return (
    <section id="event" className="py-16 px-4 max-w-2xl mx-auto space-y-10 text-center">
      <TulipDivider color={primaryColor} secondaryColor={accentColor} />

      <div className="space-y-2">
        <span className="text-xs font-serif font-bold uppercase tracking-widest text-rose-800">
          Agenda Kebahagiaan
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-rose-950">
          Waktu &amp; Lokasi Acara
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {sessionList.map((session, idx) => (
          <div
            key={idx}
            className="p-6 rounded-[32px] bg-white/85 border border-rose-200 shadow-md backdrop-blur-xs space-y-4 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-100/70 text-rose-950 text-xs font-serif font-bold">
              <TulipCalendar size={14} color={primaryColor} secondaryColor={accentColor} />
              <span>{session.title}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-serif text-slate-700">
                <Clock className="w-3.5 h-3.5 text-rose-700" />
                <span className="font-semibold">{session.timeSlot}</span>
              </div>
              <div className="flex items-start gap-2 text-xs font-serif text-slate-600">
                <TulipPin size={16} color={accentColor} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-950">{session.venueName}</p>
                  <p className="text-[11px] text-slate-500">{session.venueAddress}</p>
                </div>
              </div>
            </div>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-rose-800 hover:text-rose-900 transition-colors pt-2"
            >
              <span>Petunjuk Arah Maps</span>
              <span>&rarr;</span>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};
