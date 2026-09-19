"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, ChevronLeft, Eye, EyeOff, LucideIcon } from "lucide-react";
import { loginAction } from "@/server/actions/auth";
import { cn } from "@/lib/utils";

export interface LoginRoleTab {
  /** Nilai role (CLIENT / VENDOR) — dikirim sebagai bagian allowedRoles. */
  role: string;
  /** Label tab, mis. "Pengantin". */
  label: string;
  /** Ikon tab. */
  icon: LucideIcon;
}

export interface LoginCardProps {
  /** Eyebrow kecil di atas judul (opsional). */
  eyebrow?: string;
  /** Judul editorial utama. */
  heading: string;
  /** Subjudul singkat. */
  subheading: string;
  /** Ikon aksen di header kartu. */
  icon: LucideIcon;
  /** Portal ini hanya menerima role-role ini (mis. ["CLIENT","VENDOR"]). */
  allowedRoles: string[];
  /**
   * Tab pemilih peran (opsional). Bila diisi, user memilih salah satu role
   * sebelum login (mis. client vs vendor). Setiap tab mempersempit allowedRoles
   * ke role tab tersebut saat submit.
   */
  roleTabs?: LoginRoleTab[];
  /** Konten footer opsional (mis. tautan daftar akun). */
  footer?: React.ReactNode;
  /** Teks catatan keamanan/tip di bawah form (opsional). */
  hint?: React.ReactNode;
}

/**
 * Kartu login reusable — dipakai oleh /auth/login (client+vendor),
 * /auth/login/ba, dan /auth/login/admin. Mengikuti design system
 * HariKita: font-editorial (Cormorant Garamond) untuk judul, font-manrope
 * untuk body, serta token warna hk-* (charcoal/taupe/champagne/soft-beige/ivory).
 */
export function LoginCard({
  eyebrow,
  heading,
  subheading,
  icon: HeaderIcon,
  allowedRoles,
  roleTabs,
  footer,
  hint,
}: LoginCardProps) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";

  const [activeRole, setActiveRole] = useState<string>(
    roleTabs && roleTabs.length > 0 ? roleTabs[0].role : allowedRoles[0]
  );
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const submitRoles = roleTabs && roleTabs.length > 0 ? [activeRole] : allowedRoles;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("phone", phone);
        formData.set("pin", pin);
        formData.set("allowedRoles", submitRoles.join(","));
        if (callbackUrl) formData.set("callbackUrl", callbackUrl);
        const result = await loginAction(formData);
        if (result.success && result.redirectTo) {
          window.location.href = result.redirectTo;
        } else {
          setError(result.error || "Login gagal. Periksa nomor HP dan PIN Anda.");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(
          msg || "Terjadi kesalahan server saat login. Silakan refresh dan coba lagi."
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-hk-ivory text-hk-charcoal font-manrope flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-hk-charcoal/60 hover:text-hk-charcoal transition-colors"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Kembali ke Beranda HariKita
          </Link>
          <div className="mt-4 font-editorial text-4xl font-bold text-hk-charcoal tracking-wide">
            HariKita
          </div>
          {eyebrow && (
            <span className="mt-2 inline-block rounded-full bg-hk-soft-beige/70 px-3 py-0.5 text-[10px] font-manrope font-bold uppercase tracking-widest text-hk-taupe">
              {eyebrow}
            </span>
          )}
          <p className="text-xs text-hk-charcoal/60 mt-2">
            Masuk ke Akun Anda • Ekosistem Acara Kebumen
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-hk-champagne/40 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Card Header */}
          <div className="flex items-center gap-3 border-b border-hk-soft-beige/60 pb-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-hk-soft-beige/60 text-hk-taupe">
              <HeaderIcon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="font-editorial text-xl font-bold text-hk-charcoal leading-tight">
                {heading}
              </h1>
              <p className="text-[11px] text-hk-charcoal/60 font-manrope">{subheading}</p>
            </div>
          </div>

          {/* Role Tabs (opsional) */}
          {roleTabs && roleTabs.length > 0 && (
            <div className="space-y-2">
              <span
                className="block text-xs font-semibold text-hk-charcoal"
                id="role-group-label"
              >
                Masuk sebagai:
              </span>
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${roleTabs.length}, minmax(0, 1fr))` }}
                role="group"
                aria-labelledby="role-group-label"
              >
                {roleTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeRole === tab.role;
                  return (
                    <button
                      key={tab.role}
                      type="button"
                      onClick={() => {
                        setActiveRole(tab.role);
                        setError("");
                      }}
                      aria-pressed={isActive}
                      className={cn(
                        "focus-ring py-2 px-2 rounded-xl text-xs font-manrope font-semibold flex flex-col items-center gap-1 border transition-all",
                        isActive
                          ? "bg-hk-charcoal text-white border-hk-charcoal shadow-sm"
                          : "bg-hk-ivory text-hk-charcoal/60 border-hk-soft-beige hover:border-hk-champagne"
                      )}
                    >
                      <Icon
                        className={cn("w-4 h-4", isActive ? "text-hk-champagne" : "text-hk-taupe")}
                        aria-hidden="true"
                      />
                      <span className="text-center leading-tight">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error Message */}
          <div aria-live="assertive" aria-atomic="true">
            {error && (
              <div
                role="alert"
                className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2"
              >
                {error}
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label
                htmlFor="login-phone"
                className="block text-hk-charcoal font-semibold mb-1"
              >
                Nomor HP / WhatsApp:
              </label>
              <input
                id="login-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 08129982001"
                required
                autoComplete="tel"
                inputMode="tel"
                aria-invalid={error ? true : undefined}
                className="focus-ring w-full p-3 rounded-xl border border-hk-soft-beige focus:outline-none focus:border-hk-champagne text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="login-pin"
                className="block text-hk-charcoal font-semibold mb-1"
              >
                PIN 6-Digit:
              </label>
              <div className="relative">
                <input
                  id="login-pin"
                  type={showPin ? "text" : "password"}
                  value={pin}
                  onChange={(e) => {
                    if (/^\d{0,6}$/.test(e.target.value)) setPin(e.target.value);
                  }}
                  placeholder="••••••"
                  maxLength={6}
                  required
                  autoComplete="current-password"
                  inputMode="numeric"
                  aria-invalid={error ? true : undefined}
                  className="focus-ring w-full p-3 pr-10 rounded-xl border border-hk-soft-beige focus:outline-none focus:border-hk-champagne text-xs tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  aria-label={showPin ? "Sembunyikan PIN" : "Tampilkan PIN"}
                  aria-pressed={showPin}
                  className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 text-hk-charcoal/60 rounded p-1"
                >
                  {showPin ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              aria-busy={isPending}
              className="focus-ring w-full py-3 px-4 rounded-full bg-hk-taupe text-white font-manrope font-semibold text-xs hover:bg-hk-charcoal transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 min-h-[44px]"
            >
              {isPending ? (
                <>
                  <span
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                    aria-hidden="true"
                  />
                  <span>Memproses…</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-hk-champagne" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <Link
              href="/auth/reset-pin"
              className="text-[11px] font-manrope text-hk-taupe hover:text-hk-charcoal underline"
            >
              Lupa PIN?
            </Link>
          </div>

          {hint && (
            <div className="rounded-xl bg-hk-ivory border border-hk-soft-beige px-3 py-2 text-[11px] text-hk-charcoal/70 font-manrope">
              {hint}
            </div>
          )}

          {footer && (
            <div className="text-center text-xs text-hk-charcoal/60 pt-2 border-t border-hk-soft-beige/60">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
