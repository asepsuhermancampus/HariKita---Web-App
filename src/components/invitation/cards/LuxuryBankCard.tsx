"use client";

import React, { useState } from "react";
import { Copy, Check, QrCode, Sparkles, CreditCard, Send } from "lucide-react";
import { formatAccountNumber, getBankCardTheme, generateWhatsAppGiftConfirmationUrl } from "@/lib/invitation/bankCard";

interface LuxuryBankCardProps {
  bank: string;
  number: string;
  holder: string;
  qrisImageUrl?: string;
  coupleNames?: string;
  rsvpGuestName?: string;
  contactPhone?: string;
}

export const LuxuryBankCard: React.FC<LuxuryBankCardProps> = ({
  bank,
  number,
  holder,
  qrisImageUrl,
  coupleNames = "Bima & Citra",
  rsvpGuestName = "Tamu Terhormat",
  contactPhone = "081987654321",
}) => {
  const [copied, setCopied] = useState(false);
  const [showQrisModal, setShowQrisModal] = useState(false);

  const theme = getBankCardTheme(bank);
  const formattedNumber = formatAccountNumber(number);

  const handleCopy = () => {
    navigator.clipboard.writeText(number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const waUrl = generateWhatsAppGiftConfirmationUrl({
    phoneNumber: contactPhone,
    coupleNames,
    senderName: rsvpGuestName,
    bankName: bank,
  });

  return (
    <>
      <div
        className="relative w-full rounded-3xl p-6 shadow-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-black/60 border"
        style={{
          background: theme.gradient,
          borderColor: theme.borderColor,
          color: theme.textColor,
        }}
      >
        {/* Shimmering Diagonal Light Accent */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header: Bank Badge & Contactless Icon */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-mono font-bold tracking-widest px-2.5 py-0.5 rounded-full uppercase border shadow-xs"
              style={{
                borderColor: theme.borderColor,
                backgroundColor: "rgba(0,0,0,0.3)",
                color: theme.accentColor,
              }}
            >
              {theme.badge}
            </span>
            <Sparkles className="w-3.5 h-3.5 opacity-60 text-amber-300" />
          </div>

          <CreditCard className="w-5 h-5 opacity-70" />
        </div>

        {/* EMV Gold Chip SVG Graphic */}
        <div className="my-4 relative z-10 flex items-center justify-between">
          <div className="w-12 h-9 rounded-lg bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 border border-amber-600/60 shadow-inner flex flex-col justify-around p-1">
            <div className="w-full h-px bg-amber-800/40" />
            <div className="w-3/4 h-px bg-amber-800/40 mx-auto" />
            <div className="w-full h-px bg-amber-800/40" />
          </div>

          {qrisImageUrl && (
            <button
              type="button"
              onClick={() => setShowQrisModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold backdrop-blur-md transition-all min-h-[36px]"
              title="Tampilkan Kode QRIS"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-300" />
              <span>QRIS</span>
            </button>
          )}
        </div>

        {/* Formatted Account Number */}
        <div className="space-y-1 relative z-10 font-mono">
          <p className="text-xl sm:text-2xl font-bold tracking-widest drop-shadow-md select-all">
            {formattedNumber}
          </p>
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-[10px] uppercase tracking-wider opacity-60 block font-sans">
                Atas Nama
              </span>
              <p className="text-xs sm:text-sm font-semibold tracking-wide uppercase font-sans">
                {holder}
              </p>
            </div>

            {/* Action Buttons: Copy & WhatsApp Confirm */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-bold shadow-md transition-all active:scale-95 min-h-[40px]"
                style={{
                  backgroundColor: copied ? "#10B981" : theme.accentColor,
                  color: copied ? "#FFFFFF" : "#0F172A",
                }}
              >
                {copied ? (
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

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-sans font-semibold transition-all min-h-[40px]"
                title="Kirim Bukti / Konfirmasi via WhatsApp"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Konfirmasi WA</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* QRIS Modal Popup */}
      {showQrisModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl border border-amber-400/40 relative animate-in zoom-in-95 duration-200">
            <h4 className="font-serif-luxury text-xl font-bold text-plum">
              QRIS Tali Asih
            </h4>
            <p className="text-xs text-slate-600">
              Scan melalui aplikasi Mobile Banking atau e-Wallet apapun (GoPay, OVO, Dana, ShopeePay)
            </p>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
              <img
                src={qrisImageUrl || "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=HARIKITA-KEBUMEN-GIFT"}
                alt="QRIS Code"
                className="w-48 h-48 mx-auto object-contain rounded-lg"
              />
            </div>

            <p className="text-xs font-mono font-bold text-slate-800">
              a.n. {holder}
            </p>

            <button
              type="button"
              onClick={() => setShowQrisModal(false)}
              className="w-full py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
            >
              Tutup QRIS
            </button>
          </div>
        </div>
      )}
    </>
  );
};
