"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Download, Share2, PlusSquare, X, Smartphone, CheckCircle2, Sparkles } from "lucide-react";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_STORAGE_KEY = "harikita_pwa_dismissed_until";
const INSTALLED_STORAGE_KEY = "harikita_pwa_installed";
const REINSTALL_PROMPTED_STORAGE_KEY = "harikita_pwa_reinstall_prompted";
const DISMISS_COOLDOWN_MS = 20 * 60 * 1000; // Toleransi 20 menit

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const iosDialogRef = useRef<HTMLDivElement>(null);
  const iosInitialFocusRef = useRef<HTMLButtonElement>(null);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  useFocusTrap(iosDialogRef, showIosGuide, () => setShowIosGuide(false), iosInitialFocusRef);

  // Helper cek mode standalone (aplikasi terpasang & sedang dibuka)
  const isStandaloneApp = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  }, []);

  // Cek apakah toleransi dismiss 20 menit masih aktif
  const isWithinDismissCooldown = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    const dismissedUntil = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (!dismissedUntil) return false;
    const expiry = parseInt(dismissedUntil, 10);
    if (isNaN(expiry)) return false;
    return Date.now() < expiry;
  }, []);

  // Evaluasi kelayakan menampilkan notifikasi PWA
  const evaluateEligibility = useCallback((): { canShow: boolean; remainingCooldownMs: number } => {
    if (typeof window === "undefined") return { canShow: false, remainingCooldownMs: 0 };

    // 1. Jika sedang berjalan di mode standalone, jangan pernah tampilkan prompt otomatis
    if (isStandaloneApp()) {
      localStorage.setItem(INSTALLED_STORAGE_KEY, "true");
      return { canShow: false, remainingCooldownMs: 0 };
    }

    // 2. Cek apakah user pernah menginstall lalu menghapusnya (uninstall)
    const wasInstalled = localStorage.getItem(INSTALLED_STORAGE_KEY) === "true";
    const reinstallPrompted = localStorage.getItem(REINSTALL_PROMPTED_STORAGE_KEY) === "true";

    if (wasInstalled && reinstallPrompted) {
      // Sesuai aturan: jika pernah install dan dihapus, hanya ditampilkan kembali sekali saja
      return { canShow: false, remainingCooldownMs: 0 };
    }

    // 3. Cek toleransi 20 menit setelah klik dismiss/X
    const dismissedUntil = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (dismissedUntil) {
      const expiry = parseInt(dismissedUntil, 10);
      if (!isNaN(expiry)) {
        const remaining = expiry - Date.now();
        if (remaining > 0) {
          return { canShow: false, remainingCooldownMs: remaining };
        }
      }
    }

    return { canShow: true, remainingCooldownMs: 0 };
  }, [isStandaloneApp]);

  // Fungsi untuk menampilkan prompt dengan timer penyesuaian jika tab tetap dibuka
  const scheduleCooldownCheck = useCallback((remainingMs: number) => {
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }

    if (remainingMs <= 0) return;

    cooldownTimerRef.current = setTimeout(() => {
      const eligibility = evaluateEligibility();
      if (eligibility.canShow) {
        setShowPrompt(true);
      }
    }, remainingMs);
  }, [evaluateEligibility]);

  useEffect(() => {
    // 1. Cek mode standalone awal
    if (isStandaloneApp()) {
      localStorage.setItem(INSTALLED_STORAGE_KEY, "true");
      return;
    }

    // 2. Deteksi iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) &&
      !(window.navigator as unknown as { standalone?: boolean }).standalone;
    const isSafari =
      userAgent.includes("safari") &&
      !userAgent.includes("chrome") &&
      !userAgent.includes("crios") &&
      !userAgent.includes("fxios");

    const isAppleSafari = isIosDevice && isSafari;
    setIsIos(isAppleSafari);

    const eligibility = evaluateEligibility();

    if (eligibility.canShow) {
      if (isAppleSafari) {
        // Tampilkan setelah jeda 3 detik interaksi di iOS
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    } else if (eligibility.remainingCooldownMs > 0) {
      // Jadwalkan untuk tab yang masih terbuka setelah 20 menit berlalu
      scheduleCooldownCheck(eligibility.remainingCooldownMs);
    }

    // 3. Tangkap event beforeinstallprompt (Android Chrome / Desktop / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      const currentEligibility = evaluateEligibility();
      if (currentEligibility.canShow) {
        // Tampilkan banner setelah 2 detik
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 2000);
        return () => clearTimeout(timer);
      } else if (currentEligibility.remainingCooldownMs > 0) {
        scheduleCooldownCheck(currentEligibility.remainingCooldownMs);
      }
    };

    // 4. Tangkap event saat PWA berhasil di-install
    const handleAppInstalled = () => {
      localStorage.setItem(INSTALLED_STORAGE_KEY, "true");
      localStorage.removeItem(REINSTALL_PROMPTED_STORAGE_KEY);
      setShowPrompt(false);
      setShowIosGuide(false);
      setToastMessage("Aplikasi HariKita berhasil dipasang ke perangkat Anda.");
      setTimeout(() => setToastMessage(null), 4000);
    };

    // 5. Cek saat tab kembali aktif (visibilitychange) agar waktu toleransi selalu up-to-date
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const currentCheck = evaluateEligibility();
        if (currentCheck.canShow) {
          setShowPrompt(true);
        } else if (currentCheck.remainingCooldownMs > 0) {
          scheduleCooldownCheck(currentCheck.remainingCooldownMs);
        }
      }
    };

    // 6. Tangkap pemicu manual dari Footer ("Download Apps")
    const handleManualInstallTrigger = () => {
      if (isStandaloneApp()) {
        setToastMessage("Aplikasi HariKita sudah terpasang dan aktif di perangkat Anda.");
        setTimeout(() => setToastMessage(null), 4000);
        return;
      }

      if (isAppleSafari) {
        setShowIosGuide(true);
        return;
      }

      if (deferredPrompt) {
        deferredPrompt.prompt().then(() => {
          deferredPrompt.userChoice.then((choice) => {
            if (choice.outcome === "accepted") {
              localStorage.setItem(INSTALLED_STORAGE_KEY, "true");
              setShowPrompt(false);
            }
            setDeferredPrompt(null);
          });
        });
        return;
      }

      // Jika deferredPrompt belum terpicu atau browser desktop, tampilkan card prompt
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("harikita:pwa-install", handleManualInstallTrigger);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("harikita:pwa-install", handleManualInstallTrigger);
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, [isStandaloneApp, evaluateEligibility, scheduleCooldownCheck, deferredPrompt]);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      localStorage.setItem(INSTALLED_STORAGE_KEY, "true");
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIosGuide(false);

    // Tandai jika ini skenario uninstalled, sehingga hanya tampil sekali saja
    const wasInstalled = localStorage.getItem(INSTALLED_STORAGE_KEY) === "true";
    if (wasInstalled) {
      localStorage.setItem(REINSTALL_PROMPTED_STORAGE_KEY, "true");
    }

    // Set toleransi 20 menit
    const expiry = Date.now() + DISMISS_COOLDOWN_MS;
    localStorage.setItem(DISMISS_STORAGE_KEY, expiry.toString());

    // Jadwalkan kemunculan kembali setelah 20 menit jika tab tetap dibuka
    if (!wasInstalled) {
      scheduleCooldownCheck(DISMISS_COOLDOWN_MS);
    }
  };

  return (
    <>
      {/* Toast Notifikasi Status PWA */}
      {toastMessage && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-20 right-4 sm:right-6 z-50 animate-in fade-in slide-in-from-top-3 duration-300"
        >
          <div className="bg-[#FAF8F5] border border-[#C5A880] rounded-2xl px-4 py-3 shadow-lg shadow-[#4A2E35]/15 flex items-center gap-2.5 max-w-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <p className="text-xs font-manrope font-medium text-[#4A2E35] leading-snug">
              {toastMessage}
            </p>
          </div>
        </aside>
      )}

      {/* Banner Floating di Bagian Bawah Mobile & Sisi Kanan Desktop */}
      {showPrompt && (
        <aside
          aria-label="Pemberitahuan Pemasangan Aplikasi HariKita"
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="bg-[#FAF8F5] border border-[#C5A880]/50 rounded-2xl p-4 shadow-xl shadow-[#4A2E35]/10 backdrop-blur-md">
            <div className="flex items-start gap-3">
              {/* Logo Cameo Thumbnail */}
              <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-[#C5A880]/30 shrink-0 bg-white/80 p-0.5 shadow-2xs">
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
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-[#C5A880]/20 text-[#8E7046]">
                    <Sparkles className="w-2.5 h-2.5" />
                    PWA
                  </span>
                </div>
                <p className="text-xs text-[#6B5E62] mt-0.5 leading-snug">
                  Akses cepat katalog vendor Kebumen &amp; undangan digital langsung dari layar HP Anda.
                </p>
              </div>

              {/* Tombol Tutup (X) */}
              <button
                onClick={handleDismiss}
                className="focus-ring text-[#6B5E62] hover:text-[#4A2E35] p-1.5 rounded-lg hover:bg-[#F3EDE6] transition-colors"
                aria-label="Tutup notifikasi pasang aplikasi"
                title="Tutup"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-[#C5A880]/20">
              <button
                onClick={handleDismiss}
                className="focus-ring flex-1 py-2 text-xs font-medium text-[#6B5E62] hover:text-[#4A2E35] rounded-xl transition-colors text-center min-h-[44px]"
              >
                Nanti
              </button>
              <button
                onClick={handleInstallClick}
                className="focus-ring flex-1 py-2 px-3 text-xs font-semibold bg-[#C5A880] hover:bg-[#B39366] text-white rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 min-h-[44px] active:scale-95"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{isIos ? "Cara Pasang" : "Pasang Sekarang"}</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Modal Panduan Khusus iOS Safari */}
      {showIosGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-install-title"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowIosGuide(false)}
        >
          <div
            ref={iosDialogRef}
            className="bg-[#FAF8F5] border border-[#C5A880]/40 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-[#4A2E35] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#C5A880]/20 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#C5A880]" aria-hidden="true" />
                <h3 id="ios-install-title" className="font-serif-luxury font-bold text-base">
                  Pasang di iPhone / iPad
                </h3>
              </div>
              <button
                ref={iosInitialFocusRef}
                onClick={() => setShowIosGuide(false)}
                aria-label="Tutup panduan pemasangan"
                className="focus-ring text-[#6B5E62] hover:text-[#4A2E35] p-1 rounded-full hover:bg-[#F3EDE6]"
              >
                <X className="w-4 h-4" aria-hidden="true" />
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
              className="focus-ring w-full py-2.5 bg-[#C5A880] hover:bg-[#B39366] text-white text-xs font-semibold rounded-xl transition-colors min-h-[44px]"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
