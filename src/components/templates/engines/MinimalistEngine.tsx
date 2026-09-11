"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
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

export const MinimalistEngine: React.FC<DedicatedTemplateProps> = ({
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

  const formattedDate = new Date(eventDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const activeSession = sessions[selectedSession] || sessions.s1;

  return (
    <div
      className="relative w-full min-h-screen font-sans text-neutral-900 bg-[#FAFAFA] overflow-x-hidden selection:bg-neutral-900 selection:text-white"
    >
      {/* ===================== SECTION 1: EDITORIAL BESPOKE HERO (#hero) ===================== */}
      <section
        id="hero"
        className="min-h-screen flex flex-col justify-between p-8 sm:p-12 border-b border-neutral-200"
      >
        <div className="flex items-center justify-between text-xs tracking-[0.25em] uppercase font-serif text-neutral-500 font-semibold">
          <span>VOLUME 01</span>
          <span>KEBUMEN EDITION</span>
        </div>

        <div className="my-auto space-y-8 py-8">
          <div className="space-y-3 text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-serif block font-semibold">
              EDITORIAL WEDDING
            </span>
            <h1 className="text-4xl sm:text-6xl font-serif tracking-tight leading-none text-neutral-950 font-normal">
              {bride.name}
              <span className="italic font-light text-neutral-400 block sm:inline"> &amp; </span>
              {groom.name}
            </h1>
          </div>

          <div className="aspect-[4/5] w-full max-w-sm mx-auto overflow-hidden bg-neutral-100 border border-neutral-200 grayscale contrast-125 shadow-2xl">
            <img
              src={bride.photo || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600"}
              alt="Editorial Cover"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between text-xs text-neutral-600 border-t border-neutral-200">
          <span className="font-serif tracking-wider">{formattedDate}</span>
          <span className="uppercase tracking-widest font-serif">{activeSession.venueName}</span>
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
