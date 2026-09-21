"use client";

import { useState } from "react";
import { updatePlatformSettingsAction } from "@/server/actions/platform-settings";
import type { PlatformSettingsView } from "@/server/services/platform-settings-service";

export function AdminPengaturanClient({ initial }: { initial: PlatformSettingsView }) {
  const [dpPct, setDpPct] = useState(initial.dpPct);
  const [settlementPct, setSettlementPct] = useState(initial.settlementPct);
  const [platformFeePct, setPlatformFeePct] = useState(initial.platformFeePct);
  const [defaultBaCommissionPct, setDefaultBaCommissionPct] = useState(
    initial.defaultBaCommissionPct
  );
  const [components, setComponents] = useState(initial.components);
  const [msg, setMsg] = useState<string | null>(null);

  const total = components.reduce((a, c) => a + c.pct, 0);

  async function save() {
    setMsg(null);
    const res = await updatePlatformSettingsAction({
      dpPct,
      settlementPct,
      platformFeePct,
      defaultBaCommissionPct,
      components: components.map((c, i) => ({
        id: c.id,
        label: c.label,
        pct: c.pct,
        sortOrder: i,
      })),
    });
    if (res.success) setMsg("Tersimpan.");
    else setMsg(res.message);
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-hk-charcoal">Pengaturan Platform</h1>

      <section className="space-y-3">
        <label className="block text-sm">
          DP %{" "}
          <input
            type="number"
            min={0}
            max={100}
            value={dpPct}
            onChange={(e) => setDpPct(Number(e.target.value))}
            className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige min-h-11"
          />
        </label>
        <label className="block text-sm">
          Pelunasan %{" "}
          <input
            type="number"
            min={0}
            max={100}
            value={settlementPct}
            onChange={(e) => setSettlementPct(Number(e.target.value))}
            className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige min-h-11"
          />
        </label>
        <label className="block text-sm">
          Platform Fee %{" "}
          <input
            type="number"
            min={0}
            max={100}
            value={platformFeePct}
            onChange={(e) => setPlatformFeePct(Number(e.target.value))}
            className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige min-h-11"
          />
        </label>
        <label className="block text-sm">
          Default Komisi BA %{" "}
          <input
            type="number"
            min={0}
            max={100}
            value={defaultBaCommissionPct}
            onChange={(e) => setDefaultBaCommissionPct(Number(e.target.value))}
            className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige min-h-11"
          />
        </label>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">
          Rincian Platform Fee — total {total}% (harus = {platformFeePct}%)
        </h2>
        {components.map((c, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              value={c.label}
              onChange={(e) =>
                setComponents(
                  components.map((x, j) => (j === i ? { ...x, label: e.target.value } : x))
                )
              }
              placeholder="Nama komponen"
              className="focus-ring flex-1 p-2.5 rounded-xl border border-hk-soft-beige min-h-11"
            />
            <input
              type="number"
              min={0}
              max={100}
              value={c.pct}
              onChange={(e) =>
                setComponents(
                  components.map((x, j) => (j === i ? { ...x, pct: Number(e.target.value) } : x))
                )
              }
              className="focus-ring w-20 p-2.5 rounded-xl border border-hk-soft-beige min-h-11"
            />
            <button
              type="button"
              onClick={() => setComponents(components.filter((_, j) => j !== i))}
              className="focus-ring px-3 min-h-11 rounded-xl border border-hk-soft-beige"
            >
              Hapus
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setComponents([
              ...components,
              { id: "", label: "", pct: 0, sortOrder: components.length },
            ])
          }
          className="focus-ring px-4 min-h-11 rounded-xl border border-hk-gold"
        >
          + Tambah Komponen
        </button>
      </section>

      {msg && (
        <div role="status" className="text-sm">
          {msg}
        </div>
      )}
      <button
        type="button"
        onClick={save}
        className="focus-ring px-5 min-h-11 rounded-xl bg-hk-gold text-white"
      >
        Simpan
      </button>
    </div>
  );
}
