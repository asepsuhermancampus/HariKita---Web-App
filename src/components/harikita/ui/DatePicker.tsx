"use client";

import React, { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import type { Matcher } from "react-day-picker";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";

export interface DatePickerProps {
  /** Tanggal dalam format kanonikal "YYYY-MM-DD" */
  value?: string;
  /** Callback saat tanggal berubah, mengembalikan string "YYYY-MM-DD" */
  onChange?: (val: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  error?: string;
  helperText?: string;
  className?: string;
  triggerClassName?: string;
  /** Batas tanggal minimal yang bisa dipilih ("YYYY-MM-DD" atau Date) */
  minDate?: string | Date;
  /** Batas tanggal maksimal yang bisa dipilih ("YYYY-MM-DD" atau Date) */
  maxDate?: string | Date;
  /** Daftar tanggal blackout/terkunci ("YYYY-MM-DD") */
  blackoutDates?: string[];
  /** Apakah tanggal blackout dinonaktifkan dari pemilihan (default: false) */
  disableBlackoutDates?: boolean;
  /** Format teks tampilan saat tanggal terpilih (default: "EEEE, dd MMMM yyyy") */
  displayFormat?: string;
  /** Penempatan dropdown popover */
  align?: "left" | "right";
  /** Ukuran input trigger */
  size?: "sm" | "md" | "lg";
}

/** Helper konversi "YYYY-MM-DD" ke objek Date lokal (menghindari UTC shift) */
function parseYmd(ymd: string): Date | undefined {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd.trim())) return undefined;
  const [y, m, d] = ymd.trim().split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Helper konversi Date ke string kanonikal "YYYY-MM-DD" */
function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal...",
  label,
  required = false,
  disabled = false,
  id,
  name,
  error,
  helperText,
  className = "",
  triggerClassName = "",
  minDate,
  maxDate,
  blackoutDates = [],
  disableBlackoutDates = false,
  displayFormat = "EEEE, dd MMMM yyyy",
  align = "left",
  size = "md",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? parseYmd(value) : undefined;
  const minDateObj = minDate ? (typeof minDate === "string" ? parseYmd(minDate) : minDate) : undefined;
  const maxDateObj = maxDate ? (typeof maxDate === "string" ? parseYmd(maxDate) : maxDate) : undefined;

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Tutup dropdown saat tombol Escape ditekan
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const ymd = toYmd(date);
      onChange?.(ymd);
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.("");
  };

  // Blackout matcher untuk styling kalender
  const blackoutDatesObj = blackoutDates
    .map((d) => parseYmd(d))
    .filter((d): d is Date => d !== undefined);

  // Matcher untuk tanggal yang disabled
  const disabledMatchers: Matcher[] = [];
  if (minDateObj) {
    disabledMatchers.push({ before: minDateObj });
  }
  if (maxDateObj) {
    disabledMatchers.push({ after: maxDateObj });
  }
  if (disableBlackoutDates && blackoutDatesObj.length > 0) {
    disabledMatchers.push(...blackoutDatesObj);
  }

  // Formatting display
  let displayText = "";
  if (selectedDate && !isNaN(selectedDate.getTime())) {
    try {
      displayText = format(selectedDate, displayFormat, { locale: localeId });
    } catch {
      displayText = value || "";
    }
  }

  const sizeStyles = {
    sm: "py-1.5 px-3 text-xs min-h-[36px]",
    md: "py-2.5 px-3.5 text-xs min-h-[44px]",
    lg: "py-3 px-4 text-sm min-h-[48px]",
  };

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-hk-charcoal mb-1 font-manrope"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Hidden input untuk mendukung FormData / native form submit */}
      {name && <input type="hidden" name={name} value={value || ""} />}

      {/* Trigger Button */}
      <div className="relative">
        <button
          type="button"
          id={id}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={`w-full flex items-center justify-between rounded-xl border text-left font-manrope transition-all duration-150 focus-ring cursor-pointer select-none ${
            sizeStyles[size]
          } ${
            disabled
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : error
              ? "border-red-400 bg-red-50/40 text-hk-charcoal"
              : isOpen
              ? "border-hk-taupe bg-white ring-2 ring-hk-taupe/20"
              : "border-hk-champagne/60 bg-white hover:border-hk-champagne hover:bg-hk-ivory/30 text-hk-charcoal"
          } ${triggerClassName}`}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <CalendarIcon
              className={`w-4 h-4 shrink-0 transition-colors ${
                isOpen || value ? "text-hk-taupe" : "text-hk-charcoal/40"
              }`}
            />
            <span
              className={`truncate ${
                displayText ? "text-hk-charcoal font-medium" : "text-hk-charcoal/50"
              }`}
            >
              {displayText || placeholder}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            {value && !disabled && !required && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => e.key === "Enter" && handleClear(e as unknown as React.MouseEvent)}
                className="p-1 rounded-full hover:bg-hk-soft-beige/50 text-hk-charcoal/40 hover:text-hk-charcoal transition-colors"
                title="Hapus pilihan tanggal"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </button>

        {/* Popover Card */}
        {isOpen && (
          <div
            className={`absolute z-50 mt-2 bg-white rounded-2xl border border-hk-champagne/50 shadow-xl p-3 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md ${
              align === "right" ? "right-0" : "left-0"
            }`}
            style={{ width: "max-content", minWidth: "300px" }}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-hk-champagne/20 px-1">
              <span className="text-[11px] font-semibold text-hk-taupe uppercase tracking-wider font-manrope">
                Pilih Tanggal Acara
              </span>
              {value && (
                <span className="text-[11px] font-mono text-hk-charcoal/70 bg-hk-ivory px-2 py-0.5 rounded-full border border-hk-champagne/30">
                  {value}
                </span>
              )}
            </div>

            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              locale={localeId}
              disabled={disabledMatchers.length > 0 ? disabledMatchers : undefined}
              modifiers={blackoutDatesObj.length > 0 ? { blackout: blackoutDatesObj } : undefined}
              modifiersClassNames={{ blackout: "day-blackout" }}
            />

            {blackoutDatesObj.length > 0 && (
              <div className="mt-2 pt-2 border-t border-hk-champagne/20 flex items-center gap-2 text-[10px] text-red-600 px-1 font-manrope">
                <span className="w-2.5 h-2.5 rounded-full bg-red-200 border border-red-400 inline-block shrink-0" />
                <span>Tanggal yang ditandai merah tidak tersedia / offline booking.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Helper text & error messages */}
      {error && <p className="text-[11px] text-red-600 mt-1 font-manrope">{error}</p>}
      {!error && helperText && (
        <p className="text-[10px] text-hk-charcoal/60 mt-1 font-manrope">{helperText}</p>
      )}
    </div>
  );
}
