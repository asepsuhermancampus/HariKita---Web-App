"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { OtpStepper } from "@/components/auth/OtpStepper";

export default function AuthRegisterPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-hk-ivory text-hk-charcoal flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-manrope">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-hk-charcoal/60 hover:text-hk-charcoal transition-colors"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Kembali ke Beranda HariKita
          </Link>
          <div className="mt-4 font-editorial text-4xl font-bold tracking-wide">HariKita</div>
          <p className="text-xs text-hk-charcoal/60 mt-1">
            Daftar Akun Calon Pengantin &amp; Keluarga
          </p>
        </div>
        <OtpStepper role="CLIENT" title="Daftar Akun Pengantin" onDone={(to) => router.push(to)} />
        <p className="text-center text-xs text-hk-charcoal/60">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="font-semibold text-hk-taupe underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
