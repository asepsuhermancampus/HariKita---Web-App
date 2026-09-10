"use client";

import React from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { LeafCalendar, BotanicalPin, PressedFlowerDivider } from "@/components/invitation/svg/autumnelle";
import { Clock } from "lucide-react";

export const AutumnelleSchedule: React.FC<{
  sessions: DedicatedTemplateProps["sessions"];
  googleMapsUrl: string;
  theme: DedicatedTemplateProps["theme"];
}> = ({ sessions, googleMapsUrl, theme }) => {
  const primaryColor = theme.colors.primary || "#5C6F57";
  const sessionList = Object.values(sessions);

  return (
    <section id="event" className="py-16 px-4 max-w-2xl mx-auto space-y-10 text-center">
      <PressedFlowerDivider size="80%" color={primaryColor} />

      <div className="space-y-2">
        <span className="text-xs font-serif font-bold uppercase tracking-widest text-emerald-800">
          Rangkaian Acara
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-emerald-950">
          Waktu &amp; Tempat Pelaksanaan
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {sessionList.map((session, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-white/80 border border-emerald-200/60 shadow-md backdrop-blur-xs space-y-4 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/60 text-emerald-900 text-xs font-serif font-bold">
              <LeafCalendar size={14} color={primaryColor} />
              <span>{session.title}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-serif text-slate-700">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span className="font-semibold">{session.timeSlot}</span>
              </div>
              <div className="flex items-start gap-2 text-xs font-serif text-slate-600">
                <BotanicalPin size={16} color={primaryColor} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-950">{session.venueName}</p>
                  <p className="text-[11px] text-slate-500">{session.venueAddress}</p>
                </div>
              </div>
            </div>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-emerald-800 hover:text-emerald-900 transition-colors pt-2"
            >
              <span>Buka Google Maps</span>
              <span>&rarr;</span>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};
