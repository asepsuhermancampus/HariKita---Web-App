"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { registerClientAction } from "@/server/actions/auth";

export default function AuthRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", fullName);
      formData.set("phone", phone);
      formData.set("pin", pin);
      const result = await registerClientAction(formData);
      if (result.success) {
        router.push("/client");
      } else {
        setError(result.error || "Pendaftaran gagal. Silakan coba lagi.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#4A2E35] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
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
            Daftar Akun Calon Pengantin &amp; Keluarga
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#C5A880]/30 shadow-sm p-6 sm:p-8 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-[#4A2E35] font-semibold mb-1">
                Nama Lengkap Anda:
              </label>
              <input
                id="reg-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Aditya Pratama"
                required
                className="w-full p-2.5 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div>
              <label className="block text-[#4A2E35] font-semibold mb-1">
                Nomor HP / WhatsApp Aktif:
              </label>
              <input
                id="reg-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                required
                className="w-full p-2.5 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div>
              <label className="block text-[#4A2E35] font-semibold mb-1">
                Buat PIN 6-Digit:
                <span className="text-[#6B5E62] font-normal ml-1">
                  (angka saja, untuk login)
                </span>
              </label>
              <div className="relative">
                <input
                  id="reg-pin"
                  type={showPin ? "text" : "password"}
                  value={pin}
                  onChange={(e) => {
                    if (/^\d{0,6}$/.test(e.target.value)) setPin(e.target.value);
                  }}
                  placeholder="Contoh: 123456"
                  maxLength={6}
                  required
                  className="w-full p-2.5 pr-10 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880] tracking-widest"
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
              className="w-full py-3 px-4 rounded-xl bg-[#4A2E35] text-white font-semibold text-xs hover:bg-[#6B5E62] transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-2"
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Daftar &amp; Mulai Rangkai Acara</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A880]" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-[#6B5E62] pt-3 border-t border-[#FAF8F5]">
            Sudah punya akun?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-[#4A2E35] hover:text-[#C5A880] underline ml-1"
            >
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
