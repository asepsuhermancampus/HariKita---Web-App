"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { FloatingPetalsCanvas } from "@/components/invitation/canvas/FloatingPetalsCanvas";
import { OrnamentFloralWreath } from "@/components/invitation/ornaments/OrnamentFloralWreath";
import {
  fiorellaSvg,
  serenadeOliveSvg,
  serenadeDustyRoseSvg,
  serenadeDeepMossSvg,
  celestineSvg,
  botanicaTerracottaSvg,
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
  couplePhoto,
  onCloseInvitation,
  giftInfo,
  initialWishes,
}) => {
  const [selectedSession] = useState<"s1" | "s2" | "s3">(activeSessionCode || "s1");
  const primaryColor = theme?.colors?.primary || "#5C6F57";
  const accentColor = theme?.colors?.accent || "#A3865E";
  const themeId = theme?.id;

  const formattedDate = new Date(eventDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const activeSession = sessions[selectedSession] || sessions.s1;

  // Dynamic Theme-Specific SVG Hero Wreath
  const renderHeroWreath = () => {
    switch (themeId) {
      case "fiorella":
        return <fiorellaSvg.FiorellaSpringWreath color={primaryColor} secondaryColor={accentColor} size={140} />;
      case "serenade-olive":
        return <serenadeOliveSvg.OliveCrownWreath color={primaryColor} secondaryColor={accentColor} size={140} />;
      case "serenade-dusty-rose":
        return <serenadeDustyRoseSvg.DustyRoseWreath color={primaryColor} secondaryColor={accentColor} size={140} />;
      case "serenade-deep-moss":
        return <serenadeDeepMossSvg.MossFernWreath color={primaryColor} secondaryColor={accentColor} size={140} />;
      case "celestine":
        return <celestineSvg.CelestineCrownWreath color={primaryColor} secondaryColor={accentColor} size={140} />;
      case "botanica-terracotta":
        return <botanicaTerracottaSvg.TerracottaPoppyWreath color={primaryColor} secondaryColor={accentColor} size={140} />;
      default:
        return <OrnamentFloralWreath color={primaryColor} size={130} className="animate-spin-slow opacity-80" />;
    }
  };

  // Dynamic Theme-Specific Section Divider
  const renderSectionDivider = () => {
    switch (themeId) {
      case "fiorella":
        return <fiorellaSvg.FiorellaWaveDivider color={primaryColor} secondaryColor={accentColor} size={200} />;
      case "serenade-olive":
        return <serenadeOliveSvg.OliveLineDivider color={primaryColor} secondaryColor={accentColor} size={200} />;
      case "serenade-dusty-rose":
        return <serenadeDustyRoseSvg.RoseScrollDivider color={primaryColor} secondaryColor={accentColor} size={200} />;
      case "serenade-deep-moss":
        return <serenadeDeepMossSvg.ForestMossDivider color={primaryColor} secondaryColor={accentColor} size={200} />;
      case "celestine":
        return <celestineSvg.CelestialLeafDivider color={primaryColor} secondaryColor={accentColor} size={200} />;
      case "botanica-terracotta":
        return <botanicaTerracottaSvg.EarthyTerracottaDivider color={primaryColor} secondaryColor={accentColor} size={200} />;
      default:
        return null;
    }
  };

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

      {/* 2. Theme-Specific Decorative Corner Accents */}
      {themeId === "serenade-dusty-rose" ? (
        <>
          <serenadeDustyRoseSvg.LaceFlowerCorner color={primaryColor} secondaryColor={accentColor} size={54} className="absolute top-2 left-2 z-20 pointer-events-none opacity-50" />
          <serenadeDustyRoseSvg.LaceFlowerCorner color={primaryColor} secondaryColor={accentColor} size={54} className="absolute top-2 right-2 z-20 pointer-events-none opacity-50 -scale-x-100" />
        </>
      ) : themeId === "serenade-deep-moss" ? (
        <>
          <serenadeDeepMossSvg.WildFernCorner color={primaryColor} secondaryColor={accentColor} size={54} className="absolute top-2 left-2 z-20 pointer-events-none opacity-50" />
          <serenadeDeepMossSvg.WildFernCorner color={primaryColor} secondaryColor={accentColor} size={54} className="absolute top-2 right-2 z-20 pointer-events-none opacity-50 -scale-x-100" />
        </>
      ) : themeId === "fiorella" ? (
        <fiorellaSvg.FiorellaButterfly color={primaryColor} secondaryColor={accentColor} size={42} className="absolute top-4 left-4 z-20 pointer-events-none opacity-60 animate-pulse" />
      ) : (
        <>
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
        </>
      )}

      {/* ===================== SECTION 1: BESPOKE HERO (#hero) ===================== */}
      <section
        id="hero"
        className="relative min-h-[90vh] flex flex-col items-center justify-center p-6 text-center space-y-6 pt-12"
      >
        <div className="relative inline-flex items-center justify-center w-[140px] h-[140px] mx-auto">
          {renderHeroWreath()}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              className="text-3xl font-serif font-bold tracking-wider"
              style={{ color: accentColor }}
            >
              {bride.name.charAt(0)} &amp; {groom.name.charAt(0)}
            </span>
          </div>
        </div>

        <div className="space-y-2.5 max-w-md mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-serif font-bold uppercase tracking-widest border"

            style={{
              backgroundColor: `${primaryColor}14`,
              borderColor: `${primaryColor}30`,
              color: primaryColor,
            }}
          >
            <Sparkles className="w-3 h-3" style={{ color: theme?.colors?.accent || primaryColor }} />
            <span>The Wedding of</span>
            <Sparkles className="w-3 h-3" style={{ color: theme?.colors?.accent || primaryColor }} />
          </div>
          <h1
            className="text-3xl sm:text-4xl font-serif font-bold tracking-wide leading-tight"
            style={{ color: theme?.colors?.text || "#261F23" }}
          >
            {bride.name} <span className="font-light" style={{ color: theme?.colors?.accent || primaryColor }}>&amp;</span> {groom.name}
          </h1>
          <p
            className="text-xs sm:text-sm font-serif italic max-w-sm mx-auto leading-relaxed"
            style={{ color: theme?.colors?.text ? `${theme.colors.text}B3` : "#524348" }}
          >
            &ldquo;Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu...&rdquo;
          </p>
        </div>

        {/* Polaroid Style Couple Hero Card (Straight Centered Luxury Frame) */}
        <div className="relative p-2.5 bg-white shadow-xl rounded-2xl border border-stone-200/80 max-w-[280px] w-full mx-auto transition-transform duration-500 hover:scale-[1.01]">
          <img
            src={couplePhoto || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800"}
            alt={`Potret Pre-Wedding ${bride.name} & ${groom.name}`}
            className="w-full aspect-[4/5] object-cover object-top rounded-xl"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800";
            }}
          />
          <div
            className="pt-3 pb-1 text-center font-serif text-xs sm:text-sm font-semibold tracking-wider"
            style={{ color: theme?.colors?.text || "#261F23" }}
          >
            {formattedDate}
          </div>
        </div>

        <div
          className="inline-flex items-center gap-2 text-xs font-serif px-4 py-2 rounded-full border shadow-2xs"
          style={{
            backgroundColor: `${primaryColor}0D`,
            borderColor: `${primaryColor}25`,
            color: theme?.colors?.text || "#261F23",
          }}
        >
          <MapPin className="w-3.5 h-3.5" style={{ color: theme?.colors?.accent || primaryColor }} />
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
