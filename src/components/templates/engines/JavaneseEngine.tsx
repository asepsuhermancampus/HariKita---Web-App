"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { GoldenDustCanvas } from "@/components/invitation/canvas/GoldenDustCanvas";
import { OrnamentGunungan } from "@/components/invitation/ornaments/OrnamentGunungan";
import {
  heritageParangSvg,
  javaneseAzuriteSvg,
  javaneseTeakSvg,
  javaneseIvorySvg,
  javaneseCrimsonSvg,
  javaneseGarudaSvg,
  javaneseKebumenSvg,
  javanesePearlSvg,
} from "@/components/invitation/svg";
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
  onCloseInvitation,
}) => {
  const [selectedSession] = useState<"s1" | "s2" | "s3">(activeSessionCode || "s1");
  const goldColor = theme?.colors?.primary || "#D4AF37";
  const accentColor = theme?.colors?.accent || "#CCA873";
  const themeId = theme?.id;

  const formattedDate = new Date(eventDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const activeSession = sessions[selectedSession] || sessions.s1;

  // Dynamic Theme-Specific SVG Hero Header
  const renderHeroHeader = () => {
    switch (themeId) {
      case "javanese-kebumen":
        return <javaneseKebumenSvg.KebumenHeritageWreath color={goldColor} secondaryColor={accentColor} size={150} />;
      case "heritage-parang":
        return <heritageParangSvg.KeratonCrownWreath color={goldColor} secondaryColor={accentColor} size={150} />;
      case "javanese-azurite":
        return <javaneseAzuriteSvg.AzuriteCloudWreath color={goldColor} secondaryColor={theme?.colors?.accent || "#2A4B7C"} size={150} />;
      case "javanese-teak":
        return <javaneseTeakSvg.TeakGununganWreath color={goldColor} secondaryColor={theme?.colors?.accent || "#4A2E1B"} size={150} />;
      case "javanese-ivory":
        return <javaneseIvorySvg.IvoryPradaWreath color={goldColor} secondaryColor={theme?.colors?.accent || "#EFEBE4"} size={150} />;
      case "javanese-crimson":
        return <javaneseCrimsonSvg.CrimsonPalaceWreath color={goldColor} secondaryColor={theme?.colors?.accent || "#7A1C28"} size={150} />;
      case "javanese-garuda":
        return <javaneseGarudaSvg.GoldenGarudaWreath color={goldColor} secondaryColor={theme?.colors?.accent || "#8F6B1E"} size={150} />;
      case "javanese-pearl":
        return <javanesePearlSvg.WhitePearlWreath color={goldColor} secondaryColor={theme?.colors?.accent || "#FDFCF7"} size={150} />;
      default:
        return <OrnamentGunungan color={goldColor} size={150} className="filter drop-shadow-[0_4px_12px_rgba(204,168,115,0.4)]" />;
    }
  };

  // Dynamic Theme-Specific Section Divider
  const renderSectionDivider = () => {
    switch (themeId) {
      case "javanese-kebumen":
        return <javaneseKebumenSvg.BatikJagatanDivider color={goldColor} secondaryColor={accentColor} size={200} />;
      case "heritage-parang":
        return <heritageParangSvg.GoldenPusakaDivider color={goldColor} secondaryColor={accentColor} size={200} />;
      case "javanese-azurite":
        return <javaneseAzuriteSvg.CarvedScrollDivider color={goldColor} secondaryColor={accentColor} size={200} />;
      case "javanese-teak":
        return <javaneseTeakSvg.TeakCarvedDivider color={goldColor} secondaryColor={accentColor} size={200} />;
      case "javanese-ivory":
        return <javaneseIvorySvg.RoyalPradaDivider color={goldColor} secondaryColor={accentColor} size={200} />;
      case "javanese-crimson":
        return <javaneseCrimsonSvg.RoyalBatikDivider color={goldColor} secondaryColor={accentColor} size={200} />;
      case "javanese-garuda":
        return <javaneseGarudaSvg.GoldenParangDivider color={goldColor} secondaryColor={accentColor} size={200} />;
      case "javanese-pearl":
        return <javanesePearlSvg.RonceanMelatiDivider color={goldColor} secondaryColor={accentColor} size={200} />;
      default:
        return null;
    }
  };

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
        {/* Dynamic Gunungan / Wreath Gate Header */}
        <div className="relative flex items-center justify-center">
          {renderHeroHeader()}
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
      {renderSectionDivider() && <div className="py-4 flex justify-center">{renderSectionDivider()}</div>}

      {/* 2. Mempelai */}
      <CoupleSectionDispatcher bride={bride} groom={groom} theme={theme} />

      {renderSectionDivider() && <div className="py-4 flex justify-center">{renderSectionDivider()}</div>}

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

      {renderSectionDivider() && <div className="py-4 flex justify-center">{renderSectionDivider()}</div>}

      {/* 5. Sweet Memories / Kisah Cinta */}
      <StoriesSectionDispatcher stories={storyTimeline} theme={theme} />

      {renderSectionDivider() && <div className="py-4 flex justify-center">{renderSectionDivider()}</div>}

      {/* 6. Galeri Foto */}
      <GallerySectionDispatcher photos={galleryPhotos} theme={theme} />

      {renderSectionDivider() && <div className="py-4 flex justify-center">{renderSectionDivider()}</div>}

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
