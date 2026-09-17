"use client";

import React, { useMemo, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export interface SparkBarItem {
  label: string;
  value: number;
  tooltip?: string;
}

export interface DashboardSparkBarCardProps {
  title: string;
  value: string;
  actionLabel?: string;
  onActionClick?: () => void;
  delta: {
    direction: "up" | "down";
    percentage: string;
    comparison: string;
  };
  bars: SparkBarItem[];
  barTone?: "emerald" | "amber" | "taupe";
  className?: string;
}

export function DashboardSparkBarCard({
  title,
  value,
  actionLabel = "Lihat Semua",
  onActionClick,
  delta,
  bars,
  barTone = "emerald",
  className = "",
}: DashboardSparkBarCardProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = useMemo(() => {
    if (!bars || bars.length === 0) return 100;
    const max = Math.max(...bars.map((b) => b.value));
    return max > 0 ? max : 100;
  }, [bars]);

  // Color configurations matching reference image
  const toneStyles = {
    emerald: {
      bar: "bg-[#10B981] hover:bg-[#059669]",
      barActive: "bg-[#059669]",
      deltaText: "text-emerald-700",
      deltaBg: "bg-emerald-50 border-emerald-200",
      icon: ArrowUpRight,
    },
    amber: {
      bar: "bg-[#F59E0B] hover:bg-[#D97706]",
      barActive: "bg-[#D97706]",
      deltaText: "text-amber-800",
      deltaBg: "bg-amber-50 border-amber-200",
      icon: ArrowUpRight,
    },
    taupe: {
      bar: "bg-[#88735B] hover:bg-[#6E5B45]",
      barActive: "bg-[#6E5B45]",
      deltaText: "text-hk-taupe",
      deltaBg: "bg-hk-soft-beige/70 border-hk-champagne/40",
      icon: ArrowUpRight,
    },
  }[barTone];

  const DeltaIcon = delta.direction === "up" ? ArrowUpRight : ArrowDownRight;

  return (
    <div
      className={`bg-white rounded-3xl p-6 sm:p-7 border border-hk-champagne/40 shadow-xs flex flex-col justify-between transition-all ${className}`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="font-manrope font-medium text-xs sm:text-sm text-hk-charcoal/70 tracking-tight">
          {title}
        </h3>
        {actionLabel && (
          <button
            onClick={onActionClick}
            className="text-xs font-manrope font-medium text-hk-charcoal/60 hover:text-hk-taupe transition-colors px-2 py-1 rounded-lg hover:bg-hk-ivory"
          >
            {actionLabel}
          </button>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="my-2">
        <div className="font-manrope font-bold text-2xl sm:text-3xl text-hk-charcoal tracking-tight tabular-nums">
          {value}
        </div>

        {/* Delta Percentage Subtitle */}
        <div className="flex items-center gap-1.5 mt-1 font-manrope text-xs">
          <span
            className={`inline-flex items-center gap-0.5 font-bold ${
              delta.direction === "up" ? "text-emerald-700" : "text-rose-600"
            }`}
          >
            <DeltaIcon className="w-3.5 h-3.5" />
            {delta.percentage}
          </span>
          <span className="text-muted-foreground text-[11px] font-medium">{delta.comparison}</span>
        </div>
      </div>

      {/* 6 to 7 Vertical Rounded Micro Bars */}
      <div className="relative pt-6 pb-1">
        <div className="h-20 sm:h-24 flex items-end justify-between gap-2 px-1">
          {bars.map((bar, i) => {
            const heightPct = Math.max(16, Math.round((bar.value / maxVal) * 100));
            const isHovered = hoveredIdx === i;

            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Micro Tooltip */}
                {isHovered && (
                  <div className="absolute -top-7 px-2 py-0.5 bg-hk-charcoal text-white text-[10px] font-manrope font-semibold rounded-md shadow-md whitespace-nowrap z-20 pointer-events-none animate-in fade-in-50">
                    {bar.tooltip || `${bar.label}: ${bar.value}`}
                  </div>
                )}

                {/* Rounded Bar Pill */}
                <div
                  className={`w-full max-w-[22px] rounded-full transition-all duration-300 ${
                    isHovered ? toneStyles.barActive : toneStyles.bar
                  }`}
                  style={{
                    height: `${heightPct}%`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
