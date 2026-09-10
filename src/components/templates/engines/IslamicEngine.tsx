"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { GoldenDustCanvas } from "@/components/invitation/canvas/GoldenDustCanvas";
import { OrnamentMoroccanArch } from "@/components/invitation/ornaments/OrnamentMoroccanArch";
import { MapPin, Sparkles, BookOpen } from "lucide-react";
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

export const IslamicEngine: React.FC<DedicatedTemplateProps> = ({
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
  const emeraldColor = theme?.colors?.primary || "#1B4D3E";
  const activeSession = sessions[selectedSession] || sessions.s1;

  return (
    <div
      className="relative w-full min-h-screen font-sans overflow-x-hidden selection:bg-emerald-200"
      style={{
        backgroundColor: theme?.colors?.background || "#FBF9F5",
        color: theme?.colors?.text || "#1E2A22",
      }}
    >
      {/* 1. Subtle Golden Dust Glow Canvas */}
      <GoldenDustCanvas className="pointer-events-none opacity-40 z-10" />

      {/* ===================== SECTION 1: BESPOKE ISLAMIC HERO (#hero) ===================== */}
      <section
        id="hero"
        className="relative min-h-[92vh] flex flex-col items-center justify-center p-6 text-center space-y-6 pt-12"
      >
        {/* Arabic Calligraphy Basmalah */}
        <div className="space-y-1">
          <p className="text-2xl sm:text-3xl font-serif text-emerald-900 tracking-wider">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p className="text-xs text-slate-500 italic">
            &ldquo;Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang&rdquo;
          </p>
        </div>

        {/* Moroccan Arch Header Frame */}
        <div className="relative">
          <OrnamentMoroccanArch color={emeraldColor} size={140} className="filter drop-shadow-md" />
          <div className="absolute inset-0 flex items-center justify-center pt-4">
            <span className="text-2xl font-serif font-bold text-amber-700">
              {bride.name.charAt(0)} &amp; {groom.name.charAt(0)}
            </span>
          </div>
        </div>

        <div className="space-y-2 max-w-xs">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-emerald-900/10 text-emerald-900 border border-emerald-900/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Walimatul &apos;Ursy</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-emerald-950">
            {bride.name} <span className="font-light text-amber-700">&amp;</span> {groom.name}
          </h1>
        </div>

        {/* Ar-Rum 21 Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-emerald-800/15 max-w-xs text-center space-y-2">
          <div className="flex items-center justify-center gap-1 text-xs text-amber-700 font-semibold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Q.S. Ar-Rum: 21</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed italic font-serif">
            &ldquo;Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya...&rdquo;
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-900 bg-emerald-100/70 px-4 py-2 rounded-full border border-emerald-300">
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
