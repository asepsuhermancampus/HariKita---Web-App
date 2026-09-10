"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { ConfettiCanvas } from "@/components/invitation/canvas/ConfettiCanvas";
import { Heart, MapPin } from "lucide-react";
import { CuteStorybookMascotSvg } from "@/components/invitation/svg";
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

export const CuteIllustratedEngine: React.FC<DedicatedTemplateProps> = ({
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
  const activeSession = sessions[selectedSession] || sessions.s1;

  const formattedDate = new Date(eventDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="relative w-full min-h-screen text-slate-800 font-sans overflow-x-hidden selection:bg-pink-300"
      style={{
        backgroundColor: "#FFF8F5",
        backgroundImage: "radial-gradient(#FFE5D9 1.5px, transparent 1.5px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* 1. Cheerful Party Confetti Canvas */}
      <ConfettiCanvas className="pointer-events-none opacity-40 z-10" />

      {/* ===================== SECTION 1: CUTE ILLUSTRATED HERO (#hero) ===================== */}
      <section
        id="hero"
        className="relative min-h-[92vh] flex flex-col items-center justify-center p-6 text-center space-y-6 pt-12"
      >
        {/* Storybook Mascot SVG + Cute Mascot Badge */}
        <div className="relative inline-flex items-center justify-center p-4 bg-white rounded-full shadow-xl border-4 border-pink-200">
          <CuteStorybookMascotSvg className="w-14 h-14 text-pink-500" />
          <div className="absolute -bottom-2 -right-2 flex items-center -space-x-2 text-2xl">
            <span className="p-2 bg-pink-100 rounded-full border-2 border-pink-300 shadow-sm">👰🏻‍♀️</span>
            <span className="p-2 bg-blue-100 rounded-full border-2 border-blue-300 shadow-sm">🤵🏻‍♂️</span>
          </div>
        </div>

        <div className="space-y-2 max-w-xs">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-pink-100 text-pink-700 border-2 border-pink-200 shadow-sm">
            <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500 animate-bounce" />
            <span>We Are Getting Married!</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight text-slate-900">
            {bride.name} <span className="text-pink-500">&amp;</span> {groom.name}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Yuk ramaikan hari bahagia kami berdua di Kebumen! 🎉
          </p>
        </div>

        {/* Chubby Pill Prewed Photo Card */}
        <div className="relative p-3 bg-white rounded-[2.5rem] shadow-xl border-4 border-pink-100 max-w-[280px] w-full transform hover:rotate-1 transition-transform">
          <img
            src={bride.photo || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600"}
            alt="Couple"
            className="w-full h-64 object-cover rounded-[2rem]"
          />
          <div className="pt-3 pb-1 text-center font-bold text-xs text-pink-600 uppercase tracking-wider">
            {formattedDate}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-pink-700 bg-white px-4 py-2 rounded-full border-2 border-pink-200 shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-pink-500" />
          <span className="font-bold">{activeSession.venueName}</span>
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
