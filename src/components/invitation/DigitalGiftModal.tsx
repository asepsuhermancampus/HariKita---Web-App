"use client";

import React, { useState } from "react";
import { Gift, Copy, Check, CreditCard, MapPin } from "lucide-react";

interface BankAccount {
  bank: string;
  number: string;
  holder: string;
}

interface DigitalGiftModalProps {
  banks: BankAccount[];
  physicalGiftAddress: string;
}

export const DigitalGiftModal: React.FC<DigitalGiftModalProps> = ({
  banks,
  physicalGiftAddress,
}) => {
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const copyToClipboard = (text: string, bankIdentifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(bankIdentifier);
    setTimeout(() => setCopiedBank(null), 2500);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(physicalGiftAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  return (
    <section className="py-20 px-4 max-w-3xl mx-auto space-y-12 text-center">
      <div className="space-y-3">
        <span className="text-xs uppercase tracking-widest text-gold-dark font-bold">
          Wedding Gift
        </span>
        <h2 className="font-serif-luxury text-3xl sm:text-4xl text-plum font-bold">
          Tanda Kasih & Doa Restu
        </h2>
        <p className="text-xs text-plum-light font-medium max-w-lg mx-auto">
          Doa restu Anda merupakan karunia terindah bagi kami. Namun jika Anda bermaksud memberikan tanda kasih, Anda dapat menyampaikannya secara digital di bawah ini.
        </p>
      </div>

      <div className="space-y-6">
        {/* Bank Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {banks.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white/80 border border-gold/30 shadow-md text-left space-y-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-plum text-sm">
                  <CreditCard className="w-4 h-4 text-gold-dark" />
                  <span>Bank {item.bank}</span>
                </div>
                <span className="text-[10px] font-mono uppercase bg-gold/15 text-plum px-2 py-0.5 rounded-md font-bold">
                  Transfer
                </span>
              </div>

              <div className="space-y-0.5">
                <p className="font-mono text-xl font-bold tracking-wider text-plum">
                  {item.number}
                </p>
                <p className="text-xs text-plum-light">a.n. {item.holder}</p>
              </div>

              <button
                onClick={() => copyToClipboard(item.number, item.number)}
                className="btn btn-xs w-full gold-gradient-bg text-plum-dark font-bold border-none rounded-full gap-2"
              >
                {copiedBank === item.number ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Tersalin ke Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin No. Rekening</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Physical Gift Address Card */}
        {physicalGiftAddress && (
          <div className="p-6 rounded-3xl bg-white/80 border border-gold/30 shadow-md text-left space-y-4">
            <div className="flex items-center gap-2 font-bold text-plum text-sm">
              <Gift className="w-4 h-4 text-gold-dark" />
              <span>Kirim Kado Fisik (Ekspedisi / Kurir)</span>
            </div>
            <p className="text-xs text-plum leading-relaxed bg-[#FAF8F5] p-4 rounded-2xl border border-gold/20">
              {physicalGiftAddress}
            </p>
            <button
              onClick={copyAddress}
              className="btn btn-xs border border-gold/40 text-plum font-bold rounded-full gap-2 hover:bg-gold/15"
            >
              {copiedAddress ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Alamat Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Alamat Lengkap</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
