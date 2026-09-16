"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Judul modal — dipakai sebagai aria-labelledby. */
  title?: string;
  /** Sembunyikan judul visual namun tetap sediakan nama aksesibel. */
  hideTitle?: boolean;
  children: React.ReactNode;
  /** Lebar maksimum panel. */
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** Konten footer opsional (mis. tombol aksi). */
  footer?: React.ReactNode;
}

const SIZE_CLASSES: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

/**
 * Modal accessible (Phase 7):
 * - role="dialog" + aria-modal + aria-labelledby
 * - focus trap + fokus awal + pengembalian fokus
 * - tutup via Escape & klik backdrop
 * - body scroll lock
 * - tombol tutup ≥44px dengan aria-label
 */
export function Modal({
  isOpen,
  onClose,
  title,
  hideTitle = false,
  children,
  size = "md",
  className,
  footer,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  const titleId = useRef(`hk-modal-title-${Math.random().toString(36).slice(2, 9)}`);

  useFocusTrap(panelRef, isOpen, onClose, initialFocusRef);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId.current : undefined}
      aria-label={!title ? "Dialog" : undefined}
      className="fixed inset-0 z-hk-modal flex items-center justify-center overflow-y-auto bg-hk-charcoal/70 p-4 backdrop-blur-sm animate-in fade-in duration-200 motion-reduce:animate-none"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative my-8 w-full rounded-hk-xl border border-hk-champagne/60 bg-white shadow-2xl",
          SIZE_CLASSES[size],
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-hk-champagne/30 px-5 py-4">
          {title && !hideTitle ? (
            <h2 id={titleId.current} className="font-editorial text-lg text-hk-charcoal">
              {title}
            </h2>
          ) : (
            <span className="sr-only" id={titleId.current}>
              {title ?? "Dialog"}
            </span>
          )}
          <button
            ref={initialFocusRef}
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="focus-ring -mr-2 flex h-11 w-11 items-center justify-center rounded-full text-hk-charcoal/60 transition-colors hover:bg-hk-ivory hover:text-hk-charcoal"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex flex-col gap-3 border-t border-hk-champagne/30 px-5 py-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
