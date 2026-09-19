"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownGroup {
  /** Judul grup (opsional). */
  label?: string;
  options: Array<{ value: string; label: string; hint?: string }>;
}

export interface DropdownProps {
  /** Nilai terpilih. */
  value: string;
  /** Callback saat pilihan berubah. */
  onChange: (value: string) => void;
  /** Grup opsi. */
  groups: DropdownGroup[];
  /** Placeholder saat belum ada pilihan. */
  placeholder?: string;
  /** id untuk atribut `id` trigger (aksesibilitas / label htmlFor). */
  id?: string;
  /** Nonaktifkan dropdown. */
  disabled?: boolean;
  /** Kelas tambahan untuk trigger. */
  className?: string;
  /** Label aksesibel. */
  ariaLabel?: string;
}

/**
 * Dropdown "Button simple" — terinspirasi komponen Dropdown Untitled UI.
 *
 * Fitur:
 *  - Trigger button dengan label + chevron.
 *  - Panel melayang dengan grup (section) dan centang pada item terpilih.
 *  - Tutup saat klik di luar / Escape / pilih item.
 *  - Navigasi keyboard dasar (Enter/Space buka, Escape tutup).
 *  - Memakai token warna hk-* design system HariKita.
 */
export function Dropdown({
  value,
  onChange,
  groups,
  placeholder = "Pilih opsi",
  id,
  disabled = false,
  className,
  ariaLabel,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Tutup saat klik di luar.
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const selected = groups
    .flatMap((g) => g.options)
    .find((o) => o.value === value);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "focus-ring flex w-full items-center justify-between gap-2 p-2.5 rounded-xl border text-left transition-colors",
          "border-hk-soft-beige bg-white hover:border-hk-champagne",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-hk-champagne",
          className
        )}
      >
        <span
          className={cn(
            "truncate text-xs font-manrope",
            selected ? "text-hk-charcoal font-semibold" : "text-hk-charcoal/50"
          )}
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-hk-taupe transition-transform duration-200",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-hk-champagne/50 bg-white p-1 shadow-xl animate-in fade-in zoom-in-95 duration-100"
        >
          {groups.map((group, gi) => (
            <div key={group.label ?? gi} className={cn(gi > 0 && "border-t border-hk-soft-beige mt-1 pt-1")}>
              {group.label && (
                <div className="px-3 py-1.5 text-[10px] font-manrope font-bold uppercase tracking-wider text-hk-taupe">
                  {group.label}
                </div>
              )}
              {group.options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "focus-ring flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs font-manrope transition-colors",
                      isSelected
                        ? "bg-hk-ivory text-hk-charcoal font-semibold"
                        : "text-hk-charcoal/80 hover:bg-hk-ivory/70"
                    )}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-hk-taupe" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
