import React from "react";
import Link from "next/link";
import { Search } from "lucide-react";

/**
 * 404 Not Found — server component (default, tanpa "use client").
 * Menyediakan jalan keluar (beranda, katalog vendor, undangan) agar tidak
 * menjadi jalan buntu.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-full bg-hk-soft-beige/60 text-hk-taupe"
        aria-hidden="true"
      >
        <Search className="h-8 w-8" />
      </span>
      <p className="font-editorial text-5xl font-normal text-hk-champagne">404</p>
      <h1 className="font-editorial text-2xl font-normal text-hk-charcoal sm:text-3xl">
        Halaman tidak ditemukan
      </h1>
      <p className="max-w-md font-manrope text-sm leading-relaxed text-hk-charcoal/70">
        Halaman yang Anda cari mungkin sudah dipindahkan atau tidak pernah ada.
        Mari kembali menjelajahi layanan HariKita di Kebumen.
      </p>
      <nav className="mt-2 flex flex-col gap-3 sm:flex-row" aria-label="Navigasi pemulihan">
        <Link
          href="/"
          className="focus-ring inline-flex min-h-[44px] items-center justify-center rounded-full bg-hk-taupe px-6 py-3 font-manrope text-sm font-semibold text-white transition-colors hover:bg-[#78644e]"
        >
          Ke Beranda
        </Link>
        <Link
          href="/kategori"
          className="focus-ring inline-flex min-h-[44px] items-center justify-center rounded-full border border-hk-champagne bg-white px-6 py-3 font-manrope text-sm font-semibold text-hk-taupe transition-colors hover:bg-hk-ivory"
        >
          Jelajahi 11 Layanan
        </Link>
        <Link
          href="/undangan"
          className="focus-ring inline-flex min-h-[44px] items-center justify-center rounded-full border border-hk-champagne bg-white px-6 py-3 font-manrope text-sm font-semibold text-hk-taupe transition-colors hover:bg-hk-ivory"
        >
          Galeri Undangan
        </Link>
      </nav>
    </div>
  );
}
