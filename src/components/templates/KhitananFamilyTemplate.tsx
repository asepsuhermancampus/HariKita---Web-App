"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { ConfettiCanvas } from "@/components/invitation/canvas/ConfettiCanvas";
import { MusicPlayer } from "@/components/invitation/MusicPlayer";
import { EventSchedule } from "@/components/invitation/EventSchedule";
import { PhotoGallery } from "@/components/invitation/PhotoGallery";
import { DigitalGiftModal } from "@/components/invitation/DigitalGiftModal";
import { RsvpGuestbookForm } from "@/components/invitation/RsvpGuestbookForm";
import { ReceptionQrCheckin } from "@/components/invitation/ReceptionQrCheckin";
import { Calendar, Heart, Sparkles, Gift, Smile } from "lucide-react";
import Image from "next/image";

export const KhitananFamilyTemplate: React.FC<DedicatedTemplateProps> = ({
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
    <div className="min-h-screen relative bg-[#F0F7FF] text-[#1E3A8A] font-sans selection:bg-amber-200 overflow-x-hidden">
      {/* 1. Festive Confetti Canvas */}
      <ConfettiCanvas />

      {/* 2. Music Player */}
      <MusicPlayer audioUrl={musicUrl} autoPlayTriggered={isOpened} />

      {/* 3. Pop-up Festive Card Cover */}
      {!isOpened && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-[#1E40AF]/80 to-[#172554]/90 backdrop-blur-md text-white animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border-4 border-amber-300 text-center relative overflow-hidden text-neutral-800">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-400 text-white flex items-center justify-center shadow-md mb-4">
              <Sparkles className="w-8 h-8 text-amber-950 animate-bounce" />
            </div>

            <span className="text-xs uppercase tracking-[0.25em] text-blue-600 font-bold">
              Tasyakuran & Acara Keluarga &bull; {theme.title}
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-blue-950 my-2">
              {bride.name}
            </h1>
            <p className="text-xs text-neutral-600 mb-6 flex items-center justify-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              {formattedDate}
            </p>

            {/* Recipient Card */}
            <div className="bg-blue-50 rounded-2xl p-5 mb-8 border border-blue-100 shadow-inner">
              <p className="text-[11px] uppercase tracking-wider text-blue-500 font-semibold mb-1">
                Undangan Spesial Untuk:
              </p>
              <p className="text-xl font-bold text-blue-950">{guestName}</p>
              <p className="text-xs text-blue-700 mt-1">
                {sessions[activeSessionCode]?.title || "Tamu Kehormatan"}
              </p>
            </div>

            <button
              onClick={() => setIsOpened(true)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm tracking-wider uppercase shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Gift className="w-4 h-4" />
              <span>Buka Undangan Tasyakuran</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Family Event Content Container */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* Festive Header */}
        <header className="text-center pt-8 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest">
            <Smile className="w-4 h-4 text-amber-500" />
            <span>Tasyakuran & Syukuran Keluarga</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-serif-luxury font-bold text-blue-950">
            {bride.name}
          </h1>
          <p className="text-xs sm:text-sm tracking-widest text-blue-800 uppercase font-medium">
            {formattedDate} &bull; Kebumen, Jawa Tengah
          </p>
        </header>

        {/* Hero Putra & Doa Orang Tua */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-blue-100 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-blue-950">
              Putra Kami Tercinta
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
              Rasa syukur mendalam kami panjatkan ke hadirat Allah SWT atas terselenggaranya tasyakuran putra kami:
            </p>
          </div>

          <div className="text-center space-y-4 max-w-sm mx-auto">
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-md border-4 border-amber-200">
              <Image
                src={bride.photo}
                alt={bride.fullName}
                fill
                className="object-cover"
              />
            </div>
            <h3 className="text-2xl font-serif-luxury font-bold text-blue-950">
              {bride.fullName}
            </h3>
            <p className="text-sm text-neutral-600">
              Putra tercinta dari pasangan Bpk. {bride.father} & Ibu {bride.mother}
            </p>
          </div>

          {/* Doa Orang Tua Callout */}
          <div className="bg-blue-50/80 rounded-2xl p-6 border border-blue-200 text-center space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
              Untaian Doa Orang Tua
            </p>
            <p className="text-xs sm:text-sm text-blue-900 italic leading-relaxed">
              &ldquo;Semoga putra kami tumbuh menjadi anak yang sholeh, berbakti kepada kedua orang tua, cerdas, dan bermanfaat bagi agama, nusa, dan bangsa.&rdquo;
            </p>
          </div>
        </section>

        {/* Schedule */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-blue-100">
          <EventSchedule
            eventDate={eventDate}
            sessions={sessions}
            activeSessionCode={activeSessionCode}
            googleMapsUrl={googleMapsUrl}
          />
        </section>

        {/* Photo Gallery */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-blue-100">
          <PhotoGallery photos={galleryPhotos} />
        </section>

        {/* Digital Gift */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-blue-100">
          <DigitalGiftModal
            banks={giftInfo.banks}
            physicalGiftAddress={giftInfo.physicalGiftAddress}
          />
        </section>

        {/* RSVP Guestbook */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-blue-100">
          <RsvpGuestbookForm
            invitationId={invitationId}
            defaultGuestName={guestName !== "Bapak/Ibu/Saudara/i" ? guestName : ""}
            activeSessionCode={activeSessionCode}
            initialWishes={initialWishes}
          />
        </section>

        {/* Reception Checkin */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-blue-100">
          <ReceptionQrCheckin guestName={guestName} sessionCode={activeSessionCode} />
        </section>

        {/* Family Footer */}
        <footer className="text-center py-12 space-y-3 border-t border-blue-200">
          <p className="text-2xl font-serif-luxury font-bold text-blue-950">
            Keluarga Besar Bpk. {bride.father}
          </p>
          <p className="text-xs text-neutral-600">
            Terima kasih yang tulus atas kehadiran dan doa berkah untuk putra kami
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-blue-600 pt-2">
            <span>Dihadirkan dari Kebumen melalui HariKita</span>
            <Heart className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
          </div>
        </footer>
      </main>
    </div>
  );
};
