"use client";

import React, { useEffect, useRef, useState } from "react";
import { TemplateThemePreset } from "@/lib/templates/types";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import {
  JavaneseGununganSvg,
  KebumenWaletSvg,
  IslamicArabesqueArchSvg,
  BotanicalWreathSvg,
  WaxSealStamp3DSvg,
  RusticPampasTwineSvg,
  CelestialConstellationSvg,
  CuteStorybookMascotSvg,
} from "../svg";
import { ArrowUp, Heart, Sparkles, RefreshCw, Lock } from "lucide-react";

interface SmoothOutroClosingGateProps {
  theme: TemplateThemePreset;
  brideName?: string;
  groomName?: string;
}

export const SmoothOutroClosingGate: React.FC<SmoothOutroClosingGateProps> = ({
  theme,
  brideName = "Citra",
  groomName = "Bima",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTriggered, setIsTriggered] = useState(false);
  const [isOverlayClosed, setIsOverlayClosed] = useState(false);

  const archetypeId = theme.archetypeId || "botanical";
  const initials = `${groomName.charAt(0)} & ${brideName.charAt(0)}`;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsTriggered(true);
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.35,
      }
    );

    const currentElem = containerRef.current;
    if (currentElem) {
      observer.observe(currentElem);
    }

    return () => {
      if (currentElem) observer.unobserve(currentElem);
    };
  }, []);

  // Lock scroll when outro cover overlay is active
  useEffect(() => {
    if (isOverlayClosed) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isOverlayClosed]);

  const handleScrollToTop = () => {
    soundscape.playTick();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseOverlay = () => {
    soundscape.playTick();
    setIsOverlayClosed(true);
  };

  const handleReopenOverlay = () => {
    soundscape.playCoverOpen();
    setIsOverlayClosed(false);
  };

  const handleReturnToTopAndReopen = () => {
    soundscape.playTick();
    setIsOverlayClosed(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isClosed = isTriggered || isOverlayClosed;

  // Render archetype-specific visual icon & narrative closure
  const renderArchetypeOutro = () => {
    switch (archetypeId) {
      case "javanese":
      case "cultural-traditional":
        return (
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-3">
              <KebumenWaletSvg
                size={54}
                primaryColor={theme.colors.accent}
                accentColor={theme.colors.primary}
              />
              <JavaneseGununganSvg
                size={86}
                primaryColor={theme.colors.primary}
                accentColor={theme.colors.accent}
              />
              <KebumenWaletSvg
                size={54}
                primaryColor={theme.colors.accent}
                accentColor={theme.colors.primary}
                className="scale-x-[-1]"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest font-serif font-bold text-amber-500">
                Tancep Kayon & Rahayu
              </span>
              <h4 className="font-serif-luxury text-2xl sm:text-3xl text-plum font-bold">
                Matur Nuwun Awit Rawuh & Donga Pangestu
              </h4>
              <p className="text-xs text-plum-light max-w-md mx-auto leading-relaxed italic">
                &ldquo;Mugi Gusti Kang Akarya Jagad tansah paring berkah kabagyan lan katentreman kagem kita sedaya wonten ing tlatah Kabupaten Kebumen.&rdquo;
              </p>
            </div>
          </div>
        );

      case "islamic":
      case "syari-islamic":
        return (
          <div className="space-y-4 text-center">
            <IslamicArabesqueArchSvg
              size={84}
              primaryColor={theme.colors.primary}
              accentColor={theme.colors.accent}
              className="mx-auto"
            />
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest font-semibold text-emerald-700">
                Jazaakumullahu Khairan Katsiran
              </span>
              <h4 className="font-serif-luxury text-2xl sm:text-3xl text-plum font-bold">
                Terima Kasih atas Segala Doa & Restu
              </h4>
              <p className="text-xs text-plum-light max-w-md mx-auto leading-relaxed">
                &ldquo;Semoga Allah SWT senantiasa melimpahkan sakinah, mawaddah, warahmah serta membalas kebaikan Bapak/Ibu/Saudara/i berlipat ganda.&rdquo;
              </p>
            </div>
          </div>
        );

      case "rose-gold":
      case "royal-luxury":
        return (
          <div className="space-y-4 text-center">
            <div className="relative inline-block">
              <WaxSealStamp3DSvg
                size={88}
                sealColor={theme.colors.primary}
                goldAccent={theme.colors.accent}
                initials={initials}
                className="mx-auto drop-shadow-xl animate-pulse"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest font-semibold text-rose-800">
                Royal Seal of Gratitude
              </span>
              <h4 className="font-serif-luxury text-2xl sm:text-3xl text-plum font-bold">
                Tersegel Penuh Hormat & Cinta
              </h4>
              <p className="text-xs text-plum-light max-w-md mx-auto leading-relaxed">
                Kehadiran dan doa restu Anda adalah kehormatan tak ternilai bagi lembaran baru perjalanan hidup kami berdua.
              </p>
            </div>
          </div>
        );

      case "rustic":
        return (
          <div className="space-y-4 text-center">
            <RusticPampasTwineSvg
              size={80}
              primaryColor={theme.colors.primary}
              accentColor={theme.colors.accent}
              className="mx-auto"
            />
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest font-semibold text-amber-800">
                Rustic Postal Closure
              </span>
              <h4 className="font-serif-luxury text-2xl sm:text-3xl text-plum font-bold">
                Dari Hati yang Terdalam
              </h4>
              <p className="text-xs text-plum-light max-w-md mx-auto leading-relaxed">
                Terima kasih telah menjadi bagian dari kisah hangat kami. Sampai jumpa di pelukan hangat kota Kebumen.
              </p>
            </div>
          </div>
        );

      case "celestial":
        return (
          <div className="space-y-4 text-center">
            <CelestialConstellationSvg
              size={86}
              primaryColor={theme.colors.primary}
              accentColor={theme.colors.accent}
              className="mx-auto"
            />
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest font-semibold text-indigo-300">
                Aeternum Cosmic Ring
              </span>
              <h4 className="font-serif-luxury text-2xl sm:text-3xl text-white font-bold">
                Di Bawah Naungan Semesta Cinta
              </h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Doa dan kehadiran Anda memancarkan cahaya terindah dalam orbit perjalanan suci kami.
              </p>
            </div>
          </div>
        );

      case "cute-illustrated":
        return (
          <div className="space-y-4 text-center">
            <CuteStorybookMascotSvg
              size={84}
              primaryColor={theme.colors.primary}
              accentColor={theme.colors.accent}
              className="mx-auto"
            />
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest font-bold text-pink-600">
                Happy Ever After Begins
              </span>
              <h4 className="font-serif-luxury text-2xl sm:text-3xl text-plum font-bold">
                Terima Kasih Banyak Teman & Sahabat!
              </h4>
              <p className="text-xs text-plum-light max-w-md mx-auto leading-relaxed">
                Kisah manis kami kini resmi dimulai. Terima kasih atas senyuman, doa, dan kado kebahagiaan yang telah dikirimkan!
              </p>
            </div>
          </div>
        );

      case "minimalist":
      case "minimalist-typographic":
        return (
          <div className="space-y-4 text-center">
            <div className="w-12 h-0.5 bg-neutral-400 mx-auto" />
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500">
                Final Chapter &bull; Fin
              </span>
              <h4 className="font-serif-luxury text-2xl sm:text-3xl text-neutral-900 font-bold tracking-tight">
                With Sincere Gratitude
              </h4>
              <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
                Thank you for witnessing the quiet beauty of our union. Your blessing is our greatest keepsake.
              </p>
            </div>
            <div className="w-12 h-0.5 bg-neutral-400 mx-auto" />
          </div>
        );

      case "botanical":
      case "romantic-floral":
      default:
        return (
          <div className="space-y-4 text-center">
            <BotanicalWreathSvg
              size={84}
              primaryColor={theme.colors.primary}
              accentColor={theme.colors.accent}
              className="mx-auto"
            />
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest font-semibold text-emerald-800">
                Botanical Flora of Gratitude
              </span>
              <h4 className="font-serif-luxury text-2xl sm:text-3xl text-plum font-bold">
                Mekar Abadi dalam Doa Restu
              </h4>
              <p className="text-xs text-plum-light max-w-md mx-auto leading-relaxed">
                Setiap doa yang terucap adalah pupuk terindah bagi mekarnya kebahagiaan rumah tangga kami berdua.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full py-16 px-4 transition-all duration-1000 ease-out overflow-hidden"
      style={{
        backgroundColor: archetypeId === "celestial" ? "#0A0E1A" : theme.colors.cardBg || "#FFFFFF",
        borderTop: `1px solid ${theme.colors.border || "rgba(204,168,115,0.25)"}`,
      }}
    >
      {/* Decorative Shimmering Backdrop */}
      <div className="absolute inset-0 bg-radial from-transparent via-white/5 to-transparent pointer-events-none" />

      <div className="max-w-xl mx-auto space-y-8 relative z-10">
        {/* Archetype Closing Visual */}
        <div
          className={`transition-all duration-1000 transform ${
            isClosed ? "opacity-100 scale-100 translate-y-0" : "opacity-40 scale-95 translate-y-4"
          }`}
        >
          {renderArchetypeOutro()}
        </div>

        {/* Couple Signature & Monogram Badge */}
        <div className="text-center pt-2 pb-2">
          <span
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border shadow-sm text-xs font-semibold"
            style={{
              borderColor: theme.colors.accent || "#CCA873",
              backgroundColor: `${theme.colors.primary}12`,
              color: archetypeId === "celestial" ? "#F2F4F8" : theme.colors.primary,
            }}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>
              {brideName} & {groomName} &bull; Kabupaten Kebumen
            </span>
          </span>
        </div>

        {/* Action Controls: Scroll to Top & Close Outro */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-gold/20">
          <button
            onClick={handleScrollToTop}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-md hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
            style={{
              backgroundColor: theme.colors.primary || "#7D424D",
              color: "#FFFFFF",
            }}
          >
            <ArrowUp className="w-4 h-4" />
            <span>Kembali ke Awal Undangan</span>
          </button>

          <button
            id="btn-close-invitation-outro"
            onClick={handleCloseOverlay}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-semibold border transition-all hover:bg-gold/15 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            style={{
              borderColor: theme.colors.accent || "#CCA873",
              color: archetypeId === "celestial" ? "#F2F4F8" : theme.colors.text,
              backgroundColor: `${theme.colors.primary}0F`,
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tutup Undangan Secara Mulus</span>
          </button>
        </div>
      </div>

      {/* THE REGAL CARD FOLD & CLOSING OVERLAY */}
      {isOverlayClosed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Undangan Ditutup Kembali"
          className="fixed inset-0 z-[9990] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-outro-fade-in"
        >
          <div
            className="relative w-full max-w-sm sm:max-w-md rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl border-2 overflow-hidden animate-outro-scale-in"
            style={{
              backgroundColor: archetypeId === "celestial" ? "#0F172A" : theme.colors.background || "#FAF8F5",
              borderColor: theme.colors.accent || "#C5A880",
              color: archetypeId === "celestial" ? "#F8FAFC" : theme.colors.text || "#4A2E35",
            }}
          >
            {/* Ambient Background Glow */}
            <div
              className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ backgroundColor: theme.colors.primary }}
            />
            <div
              className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: theme.colors.accent }}
            />

            {/* Regal Seal Monogram */}
            <div className="relative z-10 flex justify-center pt-2">
              <div
                className="w-20 h-20 rounded-full border-2 flex items-center justify-center shadow-lg"
                style={{
                  borderColor: theme.colors.accent || "#C5A880",
                  backgroundColor: `${theme.colors.primary}18`,
                }}
              >
                <span
                  className="font-serif font-bold text-xl tracking-wider"
                  style={{ color: archetypeId === "celestial" ? "#F8FAFC" : theme.colors.primary }}
                >
                  {initials}
                </span>
              </div>
            </div>

            {/* Narrative & Closure */}
            <div className="relative z-10 space-y-2">
              <span
                className="text-[11px] uppercase tracking-[0.25em] font-bold block"
                style={{ color: theme.colors.accent }}
              >
                Sampai Jumpa di Hari Bahagia
              </span>
              <h3
                className="font-serif-luxury text-2xl sm:text-3xl font-bold leading-snug"
                style={{ color: archetypeId === "celestial" ? "#FFFFFF" : theme.colors.text }}
              >
                {brideName} &amp; {groomName}
              </h3>
              <p
                className="text-xs leading-relaxed max-w-xs mx-auto opacity-80 pt-1"
                style={{ color: archetypeId === "celestial" ? "#CBD5E1" : theme.colors.text }}
              >
                Terima kasih atas segala ketulusan doa, waktu, dan restu yang Anda curahkan bagi lembaran baru pernikahan kami.
              </p>
            </div>

            {/* Actions */}
            <div className="relative z-10 flex flex-col gap-2.5 pt-2">
              <button
                id="btn-reopen-invitation"
                onClick={handleReopenOverlay}
                className="w-full py-3 px-5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  backgroundColor: theme.colors.primary || "#7D424D",
                  color: "#FFFFFF",
                }}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Buka Kembali Undangan</span>
              </button>

              <button
                onClick={handleReturnToTopAndReopen}
                className="w-full py-2.5 px-5 rounded-full text-xs font-semibold border transition-all hover:bg-black/5 flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  borderColor: `${theme.colors.accent}60`,
                  color: archetypeId === "celestial" ? "#E2E8F0" : theme.colors.text,
                }}
              >
                <ArrowUp className="w-4 h-4" />
                <span>Kembali ke Awal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{OUTRO_KEYFRAMES}</style>
    </div>
  );
};

const OUTRO_KEYFRAMES = `
  @keyframes outroFadeIn {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes outroScaleIn {
    0%   { opacity: 0; transform: scale(0.92) translateY(20px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  .animate-outro-fade-in { animation: outroFadeIn 0.35s ease-out forwards; }
  .animate-outro-scale-in { animation: outroScaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
`;
