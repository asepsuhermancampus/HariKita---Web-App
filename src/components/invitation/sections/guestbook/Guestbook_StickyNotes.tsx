"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import { submitRsvpAction } from "@/server/actions/rsvp";
import { MessageSquareHeart, Send, Sparkles, CheckCircle2, Loader2 } from "lucide-react";

export const Guestbook_StickyNotes: React.FC<{
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
  themePrimary = "#C5A880",
}) => {
  const [wishes, setWishes] = useState(initialWishes);
  const [name, setName] = useState(defaultGuestName !== "Bapak/Ibu/Saudara/i" ? defaultGuestName : "");
  const [message, setMessage] = useState("");
  const [attendance, setAttendance] = useState("hadir");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const colors = [
    "bg-amber-100 border-amber-200 text-amber-950",
    "bg-rose-100 border-rose-200 text-rose-950",
    "bg-sky-100 border-sky-200 text-sky-950",
    "bg-emerald-100 border-emerald-200 text-emerald-950",
  ];

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
      console.error("Gagal mengirim RSVP:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="guestbook" className="py-14 sm:py-24 px-4 sm:px-6 relative overflow-hidden"
      style={{ backgroundColor: `${themePrimary}08` }}
    >
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{
              backgroundColor: `${themePrimary}22`,
              color: themePrimary,
            }}
          >
            <MessageSquareHeart className="w-3.5 h-3.5" style={{ color: themePrimary }} />
            <span>Papan Pesan &amp; Doa Restu</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Untaian Doa &amp; Kehadiran
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">Tinggalkan pesan hangat dan konfirmasi kehadiran Anda</p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl border border-slate-200 max-w-xl mx-auto space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500 block">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tuliskan nama Anda / keluarga"
                required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden"
                style={{ outlineColor: themePrimary }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500 block">Konfirmasi Kehadiran</label>
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
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    attendance === "hadir"
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  ✓ Hadir
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
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    attendance === "tidak-hadir"
                      ? "bg-rose-500 text-white border-rose-500 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  ✕ Berhalangan
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500 block">Doa &amp; Ucapan</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tuliskan doa restu untuk kedua mempelai..."
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden"
                style={{ outlineColor: themePrimary }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-colors active:scale-98 disabled:opacity-50 cursor-pointer text-white"
              style={{ backgroundColor: themePrimary || "#C5A880" }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menempelkan Ucapan...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Tempel Ucapan di Papan</span>
                </>
              )}
            </button>
            {submitted && (
              <div className="flex items-center gap-2 justify-center text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-xl py-2 px-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ucapan doa restu Anda tertempel indah di papan!</span>
              </div>
            )}
          </form>
        </div>

        {/* Sticky Notes Board Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {wishes.map((w, idx) => {
            const colorClass = colors[idx % colors.length];
            return (
              <div
                key={w.id || idx}
                className={`relative p-5 rounded-2xl shadow-md border space-y-3 flex flex-col justify-between ${colorClass}`}
              >
                {/* Pin Head */}
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-md mx-auto -mt-2 mb-1" />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm font-bold block line-clamp-1">{w.guestName}</strong>
                    {w.attendance === "hadir" ? (
                      <span className="text-[10px] font-bold bg-emerald-600/20 text-emerald-800 px-2 py-0.5 rounded-full">
                        Hadir
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-rose-600/20 text-rose-800 px-2 py-0.5 rounded-full">
                        Doa
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed italic">&ldquo;{w.message}&rdquo;</p>
                </div>

                <div className="text-[9px] opacity-60 font-serif pt-2 border-t border-black/10">
                  {new Date(w.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
