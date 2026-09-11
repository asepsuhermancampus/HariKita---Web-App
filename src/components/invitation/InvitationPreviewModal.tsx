"use client";

import React, { useEffect, useCallback, useState } from "react";
import { X, ExternalLink, Smartphone } from "lucide-react";
import { getThemeById } from "@/lib/templates/registry";

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
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const demoUrl = `/undangan/demo?theme=${themeId}&to=Bapak+Joko+dan+Keluarga&sesi=s1`;

  const theme = themeId ? getThemeById(themeId) : null;
  const bgColor = theme?.colors.background ?? "#FAF8F5";
  const primaryColor = theme?.colors.primary ?? "#C5A880";
  const cardBg = theme?.colors.cardBg ?? "#2B1E22";
  const borderCol = theme?.colors.border ?? "#4A2E35";

  // Reset loading state whenever theme changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setIframeLoaded(false);
    }
  }, [isOpen, themeId]);

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
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Panel - phone frame styled with theme cardBg and border */}
      <div
        className="relative z-10 flex flex-col w-full h-[100dvh] sm:h-[88vh] sm:max-h-[820px] sm:w-[414px] sm:rounded-3xl shadow-2xl overflow-hidden border-0 sm:border-4 transition-colors duration-300"
        style={{
          backgroundColor: cardBg,
          borderColor: borderCol,
        }}
      >
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
        <div
          className="hidden sm:flex items-center justify-center py-1.5 shrink-0 transition-colors"
          style={{ backgroundColor: cardBg }}
        >
          <div className="w-16 h-1 rounded-full bg-white/25" />
        </div>

        {/* iframe container — styled with theme background so zero navy flash occurs */}
        <div
          className="relative flex-1 w-full h-full min-h-0 overflow-hidden transition-colors"
          style={{ backgroundColor: bgColor }}
        >
          {/* Gentle themed loading screen before iframe renders */}
          {!iframeLoaded && (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center space-y-3"
              style={{ backgroundColor: bgColor }}
            >
              <div
                className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{
                  borderColor: `${primaryColor}40`,
                  borderTopColor: primaryColor,
                }}
              />
              <span
                className="text-xs font-serif font-semibold tracking-wider animate-pulse"
                style={{ color: primaryColor }}
              >
                Memuat {themeTitle}...
              </span>
            </div>
          )}

          <iframe
            src={demoUrl}
            onLoad={() => setIframeLoaded(true)}
            className="w-full h-full border-0 block relative z-0"
            title={`Preview: ${themeTitle}`}
            loading="eager"
          />
        </div>

        {/* Bottom home indicator — only on desktop */}
        <div
          className="hidden sm:flex items-center justify-center py-1.5 shrink-0 transition-colors"
          style={{ backgroundColor: cardBg }}
        >
          <div className="w-24 h-1 rounded-full bg-white/30" />
        </div>
      </div>
    </div>
  );
};
