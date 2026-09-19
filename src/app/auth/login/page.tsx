"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { Heart, Store } from "lucide-react";
import { LoginCard } from "@/components/auth/LoginCard";

function LoginForm() {
  return (
    <LoginCard
      eyebrow="Portal Pengantin & Mitra"
      heading="Masuk ke Akun Anda"
      subheading="Calon pengantin dan mitra vendor Kebumen."
      icon={Heart}
      allowedRoles={["CLIENT", "VENDOR"]}
      roleTabs={[
        { role: "CLIENT", label: "Pengantin", icon: Heart },
        { role: "VENDOR", label: "Mitra Vendor", icon: Store },
      ]}
      footer={
        <>
          Belum punya akun?{" "}
          <Link
            href="/auth/register"
            className="font-semibold text-hk-taupe hover:text-hk-charcoal underline ml-1"
          >
            Daftar Pengantin Baru
          </Link>{" "}
          atau{" "}
          <Link
            href="/auth/register-vendor"
            className="font-semibold text-hk-taupe hover:underline"
          >
            Gabung Mitra Vendor
          </Link>
        </>
      }
    />
  );
}

export default function AuthLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-hk-ivory text-hk-charcoal/60 text-sm font-manrope">
          Memuat halaman masuk…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
