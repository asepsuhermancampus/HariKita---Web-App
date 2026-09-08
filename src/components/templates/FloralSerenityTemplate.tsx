"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { FloatingPetalsCanvas } from "@/components/invitation/canvas/FloatingPetalsCanvas";
import { MusicPlayer } from "@/components/invitation/MusicPlayer";
import { OrnamentFloralWreath } from "@/components/invitation/ornaments/OrnamentFloralWreath";
import { EventSchedule } from "@/components/invitation/EventSchedule";
import { LoveStoryTimeline } from "@/components/invitation/LoveStoryTimeline";
import { PhotoGallery } from "@/components/invitation/PhotoGallery";
import { DigitalGiftModal } from "@/components/invitation/DigitalGiftModal";
import { RsvpGuestbookForm } from "@/components/invitation/RsvpGuestbookForm";
import { ReceptionQrCheckin } from "@/components/invitation/ReceptionQrCheckin";
import { Calendar, Heart, MailOpen, Instagram } from "lucide-react";
import Image from "next/image";

export const FloralSerenityTemplate: React.FC<DedicatedTemplateProps> = ({
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
    <div className="min-h-screen relative bg-[#FDF9F9] text-[#4A2D34] font-sans selection:bg-rose-200 overflow-x-hidden">
      {/* 1. Floating Rose Petals Canvas */}
      <FloatingPetalsCanvas />

      {/* 2. Floating Music Player */}
      <MusicPlayer audioUrl={musicUrl} autoPlayTriggered={isOpened} />

      {/* 3. Gatefold Floral Card Cover */}
      {!isOpened && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FBF2F4]/90 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-rose-200 text-center relative overflow-hidden">
            {/* Top Floral Garland Wreath */}
            <div className="flex justify-center mb-4">
              <OrnamentFloralWreath className="w-20 h-20 text-rose-400" />
            </div>

            <p className="text-xs uppercase tracking-[0.3em] text-[#A8586A] font-medium mb-2">
              Wedding Invitation &bull; {theme.title}
            </p>
            <h1 className="text-4xl sm:text-5xl font-serif-luxury font-bold text-[#592B37] mb-3">
              {bride.name} & {groom.name}
            </h1>
            <p className="text-xs text-[#8C5D69] mb-6 flex items-center justify-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              {formattedDate}
            </p>

            {/* Recipient Ribbon Box */}
            <div className="bg-[#FAF0F2] rounded-2xl p-5 mb-8 border border-rose-100 shadow-inner">
              <p className="text-[11px] uppercase tracking-wider text-[#A8586A] mb-1">
                Yth. Bapak/Ibu/Saudara/i:
              </p>
              <p className="text-xl font-bold text-[#592B37]">{guestName}</p>
              <p className="text-xs text-[#8C5D69] mt-1">
                Sesi: <span className="font-semibold text-rose-700">{sessions[activeSessionCode]?.title || "Tamu Kehormatan"}</span>
              </p>
            </div>

            {/* Open Button */}
            <button
              onClick={() => setIsOpened(true)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#C26B7E] to-[#A8586A] text-white font-bold text-sm tracking-wider uppercase shadow-lg hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <MailOpen className="w-4 h-4 animate-bounce" />
              <span>Buka Kartu Undangan</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Floral Content Container */}
      <main className="relative z-20 max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* Floral Header */}
        <header className="text-center pt-8 space-y-4">
          <div className="flex justify-center">
            <OrnamentFloralWreath className="w-16 h-16 text-rose-300" />
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-[#A8586A] font-semibold block">
            The Botanical Celebration of
          </span>
          <h1 className="text-5xl sm:text-6xl font-serif-luxury font-bold text-[#592B37]">
            {bride.name} <span className="text-rose-400 font-light">&</span> {groom.name}
          </h1>
          <p className="text-xs sm:text-sm tracking-widest text-[#8C5D69] uppercase font-medium">
            {formattedDate} &bull; Kebumen, Jawa Tengah
          </p>
        </header>

        {/* Couple Profile Showcase */}
        <section className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-10 shadow-xl border border-rose-100 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#592B37]">
              Mempelai Yang Berbahagia
            </h2>
            <p className="text-xs sm:text-sm text-[#8C5D69] max-w-md mx-auto">
              Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Bride Card with Floral Frame */}
            <div className="bg-[#FAF3F5] rounded-3xl p-6 text-center space-y-4 border border-rose-100 shadow-sm">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mx-auto max-w-[240px]">
                <Image
                  src={bride.photo}
                  alt={bride.fullName}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-2xl font-serif-luxury font-bold text-[#592B37]">
                {bride.fullName}
              </h3>
              <p className="text-xs text-[#8C5D69]">
                Putri tercinta Bpk. {bride.father} & Ibu {bride.mother}
              </p>
              {bride.instagram && (
                <a
                  href={`https://instagram.com/${bride.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#A8586A] hover:underline"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  @{bride.instagram}
                </a>
              )}
            </div>

            {/* Groom Card with Floral Frame */}
            <div className="bg-[#FAF3F5] rounded-3xl p-6 text-center space-y-4 border border-rose-100 shadow-sm">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mx-auto max-w-[240px]">
                <Image
                  src={groom.photo}
                  alt={groom.fullName}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-2xl font-serif-luxury font-bold text-[#592B37]">
                {groom.fullName}
              </h3>
              <p className="text-xs text-[#8C5D69]">
                Putra tercinta Bpk. {groom.father} & Ibu {groom.mother}
              </p>
              {groom.instagram && (
                <a
                  href={`https://instagram.com/${groom.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#A8586A] hover:underline"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  @{groom.instagram}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Schedule */}
        <section className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-10 shadow-xl border border-rose-100">
          <EventSchedule
            eventDate={eventDate}
            sessions={sessions}
            activeSessionCode={activeSessionCode}
            googleMapsUrl={googleMapsUrl}
          />
        </section>

        {/* Love Story */}
        <section className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-10 shadow-xl border border-rose-100">
          <LoveStoryTimeline stories={storyTimeline} />
        </section>

        {/* Gallery */}
        <section className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-10 shadow-xl border border-rose-100">
          <PhotoGallery photos={galleryPhotos} />
        </section>

        {/* Digital Gift */}
        <section className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-10 shadow-xl border border-rose-100">
          <DigitalGiftModal
            banks={giftInfo.banks}
            physicalGiftAddress={giftInfo.physicalGiftAddress}
          />
        </section>

        {/* RSVP Guestbook */}
        <section className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-10 shadow-xl border border-rose-100">
          <RsvpGuestbookForm
            invitationId={invitationId}
            defaultGuestName={guestName !== "Bapak/Ibu/Saudara/i" ? guestName : ""}
            activeSessionCode={activeSessionCode}
            initialWishes={initialWishes}
          />
        </section>

        {/* Reception Checkin */}
        <section className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-10 shadow-xl border border-rose-100">
          <ReceptionQrCheckin guestName={guestName} sessionCode={activeSessionCode} />
        </section>

        {/* Floral Footer */}
        <footer className="text-center py-12 space-y-3 border-t border-rose-200">
          <OrnamentFloralWreath className="w-12 h-12 text-rose-300 mx-auto" />
          <p className="text-2xl font-serif-luxury font-bold text-[#592B37]">
            {bride.name} & {groom.name}
          </p>
          <p className="text-xs text-[#8C5D69]">
            Merupakan kehormatan bagi kami atas kehadiran dan doa restu Anda
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#A8586A] pt-2">
            <span>Dihadirkan dari Kebumen melalui HariKita</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </footer>
      </main>
    </div>
  );
};
