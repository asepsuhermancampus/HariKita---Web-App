"use client";

import React, { useState, useRef } from "react";
import { Ticket, X, Download, QrCode, Calendar, Clock, MapPin, CheckCircle2 } from "lucide-react";

interface ETicketBoardingPassProps {
  guestName: string;
  sessionTitle?: string;
  timeSlot?: string;
  venueName?: string;
  venueAddress?: string;
  qrValue?: string;
  brideGroomInitials?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const ETicketBoardingPass: React.FC<ETicketBoardingPassProps> = ({
  guestName,
  sessionTitle = "Resepsi Pernikahan",
  timeSlot = "11:00 - 13:00 WIB",
  venueName = "Mexolie Hotel Kebumen",
  venueAddress = "Jl. Stasiun No. 8, Kutoanyar, Kebumen",
  qrValue = "HK-KBM-2026-001",
  brideGroomInitials = "C & B",
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleClose = () => {
    if (externalOnClose) externalOnClose();
    else setInternalIsOpen(false);
  };

  const handleDownloadPng = () => {
    setIsDownloading(true);
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 960;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      setIsDownloading(false);
      return;
    }

    // 1. Background Luxury Slate & Gold
    const bgGradient = ctx.createLinearGradient(0, 0, 640, 960);
    bgGradient.addColorStop(0, "#181418");
    bgGradient.addColorStop(0.5, "#251d23");
    bgGradient.addColorStop(1, "#100d0f");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 640, 960);

    // 2. Gold Border
    ctx.strokeStyle = "#CCA873";
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 600, 920);

    ctx.strokeStyle = "rgba(204, 168, 115, 0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(26, 26, 588, 908);

    // 3. Header Boarding Pass
    ctx.fillStyle = "#CCA873";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("HARIKITA BOARDING PASS", 320, 75);

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "13px sans-serif";
    ctx.fillText("EXCLUSIVE WEDDING INVITATION • KEBUMEN", 320, 100);

