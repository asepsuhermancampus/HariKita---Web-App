"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { GoldenDustCanvas } from "@/components/invitation/canvas/GoldenDustCanvas";
import { MusicPlayer } from "@/components/invitation/MusicPlayer";
import { OrnamentGunungan } from "@/components/invitation/ornaments/OrnamentGunungan";
import { EventSchedule } from "@/components/invitation/EventSchedule";
import { LoveStoryTimeline } from "@/components/invitation/LoveStoryTimeline";
import { PhotoGallery } from "@/components/invitation/PhotoGallery";
import { DigitalGiftModal } from "@/components/invitation/DigitalGiftModal";
import { RsvpGuestbookForm } from "@/components/invitation/RsvpGuestbookForm";
import { ReceptionQrCheckin } from "@/components/invitation/ReceptionQrCheckin";
import { Calendar, Heart, Sparkles, ArrowRight } from "lucide-react";
import Image from "next/image";

export const JavaneseRoyalTemplate: React.FC<DedicatedTemplateProps> = ({
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
  const [isRevealing, setIsRevealing] = useState(false);

  const handleOpen = () => {
    setIsRevealing(true);
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
    <div className="min-h-screen relative bg-[#1A100B] text-[#F3E5D8] font-sans selection:bg-amber-900 selection:text-white overflow-x-hidden">
      {/* 1. Golden Dust Floating Particles */}
      <GoldenDustCanvas particleCount={35} />

      {/* 2. Floating Gamelan/Instrument Player */}
      <MusicPlayer audioUrl={musicUrl} autoPlayTriggered={isOpened} />

      {/* 3. Gunungan Wayang Split Reveal Cover */}
      {!isOpened && (
        <div className="fixed inset-0 z-50 flex overflow-hidden bg-[#120B07]">
          {/* Left Wing with Gunungan */}
          <div
            className={`w-1/2 h-full bg-gradient-to-r from-[#1E120C] to-[#2B1810] border-r-2 border-[#CCA873]/40 p-6 sm:p-10 flex flex-col justify-between items-end transition-transform duration-1000 ease-in-out ${
              isRevealing ? "-translate-x-full" : "translate-x-0"
            }`}
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#CCA873]">
              Serat Ulem &bull; {theme.title}
            </span>
            <div className="text-right space-y-2">
              <OrnamentGunungan className="w-20 h-32 sm:w-28 sm:h-44 text-[#CCA873] ml-auto" />
              <h2 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-white">
                {bride.name}
              </h2>
            </div>
            <div className="text-[10px] text-[#A68360]">Adat Jawa &bull; Kebumen</div>
          </div>

          {/* Right Wing with Gunungan */}
          <div
            className={`w-1/2 h-full bg-gradient-to-l from-[#1E120C] to-[#2B1810] border-l-2 border-[#CCA873]/40 p-6 sm:p-10 flex flex-col justify-between items-start transition-transform duration-1000 ease-in-out ${
              isRevealing ? "translate-x-full" : "translate-x-0"
            }`}
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#CCA873]">
              Pawiwahan Ageng
            </span>
            <div className="text-left space-y-2">
              <div className="transform scale-x-[-1]">
                <OrnamentGunungan className="w-20 h-32 sm:w-28 sm:h-44 text-[#CCA873]" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-white">
                {groom.name}
              </h2>
            </div>
            <div className="text-[10px] text-[#A68360]">{new Date(eventDate).getFullYear()}</div>
          </div>

          {/* Centerpiece Seal Trigger */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-500 text-center w-80 max-w-[88vw] ${
              isRevealing ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"
            }`}
          >
            <div className="bg-[#2B1810]/95 backdrop-blur-md border-2 border-[#CCA873] p-6 rounded-3xl shadow-2xl space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-tr from-[#8C5D30] to-[#CCA873] flex items-center justify-center text-white shadow-lg">
                <Sparkles className="w-6 h-6 text-[#1A100B]" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#CCA873]">
                  Katur Dhumateng Panjenengan:
                </p>
                <p className="text-lg font-bold text-white tracking-wide mt-1">{guestName}</p>
                <p className="text-xs text-[#D9B896] mt-0.5">
                  {sessions[activeSessionCode]?.title || "Tamu Kehormatan"}
                </p>
              </div>

              <button
                onClick={handleOpen}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#CCA873] to-[#E5C895] text-[#1A100B] font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Bikak Serat Ulem</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Javanese Heritage Content Area */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* Keraton Header */}
        <header className="text-center pt-8 space-y-4">
          <div className="flex justify-center">
            <OrnamentGunungan className="w-16 h-24 text-[#CCA873]" />
          </div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#CCA873] font-bold">
            Serat Ulem Pawiwahan
          </p>
          <h1 className="text-5xl sm:text-6xl font-serif-luxury font-bold text-white tracking-tight">
            {bride.name} <span className="text-[#CCA873] font-light">&</span> {groom.name}
          </h1>
          <p className="text-xs sm:text-sm tracking-widest text-[#D9B896] uppercase">
            {formattedDate} &bull; Kabupaten Kebumen
          </p>
        </header>

        {/* Mempelai Temanten Section */}
        <section className="bg-[#26150D]/80 backdrop-blur-md border border-[#CCA873]/30 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#E5C895]">
              Pengantin Kekalih
            </h2>
            <p className="text-xs sm:text-sm text-[#D9B896] max-w-md mx-auto">
              Nyuwun donga pangestu dhumateng Gusti Allah SWT supados pinaringan berkah lan karaharjan:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Bride Card with Teakwood border */}
            <div className="bg-[#1A0E08] border border-[#CCA873]/30 rounded-2xl p-6 text-center space-y-4 shadow-lg">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden mx-auto max-w-[240px] border border-[#CCA873]/20">
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
                Putri kinasih Bpk. {bride.father} & Ibu {bride.mother}
              </p>
            </div>

            {/* Groom Card with Teakwood border */}
            <div className="bg-[#1A0E08] border border-[#CCA873]/30 rounded-2xl p-6 text-center space-y-4 shadow-lg">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden mx-auto max-w-[240px] border border-[#CCA873]/20">
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
                Putra kinasih Bpk. {groom.father} & Ibu {groom.mother}
              </p>
            </div>
          </div>
        </section>

        {/* Schedule */}
        <section className="bg-[#26150D]/80 backdrop-blur-md border border-[#CCA873]/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <EventSchedule
            eventDate={eventDate}
            sessions={sessions}
            activeSessionCode={activeSessionCode}
            googleMapsUrl={googleMapsUrl}
          />
        </section>

        {/* Love Story */}
        <section className="bg-[#26150D]/80 backdrop-blur-md border border-[#CCA873]/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <LoveStoryTimeline stories={storyTimeline} />
        </section>

        {/* Gallery */}
        <section className="bg-[#26150D]/80 backdrop-blur-md border border-[#CCA873]/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <PhotoGallery photos={galleryPhotos} />
        </section>

        {/* Digital Gift */}
        <section className="bg-[#26150D]/80 backdrop-blur-md border border-[#CCA873]/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <DigitalGiftModal
            banks={giftInfo.banks}
            physicalGiftAddress={giftInfo.physicalGiftAddress}
          />
        </section>

        {/* RSVP Guestbook */}
        <section className="bg-[#26150D]/80 backdrop-blur-md border border-[#CCA873]/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <RsvpGuestbookForm
            invitationId={invitationId}
            defaultGuestName={guestName !== "Bapak/Ibu/Saudara/i" ? guestName : ""}
            activeSessionCode={activeSessionCode}
            initialWishes={initialWishes}
          />
        </section>

        {/* Reception Checkin */}
        <section className="bg-[#26150D]/80 backdrop-blur-md border border-[#CCA873]/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <ReceptionQrCheckin guestName={guestName} sessionCode={activeSessionCode} />
        </section>

        {/* Heritage Footer */}
        <footer className="text-center py-12 space-y-3 border-t border-[#CCA873]/30">
          <OrnamentGunungan className="w-12 h-16 text-[#CCA873] mx-auto" />
          <p className="text-2xl font-serif-luxury font-bold text-white">
            {bride.name} & {groom.name}
          </p>
          <p className="text-xs text-[#D9B896]">
            Matur nuwun sanget awit saking rawuh lan donga pangestunipun panjenengan sedaya
          </p>
          <div className="flex items-center justify-center gap-1 text-[11px] text-[#A68360] pt-2">
            <span>Damelan saking Kebumen lumantar HariKita</span>
            <Heart className="w-3.5 h-3.5 text-[#CCA873] fill-[#CCA873]" />
          </div>
        </footer>
      </main>
    </div>
  );
};
