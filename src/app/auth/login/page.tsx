"use client";

import React, { useState, useTransition } from "react";
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

export default function AuthLoginPage() {
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const formData = new FormData();
      formData.set("phone", phone);
      formData.set("pin", pin);
      formData.set("callbackUrl", callbackUrl);
      const result = await loginAction(formData);
      if (result.success && result.redirectTo) {
        router.push(result.redirectTo);
      } else {
        setError(
          result.error || "Login gagal. Periksa nomor HP dan PIN Anda."
        );
      }
    });
  };

  const handleQuickDemo = (role: "client" | "vendor" | "admin") => {
    setSelectedRole(role);
    setError("");
    if (role === "client") {
      setPhone("081987654321");
      setPin("123456");
    } else if (role === "vendor") {
      setPhone("081300000001");
      setPin("123456");
    } else {
      setPhone("081234567890");
      setPin("123456");
    }
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
            <label className="block text-xs font-semibold text-[#4A2E35]">
              Pilih Peran Akun:
            </label>
            <div className="grid grid-cols-3 gap-2">
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
                    onClick={() => setSelectedRole(role)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
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
          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#4A2E35] font-semibold mb-1">
                Nomor HP / WhatsApp:
              </label>
              <input
                id="login-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 08129982001"
                required
                className="w-full p-3 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880] text-xs"
              />
            </div>

            <div>
              <label className="block text-[#4A2E35] font-semibold mb-1">
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
                  className="w-full p-3 pr-10 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880] text-xs tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5E62]"
                >
                  {showPin ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#4A2E35] to-[#6B5E62] text-white font-semibold text-xs hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A880]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-2 border-t border-[#FAF8F5] space-y-2 text-[11px] text-[#6B5E62]">
            <div className="text-center font-medium">
              Uji Coba Akses Cepat (Demo Sandbox):
            </div>
            <div className="flex justify-center gap-2">
              {(["client", "vendor", "admin"] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleQuickDemo(role)}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E5D7C7] hover:border-[#C5A880] text-[#4A2E35]"
                >
                  Isi {role === "client" ? "Klien" : role === "vendor" ? "Vendor" : "Admin"}
                </button>
              ))}
            </div>
            <p className="text-center text-[10px] text-[#6B5E62]/70">
              PIN demo: <span className="font-mono font-semibold">123456</span>
            </p>
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
