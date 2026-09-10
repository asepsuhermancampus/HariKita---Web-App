"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import { Scroll, Send, CheckCircle2, ShieldCheck, Heart } from "lucide-react";

export const Guestbook_LuxuryScrollbook: React.FC<{
  invitationId?: string;
  defaultGuestName?: string;
  activeSessionCode?: string;
  initialWishes: DedicatedTemplateProps["initialWishes"];
  themePrimary?: string;
}> = ({ defaultGuestName = "", initialWishes, themePrimary = "#C5A880" }) => {
  const [wishes, setWishes] = useState(initialWishes);
  const [name, setName] = useState(defaultGuestName !== "Bapak/Ibu/Saudara/i" ? defaultGuestName : "");
  const [message, setMessage] = useState("");
  const [attendance, setAttendance] = useState("hadir");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    soundscape.playConfettiPop();

    const newWish = {
      id: "w-" + Date.now(),
      guestName: name,
      attendance,
      paxCount: attendance === "hadir" ? 2 : 0,
      message,
      createdAt: new Date().toISOString(),
    };

    setWishes([newWish, ...wishes]);
    setMessage("");
  };

  return (
    <section id="guestbook" className="py-14 sm:py-24 px-4 sm:px-6 relative overflow-hidden bg-stone-100/60">
      <div className="max-w-3xl mx-auto space-y-10 text-center">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-300/40 bg-amber-50 text-amber-900 text-xs font-serif font-bold uppercase tracking-widest shadow-xs">
            <Scroll className="w-3.5 h-3.5 text-amber-700" />
            <span>Buku Tamu Agung &amp; Doa Restu</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-amber-950 leading-tight">
            Prasasti Kehadiran &amp; Doa
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-serif">
            Torehkan doa tulus dan konfirmasi kehadiran dalam catatan agung kedua mempelai
          </p>
        </div>

        {/* Parchment Scroll Input Form */}
        <div className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl border-2 border-amber-400/40 bg-gradient-to-b from-amber-50/90 via-white to-amber-50/90 text-left space-y-5 max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-serif font-bold uppercase text-amber-950 block">
                Nama Tamu Kehormatan
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap Anda / keluarga"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-amber-300/60 bg-white/80 text-sm font-serif focus:border-amber-600 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-serif font-bold uppercase text-amber-950 block">
                Konfirmasi Kehadiran
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundscape.playTick();
                    setAttendance("hadir");
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-serif font-bold border transition-colors ${
                    attendance === "hadir"
                      ? "bg-amber-800 text-amber-100 border-amber-800 shadow-xs"
                      : "bg-white/60 text-slate-700 border-amber-200"
                  }`}
                >
                  Insya Allah Hadir
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundscape.playTick();
                    setAttendance("tidak-hadir");
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-serif font-bold border transition-colors ${
                    attendance === "tidak-hadir"
                      ? "bg-amber-800 text-amber-100 border-amber-800 shadow-xs"
                      : "bg-white/60 text-slate-700 border-amber-200"
                  }`}
                >
                  Kirim Doa dari Jauh
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-serif font-bold uppercase text-amber-950 block">
                Untaian Doa Restu
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tuliskan doa kebaikan bagi kedua mempelai..."
                required
                className="w-full px-4 py-2.5 rounded-xl border border-amber-300/60 bg-white/80 text-sm font-serif focus:border-amber-600 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-800 hover:bg-amber-700 text-amber-100 font-serif font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-amber-300" />
              <span>Kirimkan Doa Mulia</span>
            </button>
          </form>
        </div>

        {/* Wishes List as Royal Inscription */}
        <div className="space-y-4 max-w-xl mx-auto pt-4 text-left">
          {wishes.map((w, i) => (
            <div
              key={w.id || i}
              className="p-5 rounded-2xl bg-white border border-amber-200/80 shadow-md space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <strong className="text-sm font-serif font-bold text-slate-900">{w.guestName}</strong>
                </div>
                <span className="text-[10px] font-serif font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {w.attendance === "hadir" ? "Hadir" : "Mendoakan"}
                </span>
              </div>
              <p className="text-xs font-serif italic text-slate-700 leading-relaxed">
                &ldquo;{w.message}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
