"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { MusicPlayer } from "@/components/invitation/MusicPlayer";
import { OrnamentMinimalLine } from "@/components/invitation/ornaments/OrnamentMinimalLine";
import { EventSchedule } from "@/components/invitation/EventSchedule";
import { LoveStoryTimeline } from "@/components/invitation/LoveStoryTimeline";
import { PhotoGallery } from "@/components/invitation/PhotoGallery";
import { DigitalGiftModal } from "@/components/invitation/DigitalGiftModal";
import { RsvpGuestbookForm } from "@/components/invitation/RsvpGuestbookForm";
import { ReceptionQrCheckin } from "@/components/invitation/ReceptionQrCheckin";
import { Calendar, ArrowRight, Instagram } from "lucide-react";
import Image from "next/image";

export const SeraphicusMinimalistTemplate: React.FC<DedicatedTemplateProps> = ({
  invitationId,
  theme,
  guestName,
  activeSessionCode,
  bride,
  groom,
  eventDate,
  sessions,
  googleMapsUrl,
  cartoonMapUrl,
  musicUrl,
  storyTimeline,
  galleryPhotos,
  giftInfo,
  initialWishes,
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const [curtainActive, setCurtainActive] = useState(false);

  const handleOpen = () => {
    setCurtainActive(true);
    setTimeout(() => {
      setIsOpened(true);
    }, 900);
  };

  const formattedDate = new Date(eventDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="min-h-screen relative font-serif-luxury bg-[#FAF8F5] text-[#1F1C1A] selection:bg-neutral-800 selection:text-white overflow-x-hidden"
    >
      {/* 1. Floating Music Controller */}
      <MusicPlayer audioUrl={musicUrl} autoPlayTriggered={isOpened} />

      {/* 2. Split Curtain Reveal Cover */}
      {!isOpened && (
        <div className="fixed inset-0 z-50 flex overflow-hidden">
          {/* Left Curtain Wing */}
          <div
            className={`w-1/2 h-full bg-[#1A1817] text-[#FAF8F5] p-6 sm:p-12 flex flex-col justify-between transition-transform duration-1000 ease-in-out border-r border-white/10 ${
              curtainActive ? "-translate-x-full" : "translate-x-0"
            }`}
          >
            <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-sans">
              Vol. I • Editorial Edition
            </div>
            <div className="space-y-4">
              <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 font-sans block">
                The Union Of
              </span>
              <h1 className="text-4xl sm:text-6xl font-light tracking-tight leading-none">
                {bride.name}
              </h1>
            </div>
            <div className="text-[11px] text-neutral-400 font-sans">
              Kebumen • {new Date(eventDate).getFullYear()}
            </div>
          </div>

          {/* Right Curtain Wing */}
          <div
            className={`w-1/2 h-full bg-[#1A1817] text-[#FAF8F5] p-6 sm:p-12 flex flex-col justify-between transition-transform duration-1000 ease-in-out ${
              curtainActive ? "translate-x-full" : "translate-x-0"
            }`}
          >
            <div className="text-right text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-sans">
              {theme.title}
            </div>
            <div className="space-y-4">
              <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 font-sans block text-neutral-400">
                And
              </span>
              <h1 className="text-4xl sm:text-6xl font-light tracking-tight leading-none text-neutral-300">
                {groom.name}
              </h1>
            </div>
            <div className="text-right text-[11px] text-neutral-400 font-sans">
              {sessions[activeSessionCode]?.title || "Official Invitation"}
            </div>
          </div>

          {/* Center Centerpiece Trigger Button */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 transition-opacity duration-500 text-center w-80 max-w-[90vw] ${
              curtainActive ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
            }`}
          >
            <div className="bg-[#242120]/90 backdrop-blur-xl border border-white/20 p-6 rounded-none shadow-2xl text-center space-y-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-sans">
                Exclusive Invitation For:
              </p>
              <p className="text-xl font-medium tracking-wide text-white">{guestName}</p>
              <div className="h-[1px] w-12 bg-white/30 mx-auto" />
              <button
                onClick={handleOpen}
                className="w-full py-3 px-4 bg-white text-black font-sans text-xs uppercase tracking-[0.2em] font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
              >
                <span>Enter Exhibition</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Editorial Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-16 sm:py-24 space-y-24">
        {/* Editorial Cover Banner */}
        <header className="text-center space-y-6 pt-8">
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-500 font-sans">
            Formal Wedding Announcement
          </p>
          <div className="space-y-2">
            <h1 className="text-6xl sm:text-8xl font-light tracking-tight leading-none">
              {bride.name}
            </h1>
            <p className="text-xl font-light text-neutral-400">&mdash; & &mdash;</p>
            <h1 className="text-6xl sm:text-8xl font-light tracking-tight leading-none text-neutral-700">
              {groom.name}
            </h1>
          </div>
          <OrnamentMinimalLine className="max-w-xs mx-auto" color="#1C1917" />
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-600 font-sans">
            {formattedDate} &bull; Kebumen Regency
          </p>
        </header>

        {/* Asymmetrical Couple Showcase */}
        <section className="space-y-16">
          <div className="border-t border-b border-black/15 py-4 flex items-center justify-between font-sans text-xs uppercase tracking-[0.2em] text-neutral-500">
            <span>Section 01</span>
            <span>The Union of Two Souls</span>
            <span>Est. {new Date(eventDate).getFullYear()}</span>
          </div>

          {/* Bride Column */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 relative aspect-[3/4] bg-neutral-200 shadow-md">
              <Image
                src={bride.photo}
                alt={bride.fullName}
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div className="md:col-span-7 space-y-4 md:pl-6">
              <span className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-sans">
                The Bride
              </span>
              <h3 className="text-3xl sm:text-4xl font-normal tracking-tight">
                {bride.fullName}
              </h3>
              <p className="text-xs sm:text-sm font-sans text-neutral-600 leading-relaxed">
                Putri tercinta dari pasangan terhormat Bapak {bride.father} dan Ibu {bride.mother}.
              </p>
              {bride.instagram && (
                <a
                  href={`https://instagram.com/${bride.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-sans uppercase tracking-widest text-neutral-700 hover:text-black border-b border-neutral-400 pb-0.5"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>@{bride.instagram}</span>
                </a>
              )}
            </div>
          </div>

          <OrnamentMinimalLine className="max-w-md mx-auto" color="#1C1917" />

          {/* Groom Column */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-4 md:pr-6 md:order-1 order-2">
              <span className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-sans">
                The Groom
              </span>
              <h3 className="text-3xl sm:text-4xl font-normal tracking-tight">
                {groom.fullName}
              </h3>
              <p className="text-xs sm:text-sm font-sans text-neutral-600 leading-relaxed">
                Putra tercinta dari pasangan terhormat Bapak {groom.father} dan Ibu {groom.mother}.
              </p>
              {groom.instagram && (
                <a
                  href={`https://instagram.com/${groom.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-sans uppercase tracking-widest text-neutral-700 hover:text-black border-b border-neutral-400 pb-0.5"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>@{groom.instagram}</span>
                </a>
              )}
            </div>
            <div className="md:col-span-5 relative aspect-[3/4] bg-neutral-200 shadow-md md:order-2 order-1">
              <Image
                src={groom.photo}
                alt={groom.fullName}
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>
        </section>

        {/* Schedule & Logistics */}
        <section className="space-y-6">
          <div className="border-t border-b border-black/15 py-4 flex items-center justify-between font-sans text-xs uppercase tracking-[0.2em] text-neutral-500">
            <span>Section 02</span>
            <span>Event Protocol & Itinerary</span>
            <span>Kebumen</span>
          </div>
          <div className="bg-white p-8 sm:p-12 border border-black/10 shadow-sm">
            <EventSchedule
              eventDate={eventDate}
              sessions={sessions}
              activeSessionCode={activeSessionCode}
              googleMapsUrl={googleMapsUrl}
            />
          </div>
        </section>

        {/* Timeline */}
        <section className="space-y-6">
          <div className="border-t border-b border-black/15 py-4 flex items-center justify-between font-sans text-xs uppercase tracking-[0.2em] text-neutral-500">
            <span>Section 03</span>
            <span>Historical Journey</span>
            <span>Chronicles</span>
          </div>
          <div className="bg-white p-8 sm:p-12 border border-black/10 shadow-sm">
            <LoveStoryTimeline stories={storyTimeline} />
          </div>
        </section>

        {/* Gallery */}
        <section className="space-y-6">
          <div className="border-t border-b border-black/15 py-4 flex items-center justify-between font-sans text-xs uppercase tracking-[0.2em] text-neutral-500">
            <span>Section 04</span>
            <span>Visual Exhibition</span>
            <span>Portraits</span>
          </div>
          <div className="bg-white p-8 sm:p-12 border border-black/10 shadow-sm">
            <PhotoGallery photos={galleryPhotos} />
          </div>
        </section>

        {/* Gift & Transfer */}
        <section className="space-y-6">
          <div className="border-t border-b border-black/15 py-4 flex items-center justify-between font-sans text-xs uppercase tracking-[0.2em] text-neutral-500">
            <span>Section 05</span>
            <span>Tokens of Appreciation</span>
            <span>Registry</span>
          </div>
          <div className="bg-white p-8 sm:p-12 border border-black/10 shadow-sm">
            <DigitalGiftModal
              banks={giftInfo.banks}
              physicalGiftAddress={giftInfo.physicalGiftAddress}
            />
          </div>
        </section>

        {/* RSVP Form */}
        <section className="space-y-6">
          <div className="border-t border-b border-black/15 py-4 flex items-center justify-between font-sans text-xs uppercase tracking-[0.2em] text-neutral-500">
            <span>Section 06</span>
            <span>Confirmation & Well Wishes</span>
            <span>Registry</span>
          </div>
          <div className="bg-white p-8 sm:p-12 border border-black/10 shadow-sm">
            <RsvpGuestbookForm
              invitationId={invitationId}
              defaultGuestName={guestName !== "Bapak/Ibu/Saudara/i" ? guestName : ""}
              activeSessionCode={activeSessionCode}
              initialWishes={initialWishes}
            />
          </div>
        </section>

        {/* QR Checkin */}
        <section className="space-y-6">
          <div className="bg-white p-8 sm:p-12 border border-black/10 shadow-sm">
            <ReceptionQrCheckin guestName={guestName} sessionCode={activeSessionCode} />
          </div>
        </section>

        {/* Minimalist Footer */}
        <footer className="text-center py-16 space-y-4 border-t border-black/15">
          <p className="text-2xl font-light tracking-wide text-neutral-800">
            {bride.name} & {groom.name}
          </p>
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-sans">
            Kebumen, Central Java &bull; HariKita Platform
          </p>
        </footer>
      </main>
    </div>
  );
};
