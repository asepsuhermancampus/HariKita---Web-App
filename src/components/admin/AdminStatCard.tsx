import React from "react";

const DELTA: Record<string, string> = {
  ok: "text-[#157a4d]",
  warn: "text-[#8a6410]",
  error: "text-[#a2352f]",
};

export function AdminStatCard({
  label,
  value,
  delta,
  deltaTone = "ok",
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "ok" | "warn" | "error";
}) {
  return (
    <div className="rounded-2xl border border-hk-soft-beige bg-white p-5 shadow-xs">
      <div className="text-[11px] font-bold uppercase tracking-wide text-plum-light">{label}</div>
      <div className="mt-1.5 text-2xl font-extrabold text-hk-charcoal">{value}</div>
      {delta && <div className={`mt-1 text-[11px] font-bold ${DELTA[deltaTone]}`}>{delta}</div>}
    </div>
  );
}
