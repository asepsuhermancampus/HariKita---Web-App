"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { FloatingPetalsCanvas } from "@/components/invitation/canvas/FloatingPetalsCanvas";
import { OrnamentFloralWreath } from "@/components/invitation/ornaments/OrnamentFloralWreath";
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

export const BotanicalEngine: React.FC<DedicatedTemplateProps> = ({
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
  const primaryColor = theme?.colors?.primary || "#5C6F57";

  const formattedDate = new Date(eventDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const activeSession = sessions[selectedSession] || sessions.s1;

  return (
    <div
      className="relative w-full min-h-screen font-sans overflow-x-hidden selection:bg-emerald-200"
      style={{
        backgroundColor: theme?.colors?.background || "#FAF7F5",
        color: theme?.colors?.text || "#261F23",
      }}
    >
      {/* 1. Floating Falling Leaves & Petals Canvas */}
      <FloatingPetalsCanvas className="pointer-events-none opacity-60 z-10" />

      {/* 2. Four-Corner Botanical Sway Accents */}
      <div className="pointer-events-none absolute top-0 left-0 w-24 h-24 z-20 opacity-40 animate-pulse">
        <svg viewBox="0 0 100 100" fill={primaryColor}>
          <path d="M0,0 Q50,10 70,70 Q20,50 0,0 Z" />
          <path d="M10,0 Q60,30 40,80 Q20,30 10,0 Z" opacity="0.6" />
        </svg>
      </div>
      <div className="pointer-events-none absolute top-0 right-0 w-24 h-24 z-20 opacity-40 -scale-x-100 animate-pulse">
        <svg viewBox="0 0 100 100" fill={primaryColor}>
          <path d="M0,0 Q50,10 70,70 Q20,50 0,0 Z" />
        </svg>
      </div>

      {/* ===================== SECTION 1: BESPOKE HERO (#hero) ===================== */}
      <section
        id="hero"
        className="relative min-h-[90vh] flex flex-col items-center justify-center p-6 text-center space-y-6 pt-12"
      >
        <div className="relative inline-flex items-center justify-center w-[130px] h-[130px] mx-auto">
          <OrnamentFloralWreath color={primaryColor} size={130} className="animate-spin-slow opacity-80" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-3xl font-serif font-bold text-amber-800">
              {bride.name.charAt(0)} &amp; {groom.name.charAt(0)}
            </span>
          </div>
        </div>

        <div className="space-y-2 max-w-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-widest uppercase bg-emerald-900/10 text-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Wedding of</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold tracking-wide leading-tight text-emerald-950">
            {bride.name} <span className="font-light text-amber-700">&amp;</span> {groom.name}
          </h1>
          <p className="text-xs text-slate-600 font-serif italic">
            &ldquo;Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu...&rdquo;
          </p>
        </div>

        {/* Polaroid Style Couple Hero Card */}
        <div className="relative p-3 bg-white shadow-xl rounded-2xl rotate-[-1deg] border border-amber-900/10 max-w-[280px] w-full transform hover:rotate-0 transition-transform duration-500">
          <img
            src={bride.photo || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600"}
            alt="Couple"
            className="w-full h-64 object-cover rounded-xl"
          />
          <div className="pt-3 pb-1 text-center font-serif text-sm font-semibold text-emerald-950">
            {formattedDate}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-100/60 px-4 py-2 rounded-full border border-emerald-300/40">
          <MapPin className="w-3.5 h-3.5 text-amber-700" />
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
