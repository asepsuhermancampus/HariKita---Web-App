"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, Share2, PlusSquare, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // 1. Cek apakah sudah berjalan dalam mode standalone / PWA terpasang
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;

    if (isStandalone) {
      return;
    }

    // 2. Cek apakah user pernah menolak dalam 7 hari terakhir
    const dismissedAt = localStorage.getItem("harikita_pwa_dismissed");
    if (dismissedAt) {
      const daysSinceDismissed =
        (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // 3. Deteksi iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) &&
      !(window.navigator as unknown as { standalone?: boolean }).standalone;
    const isSafari =
      userAgent.includes("safari") &&
      !userAgent.includes("chrome") &&
      !userAgent.includes("crios") &&
      !userAgent.includes("fxios");

    if (isIosDevice && isSafari) {
      setIsIos(true);
      // Tampilkan banner setelah 3 detik interaksi di iOS
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // 4. Tangkap event beforeinstallprompt (Android Chrome / Edge / Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Tampilkan banner setelah 2 detik
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIosGuide(false);
    localStorage.setItem("harikita_pwa_dismissed", Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* Banner Floating di Bagian Bawah Mobile */}
      <aside
        aria-label="Pemberitahuan Pemasangan Aplikasi HariKita"
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
      >
        <div className="bg-[#FAF8F5] border border-[#C5A880]/50 rounded-2xl p-4 shadow-xl shadow-[#4A2E35]/10 backdrop-blur-md">
          <div className="flex items-start gap-3">
            {/* Logo Cameo Thumbnail */}
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-[#C5A880]/30 shrink-0 bg-white/80 p-0.5">
              <Image
                src="/icons/icon-192x192.png"
                alt="HariKita App Icon"
                width={44}
                height={44}
                className="object-contain"
              />
            </div>

            {/* Info Teks */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-serif-luxury font-bold text-[#4A2E35] truncate">
                  Pasang Aplikasi HariKita
                </h4>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-[#C5A880]/20 text-[#8E7046]">
                  PWA
                </span>
              </div>
              <p className="text-xs text-[#6B5E62] mt-0.5 leading-snug">
                Akses cepat katalog vendor Kebumen & undangan digital dari layar utama HP Anda.
              </p>
            </div>

            {/* Tombol Tutup */}
            <button
              onClick={handleDismiss}
              className="text-[#6B5E62] hover:text-[#4A2E35] p-1 rounded-lg hover:bg-[#F3EDE6] transition-colors"
              aria-label="Tutup notifikasi pasang aplikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-[#C5A880]/20">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2 text-xs font-medium text-[#6B5E62] hover:text-[#4A2E35] rounded-xl transition-colors text-center"
            >
              Nanti Saja
            </button>
            <button
              onClick={handleInstallClick}
              className="flex-1 py-2 px-3 text-xs font-semibold bg-[#C5A880] hover:bg-[#B39366] text-white rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 min-h-[38px] active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isIos ? "Cara Pasang" : "Pasang Sekarang"}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Modal Panduan Khusus iOS Safari */}
      {showIosGuide && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowIosGuide(false)}
        >
          <div
            className="bg-[#FAF8F5] border border-[#C5A880]/40 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-[#4A2E35] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#C5A880]/20 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#C5A880]" />
                <h3 className="font-serif-luxury font-bold text-base">
                  Pasang di iPhone / iPad
                </h3>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="text-[#6B5E62] hover:text-[#4A2E35] p-1 rounded-full hover:bg-[#F3EDE6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ol className="space-y-3 text-xs text-[#6B5E62]">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#C5A880]/20 text-[#8E7046] font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <p className="pt-0.5">
                  Ketuk tombol <strong className="text-[#4A2E35]">Bagikan (Share)</strong>{" "}
                  <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-[#C5A880]" /> di bar bawah Safari.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#C5A880]/20 text-[#8E7046] font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <p className="pt-0.5">
                  Gulir ke bawah lalu pilih menu{" "}
                  <strong className="text-[#4A2E35]">
                    Tambah ke Layar Utama (Add to Home Screen)
                  </strong>{" "}
                  <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-[#C5A880]" />.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#C5A880]/20 text-[#8E7046] font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <p className="pt-0.5">
                  Ketuk <strong className="text-[#4A2E35]">Tambah</strong> di sudut kanan atas. Ikon HariKita akan tampil di layar utama HP Anda!
                </p>
              </li>
            </ol>

            <button
              onClick={() => {
                setShowIosGuide(false);
                handleDismiss();
              }}
              className="w-full py-2.5 bg-[#C5A880] hover:bg-[#B39366] text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
