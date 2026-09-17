import type { Metadata } from "next";
import Link from "next/link";
import { LogIn, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Akses Ditolak",
  description: "Anda tidak memiliki izin untuk mengakses halaman ini.",
  robots: { index: false, follow: false },
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500"
        aria-hidden="true"
      >
        <ShieldAlert className="h-8 w-8" />
      </span>
      <h1 className="font-editorial text-2xl font-normal text-hk-charcoal sm:text-3xl">
        Akses Ditolak
      </h1>
      <p className="max-w-md font-manrope text-sm leading-relaxed text-hk-charcoal/70">
        Halaman ini hanya dapat diakses oleh peran pengguna tertentu. Silakan masuk dengan akun yang
        sesuai atau kembali ke beranda.
      </p>
      <nav className="mt-2 flex flex-col gap-3 sm:flex-row" aria-label="Navigasi pemulihan">
        <Link
          href="/auth/login"
          className="focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-hk-taupe px-6 py-3 font-manrope text-sm font-semibold text-white transition-colors hover:bg-[#78644e]"
        >
          <LogIn className="h-4 w-4" aria-hidden="true" />
          Masuk Akun
        </Link>
        <Link
          href="/"
          className="focus-ring inline-flex min-h-[44px] items-center justify-center rounded-full border border-hk-champagne bg-white px-6 py-3 font-manrope text-sm font-semibold text-hk-taupe transition-colors hover:bg-hk-ivory"
        >
          Ke Beranda
        </Link>
      </nav>
    </div>
  );
}
