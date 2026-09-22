import React from "react";

export type DashBadgeTone = "ok" | "warn" | "error" | "info" | "neutral";

const TONE: Record<DashBadgeTone, string> = {
  ok: "bg-[#e5f4ec] text-[#157a4d]",
  warn: "bg-[#fbf0d8] text-[#8a6410]",
  error: "bg-[#fdeceb] text-[#a2352f]",
  info: "bg-[#e6f4fd] text-[#0b6a95]",
  neutral: "bg-hk-ivory text-hk-taupe border border-hk-soft-beige",
};

export function DashBadge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: DashBadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${TONE[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
