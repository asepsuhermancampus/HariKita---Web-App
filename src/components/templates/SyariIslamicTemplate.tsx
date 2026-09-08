"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { MusicPlayer } from "@/components/invitation/MusicPlayer";
import { OrnamentMoroccanArch } from "@/components/invitation/ornaments/OrnamentMoroccanArch";
import { EventSchedule } from "@/components/invitation/EventSchedule";
import { LoveStoryTimeline } from "@/components/invitation/LoveStoryTimeline";
import { PhotoGallery } from "@/components/invitation/PhotoGallery";
import { DigitalGiftModal } from "@/components/invitation/DigitalGiftModal";
import { RsvpGuestbookForm } from "@/components/invitation/RsvpGuestbookForm";
import { ReceptionQrCheckin } from "@/components/invitation/ReceptionQrCheckin";
import { Calendar, Heart, MailOpen, Moon, BookOpen } from "lucide-react";
import Image from "next/image";

export const SyariIslamicTemplate: React.FC<DedicatedTemplateProps> = ({
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
    <div className="min-h-screen relative bg-[#F7FAF8] text-[#133E2E] font-sans selection:bg-emerald-200 overflow-x-hidden">
      {/* Floating Music Player (Optional nasyid/instrumental) */}
      <MusicPlayer audioUrl={musicUrl} autoPlayTriggered={isOpened} />

      {/* Islamic Arch Portal Cover */}
      {!isOpened && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-[#063828] via-[#0A4433] to-[#04241A] text-white animate-fadeIn">
          <div className="w-full max-w-md bg-[#0F4A38]/90 backdrop-blur-md rounded-3xl p-8 sm:p-10 shadow-2xl border border-emerald-500/30 text-center relative overflow-hidden">
            <div className="flex justify-center mb-4">
              <OrnamentMoroccanArch className="w-20 h-20 text-[#CCA873]" />
            </div>

            {/* Basmalah Calligraphy Text */}
            <p className="font-serif-luxury text-2xl text-[#E8CE9D] mb-2 leading-relaxed">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200 font-medium mb-4">
              Walimatul &apos;Urs &bull; {theme.title}
            </p>

            <h1 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-white mb-2">
              {bride.name} & {groom.name}
            </h1>
            <p className="text-xs text-emerald-200/80 mb-6 flex items-center justify-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#CCA873]" />
              {formattedDate}
            </p>

            {/* Recipient Box */}
            <div className="bg-[#082E22]/90 border border-emerald-600/30 rounded-2xl p-5 mb-8 text-center shadow-inner">
              <p className="text-[10px] uppercase tracking-widest text-emerald-300/80 mb-1">
                Kepada Sahabat & Kerabat Tercinta:
              </p>
              <p className="text-xl font-bold text-white tracking-wide">{guestName}</p>
              <p className="text-xs text-[#CCA873] mt-1">
                {sessions[activeSessionCode]?.title || "Undangan Kehormatan"}
              </p>
            </div>

            {/* Open Button */}
            <button
              onClick={() => setIsOpened(true)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#CCA873] to-[#E8CE9D] text-[#063828] font-bold text-sm tracking-wider uppercase shadow-xl hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <MailOpen className="w-4 h-4 text-[#063828]" />
              <span>Buka Undangan Berkah</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* Quranic Verse Banner */}
        <header className="text-center pt-8 space-y-6">
          <div className="flex justify-center">
            <OrnamentMoroccanArch className="w-16 h-16 text-[#0A4433]" />
          </div>
          <p className="font-serif-luxury text-3xl sm:text-4xl text-[#0A4433] leading-relaxed">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <div className="bg-white/80 border border-emerald-900/10 rounded-2xl p-6 sm:p-8 max-w-xl mx-auto shadow-sm space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-800">
              <BookOpen className="w-4 h-4 text-[#CCA873]" />
              <span>QS. Ar-Rum : 21</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-900/80 italic leading-relaxed">
              &ldquo;Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.&rdquo;
            </p>
          </div>
        </header>

        {/* Courteous Mempelai Section */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/10 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#0A4433]">
              Mempelai Yang Berbahagia
            </h2>
            <p className="text-xs sm:text-sm text-emerald-800/80 max-w-md mx-auto">
              Assalamu&apos;alaikum Warahmatullahi Wabarakatuh. Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i ke acara pernikahan:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Bride Card */}
            <div className="bg-[#F3F7F5] rounded-3xl p-6 text-center space-y-4 border border-emerald-800/10 shadow-sm">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mx-auto max-w-[240px]">
                <Image
                  src={bride.photo}
                  alt={bride.fullName}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-2xl font-serif-luxury font-bold text-[#0A4433]">
                {bride.fullName}
              </h3>
              <p className="text-xs text-emerald-900/80">
                Putri tercinta Bpk. {bride.father} & Ibu {bride.mother}
              </p>
            </div>

            {/* Groom Card */}
            <div className="bg-[#F3F7F5] rounded-3xl p-6 text-center space-y-4 border border-emerald-800/10 shadow-sm">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mx-auto max-w-[240px]">
                <Image
                  src={groom.photo}
                  alt={groom.fullName}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-2xl font-serif-luxury font-bold text-[#0A4433]">
                {groom.fullName}
              </h3>
              <p className="text-xs text-emerald-900/80">
                Putra tercinta Bpk. {groom.father} & Ibu {groom.mother}
              </p>
            </div>
          </div>
        </section>

        {/* Schedule */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/10">
          <EventSchedule
            eventDate={eventDate}
            sessions={sessions}
            activeSessionCode={activeSessionCode}
            googleMapsUrl={googleMapsUrl}
          />
        </section>

        {/* Timeline */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/10">
          <LoveStoryTimeline stories={storyTimeline} />
        </section>

        {/* Gallery */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/10">
          <PhotoGallery photos={galleryPhotos} />
        </section>

        {/* Gift & Infaq */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/10">
          <DigitalGiftModal
            banks={giftInfo.banks}
            physicalGiftAddress={giftInfo.physicalGiftAddress}
          />
        </section>

        {/* RSVP Form */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/10">
          <RsvpGuestbookForm
            invitationId={invitationId}
            defaultGuestName={guestName !== "Bapak/Ibu/Saudara/i" ? guestName : ""}
            activeSessionCode={activeSessionCode}
            initialWishes={initialWishes}
          />
        </section>

        {/* QR Checkin */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/10">
          <ReceptionQrCheckin guestName={guestName} sessionCode={activeSessionCode} />
        </section>

        {/* Islamic Footer */}
        <footer className="text-center py-12 space-y-3 border-t border-emerald-900/15">
          <OrnamentMoroccanArch className="w-12 h-12 text-[#0A4433] mx-auto" />
          <p className="text-2xl font-serif-luxury font-bold text-[#0A4433]">
            {bride.name} & {groom.name}
          </p>
          <p className="text-xs text-emerald-800/80">
            Jazakumullah Khairan Katsiran atas segala doa restu yang diberikan
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-700/70 pt-2">
            <span>Dihadirkan dari Kebumen melalui HariKita</span>
            <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
          </div>
        </footer>
      </main>
    </div>
  );
};
