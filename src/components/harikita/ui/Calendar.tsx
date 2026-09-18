"use client";

import React from "react";
import { DayPicker } from "react-day-picker";
import type { Matcher } from "react-day-picker";
import { id as localeId } from "date-fns/locale";

export interface CalendarProps {
  /** Tanggal terpilih ("YYYY-MM-DD" atau Date) */
  selected?: string | Date;
  /** Callback saat tanggal dipilih, mengembalikan "YYYY-MM-DD" */
  onSelect?: (val: string) => void;
  /** Tanggal blackout / terkunci ("YYYY-MM-DD") */
  blackoutDates?: string[];
  /** Tanggal pesanan / booking aktif ("YYYY-MM-DD") */
  bookedDates?: string[];
  /** Batas tanggal minimal yang bisa dipilih ("YYYY-MM-DD" atau Date) */
  minDate?: string | Date;
  /** Batas tanggal maksimal yang bisa dipilih ("YYYY-MM-DD" atau Date) */
  maxDate?: string | Date;
  className?: string;
}

function parseYmd(ymd: string): Date | undefined {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd.trim())) return undefined;
  const [y, m, d] = ymd.trim().split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function Calendar({
  selected,
  onSelect,
  blackoutDates = [],
  bookedDates = [],
  minDate,
  maxDate,
  className = "",
}: CalendarProps) {
  const selectedDate = selected
    ? typeof selected === "string"
      ? parseYmd(selected)
      : selected
    : undefined;

  const minDateObj = minDate ? (typeof minDate === "string" ? parseYmd(minDate) : minDate) : undefined;
  const maxDateObj = maxDate ? (typeof maxDate === "string" ? parseYmd(maxDate) : maxDate) : undefined;

  const blackoutDatesObj = blackoutDates
    .map((d) => parseYmd(d))
    .filter((d): d is Date => d !== undefined);

  const bookedDatesObj = bookedDates
    .map((d) => parseYmd(d))
    .filter((d): d is Date => d !== undefined);

  const disabledMatchers: Matcher[] = [];
  if (minDateObj) disabledMatchers.push({ before: minDateObj });
  if (maxDateObj) disabledMatchers.push({ after: maxDateObj });

  return (
    <div className={`p-4 bg-white rounded-3xl border border-hk-champagne/40 shadow-xs inline-block w-full max-w-sm ${className}`}>
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={(date) => {
          if (date) {
            onSelect?.(toYmd(date));
          }
        }}
        locale={localeId}
        disabled={disabledMatchers.length > 0 ? disabledMatchers : undefined}
        modifiers={{
          blackout: blackoutDatesObj,
          booked: bookedDatesObj,
        }}
        modifiersClassNames={{
          blackout: "day-blackout",
          booked: "day-booked",
        }}
      />

      {(blackoutDates.length > 0 || bookedDates.length > 0) && (
        <div className="mt-3 pt-3 border-t border-hk-champagne/30 flex flex-wrap items-center gap-3 text-[11px] font-manrope">
          {blackoutDates.length > 0 && (
            <div className="flex items-center gap-1.5 text-red-700">
              <span className="w-2.5 h-2.5 rounded-full bg-red-100 border border-red-400 inline-block" />
              <span>Terkunci (Offline)</span>
            </div>
          )}
          {bookedDates.length > 0 && (
            <div className="flex items-center gap-1.5 text-emerald-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-100 border border-emerald-400 inline-block" />
              <span>Booking Klien Aktif</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
