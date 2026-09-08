"use client";

import React from "react";
import { QrCode, ShieldCheck, Ticket } from "lucide-react";

interface ReceptionQrCheckinProps {
  guestName: string;
  sessionCode?: string;
}

export const ReceptionQrCheckin: React.FC<ReceptionQrCheckinProps> = ({
  guestName,
  sessionCode = "s1",
}) => {
  const qrIdentifier = `HK-${sessionCode.toUpperCase()}-${encodeURIComponent(
    guestName || "TAMU"
  ).slice(0, 10)}`;

  return (
    <section className="py-16 px-4 max-w-md mx-auto text-center space-y-6">
      <div className="p-8 rounded-3xl bg-white/90 border border-gold/40 shadow-xl space-y-6 relative overflow-hidden">
        {/* Ticket Header */}
        <div className="flex items-center justify-between border-b border-gold/20 pb-4">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-gold-dark" />
            <span className="font-serif-luxury text-sm font-bold text-plum">
              Check-in Pass Resepsi
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-gold/15 text-plum px-2 py-0.5 rounded-full uppercase">
            {sessionCode === "s1" ? "Sesi Akad" : "Sesi Resepsi"}
          </span>
        </div>

        {/* QR Visual */}
        <div className="flex flex-col items-center justify-center p-6 bg-[#FAF8F5] rounded-2xl border border-gold/30 space-y-3">
          <div className="w-40 h-40 bg-white p-2 rounded-xl shadow-inner flex items-center justify-center border border-gray-200">
            {/* SVG simulated QR Code */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full text-plum"
              fill="currentColor"
            >
              <rect x="5" y="5" width="25" height="25" fill="currentColor" />
              <rect x="8" y="8" width="19" height="19" fill="white" />
              <rect x="12" y="12" width="11" height="11" fill="currentColor" />

              <rect x="70" y="5" width="25" height="25" fill="currentColor" />
              <rect x="73" y="8" width="19" height="19" fill="white" />
              <rect x="77" y="12" width="11" height="11" fill="currentColor" />

              <rect x="5" y="70" width="25" height="25" fill="currentColor" />
              <rect x="8" y="73" width="19" height="19" fill="white" />
              <rect x="12" y="77" width="11" height="11" fill="currentColor" />

              {/* Data modules */}
              <rect x="35" y="10" width="8" height="8" />
              <rect x="50" y="10" width="12" height="8" />
              <rect x="35" y="25" width="12" height="8" />
              <rect x="55" y="25" width="8" height="8" />
              <rect x="10" y="38" width="12" height="8" />
              <rect x="30" y="40" width="10" height="10" />
              <rect x="45" y="40" width="15" height="8" />
              <rect x="65" y="40" width="12" height="8" />
              <rect x="80" y="40" width="10" height="8" />
              <rect x="35" y="55" width="8" height="8" />
              <rect x="50" y="55" width="12" height="12" />
              <rect x="70" y="55" width="10" height="8" />
              <rect x="35" y="75" width="12" height="12" />
              <rect x="55" y="75" width="12" height="8" />
              <rect x="75" y="75" width="15" height="12" />
            </svg>
          </div>
          <span className="font-mono text-xs font-bold text-plum-light tracking-wider">
            {qrIdentifier}
          </span>
        </div>

        <div className="space-y-1 text-center">
          <p className="font-serif-luxury text-base font-bold text-plum">
            {guestName || "Tamu Undangan"}
          </p>
          <p className="text-[11px] text-plum-light/70 leading-relaxed">
            Tunjukkan kode QR ini kepada petugas buku tamu di pintu masuk gedung resepsi.
          </p>
        </div>
      </div>
    </section>
  );
};
