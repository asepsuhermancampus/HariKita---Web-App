"use client";

import React, { useEffect, useRef, useState } from "react";
import { TemplateThemePreset } from "@/lib/templates/types";
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
import { ArrowUp, Heart, Sparkles, RefreshCw } from "lucide-react";

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
  const [isManuallyClosed, setIsManuallyClosed] = useState(false);

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

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleClose = () => {
    setIsManuallyClosed(!isManuallyClosed);
  };

  const isClosed = isTriggered || isManuallyClosed;

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

        {/* Action Controls: Scroll to Top & Re-open */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-gold/20">
          <button
            onClick={handleScrollToTop}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-md hover:scale-105 flex items-center justify-center gap-2"
            style={{
              backgroundColor: theme.colors.primary || "#7D424D",
              color: "#FFFFFF",
            }}
          >
            <ArrowUp className="w-4 h-4" />
            <span>Kembali ke Awal Undangan</span>
          </button>

          <button
            onClick={handleToggleClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-semibold border transition-all hover:bg-gold/10 flex items-center justify-center gap-2"
            style={{
              borderColor: theme.colors.accent || "#CCA873",
              color: archetypeId === "celestial" ? "#D1D5DB" : theme.colors.text,
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isManuallyClosed ? "Buka Kembali Undangan" : "Tutup Undangan Secara Mulus"}</span>
          </button>
        </div>

        {/* Localized Footer Credits */}
        <div className="text-center pt-4">
          <p className="text-[10px] text-plum-light/70 tracking-wider">
            Dirangkai dengan penuh cinta melalui Platform Event Hyperlocal{" "}
            <strong className="text-plum">HariKita Kebumen</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
