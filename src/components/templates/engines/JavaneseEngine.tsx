"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { GoldenDustCanvas } from "@/components/invitation/canvas/GoldenDustCanvas";
import { OrnamentGunungan } from "@/components/invitation/ornaments/OrnamentGunungan";
import {
  Calendar,
  Clock,
  MapPin,
  Heart,
  Instagram,
  Send,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { LuxuryBankCard, AddToCalendarButton, GalleryLightboxModal } from "@/components/invitation/cards";
import { KebumenWaletSvg } from "@/components/invitation/svg";

export const JavaneseEngine: React.FC<DedicatedTemplateProps> = ({
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

  const goldColor = "#CCA873";
  const teakColor = "#261712";

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
      className="relative w-full min-h-screen text-amber-100 font-serif overflow-x-hidden selection:bg-amber-800"
      style={{
        backgroundColor: teakColor,
        backgroundImage: "radial-gradient(circle at center, #3a221b 0%, #1a0f0b 100%)",
      }}
    >
      {/* 1. Golden Dust Sparks Canvas */}
      <GoldenDustCanvas className="pointer-events-none opacity-50 z-10" />

      {/* 2. Traditional Gebyok Wood Frame Borders */}
      <div className="pointer-events-none fixed inset-0 border-[8px] sm:border-[12px] border-amber-800/30 z-20" />

      {/* ===================== SECTION 1: HERO (#hero) ===================== */}
      <section
        id="hero"
        className="relative min-h-[95vh] flex flex-col items-center justify-center p-6 text-center space-y-6 pt-12"
      >
        {/* Gunungan Gate Header */}
        <div className="relative flex items-center justify-center">
          <OrnamentGunungan color={goldColor} size={150} className="filter drop-shadow-[0_4px_12px_rgba(204,168,115,0.4)]" />
        </div>

        <div className="space-y-2 max-w-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-sans tracking-[0.25em] uppercase bg-amber-400/10 text-amber-300 border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Serat Ulem Pawiwahan</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-4xl font-bold tracking-wider text-amber-200">
            {bride.name} <span className="text-amber-400 font-light">&amp;</span> {groom.name}
          </h1>
          <p className="text-xs text-amber-300/70 italic max-w-xs mx-auto">
            Nyuwun sih wilasa lan berkahing Gusti Ingkang Murbeng Dumadi
          </p>
        </div>

        {/* Gebyok Framed Couple Photo */}
        <div className="relative p-2.5 bg-gradient-to-b from-amber-700 via-amber-900 to-amber-950 rounded-3xl shadow-2xl border-2 border-amber-400/50 max-w-[280px] w-full">
          <img
            src={bride.photo || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600"}
            alt="Couple"
            className="w-full h-64 object-cover rounded-2xl filter sepia-[0.15]"
          />
          <div className="pt-3 pb-1 text-center text-xs tracking-widest text-amber-300 uppercase">
            {formattedDate}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-amber-200 bg-amber-950/80 px-4 py-2 rounded-full border border-amber-400/40">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>{activeSession.venueName}</span>
        </div>
      </section>

      {/* ===================== SECTION 2: COUPLE (#couple) ===================== */}
      <section id="couple" className="py-16 px-6 space-y-12 bg-black/30">
        <div className="text-center space-y-1">
          <span className="text-xs font-sans uppercase tracking-widest text-amber-400/80">
            Dhahat Kinurmatan
          </span>
          <h2 className="text-3xl font-bold text-amber-200">Penganten Sarimbit</h2>
          <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-2" />
        </div>

        {/* Bride Card */}
        <div className="bg-gradient-to-b from-amber-950/60 to-black/80 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-amber-400/30 space-y-4 text-center">
          <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden p-1.5 border-2 border-amber-400/60">
            <img src={bride.photo} alt={bride.fullName} className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-amber-200">{bride.fullName}</h3>
            <p className="text-xs text-amber-300/70 font-sans">Putri panjenenganipun:</p>
            <p className="text-sm font-semibold text-amber-100">
              {bride.father} &amp; {bride.mother}
            </p>
          </div>
          {bride.instagram && (
            <a
              href={`https://instagram.com/${bride.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans bg-amber-400/10 text-amber-300 border border-amber-400/30 hover:bg-amber-400/20 transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>@{bride.instagram}</span>
            </a>
          )}
        </div>

        {/* Groom Card */}
        <div className="bg-gradient-to-b from-amber-950/60 to-black/80 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-amber-400/30 space-y-4 text-center">
          <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden p-1.5 border-2 border-amber-400/60">
            <img src={groom.photo} alt={groom.fullName} className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-amber-200">{groom.fullName}</h3>
            <p className="text-xs text-amber-300/70 font-sans">Putra panjenenganipun:</p>
            <p className="text-sm font-semibold text-amber-100">
              {groom.father} &amp; {groom.mother}
            </p>
          </div>
          {groom.instagram && (
            <a
              href={`https://instagram.com/${groom.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans bg-amber-400/10 text-amber-300 border border-amber-400/30 hover:bg-amber-400/20 transition-colors"
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
          <span className="text-xs font-sans uppercase tracking-widest text-amber-400/80">
            Tititiwanci Pawiwahan
          </span>
          <h2 className="text-3xl font-bold text-amber-200">Wekdal &amp; Papan</h2>
          <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-2" />
        </div>

        {/* Multi-Session Tabs */}
        <div className="flex items-center justify-center gap-2 p-1 bg-amber-950/60 rounded-full border border-amber-400/30 max-w-xs mx-auto">
          {(["s1", "s2", "s3"] as const).map((key) => {
            const sess = sessions[key];
            if (!sess) return null;
            return (
              <button
                key={key}
                onClick={() => setSelectedSession(key)}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-sans font-medium transition-all ${
                  selectedSession === key
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-bold"
                    : "text-amber-200/70 hover:text-amber-200"
                }`}
              >
                {sess.title.split(" ")[0]}
              </button>
            );
          })}
        </div>

        {/* Active Session Card */}
        <div className="bg-gradient-to-b from-amber-950/70 via-black/80 to-amber-950/80 rounded-3xl p-6 shadow-2xl border-2 border-amber-400/40 space-y-6 text-center">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-amber-200">{activeSession.title}</h3>
            <p className="text-xs font-sans text-amber-400/90 tracking-wider uppercase">
              Sesi Undangan: {activeSession.sessionCode.toUpperCase()}
            </p>
          </div>

          <div className="space-y-3 py-3 border-y border-dashed border-amber-400/30">
            <div className="flex items-center justify-center gap-2 text-sm text-amber-100">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-amber-100">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="font-sans font-bold text-amber-300">{activeSession.timeSlot}</span>
            </div>
            <div className="flex items-start justify-center gap-2 text-sm text-amber-100 max-w-xs mx-auto">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-left font-sans">
                <p className="font-bold text-amber-200">{activeSession.venueName}</p>
                <p className="text-xs text-amber-200/60">{activeSession.venueAddress}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-sans font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition-transform min-h-[44px]"
            >
              <MapPin className="w-4 h-4" />
              <span>Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <AddToCalendarButton
              title={`${activeSession.title} ${bride.name} & ${groom.name}`}
              description={`Undangan Pernikahan di ${activeSession.venueName}. Sesi: ${activeSession.timeSlot}`}
              location={`${activeSession.venueName}, ${activeSession.venueAddress}`}
              startDate={eventDate}
              endDate={eventDate}
              primaryColor="#78350F"
              accentColor="#F59E0B"
            />
          </div>
        </div>
      </section>

      {/* ===================== SECTION 4: STORY (#story) ===================== */}
      <section id="story" className="py-16 px-6 space-y-8 bg-black/40">
        <div className="text-center space-y-1">
          <span className="text-xs font-sans uppercase tracking-widest text-amber-400/80">
            Lelampahan Katresnan
          </span>
          <h2 className="text-3xl font-bold text-amber-200">Kisah Cinta Kami</h2>
          <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-2" />
        </div>

        <div className="relative border-l-2 border-amber-400/40 ml-4 pl-6 space-y-8">
          {storyTimeline.map((item, idx) => (
            <div key={idx} className="relative space-y-1.5">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-black shadow" />
              <span className="text-xs font-sans font-bold text-amber-300 tracking-wider font-mono">{item.year}</span>
              <h4 className="text-lg font-bold text-amber-100">{item.title}</h4>
              <p className="text-xs font-sans text-amber-200/70 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== SECTION 5: GALLERY (#gallery) ===================== */}
      <section id="gallery" className="py-16 px-6 space-y-8">
        <div className="text-center space-y-1">
          <span className="text-xs font-sans uppercase tracking-widest text-amber-400/80">
            Foto Memori
          </span>
          <h2 className="text-3xl font-bold text-amber-200">Galeri Foto</h2>
          <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {galleryPhotos.map((photo, idx) => (
            <div
              key={idx}
              onClick={() => {
                setLightboxIndex(idx);
                setIsLightboxOpen(true);
              }}
              className={`rounded-2xl overflow-hidden shadow-xl border border-amber-400/30 cursor-pointer group ${
                idx % 3 === 0 ? "col-span-2 h-56" : "h-40"
              }`}
            >
              <img
                src={photo}
                alt={`Galeri ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter sepia-[0.1]"
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
      <section id="gift" className="py-16 px-6 space-y-8 bg-black/40">
        <div className="text-center space-y-1">
          <span className="text-xs font-sans uppercase tracking-widest text-amber-400/80">
            Tali Asih
          </span>
          <h2 className="text-3xl font-bold text-amber-200">Kado Digital</h2>
          <p className="text-xs font-sans text-amber-200/70 max-w-xs mx-auto">
            Maturnuwun sanget awit saking sih kadarman panjenengan sedaya:
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
              qrisImageUrl="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=HARIKITA-KEBUMEN-JAVANESE"
            />
          ))}

          <div className="bg-amber-950/50 rounded-2xl p-4 border border-amber-400/30 text-xs font-sans space-y-1.5">
            <span className="font-bold text-amber-300">Kirim Kado Adat Fisik:</span>
            <p className="text-amber-100/80 leading-relaxed">{giftInfo.physicalGiftAddress}</p>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 7: RSVP & WISHES (#rsvp) ===================== */}
      <section id="rsvp" className="py-16 px-6 space-y-8 pb-32">
        <div className="text-center space-y-1">
          <span className="text-xs font-sans uppercase tracking-widest text-amber-400/80">
            Donga Pangestu
          </span>
          <h2 className="text-3xl font-bold text-amber-200">Buku Tamu &amp; Donga</h2>
          <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-2" />
        </div>

        <form onSubmit={handleSendWish} className="bg-gradient-to-b from-amber-950/80 to-black/90 rounded-3xl p-6 shadow-2xl border border-amber-400/30 space-y-4 font-sans">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-amber-200">Asma Panjenengan</label>
            <input
              type="text"
              value={newWishName}
              onChange={(e) => setNewWishName(e.target.value)}
              placeholder="Asma Panjenengan..."
              className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-amber-400/30 text-white text-sm focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-amber-200">Katrangan Rawuh</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAttendance("hadir")}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  attendance === "hadir"
                    ? "bg-amber-400 text-slate-950 border-amber-400 font-bold"
                    : "bg-black/40 text-amber-200/70 border-amber-400/20"
                }`}
              >
                Kula Rawuh
              </button>
              <button
                type="button"
                onClick={() => setAttendance("tidak-hadir")}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  attendance === "tidak-hadir"
                    ? "bg-amber-700 text-white border-amber-700 font-bold"
                    : "bg-black/40 text-amber-200/70 border-amber-400/20"
                }`}
              >
                Nyenyuwun Pangapunten
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-amber-200">Donga Pangestu</label>
            <textarea
              value={newWishMessage}
              onChange={(e) => setNewWishMessage(e.target.value)}
              placeholder="Serat donga pangestu panjenengan kagem pinanganten..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-amber-400/30 text-white text-sm focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition-transform min-h-[44px]"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Donga Pangestu</span>
          </button>
        </form>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {wishes.map((w) => (
            <div key={w.id} className="bg-amber-950/40 backdrop-blur-sm rounded-2xl p-4 border border-amber-400/20 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-amber-200">{w.guestName}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-medium ${
                    w.attendance === "hadir"
                      ? "bg-emerald-900/60 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-900/60 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {w.attendance === "hadir" ? "Rawuh" : "Nyenyuwun"}
                </span>
              </div>
              <p className="text-xs font-sans text-amber-100/80">{w.message}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
