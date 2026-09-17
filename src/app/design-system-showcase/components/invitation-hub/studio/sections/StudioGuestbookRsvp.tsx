'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, Check, Heart, Users } from 'lucide-react';
import { SANDBOX_GUESTBOOK_WISHES } from '@/app/design-system-showcase/data/mock-invitation-sandbox';

interface StudioGuestbookRsvpProps {
  themeColor: string;
}

export function StudioGuestbookRsvp({ themeColor }: StudioGuestbookRsvpProps) {
  const [wishes, setWishes] = useState(SANDBOX_GUESTBOOK_WISHES);
  const [guestName, setGuestName] = useState('');
  const [message, setMessage] = useState('');
  const [attendance, setAttendance] = useState<'hadir' | 'belum-pasti' | 'tidak-hadir'>('hadir');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !message.trim()) return;

    setWishes([
      {
        id: `w-${Date.now()}`,
        name: guestName,
        relation: 'Tamu Undangan',
        attendance: attendance === 'hadir' ? 'hadir' : 'kirim-doa',
        message: message,
        timestamp: 'Baru saja',
        isVip: false,
      },
      ...wishes,
    ]);

    setGuestName('');
    setMessage('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  return (
    <div className="space-y-6 px-3 py-4 text-hk-charcoal">
      <div className="text-center">
        <span
          className="font-manrope text-[10px] font-bold uppercase tracking-widest"
          style={{ color: themeColor }}
        >
          Konfirmasi Kehadiran &amp; Doa Restu
        </span>
        <h3 className="font-editorial text-2xl sm:text-3xl font-medium text-hk-charcoal mt-0.5">
          RSVP &amp; Buku Tamu
        </h3>
      </div>

      {/* RSVP Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-hk-champagne/60 bg-white p-4 shadow-xs space-y-3">
        <div>
          <label className="block font-manrope text-[10px] font-bold uppercase tracking-wider text-hk-charcoal/80 mb-1">
            Nama Lengkap:
          </label>
          <input
            type="text"
            required
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Ketik nama Anda..."
            className="w-full rounded-xl border border-hk-champagne/50 bg-hk-ivory/50 px-3 py-1.5 text-xs font-manrope text-hk-charcoal focus:border-hk-taupe focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block font-manrope text-[10px] font-bold uppercase tracking-wider text-hk-charcoal/80 mb-1">
            Konfirmasi Kehadiran:
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'hadir', label: 'Hadir' },
              { id: 'belum-pasti', label: 'Ragu-ragu' },
              { id: 'tidak-hadir', label: 'Kirim Doa' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => setAttendance(opt.id as any)}
                className={`rounded-lg py-1.5 text-[10px] font-manrope font-semibold transition-all border ${
                  attendance === opt.id
                    ? 'text-white border-transparent shadow-2xs'
                    : 'bg-hk-ivory text-hk-charcoal border-hk-champagne/40'
                }`}
                style={{
                  backgroundColor: attendance === opt.id ? themeColor : undefined,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-manrope text-[10px] font-bold uppercase tracking-wider text-hk-charcoal/80 mb-1">
            Untaian Doa &amp; Ucapan Selamat:
          </label>
          <textarea
            rows={2}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tuliskan doa terbaik untuk mempelai..."
            className="w-full rounded-xl border border-hk-champagne/50 bg-hk-ivory/50 px-3 py-1.5 text-xs font-manrope text-hk-charcoal focus:border-hk-taupe focus:outline-hidden resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-manrope font-bold text-white shadow-xs transition-transform active:scale-95"
          style={{ backgroundColor: themeColor }}
        >
          {submitted ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Doa Anda Terkirim!</span>
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span>Kirim Konfirmasi &amp; Doa</span>
            </>
          )}
        </button>
      </form>

      {/* Wishes Feed */}
      <div className="space-y-2.5">
        <span className="font-manrope text-[10px] font-bold uppercase tracking-wider text-hk-taupe">
          Untaian Doa Tamu Terhormat ({wishes.length}):
        </span>
        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
          {wishes.map((w) => (
            <div key={w.id} className="rounded-xl border border-hk-champagne/40 bg-white p-3 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-editorial text-sm font-semibold text-hk-charcoal">{w.name}</span>
                <span className="font-mono text-[8px] text-hk-taupe">{w.timestamp}</span>
              </div>
              <p className="font-manrope text-[11px] text-hk-charcoal/80 leading-relaxed">
                "{w.message}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
