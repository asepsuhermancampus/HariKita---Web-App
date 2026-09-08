"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { GoldenDustCanvas } from "@/components/invitation/canvas/GoldenDustCanvas";
import { MusicPlayer } from "@/components/invitation/MusicPlayer";
import { OrnamentGoldFoilFrame } from "@/components/invitation/ornaments/OrnamentGoldFoilFrame";
import { EventSchedule } from "@/components/invitation/EventSchedule";
import { LoveStoryTimeline } from "@/components/invitation/LoveStoryTimeline";
import { PhotoGallery } from "@/components/invitation/PhotoGallery";
import { DigitalGiftModal } from "@/components/invitation/DigitalGiftModal";
import { RsvpGuestbookForm } from "@/components/invitation/RsvpGuestbookForm";
import { ReceptionQrCheckin } from "@/components/invitation/ReceptionQrCheckin";
import { Calendar, Heart, Sparkles, Instagram } from "lucide-react";
import Image from "next/image";

export const RoseGoldLuxuryTemplate: React.FC<DedicatedTemplateProps> = ({
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
  const [isBreakingSeal, setIsBreakingSeal] = useState(false);

  const handleOpen = () => {
    setIsBreakingSeal(true);
    setTimeout(() => {
      setIsOpened(true);
    }, 850);
  };

  const formattedDate = new Date(eventDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen relative bg-[#1F181B] text-[#FDF8F5] font-sans selection:bg-[#CCA873] selection:text-[#1F181B] overflow-x-hidden">
      {/* 1. Ambient Golden Shimmer Dust */}
      <GoldenDustCanvas particleCount={30} />

      {/* 2. Floating Luxury Orchestra/Harp Player */}
      <MusicPlayer audioUrl={musicUrl} autoPlayTriggered={isOpened} />

      {/* 3. 3D Wax Seal Stamp Break Envelope Cover */}
      {!isOpened && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-[#181215] via-[#2A1D23] to-[#120B0E] text-white animate-fadeIn">
          <div className="w-full max-w-md bg-[#2D1F25]/90 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border-2 border-[#CCA873]/50 text-center relative overflow-hidden">
            <OrnamentGoldFoilFrame className="absolute top-2 left-2 w-12 h-12 text-[#CCA873]" position="top-left" />
            <OrnamentGoldFoilFrame className="absolute top-2 right-2 w-12 h-12 text-[#CCA873]" position="top-right" />
            <OrnamentGoldFoilFrame className="absolute bottom-2 left-2 w-12 h-12 text-[#CCA873]" position="bottom-left" />
            <OrnamentGoldFoilFrame className="absolute bottom-2 right-2 w-12 h-12 text-[#CCA873]" position="bottom-right" />

            <div className="text-center space-y-1 my-4">
              <span className="text-[10px] uppercase tracking-[0.35em] text-[#CCA873] font-semibold">
                Royal Wedding &bull; {theme.title}
              </span>
              <h1 className="text-4xl font-serif-luxury font-bold text-white tracking-tight">
                {bride.name} & {groom.name}
              </h1>
              <p className="text-xs text-rose-200/80 tracking-widest uppercase">
                {formattedDate} &bull; Kebumen
              </p>
            </div>

            {/* Recipient Velvet Plaque */}
            <div className="bg-[#1C1217]/90 border border-[#CCA873]/30 rounded-2xl p-5 my-6 text-center shadow-inner">
              <p className="text-[10px] uppercase tracking-widest text-[#CCA873]/80 mb-1">
                Specially Invited For:
              </p>
              <p className="text-xl font-bold text-white tracking-wide">{guestName}</p>
              <p className="text-xs text-rose-200/80 mt-1">
                {sessions[activeSessionCode]?.title || "Distinguished Guest"}
              </p>
            </div>

            {/* Interactive 3D Wax Seal Stamp */}
            <div className="flex flex-col items-center justify-center pt-2">
              <button
                onClick={handleOpen}
                disabled={isBreakingSeal}
                className={`relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#946328] via-[#CCA873] to-[#F3DCA7] flex items-center justify-center text-[#1F181B] font-bold shadow-2xl transition-all duration-700 active:scale-90 hover:scale-105 ${
                  isBreakingSeal ? "scale-150 rotate-45 opacity-0 blur-sm" : "animate-pulse"
                }`}
                style={{
                  boxShadow: "0 0 30px rgba(204, 168, 115, 0.5)",
                }}
              >
                <div className="w-16 h-16 rounded-full border-2 border-[#1F181B]/40 flex flex-col items-center justify-center text-[10px] uppercase font-serif-luxury font-bold tracking-tighter">
                  <Sparkles className="w-4 h-4 text-[#1F181B]" />
                  <span>SEAL</span>
                </div>
              </button>
              <p className="text-[11px] text-[#CCA873] tracking-widest uppercase font-semibold mt-3">
                Tekan Segel Lilin Emas
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Royal Content Container */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* Monogram Crest Header */}
        <header className="text-center pt-8 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-[#CCA873] to-[#EBD5AA] text-[#1F181B] flex items-center justify-center font-serif-luxury font-bold text-xl shadow-lg border-2 border-white/20">
            {bride.name[0]}&{groom.name[0]}
          </div>
          <span className="text-xs uppercase tracking-[0.35em] text-[#CCA873] font-bold block">
            The Royal Nuptials Of
          </span>
          <h1 className="text-5xl sm:text-6xl font-serif-luxury font-bold text-white tracking-tight">
            {bride.name} <span className="text-[#CCA873] font-light">&</span> {groom.name}
          </h1>
          <p className="text-xs sm:text-sm tracking-widest text-[#EBD5AA] uppercase font-medium">
            {formattedDate} &bull; Kabupaten Kebumen
          </p>
        </header>

        {/* Mempelai Royal Section */}
        <section className="bg-[#2B1F25]/80 backdrop-blur-md border border-[#CCA873]/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8">
          <OrnamentGoldFoilFrame className="absolute top-2 left-2 w-10 h-10 text-[#CCA873]" position="top-left" />
          <OrnamentGoldFoilFrame className="absolute top-2 right-2 w-10 h-10 text-[#CCA873]" position="top-right" />
          <OrnamentGoldFoilFrame className="absolute bottom-2 left-2 w-10 h-10 text-[#CCA873]" position="bottom-left" />
          <OrnamentGoldFoilFrame className="absolute bottom-2 right-2 w-10 h-10 text-[#CCA873]" position="bottom-right" />

          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#EBD5AA]">
              Mempelai Yang Berbahagia
            </h2>
            <p className="text-xs sm:text-sm text-[#D9B896] max-w-md mx-auto">
              Dengan penuh kehangatan, kami mengundang kehadiran Bapak/Ibu/Saudara/i untuk menyaksikan akad dan resepsi:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Bride Card */}
            <div className="bg-[#1F151A] border border-[#CCA873]/30 rounded-2xl p-6 text-center space-y-4 shadow-xl">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden mx-auto max-w-[240px] border border-[#CCA873]/30">
                <Image
                  src={bride.photo}
                  alt={bride.fullName}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-2xl font-serif-luxury font-bold text-white">
                {bride.fullName}
              </h3>
              <p className="text-xs text-[#D9B896]">
                Putri tercinta Bpk. {bride.father} & Ibu {bride.mother}
              </p>
              {bride.instagram && (
                <a
                  href={`https://instagram.com/${bride.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#CCA873] hover:underline"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  @{bride.instagram}
                </a>
              )}
            </div>

            {/* Groom Card */}
            <div className="bg-[#1F151A] border border-[#CCA873]/30 rounded-2xl p-6 text-center space-y-4 shadow-xl">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden mx-auto max-w-[240px] border border-[#CCA873]/30">
                <Image
                  src={groom.photo}
                  alt={groom.fullName}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-2xl font-serif-luxury font-bold text-white">
                {groom.fullName}
              </h3>
              <p className="text-xs text-[#D9B896]">
                Putra tercinta Bpk. {groom.father} & Ibu {groom.mother}
              </p>
              {groom.instagram && (
                <a
                  href={`https://instagram.com/${groom.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#CCA873] hover:underline"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  @{groom.instagram}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Schedule */}
        <section className="bg-[#2B1F25]/80 backdrop-blur-md border border-[#CCA873]/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <EventSchedule
            eventDate={eventDate}
            sessions={sessions}
            activeSessionCode={activeSessionCode}
            googleMapsUrl={googleMapsUrl}
          />
        </section>

        {/* Story */}
        <section className="bg-[#2B1F25]/80 backdrop-blur-md border border-[#CCA873]/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <LoveStoryTimeline stories={storyTimeline} />
        </section>

        {/* Gallery */}
        <section className="bg-[#2B1F25]/80 backdrop-blur-md border border-[#CCA873]/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <PhotoGallery photos={galleryPhotos} />
        </section>

        {/* Digital Gift */}
        <section className="bg-[#2B1F25]/80 backdrop-blur-md border border-[#CCA873]/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <DigitalGiftModal
            banks={giftInfo.banks}
            physicalGiftAddress={giftInfo.physicalGiftAddress}
          />
        </section>

        {/* RSVP Guestbook */}
        <section className="bg-[#2B1F25]/80 backdrop-blur-md border border-[#CCA873]/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <RsvpGuestbookForm
            invitationId={invitationId}
            defaultGuestName={guestName !== "Bapak/Ibu/Saudara/i" ? guestName : ""}
            activeSessionCode={activeSessionCode}
            initialWishes={initialWishes}
          />
        </section>

        {/* Reception Checkin */}
        <section className="bg-[#2B1F25]/80 backdrop-blur-md border border-[#CCA873]/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <ReceptionQrCheckin guestName={guestName} sessionCode={activeSessionCode} />
        </section>

        {/* Royal Footer */}
        <footer className="text-center py-12 space-y-3 border-t border-[#CCA873]/30">
          <p className="text-2xl font-serif-luxury font-bold text-white">
            {bride.name} & {groom.name}
          </p>
          <p className="text-xs text-[#D9B896]">
            Terima kasih yang mendalam atas kehadiran dan untaian doa restu Anda
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#CCA873] pt-2">
            <span>Dibuat dengan cinta di Kebumen melalui HariKita</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </footer>
      </main>
    </div>
  );
};
