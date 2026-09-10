"use client";

import React, { useState } from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import { Gift, CreditCard, Copy, Check, Sparkles, MapPin } from "lucide-react";

export const Gift_EmbossedCards: React.FC<{
  giftInfo: DedicatedTemplateProps["giftInfo"];
  themePrimary?: string;
}> = ({ giftInfo, themePrimary = "#C5A880" }) => {
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAccount = (number: string, bank: string) => {
    navigator.clipboard.writeText(number);
    soundscape.playCoin();
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(null), 2500);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(giftInfo.physicalGiftAddress);
    soundscape.playCoin();
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  return (
    <section id="gift" className="py-24 px-4 sm:px-6 relative overflow-hidden bg-slate-50/50">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-300/40 bg-amber-50 text-amber-900 text-xs font-serif font-bold uppercase tracking-widest shadow-xs">
            <Gift className="w-3.5 h-3.5 text-amber-600" />
            <span>Tanda Kasih &amp; Kado Digital</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900">
            Titipan Doa &amp; Kado
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Doa restu Anda merupakan karunia terindah bagi kami. Namun apabila berkenan memberikan tanda kasih:
          </p>
        </div>

        {/* 3D Embossed ATM Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {giftInfo.banks.map((bank, idx) => {
            const isCopied = copiedBank === bank.bank;
            return (
              <div
                key={idx}
                className="relative rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-700/40 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white flex flex-col justify-between h-56 group hover:scale-102 transition-transform duration-300"
              >
                {/* Holographic Sheen Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

                {/* Card Top: Bank Logo & Chip */}
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-lg tracking-wider text-amber-400">
                    {bank.bank}
                  </span>
                  <div className="w-9 h-7 rounded-md bg-amber-300/80 border border-amber-400 shadow-inner flex items-center justify-center">
                    <div className="w-6 h-4 border border-amber-600/60 rounded-xs" />
                  </div>
                </div>

                {/* Card Middle: Account Number */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest font-mono text-slate-400">
                    Nomor Rekening
                  </span>
                  <p className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-slate-100">
                    {bank.number}
                  </p>
                </div>

                {/* Card Bottom: Holder Name & Copy Button */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-mono">
                      Atas Nama
                    </span>
                    <strong className="text-xs font-mono uppercase text-slate-200">{bank.holder}</strong>
                  </div>

                  <button
                    onClick={() => handleCopyAccount(bank.number, bank.bank)}
                    className="py-1.5 px-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md flex items-center gap-1.5 transition-colors"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-slate-950" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-950" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Physical Gift Address Box */}
        {giftInfo.physicalGiftAddress && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3 w-full">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-amber-700" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Kirim Kado Fisik / Parsel
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {giftInfo.physicalGiftAddress}
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyAddress}
              className="shrink-0 w-full sm:w-auto py-2 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              {copiedAddress ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Alamat Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Salin Alamat</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
