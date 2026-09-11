// src/components/templates/engines/RusticEngine.tsx
"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { FloatingPetalsCanvas } from "@/components/invitation/canvas/FloatingPetalsCanvas";
import { ThemedAssetOrnament } from "@/components/invitation/ornaments";
import { getThemeAssets } from "@/lib/templates/themeAssetRegistry";
import { MapPin, Stamp } from "lucide-react";
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

export const RusticEngine: React.FC<DedicatedTemplateProps> = ({
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

  // Curated pure vector SVG assets for this Rustic theme
  const assetBundle = getThemeAssets(theme?.id, "rustic");

  return (
    <div
      className="relative w-full min-h-screen font-serif overflow-x-hidden selection:bg-amber-800 selection:text-amber-100"
      style={{
        backgroundColor: theme?.colors?.background || "#F5EFE6",
        color: theme?.colors?.text || "#3E2723",
      }}
    >
      {/* 1. Falling Dried Leaves / Pampas Canvas */}
      <FloatingPetalsCanvas className="pointer-events-none opacity-40 z-10" />

      {/* Subtle Kraft Paper Texture Background */}
      {assetBundle.backgroundGradient && (
        <div
          className="absolute inset-0 pointer-events-none opacity-25 bg-cover bg-center"
          style={{ backgroundImage: `url(${assetBundle.backgroundGradient})` }}
        />
      )}

      {/* ===================== SECTION 1: BESPOKE RUSTIC HERO (#hero) ===================== */}
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

        {/* Hero Centerpiece: Dry Terracotta / Sage Bouquet */}
        <div className="w-full flex justify-center my-1">
          <ThemedAssetOrnament
            src={assetBundle.heroCenterpiece}
            priority
            className="w-40 sm:w-52 h-auto filter drop-shadow-sm"
            alt="Rustic Bouquet Centerpiece"
          />
        </div>

        {/* Postal Stamp Cancellation Mark */}
        <div className="relative inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-amber-800/40 rounded-xl text-amber-900 bg-amber-50/50">
          <Stamp className="w-5 h-5 text-amber-800" />
          <span className="text-xs font-serif font-bold tracking-[0.2em] uppercase">
            POSTAGE PAID • KEBUMEN 2026
          </span>
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-800 font-serif font-semibold">
            RUSTIC BOTANICAL LOVE
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-wide leading-tight text-amber-950">
            {bride.name} <span className="font-light text-amber-700">&amp;</span> {groom.name}
          </h1>
          <p className="text-xs sm:text-sm text-amber-800/80 italic font-serif">
            &ldquo;In all the world, there is no heart for me like yours.&rdquo;
          </p>
        </div>

        {/* Thematic Rustic Section Divider */}
        <div className="w-full flex justify-center my-1">
          <ThemedAssetOrnament
            src={assetBundle.sectionDivider}
            className="w-36 sm:w-48 h-auto opacity-75"
            alt="Rustic Divider"
          />
        </div>

        {/* Vintage Postcard Styled Hero Couple Photo */}
        <div className="relative p-2.5 bg-amber-100/80 shadow-xl rounded-2xl border-2 border-amber-800/20 max-w-[280px] w-full mx-auto transition-transform duration-500 hover:scale-[1.01]">
          <img
            src={bride.photo || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600"}
            alt="Couple"
            className="w-full aspect-[4/5] object-cover object-top rounded-xl filter sepia-[0.15]"
          />
          <div className="pt-3 pb-1 text-center font-serif text-xs sm:text-sm text-amber-900 tracking-wider">
            {formattedDate}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-amber-900 bg-amber-200/50 px-4 py-2 rounded-full border border-amber-300">
          <MapPin className="w-3.5 h-3.5 text-amber-700" />
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

      {/* Vintage Wax Stamp Outro */}
      {assetBundle.closingSeal && (
        <div className="w-full flex justify-center py-6">
          <ThemedAssetOrnament
            src={assetBundle.closingSeal}
            className="w-18 h-18 sm:w-20 sm:h-20 filter drop-shadow-md"
            alt="Rustic Seal"
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
