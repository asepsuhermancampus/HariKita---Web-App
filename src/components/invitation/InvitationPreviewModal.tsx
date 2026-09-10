"use client";

import React, { useEffect, useCallback } from "react";
import { X, ExternalLink, Smartphone } from "lucide-react";

interface InvitationPreviewModalProps {
  isOpen: boolean;
  themeId: string;
  themeTitle: string;
  onClose: () => void;
}

export const InvitationPreviewModal: React.FC<InvitationPreviewModalProps> = ({
  isOpen,
  themeId,
  themeTitle,
  onClose,
}) => {
  const demoUrl = `/undangan/demo?theme=${themeId}&to=Bapak+Joko+dan+Keluarga&sesi=s1`;

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Preview undangan ${themeTitle}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative z-10 flex flex-col w-full h-[100dvh] sm:h-[88vh] sm:max-h-[820px] sm:w-[414px] sm:rounded-3xl shadow-2xl overflow-hidden bg-[#1A1A2E] border-0 sm:border-4 sm:border-[#4A2E35]">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#4A2E35] text-white shrink-0 border-b border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <Smartphone className="w-4 h-4 text-[#C5A880] shrink-0" />
            <span className="text-sm font-serif font-bold text-[#F3EDE6] truncate max-w-[180px]">
              {themeTitle}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Open in new tab */}
            <a
              href={demoUrl}
              target="_blank"
              rel="noreferrer"
              title="Buka di tab baru"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/15 text-white hover:bg-white/25 transition-colors border border-white/20"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="hidden sm:inline">Layar Penuh</span>
            </a>
            {/* Close button */}
            <button
              id="btn-close-preview-modal"
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 transition-colors text-white"
              aria-label="Tutup preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notch bar — only show on sm+ (simulated phone) */}
        <div className="hidden sm:flex items-center justify-center py-1.5 bg-[#141422] shrink-0">
          <div className="w-16 h-1 rounded-full bg-white/25" />
        </div>

        {/* iframe container — flex-1 occupies exact remaining height */}
        <div className="relative flex-1 w-full h-full min-h-0 bg-white overflow-hidden">
          <iframe
            src={demoUrl}
            className="w-full h-full border-0 block"
            title={`Preview: ${themeTitle}`}
            loading="eager"
          />
        </div>

        {/* Bottom home indicator — only on desktop */}
        <div className="hidden sm:flex items-center justify-center py-1.5 bg-[#141422] shrink-0">
          <div className="w-24 h-1 rounded-full bg-white/30" />
        </div>
      </div>
    </div>
  );
};
