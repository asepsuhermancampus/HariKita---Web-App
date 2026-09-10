"use client";

import React from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import { Calendar, Clock, MapPin, ExternalLink, Sparkles } from "lucide-react";
import { AddToCalendarButton } from "@/components/invitation/cards";

export const Schedule_VerticalTimeline: React.FC<{
  eventDate: string;
  sessions: DedicatedTemplateProps["sessions"];
  activeSessionCode: DedicatedTemplateProps["activeSessionCode"];
  googleMapsUrl: string;
  theme: DedicatedTemplateProps["theme"];
}> = ({ eventDate, sessions, activeSessionCode, googleMapsUrl, theme }) => {
  const primaryColor = theme?.colors?.primary || "#C5A880";
  const accentColor = theme?.colors?.accent || "#D4AF37";

  const sessionList = [
    { key: "s1" as const, data: sessions.s1 },
    { key: "s2" as const, data: sessions.s2 },
    ...(sessions.s3 ? [{ key: "s3" as const, data: sessions.s3 }] : []),
  ];

  const dateObj = new Date(eventDate);
  const formattedDay = dateObj.toLocaleDateString("id-ID", { weekday: "long" });
  const formattedDate = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <section id="schedule" className="py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-3xl mx-auto space-y-16">
        {/* Timeline Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-300/40 bg-amber-50 text-amber-900 text-xs font-serif font-bold uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Rangkaian Waktu Sakral</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900">
            Jadwal Prosesi Acara
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-serif">
            {formattedDay}, {formattedDate}
          </p>
        </div>

        {/* Vertical Timeline Track */}
        <div className="relative border-l-2 sm:border-l-0 sm:before:absolute sm:before:left-1/2 sm:before:top-0 sm:before:bottom-0 sm:before:w-0.5 sm:before:bg-amber-300/40 ml-4 sm:ml-0 space-y-12">
          {sessionList.map(({ key, data }, idx) => {
            const isHighlighted = activeSessionCode === key;
            const isEven = idx % 2 === 0;

            return (
              <div
                key={key}
                className={`relative flex flex-col sm:flex-row items-start ${
                  isEven ? "sm:flex-row-reverse" : ""
                } gap-6 group`}
              >
                {/* Timeline Center Node */}
                <div
                  className="absolute -left-[25px] sm:left-1/2 sm:-translate-x-1/2 top-4 w-6 h-6 rounded-full border-4 border-white shadow-md flex items-center justify-center z-10 transition-transform group-hover:scale-125"
                  style={{ backgroundColor: isHighlighted ? accentColor : primaryColor }}
                >
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>

                {/* Timeline Card */}
                <div className="w-full sm:w-[calc(50%-2rem)] bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xl space-y-4 hover:-translate-y-1 transition-transform">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-xs"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {data.title}
                    </span>
                    {isHighlighted && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Sesi Kehadiran Anda
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>{data.timeSlot}</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-600 pt-1">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">{data.venueName}</p>
                        <p className="text-[11px] leading-relaxed text-slate-500">{data.venueAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => soundscape.playTick()}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-950 py-1.5 px-3 rounded-xl bg-amber-50 border border-amber-200/60 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>Petunjuk Arah</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                    <AddToCalendarButton
                      title={data.title}
                      description={`Pernikahan di ${data.venueName}`}
                      location={data.venueAddress}
                      startDate={eventDate}
                      endDate={eventDate}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
