"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import { Calendar, Clock, MapPin, ExternalLink, CalendarDays } from "lucide-react";
import { AddToCalendarButton } from "@/components/invitation/cards";

export const Schedule_CalendarGrid: React.FC<{
  eventDate: string;
  sessions: DedicatedTemplateProps["sessions"];
  activeSessionCode: DedicatedTemplateProps["activeSessionCode"];
  googleMapsUrl: string;
  theme: DedicatedTemplateProps["theme"];
}> = ({ eventDate, sessions, activeSessionCode, googleMapsUrl, theme }) => {
  const [selectedSession, setSelectedSession] = useState<"s1" | "s2" | "s3">(activeSessionCode || "s1");
  const primaryColor = theme?.colors?.primary || "#FF7E67";
  const activeSession = sessions[selectedSession] || sessions.s1;

  const dateObj = new Date(eventDate);
  const dayNumber = dateObj.getDate();
  const monthName = dateObj.toLocaleDateString("id-ID", { month: "long" });
  const yearNumber = dateObj.getFullYear();

  // Days of week header
  const daysHeader = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  return (
    <section id="schedule" className="py-20 px-4 sm:px-6 relative overflow-hidden bg-slate-50/50">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Save The Sacred Date</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Kalender Hari Bahagia
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">Tandai kalender Anda untuk merayakan momen istimewa kami</p>
        </div>

        {/* Minimalist Desk Calendar Display */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden max-w-lg mx-auto">
          {/* Calendar Top Ring Binder Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest">
              {monthName} {yearNumber}
            </span>
            <div className="w-12" />
          </div>

          {/* Calendar Days Matrix (Visual Decorative Ring) */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400">
              {daysHeader.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Representative Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-slate-600">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                const isTheDay = d === dayNumber;
                return (
                  <div
                    key={d}
                    className={`h-8 w-8 mx-auto flex items-center justify-center rounded-full text-xs transition-transform ${
                      isTheDay
                        ? "bg-rose-500 text-white font-extrabold shadow-lg scale-110 ring-4 ring-rose-200"
                        : "hover:bg-slate-100"
                    }`}
                  >
                    {d}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sessions Switcher & Cards */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
          <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-100">
            {(["s1", "s2"] as const).map((code) => (
              <button
                key={code}
                onClick={() => {
                  soundscape.playTick();
                  setSelectedSession(code);
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  selectedSession === code
                    ? "bg-white text-slate-900 shadow-md scale-102"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {sessions[code].title}
              </button>
            ))}
            {sessions.s3 && (
              <button
                onClick={() => {
                  soundscape.playTick();
                  setSelectedSession("s3");
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  selectedSession === "s3"
                    ? "bg-white text-slate-900 shadow-md scale-102"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {sessions.s3.title}
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">{activeSession.title}</h3>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{activeSession.timeSlot}</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block text-sm">{activeSession.venueName}</strong>
                <p className="text-xs text-slate-600 leading-relaxed">{activeSession.venueAddress}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundscape.playTick()}
                className="flex-1 py-3 px-4 rounded-2xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>Navigasi Lokasi (Maps)</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
              <AddToCalendarButton
                title={activeSession.title}
                description={`Pernikahan di ${activeSession.venueName}`}
                location={activeSession.venueAddress}
                startDate={eventDate}
                endDate={eventDate}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
