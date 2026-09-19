"use client";

import React, { Suspense } from "react";
import { ShieldAlert, Lock } from "lucide-react";
import { LoginCard } from "@/components/auth/LoginCard";

function AdminLoginForm() {
  return (
    <LoginCard
      eyebrow="Portal Super Admin"
      heading="Masuk Portal Super Admin"
      subheading="Akses khusus tim pengelola HariKita."
      icon={ShieldAlert}
      allowedRoles={["ADMIN"]}
      hint={
        <span className="flex items-start gap-1.5">
          <Lock className="w-3.5 h-3.5 text-hk-taupe shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            Halaman ini khusus Super Admin. Seluruh aktivitas login tercatat untuk
            keamanan sistem.
          </span>
        </span>
      }
    />
  );
}

export default function AuthLoginAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-hk-ivory text-hk-charcoal/60 text-sm font-manrope">
          Memuat halaman masuk…
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
