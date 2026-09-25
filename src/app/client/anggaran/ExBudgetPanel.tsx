"use client";

import React, { useState } from "react";
import { Upload, Trash2, FileText } from "lucide-react";
import { DashCard } from "@/components/dashboard";

interface BudgetItem {
  id: string; itemName: string; isExternal: boolean;
  proofs: { id: string; fileUrl: string; fileName: string | null; amount: number | null }[];
}

export function ExBudgetPanel({
  items, isPending,
}: {
  items: BudgetItem[];
  isPending: boolean;
}) {
  const externalItems = items.filter((i) => i.isExternal);
  const [selectedId, setSelectedId] = useState<string>(externalItems[0]?.id ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const effectiveSelectedId = externalItems.some((item) => item.id === selectedId)
      ? selectedId
      : externalItems[0]?.id;
    if (!file || !effectiveSelectedId) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("budgetItemId", effectiveSelectedId);
      const res = await fetch("/api/ex-budget-proof", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal mengunggah.");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(proofId: string) {
    setError(null);
    const res = await fetch("/api/ex-budget-proof", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proofId }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Gagal menghapus bukti.");
      return;
    }
    window.location.reload();
  }

  if (externalItems.length === 0)
    return (
      <DashCard title="Anggaran di Luar Layanan HariKita (ex-)">
        <p className="font-manrope text-sm text-hk-taupe">
          Belum ada pos ex-. Tambahkan pos anggaran dengan centang "DI LUAR layanan HariKita".
        </p>
      </DashCard>
    );

  const selected = externalItems.find((i) => i.id === selectedId) ?? externalItems[0];

  return (
    <DashCard title="Anggaran di Luar Layanan HariKita (ex-)">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="font-manrope text-xs text-hk-charcoal" htmlFor="ex-select">Pilih pos:</label>
          <select
            id="ex-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-xl border border-hk-champagne/60 px-3 py-2 text-sm"
          >
            {externalItems.map((i) => (
              <option key={i.id} value={i.id}>{i.itemName}</option>
            ))}
          </select>
          <label className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-hk-taupe px-4 text-xs font-semibold text-white hover:bg-hk-charcoal ${isPending || uploading ? "opacity-60" : ""}`}>
            <Upload className="h-3.5 w-3.5 text-hk-champagne" />
            {uploading ? "Mengunggah..." : "Unggah Bukti (JPG/PNG/PDF)"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading || isPending}
            />
          </label>
        </div>
        {error && <p role="alert" className="font-manrope text-xs text-red-600">{error}</p>}

        <ul className="divide-y divide-hk-soft-beige">
          {selected.proofs.length === 0 && (
            <li className="py-3 font-manrope text-xs text-hk-taupe">Belum ada bukti untuk pos ini.</li>
          )}
          {selected.proofs.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-3">
              <a
                href={p.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 items-center gap-2 break-all font-manrope text-xs text-hk-charcoal hover:text-hk-taupe"
              >
                <FileText className="h-4 w-4 text-hk-taupe" />
                {p.fileName ?? "Lihat bukti"}
                {p.amount ? ` • Rp ${p.amount.toLocaleString("id-ID")}` : ""}
              </a>
              <button
                onClick={() => handleDelete(p.id)}
                disabled={isPending}
                className="inline-flex h-11 w-11 items-center justify-center text-red-600 hover:text-red-700"
                aria-label="Hapus bukti"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </DashCard>
  );
}
