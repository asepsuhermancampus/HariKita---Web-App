"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import { Copy, Check, Gift } from "lucide-react";

export const Gift_CleanPills: React.FC<{
  giftInfo: DedicatedTemplateProps["giftInfo"];
  themePrimary?: string;
}> = ({ giftInfo }) => {
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  const handleCopy = (num: string, bank: string) => {
    navigator.clipboard.writeText(num);
    soundscape.playCoin();
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(null), 2500);
  };

  return (
    <section id="gift" className="py-24 px-4 sm:px-6 relative overflow-hidden bg-white">
      <div className="max-w-2xl mx-auto space-y-12 text-center">
        <div className="space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-slate-400 block">
            WEDDING REGISTRY &amp; DIGITAL GIFT
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900">
            Tanda Kasih Digital
          </h2>
          <div className="w-12 h-0.5 mx-auto bg-slate-900" />
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          {giftInfo.banks.map((b, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4"
            >
              <div className="text-left space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-900 uppercase">
                    {b.bank}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">({b.holder})</span>
                </div>
                <p className="font-mono text-base font-bold text-slate-800 tracking-wider">
                  {b.number}
                </p>
              </div>

              <button
                onClick={() => handleCopy(b.number, b.bank)}
                className="py-2 px-3.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
              >
                {copiedBank === b.bank ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
