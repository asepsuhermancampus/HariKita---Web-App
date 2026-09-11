"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { GoldenDustCanvas } from "@/components/invitation/canvas/GoldenDustCanvas";
import { OrnamentGoldFoilFrame } from "@/components/invitation/ornaments/OrnamentGoldFoilFrame";
import { MapPin, Crown } from "lucide-react";
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

export const RoseGoldEngine: React.FC<DedicatedTemplateProps> = ({
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
  const gildedGold = theme?.colors?.primary || "#C5A880";

  const formattedDate = new Date(eventDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const activeSession = sessions[selectedSession] || sessions.s1;

  return (
    <div
      className="relative w-full min-h-screen font-serif overflow-x-hidden selection:bg-rose-900 selection:text-rose-100"
      style={{
        backgroundColor: theme?.colors?.background || "#1F161A",
        color: theme?.colors?.text || "#FCEFF2",
      }}
    >
      {/* 1. Rose Gold Dust Canvas */}
      <GoldenDustCanvas className="pointer-events-none opacity-60 z-10" />

      {/* ===================== SECTION 1: BESPOKE HERO (#hero) ===================== */}
      <section
        id="hero"
        className="relative min-h-[95vh] flex flex-col items-center justify-center p-6 text-center space-y-6 pt-12"
      >
        <div className="relative">
          <OrnamentGoldFoilFrame color={gildedGold} size={150} className="animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-serif font-bold text-amber-200">
              {bride.name.charAt(0)} &amp; {groom.name.charAt(0)}
            </span>
          </div>
        </div>

        <div className="space-y-2 max-w-xs">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-serif tracking-[0.25em] uppercase bg-rose-500/10 text-rose-200 border border-rose-400/30">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Royal Nuptial Celebration</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-amber-200 to-rose-300">
            {bride.name} <span className="text-amber-300 font-light">&amp;</span> {groom.name}
          </h1>
          <p className="text-xs text-rose-200/70 font-serif italic">
            &ldquo;Two lives, two hearts, joined together in friendship, united forever in love.&rdquo;
          </p>
        </div>

        {/* Diamond Cut Beveled Couple Photo */}
        <div className="relative p-3 bg-gradient-to-b from-amber-400/30 via-rose-500/20 to-black/60 rounded-3xl shadow-2xl border-2 border-amber-300/40 max-w-[280px] w-full transform hover:scale-105 transition-transform duration-500">
          <img
            src={bride.photo || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600"}
            alt="Couple"
            className="w-full h-64 object-cover rounded-2xl"
          />
          <div className="pt-3 pb-1 text-center font-serif text-xs tracking-widest text-amber-200 uppercase">
            {formattedDate}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-rose-200 bg-black/40 px-4 py-2 rounded-full border border-rose-300/30">
          <MapPin className="w-3.5 h-3.5 text-amber-300" />
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
