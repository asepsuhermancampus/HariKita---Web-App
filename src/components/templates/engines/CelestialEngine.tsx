"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { GoldenDustCanvas } from "@/components/invitation/canvas/GoldenDustCanvas";
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
  Moon,
  Compass,
} from "lucide-react";

export const CelestialEngine: React.FC<DedicatedTemplateProps> = ({
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
    <div className="relative w-full min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden selection:bg-indigo-600 selection:text-white">
      {/* 1. Stardust Canvas */}
      <GoldenDustCanvas className="pointer-events-none opacity-60 z-10" />

      {/* Ambient Celestial Nebula Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* ===================== SECTION 1: HERO (#hero) ===================== */}
      <section
        id="hero"
        className="relative min-h-[95vh] flex flex-col items-center justify-center p-6 text-center space-y-6 pt-12"
      >
        <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full border border-indigo-400/40 bg-indigo-950/40 backdrop-blur-xl shadow-[0_0_30px_rgba(99,102,241,0.25)]">
          <Moon className="w-8 h-8 text-amber-200 animate-pulse" />
        </div>

        <div className="space-y-2 max-w-xs">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono tracking-[0.25em] uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Written In The Stars</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-amber-100 to-purple-200">
            {bride.name} <span className="text-amber-300 font-light">&amp;</span> {groom.name}
          </h1>
          <p className="text-xs text-slate-400 font-serif italic">
            &ldquo;When the stars align, two souls find their eternal orbit.&rdquo;
          </p>
        </div>

        {/* Floating Glass Prewed Card */}
        <div className="relative p-2.5 bg-slate-900/60 backdrop-blur-2xl rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-slate-700/60 max-w-[280px] w-full transform hover:scale-105 transition-transform duration-500">
          <img
            src={bride.photo || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600"}
            alt="Couple"
            className="w-full h-64 object-cover rounded-2xl filter brightness-95"
          />
          <div className="pt-3 pb-1 text-center font-mono text-xs tracking-widest text-indigo-300 uppercase">
            {formattedDate}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-indigo-200 bg-slate-900/80 px-4 py-2 rounded-full border border-indigo-500/30">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>{activeSession.venueName}</span>
        </div>
      </section>

      {/* ===================== SECTION 2: COUPLE (#couple) ===================== */}
      <section id="couple" className="py-16 px-6 space-y-12">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-mono">
            Celestial Union
          </span>
          <h2 className="text-3xl font-serif font-bold text-white">The Couple</h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-2" />
        </div>

        {/* Bride Card */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-slate-700/60 space-y-4 text-center">
          <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden p-1.5 border-2 border-indigo-400/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <img src={bride.photo} alt={bride.fullName} className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-bold text-white">{bride.fullName}</h3>
            <p className="text-xs text-slate-400">The daughter of:</p>
            <p className="text-sm font-serif font-semibold text-indigo-200">
              {bride.father} &amp; {bride.mother}
            </p>
          </div>
          {bride.instagram && (
            <a
              href={`https://instagram.com/${bride.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>@{bride.instagram}</span>
            </a>
          )}
        </div>

        {/* Groom Card */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-slate-700/60 space-y-4 text-center">
          <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden p-1.5 border-2 border-indigo-400/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <img src={groom.photo} alt={groom.fullName} className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-bold text-white">{groom.fullName}</h3>
            <p className="text-xs text-slate-400">The son of:</p>
            <p className="text-sm font-serif font-semibold text-indigo-200">
              {groom.father} &amp; {groom.mother}
            </p>
          </div>
          {groom.instagram && (
            <a
              href={`https://instagram.com/${groom.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>@{groom.instagram}</span>
            </a>
          )}
        </div>
      </section>

      {/* ===================== SECTION 3: EVENT (#event) ===================== */}
      <section id="event" className="py-16 px-6 space-y-8 bg-black/40">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-mono">
            Event Timeline
          </span>
          <h2 className="text-3xl font-serif font-bold text-white">Date &amp; Venue</h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-2" />
        </div>

        {/* Multi-Session Tabs */}
        <div className="flex items-center justify-center gap-2 p-1 bg-slate-900 rounded-full border border-slate-700 max-w-xs mx-auto">
          {(["s1", "s2", "s3"] as const).map((key) => {
            const sess = sessions[key];
            if (!sess) return null;
            return (
              <button
                key={key}
                onClick={() => setSelectedSession(key)}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-mono transition-all ${
                  selectedSession === key
                    ? "bg-indigo-600 text-white shadow-md font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {sess.title.split(" ")[0]}
              </button>
            );
          })}
        </div>

        {/* Active Session Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-slate-700 space-y-6 text-center">
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-bold text-white">{activeSession.title}</h3>
            <p className="text-xs font-mono text-indigo-300 uppercase tracking-widest">
              Pass Session: {activeSession.sessionCode.toUpperCase()}
            </p>
          </div>

          <div className="space-y-3 py-3 border-y border-slate-700">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span className="font-mono font-bold text-amber-200">{activeSession.timeSlot}</span>
            </div>
            <div className="flex items-start justify-center gap-2 text-sm text-slate-300 max-w-xs mx-auto">
              <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-bold text-white">{activeSession.venueName}</p>
                <p className="text-xs text-slate-400">{activeSession.venueAddress}</p>
              </div>
            </div>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition-transform min-h-[44px]"
          >
            <MapPin className="w-4 h-4" />
            <span>Open Location in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* ===================== SECTION 4: STORY (#story) ===================== */}
      <section id="story" className="py-16 px-6 space-y-8">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-mono">
            Cosmic Chronology
          </span>
          <h2 className="text-3xl font-serif font-bold text-white">Love Journey</h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-2" />
        </div>

        <div className="relative border-l-2 border-indigo-500/30 ml-4 pl-6 space-y-8">
          {storyTimeline.map((item, idx) => (
            <div key={idx} className="relative space-y-1.5">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-indigo-500 border-2 border-slate-950 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              <span className="text-xs font-mono font-bold text-indigo-300 tracking-wider">{item.year}</span>
              <h4 className="text-lg font-serif font-bold text-white">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== SECTION 5: GALLERY (#gallery) ===================== */}
      <section id="gallery" className="py-16 px-6 space-y-8 bg-black/40">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-mono">
            Starlight Memories
          </span>
          <h2 className="text-3xl font-serif font-bold text-white">Photo Gallery</h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {galleryPhotos.map((photo, idx) => (
            <div
              key={idx}
              className={`rounded-2xl overflow-hidden shadow-2xl border border-slate-800 ${
                idx % 3 === 0 ? "col-span-2 h-56" : "h-40"
              }`}
            >
              <img src={photo} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* ===================== SECTION 6: DIGITAL GIFT (#gift) ===================== */}
      <section id="gift" className="py-16 px-6 space-y-8">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-mono">
            Digital Token
          </span>
          <h2 className="text-3xl font-serif font-bold text-white">Wedding Gift</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Your warmest blessing is our greatest present. If you wish to send a contactless token:
          </p>
        </div>

        <div className="space-y-4">
          {giftInfo.banks.map((b, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 rounded-2xl p-5 shadow-xl border border-slate-800 flex items-center justify-between"
            >
              <div className="space-y-1 font-mono text-xs">
                <span className="text-indigo-400 bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-800">
                  {b.bank}
                </span>
                <p className="text-lg font-bold text-white tracking-wider">{b.number}</p>
                <p className="text-slate-400">a.n. {b.holder}</p>
              </div>

              <button
                onClick={() => handleCopy(b.number, b.bank)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-all text-xs font-mono font-semibold min-h-[44px]"
              >
                {copiedBank === b.bank ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          ))}

          <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 text-xs space-y-1.5">
            <span className="font-bold text-indigo-300 font-mono">Physical Delivery Address:</span>
            <p className="text-slate-300 leading-relaxed">{giftInfo.physicalGiftAddress}</p>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 7: RSVP & WISHES (#rsvp) ===================== */}
      <section id="rsvp" className="py-16 px-6 space-y-8 pb-32">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-mono">
            Starlight Wishes
          </span>
          <h2 className="text-3xl font-serif font-bold text-white">Guestbook &amp; RSVP</h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-2" />
        </div>

        <form onSubmit={handleSendWish} className="bg-slate-900/80 rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono font-semibold text-slate-300">Your Full Name</label>
            <input
              type="text"
              value={newWishName}
              onChange={(e) => setNewWishName(e.target.value)}
              placeholder="Your Name..."
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-semibold text-slate-300">Attendance</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAttendance("hadir")}
                className={`py-2 text-xs font-mono font-semibold rounded-xl border transition-all ${
                  attendance === "hadir"
                    ? "bg-indigo-600 text-white border-indigo-500 font-bold"
                    : "bg-black/40 text-slate-400 border-slate-800"
                }`}
              >
                Will Attend
              </button>
              <button
                type="button"
                onClick={() => setAttendance("tidak-hadir")}
                className={`py-2 text-xs font-mono font-semibold rounded-xl border transition-all ${
                  attendance === "tidak-hadir"
                    ? "bg-purple-900 text-white border-purple-700 font-bold"
                    : "bg-black/40 text-slate-400 border-slate-800"
                }`}
              >
                Cannot Attend
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-semibold text-slate-300">Blessing Message</label>
            <textarea
              value={newWishMessage}
              onChange={(e) => setNewWishMessage(e.target.value)}
              placeholder="Write your wishes..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:scale-[1.01] transition-transform min-h-[44px]"
          >
            <Send className="w-4 h-4" />
            <span>Send Cosmic Blessing</span>
          </button>
        </form>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {wishes.map((w) => (
            <div key={w.id} className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-800 shadow-sm space-y-1 font-mono">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{w.guestName}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    w.attendance === "hadir"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : "bg-purple-950 text-purple-300 border border-purple-800"
                  }`}
                >
                  {w.attendance === "hadir" ? "Confirmed" : "Declined"}
                </span>
              </div>
              <p className="text-xs text-slate-300">{w.message}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
