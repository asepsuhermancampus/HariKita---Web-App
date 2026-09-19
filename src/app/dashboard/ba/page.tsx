import React from "react";
import Link from "next/link";
import {
  Wallet,
  Coins,
  Store,
  Percent,
  Copy,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { getAmbassadorSummary } from "@/server/queries/ambassador";
import { EmptyState } from "@/components/harikita/ui";
import { ROUTES } from "@/lib/routes";

export const dynamic = "force-dynamic";

/**
 * Ringkasan Portal Brand Ambassador — Server Component (BA-only via middleware).
 */
export default async function BaSummaryPage() {
  const summary = await getAmbassadorSummary();

  if (!summary) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          title="Profil BA tidak ditemukan"
          description="Akun Anda belum memiliki profil Brand Ambassador. Hubungi admin HariKita untuk mengaktifkan."
          icon="search"
        />
      </div>
    );
  }

  const statCards = [
    {
      label: "Kode Referral",
      value: summary.referralCode,
      icon: Sparkles,
      isCode: true,
      hint: "Bagikan kode ini ke calon vendor mitra.",
    },
    {
      label: "Saldo Dompet Komisi",
      value: formatRupiah(summary.walletBalance),
      icon: Wallet,
      hint: "Saldo siap ditarik ke rekening Anda.",
    },
    {
      label: "Total Komisi Terkumpul",
      value: formatRupiah(summary.totalCommission),
      icon: Coins,
      hint: "Akumulasi komisi dari pelunasan order vendor rekrutan.",
    },
    {
      label: "Vendor Rekrutan",
      value: `${summary.recruitedCount} vendor`,
      icon: Store,
      hint: "Mitra yang mendaftar memakai kode Anda.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-hk-charcoal">
            Selamat datang, {summary.displayName}
          </h1>
          <p className="text-xs text-hk-charcoal/70 mt-0.5 font-manrope">
            Pantau performa rekrutmen vendor dan komisi Anda di satu tempat.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-hk-soft-beige/60 text-hk-charcoal text-xs font-semibold border border-hk-champagne/50">
          <Percent className="w-3.5 h-3.5 text-hk-taupe" />
          Komisi Anda: {summary.commissionPct}%
        </span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-hk-champagne/30 shadow-sm p-5 space-y-2"
            >
              <div className="flex items-center justify-between text-xs text-hk-charcoal/70">
                <span className="font-manrope">{card.label}</span>
                <Icon className="w-4 h-4 text-hk-taupe" aria-hidden="true" />
              </div>
              <div
                className={`font-bold text-hk-charcoal ${
                  card.isCode ? "font-mono text-lg tracking-wide" : "font-editorial text-2xl"
                }`}
              >
                {card.value}
              </div>
              <p className="text-[11px] text-hk-charcoal/60 font-manrope leading-snug">
                {card.hint}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            href: ROUTES.BA.VENDOR,
            title: "Vendor Rekrutan",
            desc: "Lihat mitra yang bergabung lewat kode Anda.",
            icon: Store,
          },
          {
            href: ROUTES.BA.KOMISI,
            title: "Riwayat Komisi",
            desc: "Rincian komisi dari setiap order vendor.",
            icon: Coins,
          },
          {
            href: ROUTES.BA.DOMPET,
            title: "Dompet & Penarikan",
            desc: "Ajukan pencairan saldo komisi Anda.",
            icon: Wallet,
          },
        ].map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group bg-white rounded-2xl border border-hk-champagne/30 shadow-sm p-5 flex items-start gap-3 hover:border-hk-champagne transition-colors"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-hk-soft-beige/60 text-hk-taupe">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-editorial text-base font-bold text-hk-charcoal">
                    {link.title}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-hk-taupe transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-hk-charcoal/60 font-manrope mt-0.5">
                  {link.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Referral hint */}
      <div className="rounded-2xl border border-hk-champagne/40 bg-gradient-to-b from-hk-ivory to-white p-5 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-hk-champagne/20 text-hk-taupe">
          <Copy className="w-4 h-4" aria-hidden="true" />
        </span>
        <div className="text-xs text-hk-charcoal/80 font-manrope space-y-1">
          <p className="font-semibold text-hk-charcoal">
            Cara pakai kode referral
          </p>
          <p>
            Bagikan kode <span className="font-mono font-bold text-hk-taupe">{summary.referralCode}</span>{" "}
            kepada calon mitra vendor. Saat mereka mendaftar di halaman{" "}
            <span className="font-semibold">Gabung Mitra Vendor</span> dan mengisi kode tersebut,
            Anda otomatis tercatat sebagai perekrut. Komisi akan cair saat order vendor rekrutan
            tuntas (pelunasan 70%).
          </p>
        </div>
      </div>
    </div>
  );
}
