"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { GoldenDustCanvas } from "@/components/invitation/canvas/GoldenDustCanvas";
import { OrnamentGoldFoilFrame } from "@/components/invitation/ornaments/OrnamentGoldFoilFrame";
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
  Crown,
} from "lucide-react";

export const RoseGoldEngine: React.FC<DedicatedTemplateProps> = ({
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

  const roseGold = "#E0A899";
  const gildedGold = "#CCA873";
  const deepMauve = "#2A1820";

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
      className="relative w-full min-h-screen text-amber-50 font-sans overflow-x-hidden selection:bg-rose-900 selection:text-white"
      style={{
        backgroundColor: deepMauve,
        backgroundImage: "radial-gradient(ellipse at top, #442431 0%, #201017 60%, #12090D 100%)",
      }}
    >
      {/* 1. Rose Gold Dust Canvas */}
      <GoldenDustCanvas className="pointer-events-none opacity-60 z-10" />

      {/* ===================== SECTION 1: HERO (#hero) ===================== */}
      <section
        id="hero"
        className="relative min-h-[95vh] flex flex-col items-center justify-center p-6 text-center space-y-6 pt-12"
      >
        <div className="relative">
          <OrnamentGoldFoilFrame color={gildedGold} size={150} className="animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-serif font-bold text-amber-200">
              {bride.name.charAt(0)} &amp; {groom.name.charAt(0)}
            </span>
          </div>
        </div>

        <div className="space-y-2 max-w-xs">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-serif tracking-[0.25em] uppercase bg-rose-500/10 text-rose-200 border border-rose-400/30">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Royal Nuptial Celebration</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-amber-200 to-rose-300">
            {bride.name} <span className="text-amber-300 font-light">&amp;</span> {groom.name}
          </h1>
          <p className="text-xs text-rose-200/70 font-serif italic">
            &ldquo;Two lives, two hearts, joined together in friendship, united forever in love.&rdquo;
          </p>
        </div>

        {/* Diamond Cut Beveled Couple Photo */}
        <div className="relative p-3 bg-gradient-to-b from-amber-400/30 via-rose-500/20 to-black/60 rounded-3xl shadow-2xl border-2 border-amber-300/40 max-w-[280px] w-full transform hover:scale-105 transition-transform duration-500">
          <img
            src={bride.photo || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600"}
            alt="Couple"
            className="w-full h-64 object-cover rounded-2xl"
          />
          <div className="pt-3 pb-1 text-center font-serif text-xs tracking-widest text-amber-200 uppercase">
            {formattedDate}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-rose-200 bg-black/40 px-4 py-2 rounded-full border border-rose-300/30">
          <MapPin className="w-3.5 h-3.5 text-amber-300" />
          <span>{activeSession.venueName}</span>
        </div>
      </section>

      {/* ===================== SECTION 2: COUPLE (#couple) ===================== */}
      <section id="couple" className="py-16 px-6 space-y-12 bg-black/20">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-amber-300/80 font-serif">
            The Beloved
          </span>
          <h2 className="text-3xl font-serif font-bold text-rose-100">The Bride &amp; Groom</h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent mx-auto mt-2" />
        </div>

        {/* Bride Card */}
        <div className="bg-gradient-to-b from-rose-950/40 to-black/60 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-rose-400/30 space-y-4 text-center">
          <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden p-1.5 border-2 border-amber-300/60 shadow-xl">
            <img src={bride.photo} alt={bride.fullName} className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-bold text-rose-100">{bride.fullName}</h3>
            <p className="text-xs text-rose-200/70">The beloved daughter of:</p>
            <p className="text-sm font-serif font-semibold text-amber-200">
              {bride.father} &amp; {bride.mother}
            </p>
          </div>
          {bride.instagram && (
            <a
              href={`https://instagram.com/${bride.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs bg-rose-500/10 text-rose-200 border border-rose-400/30 hover:bg-rose-500/20 transition-colors"
            >
              <Instagram className="w-3.5 h-3.5 text-amber-300" />
              <span>@{bride.instagram}</span>
            </a>
          )}
        </div>

        {/* Groom Card */}
        <div className="bg-gradient-to-b from-rose-950/40 to-black/60 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-rose-400/30 space-y-4 text-center">
          <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden p-1.5 border-2 border-amber-300/60 shadow-xl">
            <img src={groom.photo} alt={groom.fullName} className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-bold text-rose-100">{groom.fullName}</h3>
            <p className="text-xs text-rose-200/70">The beloved son of:</p>
            <p className="text-sm font-serif font-semibold text-amber-200">
              {groom.father} &amp; {groom.mother}
            </p>
          </div>
          {groom.instagram && (
            <a
              href={`https://instagram.com/${groom.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs bg-rose-500/10 text-rose-200 border border-rose-400/30 hover:bg-rose-500/20 transition-colors"
            >
              <Instagram className="w-3.5 h-3.5 text-amber-300" />
              <span>@{groom.instagram}</span>
            </a>
          )}
        </div>
      </section>

      {/* ===================== SECTION 3: EVENT (#event) ===================== */}
      <section id="event" className="py-16 px-6 space-y-8">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-amber-300/80 font-serif">
            Celebration Itinerary
          </span>
          <h2 className="text-3xl font-serif font-bold text-rose-100">Date &amp; Venue</h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent mx-auto mt-2" />
        </div>

        {/* Multi-Session Tabs */}
        <div className="flex items-center justify-center gap-2 p-1 bg-black/40 rounded-full border border-rose-400/30 max-w-xs mx-auto">
          {(["s1", "s2", "s3"] as const).map((key) => {
            const sess = sessions[key];
            if (!sess) return null;
            return (
              <button
                key={key}
                onClick={() => setSelectedSession(key)}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-serif transition-all ${
                  selectedSession === key
                    ? "bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 font-bold shadow-md"
                    : "text-rose-200/70 hover:text-rose-100"
                }`}
              >
                {sess.title.split(" ")[0]}
              </button>
            );
          })}
        </div>

        {/* Active Session Card */}
        <div className="bg-gradient-to-b from-rose-950/60 via-black/80 to-rose-950/60 rounded-3xl p-6 shadow-2xl border-2 border-amber-300/40 space-y-6 text-center">
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-bold text-rose-100">{activeSession.title}</h3>
            <p className="text-xs font-serif text-amber-300 uppercase tracking-widest">
              Pass Session: {activeSession.sessionCode.toUpperCase()}
            </p>
          </div>

          <div className="space-y-3 py-3 border-y border-dashed border-rose-300/30">
            <div className="flex items-center justify-center gap-2 text-sm text-rose-100">
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-rose-100">
              <Clock className="w-4 h-4 text-amber-300" />
              <span className="font-bold text-amber-200">{activeSession.timeSlot}</span>
            </div>
            <div className="flex items-start justify-center gap-2 text-sm text-rose-100 max-w-xs mx-auto">
              <MapPin className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-bold text-rose-100">{activeSession.venueName}</p>
                <p className="text-xs text-rose-200/60">{activeSession.venueAddress}</p>
              </div>
            </div>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-full bg-gradient-to-r from-amber-400 via-rose-300 to-amber-500 text-slate-950 font-serif font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 hover:scale-[1.02] transition-transform min-h-[44px]"
          >
            <MapPin className="w-4 h-4" />
            <span>Open Location in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* ===================== SECTION 4: STORY (#story) ===================== */}
      <section id="story" className="py-16 px-6 space-y-8 bg-black/20">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-amber-300/80 font-serif">
            Our Journey
          </span>
          <h2 className="text-3xl font-serif font-bold text-rose-100">Love Story</h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent mx-auto mt-2" />
        </div>

        <div className="relative border-l-2 border-rose-400/40 ml-4 pl-6 space-y-8">
          {storyTimeline.map((item, idx) => (
            <div key={idx} className="relative space-y-1.5">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 border-2 border-slate-950 shadow" />
              <span className="text-xs font-bold text-amber-300 tracking-wider font-mono">{item.year}</span>
              <h4 className="text-lg font-serif font-bold text-rose-100">{item.title}</h4>
              <p className="text-xs text-rose-200/70 leading-relaxed font-serif">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== SECTION 5: GALLERY (#gallery) ===================== */}
      <section id="gallery" className="py-16 px-6 space-y-8">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-amber-300/80 font-serif">
            Moments in Love
          </span>
          <h2 className="text-3xl font-serif font-bold text-rose-100">Photo Gallery</h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {galleryPhotos.map((photo, idx) => (
            <div
              key={idx}
              className={`rounded-2xl overflow-hidden shadow-2xl border border-amber-300/40 ${
                idx % 3 === 0 ? "col-span-2 h-56" : "h-40"
              }`}
            >
              <img src={photo} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* ===================== SECTION 6: DIGITAL GIFT (#gift) ===================== */}
      <section id="gift" className="py-16 px-6 space-y-8 bg-black/20">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-amber-300/80 font-serif">
            Token of Love
          </span>
          <h2 className="text-3xl font-serif font-bold text-rose-100">Wedding Gift</h2>
          <p className="text-xs text-rose-200/70 max-w-xs mx-auto font-serif">
            Your prayer and blessing are our greatest joy. For those wishing to send a digital token of love:
          </p>
        </div>

        <div className="space-y-4">
          {giftInfo.banks.map((b, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-r from-rose-950/70 via-black/80 to-rose-950/70 rounded-2xl p-5 shadow-xl border border-rose-400/30 flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                  {b.bank}
                </span>
                <p className="text-lg font-mono font-bold text-white">{b.number}</p>
                <p className="text-xs text-rose-200/60 font-serif">a.n. {b.holder}</p>
              </div>

              <button
                onClick={() => handleCopy(b.number, b.bank)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400/20 text-amber-200 border border-amber-400/40 hover:bg-amber-400/30 transition-all text-xs font-semibold min-h-[44px]"
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

          <div className="bg-rose-950/40 rounded-2xl p-4 border border-rose-400/30 text-xs space-y-1.5 font-serif">
            <span className="font-bold text-amber-200">Delivery Address for Physical Gift:</span>
            <p className="text-rose-100/80 leading-relaxed">{giftInfo.physicalGiftAddress}</p>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 7: RSVP & WISHES (#rsvp) ===================== */}
      <section id="rsvp" className="py-16 px-6 space-y-8 pb-32">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-amber-300/80 font-serif">
            Warmest Wishes
          </span>
          <h2 className="text-3xl font-serif font-bold text-rose-100">Guestbook &amp; RSVP</h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent mx-auto mt-2" />
        </div>

        <form onSubmit={handleSendWish} className="bg-gradient-to-b from-rose-950/70 to-black/90 rounded-3xl p-6 shadow-2xl border border-rose-400/30 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-serif font-semibold text-rose-200">Your Full Name</label>
            <input
              type="text"
              value={newWishName}
              onChange={(e) => setNewWishName(e.target.value)}
              placeholder="Your Name..."
              className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-rose-400/30 text-white text-sm focus:outline-none focus:border-amber-300"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-serif font-semibold text-rose-200">RSVP Confirmation</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAttendance("hadir")}
                className={`py-2 text-xs font-serif font-semibold rounded-xl border transition-all ${
                  attendance === "hadir"
                    ? "bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 font-bold border-amber-300"
                    : "bg-black/40 text-rose-200/70 border-rose-400/20"
                }`}
              >
                Will Attend
              </button>
              <button
                type="button"
                onClick={() => setAttendance("tidak-hadir")}
                className={`py-2 text-xs font-serif font-semibold rounded-xl border transition-all ${
                  attendance === "tidak-hadir"
                    ? "bg-rose-900 text-white font-bold border-rose-700"
                    : "bg-black/40 text-rose-200/70 border-rose-400/20"
                }`}
              >
                Cannot Attend
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-serif font-semibold text-rose-200">Blessing Message</label>
            <textarea
              value={newWishMessage}
              onChange={(e) => setNewWishMessage(e.target.value)}
              placeholder="Send your prayers and blessings..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-rose-400/30 text-white text-sm focus:outline-none focus:border-amber-300"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-gradient-to-r from-amber-400 via-rose-300 to-amber-500 text-slate-950 font-serif text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 hover:scale-[1.01] transition-transform min-h-[44px]"
          >
            <Send className="w-4 h-4" />
            <span>Send Blessing</span>
          </button>
        </form>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {wishes.map((w) => (
            <div key={w.id} className="bg-rose-950/40 backdrop-blur-sm rounded-2xl p-4 border border-rose-400/20 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-amber-200">{w.guestName}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-serif font-medium ${
                    w.attendance === "hadir"
                      ? "bg-emerald-900/60 text-emerald-200 border border-emerald-500/30"
                      : "bg-rose-900/60 text-rose-200 border border-rose-500/30"
                  }`}
                >
                  {w.attendance === "hadir" ? "Attending" : "Regrets"}
                </span>
              </div>
              <p className="text-xs text-rose-100/80 font-serif">{w.message}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
