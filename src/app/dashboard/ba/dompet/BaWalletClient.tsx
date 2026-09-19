"use client";

import React, { useState, useTransition } from "react";
import {
  Wallet,
  ArrowDownCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Coins,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { requestWithdrawalAction } from "@/server/actions/ambassador";
import type { getAmbassadorSummary, getAmbassadorWithdrawals } from "@/server/queries/ambassador";

type Summary = NonNullable<Awaited<ReturnType<typeof getAmbassadorSummary>>>;
type Withdrawal = Awaited<ReturnType<typeof getAmbassadorWithdrawals>>[number];

const STATUS_META: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Menunggu Diproses", className: "bg-amber-100 text-amber-800" },
  PAID: { label: "Berhasil Ditransfer", className: "bg-emerald-100 text-emerald-800" },
  REJECTED: { label: "Ditolak", className: "bg-red-100 text-red-800" },
};

export function BaWalletClient({
  summary,
  withdrawals,
}: {
  summary: Summary;
  withdrawals: Withdrawal[];
}) {
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankHolder, setBankHolder] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const parsed = parseInt(amount, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Nominal penarikan harus lebih dari 0.");
      return;
    }
    if (parsed > summary.walletBalance) {
      setError("Nominal melebihi saldo dompet Anda.");
      return;
    }
    startTransition(async () => {
      const res = await requestWithdrawalAction({
        amount: parsed,
        bankName: bankName || undefined,
        bankAccount: bankAccount || undefined,
        bankHolder: bankHolder || undefined,
      });
      if (!res.success) {
        setError(res.message || "Gagal mengajukan penarikan.");
      } else {
        setSuccess("Permohonan penarikan berhasil diajukan. Menunggu verifikasi admin.");
        setAmount("");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-hk-charcoal">
          Dompet & Penarikan Komisi
        </h1>
        <p className="text-xs text-hk-charcoal/70 mt-0.5 font-manrope">
          Pantau saldo komisi Anda dan ajukan pencairan ke rekening bank.
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-hk-champagne/30 shadow-sm p-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-hk-charcoal/70">
            <span>Saldo Siap Ditarik</span>
            <Wallet className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          </div>
          <div className="font-editorial text-3xl font-bold text-hk-charcoal">
            {formatRupiah(summary.walletBalance)}
          </div>
          <p className="text-[11px] text-hk-charcoal/60 font-manrope">
            Saldo dari komisi order vendor rekrutan yang sudah tuntas.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-hk-champagne/30 shadow-sm p-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-hk-charcoal/70">
            <span>Total Komisi Terkumpul</span>
            <Coins className="w-4 h-4 text-hk-taupe" aria-hidden="true" />
          </div>
          <div className="font-editorial text-3xl font-bold text-hk-taupe">
            {formatRupiah(summary.totalCommission)}
          </div>
          <p className="text-[11px] text-hk-charcoal/60 font-manrope">
            Akumulasi seluruh komisi pada tingkat {summary.commissionPct}% per order.
          </p>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="bg-white rounded-2xl border border-hk-champagne/30 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-hk-ivory pb-3">
          <ArrowDownCircle className="w-5 h-5 text-hk-taupe" aria-hidden="true" />
          <h3 className="font-editorial text-base font-bold text-hk-charcoal">
            Formulir Penarikan Dana
          </h3>
        </div>

        <div aria-live="polite" aria-atomic="true" className="space-y-2">
          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              {success}
            </div>
          )}
          {error && (
            <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label htmlFor="wd-amount" className="block text-hk-charcoal font-semibold mb-1">
              Nominal Penarikan (Rp)
            </label>
            <input
              id="wd-amount"
              type="number"
              inputMode="numeric"
              min={1}
              max={summary.walletBalance}
              placeholder="Maksimal saldo siap tarik"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige focus:outline-none focus:border-hk-champagne"
            />
          </div>

          <div>
            <label htmlFor="wd-bank" className="block text-hk-charcoal font-semibold mb-1">
              Nama Bank
            </label>
            <input
              id="wd-bank"
              type="text"
              placeholder="Contoh: BCA"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige focus:outline-none focus:border-hk-champagne"
            />
          </div>

          <div>
            <label htmlFor="wd-account" className="block text-hk-charcoal font-semibold mb-1">
              Nomor Rekening
            </label>
            <input
              id="wd-account"
              type="text"
              placeholder="Contoh: 8277019233"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige focus:outline-none focus:border-hk-champagne"
            />
          </div>

          <div>
            <label htmlFor="wd-holder" className="block text-hk-charcoal font-semibold mb-1">
              Nama Pemilik Rekening
            </label>
            <input
              id="wd-holder"
              type="text"
              placeholder="Sesuai buku tabungan"
              value={bankHolder}
              onChange={(e) => setBankHolder(e.target.value)}
              className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige focus:outline-none focus:border-hk-champagne"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isPending || summary.walletBalance <= 0}
              aria-busy={isPending}
              className="focus-ring w-full py-2.5 px-4 rounded-xl bg-hk-charcoal text-white font-semibold hover:bg-hk-taupe transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-40 min-h-[44px]"
            >
              <Wallet className="w-3.5 h-3.5 text-hk-champagne" aria-hidden="true" />
              {isPending ? "Memproses..." : "Tarik Saldo Sekarang"}
            </button>
          </div>
        </form>
      </div>

      {/* Withdrawal History */}
      <div className="bg-white rounded-2xl border border-hk-champagne/30 shadow-sm p-5 sm:p-6 space-y-4">
        <h3 className="font-editorial text-base font-bold text-hk-charcoal border-b border-hk-ivory pb-3">
          Riwayat Penarikan
        </h3>

        {withdrawals.length === 0 ? (
          <p className="text-xs text-hk-charcoal/60 font-manrope italic py-4 text-center">
            Belum ada riwayat penarikan.
          </p>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((w) => {
              const meta = STATUS_META[w.status] ?? {
                label: w.status,
                className: "bg-hk-soft-beige text-hk-charcoal",
              };
              return (
                <div
                  key={w.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-hk-ivory border border-hk-soft-beige gap-2 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-hk-charcoal">
                        {w.id.slice(0, 12)}
                      </span>
                      <span className="text-hk-charcoal/60">• {w.createdAt}</span>
                    </div>
                    <p className="text-[11px] text-hk-charcoal/60 font-manrope mt-0.5 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-hk-taupe" aria-hidden="true" />
                      Penarikan saldo komisi
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <div className="font-mono font-bold text-sm text-hk-charcoal">
                      {formatRupiah(w.amount)}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded ${meta.className}`}
                    >
                      {w.status === "PENDING" && <Clock className="w-3 h-3" aria-hidden="true" />}
                      {meta.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
