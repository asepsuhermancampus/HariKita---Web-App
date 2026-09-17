"use client";

import React from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import { Calendar, Clock, MapPin, ExternalLink, Sparkles } from "lucide-react";
import { AddToCalendarButton } from "@/components/invitation/cards";

export const Schedule_TwinArchGate: React.FC<{
  eventDate: string;
  sessions: DedicatedTemplateProps["sessions"];
  activeSessionCode: DedicatedTemplateProps["activeSessionCode"];
  googleMapsUrl: string;
  theme: DedicatedTemplateProps["theme"];
}> = ({ eventDate, sessions, activeSessionCode, googleMapsUrl, theme }) => {
  const primaryColor = theme?.colors?.primary || "#1B4D3E";
  const accentColor = theme?.colors?.accent || "#D4AF37";

  const dateObj = new Date(eventDate);
  const formattedDay = dateObj.toLocaleDateString("id-ID", { weekday: "long" });
  const formattedDate = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const sessionEntries = [
    { key: "s1" as const, sess: sessions.s1 },
    { key: "s2" as const, sess: sessions.s2 },
  ];

  return (
    <section id="schedule" className="py-24 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-transparent via-amber-100/20 to-transparent">
      <div className="max-w-4xl mx-auto space-y-16 text-center">
        {/* Arch Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-300/40 bg-amber-50 text-amber-900 text-xs font-serif font-bold uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Gapura Waktu &amp; Prosesi</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-amber-950">
            Agenda Walimah &amp; Resepsi
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-serif">
            Insya Allah akan diselenggarakan pada {formattedDay}, {formattedDate}
          </p>
        </div>

        {/* Twin Arch Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {sessionEntries.map(({ key, sess }) => {
            const isTarget = activeSessionCode === key;
            return (
              <div
                key={key}
                className={`relative rounded-t-[100px] rounded-b-3xl p-8 pt-12 shadow-2xl border-2 transition-transform hover:-translate-y-1.5 duration-300 flex flex-col justify-between ${
                  isTarget
                    ? "bg-white border-amber-500 ring-4 ring-amber-300/30"
                    : "bg-white/90 border-slate-200"
                }`}
              >
                {/* Arch Top Crest */}
                <div className="space-y-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 border border-amber-300/60 flex items-center justify-center shadow-inner">
                    <Calendar className="w-7 h-7 text-amber-700" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 block">
                      {key === "s1" ? "Prosesi Akad Nikah" : "Tasyakuran Resepsi"}
                    </span>
                    <h3 className="text-2xl font-serif font-bold text-slate-900">{sess.title}</h3>
                  </div>

                  <div className="py-2.5 px-4 rounded-full bg-amber-500/10 text-amber-900 text-xs font-semibold inline-flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>{sess.timeSlot}</span>
                  </div>

                  {/* Venue */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <span>{sess.venueName}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-5">{sess.venueAddress}</p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-6 space-y-2">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => soundscape.playTick()}
                    className="w-full py-3 px-4 rounded-2xl text-xs font-bold text-white shadow-md hover:brightness-105 flex items-center justify-center gap-2 transition-all"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Navigasi Lokasi</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                  <AddToCalendarButton
                    title={sess.title}
                    description={`Pernikahan di ${sess.venueName}`}
                    location={sess.venueAddress}
                    startDate={eventDate}
                    endDate={eventDate}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