    // Monogram Crest
    ctx.beginPath();
    ctx.arc(320, 165, 45, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(204, 168, 115, 0.15)";
    ctx.fill();
    ctx.strokeStyle = "#CCA873";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#FAF7F5";
    ctx.font = "bold 28px serif";
    ctx.fillText(brideGroomInitials, 320, 175);

    // 4. Guest Details Card
    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    ctx.fillRect(50, 240, 540, 130);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.strokeRect(50, 240, 540, 130);

    ctx.fillStyle = "#CCA873";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("PASSENGER / TAMU UNDANGAN:", 70, 270);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 24px serif";
    ctx.fillText(guestName || "Bapak/Ibu/Saudara/i", 70, 310);

    ctx.fillStyle = "#4ADE80";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("● VIP INVITATION PASS", 70, 345);

    // 5. Flight / Event Details Grid
    const detailsY = 410;
    ctx.fillStyle = "rgba(204, 168, 115, 0.8)";
    ctx.font = "12px sans-serif";
    ctx.fillText("SESSION / ACARA", 70, detailsY);
    ctx.fillText("TIME / WAKTU", 340, detailsY);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(sessionTitle, 70, detailsY + 28);
    ctx.fillText(timeSlot, 340, detailsY + 28);

    ctx.fillStyle = "rgba(204, 168, 115, 0.8)";
    ctx.font = "12px sans-serif";
    ctx.fillText("VENUE / LOKASI", 70, detailsY + 80);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 17px sans-serif";
    ctx.fillText(venueName, 70, detailsY + 106);

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "13px sans-serif";
    ctx.fillText(venueAddress, 70, detailsY + 128);

    // 6. Perforated Line (Sobekan Tiket)
    ctx.strokeStyle = "#CCA873";
    ctx.setLineDash([8, 8]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, 610);
    ctx.lineTo(610, 610);
    ctx.stroke();
    ctx.setLineDash([]);

    // 7. QR Code & Barcode Mockup
    ctx.fillStyle = "white";
    ctx.fillRect(245, 640, 150, 150);

    // Draw simulated QR blocks
    ctx.fillStyle = "black";
    ctx.fillRect(255, 650, 40, 40);
    ctx.fillRect(345, 650, 40, 40);
    ctx.fillRect(255, 740, 40, 40);
    ctx.fillRect(265, 660, 20, 20);
    ctx.fillRect(355, 660, 20, 20);
    ctx.fillRect(265, 750, 20, 20);
    ctx.fillRect(305, 695, 30, 30);
    ctx.fillRect(320, 745, 30, 20);

    ctx.fillStyle = "#CCA873";
    ctx.font = "mono 14px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`CODE: ${qrValue}`, 320, 820);

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "11px sans-serif";
    ctx.fillText("Tunjukkan tiket ini kepada resepsionis buku tamu di lokasi acara.", 320, 850);
    ctx.fillText("Simpan atau tangkap layar untuk kemudahan check-in.", 320, 870);

    // Export to download
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const safeName = (guestName || "Tamu").replace(/[^a-zA-Z0-9]/g, "_");
      link.download = `HariKita-ETicket-${safeName}.png`;
      link.href = dataUrl;
      link.click();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("Ticket download error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      {/* Floating Side Tab Trigger */}
      <button
        onClick={() => setInternalIsOpen(true)}
        className="fixed top-1/2 right-0 -translate-y-1/2 z-30 bg-gradient-to-l from-amber-400 to-amber-500 text-slate-950 font-bold px-2 py-4 rounded-l-2xl shadow-xl shadow-amber-500/20 flex flex-col items-center gap-1.5 hover:px-3 transition-all cursor-pointer min-h-[44px]"
        title="Buka E-Tiket / QR Code"
        aria-label="Buka E-Tiket"
      >
        <Ticket className="w-5 h-5 -rotate-90" />
        <span className="text-[10px] uppercase tracking-widest font-mono [writing-mode:vertical-lr] rotate-180">
          E-Tiket QR
        </span>
      </button>

      {/* Modal Boarding Pass Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-amber-400/40 rounded-3xl p-6 shadow-2xl text-white space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs uppercase tracking-widest font-mono">
                <Ticket className="w-3.5 h-3.5" />
                <span>E-Checkin Boarding Pass</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-amber-100">
                {brideGroomInitials} Wedding Pass
              </h3>
            </div>

            {/* Guest Ticket Stub */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-amber-300/80">
                Nama Tamu Undangan
              </span>
              <p className="text-lg font-bold font-serif text-white capitalize">{guestName}</p>
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Terdaftar • VIP Pass</span>
              </div>
            </div>

            {/* Event Time & Venue Info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                <div className="flex items-center gap-1 text-amber-300/80">
                  <Calendar className="w-3 h-3" />
                  <span>Sesi Acara</span>
                </div>
                <p className="font-semibold text-white">{sessionTitle}</p>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                <div className="flex items-center gap-1 text-amber-300/80">
                  <Clock className="w-3 h-3" />
                  <span>Waktu Kehadiran</span>
                </div>
                <p className="font-semibold text-white">{timeSlot}</p>
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-xs space-y-1">
              <div className="flex items-center gap-1 text-amber-300/80">
                <MapPin className="w-3 h-3" />
                <span>Lokasi Venue Kebumen</span>
              </div>
              <p className="font-semibold text-white">{venueName}</p>
              <p className="text-[11px] text-white/60">{venueAddress}</p>
            </div>

            {/* QR Code Section */}
            <div className="text-center space-y-2 pt-2 border-t border-dashed border-amber-300/30">
              <div className="inline-block p-3 bg-white rounded-2xl shadow-inner">
                <QrCode className="w-28 h-28 text-slate-950" />
              </div>
              <p className="text-xs font-mono text-amber-300 tracking-wider">CODE: {qrValue}</p>
              <p className="text-[11px] text-white/50">
                Pindai QR ini saat tiba di resepsionis untuk mencatat kehadiran otomatis.
              </p>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownloadPng}
              disabled={isDownloading}
              className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? "Memproses PNG..." : "Unduh Tiket (PNG)"}</span>
            </button>

            {downloadSuccess && (
              <p className="text-center text-xs text-emerald-400 animate-pulse font-medium">
                ✓ Tiket berhasil diunduh ke galeri perangkat Anda!
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
