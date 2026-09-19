"use client";

import React, { useState, useTransition } from "react";
import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { sendOtpAction, verifyOtpAction, completeRegistrationAction } from "@/server/actions/auth";

type Stage = "identity" | "otp" | "pin";

/**
 * Stepper registrasi 3 tahap: Identitas → Verifikasi OTP → Set PIN.
 * Dipakai oleh halaman /auth/register (CLIENT) & /auth/register-vendor (VENDOR).
 */
export function OtpStepper({
  role,
  withReferral = false,
  title,
  onDone,
}: {
  role: "CLIENT" | "VENDOR";
  withReferral?: boolean;
  title: string;
  onDone: (redirectTo: string) => void;
}) {
  const [stage, setStage] = useState<Stage>("identity");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
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
      const res = await sendOtpAction({ name, phone, email, purpose: "REGISTER", role });
      if (!res.success) {
        setError(res.message);
        return;
      }
      if (res.data.devCode) setDevCode(res.data.devCode);
      setStage("otp");
      setSuccess(`Kode dikirim ke ${email}.`);
    });
  };

  const verify = () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await verifyOtpAction({ email, purpose: "REGISTER", code });
      if (!res.success) {
        setError(res.message);
        return;
      }
      setSuccess("OTP valid.");
      setStage("pin");
    });
  };

  const finish = () => {
    setError(null);
    if (pin !== pin2) {
      setError("Konfirmasi PIN tidak cocok.");
      return;
    }
    startTransition(async () => {
      const res = await completeRegistrationAction({
        name,
        phone,
        email,
        pin,
        role,
        referralCode: referralCode || undefined,
      });
      if (!res.success) {
        setError(res.message);
        return;
      }
      onDone(res.data.redirectTo);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-hk-champagne/40 shadow-sm p-6 sm:p-8 space-y-5 font-manrope text-xs text-hk-charcoal">
      {/* stepper indicator */}
      <div className="flex items-center gap-2" aria-hidden="true">
        {(["identity", "otp", "pin"] as Stage[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                stage === s ? "bg-hk-taupe text-white" : "bg-hk-soft-beige text-hk-charcoal/60"
              }`}
            >
              {i + 1}
            </span>
            {i < 2 && <span className="h-px w-6 bg-hk-soft-beige" />}
          </div>
        ))}
      </div>

      <h1 className="font-editorial text-xl font-bold">{title}</h1>

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

      {stage === "identity" && (
        <div className="space-y-3">
          <input
            className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige"
            placeholder="Nama Lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          <input
            className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige"
            placeholder="Nomor HP / WhatsApp Aktif"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
          <input
            className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          {withReferral && (
            <input
              className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige"
              placeholder="Kode Referral BA (opsional)"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            />
          )}
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
            placeholder="PIN 6-digit"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => {
              if (/^\d{0,6}$/.test(e.target.value)) setPin(e.target.value);
            }}
          />
          <input
            className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige tracking-widest"
            placeholder="Konfirmasi PIN"
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
            onClick={finish}
            className="focus-ring w-full min-h-[44px] rounded-full bg-hk-charcoal text-white font-semibold hover:bg-hk-taupe disabled:opacity-50"
          >
            {isPending ? "Membuat akun…" : "Buat Akun"}
          </button>
        </div>
      )}
    </div>
  );
}
