// src/components/templates/engines/CuteIllustratedEngine.tsx
"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { ConfettiCanvas } from "@/components/invitation/canvas/ConfettiCanvas";
import { ThemedAssetOrnament } from "@/components/invitation/ornaments";
import { getThemeAssets } from "@/lib/templates/themeAssetRegistry";
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

  // Curated pure vector SVG assets for this Cute Illustrated theme
  const assetBundle = getThemeAssets(theme?.id, "cute-illustrated");

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

      {/* Subtle Pastel Background Overlay */}
      {assetBundle.backgroundGradient && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${assetBundle.backgroundGradient})` }}
        />
      )}

      {/* ===================== SECTION 1: CUTE ILLUSTRATED HERO (#hero) ===================== */}
      <section
        id="hero"
        className="relative min-h-[92vh] flex flex-col items-center justify-center p-6 text-center space-y-5 pt-12 z-10"
      >
        {/* Corner Accents */}
        {assetBundle.cornerFiligree && (
          <>
            <ThemedAssetOrnament
              src={assetBundle.cornerFiligree}
              className="absolute top-4 left-4 w-12 h-12 opacity-60 pointer-events-none"
              alt="Corner Left"
            />
            <ThemedAssetOrnament
              src={assetBundle.cornerFiligree}
              flipHorizontal
              className="absolute top-4 right-4 w-12 h-12 opacity-60 pointer-events-none"
              alt="Corner Right"
            />
          </>
        )}

        {/* Hero Centerpiece: Pastel Illustrated Bouquet */}
        <div className="w-full flex justify-center my-1">
          <ThemedAssetOrnament
            src={assetBundle.heroCenterpiece}
            priority
            className="w-36 sm:w-48 h-auto filter drop-shadow-sm"
            alt="Cute Illustrated Centerpiece"
          />
        </div>

        {/* Storybook Mascot SVG + Cute Mascot Badge */}
        <div className="relative inline-flex items-center justify-center p-4 bg-white rounded-full shadow-xl border-4 border-pink-200">
          <CuteStorybookMascotSvg className="w-12 h-12 text-pink-500" />
          <div className="absolute -bottom-2 -right-2 flex items-center -space-x-2 text-2xl">
            <span className="p-1.5 bg-pink-100 rounded-full border-2 border-pink-300 shadow-sm">👰🏻‍♀️</span>
            <span className="p-1.5 bg-blue-100 rounded-full border-2 border-blue-300 shadow-sm">🤵🏻‍♂️</span>
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

        {/* Thematic Section Divider */}
        <div className="w-full flex justify-center my-1">
          <ThemedAssetOrnament
            src={assetBundle.sectionDivider}
            className="w-36 sm:w-48 h-auto opacity-75"
            alt="Cute Illustrated Divider"
          />
        </div>

        {/* Chubby Pill Prewed Photo Card */}
        <div className="relative p-2.5 bg-white rounded-[2.5rem] shadow-xl border-4 border-pink-100 max-w-[280px] w-full mx-auto transition-transform hover:scale-[1.01]">
          <img
            src={bride.photo || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600"}
            alt="Couple"
            className="w-full aspect-[4/5] object-cover object-top rounded-[2rem]"
          />
          <div className="pt-3 pb-1 text-center font-bold text-xs text-pink-600 uppercase tracking-wider">
            {formattedDate}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-pink-700 bg-white px-4 py-2 rounded-full border-2 border-pink-200 shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-pink-500" />
          <span>{activeSession.venueName}</span>
        </div>
      </section>

      {/* ===================== MODULAR BODY SECTIONS ===================== */}
      {/* 2. Mempelai */}
      <CoupleSectionDispatcher bride={bride} groom={groom} theme={theme} />

      {/* Thematic Divider */}
      <div className="w-full flex justify-center py-4">
        <ThemedAssetOrnament
          src={assetBundle.sectionDivider}
          className="w-36 sm:w-48 h-auto opacity-60"
          alt="Section Divider"
        />
      </div>

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

      {/* Thematic Divider */}
      <div className="w-full flex justify-center py-4">
        <ThemedAssetOrnament
          src={assetBundle.sectionDivider}
          className="w-36 sm:w-48 h-auto opacity-60"
          alt="Section Divider"
        />
      </div>

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

      {/* Cute Seal Outro */}
      {assetBundle.closingSeal && (
        <div className="w-full flex justify-center py-6">
          <ThemedAssetOrnament
            src={assetBundle.closingSeal}
            className="w-16 h-16 sm:w-18 sm:h-18 filter drop-shadow-sm"
            alt="Closing Seal"
          />
        </div>
      )}

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
