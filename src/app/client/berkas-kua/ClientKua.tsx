"use client";

import React, { useMemo, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { DashCard, DashTable, DashStatCard, type DashColumn } from "@/components/dashboard";
import { toggleKuaDone, toggleKuaActive, addCustomKua, deleteKua } from "@/server/actions/wedding-planner";

interface Kua {
  id: string; category: string; docName: string; party: string | null;
  docFormat: string | null; institution: string | null; note: string | null;
  isRequired: boolean; isActive: boolean; isDone: boolean; isCustom: boolean;
}

export function ClientKua({ requirements, flow }: { requirements: Kua[]; flow: { n: string; d: string }[] }) {
  const [isPending, startTransition] = useTransition();

  const required = useMemo(() => requirements.filter((r) => r.isRequired), [requirements]);
  const optional = useMemo(() => requirements.filter((r) => !r.isRequired), [requirements]);
  const doneRequired = required.filter((r) => r.isDone).length;

  const reqColumns: DashColumn[] = [
    { key: "done", header: "Check", className: "w-14 text-center" },
    { key: "cat", header: "Kategori", className: "hidden sm:table-cell" },
    { key: "doc", header: "Nama Berkas" },
    { key: "inst", header: "Instansi", className: "hidden md:table-cell" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashCard title="Alur 8 Langkah Pendaftaran KUA">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {flow.map((f, i) => (
            <div
              key={f.n}
              className={`rounded-xl border p-3 text-center ${i === 7 ? "border-hk-taupe bg-hk-soft-beige/40" : "border-hk-champagne/40"}`}
            >
              <div className="font-manrope text-xs font-bold text-hk-taupe">{f.n}</div>
              <div className="mt-0.5 font-manrope text-[10px] text-hk-charcoal/70">{f.d}</div>
            </div>
          ))}
        </div>
      </DashCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DashStatCard label="Berkas Wajib Selesai" value={`${doneRequired} / ${required.length}`} />
        <DashStatCard label="Berkas Opsional Aktif" value={String(optional.filter((o) => o.isActive).length)} />
      </div>

      <DashCard title="Berkas Utama Calon Mempelai">
        <DashTable
          columns={reqColumns}
          rows={required}
          renderRow={(k) => [
            <input
              key="d"
              type="checkbox"
              checked={k.isDone}
              disabled={isPending}
              onChange={(e) => startTransition(() => void toggleKuaDone(k.id, e.target.checked))}
              className="h-5 w-5 cursor-pointer rounded border-hk-champagne text-hk-taupe"
              aria-label={`Tandai ${k.docName}`}
            />,
            <span key="c" className="font-manrope text-xs text-hk-taupe">{k.category}</span>,
            <span key="n" className={k.isDone ? "text-sm text-hk-charcoal/50 line-through" : "text-sm font-medium text-hk-charcoal"}>
              {k.docName}
              {k.note && <span className="block text-[11px] text-hk-taupe">{k.note}</span>}
            </span>,
            <span key="i" className="font-manrope text-xs text-hk-charcoal/70">{k.institution ?? "-"}</span>,
          ]}
        />
      </DashCard>

      <DashCard
        title="Berkas Tambahan / Khusus (Opsional)"
        action={<AddKuaButton onAdd={(fd) => startTransition(() => void addCustomKua(fd))} />}
      >
        <DashTable
          columns={[
            { key: "active", header: "Gunakan", className: "w-16 text-center" },
            { key: "doc", header: "Nama Berkas" },
            { key: "inst", header: "Instansi", className: "hidden sm:table-cell" },
            { key: "act", header: "", className: "w-12" },
          ]}
          rows={optional}
          empty={<div className="py-6 text-center font-manrope text-sm text-hk-taupe">Belum ada berkas opsional.</div>}
          renderRow={(k) => [
            <input
              key="a"
              type="checkbox"
              checked={k.isActive}
              disabled={isPending}
              onChange={(e) => startTransition(() => void toggleKuaActive(k.id, e.target.checked))}
              className="h-5 w-5 cursor-pointer rounded border-hk-champagne text-hk-taupe"
              aria-label={`Aktifkan ${k.docName}`}
            />,
            <span key="n" className="text-sm font-medium text-hk-charcoal">
              {k.docName}
              {k.note && <span className="block text-[11px] text-hk-taupe">{k.note}</span>}
            </span>,
            <span key="i" className="font-manrope text-xs text-hk-charcoal/70">{k.institution ?? "-"}</span>,
            k.isCustom ? (
              <button
                key="x"
                onClick={() => startTransition(() => void deleteKua(k.id))}
                disabled={isPending}
                className="text-red-600 hover:text-red-700"
                aria-label="Hapus berkas"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : (
              <span key="x" />
            ),
          ]}
        />
      </DashCard>
    </div>
  );
}

function AddKuaButton({ onAdd }: { onAdd: (fd: FormData) => void }) {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-hk-taupe px-4 text-xs font-semibold text-white hover:bg-hk-charcoal"
      >
        <Plus className="h-3.5 w-3.5 text-hk-champagne" /> Tambah Berkas
      </button>
    );
  return (
    <form
      action={(fd) => {
        onAdd(fd);
        setOpen(false);
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <input name="docName" required placeholder="Nama berkas" className="rounded-xl border border-hk-champagne/60 px-3 py-2 text-xs" />
      <input name="institution" placeholder="Instansi" className="rounded-xl border border-hk-champagne/60 px-3 py-2 text-xs" />
      <input name="note" placeholder="Catatan" className="rounded-xl border border-hk-champagne/60 px-3 py-2 text-xs" />
      <button type="submit" className="min-h-11 rounded-full bg-hk-charcoal px-4 text-xs font-semibold text-white">Simpan</button>
      <button type="button" onClick={() => setOpen(false)} className="min-h-11 font-manrope text-xs text-hk-taupe">Batal</button>
    </form>
  );
}
