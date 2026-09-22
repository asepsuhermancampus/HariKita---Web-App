"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  ArrowDownCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { DashPageHeader } from "@/components/dashboard";

export default function VendorDompetPage() {
  const [readyBalance, setReadyBalance] = useState(4900000);
  const [escrowLockedBalance, setEscrowLockedBalance] = useState(3150000);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);

  const transactions = [
    {
      id: "WD-KBM-002",
      type: "WITHDRAWAL",
      amount: 3500000,
      date: "10 September 2026",
      bank: "BCA (Rek. 8277-0192-33)",
      status: "COMPLETED",
      statusLabel: "Berhasil Ditransfer",
    },
    {
      id: "ESC-REL-008",
      type: "ESCROW_RELEASE_70",
      amount: 2450000,
      date: "14 September 2026",
      bank: "Pelunasan 70% Acara Lamaran Gombong",
      status: "COMPLETED",
      statusLabel: "Masuk ke Saldo Siap Tarik",
    },
    {
      id: "ESC-HLD-012",
      type: "ESCROW_HOLD_30",
      amount: 1050000,
      date: "18 Oktober 2026",
      bank: "DP 30% HKB-2026-001 (Rilis H-3: 15 Okt)",
      status: "LOCKED",
      statusLabel: "Tertahan di Escrow",
    },
  ];

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(withdrawAmount);
    if (val > 0 && val <= readyBalance) {
      setReadyBalance((prev) => prev - val);
      setIsSuccessMessage(true);
      setWithdrawAmount("");
      setTimeout(() => setIsSuccessMessage(false), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DashPageHeader
        title="Dompet Saldo & Penarikan Dana"
        description="Pantau jadwal rilis dana rekening bersama (H-3 operasional & H+2 sukses) serta ajukan pencairan ke rekening Anda."
        action={
          <span className="flex items-center gap-1.5 rounded-xl border border-[#bfe6d1] bg-[#e5f4ec] px-3 py-1.5 text-xs font-semibold text-[#157a4d]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Escrow Protection Active
          </span>
        }
      />
      <div className="space-y-6">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Saldo Siap Tarik */}
          <div className="bg-white rounded-2xl border border-[#C5A880]/30 shadow-sm p-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#6B5E62]">
              <span>Saldo Siap Ditarik</span>
              <Wallet className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-serif text-3xl font-bold text-[#4A2E35]">
              {formatRupiah(readyBalance)}
            </div>
            <p className="text-[11px] text-[#6B5E62]">
              Dana dari acara yang telah tuntas atau DP H-3 yang sudah terotorisasi.
            </p>
          </div>

          {/* Dana Tertahan Escrow */}
          <div className="bg-white rounded-2xl border border-[#C5A880]/30 shadow-sm p-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#6B5E62]">
              <span>Dana Tertahan di Escrow</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="font-serif text-3xl font-bold text-[#C5A880]">
              {formatRupiah(escrowLockedBalance)}
            </div>
            <p className="text-[11px] text-[#6B5E62]">
              Terjadwal rilis: 30% pada H-3 acara & 70% pada H+2 setelah klien verifikasi sukses.
            </p>
          </div>
        </div>

        {/* Withdrawal Form Card */}
        <div className="bg-white rounded-2xl border border-[#C5A880]/30 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#FAF8F5] pb-3">
            <ArrowDownCircle className="w-5 h-5 text-[#C5A880]" />
            <h3 className="font-serif text-base font-bold text-[#4A2E35]">
              Formulir Penarikan Dana Payout (Transfer Bank)
            </h3>
          </div>

          {isSuccessMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Permohonan penarikan dana berhasil diajukan! Dana akan ditransfer dalam 1x24 jam kerja.
            </div>
          )}

          <form onSubmit={handleWithdraw} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[#4A2E35] font-semibold mb-1">
                Rekening Tujuan:
              </label>
              <select className="w-full p-2.5 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880]">
                <option>BCA - 8277019233 a.n Menganti Studio</option>
                <option>Mandiri - 139002819233 a.n Menganti Studio</option>
                <option>BRI - 00392182938123 a.n Menganti Studio</option>
              </select>
            </div>

            <div>
              <label className="block text-[#4A2E35] font-semibold mb-1">
                Nominal Penarikan (Rp):
              </label>
              <input
                type="number"
                placeholder="Maksimal saldo siap tarik"
                value={withdrawAmount}
                max={readyBalance}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={readyBalance <= 0}
                className="w-full py-2.5 px-4 rounded-xl bg-[#4A2E35] text-white font-semibold hover:bg-[#6B5E62] transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-40"
              >
                <Wallet className="w-3.5 h-3.5 text-[#C5A880]" />
                Tarik Saldo Sekarang
              </button>
            </div>
          </form>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-2xl border border-[#C5A880]/30 shadow-sm p-5 sm:p-6 space-y-4">
          <h3 className="font-serif text-base font-bold text-[#4A2E35] border-b border-[#FAF8F5] pb-3">
            Riwayat Mutasi & Rilis Escrow
          </h3>

          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5D7C7] gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-[#4A2E35]">
                      {tx.id}
                    </span>
                    <span className="text-[#6B5E62]">• {tx.date}</span>
                  </div>
                  <p className="text-xs text-[#4A2E35] font-medium mt-0.5">
                    {tx.bank}
                  </p>
                </div>

                <div className="sm:text-right">
                  <div className="font-mono font-bold text-sm text-[#4A2E35]">
                    {formatRupiah(tx.amount)}
                  </div>
                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${
                      tx.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {tx.statusLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
