"use client";

import React, { Suspense } from "react";
import { Megaphone, ShieldCheck } from "lucide-react";
import { LoginCard } from "@/components/auth/LoginCard";

function BaLoginForm() {
  return (
    <LoginCard
      eyebrow="Portal Brand Ambassador"
      heading="Masuk Portal Brand Ambassador"
      subheading="Akses khusus mitra perekrut vendor HariKita."
      icon={Megaphone}
      allowedRoles={["BA"]}
      hint={
        <span className="flex items-start gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-hk-taupe shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            Halaman ini khusus Brand Ambassador. Kredensial diberikan oleh tim
            Super Admin HariKita.
          </span>
        </span>
      }
    />
  );
}

export default function AuthLoginBaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-hk-ivory text-hk-charcoal/60 text-sm font-manrope">
          Memuat halaman masuk…
        </div>
      }
    >
      <BaLoginForm />
    </Suspense>
  );
}
