'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Heart,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Gift,
} from 'lucide-react';
import { SANDBOX_GUESTBOOK_WISHES } from '../../../data/mock-invitation-sandbox';
import { cn } from '@/lib/utils';

interface SandboxGuestbookBlurProps {
  accentColor: string;
  onNavigateToGift?: () => void;
}

export function SandboxGuestbookBlur({
  accentColor,
  onNavigateToGift,
}: SandboxGuestbookBlurProps) {
  const [wishes, setWishes] = useState(SANDBOX_GUESTBOOK_WISHES);
  const [activeWishIndex, setActiveWishIndex] = useState<number>(0);

  // Form State
  const [guestName, setGuestName] = useState<string>('Bapak H. Sukardi');
  const [attendance, setAttendance] = useState<'hadir' | 'kirim-doa'>('hadir');
  const [message, setMessage] = useState<string>('');
  const [submittedToast, setSubmittedToast] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !guestName.trim()) return;

    const newWish = {
      id: `w-${Date.now()}`,
      name: guestName,
      relation: 'Tamu Undangan',
      attendance: attendance,
      message: message,
      timestamp: 'Baru saja',
      isVip: false,
    };

    setWishes([newWish, ...wishes]);
    setMessage('');
    setSubmittedToast(true);
    setTimeout(() => setSubmittedToast(false), 3000);
  };

  return (
    <div className="rounded-2xl border border-hk-champagne/40 bg-white p-6 md:p-8 shadow-sm">
      {/* Header */}
      <div className="mb-6 border-b border-hk-soft-beige pb-4">
        <span className="rounded-full bg-hk-soft-beige px-3 py-1 font-manrope text-[11px] font-bold uppercase tracking-wider text-hk-taupe">
          Buku Tamu &amp; RSVP Digital
        </span>
        <h3 className="mt-1 font-editorial text-2xl text-hk-charcoal">
          Form RSVP "Kirim Doa dari Jauh" &amp; Feed Doa Focus-Blur
        </h3>
        <p className="mt-1 font-manrope text-xs text-hk-charcoal/70">
          Uji logika kehadiran santun bagi kerabat luar kota serta kedalaman optik (Focus &amp; Blur) pada daftar ucapan doa.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: RSVP Form (6 cols) */}
        <div className="lg:col-span-6 rounded-xl border border-hk-champagne/50 bg-hk-ivory/50 p-6 shadow-xs">
          <h4 className="font-editorial text-xl text-hk-charcoal mb-4">
            Konfirmasi Kehadiran &amp; Kirim Doa
          </h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Guest Name */}
            <div>
              <label className="block font-manrope text-xs font-semibold text-hk-charcoal mb-1">
                Nama Lengkap Tamu Kehormatan:
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                className="w-full rounded-xl border border-hk-champagne/60 bg-white px-4 py-2 text-xs font-manrope text-hk-charcoal focus:border-hk-taupe focus:outline-hidden"
              />
            </div>

            {/* Attendance Choice Radio */}
            <div>
              <label className="block font-manrope text-xs font-semibold text-hk-charcoal mb-2">
                Konfirmasi Kehadiran:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAttendance('hadir')}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-manrope font-semibold border transition-all',
                    attendance === 'hadir'
                      ? 'border-hk-taupe bg-white shadow-xs text-hk-charcoal ring-1 ring-hk-taupe'
                      : 'border-hk-champagne/40 bg-white/70 text-hk-charcoal/70'
                  )}
                >
                  <Heart className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Hadir Langsung</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAttendance('kirim-doa')}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-manrope font-semibold border transition-all',
                    attendance === 'kirim-doa'
                      ? 'border-hk-taupe bg-white shadow-xs text-hk-charcoal ring-1 ring-hk-taupe'
                      : 'border-hk-champagne/40 bg-white/70 text-hk-charcoal/70'
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5 text-hk-taupe" />
                  <span>Kirim Doa dari Jauh</span>
                </button>
              </div>
            </div>

            {/* CONDITIONAL SPECIAL CALLOUT: KIRIM DOA DARI JAUH */}
            {attendance === 'kirim-doa' && (
              <div className="rounded-xl border border-hk-champagne bg-gradient-to-br from-white to-hk-soft-beige/40 p-4 shadow-xs animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-hk-taupe text-white">
                    <Heart className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h5 className="font-editorial text-base text-hk-charcoal">
                      Terima Kasih atas Doa &amp; Restu Tulus Anda
                    </h5>
                    <p className="mt-1 font-manrope text-[11px] leading-relaxed text-hk-charcoal/80">
                      Jarak bukan penghalang silaturahmi. Anda tetap dapat memberikan tanda kasih atau kado pernikahan untuk kedua mempelai di Kebumen.
                    </p>
                    <a
                      href="#invitation-components"
                      className="mt-2.5 inline-flex items-center gap-1.5 font-manrope text-xs font-bold text-hk-taupe hover:underline"
                    >
                      <Gift className="h-3.5 w-3.5" />
                      <span>Buka Sarana Tanda Kasih Digital &amp; QRIS &rarr;</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Message Area */}
            <div>
              <label className="block font-manrope text-xs font-semibold text-hk-charcoal mb-1">
                Untaian Doa &amp; Ucapan:
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tuliskan ucapan selamat dan doa restu untuk Aditya & Ratna..."
                required
                className="w-full rounded-xl border border-hk-champagne/60 bg-white p-3 text-xs font-manrope text-hk-charcoal focus:border-hk-taupe focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 font-manrope text-xs font-semibold text-white transition-transform active:scale-95 shadow-sm"
              style={{ backgroundColor: accentColor }}
            >
              <Send className="h-3.5 w-3.5" />
              <span>Kirim Doa Restu (Wax Seal HK)</span>
            </button>

            {submittedToast && (
              <div className="rounded-lg bg-emerald-100 border border-emerald-300 p-2 text-center text-xs font-manrope font-semibold text-emerald-800">
                ✓ Doa restu Anda berhasil terkirim ke buku tamu!
              </div>
            )}
          </form>
        </div>

        {/* Right: Feed Doa with 3D Stacked Focus & Blur (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-manrope text-xs font-bold uppercase tracking-wider text-hk-charcoal/80">
              Feed Ucapan Doa ({wishes.length} Pesan Masuk):
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setActiveWishIndex((i) => (i - 1 + wishes.length) % wishes.length)
                }
                className="flex h-7 w-7 items-center justify-center rounded-full border border-hk-champagne bg-white text-hk-charcoal hover:bg-hk-soft-beige"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="font-manrope text-[11px] font-semibold text-hk-taupe">
                {activeWishIndex + 1} / {wishes.length}
              </span>
              <button
                onClick={() => setActiveWishIndex((i) => (i + 1) % wishes.length)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-hk-champagne bg-white text-hk-charcoal hover:bg-hk-soft-beige"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* 3D Stacked Focus & Blur Display */}
          <div className="relative min-h-[320px] flex items-center justify-center">
            {wishes.slice(0, 3).map((w, idx) => {
              const diff = (idx - (activeWishIndex % 3) + 3) % 3;
              const isFocused = diff === 0;

              return (
                <div
                  key={w.id}
                  onClick={() => setActiveWishIndex(idx)}
                  className={cn(
                    'absolute w-full max-w-md rounded-2xl border bg-white p-5 transition-all duration-300 cursor-pointer',
                    isFocused
                      ? 'z-20 scale-100 translate-y-0 border-hk-taupe shadow-xl filter-none opacity-100'
                      : diff === 1
                      ? 'z-10 scale-95 translate-y-6 border-hk-champagne/40 shadow-md blur-[3px] opacity-65'
                      : 'z-0 scale-90 translate-y-12 border-hk-champagne/30 shadow-xs blur-[6px] opacity-35'
                  )}
                >
                  <div className="flex items-center justify-between border-b border-hk-soft-beige pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-hk-taupe text-white text-xs font-bold">
                        {w.name.charAt(0)}
                      </span>
                      <div>
                        <h5 className="font-editorial text-base text-hk-charcoal leading-none">
                          {w.name}
                        </h5>
                        <span className="font-manrope text-[10px] text-hk-charcoal/60">
                          {w.relation}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {w.isVip && (
                        <span className="rounded-full bg-hk-champagne/30 px-2 py-0.5 text-[9px] font-bold text-hk-charcoal">
                          VIP TRAH
                        </span>
                      )}
                      <span className="font-mono text-[9px] text-hk-charcoal/50">
                        {w.timestamp}
                      </span>
                    </div>
                  </div>

                  <p className="font-editorial text-sm italic text-hk-charcoal/90 leading-relaxed">
                    "{w.message}"
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[10px] font-manrope text-hk-taupe">
                    <span className="flex items-center gap-1">
                      {w.attendance === 'hadir' ? (
                        <span className="text-emerald-700 font-semibold">✓ Konfirmasi Hadir</span>
                      ) : (
                        <span className="text-hk-taupe font-semibold">✦ Kirim Doa Restu</span>
                      )}
                    </span>
                    <span className="font-medium text-hk-charcoal/40">HariKita Guestbook</span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center font-manrope text-[11px] text-hk-taupe">
            * Klik kartu buram di belakang untuk menariknya ke depan dalam fokus tajam (*unblur*).
          </p>
        </div>
      </div>
    </div>
  );
}
