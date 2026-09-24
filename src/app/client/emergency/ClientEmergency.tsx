"use client";

import React, { useTransition, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { DashCard } from "@/components/dashboard";
import { toggleEmergencyItem, addEmergencyItem, deleteEmergencyItem } from "@/server/actions/wedding-planner";

export function ClientEmergency({
  items,
}: {
  items: { id: string; itemText: string; isPacked: boolean }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [newItem, setNewItem] = useState("");

  const packed = items.filter((i) => i.isPacked).length;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <DashCard title={`Checklist Tas Darurat (${packed}/${items.length})`}>
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-hk-ivory">
              <input
                type="checkbox"
                checked={it.isPacked}
                disabled={isPending}
                onChange={(e) => startTransition(() => void toggleEmergencyItem(it.id, e.target.checked))}
                className="h-5 w-5 cursor-pointer rounded border-hk-champagne text-hk-taupe"
                aria-label={`Tandai ${it.itemText}`}
              />
              <span className={it.isPacked ? "text-sm text-hk-charcoal/50 line-through" : "font-manrope text-sm text-hk-charcoal"}>
                {it.itemText}
              </span>
              <button
                onClick={() => startTransition(() => void deleteEmergencyItem(it.id))}
                disabled={isPending}
                className="ml-auto text-red-600 hover:text-red-700"
                aria-label="Hapus item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>

        <form
          action={(fd) => {
            startTransition(() => void addEmergencyItem(fd));
            setNewItem("");
          }}
          className="mt-4 flex items-center gap-2"
        >
          <input
            name="itemText"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Tambah item..."
            className="flex-1 rounded-xl border border-hk-champagne/60 px-3 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={isPending || !newItem.trim()}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-hk-taupe px-4 text-xs font-semibold text-white hover:bg-hk-charcoal"
          >
            <Plus className="h-3.5 w-3.5 text-hk-champagne" /> Tambah
          </button>
        </form>
      </DashCard>

      <div className="flex flex-col gap-4">
        <RoleCard color="taupe" title="1. PIC Kotak Angpao & Kunci Gembok" desc="Pegang kunci gembok dan amankan kotak ke bagasi mobil terkunci setelah acara usai." />
        <RoleCard color="champagne" title="2. PIC Mahar & Cincin Kawin" desc="Menjaga fisik logam mulia dan cincin sampai diletakkan di meja akad di depan penghulu." />
        <RoleCard color="beige" title="3. PIC Katering & Makanan Sisa" desc="Mengontrol refill piring dan mengawal pembungkusan sisa makanan katering keluarga." />
      </div>
    </div>
  );
}

function RoleCard({ title, desc, color }: { title: string; desc: string; color: "taupe" | "champagne" | "beige" }) {
  const border = color === "taupe" ? "border-hk-taupe/40" : color === "champagne" ? "border-hk-champagne/60" : "border-hk-soft-beige";
  return (
    <div className={`rounded-2xl border bg-white p-5 ${border}`}>
      <div className="font-editorial text-lg font-medium text-hk-charcoal">{title}</div>
      <p className="mt-1 font-manrope text-xs leading-relaxed text-hk-charcoal/80">{desc}</p>
    </div>
  );
}
