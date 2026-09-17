'use client';

import React, { useState } from 'react';
import {
  Smartphone,
  Calendar,
  MapPin,
  Clock,
  Heart,
  Share2,
  Lock,
  ChevronDown,
  Gift,
} from 'lucide-react';
import {
  SANDBOX_COUPLE_DATA,
  SANDBOX_SCHEDULE_DATA,
  SANDBOX_STORIES_DATA,
  SANDBOX_GALLERY_PHOTOS,
} from '../../data/mock-invitation-sandbox';
import { cn } from '@/lib/utils';

export function InvitationMobileFrameSection() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { groom, bride, quote } = SANDBOX_COUPLE_DATA;

  return (
    <section id="sandbox-mobile" className="scroll-mt-24">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between border-b border-hk-champagne/40 pb-4">
        <div>
          <div className="flex items-center gap-2 text-hk-taupe">
            <Smartphone className="h-5 w-5" />
            <span className="font-manrope text-xs font-bold uppercase tracking-widest">
              Mobile-First Architecture
            </span>
          </div>
          <h2 className="mt-1 font-editorial text-3xl font-normal text-hk-charcoal">
            Simulator Undangan Pernikahan Utuh (375px)
          </h2>
        </div>
        <span className="font-manrope text-xs text-hk-taupe">
          Sentuhan &amp; Ergonomi Layar Smartphone
        </span>
      </div>

      <div className="flex flex-col items-center justify-center w-full px-1 sm:px-0">
        {/* Smartphone Bezel */}
        <div className="relative w-full max-w-[375px] overflow-hidden rounded-[36px] sm:rounded-[40px] border-[6px] sm:border-[8px] border-hk-charcoal bg-hk-ivory shadow-2xl">
          {/* Speaker Notch */}
          <div className="absolute top-2 left-1/2 z-50 h-3.5 sm:h-4 w-24 sm:w-28 -translate-x-1/2 rounded-full bg-hk-charcoal" />

          {/* Scrollable Viewport Content */}
          <div className="relative h-[720px] overflow-y-auto bg-[#FAF8F5] text-hk-charcoal">
            {/* 1. GATEKEEPER / ENVELOPE COVER (BEFORE OPEN) */}
            {!isOpen ? (
              <div className="relative flex h-full flex-col justify-between p-6 text-center">
                <div className="pt-8">
                  <span className="font-editorial text-xs italic tracking-widest text-hk-taupe">
                    The Wedding Celebration of
                  </span>
                  <h3 className="mt-2 font-editorial text-4xl text-hk-charcoal">
                    Aditya &amp; Ratna
                  </h3>
                  <p className="mt-1 font-mono text-[11px] text-hk-champagne tracking-wider">
                    24 . 10 . 2026
                  </p>
                </div>

                {/* Guest Box Floating */}
                <div className="rounded-2xl border border-hk-champagne/60 bg-white/90 p-5 shadow-sm backdrop-blur-xs">
                  <span className="font-manrope text-[10px] uppercase tracking-wider text-hk-charcoal/60">
                    Kepada Yth. Bapak/Ibu/Saudara/i:
                  </span>
                  <div className="mt-1 font-editorial text-2xl font-medium text-hk-charcoal">
                    Tamu Kehormatan
                  </div>
                  <span className="mt-1 inline-block rounded-full bg-hk-soft-beige px-2.5 py-0.5 font-manrope text-[10px] text-hk-taupe">
                    Keluarga Besar di Kebumen
                  </span>
                </div>

                {/* Wax Seal 3D Opening Button */}
                <div className="pb-6">
                  <button
                    onClick={() => setIsOpen(true)}
                    className="group mx-auto flex flex-col items-center gap-2 transition-transform active:scale-95"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#A0886F] via-[#88735B] to-[#6E5942] text-white shadow-[0_6px_20px_rgba(136,115,91,0.35)] ring-4 ring-[#C9A88A]/40 transition-transform group-hover:scale-105">
                      <Heart className="h-7 w-7 fill-white" />
                    </div>
                    <span className="font-manrope text-xs font-semibold text-hk-taupe tracking-wider">
                      ✦ Buka Undangan ✦
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* 2. OPENED INVITATION STREAM */
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Hero Opened Banner */}
                <div className="relative h-96 w-full overflow-hidden">
                  <img
                    src={SANDBOX_GALLERY_PHOTOS[0].src}
                    alt="Cover Opened"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] via-black/20 to-transparent flex flex-col justify-end p-6 text-center">
                    <span className="font-editorial text-sm italic text-white/90">
                      Walimatul 'Ursy
                    </span>
                    <h3 className="font-editorial text-4xl text-white drop-shadow-md">
                      Aditya &amp; Ratna
                    </h3>
                    <p className="font-manrope text-xs text-white/80 mt-1">
                      Sabtu, 24 Oktober 2026 • Kebumen
                    </p>
                  </div>
                </div>

                {/* Mempelai Profiles */}
                <div className="px-5 text-center space-y-6">
                  <div>
                    <div className="mx-auto h-40 w-32 overflow-hidden rounded-t-[70px] border-2 border-hk-champagne bg-white shadow-md p-1">
                      <img
                        src={groom.photo}
                        alt={groom.fullName}
                        className="h-full w-full rounded-t-[66px] object-cover"
                      />
                    </div>
                    <h4 className="mt-3 font-editorial text-2xl font-medium text-hk-charcoal">
                      {groom.fullName}
                    </h4>
                    <p className="font-manrope text-xs text-hk-charcoal/70">
                      Putra dari {groom.fatherName} &amp; {groom.motherName}
                    </p>
                  </div>

                  <div className="font-editorial text-2xl italic text-hk-taupe">&amp;</div>

                  <div>
                    <div className="mx-auto h-40 w-32 overflow-hidden rounded-t-[70px] border-2 border-hk-champagne bg-white shadow-md p-1">
                      <img
                        src={bride.photo}
                        alt={bride.fullName}
                        className="h-full w-full rounded-t-[66px] object-cover"
                      />
                    </div>
                    <h4 className="mt-3 font-editorial text-2xl font-medium text-hk-charcoal">
                      {bride.fullName}
                    </h4>
                    <p className="font-manrope text-xs text-hk-charcoal/70">
                      Putri dari {bride.fatherName} &amp; {bride.motherName}
                    </p>
                  </div>
                </div>

                {/* Schedule Sesi */}
                <div className="px-5 space-y-3">
                  <div className="text-center">
                    <span className="font-manrope text-[10px] uppercase tracking-widest text-hk-taupe font-bold">
                      Rangkaian Acara
                    </span>
                    <h4 className="font-editorial text-2xl text-hk-charcoal">Akad &amp; Resepsi</h4>
                  </div>

                  {SANDBOX_SCHEDULE_DATA.map((sch) => (
                    <div
                      key={sch.id}
                      className="rounded-xl border border-hk-champagne/50 bg-white p-4 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-manrope text-[10px] font-bold text-hk-taupe uppercase">
                          {sch.badge}
                        </span>
                        <Calendar className="h-3.5 w-3.5 text-hk-taupe" />
                      </div>
                      <h5 className="font-editorial text-lg text-hk-charcoal mt-1">{sch.type}</h5>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-hk-charcoal/70">
                        <Clock className="h-3.5 w-3.5 text-hk-taupe" />
                        <span>{sch.time}</span>
                      </div>
                      <div className="mt-1 flex items-start gap-1.5 text-xs text-hk-charcoal/80">
                        <MapPin className="h-3.5 w-3.5 text-hk-taupe shrink-0 mt-0.5" />
                        <span>{sch.venue} - {sch.address}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Closing Outro in Simulator */}
                <div className="bg-[#2B2B2B] text-white p-6 text-center space-y-4">
                  <span className="font-editorial text-xs italic tracking-widest text-hk-champagne">
                    Dengan Penuh Rasa Syukur
                  </span>
                  <p className="font-editorial text-lg leading-relaxed">
                    "Merupakan suatu kehormatan dan kebahagiaan bagi kami sekeluarga apabila berkenan hadir dan memberikan doa restu."
                  </p>
                  <p className="font-manrope text-[10px] text-white/60">
                    Keluarga Besar H. Bambang Soediro &amp; Drs. H. Hartono Sudrajat
                  </p>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-white/10 py-2 text-xs font-manrope text-white hover:bg-white/20"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>Tutup &amp; Kunci Undangan</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mt-4 font-manrope text-xs text-hk-taupe text-center">
          * Simulator menguji alur mulai dari Amplop Gatekeeper hingga penutup puitis.
        </p>
      </div>
    </section>
  );
}
