import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

export type AlertVariant = "info" | "success" | "warning" | "error";

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  /** Aksi opsional di sisi kanan (mis. tombol tutup / retry). */
  action?: React.ReactNode;
  className?: string;
  /**
   * Bila true (default untuk error/warning) pesan diumumkan segera ke pembaca
   * layar via role="alert". Untuk info/success gunakan aria-live="polite".
   */
  assertive?: boolean;
}

const VARIANT_STYLES: Record<
  AlertVariant,
  { wrapper: string; icon: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  info: {
    wrapper: "border-sky-200 bg-sky-50 text-sky-900",
    icon: "text-sky-500",
    Icon: Info,
  },
  success: {
    wrapper: "border-emerald-200 bg-emerald-50 text-emerald-900",
    icon: "text-emerald-500",
    Icon: CheckCircle2,
  },
  warning: {
    wrapper: "border-amber-200 bg-amber-50 text-amber-900",
    icon: "text-amber-500",
    Icon: TriangleAlert,
  },
  error: {
    wrapper: "border-rose-200 bg-rose-50 text-rose-900",
    icon: "text-rose-500",
    Icon: AlertCircle,
  },
};

/**
 * Alert / InlineAlert accessible (Phase 7).
 * - error & warning: role="alert" (assertive) agar langsung diumumkan.
 * - info & success: aria-live="polite".
 * Warna dipilih agar memenuhi kontras AA pada latar terang.
 */
export function Alert({
  variant = "info",
  title,
  children,
  action,
  className,
  assertive,
}: AlertProps) {
  const { wrapper, icon, Icon } = VARIANT_STYLES[variant];
  const isAssertive = assertive ?? (variant === "error" || variant === "warning");

  return (
    <div
      role={isAssertive ? "alert" : "status"}
      aria-live={isAssertive ? "assertive" : "polite"}
      className={cn(
        "flex items-start gap-3 rounded-hk-lg border px-4 py-3 font-manrope text-sm",
        wrapper,
        className
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", icon)} aria-hidden="true" />
      <div className="flex-1 space-y-0.5">
        {title && <p className="font-semibold leading-tight">{title}</p>}
        <div className="leading-relaxed opacity-90">{children}</div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
