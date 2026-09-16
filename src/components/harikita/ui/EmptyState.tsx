import React from "react";
import { cn } from "@/lib/utils";
import { Inbox, Search, Sparkles } from "lucide-react";

type EmptyTone = "neutral" | "premium";
type EmptyIcon = "inbox" | "search" | "sparkles";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: EmptyIcon;
  tone?: EmptyTone;
  /** Slot aksi (mis. tombol CTA). */
  action?: React.ReactNode;
  className?: string;
}

const ICON_MAP: Record<EmptyIcon, React.ComponentType<{ className?: string }>> = {
  inbox: Inbox,
  search: Search,
  sparkles: Sparkles,
};

/**
 * EmptyState konsisten untuk semua daftar/koleksi kosong (Phase 7):
 * memberi pesan yang jelas + aksi berikutnya, bukan halaman kosong.
 */
export function EmptyState({
  title,
  description,
  icon = "inbox",
  tone = "neutral",
  action,
  className,
}: EmptyStateProps) {
  const Icon = ICON_MAP[icon];

  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-hk-xl border border-dashed px-6 py-12 text-center",
        tone === "premium"
          ? "border-hk-champagne/60 bg-gradient-to-b from-hk-ivory to-white"
          : "border-hk-soft-beige bg-hk-ivory/40",
        className
      )}
    >
      <span
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full",
          tone === "premium" ? "bg-hk-champagne/20 text-hk-taupe" : "bg-hk-soft-beige/60 text-hk-taupe"
        )}
        aria-hidden="true"
      >
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="font-editorial text-lg font-normal text-hk-charcoal sm:text-xl">{title}</h3>
      {description && (
        <p className="max-w-md font-manrope text-sm leading-relaxed text-hk-charcoal/70">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
