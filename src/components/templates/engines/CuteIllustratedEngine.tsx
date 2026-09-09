"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { ConfettiCanvas } from "@/components/invitation/canvas/ConfettiCanvas";
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
  Smile,
  Navigation,
} from "lucide-react";

export const CuteIllustratedEngine: React.FC<DedicatedTemplateProps> = ({
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
    <div
      className="relative w-full min-h-screen text-slate-800 font-sans overflow-x-hidden selection:bg-pink-300"
      style={{
        backgroundColor: "#FFF8F5",
        backgroundImage: "radial-gradient(#FFE5D9 1.5px, transparent 1.5px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* 1. Cheerful Party Confetti Canvas */}
      <ConfettiCanvas className="pointer-events-none opacity-40 z-10" />

      {/* ===================== SECTION 1: HERO (#hero) ===================== */}
      <section
        id="hero"
        className="relative min-h-[92vh] flex flex-col items-center justify-center p-6 text-center space-y-6 pt-12"
      >
        {/* Cute Mascot Couple Badge */}
        <div className="relative inline-flex items-center justify-center p-4 bg-white rounded-full shadow-xl border-4 border-pink-200">
          <div className="flex items-center -space-x-3 text-3xl">
            <span className="p-3 bg-pink-100 rounded-full border-2 border-pink-300">👰🏻‍♀️</span>
            <span className="p-3 bg-blue-100 rounded-full border-2 border-blue-300">🤵🏻‍♂️</span>
          </div>
        </div>

        <div className="space-y-2 max-w-xs">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-pink-100 text-pink-700 border-2 border-pink-200 shadow-sm">
            <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500 animate-bounce" />
            <span>We Are Getting Married!</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            {bride.name} <span className="text-pink-500">&amp;</span> {groom.name}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Yuk ramaikan hari bahagia kami berdua di Kebumen!
          </p>
        </div>

        {/* Chubby Pill Hero Photo Card */}
        <div className="relative p-3 bg-white rounded-[2.5rem] shadow-xl border-4 border-pink-100 max-w-[280px] w-full transform hover:rotate-1 transition-transform">
          <img
            src={bride.photo || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600"}
            alt="Couple"
            className="w-full h-64 object-cover rounded-[2rem]"
          />
          <div className="pt-3 pb-1 text-center font-bold text-xs text-pink-600 uppercase tracking-wider">
            {formattedDate}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-pink-700 bg-white px-4 py-2 rounded-full border-2 border-pink-200 shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-pink-500" />
          <span className="font-bold">{activeSession.venueName}</span>
        </div>
      </section>

      {/* ===================== SECTION 2: COUPLE (#couple) ===================== */}
      <section id="couple" className="py-16 px-6 space-y-12">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-pink-600 font-bold">
            The Happy Pair
          </span>
          <h2 className="text-3xl font-bold text-slate-900">Mempelai Ceria</h2>
          <div className="w-12 h-1 bg-pink-400 rounded-full mx-auto mt-2" />
        </div>

        {/* Bride Card */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border-4 border-pink-100 space-y-4 text-center">
          <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden p-1.5 border-4 border-pink-300 shadow-md">
            <img src={bride.photo} alt={bride.fullName} className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="space-y-1">
            <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase bg-pink-100 text-pink-700">
              The Bride
            </span>
            <h3 className="text-2xl font-bold text-slate-900">{bride.fullName}</h3>
            <p className="text-xs text-slate-500">Putri manis dari pasangan:</p>
            <p className="text-sm font-bold text-pink-600">
              {bride.father} &amp; {bride.mother}
            </p>
          </div>
          {bride.instagram && (
            <a
              href={`https://instagram.com/${bride.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-pink-50 text-pink-700 border-2 border-pink-200 hover:bg-pink-100 transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>@{bride.instagram}</span>
            </a>
          )}
        </div>

        {/* Groom Card */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border-4 border-blue-100 space-y-4 text-center">
          <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden p-1.5 border-4 border-blue-300 shadow-md">
            <img src={groom.photo} alt={groom.fullName} className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="space-y-1">
            <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
              The Groom
            </span>
            <h3 className="text-2xl font-bold text-slate-900">{groom.fullName}</h3>
            <p className="text-xs text-slate-500">Putra tampan dari pasangan:</p>
            <p className="text-sm font-bold text-blue-600">
              {groom.father} &amp; {groom.mother}
            </p>
          </div>
          {groom.instagram && (
            <a
              href={`https://instagram.com/${groom.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border-2 border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>@{groom.instagram}</span>
            </a>
          )}
        </div>
      </section>

      {/* ===================== SECTION 3: EVENT (#event) ===================== */}
      <section id="event" className="py-16 px-6 space-y-8 bg-pink-50/50">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-pink-600 font-bold">
            Save The Date
          </span>
          <h2 className="text-3xl font-bold text-slate-900">Jadwal Acara</h2>
          <div className="w-12 h-1 bg-pink-400 rounded-full mx-auto mt-2" />
        </div>

        {/* Multi-Session Tabs */}
        <div className="flex items-center justify-center gap-2 p-1.5 bg-white rounded-full border-2 border-pink-200 max-w-xs mx-auto shadow-sm">
          {(["s1", "s2", "s3"] as const).map((key) => {
            const sess = sessions[key];
            if (!sess) return null;
            return (
              <button
                key={key}
                onClick={() => setSelectedSession(key)}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all ${
                  selectedSession === key
                    ? "bg-pink-500 text-white shadow-md"
                    : "text-slate-600 hover:text-pink-600"
                }`}
              >
                {sess.title.split(" ")[0]}
              </button>
            );
          })}
        </div>

        {/* Active Session Card */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border-4 border-pink-100 space-y-6 text-center">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-slate-900">{activeSession.title}</h3>
            <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase bg-pink-100 text-pink-700">
              Sesi Spesial: {activeSession.sessionCode.toUpperCase()}
            </span>
          </div>

          <div className="space-y-3 py-3 border-y-2 border-dashed border-pink-100">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-700">
              <Calendar className="w-4 h-4 text-pink-500" />
              <span className="font-bold">{formattedDate}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-700">
              <Clock className="w-4 h-4 text-pink-500" />
              <span className="font-bold text-pink-600">{activeSession.timeSlot}</span>
            </div>
            <div className="flex items-start justify-center gap-2 text-sm text-slate-700 max-w-xs mx-auto">
              <MapPin className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-bold text-slate-900">{activeSession.venueName}</p>
                <p className="text-xs text-slate-500">{activeSession.venueAddress}</p>
              </div>
            </div>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-full bg-pink-500 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-pink-600 transition-colors min-h-[44px]"
          >
            <Navigation className="w-4 h-4" />
            <span>Buka Peta Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Integrated Cute Illustrated Map of Kebumen */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border-4 border-amber-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🗺️</span>
              <h4 className="font-bold text-sm text-slate-900">Peta Kartun Kebumen</h4>
            </div>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
              Hyperlocal Guide
            </span>
          </div>

          <div className="relative aspect-video rounded-2xl bg-amber-50 border-2 border-dashed border-amber-300 p-4 flex flex-col justify-between overflow-hidden">
            <div className="flex justify-between items-center text-xs">
              <span className="p-1.5 bg-white rounded-xl shadow-sm font-bold text-slate-700">
                🏛️ Pendopo Kabumian
              </span>
              <span className="p-1.5 bg-pink-100 rounded-xl shadow-sm font-bold text-pink-700 animate-pulse">
                🏨 Venue Hari H ({activeSession.venueName})
              </span>
            </div>

            <div className="flex justify-center items-center py-2">
              <div className="px-3 py-1.5 bg-amber-300/80 rounded-full font-bold text-xs text-slate-800 shadow">
                🕊️ Tugu Lawet Kebumen (Pusat Kota)
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="p-1.5 bg-white rounded-xl shadow-sm font-bold text-slate-700">
                🚉 Stasiun Kutoanyar
              </span>
              <span className="p-1.5 bg-emerald-100 rounded-xl shadow-sm font-bold text-emerald-700">
                🌊 Pantai Menganti
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 4: STORY (#story) ===================== */}
      <section id="story" className="py-16 px-6 space-y-8">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-pink-600 font-bold">
            Sweet Memories
          </span>
          <h2 className="text-3xl font-bold text-slate-900">Cerita Kita</h2>
          <div className="w-12 h-1 bg-pink-400 rounded-full mx-auto mt-2" />
        </div>

        <div className="relative border-l-4 border-pink-200 ml-4 pl-6 space-y-8">
          {storyTimeline.map((item, idx) => (
            <div key={idx} className="relative space-y-1.5">
              <div className="absolute -left-[32px] top-1 w-5 h-5 rounded-full bg-pink-400 border-4 border-white shadow" />
              <span className="text-xs font-bold text-pink-600 tracking-wider font-mono">{item.year}</span>
              <h4 className="text-lg font-bold text-slate-900">{item.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== SECTION 5: GALLERY (#gallery) ===================== */}
      <section id="gallery" className="py-16 px-6 bg-pink-50/50 space-y-8">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-pink-600 font-bold">
            Snapshots
          </span>
          <h2 className="text-3xl font-bold text-slate-900">Galeri Gemas</h2>
          <div className="w-12 h-1 bg-pink-400 rounded-full mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {galleryPhotos.map((photo, idx) => (
            <div
              key={idx}
              className={`rounded-3xl overflow-hidden shadow-md border-4 border-white ${
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
          <span className="text-xs uppercase tracking-widest text-pink-600 font-bold">
            Kado Digital
          </span>
          <h2 className="text-3xl font-bold text-slate-900">Amplop Cinta</h2>
          <p className="text-xs text-slate-600 max-w-xs mx-auto">
            Terima kasih banyak atas kasih sayang dan doa restu teman-teman semua:
          </p>
        </div>

        <div className="space-y-4">
          {giftInfo.banks.map((b, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-5 shadow-lg border-2 border-pink-200 flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-pink-700 bg-pink-100 px-2.5 py-0.5 rounded-full">
                  {b.bank}
                </span>
                <p className="text-lg font-mono font-bold text-slate-900">{b.number}</p>
                <p className="text-xs text-slate-500">a.n. {b.holder}</p>
              </div>

              <button
                onClick={() => handleCopy(b.number, b.bank)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-pink-50 text-pink-700 border-2 border-pink-200 hover:bg-pink-100 transition-all text-xs font-bold min-h-[44px]"
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

          <div className="bg-pink-100/60 rounded-3xl p-4 border-2 border-pink-200 text-xs space-y-1.5">
            <span className="font-bold text-pink-900">Alamat Kirim Hadiah Fisik:</span>
            <p className="text-slate-700 leading-relaxed">{giftInfo.physicalGiftAddress}</p>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 7: RSVP & WISHES (#rsvp) ===================== */}
      <section id="rsvp" className="py-16 px-6 space-y-8 pb-32">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-widest text-pink-600 font-bold">
            Guestbook
          </span>
          <h2 className="text-3xl font-bold text-slate-900">Ucapan &amp; Doa</h2>
          <div className="w-12 h-1 bg-pink-400 rounded-full mx-auto mt-2" />
        </div>

        <form onSubmit={handleSendWish} className="bg-white rounded-[2.5rem] p-6 shadow-xl border-4 border-pink-100 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Nama Teman-teman</label>
            <input
              type="text"
              value={newWishName}
              onChange={(e) => setNewWishName(e.target.value)}
              placeholder="Nama kamu..."
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-pink-200 text-sm focus:outline-none focus:border-pink-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Bisa Hadir Nggak?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAttendance("hadir")}
                className={`py-2 text-xs font-bold rounded-2xl border-2 transition-all ${
                  attendance === "hadir"
                    ? "bg-pink-500 text-white border-pink-500"
                    : "bg-pink-50 text-pink-700 border-pink-200"
                }`}
              >
                Pasti Hadir 🎉
              </button>
              <button
                type="button"
                onClick={() => setAttendance("tidak-hadir")}
                className={`py-2 text-xs font-bold rounded-2xl border-2 transition-all ${
                  attendance === "tidak-hadir"
                    ? "bg-slate-700 text-white border-slate-700"
                    : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                Maaf Belum Bisa 🥺
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Pesan Manis</label>
            <textarea
              value={newWishMessage}
              onChange={(e) => setNewWishMessage(e.target.value)}
              placeholder="Tulis ucapan kamu di sini ya..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-pink-200 text-sm focus:outline-none focus:border-pink-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 hover:scale-[1.01] transition-transform min-h-[44px]"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Pesan Manis</span>
          </button>
        </form>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {wishes.map((w) => (
            <div key={w.id} className="bg-white rounded-2xl p-4 border-2 border-pink-100 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{w.guestName}</span>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                    w.attendance === "hadir"
                      ? "bg-pink-100 text-pink-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {w.attendance === "hadir" ? "Hadir ✨" : "Berhalangan"}
                </span>
              </div>
              <p className="text-xs text-slate-600">{w.message}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
