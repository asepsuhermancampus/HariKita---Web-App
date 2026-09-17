"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import { Gift, Copy, Check, Heart, QrCode } from "lucide-react";

export const Gift_AngpaoEnvelope: React.FC<{
  giftInfo: DedicatedTemplateProps["giftInfo"];
  themePrimary?: string;
}> = ({ giftInfo }) => {
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  const handleCopyAccount = (number: string, bank: string) => {
    navigator.clipboard.writeText(number);
    soundscape.playCoin();
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(null), 2500);
  };

  return (
    <section id="gift" className="py-20 px-4 sm:px-6 relative overflow-hidden bg-rose-50/50">
      <div className="max-w-2xl mx-auto space-y-10 text-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider">
            <Gift className="w-4 h-4 text-rose-600" />
            <span>Angpao &amp; Tanda Kasih Digital</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            Amplop Digital Bahagia
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Kehadiran dan doa restu Anda adalah yang utama, namun jika ingin memberikan angpao pernikahan:
          </p>
        </div>

        {/* Angpao Pocket Design */}
        <div className="relative bg-gradient-to-br from-rose-600 via-red-600 to-rose-700 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-amber-300 space-y-8 max-w-md mx-auto">
          {/* Angpao Gold Seal Crest */}
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-400 text-red-900 border-2 border-amber-200 shadow-lg flex items-center justify-center font-bold text-2xl">
            囍
          </div>

          <div className="space-y-4">
            {giftInfo.banks.map((b, i) => (
              <div
                key={i}
                className="bg-white text-slate-800 p-4 rounded-2xl shadow-md border border-amber-200 text-left space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase px-2.5 py-1 rounded-md bg-rose-100 text-rose-700">
                    BANK {b.bank}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">a.n {b.holder}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono font-bold text-base tracking-wider text-slate-900">
                    {b.number}
                  </span>
                  <button
                    onClick={() => handleCopyAccount(b.number, b.bank)}
                    className="py-1 px-3 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 flex items-center gap-1 shadow-xs transition-colors"
                  >
                    {copiedBank === b.bank ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-amber-200/90 font-serif italic pt-2">
            Terima kasih atas segala ketulusan dan doa restu yang diberikan
          </div>
        </div>
      </div>
    </section>
  );
};
