'use client';

import React from 'react';
import { Calendar, Clock, MapPin, BookmarkPlus } from 'lucide-react';
import { SANDBOX_SCHEDULE_DATA } from '@/app/design-system-showcase/data/mock-invitation-sandbox';

interface StudioEventScheduleProps {
  themeColor: string;
}

export function StudioEventSchedule({ themeColor }: StudioEventScheduleProps) {
  return (
    <div className="space-y-6 px-3 py-4 text-hk-charcoal">
      <div className="text-center">
        <span
          className="font-manrope text-[10px] font-bold uppercase tracking-widest"
          style={{ color: themeColor }}
        >
          Rangkaian Acara Sakral
        </span>
        <h3 className="font-editorial text-2xl sm:text-3xl font-medium text-hk-charcoal mt-0.5">
          Akad &amp; Resepsi
        </h3>
      </div>

      {/* Countdown Timer Strip */}
      <div className="rounded-2xl border border-hk-champagne/60 bg-white p-4 shadow-xs text-center space-y-2">
        <span className="font-manrope text-[10px] uppercase tracking-wider text-hk-taupe font-bold">
          Menghitung Hari Bahagia:
        </span>
        <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
          {[
            { label: 'HARI', val: '41' },
            { label: 'JAM', val: '14' },
            { label: 'MENIT', val: '28' },
            { label: 'DETIK', val: '09' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-hk-ivory p-2 border border-hk-champagne/30">
              <span
                className="block font-editorial text-xl font-bold leading-none"
                style={{ color: themeColor }}
              >
                {item.val}
              </span>
              <span className="block font-mono text-[8px] text-hk-charcoal/60 mt-1">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Sesi Cards */}
      <div className="space-y-4">
        {SANDBOX_SCHEDULE_DATA.map((sch) => (
          <div
            key={sch.id}
            className="rounded-2xl border border-hk-champagne/50 bg-white p-4 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span
                className="rounded-full px-2.5 py-0.5 font-manrope text-[9px] font-bold uppercase tracking-wider text-white shadow-2xs"
                style={{ backgroundColor: themeColor }}
              >
                {sch.badge}
              </span>
              <div className="flex items-center gap-1 font-mono text-[10px] text-hk-taupe">
                <Calendar className="h-3 w-3" />
                <span>{sch.date}</span>
              </div>
            </div>

            <div>
              <h4 className="font-editorial text-xl font-semibold text-hk-charcoal">{sch.type}</h4>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-hk-charcoal/75">
                <Clock className="h-3.5 w-3.5 text-hk-taupe" />
                <span className="font-semibold">{sch.time}</span>
              </div>
              <div className="mt-1 flex items-start gap-1.5 text-xs text-hk-charcoal/70">
                <MapPin className="h-3.5 w-3.5 text-hk-taupe shrink-0 mt-0.5" />
                <span>{sch.venue} • {sch.address}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
