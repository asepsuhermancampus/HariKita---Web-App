"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps, GuestSessionInfo } from "@/lib/templates/types";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import { Calendar, Clock, MapPin, ExternalLink, Ticket, Plane } from "lucide-react";
import { AddToCalendarButton } from "@/components/invitation/cards";

export const Schedule_BoardingPass: React.FC<{
  eventDate: string;
  sessions: DedicatedTemplateProps["sessions"];
  activeSessionCode: DedicatedTemplateProps["activeSessionCode"];
  googleMapsUrl: string;
  theme: DedicatedTemplateProps["theme"];
}> = ({ eventDate, sessions, activeSessionCode, googleMapsUrl, theme }) => {
  const [selectedSession, setSelectedSession] = useState<"s1" | "s2" | "s3">(activeSessionCode || "s1");
  const primaryColor = theme?.colors?.primary || "#C5A880";
  const activeSession = sessions[selectedSession] || sessions.s1;

  const dateObj = new Date(eventDate);
  const formattedDay = dateObj.toLocaleDateString("id-ID", { weekday: "long" });
  const formattedDate = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const handleTabChange = (code: "s1" | "s2" | "s3") => {
    soundscape.playTick();
    setSelectedSession(code);
  };

  return (
    <section id="schedule" className="py-20 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-slate-500 inline-flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5 text-amber-600" />
            <span>Wedding Pass &amp; Itinerary</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-800">
            Jadwal Acara &amp; Tiket Undangan
          </h2>
          <p className="text-xs text-slate-500">Pilih sesi kehadiran Anda di bawah ini:</p>
        </div>

        {/* Session Switcher Tabs */}
        <div className="flex justify-center items-center gap-2 p-1.5 rounded-2xl bg-slate-200/60 max-w-sm mx-auto backdrop-blur-xs">
          {(["s1", "s2"] as const).map((code) => {
            const sess = sessions[code];
            if (!sess) return null;
            const isSelected = selectedSession === code;
            return (
              <button
                key={code}
                onClick={() => handleTabChange(code)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-white text-slate-900 shadow-md font-bold scale-102"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {sess.title}
              </button>
            );
          })}
          {sessions.s3 && (
            <button
              onClick={() => handleTabChange("s3")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                selectedSession === "s3"
                  ? "bg-white text-slate-900 shadow-md font-bold scale-102"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {sessions.s3.title}
            </button>
          )}
        </div>

        {/* Boarding Pass Card */}
        <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Top Pass Banner */}
          <div
            className="p-4 sm:p-6 text-white flex items-center justify-between"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 -rotate-45" />
              <span className="text-xs font-mono tracking-widest uppercase font-bold">
                BOARDING PASS • HARI BAHAGIA
              </span>
            </div>
            <span className="text-xs font-mono uppercase bg-black/20 px-2.5 py-1 rounded">
              SESI: {selectedSession.toUpperCase()}
            </span>
          </div>

          {/* Main Pass Content */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <span
                className="text-[11px] font-serif uppercase tracking-widest font-semibold block"
                style={{ color: primaryColor }}
              >
                Nama Acara
              </span>
              <h3 className="text-2xl font-serif font-bold text-slate-900">{activeSession.title}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <Calendar className="w-5 h-5 shrink-0 mt-0.5" style={{ color: primaryColor }} />
                <div>
                  <span className="text-[10px] font-serif uppercase tracking-wider font-bold text-slate-400 block">Hari &amp; Tanggal</span>
                  <p className="text-sm font-semibold text-slate-800">{formattedDay}</p>
                  <p className="text-xs text-slate-500">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <Clock className="w-5 h-5 shrink-0 mt-0.5" style={{ color: primaryColor }} />
                <div>
                  <span className="text-[10px] font-serif uppercase tracking-wider font-bold text-slate-400 block">Waktu Pelaksanaan</span>
                  <p className="text-sm font-semibold text-slate-800">{activeSession.timeSlot}</p>
                  <p className="text-xs text-slate-500">Mohon hadir 15 menit sebelumnya</p>
                </div>
              </div>
            </div>

            {/* Venue Location */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <MapPin className="w-5 h-5 shrink-0 mt-0.5" style={{ color: primaryColor }} />
              <div className="space-y-1">
                <span className="text-[10px] font-serif uppercase tracking-wider font-bold text-slate-400 block">Lokasi Acara</span>
                <p className="text-sm font-bold text-slate-900">{activeSession.venueName}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{activeSession.venueAddress}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundscape.playTick()}
                className="flex-1 py-3 px-5 rounded-2xl text-xs font-bold text-white shadow-md hover:brightness-105 flex items-center justify-center gap-2 transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                <MapPin className="w-4 h-4" />
                <span>Buka Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
              <div className="sm:w-auto">
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

          {/* Perforated Divider with Cutout Notches */}
          <div className="relative border-t-2 border-dashed border-slate-200 my-2">
            <div className="absolute -left-4 -top-3 w-6 h-6 rounded-full bg-slate-100 border border-slate-200" />
            <div className="absolute -right-4 -top-3 w-6 h-6 rounded-full bg-slate-100 border border-slate-200" />
          </div>

          {/* Simulated Barcode Stub */}
          <div className="p-4 sm:p-6 bg-slate-50 flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-1 font-mono text-[10px]">
              <span className="font-bold tracking-widest text-slate-700">HK-KEBUMEN-VIP</span>
              <span>|||| | ||||| || |||| ||| |||||</span>
            </div>
            <span className="text-[10px] font-mono">NON-TRANSFERABLE</span>
          </div>
        </div>
      </div>
    </section>
  );
};
