"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import { Send, Heart, MessageSquare } from "lucide-react";

export const Guestbook_MinimalFeed: React.FC<{
  invitationId?: string;
  defaultGuestName?: string;
  activeSessionCode?: string;
  initialWishes: DedicatedTemplateProps["initialWishes"];
  themePrimary?: string;
}> = ({ defaultGuestName = "", initialWishes }) => {
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
    <section id="guestbook" className="py-14 sm:py-24 px-4 sm:px-6 relative overflow-hidden bg-white">
      <div className="max-w-2xl mx-auto space-y-10">
        <div className="space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-slate-400 block">
            RSVP &amp; GUEST WISHES
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
            Ucapan &amp; Konfirmasi
          </h2>
          <div className="w-12 h-0.5 bg-slate-900" />
        </div>

        {/* Minimalist Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200">
          <div>
            <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">Nama</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Anda"
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-slate-900"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">Kehadiran</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  soundscape.playTick();
                  setAttendance("hadir");
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-colors ${
                  attendance === "hadir" ? "bg-slate-900 text-white" : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                Hadir
              </button>
              <button
                type="button"
                onClick={() => {
                  soundscape.playTick();
                  setAttendance("tidak-hadir");
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-colors ${
                  attendance === "tidak-hadir" ? "bg-slate-900 text-white" : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                Berhalangan
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">Pesan</label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tuliskan ucapan singkat..."
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-slate-900"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Kirim Ucapan
          </button>
        </form>

        {/* Minimal Feed Cards */}
        <div className="divide-y divide-slate-100">
          {wishes.map((w, i) => (
            <div key={w.id || i} className="py-4 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">{w.guestName}</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {w.attendance === "hadir" ? "• Hadir" : "• Doa"}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{w.message}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
