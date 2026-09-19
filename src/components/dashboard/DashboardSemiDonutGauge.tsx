"use client";

import React, { useMemo } from "react";
import { formatCompactNumber, calculateSvgArcPath } from "./dashboard-utils";

export interface GaugeSegment {
  label: string;
  sublabel?: string;
  value: number;
  color: string; // Hex color code or CSS color
}

export interface DashboardSemiDonutGaugeProps {
  title: string;
  actionLabel?: string;
  onActionClick?: () => void;
  totalLabel?: string;
  segments: [GaugeSegment, GaugeSegment];
  className?: string;
}

export function DashboardSemiDonutGauge({
  title,
  actionLabel = "Lihat Semua",
  onActionClick,
  totalLabel = "Total",
  segments,
  className = "",
}: DashboardSemiDonutGaugeProps) {
  const [seg1, seg2] = segments;
  const total = useMemo(() => Math.max(1, seg1.value + seg2.value), [seg1.value, seg2.value]);

  // Geometry parameters
  const cx = 130;
  const cy = 130;
  const r = 90;
  const strokeWidth = 20;

  // Arc angles: Semi circle spans from 180° (left) to 360° (right)
  // Segment 1 ratio
  const ratio1 = Math.min(1, Math.max(0, seg1.value / total));
  const spanDeg1 = ratio1 * 180;
  const gap = 4; // subtle gap in degrees between segments for crisp separation

  const seg1Start = 180;
  const seg1End = Math.max(180, 180 + spanDeg1 - (spanDeg1 > gap ? gap / 2 : 0));

  const seg2Start = Math.min(360, 180 + spanDeg1 + (spanDeg1 > gap ? gap / 2 : 0));
  const seg2End = 360;

  // Paths
  const backgroundTrackPath = useMemo(() => calculateSvgArcPath(cx, cy, r, 180, 360), [cx, cy, r]);
  const seg1Path = useMemo(
    () => (spanDeg1 > 2 ? calculateSvgArcPath(cx, cy, r, seg1Start, seg1End) : ""),
    [cx, cy, r, seg1Start, seg1End, spanDeg1]
  );
  const seg2Path = useMemo(
    () => (180 - spanDeg1 > 2 ? calculateSvgArcPath(cx, cy, r, seg2Start, seg2End) : ""),
    [cx, cy, r, seg2Start, seg2End, spanDeg1]
  );

  return (
    <div
      className={`bg-white rounded-3xl p-6 sm:p-7 border border-hk-champagne/40 shadow-xs flex flex-col justify-between transition-all ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="font-manrope font-semibold text-lg sm:text-xl text-hk-charcoal tracking-tight">
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

      {/* 180° Semi-Donut Gauge Dial */}
      <div className="relative flex flex-col items-center justify-center my-auto pt-2">
        <svg viewBox="0 0 260 160" className="w-full max-w-[240px] h-auto overflow-visible select-none">
          {/* Subtle Background Track */}
          <path
            d={backgroundTrackPath}
            fill="none"
            stroke="#F3EDE6"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Segment 1 Arc (e.g. Amber/Orange) */}
          {seg1Path && (
            <path
              d={seg1Path}
              fill="none"
              stroke={seg1.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          )}

          {/* Segment 2 Arc (e.g. Emerald Green) */}
          {seg2Path && (
            <path
              d={seg2Path}
              fill="none"
              stroke={seg2.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          )}

          {/* Center Total Text Metric (Native SVG coordinate system - zero collision) */}
          <g className="select-none pointer-events-none font-manrope">
            <text
              x={cx}
              y={cy - 30}
              textAnchor="middle"
              className="fill-muted-foreground font-semibold text-[10.5px] uppercase tracking-wider"
              style={{ letterSpacing: "0.08em" }}
            >
              {totalLabel}
            </text>
            <text
              x={cx}
              y={cy + 8}
              textAnchor="middle"
              className="fill-hk-charcoal font-bold text-[34px] tracking-tight tabular-nums"
            >
              {formatCompactNumber(total)}
            </text>
          </g>
        </svg>
      </div>

      {/* Bottom Segment Legend */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-hk-champagne/30 font-manrope text-xs">
        {/* Segment 1 Item */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
              style={{ backgroundColor: seg1.color }}
            />
            <span className="font-bold text-hk-charcoal truncate tabular-nums">
              {formatCompactNumber(seg1.value)} {seg1.label}
            </span>
          </div>
          {seg1.sublabel && (
            <p className="text-[11px] text-muted-foreground pl-4 truncate">{seg1.sublabel}</p>
          )}
        </div>

        {/* Segment 2 Item */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
              style={{ backgroundColor: seg2.color }}
            />
            <span className="font-bold text-hk-charcoal truncate tabular-nums">
              {formatCompactNumber(seg2.value)} {seg2.label}
            </span>
          </div>
          {seg2.sublabel && (
            <p className="text-[11px] text-muted-foreground pl-4 truncate">{seg2.sublabel}</p>
          )}
        </div>
      </div>
    </div>
  );
}
