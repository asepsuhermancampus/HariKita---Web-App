"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { OrnamentMinimalLine } from "@/components/invitation/ornaments/OrnamentMinimalLine";
import {
  Calendar,
  Clock,
  MapPin,
  Heart,
  Instagram,
  Send,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";
import { LuxuryBankCard, AddToCalendarButton, GalleryLightboxModal } from "@/components/invitation/cards";

export const MinimalistEngine: React.FC<DedicatedTemplateProps> = ({
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
}) => {
  const [wishes, setWishes] = useState(initialWishes);
  const [newWishName, setNewWishName] = useState(guestName || "");
  const [newWishMessage, setNewWishMessage] = useState("");
  const [attendance, setAttendance] = useState("hadir");
  const [selectedSession, setSelectedSession] = useState<"s1" | "s2" | "s3">(activeSessionCode || "s1");
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleSendWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishName.trim() || !newWishMessage.trim()) return;

    const newEntry = {
      id: "w-" + Date.now(),
      guestName: newWishName,
      attendance,
      paxCount: attendance === "hadir" ? 2 : 0,
      message: newWishMessage,
      createdAt: new Date().toISOString(),
    };

    setWishes([newEntry, ...wishes]);
    setNewWishMessage("");
  };

  const formattedDate = new Date(eventDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const activeSession = sessions[selectedSession] || sessions.s1;

  return (
    <div className="relative w-full min-h-screen bg-white text-neutral-900 font-sans overflow-x-hidden selection:bg-neutral-900 selection:text-white">
      {/* Hairline 1px borders surrounding the container */}
      <div className="pointer-events-none fixed inset-0 border border-neutral-200 z-20" />

      {/* ===================== SECTION 1: HERO (#hero) ===================== */}
      <section
        id="hero"
        className="relative min-h-[92vh] flex flex-col justify-between p-8 pt-12 border-b border-neutral-200"
      >
        <div className="flex items-center justify-between text-xs tracking-[0.3em] uppercase text-neutral-500 border-b border-neutral-200 pb-4">
          <span>VOL. 26 // ISSUE 11</span>
          <span>KEBUMEN, ID</span>
        </div>

        <div className="my-auto space-y-8 py-8">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.4em] text-neutral-400 font-mono block">
              EDITORIAL WEDDING
            </span>
            <h1 className="text-5xl sm:text-6xl font-serif tracking-tight leading-none text-neutral-950 font-normal">
              {bride.name}
              <span className="italic font-light text-neutral-400 block sm:inline"> &amp; </span>
              {groom.name}
            </h1>
          </div>

          <div className="aspect-[4/5] w-full max-w-sm mx-auto overflow-hidden bg-neutral-100 border border-neutral-200 grayscale contrast-125">
            <img
              src={bride.photo || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600"}
              alt="Editorial Cover"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between text-xs text-neutral-600 border-t border-neutral-200">
          <span className="font-mono">{formattedDate}</span>
          <span className="uppercase tracking-widest">{activeSession.venueName}</span>
        </div>
      </section>

      {/* ===================== SECTION 2: COUPLE (#couple) ===================== */}
      <section id="couple" className="py-20 px-8 border-b border-neutral-200 space-y-16">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <span className="font-mono text-xs text-neutral-400">01 / PROTAGONISTS</span>
          <span className="text-xs uppercase tracking-widest font-medium">THE COUPLE</span>
        </div>

        {/* Bride Editorial Card */}
        <div className="grid grid-cols-1 gap-6">
          <div className="aspect-[3/4] overflow-hidden bg-neutral-100 border border-neutral-200 grayscale">
            <img src={bride.photo} alt={bride.fullName} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-mono">01.1 // THE BRIDE</span>
            <h3 className="text-3xl font-serif tracking-tight text-neutral-950">{bride.fullName}</h3>
            <p className="text-xs text-neutral-500 leading-relaxed font-serif italic">
              Daughter of Mr. {bride.father} &amp; Mrs. {bride.mother}
            </p>
            {bride.instagram && (
              <a
                href={`https://instagram.com/${bride.instagram}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-neutral-900 border-b border-neutral-900 pb-0.5 hover:opacity-60 transition-opacity"
              >
                <span>@{bride.instagram}</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Groom Editorial Card */}
        <div className="grid grid-cols-1 gap-6 pt-8 border-t border-neutral-200">
          <div className="aspect-[3/4] overflow-hidden bg-neutral-100 border border-neutral-200 grayscale">
            <img src={groom.photo} alt={groom.fullName} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-mono">01.2 // THE GROOM</span>
            <h3 className="text-3xl font-serif tracking-tight text-neutral-950">{groom.fullName}</h3>
            <p className="text-xs text-neutral-500 leading-relaxed font-serif italic">
              Son of Mr. {groom.father} &amp; Mrs. {groom.mother}
            </p>
            {groom.instagram && (
              <a
                href={`https://instagram.com/${groom.instagram}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-neutral-900 border-b border-neutral-900 pb-0.5 hover:opacity-60 transition-opacity"
              >
                <span>@{groom.instagram}</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ===================== SECTION 3: EVENT (#event) ===================== */}
      <section id="event" className="py-20 px-8 border-b border-neutral-200 space-y-12 bg-neutral-50">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <span className="font-mono text-xs text-neutral-400">02 / ITINERARY</span>
          <span className="text-xs uppercase tracking-widest font-medium">SCHEDULE</span>
        </div>

        {/* Multi-Session Tabs */}
        <div className="flex border border-neutral-300 divide-x divide-neutral-300">
          {(["s1", "s2", "s3"] as const).map((key) => {
            const sess = sessions[key];
            if (!sess) return null;
            return (
              <button
                key={key}
                onClick={() => setSelectedSession(key)}
                className={`flex-1 py-3 text-xs uppercase tracking-wider font-mono transition-colors ${
                  selectedSession === key
                    ? "bg-neutral-950 text-white"
                    : "bg-white text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {sess.title.split(" ")[0]}
              </button>
            );
          })}
        </div>

        {/* Active Session Editorial Block */}
        <div className="bg-white border border-neutral-200 p-8 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
              SLOT: {activeSession.sessionCode.toUpperCase()}
            </span>
            <h3 className="text-2xl font-serif text-neutral-950">{activeSession.title}</h3>
          </div>

          <div className="space-y-3 py-4 border-y border-neutral-200 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-neutral-400 uppercase">DATE:</span>
              <span className="text-neutral-950 font-bold">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400 uppercase">HOURS:</span>
              <span className="text-neutral-950 font-bold">{activeSession.timeSlot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400 uppercase">LOCATION:</span>
              <span className="text-neutral-950 font-bold text-right">{activeSession.venueName}</span>
            </div>
            <p className="text-[11px] text-neutral-500 text-right">{activeSession.venueAddress}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-neutral-950 text-white text-xs font-mono uppercase tracking-widest hover:bg-neutral-800 transition-colors min-h-[44px]"
            >
              <span>GOOGLE MAPS</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <AddToCalendarButton
              title={`${activeSession.title} ${bride.name} & ${groom.name}`}
              description={`Celebration at ${activeSession.venueName}. Slot: ${activeSession.timeSlot}`}
              location={`${activeSession.venueName}, ${activeSession.venueAddress}`}
              startDate={eventDate}
              endDate={eventDate}
              primaryColor="#171717"
              accentColor="#525252"
            />
          </div>
        </div>
      </section>

      {/* ===================== SECTION 4: STORY (#story) ===================== */}
      <section id="story" className="py-20 px-8 border-b border-neutral-200 space-y-12">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <span className="font-mono text-xs text-neutral-400">03 / ARCHIVE</span>
          <span className="text-xs uppercase tracking-widest font-medium">CHRONOLOGY</span>
        </div>

        <div className="divide-y divide-neutral-200">
          {storyTimeline.map((item, idx) => (
            <div key={idx} className="py-6 space-y-2">
              <span className="text-xs font-mono text-neutral-400">{item.year}</span>
              <h4 className="text-xl font-serif text-neutral-950">{item.title}</h4>
              <p className="text-xs text-neutral-600 leading-relaxed font-serif">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== SECTION 5: GALLERY (#gallery) ===================== */}
      <section id="gallery" className="py-20 px-8 border-b border-neutral-200 space-y-12 bg-neutral-50">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <span className="font-mono text-xs text-neutral-400">04 / VISUALS</span>
          <span className="text-xs uppercase tracking-widest font-medium">EXHIBITION</span>
        </div>

        <div className="space-y-4">
          {galleryPhotos.map((photo, idx) => (
            <div
              key={idx}
              onClick={() => {
                setLightboxIndex(idx);
                setIsLightboxOpen(true);
              }}
              className="aspect-[4/3] overflow-hidden bg-neutral-200 border border-neutral-300 grayscale contrast-110 cursor-pointer group"
            >
              <img
                src={photo}
                alt={`Editorial ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          ))}
        </div>

        {/* Fullscreen Interactive Lightbox */}
        <GalleryLightboxModal
          photos={galleryPhotos}
          currentIndex={lightboxIndex}
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          onIndexChange={setLightboxIndex}
        />
      </section>

      {/* ===================== SECTION 6: DIGITAL GIFT (#gift) ===================== */}
      <section id="gift" className="py-20 px-8 border-b border-neutral-200 space-y-12">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <span className="font-mono text-xs text-neutral-400">05 / CONTRIBUTION</span>
          <span className="text-xs uppercase tracking-widest font-medium">WEDDING GIFT</span>
        </div>

        <p className="text-xs text-neutral-600 font-serif leading-relaxed">
          Your presence at our celebration is the greatest gift of all. However, should you wish to honour us with a cashless token:
        </p>

        <div className="space-y-4">
          {giftInfo.banks.map((b, idx) => (
            <LuxuryBankCard
              key={idx}
              bank={b.bank}
              number={b.number}
              holder={b.holder}
              coupleNames={`${bride.name} & ${groom.name}`}
              rsvpGuestName={guestName}
              qrisImageUrl="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=HARIKITA-KEBUMEN-MINIMALIST"
            />
          ))}

          <div className="border border-neutral-200 p-6 text-xs font-mono space-y-1">
            <span className="text-neutral-400 uppercase tracking-wider">POSTAL ADDRESS:</span>
            <p className="text-neutral-800 font-serif leading-relaxed">{giftInfo.physicalGiftAddress}</p>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 7: RSVP & WISHES (#rsvp) ===================== */}
      <section id="rsvp" className="py-20 px-8 space-y-12 pb-36">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <span className="font-mono text-xs text-neutral-400">06 / REGISTRY</span>
          <span className="text-xs uppercase tracking-widest font-medium">RSVP &amp; GUESTBOOK</span>
        </div>

        <form onSubmit={handleSendWish} className="border border-neutral-200 p-8 space-y-6">
          <div className="space-y-2 font-mono text-xs">
            <label className="uppercase text-neutral-500">FULL NAME</label>
            <input
              type="text"
              value={newWishName}
              onChange={(e) => setNewWishName(e.target.value)}
              placeholder="YOUR NAME"
              className="w-full p-3 border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950"
              required
            />
          </div>

          <div className="space-y-2 font-mono text-xs">
            <label className="uppercase text-neutral-500">ATTENDANCE</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAttendance("hadir")}
                className={`py-3 uppercase tracking-wider transition-colors ${
                  attendance === "hadir"
                    ? "bg-neutral-950 text-white"
                    : "border border-neutral-300 text-neutral-600"
                }`}
              >
                ATTENDING
              </button>
              <button
                type="button"
                onClick={() => setAttendance("tidak-hadir")}
                className={`py-3 uppercase tracking-wider transition-colors ${
                  attendance === "tidak-hadir"
                    ? "bg-neutral-950 text-white"
                    : "border border-neutral-300 text-neutral-600"
                }`}
              >
                REGRETFULLY NO
              </button>
            </div>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <label className="uppercase text-neutral-500">MESSAGE</label>
            <textarea
              value={newWishMessage}
              onChange={(e) => setNewWishMessage(e.target.value)}
              placeholder="WRITE YOUR CONGRATULATIONS..."
              rows={3}
              className="w-full p-3 border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-neutral-950 text-white text-xs font-mono uppercase tracking-widest hover:bg-neutral-800 transition-colors min-h-[44px]"
          >
            SUBMIT ENTRY
          </button>
        </form>

        <div className="divide-y divide-neutral-200 max-h-96 overflow-y-auto pr-1">
          {wishes.map((w) => (
            <div key={w.id} className="py-4 space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-neutral-950">{w.guestName}</span>
                <span className="text-[10px] uppercase text-neutral-400">
                  {w.attendance === "hadir" ? "CONFIRMED" : "DECLINED"}
                </span>
              </div>
              <p className="text-xs text-neutral-600 font-serif leading-relaxed">{w.message}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
