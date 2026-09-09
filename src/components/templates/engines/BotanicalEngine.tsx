"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { FloatingPetalsCanvas } from "@/components/invitation/canvas/FloatingPetalsCanvas";
import { OrnamentFloralWreath } from "@/components/invitation/ornaments/OrnamentFloralWreath";
import {
  Calendar,
  Clock,
  MapPin,
  Heart,
  Instagram,
  Copy,
  Check,
  Send,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export const BotanicalEngine: React.FC<DedicatedTemplateProps> = ({
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
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<"s1" | "s2" | "s3">(activeSessionCode || "s1");

  const primaryColor = theme?.colors?.primary || "#5C6F57";
  const accentColor = theme?.colors?.accent || "#B85D3B";

  const handleCopy = (text: string, bankName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(bankName);
    setTimeout(() => setCopiedBank(null), 2500);
  };

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
      className="relative w-full min-h-screen text-slate-800 font-sans overflow-x-hidden selection:bg-emerald-200"
      style={{
        backgroundColor: theme?.colors?.background || "#FAF7F5",
        color: theme?.colors?.text || "#261F23",
      }}
    >
      {/* 1. Floating Falling Leaves & Petals Canvas */}
      <FloatingPetalsCanvas className="pointer-events-none opacity-60 z-10" />

      {/* 2. Four-Corner Botanical Sway Accents */}
      <div className="pointer-events-none fixed top-0 left-0 w-24 h-24 z-20 opacity-40 animate-pulse">
        <svg viewBox="0 0 100 100" fill={primaryColor}>
          <path d="M0,0 Q50,10 70,70 Q20,50 0,0 Z" />
          <path d="M10,0 Q60,30 40,80 Q20,30 10,0 Z" opacity="0.6" />
        </svg>
      </div>
      <div className="pointer-events-none fixed top-0 right-0 w-24 h-24 z-20 opacity-40 -scale-x-100 animate-pulse">
        <svg viewBox="0 0 100 100" fill={primaryColor}>
          <path d="M0,0 Q50,10 70,70 Q20,50 0,0 Z" />
        </svg>
      </div>

      {/* ===================== SECTION 1: HERO (#hero) ===================== */}
      <section
        id="hero"
        className="relative min-h-[90vh] flex flex-col items-center justify-center p-6 text-center space-y-6 pt-12"
      >
        <div className="relative">
          <OrnamentFloralWreath color={primaryColor} size={130} className="animate-spin-slow opacity-80" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-serif font-bold text-amber-800">
              {bride.name.charAt(0)} &amp; {groom.name.charAt(0)}
            </span>
          </div>
        </div>

        <div className="space-y-2 max-w-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-widest uppercase bg-emerald-900/10 text-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Wedding of</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-4xl font-serif font-bold tracking-wide text-emerald-950">
            {bride.name} <span className="font-light text-amber-700">&amp;</span> {groom.name}
          </h1>
          <p className="text-xs text-slate-600 font-serif italic">
            &ldquo;Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu...&rdquo;
          </p>
        </div>

        {/* Polaroid Style Couple Hero Card */}
        <div className="relative p-3 bg-white shadow-xl rounded-2xl rotate-[-1deg] border border-amber-900/10 max-w-[280px] w-full transform hover:rotate-0 transition-transform duration-500">
          <img
            src={bride.photo || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600"}
            alt="Couple"
            className="w-full h-64 object-cover rounded-xl"
          />
          <div className="pt-3 pb-1 text-center font-serif text-sm font-semibold text-emerald-950">
            {formattedDate}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-100/60 px-4 py-2 rounded-full border border-emerald-300/40">
          <MapPin className="w-3.5 h-3.5 text-amber-700" />
          <span>{activeSession.venueName}</span>
        </div>
      </section>

      {/* ===================== SECTION 2: COUPLE (#couple) ===================== */}
      <section id="couple" className="py-16 px-6 space-y-12">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-emerald-800 font-semibold">
            Sang Mempelai
          </span>
          <h2 className="text-3xl font-serif font-bold text-emerald-950">Kedua Mempelai</h2>
          <div className="w-12 h-0.5 bg-amber-700 mx-auto mt-2" />
        </div>

        {/* Bride Polaroid Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-emerald-800/10 space-y-4 text-center rotate-1 hover:rotate-0 transition-transform">
          <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden p-1 border-2 border-emerald-700/30">
            <img src={bride.photo} alt={bride.fullName} className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-bold text-emerald-950">{bride.fullName}</h3>
            <p className="text-xs text-slate-600">Putri tercinta dari:</p>
            <p className="text-sm font-serif font-semibold text-emerald-900">
              {bride.father} &amp; {bride.mother}
            </p>
          </div>
          {bride.instagram && (
            <a
              href={`https://instagram.com/${bride.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>@{bride.instagram}</span>
            </a>
          )}
        </div>

        {/* Groom Polaroid Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-emerald-800/10 space-y-4 text-center -rotate-1 hover:rotate-0 transition-transform">
          <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden p-1 border-2 border-emerald-700/30">
            <img src={groom.photo} alt={groom.fullName} className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-bold text-emerald-950">{groom.fullName}</h3>
            <p className="text-xs text-slate-600">Putra tercinta dari:</p>
            <p className="text-sm font-serif font-semibold text-emerald-900">
              {groom.father} &amp; {groom.mother}
            </p>
          </div>
          {groom.instagram && (
            <a
              href={`https://instagram.com/${groom.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>@{groom.instagram}</span>
            </a>
          )}
        </div>
      </section>

      {/* ===================== SECTION 3: EVENT (#event) ===================== */}
      <section id="event" className="py-16 px-6 bg-emerald-900/5 space-y-8">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-emerald-800 font-semibold">
            Jadwal Rangkaian
          </span>
          <h2 className="text-3xl font-serif font-bold text-emerald-950">Waktu &amp; Tempat</h2>
          <div className="w-12 h-0.5 bg-amber-700 mx-auto mt-2" />
        </div>

        {/* Multi-Session Tabs */}
        <div className="flex items-center justify-center gap-2 p-1 bg-white/60 rounded-full border border-emerald-200 max-w-xs mx-auto">
          {(["s1", "s2", "s3"] as const).map((key) => {
            const sess = sessions[key];
            if (!sess) return null;
            return (
              <button
                key={key}
                onClick={() => setSelectedSession(key)}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition-all ${
                  selectedSession === key
                    ? "bg-emerald-800 text-white shadow-md"
                    : "text-slate-600 hover:text-emerald-950"
                }`}
              >
                {sess.title.split(" ")[0]}
              </button>
            );
          })}
        </div>

        {/* Active Session Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-emerald-800/15 space-y-6 text-center">
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-bold text-emerald-950">{activeSession.title}</h3>
            <p className="text-xs text-amber-800 font-medium tracking-wide">
              Khusus Tamu Sesi: {activeSession.sessionCode.toUpperCase()}
            </p>
          </div>

          <div className="space-y-3 py-2 border-y border-dashed border-emerald-200">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-700">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-700">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span className="font-semibold text-emerald-900">{activeSession.timeSlot}</span>
            </div>
            <div className="flex items-start justify-center gap-2 text-sm text-slate-700 max-w-xs mx-auto">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-bold text-emerald-950">{activeSession.venueName}</p>
                <p className="text-xs text-slate-500">{activeSession.venueAddress}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-emerald-800 text-white text-xs font-semibold shadow-md hover:bg-emerald-900 transition-colors min-h-[44px]"
            >
              <MapPin className="w-4 h-4" />
              <span>Buka Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 4: STORY (#story) ===================== */}
      <section id="story" className="py-16 px-6 space-y-8">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-emerald-800 font-semibold">
            Jejak Kebersamaan
          </span>
          <h2 className="text-3xl font-serif font-bold text-emerald-950">Kisah Cinta Kami</h2>
          <div className="w-12 h-0.5 bg-amber-700 mx-auto mt-2" />
        </div>

        <div className="relative border-l-2 border-emerald-300/60 ml-4 pl-6 space-y-8">
          {storyTimeline.map((item, idx) => (
            <div key={idx} className="relative space-y-1.5">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-700 border-2 border-white shadow" />
              <span className="text-xs font-bold text-amber-800 tracking-wider font-mono">{item.year}</span>
              <h4 className="text-lg font-serif font-bold text-emerald-950">{item.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== SECTION 5: GALLERY (#gallery) ===================== */}
      <section id="gallery" className="py-16 px-6 bg-emerald-900/5 space-y-8">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-emerald-800 font-semibold">
            Momen Bahagia
          </span>
          <h2 className="text-3xl font-serif font-bold text-emerald-950">Galeri Foto</h2>
          <div className="w-12 h-0.5 bg-amber-700 mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {galleryPhotos.map((photo, idx) => (
            <div
              key={idx}
              className={`rounded-2xl overflow-hidden shadow-md border border-white/60 ${
                idx % 3 === 0 ? "col-span-2 h-56" : "h-40"
              }`}
            >
              <img src={photo} alt={`Galeri ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* ===================== SECTION 6: DIGITAL GIFT (#gift) ===================== */}
      <section id="gift" className="py-16 px-6 space-y-8">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-emerald-800 font-semibold">
            Tanda Kasih
          </span>
          <h2 className="text-3xl font-serif font-bold text-emerald-950">Kado Digital</h2>
          <p className="text-xs text-slate-600 max-w-xs mx-auto">
            Doa restu Anda merupakan karunia terindah bagi kami. Jika ingin memberikan tanda kasih secara cashless:
          </p>
        </div>

        <div className="space-y-4">
          {giftInfo.banks.map((b, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 shadow-lg border border-emerald-200 flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-900 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                  {b.bank}
                </span>
                <p className="text-lg font-mono font-bold text-slate-900">{b.number}</p>
                <p className="text-xs text-slate-500">a.n. {b.holder}</p>
              </div>

              <button
                onClick={() => handleCopy(b.number, b.bank)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-all text-xs font-semibold min-h-[44px]"
              >
                {copiedBank === b.bank ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
          ))}

          {/* Physical Gift Address */}
          <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 text-xs space-y-1.5">
            <span className="font-bold text-emerald-950">Kirim Kado Fisik:</span>
            <p className="text-slate-700 leading-relaxed">{giftInfo.physicalGiftAddress}</p>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 7: RSVP & WISHES (#rsvp) ===================== */}
      <section id="rsvp" className="py-16 px-6 bg-emerald-900/5 space-y-8 pb-32">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-emerald-800 font-semibold">
            Buku Tamu
          </span>
          <h2 className="text-3xl font-serif font-bold text-emerald-950">Ucapan &amp; Konfirmasi</h2>
          <div className="w-12 h-0.5 bg-amber-700 mx-auto mt-2" />
        </div>

        {/* Form RSVP */}
        <form onSubmit={handleSendWish} className="bg-white rounded-3xl p-6 shadow-xl border border-emerald-200 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Nama Anda</label>
            <input
              type="text"
              value={newWishName}
              onChange={(e) => setNewWishName(e.target.value)}
              placeholder="Tuliskan nama Anda"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-600"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Konfirmasi Kehadiran</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAttendance("hadir")}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  attendance === "hadir"
                    ? "bg-emerald-800 text-white border-emerald-800"
                    : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                Hadir
              </button>
              <button
                type="button"
                onClick={() => setAttendance("tidak-hadir")}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  attendance === "tidak-hadir"
                    ? "bg-amber-800 text-white border-amber-800"
                    : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                Tidak Hadir
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Doa &amp; Ucapan</label>
            <textarea
              value={newWishMessage}
              onChange={(e) => setNewWishMessage(e.target.value)}
              placeholder="Tuliskan doa restu untuk kedua mempelai..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-600"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:bg-emerald-900 transition-colors min-h-[44px]"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Ucapan</span>
          </button>
        </form>

        {/* Live Wishes Stream */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {wishes.map((w) => (
            <div key={w.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-emerald-100 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-emerald-950">{w.guestName}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    w.attendance === "hadir"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {w.attendance === "hadir" ? "Hadir" : "Berhalangan"}
                </span>
              </div>
              <p className="text-xs text-slate-700">{w.message}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
