"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, AlertCircle, CheckCircle2, ShieldCheck, KeyRound } from "lucide-react";
import { sendResetOtpAction, verifyOtpAction, resetPinAction } from "@/server/actions/auth";

type Stage = "email" | "otp" | "pin" | "done";

export default function AuthResetPinPage() {
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sendOtp = () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await sendResetOtpAction(email);
      if (!res.success) {
        setError(res.message);
        return;
      }
      if (res.data.devCode) setDevCode(res.data.devCode);
      setStage("otp");
      setSuccess(`Jika email terdaftar, kode dikirim ke ${email}.`);
    });
  };

  const verify = () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await verifyOtpAction({ email, purpose: "RESET_PIN", code });
      if (!res.success) {
        setError(res.message);
        return;
      }
      setSuccess("OTP valid.");
      setStage("pin");
    });
  };

  const reset = () => {
    setError(null);
    if (pin !== pin2) {
      setError("Konfirmasi PIN tidak cocok.");
      return;
    }
    startTransition(async () => {
      const res = await resetPinAction({ email, pin });
      if (!res.success) {
        setError(res.message);
        return;
      }
      setStage("done");
      setSuccess("PIN berhasil diubah.");
    });
  };

  return (
    <div className="min-h-screen bg-hk-ivory text-hk-charcoal flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-manrope">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        <div className="text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs text-hk-charcoal/60 hover:text-hk-charcoal transition-colors"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Kembali ke halaman Login
          </Link>
          <div className="mt-4 font-editorial text-4xl font-bold tracking-wide">HariKita</div>
          <p className="text-xs text-hk-charcoal/60 mt-1">Reset PIN Akun</p>
        </div>

        <div className="bg-white rounded-2xl border border-hk-champagne/40 shadow-sm p-6 sm:p-8 space-y-5 text-xs text-hk-charcoal">
          <div className="flex items-center gap-2 border-b border-hk-soft-beige/60 pb-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-hk-soft-beige/60 text-hk-taupe">
              <KeyRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <h1 className="font-editorial text-xl font-bold">Lupa PIN? Reset di sini</h1>
          </div>

          {devCode && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
              MODE DEV — kode OTP: <strong className="font-mono">{devCode}</strong>
            </div>
          )}
          <div aria-live="polite" aria-atomic="true" className="space-y-2">
            {success && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800 flex gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {success}
              </div>
            )}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 flex gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {error}
              </div>
            )}
          </div>

          {stage === "email" && (
            <div className="space-y-3">
              <p className="text-hk-charcoal/70">
                Masukkan email yang terdaftar. Kami akan mengirim kode OTP.
              </p>
              <input
                className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige"
                placeholder="Email terdaftar"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <button
                type="button"
                disabled={isPending}
                onClick={sendOtp}
                className="focus-ring w-full min-h-[44px] rounded-full bg-hk-taupe text-white font-semibold hover:bg-hk-charcoal disabled:opacity-50"
              >
                {isPending ? "Mengirim…" : "Kirim Kode OTP"}
              </button>
            </div>
          )}

          {stage === "otp" && (
            <div className="space-y-3">
              <input
                className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige tracking-[0.5em] text-center"
                placeholder="______"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => {
                  if (/^\d{0,6}$/.test(e.target.value)) setCode(e.target.value);
                }}
              />
              <button
                type="button"
                disabled={isPending || code.length < 6}
                onClick={verify}
                className="focus-ring w-full min-h-[44px] rounded-full bg-hk-taupe text-white font-semibold hover:bg-hk-charcoal disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                Verifikasi OTP
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={sendOtp}
                className="w-full text-hk-taupe underline disabled:opacity-50"
              >
                Kirim Ulang Kode
              </button>
            </div>
          )}

          {stage === "pin" && (
            <div className="space-y-3">
              <input
                className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige tracking-widest"
                placeholder="PIN baru (6 digit)"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  if (/^\d{0,6}$/.test(e.target.value)) setPin(e.target.value);
                }}
              />
              <input
                className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige tracking-widest"
                placeholder="Konfirmasi PIN baru"
                inputMode="numeric"
                maxLength={6}
                value={pin2}
                onChange={(e) => {
                  if (/^\d{0,6}$/.test(e.target.value)) setPin2(e.target.value);
                }}
              />
              <button
                type="button"
                disabled={isPending || pin.length < 6 || pin2.length < 6}
                onClick={reset}
                className="focus-ring w-full min-h-[44px] rounded-full bg-hk-charcoal text-white font-semibold hover:bg-hk-taupe disabled:opacity-50"
              >
                {isPending ? "Menyimpan…" : "Simpan PIN Baru"}
              </button>
              <p className="text-[10px] text-hk-charcoal/60">
                PIN hanya dapat diubah setiap 14 hari sekali.
              </p>
            </div>
          )}

          {stage === "done" && (
            <div className="space-y-3 text-center">
              <div className="flex justify-center text-emerald-600">
                <CheckCircle2 className="w-10 h-10" aria-hidden="true" />
              </div>
              <p className="text-hk-charcoal">PIN berhasil diubah. Silakan masuk dengan PIN baru.</p>
              <Link
                href="/auth/login"
                className="focus-ring inline-flex w-full min-h-[44px] items-center justify-center rounded-full bg-hk-taupe text-white font-semibold hover:bg-hk-charcoal"
              >
                Ke Halaman Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
