"use client";

import React, { useState, useEffect } from "react";
import { DedicatedTemplateProps, GiftStyleId } from "@/lib/templates/types";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import { Gift_EmbossedCards } from "./Gift_EmbossedCards";
import { Gift_AngpaoEnvelope } from "./Gift_AngpaoEnvelope";
import { Gift_CleanPills } from "./Gift_CleanPills";
import { Gift, Heart, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

export const GiftSectionDispatcher: React.FC<{
  giftInfo: DedicatedTemplateProps["giftInfo"];
  theme: DedicatedTemplateProps["theme"];
}> = ({ giftInfo, theme }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isAutoTriggered, setIsAutoTriggered] = useState(false);

  // Listen to RSVP attendance selection changes across the page
  useEffect(() => {
    const handleAttendanceEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ attendance?: string }>;
      const att = customEvent.detail?.attendance;
      if (att === "tidak-hadir" || att === "tidak_hadir" || att === "ragu") {
        setIsRevealed(true);
        setIsAutoTriggered(true);
      } else if (att === "hadir") {
        // If guest changes mind back to hadir, reset auto-triggered flag
        setIsAutoTriggered(false);
      }
    };

    window.addEventListener("guest_attendance_change", handleAttendanceEvent);
    return () => {
      window.removeEventListener("guest_attendance_change", handleAttendanceEvent);
    };
  }, []);

  let style: GiftStyleId = theme?.sectionConfig?.giftStyle || "embossed-cards";

  if (!theme?.sectionConfig?.giftStyle) {
    const arch = theme?.archetypeId || "botanical";
    if (arch.includes("cute") || arch.includes("family")) {
      style = "angpao-envelope";
    } else if (arch.includes("minimalist")) {
      style = "clean-pills";
    } else {
      style = "embossed-cards";
    }
  }

  const renderActiveGiftComponent = () => {
    switch (style) {
      case "angpao-envelope":
        return <Gift_AngpaoEnvelope giftInfo={giftInfo} themePrimary={theme?.colors?.primary} />;
      case "clean-pills":
        return <Gift_CleanPills giftInfo={giftInfo} themePrimary={theme?.colors?.primary} />;
      case "embossed-cards":
      default:
        return <Gift_EmbossedCards giftInfo={giftInfo} themePrimary={theme?.colors?.primary} />;
    }
  };

  const handleToggleReveal = () => {
    soundscape.playTick();
    setIsRevealed((prev) => !prev);
  };

  return (
    <div id="gift" className="relative transition-all duration-700 ease-out">
      {/* 1. COURTEOUS INTRODUCTORY CARD (Always shown first to emphasize presence over gifts) */}
      <div className="py-12 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-transparent via-amber-50/20 to-transparent">
        <div className="max-w-xl mx-auto text-center space-y-5 p-6 sm:p-8 rounded-3xl border border-amber-300/40 bg-white/80 shadow-md backdrop-blur-xs">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/70 text-amber-900 text-xs font-serif font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 text-amber-700 fill-amber-700" />
            <span>Tanda Kasih &amp; Kehormatan Adat</span>
          </div>

          <div className="space-y-2">
            <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-amber-950">
              Doa Restu Anda Adalah Hadiah Terindah
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-serif">
              Kehadiran dan doa restu yang tulus dari Bapak/Ibu/Saudara/i adalah kehormatan paling bermakna bagi kami.
              Tanpa mengurangi rasa hormat, bagi keluarga atau kerabat yang berhalangan hadir secara fisik dan berkenan menyampaikan tanda kasih digital, dapat membuka akses amplop di bawah ini.
            </p>
          </div>

          {/* Voluntary Open / Collapse Trigger */}
          <div className="pt-2">
            <button
              id="btn-toggle-gift-section"
              onClick={handleToggleReveal}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-amber-950 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 hover:brightness-105 transition-all shadow-md cursor-pointer active:scale-98"
            >
              <Gift className="w-4 h-4 text-amber-900" />
              <span>{isRevealed ? "Tutup Tanda Kasih" : "Kirim Tanda Kasih Digital"}</span>
              {isRevealed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {isAutoTriggered && isRevealed && (
            <div className="text-[11px] font-serif text-amber-800 bg-amber-50/90 border border-amber-300/50 rounded-xl p-2.5 mt-3">
              ✦ Karena Anda memilih berhalangan hadir, saluran tanda kasih digital terbuka sebagai penyambung silaturahmi.
            </div>
          )}
        </div>
      </div>

      {/* 2. CONDITIONAL GIFT ACCOUNTS & ADDRESS (Displayed when revealed) */}
      {isRevealed && (
        <div className="animate-gift-expand">
          {renderActiveGiftComponent()}
        </div>
      )}

      <style>{`
        @keyframes giftExpand {
          0% { opacity: 0; transform: translateY(-16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-gift-expand {
          animation: giftExpand 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

