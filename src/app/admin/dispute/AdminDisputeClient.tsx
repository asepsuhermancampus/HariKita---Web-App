"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  MessageCircle,
  Filter,
} from "lucide-react";
import { resolveDisputeAction, reviewDisputeAction } from "@/server/actions/admin";
import type { DisputeAdminDTO } from "@/server/queries/admin";

/**
 * Resolution Center (client) — daftar sengketa multi-order untuk Super Admin.
 */
export function AdminDisputeClient({ dbDisputes }: { dbDisputes: DisputeAdminDTO[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED">("OPEN");
  const [message, setMessage] = useState<string | null>(null);
  const [resolutionInput, setResolutionInput] = useState<Record<string, string>>({});

  const filtered = dbDisputes.filter((d) => filter === "ALL" || d.status === filter);

  const handleReview = (id: string) => {
    setMessage(null);
    startTransition(async () => {
      const res = await reviewDisputeAction({ disputeId: id });
      if (!res.success) setMessage(res.message || "Gagal menandai review.");
      else router.refresh();
    });
  };

  const handleResolve = (id: string, approved: boolean) => {
    const resolution = resolutionInput[id]?.trim();
    if (!resolution) {
      setMessage("Isi catatan resolusi terlebih dahulu.");
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const res = await resolveDisputeAction({ disputeId: id, approved, resolution });
      if (!res.success) setMessage(res.message || "Gagal menyelesaikan sengketa.");
      else router.refresh();
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#4A2E35] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs text-[#6B5E62] flex items-center gap-1 mb-1">
              <Link href="/admin" className="hover:text-[#4A2E35]">Super Admin</Link>
              <span>/</span>
              <span className="text-[#4A2E35] font-medium">Resolution Center</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A2E35]">
              Pusat Penyelesaian Sengketa
            </h1>
            <p className="text-xs text-[#6B5E62] mt-0.5">
              Tinjau sengketa klien/vendor, putuskan penyelesaian, dan arahkan refund melalui mekanisme escrow.
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white border border-[#C5A880] text-xs font-semibold shadow-2xs">
            Sengketa Aktif:{" "}
            <strong className="text-amber-700">
              {dbDisputes.filter((d) => ["OPEN", "UNDER_REVIEW"].includes(d.status)).length}
            </strong>
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-[#C5A880]/30 shadow-sm">
          <Filter className="w-4 h-4 text-[#C5A880]" aria-hidden="true" />
          <span className="sr-only" id="dispute-filter-label">Filter status sengketa</span>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-labelledby="dispute-filter-label">
            {(["OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED", "ALL"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`focus-ring px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[36px] ${
                  filter === f ? "bg-[#4A2E35] text-white" : "text-[#6B5E62] hover:text-[#4A2E35]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div aria-live="polite" aria-atomic="true">
          {message && (
            <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <AlertTriangle className="w-4 h-4" aria-hidden="true" /> <span>{message}</span>
            </div>
          )}
        </div>

        {/* List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-[#C5A880]/30 text-center text-[#6B5E62] text-xs italic">
              Tidak ada sengketa pada filter ini.
            </div>
          ) : (
            filtered.map((d) => {
              const isFinal = ["RESOLVED", "REJECTED", "CLOSED"].includes(d.status);
              return (
                <div key={d.id} className="bg-white rounded-2xl border border-[#C5A880]/30 shadow-sm p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#FAF8F5]">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[#FAF8F5] border border-[#E5D7C7]">
                        {d.orderNumber}
                      </span>
                      <span className="text-xs text-[#6B5E62]">{d.clientName}</span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        d.status === "OPEN"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : d.status === "UNDER_REVIEW"
                          ? "bg-blue-50 text-blue-800 border border-blue-200"
                          : d.status === "RESOLVED"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                      {d.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[#6B5E62] block text-[11px]">Alasan:</span>
                      <strong className="text-[#4A2E35]">{d.reason}</strong>
                    </div>
                    <div>
                      <span className="text-[#6B5E62] block text-[11px]">Nilai Order:</span>
                      <strong className="font-mono text-[#4A2E35]">Rp {d.totalAmount.toLocaleString("id-ID")}</strong>
                    </div>
                    <div>
                      <span className="text-[#6B5E62] block text-[11px]">Status Order:</span>
                      <strong className="text-[#4A2E35]">{d.orderStatus}</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5D7C7] text-xs text-[#6B5E62]">
                    <strong className="text-[#4A2E35] block mb-0.5">Deskripsi:</strong>
                    {d.description}
                  </div>

                  {d.resolution && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                      <strong className="block mb-0.5">Resolusi:</strong>
                      {d.resolution}
                    </div>
                  )}

                  {!isFinal && (
                    <div className="space-y-3 pt-2 border-t border-[#FAF8F5]">
                      <label htmlFor={`resolution-${d.id}`} className="sr-only">
                        Catatan resolusi untuk order {d.orderNumber}
                      </label>
                      <textarea
                        id={`resolution-${d.id}`}
                        rows={2}
                        value={resolutionInput[d.id] ?? ""}
                        onChange={(e) => setResolutionInput((p) => ({ ...p, [d.id]: e.target.value }))}
                        placeholder="Catatan resolusi (wajib sebelum memutuskan)..."
                        className="focus-ring w-full p-2.5 rounded-xl border border-[#E5D7C7] text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                      <div className="flex flex-wrap justify-end gap-2">
                        {d.status === "OPEN" && (
                          <button
                            onClick={() => handleReview(d.id)}
                            disabled={isPending}
                            aria-busy={isPending}
                            className="focus-ring px-3.5 py-2 rounded-xl border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-semibold disabled:opacity-50 min-h-[44px]"
                          >
                            Tinjau
                          </button>
                        )}
                        <button
                          onClick={() => handleResolve(d.id, false)}
                          disabled={isPending}
                          aria-busy={isPending}
                          className="focus-ring px-3.5 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 min-h-[44px]"
                        >
                          <XCircle className="w-3.5 h-3.5" aria-hidden="true" /> Tolak (kembali operasional)
                        </button>
                        <button
                          onClick={() => handleResolve(d.id, true)}
                          disabled={isPending}
                          aria-busy={isPending}
                          className="focus-ring px-4 py-2 rounded-xl bg-[#4A2E35] text-white hover:bg-[#6B5E62] text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 min-h-[44px]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A880]" aria-hidden="true" /> Setujui (arahkan refund)
                        </button>
                      </div>
                    </div>
                  )}

                  {isFinal && (
                    <div className="text-xs text-[#6B5E62] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#C5A880]" aria-hidden="true" />
                    Sengketa selesai — {d.status}.
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-[11px] text-[#6B5E62]">
                  <MessageCircle className="w-3.5 h-3.5 text-[#C5A880]" aria-hidden="true" />
                  <Link href={`/admin/escrow`} className="focus-ring rounded hover:underline">
                    Buka Otorisasi Escrow
                  </Link>
                </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
