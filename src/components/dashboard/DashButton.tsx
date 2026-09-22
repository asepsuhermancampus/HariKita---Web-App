import React from "react";

export type DashButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export interface DashButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: DashButtonVariant;
  size?: "sm" | "md";
}

const VARIANT: Record<DashButtonVariant, string> = {
  primary: "bg-hk-taupe text-white hover:bg-hk-charcoal border-transparent",
  secondary: "bg-white text-hk-charcoal border-hk-soft-beige hover:bg-hk-ivory",
  danger: "bg-white text-[#a2352f] border-[#f3c9c6] hover:bg-[#fdf2f1]",
  ghost: "bg-transparent text-hk-charcoal border-transparent hover:bg-hk-ivory",
};

export function DashButton({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: DashButtonProps) {
  const sizing = size === "sm" ? "px-3.5 min-h-9 text-xs" : "px-5 min-h-11 text-sm";
  return (
    <button
      {...props}
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-full border font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${sizing} ${VARIANT[variant]} ${className}`}
    />
  );
}
