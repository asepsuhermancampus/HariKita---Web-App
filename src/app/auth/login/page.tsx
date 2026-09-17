"use client";

import React, { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Heart,
  Store,
  ShieldAlert,
  ArrowRight,
  ChevronLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { loginAction } from "@/server/actions/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";

  const [selectedRole, setSelectedRole] = useState<
    "client" | "vendor" | "admin"
  >("client");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const DEMO_ACCOUNTS = {
    client: { phone: "081987654321", pin: "123456", label: "Pengantin (Bima & Citra)" },
    vendor: { phone: "081300000001", pin: "123456", label: "Vendor (Menganti Studio)" },
    admin: { phone: "081234567890", pin: "123456", label: "Super Admin HariKita" },
  };

  const executeLogin = (loginPhone: string, loginPin: string) => {
    setError("");
    startTransition(async () => {
      const formData = new FormData();
      formData.set("phone", loginPhone);
      formData.set("pin", loginPin);
      if (callbackUrl) formData.set("callbackUrl", callbackUrl);
      const result = await loginAction(formData);
      if (result.success && result.redirectTo) {
        window.location.href = result.redirectTo;
      } else {
        setError(
          result.error || "Login gagal. Periksa nomor HP dan PIN Anda."
        );
      }
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(phone, pin);
  };

  const handleSelectRole = (role: "client" | "vendor" | "admin") => {
    setSelectedRole(role);
    setError("");
    const demo = DEMO_ACCOUNTS[role];
    setPhone(demo.phone);
    setPin(demo.pin);
  };

  const handleDirectLogin = (role: "client" | "vendor" | "admin") => {
    setSelectedRole(role);
    const demo = DEMO_ACCOUNTS[role];
    setPhone(demo.phone);
    setPin(demo.pin);
    executeLogin(demo.phone, demo.pin);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#4A2E35] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#6B5E62] hover:text-[#4A2E35] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Kembali ke Beranda HariKita
          </Link>
          <div className="mt-4 font-serif text-3xl font-bold text-[#4A2E35] tracking-wide">
            HariKita
          </div>
          <p className="text-xs text-[#6B5E62] mt-1">
            Masuk ke Akun Anda • Ekosistem Acara Kebumen
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#C5A880]/30 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Role Switcher */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-[#4A2E35]" id="role-group-label">
              Pilih Peran Akun:
            </span>
            <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="role-group-label">
              {(["client", "vendor", "admin"] as const).map((role) => {
                const Icon =
                  role === "client"
                    ? Heart
                    : role === "vendor"
                    ? Store
                    : ShieldAlert;
                const label =
                  role === "client"
                    ? "Pengantin"
                    : role === "vendor"
                    ? "Mitra Vendor"
                    : "Super Admin";
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleSelectRole(role)}
                    aria-pressed={selectedRole === role}
                    className={`focus-ring py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                      selectedRole === role
                        ? "bg-[#4A2E35] text-white border-[#4A2E35] shadow"
                        : "bg-[#FAF8F5] text-[#6B5E62] border-[#E5D7C7] hover:border-[#C5A880]"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#C5A880]" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

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
                className="block text-[#4A2E35] font-semibold mb-1"
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
                className="focus-ring w-full p-3 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880] text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="login-pin"
                className="block text-[#4A2E35] font-semibold mb-1"
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
                  className="focus-ring w-full p-3 pr-10 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880] text-xs tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  aria-label={showPin ? "Sembunyikan PIN" : "Tampilkan PIN"}
                  aria-pressed={showPin}
                  className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5E62] rounded p-1"
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
              className="focus-ring w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#4A2E35] to-[#6B5E62] text-white font-semibold text-xs hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 min-h-[44px]"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                  <span>Memproses…</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A880]" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Sandbox */}
          <div className="pt-3 border-t border-[#FAF8F5] space-y-2.5 text-[11px] text-[#6B5E62]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#4A2E35]">
                Uji Coba Akses Cepat (1-Klik Masuk):
              </span>
              <span className="text-[10px] text-[#C5A880] font-mono">PIN: 123456</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["client", "vendor", "admin"] as const).map((role) => {
                const label =
                  role === "client"
                    ? "Pengantin"
                    : role === "vendor"
                    ? "Vendor"
                    : "Admin";
                return (
                  <button
                    key={role}
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDirectLogin(role)}
                    className="focus-ring py-2 px-1 rounded-xl bg-[#FAF8F5] border border-[#E5D7C7] hover:border-[#C5A880] hover:bg-white text-[#4A2E35] font-semibold text-[11px] transition-all flex flex-col items-center gap-0.5 shadow-sm active:scale-95 disabled:opacity-50 min-h-[44px]"
                  >
                    <span>Masuk {label}</span>
                    <span className="text-[9px] text-[#6B5E62]/70 font-normal">
                      {role === "client" ? "Bima & Citra" : role === "vendor" ? "Menganti" : "Super Admin"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center text-xs text-[#6B5E62] pt-2 border-t border-[#FAF8F5]">
            Belum punya akun?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-[#4A2E35] hover:text-[#C5A880] underline ml-1"
            >
              Daftar Pengantin Baru
            </Link>{" "}
            atau{" "}
            <Link
              href="/auth/register-vendor"
              className="font-semibold text-[#C5A880] hover:underline"
            >
              Gabung Mitra Vendor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] text-[#6B5E62] text-sm">
          Memuat halaman masuk…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
