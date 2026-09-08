"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { GoldenDustCanvas } from "@/components/invitation/canvas/GoldenDustCanvas";
import { MusicPlayer } from "@/components/invitation/MusicPlayer";
import { EventSchedule } from "@/components/invitation/EventSchedule";
import { LoveStoryTimeline } from "@/components/invitation/LoveStoryTimeline";
import { PhotoGallery } from "@/components/invitation/PhotoGallery";
import { DigitalGiftModal } from "@/components/invitation/DigitalGiftModal";
import { RsvpGuestbookForm } from "@/components/invitation/RsvpGuestbookForm";
import { ReceptionQrCheckin } from "@/components/invitation/ReceptionQrCheckin";
import { Calendar, ChevronUp, Sparkles, Heart, Instagram } from "lucide-react";
import Image from "next/image";

export const LunarMelodyPrewedTemplate: React.FC<DedicatedTemplateProps> = ({
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
  const [isSlidingUp, setIsSlidingUp] = useState(false);

  const handleOpen = () => {
    setIsSlidingUp(true);
    setTimeout(() => {
      setIsOpened(true);
    }, 800);
  };

  const formattedDate = new Date(eventDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const heroPhoto = galleryPhotos[0] || bride.photo;

  return (
    <div className="min-h-screen relative bg-[#0D0B0D] text-neutral-100 font-sans selection:bg-rose-900 selection:text-white overflow-x-hidden">
      {/* 1. Cinematic Stardust Particles */}
      <GoldenDustCanvas particleCount={25} />

      {/* 2. Audio Controller */}
      <MusicPlayer audioUrl={musicUrl} autoPlayTriggered={isOpened} />

      {/* 3. Slide-Up Fullscreen Prewed Glass Cover */}
      {!isOpened && (
        <div
          className={`fixed inset-0 z-50 flex flex-col justify-end transition-transform duration-1000 ease-in-out ${
            isSlidingUp ? "-translate-y-full" : "translate-y-0"
          }`}
        >
          {/* Background Fullscreen Image with Ken Burns Zoom */}
          <div className="absolute inset-0 z-0">
            <Image
              src={heroPhoto}
              alt={`${bride.name} & ${groom.name}`}
              fill
              className="object-cover scale-105 animate-pulse"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30 backdrop-blur-[2px]" />
          </div>

          {/* Cover Info Card */}
          <div className="relative z-10 max-w-xl mx-auto w-full p-6 sm:p-10 pb-14 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs tracking-[0.25em] uppercase text-rose-300">
              <Sparkles className="w-3.5 h-3.5 text-rose-300" />
              <span>Cinematic Celebration &bull; {theme.title}</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl font-serif-luxury font-bold tracking-tight text-white drop-shadow-md">
                {bride.name} & {groom.name}
              </h1>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-300">
                {formattedDate} &bull; Kebumen
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 text-center space-y-1 shadow-2xl">
              <p className="text-[10px] uppercase tracking-widest text-neutral-400">
                Dear Distinguished Guest:
              </p>
              <p className="text-xl font-bold text-white tracking-wide">{guestName}</p>
              <p className="text-xs text-rose-200/80">
                {sessions[activeSessionCode]?.title || "Wedding Reception"}
              </p>
            </div>

            <button
              onClick={handleOpen}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#D4A89C] to-[#C86D51] text-white font-bold text-sm tracking-widest uppercase shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Buka Undangan Sinematik</span>
              <ChevronUp className="w-4 h-4 animate-bounce" />
            </button>
          </div>
        </div>
      )}

      {/* Hero 100vh Fullscreen Banner */}
      <section className="relative h-[85vh] sm:h-[90vh] flex items-end justify-center pb-16 px-4">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroPhoto}
            alt="Hero Prewed Couple"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B0D] via-[#0D0B0D]/50 to-black/30" />
        </div>

        <div className="relative z-10 text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-rose-300 font-bold">
            The Intimate Celebration
          </span>
          <h1 className="text-5xl sm:text-7xl font-serif-luxury font-bold tracking-tight text-white drop-shadow-lg">
            {bride.name} & {groom.name}
          </h1>
          <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-neutral-300">
            {formattedDate} &bull; Kebumen Regency
          </p>
        </div>
      </section>

      {/* Dark Glassmorphism Content Area */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 space-y-16 pb-20">
        {/* Couple Profile Section */}
        <section className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-rose-200">
              Mempelai Bahagia
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
              Dengan penuh rasa syukur, kami mempersembahkan hari bahagia penyatuan cinta kami:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Bride Card */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center space-y-4 shadow-lg hover:border-rose-400/40 transition-colors">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
                <Image
                  src={bride.photo}
                  alt={bride.fullName}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <h3 className="text-xl font-serif-luxury font-bold text-white">
                {bride.fullName}
              </h3>
              <p className="text-xs text-neutral-400">
                Putri dari Bpk. {bride.father} & Ibu {bride.mother}
              </p>
              {bride.instagram && (
                <a
                  href={`https://instagram.com/${bride.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-rose-300 hover:text-white"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  @{bride.instagram}
                </a>
              )}
            </div>

            {/* Groom Card */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center space-y-4 shadow-lg hover:border-rose-400/40 transition-colors">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
                <Image
                  src={groom.photo}
                  alt={groom.fullName}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <h3 className="text-xl font-serif-luxury font-bold text-white">
                {groom.fullName}
              </h3>
              <p className="text-xs text-neutral-400">
                Putra dari Bpk. {groom.father} & Ibu {groom.mother}
              </p>
              {groom.instagram && (
                <a
                  href={`https://instagram.com/${groom.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-rose-300 hover:text-white"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  @{groom.instagram}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Schedule & Venue Card */}
        <section className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <EventSchedule
            eventDate={eventDate}
            sessions={sessions}
            activeSessionCode={activeSessionCode}
            googleMapsUrl={googleMapsUrl}
          />
        </section>

        {/* Story Timeline */}
        <section className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <LoveStoryTimeline stories={storyTimeline} />
        </section>

        {/* Gallery */}
        <section className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <PhotoGallery photos={galleryPhotos} />
        </section>

        {/* Digital Gift */}
        <section className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <DigitalGiftModal
            banks={giftInfo.banks}
            physicalGiftAddress={giftInfo.physicalGiftAddress}
          />
        </section>

        {/* RSVP & Guestbook */}
        <section className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <RsvpGuestbookForm
            invitationId={invitationId}
            defaultGuestName={guestName !== "Bapak/Ibu/Saudara/i" ? guestName : ""}
            activeSessionCode={activeSessionCode}
            initialWishes={initialWishes}
          />
        </section>

        {/* Reception Check-in */}
        <section className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <ReceptionQrCheckin guestName={guestName} sessionCode={activeSessionCode} />
        </section>

        {/* Cinematic Footer */}
        <footer className="text-center py-12 space-y-3 border-t border-white/10">
          <p className="text-xl font-serif-luxury text-white">
            {bride.name} & {groom.name}
          </p>
          <p className="text-xs text-neutral-400">
            Terima kasih atas doa dan restu yang tulus
          </p>
          <div className="flex items-center justify-center gap-1 text-[11px] text-neutral-500 pt-2">
            <span>Dibuat di Kebumen melalui HariKita</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          </div>
        </footer>
      </main>
    </div>
  );
};
