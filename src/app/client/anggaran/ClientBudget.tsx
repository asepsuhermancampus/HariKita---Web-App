"use client";

import React, { useMemo, useState, useTransition } from "react";
import { Plus, Trash2, Link2Off } from "lucide-react";
import { DashCard, DashStatCard, DashTable, DashBadge, type DashColumn } from "@/components/dashboard";
import { ExBudgetPanel } from "./ExBudgetPanel";
import {
  addBudgetItem,
  deleteBudgetItem,
  unlinkBudgetItem,
} from "@/server/actions/wedding-planner";
import type { PlannerActionResult } from "@/server/actions/wedding-planner";

interface BudgetItem {
  id: string; category: string; itemName: string; pic: string | null;
  estimatedAmount: number; paidAmount: number; status: string; note: string | null;
  isExternal: boolean; linkMode: string;
  linkedOrderItemId: string | null; linkedOrderLabel: string | null;
  isReadOnly: boolean;
  proofs: { id: string; fileUrl: string; fileName: string | null; amount: number | null }[];
}

const rp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
const statusTone = (s: string): "ok" | "warn" | "neutral" =>
  s === "LUNAS" ? "ok" : s === "BELUM" ? "warn" : "neutral";

export function ClientBudget({
  items,
}: {
  items: BudgetItem[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<PlannerActionResult>, fallback: string) =>
    new Promise<PlannerActionResult>((resolve) => startTransition(async () => {
      const res = await fn();
      const details = Object.values(res.fieldErrors ?? {}).flat().join(" ");
      setError(res.success ? null : [res.error ?? fallback, details].filter(Boolean).join(" "));
      resolve(res);
    }));

  const totals = useMemo(() => {
    const estimated = items.reduce((a, b) => a + b.estimatedAmount, 0);
    const paid = items.reduce((a, b) => a + b.paidAmount, 0);
    return { estimated, paid, remaining: Math.max(0, estimated - paid) };
  }, [items]);

  const columns: DashColumn[] = [
    { key: "cat", header: "Kategori" },
    { key: "item", header: "Item / Layanan" },
    { key: "est", header: "Estimasi", className: "text-right" },
    { key: "paid", header: "Terbayar", className: "text-right" },
    { key: "sisa", header: "Sisa", className: "hidden text-right sm:table-cell" },
    { key: "stat", header: "Status", className: "text-center" },
    { key: "act", header: "", className: "w-12" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <DashStatCard label="Total Estimasi" value={rp(totals.estimated)} />
        <DashStatCard label="Sudah Terbayar" value={rp(totals.paid)} />
        <DashStatCard label="Sisa Kewajiban" value={rp(totals.remaining)} />
      </div>
      {error && (
        <p role="alert" className="font-manrope text-xs text-red-600">
          {error}
        </p>
      )}

      <DashCard title="Rincian Pos Anggaran">
        <DashTable
          columns={columns}
          rows={items}
          empty={<div className="py-8 text-center font-manrope text-sm text-hk-taupe">Belum ada pos anggaran. Tambahkan di bawah.</div>}
          renderRow={(b) => [
            <span key="c" className="font-manrope text-xs font-semibold text-hk-taupe">
              {b.category}
              {b.isExternal && <span className="ml-1 rounded bg-hk-soft-beige px-1.5 py-0.5 text-[10px]">ex-</span>}
            </span>,
            <span key="i" className="text-sm font-medium text-hk-charcoal">
              {b.itemName}
              {b.linkedOrderItemId && (
                <span className="block text-[11px] text-hk-taupe">
                  Terkait: {b.linkedOrderLabel ?? "Pesanan"} ({b.linkMode})
                </span>
              )}
            </span>,
            <span key="e" className="text-right font-manrope text-sm tabular-nums">{rp(b.estimatedAmount)}</span>,
            <span key="p" className="text-right font-manrope text-sm tabular-nums text-emerald-700">{rp(b.paidAmount)}</span>,
            <span key="s" className="hidden text-right font-manrope text-sm tabular-nums text-amber-700 sm:table-cell">
              {rp(Math.max(0, b.estimatedAmount - b.paidAmount))}
            </span>,
            <DashBadge key="st" tone={statusTone(b.status)}>{b.status}</DashBadge>,
            b.isReadOnly ? (
              <span key="a" className="font-manrope text-[10px] text-hk-taupe">Otomatis</span>
            ) : b.linkedOrderItemId ? (
              <button
                key="a"
                onClick={() => run(() => unlinkBudgetItem(b.id), "Gagal melepas tautan pesanan.")}
                disabled={isPending}
                className="inline-flex h-11 w-11 items-center justify-center text-hk-taupe hover:text-hk-charcoal"
                aria-label="Lepas tautan pesanan"
              >
                <Link2Off className="h-4 w-4" />
              </button>
            ) : (
              <button
                key="a"
                onClick={() => run(() => deleteBudgetItem(b.id), "Gagal menghapus pos.")}
                disabled={isPending}
                className="inline-flex h-11 w-11 items-center justify-center text-red-600 hover:text-red-700"
                aria-label="Hapus pos"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ),
          ]}
        />
      </DashCard>

      <ExBudgetPanel items={items} isPending={isPending} />

      <AddBudgetForm
        onAdd={(fd) => run(() => addBudgetItem(fd), "Gagal menambah pos anggaran.")}
        pending={isPending}
      />
    </div>
  );
}

function AddBudgetForm({
  onAdd,
  pending,
}: {
  onAdd: (fd: FormData) => Promise<PlannerActionResult>;
  pending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-full bg-hk-taupe px-5 text-xs font-semibold text-white hover:bg-hk-charcoal"
      >
        <Plus className="h-3.5 w-3.5 text-hk-champagne" /> Tambah Pos Anggaran
      </button>
    );

  return (
    <DashCard
      title="Tambah Pos Anggaran"
      action={
        <button onClick={() => setOpen(false)} className="min-h-11 px-3 font-manrope text-xs text-hk-taupe">
          Tutup
        </button>
      }
    >
      <form action={async (fd) => {
        const res = await onAdd(fd);
        setError(res.success ? null : [res.error, ...Object.values(res.fieldErrors ?? {}).flat()].filter(Boolean).join(" "));
        if (res.success) setOpen(false);
      }} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input aria-label="Kategori anggaran" name="category" required placeholder="Kategori (mis. Mahar)" className="rounded-xl border border-hk-champagne/60 px-3 py-2.5 text-sm" />
        <input aria-label="Nama item atau layanan" name="itemName" required placeholder="Nama item / layanan" className="rounded-xl border border-hk-champagne/60 px-3 py-2.5 text-sm" />
        <input aria-label="Estimasi rupiah" name="estimatedAmount" type="number" min={0} required placeholder="Estimasi (Rp)" className="rounded-xl border border-hk-champagne/60 px-3 py-2.5 text-sm" />
        <input aria-label="Terbayar rupiah" name="paidAmount" type="number" min={0} defaultValue={0} placeholder="Terbayar (Rp)" className="rounded-xl border border-hk-champagne/60 px-3 py-2.5 text-sm" />
        <input aria-label="PIC atau vendor" name="pic" placeholder="PIC / Vendor (opsional)" className="rounded-xl border border-hk-champagne/60 px-3 py-2.5 text-sm" />
        <select aria-label="Status pembayaran" name="status" className="rounded-xl border border-hk-champagne/60 px-3 py-2.5 text-sm" defaultValue="BELUM">
          <option value="BELUM">Belum Bayar</option>
          <option value="DP">DP (Sebagian)</option>
          <option value="LUNAS">Lunas</option>
          <option value="SIAPKAN">Siapkan Tunai</option>
        </select>
        <p className="font-manrope text-xs text-hk-charcoal sm:col-span-2">
          Pos manual ditandai ex- dan dapat dilengkapi bukti pembayaran.
        </p>
        <input type="hidden" name="isExternal" value="true" />
        <input type="hidden" name="linkMode" value="MANUAL" />
        {error && <p role="alert" className="font-manrope text-xs text-red-600 sm:col-span-2">{error}</p>}
        <button type="submit" disabled={pending} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-hk-charcoal px-5 text-xs font-semibold text-white sm:col-span-2">
          Simpan Pos Anggaran
        </button>
      </form>
    </DashCard>
  );
}
