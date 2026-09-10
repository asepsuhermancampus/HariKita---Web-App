"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { GoldenDustCanvas } from "@/components/invitation/canvas/GoldenDustCanvas";
import { OrnamentGunungan } from "@/components/invitation/ornaments/OrnamentGunungan";
import { MapPin, Sparkles } from "lucide-react";
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

export const JavaneseEngine: React.FC<DedicatedTemplateProps> = ({
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
}) => {
  const [selectedSession] = useState<"s1" | "s2" | "s3">(activeSessionCode || "s1");
  const goldColor = theme?.colors?.primary || "#D4AF37";

  const formattedDate = new Date(eventDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const activeSession = sessions[selectedSession] || sessions.s1;

  return (
    <div
      className="relative w-full min-h-screen font-serif overflow-x-hidden selection:bg-amber-900 selection:text-amber-100"
      style={{
        backgroundColor: theme?.colors?.background || "#1B120C",
        color: theme?.colors?.text || "#E8DFD8",
      }}
    >
      {/* 1. Golden Dust Glow Canvas */}
      <GoldenDustCanvas className="pointer-events-none opacity-50 z-10" />

      {/* 2. Traditional Gebyok Wood Frame Borders */}
      <div className="pointer-events-none absolute inset-0 border-[8px] sm:border-[12px] border-amber-800/30 z-20" />

      {/* ===================== SECTION 1: BESPOKE JAVANESE HERO (#hero) ===================== */}
      <section
        id="hero"
        className="relative min-h-[95vh] flex flex-col items-center justify-center p-6 text-center space-y-6 pt-12"
      >
        {/* Gunungan Gate Header */}
        <div className="relative flex items-center justify-center">
          <OrnamentGunungan color={goldColor} size={150} className="filter drop-shadow-[0_4px_12px_rgba(204,168,115,0.4)]" />
        </div>

        <div className="space-y-2 max-w-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-sans tracking-[0.25em] uppercase bg-amber-400/10 text-amber-300 border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Serat Ulem Pawiwahan</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider leading-tight text-amber-200">
            {bride.name} <span className="text-amber-400 font-light">&amp;</span> {groom.name}
          </h1>
          <p className="text-xs text-amber-300/70 italic max-w-xs mx-auto">
            Nyuwun sih wilasa lan berkahing Gusti Ingkang Murbeng Dumadi
          </p>
        </div>

        {/* Gebyok Framed Couple Photo */}
        <div className="relative p-2.5 bg-gradient-to-b from-amber-700 via-amber-900 to-amber-950 rounded-3xl shadow-2xl border-2 border-amber-400/50 max-w-[280px] w-full">
          <img
            src={bride.photo || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600"}
            alt="Couple"
            className="w-full h-64 object-cover rounded-2xl filter sepia-[0.15]"
          />
          <div className="pt-3 pb-1 text-center text-xs tracking-widest text-amber-300 uppercase">
            {formattedDate}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-amber-200 bg-amber-950/80 px-4 py-2 rounded-full border border-amber-400/40">
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
      <ClosingSectionDispatcher brideName={bride.name} groomName={groom.name} theme={theme} />
    </div>
  );
};
