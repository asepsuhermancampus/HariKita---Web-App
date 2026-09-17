"use client";

import React, { useState, useEffect } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import { Gift, Heart, ChevronDown, ChevronUp, Copy, Check, MapPin } from "lucide-react";

function isDarkColor(hex?: string): boolean {
  if (!hex) return false;
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  }
  return false;
}

export const GiftSectionDispatcher: React.FC<{
  giftInfo: DedicatedTemplateProps["giftInfo"];
  theme: DedicatedTemplateProps["theme"];
}> = ({ giftInfo, theme }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isAutoTriggered, setIsAutoTriggered] = useState(false);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Listen to RSVP attendance selection changes across the page
  useEffect(() => {
    const handleAttendanceEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ attendance?: string }>;
      const att = customEvent.detail?.attendance;
      if (att === "tidak-hadir" || att === "tidak_hadir" || att === "ragu") {
        setIsRevealed(true);
        setIsAutoTriggered(true);
      } else if (att === "hadir") {
        setIsAutoTriggered(false);
      }
    };

    window.addEventListener("guest_attendance_change", handleAttendanceEvent);
    return () => {
      window.removeEventListener("guest_attendance_change", handleAttendanceEvent);
    };
  }, []);

  const handleToggleReveal = () => {
    soundscape.playTick();
    setIsRevealed((prev) => !prev);
  };

  const handleCopyAccount = (number: string, bank: string) => {
    navigator.clipboard.writeText(number);
    soundscape.playCoin();
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(null), 2500);
  };

  const handleCopyAddress = () => {
    if (!giftInfo.physicalGiftAddress) return;
    navigator.clipboard.writeText(giftInfo.physicalGiftAddress);
    soundscape.playCoin();
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const isDark = isDarkColor(theme?.colors?.background) || theme?.archetypeId === "celestial";
  const primaryColor = theme?.colors?.primary || "#C5A880";
  const accentColor = theme?.colors?.accent || "#C5A880";
  const textColor = theme?.colors?.text || "#4A2E35";
  const bgColor = theme?.colors?.background || "#FAF8F5";
  const cardBgColor = theme?.colors?.cardBg || "#FFFFFF";
  const mutedColor = "#6B5E62"; // consistent muted text across all themes

  // Celestial dark theme uses slate-950, others use theme cardBg
  const cardBackground = isDark
    ? "rgba(15, 23, 42, 0.85)"
    : `${cardBgColor}E6`; // 90% opacity
  const sectionBackground = isDark
    ? "rgba(30, 41, 59, 0.65)"
    : `${bgColor}E6`;

  return (
    <section id="gift" className="py-16 px-4 sm:px-6 relative overflow-hidden bg-transparent">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Unified Card Container */}
        <div
          className="p-6 sm:p-9 rounded-3xl border shadow-lg backdrop-blur-xs text-center space-y-6 transition-colors"
          style={{
            backgroundColor: cardBackground,
            borderColor: `${accentColor}55`,
            color: isDark ? "#F8FAFC" : textColor,
          }}
        >
          {/* Header Badge & Title */}
          <div className="space-y-2">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-serif font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${accentColor}22`,
                color: isDark ? "#E2E8F0" : primaryColor,
              }}
            >
              <Heart className="w-3.5 h-3.5" style={{ color: accentColor, fill: accentColor }} />
              <span>Tanda Kasih &amp; Kehormatan Adat</span>
            </div>
            <h3
              className="font-serif text-2xl sm:text-3xl font-bold"
              style={{ color: isDark ? "#F8FAFC" : textColor }}
            >
              Doa Restu Anda Adalah Hadiah Terindah
            </h3>
            <p
              className="text-xs sm:text-sm leading-relaxed font-serif max-w-lg mx-auto"
              style={{ color: isDark ? "#94A3B8" : mutedColor }}
            >
              Kehadiran dan doa restu yang tulus dari Bapak/Ibu/Saudara/i adalah kehormatan paling bermakna bagi kami.
              Tanpa mengurangi rasa hormat, bagi keluarga atau kerabat yang berhalangan hadir secara fisik dan berkenan menyampaikan tanda kasih digital atau kado fisik, dapat membuka akses di bawah ini.
            </p>
          </div>

          {/* Voluntary Open / Collapse Trigger */}
          <div className="pt-1">
            <button
              id="btn-toggle-gift-section"
              onClick={handleToggleReveal}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-serif font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-98"
              style={{
                backgroundColor: `${accentColor}28`,
                borderColor: `${accentColor}80`,
                borderWidth: "1px",
                color: isDark ? "#F8FAFC" : textColor,
              }}
            >
              <Gift className="w-4 h-4" style={{ color: accentColor }} />
              <span>{isRevealed ? "Tutup Tanda Kasih" : "Kirim Tanda Kasih Digital & Kado"}</span>
              {isRevealed ? (
                <ChevronUp className="w-4 h-4" style={{ color: accentColor }} />
              ) : (
                <ChevronDown className="w-4 h-4" style={{ color: accentColor }} />
              )}
            </button>
          </div>

          {isAutoTriggered && isRevealed && (
            <div
              className="text-[11px] font-serif rounded-xl p-3 max-w-md mx-auto border animate-gift-fade-in"
              style={{
                backgroundColor: isDark ? "rgba(30, 41, 59, 0.7)" : "rgba(254, 252, 248, 0.9)",
                borderColor: `${accentColor}66`,
                color: isDark ? "#CBD5E1" : primaryColor,
              }}
            >
              ✦ Karena Anda memilih berhalangan hadir, saluran tanda kasih digital &amp; kirim kado terbuka sebagai wujud silaturahmi.
            </div>
          )}

          {/* REVEALED CONTENT: Soft Bank Cards & Physical Gift in the SAME Card */}
          {isRevealed && (
            <div
              className="space-y-5 pt-4 border-t animate-gift-expand text-left"
              style={{ borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : `${accentColor}40` }}
            >
              {/* Bank Accounts Grid (Soft Tone) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {giftInfo.banks.map((b, idx) => {
                  const isCopied = copiedBank === b.bank;
                  return (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-2xl border shadow-xs flex flex-col justify-between space-y-3 transition-colors"
                      style={{
                        backgroundColor: sectionBackground,
                        borderColor: `${accentColor}44`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="font-serif font-bold text-xs px-2.5 py-1 rounded-md border shadow-2xs tracking-wider"
                          style={{
                            backgroundColor: isDark ? "rgba(15, 23, 42, 0.9)" : cardBgColor,
                            borderColor: `${accentColor}50`,
                            color: isDark ? "#F8FAFC" : primaryColor,
                          }}
                        >
                          {b.bank}
                        </span>
                        <span
                          className="text-[11px] font-serif font-medium truncate max-w-[130px]"
                          style={{ color: isDark ? "#94A3B8" : mutedColor }}
                        >
                          a.n {b.holder}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span
                          className="text-[10px] font-serif uppercase tracking-widest block"
                          style={{ color: isDark ? "#64748B" : mutedColor }}
                        >
                          Nomor Rekening
                        </span>
                        <p
                          className="font-mono text-lg sm:text-xl font-bold tracking-wider"
                          style={{ color: isDark ? "#F8FAFC" : textColor }}
                        >
                          {b.number}
                        </p>
                      </div>

                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => handleCopyAccount(b.number, b.bank)}
                          className="py-1.5 px-3.5 rounded-xl text-xs font-serif font-bold border shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          style={{
                            backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : cardBgColor,
                            borderColor: `${accentColor}66`,
                            color: isDark ? "#F8FAFC" : textColor,
                          }}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 dark:text-emerald-400">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" style={{ color: accentColor }} />
                              <span>Salin Nomor</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Physical Gift Address Box (Soft Matching Style) */}
              {giftInfo.physicalGiftAddress && (
                <div
                  className="p-4 sm:p-5 rounded-2xl border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4"
                  style={{
                    backgroundColor: sectionBackground,
                    borderColor: `${accentColor}44`,
                  }}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div
                      className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs"
                      style={{
                        backgroundColor: isDark ? "rgba(15, 23, 42, 0.9)" : cardBgColor,
                        borderColor: `${accentColor}50`,
                      }}
                    >
                      <MapPin className="w-4 h-4" style={{ color: accentColor }} />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <span
                        className="text-[10px] font-serif font-bold uppercase tracking-wider block"
                        style={{ color: isDark ? "#E2E8F0" : primaryColor }}
                      >
                        Kirim Kado Fisik / Parsel
                      </span>
                      <p
                        className="text-xs leading-relaxed font-serif"
                        style={{ color: isDark ? "#94A3B8" : mutedColor }}
                      >
                        {giftInfo.physicalGiftAddress}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleCopyAddress}
                    className="shrink-0 w-full sm:w-auto py-2 px-4 rounded-xl text-xs font-serif font-bold border shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    style={{
                      backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : cardBgColor,
                      borderColor: `${accentColor}66`,
                      color: isDark ? "#F8FAFC" : textColor,
                    }}
                  >
                    {copiedAddress ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 dark:text-emerald-400">Alamat Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" style={{ color: accentColor }} />
                        <span>Salin Alamat</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes giftExpand {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes giftFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-gift-expand {
          animation: giftExpand 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-gift-fade-in {
          animation: giftFadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

