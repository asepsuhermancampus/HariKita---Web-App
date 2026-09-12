'use client';

import React, { useState } from 'react';
import { Heart, Instagram, Users, Sparkles, RefreshCw } from 'lucide-react';
import { SANDBOX_COUPLE_DATA } from '../../../data/mock-invitation-sandbox';
import { cn } from '@/lib/utils';

interface SandboxCoupleViewerProps {
  accentColor: string;
}

export type CoupleCardVariant = 'twin-arches' | 'overlapping' | 'medallion' | 'switcher';

export function SandboxCoupleViewer({ accentColor }: SandboxCoupleViewerProps) {
  const [variant, setVariant] = useState<CoupleCardVariant>('twin-arches');
  const [activeSwitcher, setActiveSwitcher] = useState<'groom' | 'bride'>('groom');

  const { groom, bride, quote } = SANDBOX_COUPLE_DATA;

  return (
    <div className="rounded-2xl border border-hk-champagne/40 bg-white p-6 md:p-8 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 border-b border-hk-soft-beige pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="rounded-full bg-hk-soft-beige px-3 py-1 font-manrope text-[11px] font-bold uppercase tracking-wider text-hk-taupe">
            The Bride &amp; The Groom
          </span>
          <h3 className="mt-1 font-editorial text-2xl text-hk-charcoal">
            Live Simulator 4 Varian Card Mempelai
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'twin-arches', label: '1. Twin Arches' },
            { id: 'overlapping', label: '2. Overlapping Editorial' },
            { id: 'medallion', label: '3. Vintage Medallion' },
            { id: 'switcher', label: '4. 3° Profile Switcher' },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setVariant(v.id as CoupleCardVariant)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-manrope font-semibold transition-all',
                variant === v.id
                  ? 'text-white shadow-xs'
                  : 'bg-hk-ivory text-hk-charcoal/80 border border-hk-champagne/40 hover:border-hk-taupe'
              )}
              style={{
                backgroundColor: variant === v.id ? accentColor : undefined,
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* RENDER SELECTED VARIANT */}
      <div className="relative min-h-[440px] rounded-xl border border-hk-champagne/30 bg-hk-ivory/40 p-6 flex items-center justify-center">
        {/* VARIANT 1: TWIN ARCHES */}
        {variant === 'twin-arches' && (
          <div className="w-full max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Groom */}
              <div className="flex flex-col items-center text-center">
                <div className="h-64 w-48 overflow-hidden rounded-t-[100px] border-2 border-hk-champagne bg-white shadow-md p-1">
                  <img
                    src={groom.photo}
                    alt={groom.fullName}
                    className="h-full w-full rounded-t-[96px] object-cover"
                  />
                </div>
                <h4 className="mt-4 font-editorial text-2xl text-hk-charcoal">
                  {groom.fullName}
                </h4>
                <p className="mt-1 font-manrope text-xs text-hk-charcoal/70">
                  Putra pertama dari <br />
                  <strong>{groom.fatherName}</strong> &amp; <strong>{groom.motherName}</strong>
                </p>
                <span className="mt-2 inline-flex items-center gap-1 font-manrope text-xs text-hk-taupe">
                  <Instagram className="h-3.5 w-3.5" /> {groom.instagram}
                </span>
              </div>

              {/* Bride */}
              <div className="flex flex-col items-center text-center">
                <div className="h-64 w-48 overflow-hidden rounded-t-[100px] border-2 border-hk-champagne bg-white shadow-md p-1">
                  <img
                    src={bride.photo}
                    alt={bride.fullName}
                    className="h-full w-full rounded-t-[96px] object-cover"
                  />
                </div>
                <h4 className="mt-4 font-editorial text-2xl text-hk-charcoal">
                  {bride.fullName}
                </h4>
                <p className="mt-1 font-manrope text-xs text-hk-charcoal/70">
                  Putri kedua dari <br />
                  <strong>{bride.fatherName}</strong> &amp; <strong>{bride.motherName}</strong>
                </p>
                <span className="mt-2 inline-flex items-center gap-1 font-manrope text-xs text-hk-taupe">
                  <Instagram className="h-3.5 w-3.5" /> {bride.instagram}
                </span>
              </div>
            </div>

            <div className="mt-8 text-center border-t border-hk-champagne/40 pt-4 max-w-xl mx-auto">
              <p className="font-editorial text-sm italic text-hk-charcoal/80">
                "{quote.text}"
              </p>
              <span className="block mt-1 font-manrope text-[11px] font-bold text-hk-taupe uppercase tracking-wider">
                {quote.verse}
              </span>
            </div>
          </div>
        )}

        {/* VARIANT 2: OVERLAPPING EDITORIAL */}
        {variant === 'overlapping' && (
          <div className="relative w-full max-w-2xl py-6 flex flex-col md:flex-row items-center justify-center gap-6">
            {/* Card 1: Groom */}
            <div className="relative z-10 w-full md:w-72 rounded-xl border border-hk-champagne/50 bg-white p-5 shadow-lg md:-mr-8">
              <div className="h-56 w-full overflow-hidden rounded-lg">
                <img
                  src={groom.photo}
                  alt={groom.fullName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-3">
                <span className="font-manrope text-[10px] uppercase tracking-widest text-hk-taupe font-bold">
                  The Groom
                </span>
                <h4 className="font-editorial text-xl text-hk-charcoal">{groom.fullName}</h4>
                <p className="font-manrope text-[11px] text-hk-charcoal/70 mt-1">{groom.origin}</p>
              </div>
            </div>

            {/* Card 2: Bride (Offsetting) */}
            <div className="relative z-20 w-full md:w-72 rounded-xl border-2 border-hk-taupe bg-white p-5 shadow-2xl md:mt-12">
              <div className="h-56 w-full overflow-hidden rounded-lg">
                <img
                  src={bride.photo}
                  alt={bride.fullName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-3">
                <span className="font-manrope text-[10px] uppercase tracking-widest text-hk-taupe font-bold">
                  The Bride
                </span>
                <h4 className="font-editorial text-xl text-hk-charcoal">{bride.fullName}</h4>
                <p className="font-manrope text-[11px] text-hk-charcoal/70 mt-1">{bride.origin}</p>
              </div>
            </div>
          </div>
        )}

        {/* VARIANT 3: VINTAGE PORTRAIT MEDALLION */}
        {variant === 'medallion' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl text-center">
            {/* Groom Oval */}
            <div className="flex flex-col items-center">
              <div className="h-56 w-44 rounded-full border-4 border-dashed border-[#C9A88A] bg-white p-2 shadow-inner">
                <img
                  src={groom.photo}
                  alt={groom.fullName}
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <h4 className="mt-4 font-editorial text-2xl text-hk-charcoal">{groom.nickName}</h4>
              <p className="font-manrope text-xs text-hk-charcoal/70">{groom.fullName}</p>
            </div>

            {/* Bride Oval */}
            <div className="flex flex-col items-center">
              <div className="h-56 w-44 rounded-full border-4 border-dashed border-[#C9A88A] bg-white p-2 shadow-inner">
                <img
                  src={bride.photo}
                  alt={bride.fullName}
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <h4 className="mt-4 font-editorial text-2xl text-hk-charcoal">{bride.nickName}</h4>
              <p className="font-manrope text-xs text-hk-charcoal/70">{bride.fullName}</p>
            </div>
          </div>
        )}

        {/* VARIANT 4: 3° PROFILE SWITCHER */}
        {variant === 'switcher' && (
          <div className="flex flex-col items-center justify-center">
            <div className="mb-4 flex items-center gap-2">
              <button
                onClick={() => setActiveSwitcher('groom')}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-manrope font-semibold',
                  activeSwitcher === 'groom'
                    ? 'bg-hk-taupe text-white shadow-xs'
                    : 'bg-white text-hk-charcoal border'
                )}
              >
                Mempelai Pria (Aditya)
              </button>
              <button
                onClick={() => setActiveSwitcher('bride')}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-manrope font-semibold',
                  activeSwitcher === 'bride'
                    ? 'bg-hk-taupe text-white shadow-xs'
                    : 'bg-white text-hk-charcoal border'
                )}
              >
                Mempelai Wanita (Ratna)
              </button>
            </div>

            <div className="relative h-96 w-72">
              {/* Back Card (3° tilted) */}
              <div
                className="absolute inset-0 rounded-2xl border border-hk-champagne/60 bg-white p-4 shadow-lg rotate-6 translate-y-3 opacity-70"
              />

              {/* Front Active Card */}
              <div
                className="relative z-10 h-full w-full rounded-2xl border-2 border-hk-taupe bg-white p-5 shadow-2xl flex flex-col justify-between transition-all duration-300"
              >
                <div className="h-52 w-full overflow-hidden rounded-xl">
                  <img
                    src={activeSwitcher === 'groom' ? groom.photo : bride.photo}
                    alt="Active Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-3 text-center">
                  <span className="font-manrope text-[10px] uppercase tracking-widest text-hk-taupe font-bold">
                    {activeSwitcher === 'groom' ? 'The Groom' : 'The Bride'}
                  </span>
                  <h4 className="font-editorial text-2xl text-hk-charcoal">
                    {activeSwitcher === 'groom' ? groom.fullName : bride.fullName}
                  </h4>
                  <p className="font-manrope text-xs text-hk-charcoal/70 mt-1">
                    {activeSwitcher === 'groom' ? groom.bio : bride.bio}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
