"use client";

import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Heart, Clock } from "lucide-react";

interface InvitationDesktopLayoutProps {
  brideName: string;
  groomName: string;
  eventDate: string; // ISO string e.g. "2026-11-20T09:00:00Z"
  coverPhoto?: string;
  venueName?: string;
  isCoverOpened?: boolean;
  entryAnimId?: string;
  children: React.ReactNode;
}

export const InvitationDesktopLayout: React.FC<InvitationDesktopLayoutProps> = ({
  brideName,
  groomName,
  eventDate,
  coverPhoto = "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200",
  venueName = "Kebumen, Jawa Tengah",
  isCoverOpened = true,
  entryAnimId = "rise-up",
  children,
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date(eventDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  const initials = `${brideName.charAt(0)} & ${groomName.charAt(0)}`;

  const formattedDate = new Date(eventDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row overflow-x-hidden font-sans">
      {/* LEFT PANE: Desktop Cinematic Showcase (Visible >= 1024px) */}
      <aside className="hidden lg:flex lg:w-1/2 h-screen sticky top-0 relative overflow-hidden flex-col justify-between p-12 select-none z-10">
        {/* Background Image with Slow Ken Burns Scale */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-out transform scale-105 hover:scale-110 motion-safe:animate-pulse"
          style={{
            backgroundImage: `url('${coverPhoto}')`,
            filter: "brightness(0.55) contrast(1.1)",
          }}
        />

        {/* Ambient Dark Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60 pointer-events-none" />

        {/* Top Header: Hyperlocal Kebumen Brand Tag */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs tracking-wider uppercase text-amber-200">
            <Heart className="w-3.5 h-3.5 fill-amber-300 text-amber-300 animate-pulse" />
            <span>HariKita Hyperlocal • Kebumen</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/70">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{venueName}</span>
          </div>
        </div>

        {/* Center: Grand Monogram & Names */}
        <div className="relative z-10 my-auto text-center space-y-6">
          {/* Cameo Monogram Crest */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-2 border-amber-300/40 bg-black/40 backdrop-blur-md shadow-2xl shadow-amber-500/20 text-3xl font-serif text-amber-200">
            {initials}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium tracking-[0.3em] uppercase text-amber-200/90">
              The Wedding Celebration of
            </p>
            <h1 className="text-4xl xl:text-5xl font-serif font-bold text-white tracking-wide">
              {brideName} <span className="text-amber-300 font-light">&</span> {groomName}
            </h1>
          </div>

          <div className="inline-flex items-center gap-2 text-sm text-white/80 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
            <Calendar className="w-4 h-4 text-amber-300" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Bottom: Countdown Timer Box */}
        <div className="relative z-10 bg-black/50 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-300">
              <Clock className="w-4 h-4" />
              <span>Hitung Mundur Hari Bahagia</span>
            </div>
            <span className="text-xs text-white/50">WIB (Waktu Indonesia Barat)</span>
          </div>

          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="bg-white/5 border border-white/10 rounded-xl py-3 px-2">
              <span className="block text-2xl xl:text-3xl font-bold text-white font-mono">
                {String(timeLeft.days).padStart(2, "0")}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-white/60">Hari</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl py-3 px-2">
              <span className="block text-2xl xl:text-3xl font-bold text-white font-mono">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-white/60">Jam</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl py-3 px-2">
              <span className="block text-2xl xl:text-3xl font-bold text-white font-mono">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-white/60">Menit</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl py-3 px-2">
              <span className="block text-2xl xl:text-3xl font-bold text-white font-mono">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-white/60">Detik</span>
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT PANE: Centered Mobile Viewport Showcase */}
      <main
        className={`w-full lg:w-1/2 min-h-screen flex justify-center bg-slate-900/60 relative ${
          !isCoverOpened ? "h-screen max-h-screen overflow-hidden" : ""
        }`}
      >
        <div
          className={`w-full max-w-[480px] min-h-screen relative shadow-2xl bg-white dark:bg-slate-900 flex flex-col transition-all ${
            !isCoverOpened
              ? "h-screen max-h-screen overflow-hidden"
              : (ENTRY_ANIM_MAP[entryAnimId] ?? "animate-entry-rise-up")
          }`}
        >
          {children}
          {/* Opaque shield: covers content completely until cover is opened.
              Rendered via inline style to guarantee it is applied before
              any CSS class resolution or paint, eliminating the brief flash. */}
          {!isCoverOpened && (
            <div
              aria-hidden="true"
              suppressHydrationWarning
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                zIndex: 40,
                background: "#0f172a",
                pointerEvents: "none",
              }}
            />
          )}
        </div>
      </main>
      <style>{ENTRY_KEYFRAMES}</style>
    </div>
  );
};

const ENTRY_ANIM_MAP: Record<string, string> = {
  "rise-up": "animate-entry-rise-up",
  "fade-in": "animate-entry-fade-in",
  "fall-in": "animate-entry-fall-in",
  "scale-in": "animate-entry-scale-in",
  "rotate-in": "animate-entry-rotate-in",
  "unfurl": "animate-entry-unfurl",
  "doors-close": "animate-entry-doors-close",
  "slide-left": "animate-entry-slide-left",
};

const ENTRY_KEYFRAMES = `
  @keyframes entryRiseUp {
    0% { opacity: 0; transform: translateY(40px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes entryFadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes entryFallIn {
    0% { opacity: 0; transform: translateY(-40px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes entryScaleIn {
    0% { opacity: 0; transform: scale(0.92); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes entryRotateIn {
    0% { opacity: 0; transform: perspective(800px) rotateX(10deg) translateY(24px); }
    100% { opacity: 1; transform: perspective(800px) rotateX(0deg) translateY(0); }
  }
  @keyframes entryUnfurl {
    0% { opacity: 0; transform: scaleY(0.85); transform-origin: top center; }
    100% { opacity: 1; transform: scaleY(1); transform-origin: top center; }
  }
  @keyframes entryDoorsClose {
    0% { opacity: 0; filter: blur(6px); transform: scale(0.96); }
    100% { opacity: 1; filter: blur(0px); transform: scale(1); }
  }
  @keyframes entrySlideLeft {
    0% { opacity: 0; transform: translateX(40px); }
    100% { opacity: 1; transform: translateX(0); }
  }

  .animate-entry-rise-up { animation: entryRiseUp 0.85s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .animate-entry-fade-in { animation: entryFadeIn 0.8s ease-out both; }
  .animate-entry-fall-in { animation: entryFallIn 0.85s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .animate-entry-scale-in { animation: entryScaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .animate-entry-rotate-in { animation: entryRotateIn 0.85s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .animate-entry-unfurl { animation: entryUnfurl 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .animate-entry-doors-close { animation: entryDoorsClose 0.85s ease-out both; }
  .animate-entry-slide-left { animation: entrySlideLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
`;
