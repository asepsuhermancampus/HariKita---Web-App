"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { GoldenDustCanvas } from "@/components/invitation/canvas/GoldenDustCanvas";
import { MapPin, Sparkles, Moon } from "lucide-react";
import { CelestialConstellationSvg } from "@/components/invitation/svg";
import {
  CoupleSectionDispatcher,
  ScheduleSectionDispatcher,
  MapSectionDispatcher,
  StoriesSectionDispatcher,
  GallerySectionDispatcher,
  GiftSectionDispatcher,
  GuestbookSectionDispatcher,
  ClosingSectionDispatcher,
} from "@/components/invitation/sections";

export const CelestialEngine: React.FC<DedicatedTemplateProps> = ({
  theme,
  guestName,
  activeSessionCode,
  bride,
  groom,
  eventDate,
  sessions,
  googleMapsUrl,
  storyTimeline,
  galleryPhotos,
  giftInfo,
  initialWishes,
  onCloseInvitation,
}) => {
  const [selectedSession] = useState<"s1" | "s2" | "s3">(activeSessionCode || "s1");
  const activeSession = sessions[selectedSession] || sessions.s1;

  const formattedDate = new Date(eventDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden selection:bg-indigo-600 selection:text-white">
      {/* 1. Stardust Canvas */}
      <GoldenDustCanvas className="pointer-events-none opacity-60 z-10" />

      {/* Ambient Celestial Nebula Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* ===================== SECTION 1: BESPOKE CELESTIAL HERO (#hero) ===================== */}
      <section
        id="hero"
        className="relative min-h-[95vh] flex flex-col items-center justify-center p-6 text-center space-y-6 pt-12"
      >
        {/* Constellation SVG & Moon Orb */}
        <div className="relative">
          <CelestialConstellationSvg className="w-24 h-24 text-indigo-400 opacity-70 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Moon className="w-8 h-8 text-amber-200 animate-pulse" />
          </div>
        </div>

        <div className="space-y-2.5 max-w-md mx-auto">
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-serif uppercase tracking-[0.2em] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Written In The Stars</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-amber-100 to-purple-200 leading-tight">
            {bride.name} <span className="text-amber-300 font-light">&amp;</span> {groom.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-serif italic max-w-sm mx-auto leading-relaxed">
            &ldquo;When the stars align, two souls find their eternal orbit.&rdquo;
          </p>
        </div>

        {/* Floating Glass Prewed Card */}
        <div className="relative p-2.5 bg-slate-900/60 backdrop-blur-2xl rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-slate-700/60 max-w-[280px] w-full mx-auto transition-transform duration-500 hover:scale-[1.01]">
          <img
            src={bride.photo || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600"}
            alt="Couple"
            className="w-full aspect-[4/5] object-cover object-top rounded-2xl filter brightness-95"
          />
          <div className="pt-3 pb-1 text-center font-serif text-xs tracking-widest text-indigo-300 uppercase">
            {formattedDate}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-indigo-200 bg-slate-900/80 px-4 py-2 rounded-full border border-indigo-500/30">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>{activeSession.venueName}</span>
        </div>
      </section>

      {/* ===================== MODULAR BODY SECTIONS ===================== */}
      {/* 2. Mempelai */}
      <CoupleSectionDispatcher bride={bride} groom={groom} theme={theme} />

      {/* 3. Jadwal Acara */}
      <ScheduleSectionDispatcher
        eventDate={eventDate}
        sessions={sessions}
        activeSessionCode={selectedSession}
        googleMapsUrl={googleMapsUrl}
        theme={theme}
      />

      {/* 4. Peta & Denah Lokasi */}
      <MapSectionDispatcher
        venueName={activeSession.venueName}
        venueAddress={activeSession.venueAddress}
        googleMapsUrl={googleMapsUrl}
        theme={theme}
      />

      {/* 5. Sweet Memories / Kisah Cinta */}
      <StoriesSectionDispatcher stories={storyTimeline} theme={theme} />

      {/* 6. Galeri Foto */}
      <GallerySectionDispatcher photos={galleryPhotos} theme={theme} />

      {/* 7. Kado Digital & Rekening */}
      <GiftSectionDispatcher giftInfo={giftInfo} theme={theme} />

      {/* 8. Buku Tamu & RSVP */}
      <GuestbookSectionDispatcher
        invitationId={theme?.id}
        defaultGuestName={guestName}
        activeSessionCode={selectedSession}
        initialWishes={initialWishes}
        theme={theme}
      />

      {/* 9. Ucapan Penutup */}
      <ClosingSectionDispatcher
        brideName={bride.name}
        groomName={groom.name}
        theme={theme}
        onCloseInvitation={onCloseInvitation}
      />
    </div>
  );
};
