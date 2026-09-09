"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { AutumnLeavesCanvas } from "@/components/invitation/canvas/AutumnLeavesCanvas";
import {
  Calendar,
  Clock,
  MapPin,
  Heart,
  Instagram,
  Send,
  Sparkles,
  ExternalLink,
  Stamp,
} from "lucide-react";
import { LuxuryBankCard, AddToCalendarButton, GalleryLightboxModal } from "@/components/invitation/cards";
import { RusticPampasTwineSvg } from "@/components/invitation/svg";

export const RusticEngine: React.FC<DedicatedTemplateProps> = ({
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
    <div
      className="relative w-full min-h-screen text-amber-950 font-serif overflow-x-hidden selection:bg-amber-300"
      style={{
        backgroundColor: "#F7F2EA",
        backgroundImage: "radial-gradient(#E8DECE 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      {/* 1. Falling Autumn Leaves Canvas */}
      <AutumnLeavesCanvas className="pointer-events-none opacity-50 z-10" />

      {/* ===================== SECTION 1: HERO (#hero) ===================== */}
      <section
        id="hero"
        className="relative min-h-[92vh] flex flex-col items-center justify-center p-6 text-center space-y-6 pt-12"
      >
        {/* Postal Stamp Cancellation Mark */}
        <div className="relative inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-amber-800/40 rounded-xl text-amber-900 rotate-[-2deg]">
          <Stamp className="w-5 h-5 text-amber-800" />
          <span className="text-xs font-mono font-bold tracking-widest uppercase">
            POSTAGE PAID • KEBUMEN 2026
          </span>
        </div>

        <div className="space-y-2 max-w-xs">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-800 font-sans font-semibold">
            RUSTIC BOTANICAL LOVE
          </p>
          <h1 className="text-4xl font-bold tracking-wide text-amber-950">
            {bride.name} <span className="font-light text-amber-700">&amp;</span> {groom.name}
          </h1>
          <p className="text-xs text-amber-800/80 italic font-serif">
            &ldquo;In all the world, there is no heart for me like yours.&rdquo;
          </p>
        </div>

        {/* Vintage Postcard Styled Hero Couple Photo */}
        <div className="relative p-3 bg-amber-100/80 shadow-2xl rounded-2xl rotate-1 border-2 border-amber-800/20 max-w-[280px] w-full transform hover:rotate-0 transition-transform duration-500">
          <img
            src={bride.photo || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600"}
            alt="Couple"
            className="w-full h-64 object-cover rounded-xl filter sepia-[0.2]"
          />
          <div className="pt-3 pb-1 text-center font-mono text-xs text-amber-900 tracking-wider">
            {formattedDate}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-amber-900 bg-amber-200/50 px-4 py-2 rounded-full border border-amber-300">
          <MapPin className="w-3.5 h-3.5 text-amber-800" />
          <span>{activeSession.venueName}</span>
        </div>
      </section>

      {/* ===================== SECTION 2: COUPLE (#couple) ===================== */}
      <section id="couple" className="py-16 px-6 space-y-12 bg-amber-100/30">
        <div className="text-center space-y-1">
          <RusticPampasTwineSvg className="w-16 h-16 mx-auto mb-2 text-amber-800/80" />
          <span className="text-xs uppercase tracking-widest text-amber-800 font-sans font-semibold">
            The Couple
          </span>
          <h2 className="text-3xl font-bold text-amber-950">Mempelai Bahagia</h2>
          <div className="w-12 h-0.5 bg-amber-800 mx-auto mt-2" />
        </div>

        {/* Bride Card */}
        <div className="bg-amber-50/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-amber-800/20 space-y-4 text-center rotate-[-1deg] hover:rotate-0 transition-transform">
          <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden p-1 border-2 border-amber-800/40">
            <img src={bride.photo} alt={bride.fullName} className="w-full h-full object-cover rounded-full filter sepia-[0.15]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-amber-950">{bride.fullName}</h3>
            <p className="text-xs text-amber-800/80 font-sans">Putri tercinta dari:</p>
            <p className="text-sm font-semibold text-amber-900">
              {bride.father} &amp; {bride.mother}
            </p>
          </div>
          {bride.instagram && (
            <a
              href={`https://instagram.com/${bride.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans bg-amber-200/50 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>@{bride.instagram}</span>
            </a>
          )}
        </div>

        {/* Groom Card */}
        <div className="bg-amber-50/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-amber-800/20 space-y-4 text-center rotate-1 hover:rotate-0 transition-transform">
          <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden p-1 border-2 border-amber-800/40">
            <img src={groom.photo} alt={groom.fullName} className="w-full h-full object-cover rounded-full filter sepia-[0.15]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-amber-950">{groom.fullName}</h3>
            <p className="text-xs text-amber-800/80 font-sans">Putra tercinta dari:</p>
            <p className="text-sm font-semibold text-amber-900">
              {groom.father} &amp; {groom.mother}
            </p>
          </div>
          {groom.instagram && (
            <a
              href={`https://instagram.com/${groom.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans bg-amber-200/50 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>@{groom.instagram}</span>
            </a>
          )}
        </div>
      </section>

      {/* ===================== SECTION 3: EVENT (#event) ===================== */}
      <section id="event" className="py-16 px-6 space-y-8">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-amber-800 font-sans font-semibold">
            Waktu &amp; Lokasi
          </span>
          <h2 className="text-3xl font-bold text-amber-950">Rangkaian Acara</h2>
          <div className="w-12 h-0.5 bg-amber-800 mx-auto mt-2" />
        </div>

        {/* Multi-Session Tabs */}
        <div className="flex items-center justify-center gap-2 p-1 bg-amber-200/40 rounded-full border border-amber-300 max-w-xs mx-auto">
          {(["s1", "s2", "s3"] as const).map((key) => {
            const sess = sessions[key];
            if (!sess) return null;
            return (
              <button
                key={key}
                onClick={() => setSelectedSession(key)}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-sans font-medium transition-all ${
                  selectedSession === key
                    ? "bg-amber-900 text-amber-50 shadow-md"
                    : "text-amber-900/70 hover:text-amber-950"
                }`}
              >
                {sess.title.split(" ")[0]}
              </button>
            );
          })}
        </div>

        {/* Active Session Card */}
        <div className="bg-amber-50 rounded-3xl p-6 shadow-xl border-2 border-amber-800/30 space-y-6 text-center">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-amber-950">{activeSession.title}</h3>
            <p className="text-xs font-sans text-amber-800 font-bold uppercase tracking-wider">
              Sesi: {activeSession.sessionCode.toUpperCase()}
            </p>
          </div>

          <div className="space-y-3 py-3 border-y border-dashed border-amber-800/30 font-sans">
            <div className="flex items-center justify-center gap-2 text-sm text-amber-950">
              <Calendar className="w-4 h-4 text-amber-800" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-amber-950">
              <Clock className="w-4 h-4 text-amber-800" />
              <span className="font-bold text-amber-900">{activeSession.timeSlot}</span>
            </div>
            <div className="flex items-start justify-center gap-2 text-sm text-amber-950 max-w-xs mx-auto">
              <MapPin className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-bold text-amber-950">{activeSession.venueName}</p>
                <p className="text-xs text-amber-800/70">{activeSession.venueAddress}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-amber-900 text-amber-50 text-xs font-sans font-bold uppercase tracking-wider shadow-lg hover:bg-amber-950 transition-colors min-h-[44px]"
            >
              <MapPin className="w-4 h-4" />
              <span>Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <AddToCalendarButton
              title={`${activeSession.title} ${bride.name} & ${groom.name}`}
              description={`Undangan Pernikahan Rustic di ${activeSession.venueName}. Sesi: ${activeSession.timeSlot}`}
              location={`${activeSession.venueName}, ${activeSession.venueAddress}`}
              startDate={eventDate}
              endDate={eventDate}
              primaryColor="#78350F"
              accentColor="#D97706"
            />
          </div>
        </div>
      </section>

      {/* ===================== SECTION 4: STORY (#story) ===================== */}
      <section id="story" className="py-16 px-6 space-y-8 bg-amber-100/30">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-amber-800 font-sans font-semibold">
            Perjalanan Kami
          </span>
          <h2 className="text-3xl font-bold text-amber-950">Kisah Kasih</h2>
          <div className="w-12 h-0.5 bg-amber-800 mx-auto mt-2" />
        </div>

        <div className="relative border-l-2 border-amber-800/30 ml-4 pl-6 space-y-8">
          {storyTimeline.map((item, idx) => (
            <div key={idx} className="relative space-y-1.5">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-800 border-2 border-amber-50 shadow" />
              <span className="text-xs font-mono font-bold text-amber-900 tracking-wider">{item.year}</span>
              <h4 className="text-lg font-bold text-amber-950">{item.title}</h4>
              <p className="text-xs text-amber-800/80 leading-relaxed font-sans">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== SECTION 5: GALLERY (#gallery) ===================== */}
      <section id="gallery" className="py-16 px-6 space-y-8">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-amber-800 font-sans font-semibold">
            Kenangan Indah
          </span>
          <h2 className="text-3xl font-bold text-amber-950">Galeri Foto</h2>
          <div className="w-12 h-0.5 bg-amber-800 mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {galleryPhotos.map((photo, idx) => (
            <div
              key={idx}
              onClick={() => {
                setLightboxIndex(idx);
                setIsLightboxOpen(true);
              }}
              className={`rounded-2xl overflow-hidden shadow-md border-2 border-amber-800/20 cursor-pointer group ${
                idx % 3 === 0 ? "col-span-2 h-56" : "h-40"
              }`}
            >
              <img
                src={photo}
                alt={`Galeri ${idx + 1}`}
                className="w-full h-full object-cover filter sepia-[0.15] group-hover:scale-105 transition-transform duration-500"
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
      <section id="gift" className="py-16 px-6 space-y-8 bg-amber-100/30">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-amber-800 font-sans font-semibold">
            Tanda Kasih
          </span>
          <h2 className="text-3xl font-bold text-amber-950">Kado Pernikahan</h2>
          <p className="text-xs text-amber-800/80 max-w-xs mx-auto font-sans">
            Doa dan restu Anda adalah anugerah terbesar bagi kami:
          </p>
        </div>

        <div className="space-y-4">
          {giftInfo.banks.map((b, idx) => (
            <LuxuryBankCard
              key={idx}
              bank={b.bank}
              number={b.number}
              holder={b.holder}
              coupleNames={`${bride.name} & ${groom.name}`}
              rsvpGuestName={guestName}
              qrisImageUrl="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=HARIKITA-KEBUMEN-RUSTIC"
            />
          ))}

          <div className="bg-amber-200/40 rounded-2xl p-4 border border-amber-300 text-xs font-sans space-y-1.5">
            <span className="font-bold text-amber-950">Alamat Kirim Kado Fisik:</span>
            <p className="text-amber-900/80 leading-relaxed">{giftInfo.physicalGiftAddress}</p>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 7: RSVP & WISHES (#rsvp) ===================== */}
      <section id="rsvp" className="py-16 px-6 space-y-8 pb-32">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-amber-800 font-sans font-semibold">
            Buku Tamu
          </span>
          <h2 className="text-3xl font-bold text-amber-950">Doa &amp; Ucapan</h2>
          <div className="w-12 h-0.5 bg-amber-800 mx-auto mt-2" />
        </div>

        <form onSubmit={handleSendWish} className="bg-amber-50 rounded-3xl p-6 shadow-xl border border-amber-800/20 space-y-4 font-sans">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-amber-950">Nama Lengkap</label>
            <input
              type="text"
              value={newWishName}
              onChange={(e) => setNewWishName(e.target.value)}
              placeholder="Nama Anda..."
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-amber-300 text-sm focus:outline-none focus:border-amber-800"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-amber-950">Kehadiran</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAttendance("hadir")}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  attendance === "hadir"
                    ? "bg-amber-900 text-white border-amber-900 font-bold"
                    : "bg-white text-amber-900 border-amber-300"
                }`}
              >
                Hadir
              </button>
              <button
                type="button"
                onClick={() => setAttendance("tidak-hadir")}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  attendance === "tidak-hadir"
                    ? "bg-amber-700 text-white border-amber-700 font-bold"
                    : "bg-white text-amber-900 border-amber-300"
                }`}
              >
                Berhalangan
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-amber-950">Doa Restu</label>
            <textarea
              value={newWishMessage}
              onChange={(e) => setNewWishMessage(e.target.value)}
              placeholder="Tuliskan ucapan dan doa Anda..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-amber-300 text-sm focus:outline-none focus:border-amber-800"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-amber-900 text-amber-50 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:bg-amber-950 transition-colors min-h-[44px]"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Doa Restu</span>
          </button>
        </form>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {wishes.map((w) => (
            <div key={w.id} className="bg-amber-50/90 backdrop-blur-sm rounded-2xl p-4 border border-amber-800/15 shadow-sm space-y-1 font-sans">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-amber-950">{w.guestName}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    w.attendance === "hadir"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-200 text-amber-900"
                  }`}
                >
                  {w.attendance === "hadir" ? "Hadir" : "Berhalangan"}
                </span>
              </div>
              <p className="text-xs text-amber-900/90">{w.message}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
