"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import { submitRsvpAction } from "@/server/actions/rsvp";
import { Send, Heart, MessageSquare, Loader2, CheckCircle2 } from "lucide-react";

export const Guestbook_MinimalFeed: React.FC<{
  invitationId?: string;
  defaultGuestName?: string;
  activeSessionCode?: string;
  initialWishes: DedicatedTemplateProps["initialWishes"];
  themePrimary?: string;
}> = ({
  invitationId = "demo-invitation",
  defaultGuestName = "",
  activeSessionCode = "s1",
  initialWishes,
}) => {
  const [wishes, setWishes] = useState(initialWishes);
  const [name, setName] = useState(defaultGuestName !== "Bapak/Ibu/Saudara/i" ? defaultGuestName : "");
  const [message, setMessage] = useState("");
  const [attendance, setAttendance] = useState("hadir");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    soundscape.playConfettiPop();

    const tempWish = {
      id: "w-" + Date.now(),
      guestName: name.trim(),
      attendance,
      paxCount: attendance === "hadir" ? 2 : 0,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    setWishes((prev) => [tempWish, ...prev]);
    const currentMessage = message.trim();
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("invitationId", invitationId);
      formData.append("guestName", name.trim());
      formData.append("attendance", attendance);
      formData.append("paxCount", attendance === "hadir" ? "2" : "0");
      formData.append("sessionCode", activeSessionCode);
      formData.append("message", currentMessage);

      const res = await submitRsvpAction(formData);
      if (res.success && res.data) {
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (err) {
      console.error("Gagal menyimpan RSVP:", err);
    } finally {
      setIsSubmitting(false);
    }
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
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("guest_attendance_change", { detail: { attendance: "hadir" } }));
                  }
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
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
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("guest_attendance_change", { detail: { attendance: "tidak-hadir" } }));
                  }
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
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
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan Ucapan...</span>
              </>
            ) : (
              <span>Kirim Ucapan</span>
            )}
          </button>
          {submitted && (
            <div className="flex items-center gap-2 justify-center text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg py-2 px-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Ucapan & konfirmasi kehadiran Anda tersimpan!</span>
            </div>
          )}
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
