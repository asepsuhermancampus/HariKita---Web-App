"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { GoldenDustCanvas } from "@/components/invitation/canvas/GoldenDustCanvas";
import { OrnamentMoroccanArch } from "@/components/invitation/ornaments/OrnamentMoroccanArch";
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
  BookOpen,
} from "lucide-react";

export const IslamicEngine: React.FC<DedicatedTemplateProps> = ({
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

  const emeraldColor = "#0D382B";
  const goldColor = "#CCA873";

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
      className="relative w-full min-h-screen text-slate-800 font-sans overflow-x-hidden selection:bg-emerald-800 selection:text-white"
      style={{
        backgroundColor: "#F6F8F6",
        color: "#1B2822",
      }}
    >
      {/* 1. Subtle Golden Dust Glow */}
      <GoldenDustCanvas className="pointer-events-none opacity-40 z-10" />

      {/* ===================== SECTION 1: HERO (#hero) ===================== */}
      <section
        id="hero"
        className="relative min-h-[92vh] flex flex-col items-center justify-center p-6 text-center space-y-6 pt-12"
      >
        {/* Arabic Calligraphy Basmalah */}
        <div className="space-y-1">
          <p className="text-2xl sm:text-3xl font-serif text-emerald-900 tracking-wider">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p className="text-xs text-slate-500 italic">
            &ldquo;Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang&rdquo;
          </p>
        </div>

        {/* Moroccan Arch Header Frame */}
        <div className="relative">
          <OrnamentMoroccanArch color={emeraldColor} size={140} className="filter drop-shadow-md" />
          <div className="absolute inset-0 flex items-center justify-center pt-4">
            <span className="text-2xl font-serif font-bold text-amber-700">
              {bride.name.charAt(0)} &amp; {groom.name.charAt(0)}
            </span>
          </div>
        </div>

        <div className="space-y-2 max-w-xs">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-emerald-900/10 text-emerald-900 border border-emerald-900/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Walimatul &apos;Ursy</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-emerald-950">
            {bride.name} <span className="font-light text-amber-700">&amp;</span> {groom.name}
          </h1>
        </div>

        {/* Ar-Rum 21 Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-emerald-800/15 max-w-xs text-center space-y-2">
          <div className="flex items-center justify-center gap-1 text-xs text-amber-700 font-semibold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Q.S. Ar-Rum: 21</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed italic font-serif">
            &ldquo;Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya...&rdquo;
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-900 bg-emerald-100/70 px-4 py-2 rounded-full border border-emerald-300">
          <MapPin className="w-3.5 h-3.5 text-amber-700" />
          <span>{activeSession.venueName}</span>
        </div>
      </section>

      {/* ===================== SECTION 2: COUPLE (#couple) ===================== */}
      <section id="couple" className="py-16 px-6 space-y-12">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-emerald-800 font-semibold">
            Maha Suci Allah
          </span>
          <h2 className="text-3xl font-serif font-bold text-emerald-950">Kedua Mempelai</h2>
          <div className="w-12 h-0.5 bg-amber-600 mx-auto mt-2" />
        </div>

        {/* Bride Card with Arch Border */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border-t-4 border-t-emerald-800 border-x border-b border-emerald-100 space-y-4 text-center">
          <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden p-1 border-2 border-amber-600/50 shadow-inner">
            <img src={bride.photo} alt={bride.fullName} className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-bold text-emerald-950">{bride.fullName}</h3>
            <p className="text-xs text-slate-500">Putri tercinta dari pasangan:</p>
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

        {/* Groom Card with Arch Border */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border-t-4 border-t-emerald-800 border-x border-b border-emerald-100 space-y-4 text-center">
          <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden p-1 border-2 border-amber-600/50 shadow-inner">
            <img src={groom.photo} alt={groom.fullName} className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-bold text-emerald-950">{groom.fullName}</h3>
            <p className="text-xs text-slate-500">Putra tercinta dari pasangan:</p>
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
            Rangkaian Acara
          </span>
          <h2 className="text-3xl font-serif font-bold text-emerald-950">Akad &amp; Walimah</h2>
          <div className="w-12 h-0.5 bg-amber-600 mx-auto mt-2" />
        </div>

        {/* Multi-Session Tabs */}
        <div className="flex items-center justify-center gap-2 p-1 bg-white rounded-full border border-emerald-200 max-w-xs mx-auto">
          {(["s1", "s2", "s3"] as const).map((key) => {
            const sess = sessions[key];
            if (!sess) return null;
            return (
              <button
                key={key}
                onClick={() => setSelectedSession(key)}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition-all ${
                  selectedSession === key
                    ? "bg-emerald-900 text-white shadow-md font-semibold"
                    : "text-slate-600 hover:text-emerald-950"
                }`}
              >
                {sess.title.split(" ")[0]}
              </button>
            );
          })}
        </div>

        {/* Active Session Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-emerald-200 space-y-6 text-center">
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-bold text-emerald-950">{activeSession.title}</h3>
            <p className="text-xs text-amber-700 font-medium">
              Sesi Kehadiran: {activeSession.sessionCode.toUpperCase()}
            </p>
          </div>

          <div className="space-y-3 py-3 border-y border-dashed border-emerald-200">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-700">
              <Calendar className="w-4 h-4 text-emerald-800" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-700">
              <Clock className="w-4 h-4 text-emerald-800" />
              <span className="font-semibold text-emerald-900">{activeSession.timeSlot}</span>
            </div>
            <div className="flex items-start justify-center gap-2 text-sm text-slate-700 max-w-xs mx-auto">
              <MapPin className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-bold text-emerald-950">{activeSession.venueName}</p>
                <p className="text-xs text-slate-500">{activeSession.venueAddress}</p>
              </div>
            </div>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-full bg-emerald-900 text-white text-xs font-semibold shadow-md hover:bg-emerald-950 transition-colors min-h-[44px]"
          >
            <MapPin className="w-4 h-4" />
            <span>Petunjuk Lokasi Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* ===================== SECTION 4: STORY (#story) ===================== */}
      <section id="story" className="py-16 px-6 space-y-8">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-emerald-800 font-semibold">
            Kisah Syar&apos;i
          </span>
          <h2 className="text-3xl font-serif font-bold text-emerald-950">Ikhtiar &amp; Takdir</h2>
          <div className="w-12 h-0.5 bg-amber-600 mx-auto mt-2" />
        </div>

        <div className="relative border-l-2 border-emerald-400/50 ml-4 pl-6 space-y-8">
          {storyTimeline.map((item, idx) => (
            <div key={idx} className="relative space-y-1.5">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-800 border-2 border-white shadow" />
              <span className="text-xs font-bold text-amber-700 tracking-wider font-mono">{item.year}</span>
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
            Dokumentasi
          </span>
          <h2 className="text-3xl font-serif font-bold text-emerald-950">Galeri Momen</h2>
          <div className="w-12 h-0.5 bg-amber-600 mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {galleryPhotos.map((photo, idx) => (
            <div
              key={idx}
              className={`rounded-2xl overflow-hidden shadow-md border border-white ${
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
            Kado &amp; Tanda Kasih
          </span>
          <h2 className="text-3xl font-serif font-bold text-emerald-950">Kado Pernikahan</h2>
          <p className="text-xs text-slate-600 max-w-xs mx-auto">
            Tanpa mengurangi rasa hormat, bagi Bapak/Ibu/Saudara/i yang berkenan mengirimkan hadiah secara nirkontak:
          </p>
        </div>

        <div className="space-y-4">
          {giftInfo.banks.map((b, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 shadow-lg border border-emerald-200 flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {b.bank}
                </span>
                <p className="text-lg font-mono font-bold text-slate-900">{b.number}</p>
                <p className="text-xs text-slate-500">a.n. {b.holder}</p>
              </div>

              <button
                onClick={() => handleCopy(b.number, b.bank)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-all text-xs font-semibold min-h-[44px]"
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

          <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 text-xs space-y-1.5">
            <span className="font-bold text-emerald-950">Alamat Pengiriman Kado Fisik:</span>
            <p className="text-slate-700 leading-relaxed">{giftInfo.physicalGiftAddress}</p>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 7: RSVP & WISHES (#rsvp) ===================== */}
      <section id="rsvp" className="py-16 px-6 bg-emerald-900/5 space-y-8 pb-32">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-emerald-800 font-semibold">
            Doa &amp; Restu
          </span>
          <h2 className="text-3xl font-serif font-bold text-emerald-950">Konfirmasi &amp; Ucapan</h2>
          <div className="w-12 h-0.5 bg-amber-600 mx-auto mt-2" />
        </div>

        <form onSubmit={handleSendWish} className="bg-white rounded-3xl p-6 shadow-xl border border-emerald-200 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Nama Lengkap</label>
            <input
              type="text"
              value={newWishName}
              onChange={(e) => setNewWishName(e.target.value)}
              placeholder="Nama Anda..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-700"
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
                    ? "bg-emerald-900 text-white border-emerald-900"
                    : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                Insya Allah Hadir
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
                Berhalangan Hadir
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Doa Restu</label>
            <textarea
              value={newWishMessage}
              onChange={(e) => setNewWishMessage(e.target.value)}
              placeholder="Tuliskan doa untuk keberkahan kedua mempelai..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-700"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-emerald-900 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:bg-emerald-950 transition-colors min-h-[44px]"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Doa Restu</span>
          </button>
        </form>

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
                  {w.attendance === "hadir" ? "Insya Allah Hadir" : "Berhalangan"}
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
