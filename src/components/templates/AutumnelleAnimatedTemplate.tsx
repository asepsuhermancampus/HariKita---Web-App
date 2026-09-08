"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { AutumnLeavesCanvas } from "@/components/invitation/canvas/AutumnLeavesCanvas";
import { MusicPlayer } from "@/components/invitation/MusicPlayer";
import { EventSchedule } from "@/components/invitation/EventSchedule";
import { LoveStoryTimeline } from "@/components/invitation/LoveStoryTimeline";
import { PhotoGallery } from "@/components/invitation/PhotoGallery";
import { DigitalGiftModal } from "@/components/invitation/DigitalGiftModal";
import { RsvpGuestbookForm } from "@/components/invitation/RsvpGuestbookForm";
import { ReceptionQrCheckin } from "@/components/invitation/ReceptionQrCheckin";
import { MailOpen, Calendar, MapPin, Heart, Sparkles, Instagram } from "lucide-react";
import Image from "next/image";

export const AutumnelleAnimatedTemplate: React.FC<DedicatedTemplateProps> = ({
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

  const formattedDate = new Date(eventDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="min-h-screen relative font-sans transition-colors duration-500 overflow-x-hidden selection:bg-amber-200"
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
      }}
    >
      {/* 1. Animated Particle Canvas */}
      <AutumnLeavesCanvas />

      {/* 2. Floating Music Player */}
      <MusicPlayer audioUrl={musicUrl} autoPlayTriggered={isOpened} />

      {/* 3. Bespoke Illustrated Envelope Cover */}
      {!isOpened && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-[#FAF4EE] to-[#EFE2D3] animate-fadeIn">
          <div
            className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border-2 border-[#EAD6C3] text-center relative overflow-hidden transform transition-all hover:scale-[1.01]"
            style={{ borderColor: theme.colors.border }}
          >
            {/* Top decorative seal */}
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-[#C86D51] to-[#E2A76F] flex items-center justify-center shadow-md mb-6 animate-pulse">
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <p className="text-xs uppercase tracking-[0.25em] text-[#C86D51] font-semibold mb-2">
              Wedding Invitation • {theme.title}
            </p>
            <h1 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-[#3D2B1F] mb-3">
              {bride.name} & {groom.name}
            </h1>
            <p className="text-xs text-[#6B5344] mb-6 flex items-center justify-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#C86D51]" />
              {formattedDate}
            </p>

            {/* Recipient box */}
            <div className="bg-[#FAF4EE] rounded-2xl p-4 mb-8 border border-[#EAD6C3]">
              <p className="text-[11px] uppercase tracking-wider text-[#8C705F] mb-1">
                Kepada Yth. Bapak/Ibu/Saudara/i:
              </p>
              <p className="text-lg font-bold text-[#3D2B1F]">{guestName}</p>
              <p className="text-[11px] text-[#A68F80] mt-1">
                Sesi: <span className="font-semibold text-[#C86D51]">{sessions[activeSessionCode]?.title || "Tamu Undangan"}</span>
              </p>
            </div>

            {/* Open Button */}
            <button
              onClick={() => setIsOpened(true)}
              className="w-full py-4 px-6 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center gap-3 transition-all hover:brightness-105 active:scale-95"
              style={{
                backgroundColor: theme.colors.primary,
                boxShadow: `0 8px 24px -6px ${theme.colors.primary}66`,
              }}
            >
              <MailOpen className="w-5 h-5 animate-bounce" />
              <span>Buka Undangan</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="relative z-20 max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* Hero Header */}
        <header className="text-center pt-8 space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#C86D51]/10 text-[#C86D51] text-xs font-bold tracking-widest uppercase mb-2">
            The Wedding Of
          </div>
          <h1 className="text-5xl sm:text-6xl font-serif-luxury font-bold tracking-tight text-[#3D2B1F]">
            {bride.name} <span className="text-[#C86D51] font-light">&</span> {groom.name}
          </h1>
          <p className="text-sm font-medium tracking-wider text-[#7C6354] uppercase">
            {formattedDate} • Kebumen, Jawa Tengah
          </p>
        </header>

        {/* Polaroid Style Couple Showcase */}
        <section className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-[#EAD6C3] space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#3D2B1F]">
              Mempelai Bahagia
            </h2>
            <p className="text-xs sm:text-sm text-[#7C6354] max-w-md mx-auto">
              Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud melangsungkan pernikahan putra-putri kami:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Bride Polaroid */}
            <div className="bg-white p-4 rounded-2xl shadow-md border border-[#EAD6C3] transform -rotate-1 hover:rotate-0 transition-transform duration-300 text-center space-y-3">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-neutral-100">
                <Image
                  src={bride.photo}
                  alt={bride.fullName}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-serif-luxury font-bold text-[#3D2B1F]">
                {bride.fullName}
              </h3>
              <p className="text-xs text-[#7C6354]">
                Putri dari Bpk. {bride.father} & Ibu {bride.mother}
              </p>
              {bride.instagram && (
                <a
                  href={`https://instagram.com/${bride.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#C86D51] hover:underline"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  @{bride.instagram}
                </a>
              )}
            </div>

            {/* Groom Polaroid */}
            <div className="bg-white p-4 rounded-2xl shadow-md border border-[#EAD6C3] transform rotate-1 hover:rotate-0 transition-transform duration-300 text-center space-y-3">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-neutral-100">
                <Image
                  src={groom.photo}
                  alt={groom.fullName}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-serif-luxury font-bold text-[#3D2B1F]">
                {groom.fullName}
              </h3>
              <p className="text-xs text-[#7C6354]">
                Putra dari Bpk. {groom.father} & Ibu {groom.mother}
              </p>
              {groom.instagram && (
                <a
                  href={`https://instagram.com/${groom.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#C86D51] hover:underline"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  @{groom.instagram}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Schedule & Venue Card */}
        <section className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-[#EAD6C3]">
          <EventSchedule
            eventDate={eventDate}
            sessions={sessions}
            activeSessionCode={activeSessionCode}
            googleMapsUrl={googleMapsUrl}
          />
        </section>

        {/* Story Timeline */}
        <section className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-[#EAD6C3]">
          <LoveStoryTimeline stories={storyTimeline} />
        </section>

        {/* Gallery */}
        <section className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-[#EAD6C3]">
          <PhotoGallery photos={galleryPhotos} />
        </section>

        {/* Digital Gift */}
        <section className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-[#EAD6C3]">
          <DigitalGiftModal
            banks={giftInfo.banks}
            physicalGiftAddress={giftInfo.physicalGiftAddress}
          />
        </section>

        {/* RSVP & Wishes */}
        <section className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-[#EAD6C3]">
          <RsvpGuestbookForm
            invitationId={invitationId}
            defaultGuestName={guestName !== "Bapak/Ibu/Saudara/i" ? guestName : ""}
            activeSessionCode={activeSessionCode}
            initialWishes={initialWishes}
          />
        </section>

        {/* Reception Desk QR Checkin */}
        <section className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-[#EAD6C3]">
          <ReceptionQrCheckin guestName={guestName} sessionCode={activeSessionCode} />
        </section>

        {/* Footer */}
        <footer className="text-center py-8 space-y-2 border-t border-[#EAD6C3]">
          <p className="text-xs text-[#7C6354]">
            Ungkapan terima kasih yang tulus dari kami sekeluarga
          </p>
          <p className="text-xl font-serif-luxury font-bold text-[#3D2B1F]">
            {bride.name} & {groom.name}
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#A68F80] pt-2">
            <span>Dirangkai dengan cinta di Kebumen melalui HariKita</span>
            <Heart className="w-3.5 h-3.5 text-[#C86D51] fill-[#C86D51]" />
          </div>
        </footer>
      </main>
    </div>
  );
};
