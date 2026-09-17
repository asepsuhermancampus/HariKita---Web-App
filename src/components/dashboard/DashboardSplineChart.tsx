"use client";

import React, { useState, useMemo, useRef } from "react";
import { Calendar, ChevronDown, TrendingUp, Sparkles } from "lucide-react";
import { calculateBezierSplinePath, formatCompactNumber } from "./dashboard-utils";

export interface SplinePoint {
  date: string;
  label: string;
  value: number;
  deltaPct?: string;
  secondaryValue?: number;
}

export interface DashboardSplineChartProps {
  title: string;
  dateRangeLabel: string;
  timeframe: "7d" | "30d" | "90d";
  onTimeframeChange?: (tf: "7d" | "30d" | "90d") => void;
  data: SplinePoint[];
  unitPrefix?: string;
  unitSuffix?: string;
  lineColor?: string; // hex or default
  gradientFrom?: string;
  gradientTo?: string;
  className?: string;
}

export function DashboardSplineChart({
  title,
  dateRangeLabel,
  timeframe,
  onTimeframeChange,
  data,
  unitPrefix = "",
  unitSuffix = "",
  lineColor = "#10B981", // Emerald from image
  gradientFrom = "#10B981",
  gradientTo = "#10B981",
  className = "",
}: DashboardSplineChartProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(
    data.length > 2 ? Math.floor(data.length / 2) : 0
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const timeframeLabels: Record<"7d" | "30d" | "90d", string> = {
    "7d": "7 Hari Terakhir",
    "30d": "30 Hari Terakhir",
    "90d": "3 Bulan Terakhir",
  };

  // Dimensions
  const svgWidth = 700;
  const svgHeight = 260;
  const paddingLeft = 45;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  // Max value calculation with safety padding
  const maxValue = useMemo(() => {
    if (!data || data.length === 0) return 100;
    const max = Math.max(...data.map((d) => d.value));
    return max > 0 ? Math.ceil(max * 1.25) : 100;
  }, [data]);

  // Scaled coordinates
  const coordinates = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((d, i) => {
      const x = paddingLeft + (i / Math.max(1, data.length - 1)) * chartW;
      const y = paddingTop + chartH - (d.value / maxValue) * chartH;
      return { x, y, point: d };
    });
  }, [data, maxValue, chartW, chartH, paddingLeft, paddingTop]);

  // Spline Bézier path
  const linePath = useMemo(() => {
    return calculateBezierSplinePath(coordinates.map((c) => ({ x: c.x, y: c.y })));
  }, [coordinates]);

  // Area closed path for gradient fill
  const areaPath = useMemo(() => {
    if (coordinates.length < 2) return "";
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    const baseLineY = paddingTop + chartH;
    return `${linePath} L ${last.x} ${baseLineY} L ${first.x} ${baseLineY} Z`;
  }, [coordinates, linePath, paddingTop, chartH]);

  // Y-axis grid ticks (4 levels)
  const yTicks = useMemo(() => {
    return [0, 0.33, 0.66, 1].map((ratio) => {
      const val = Math.round(ratio * maxValue);
      const y = paddingTop + chartH - ratio * chartH;
      return { val, y };
    });
  }, [maxValue, paddingTop, chartH]);

  // Mouse hover event handler
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || coordinates.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;

    // Find nearest point
    let nearestIdx = 0;
    let minDistance = Infinity;
    coordinates.forEach((pt, i) => {
      const dist = Math.abs(pt.x - mouseX);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = i;
      }
    });

    setHoveredIdx(nearestIdx);
  };

  const activePoint = hoveredIdx !== null && coordinates[hoveredIdx] ? coordinates[hoveredIdx] : null;

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-3xl p-6 sm:p-7 border border-hk-champagne/40 shadow-xs flex flex-col justify-between relative transition-all ${className}`}
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-manrope font-semibold text-lg sm:text-xl text-hk-charcoal tracking-tight">
            {title}
          </h3>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Date Range Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-hk-ivory border border-hk-champagne/50 text-xs font-manrope font-medium text-hk-charcoal">
            <Calendar className="w-3.5 h-3.5 text-hk-taupe" />
            <span>{dateRangeLabel}</span>
          </div>

          {/* Timeframe Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-hk-ivory border border-hk-champagne/50 text-xs font-manrope font-medium text-hk-charcoal hover:bg-white transition-colors"
              aria-expanded={dropdownOpen}
            >
              <span>{timeframeLabels[timeframe]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-40 bg-white rounded-2xl border border-hk-champagne/60 shadow-lg py-1.5 z-20 font-manrope text-xs animate-in fade-in-50 zoom-in-95">
                {(["7d", "30d", "90d"] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => {
                      onTimeframeChange?.(tf);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 transition-colors ${
                      timeframe === tf
                        ? "bg-hk-soft-beige/70 font-bold text-hk-charcoal"
                        : "text-hk-charcoal/70 hover:bg-hk-ivory hover:text-hk-charcoal"
                    }`}
                  >
                    {timeframeLabels[tf]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {}}
        >
          <defs>
            {/* Linear Gradient for Soft Area Under Spline */}
            <linearGradient id="splineAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientFrom} stopOpacity="0.22" />
              <stop offset="50%" stopColor={gradientTo} stopOpacity="0.08" />
              <stop offset="100%" stopColor={gradientTo} stopOpacity="0.0" />
            </linearGradient>

            {/* Line Glow Filter */}
            <filter id="splineGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={lineColor} floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Horizontal Dashed Gridlines & Y-Axis Labels */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={svgWidth - paddingRight}
                y2={tick.y}
                stroke="#EAE2D8"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 10}
                y={tick.y + 4}
                textAnchor="end"
                className="text-[11px] font-manrope fill-hk-charcoal/60"
              >
                {formatCompactNumber(tick.val)}
              </text>
            </g>
          ))}

          {/* Area Fill */}
          {areaPath && (
            <path d={areaPath} fill="url(#splineAreaGrad)" className="transition-all duration-300" />
          )}

          {/* Smooth Bézier Spline Curve */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={lineColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#splineGlow)"
              className="transition-all duration-300"
            />
          )}

          {/* Active Hover Guideline & Indicator */}
          {activePoint && (
            <g className="transition-all duration-150 pointer-events-none">
              {/* Vertical Dashed Guideline */}
              <line
                x1={activePoint.x}
                y1={paddingTop}
                x2={activePoint.x}
                y2={paddingTop + chartH}
                stroke="#C5A880"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* Outer Halo */}
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="7"
                fill={lineColor}
                fillOpacity="0.2"
              />
              {/* Center Dot */}
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="4.5"
                fill="#FFFFFF"
                stroke={lineColor}
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* X-Axis Date Labels */}
          {coordinates.map((c, idx) => {
            // Show all labels on short sets or spaced on larger sets
            const showLabel =
              coordinates.length <= 8 ||
              idx === 0 ||
              idx === coordinates.length - 1 ||
              idx % Math.ceil(coordinates.length / 7) === 0;

            if (!showLabel) return null;

            return (
              <text
                key={idx}
                x={c.x}
                y={svgHeight - 12}
                textAnchor="middle"
                className={`text-[11px] font-manrope ${
                  hoveredIdx === idx ? "fill-hk-charcoal font-bold" : "fill-hk-charcoal/60 font-medium"
                }`}
              >
                {c.point.label}
              </text>
            );
          })}
        </svg>

        {/* Floating Tooltip Card (Positioned precisely over active hovered point) */}
        {activePoint && (
          <div
            className="absolute pointer-events-none transition-all duration-150 z-10"
            style={{
              left: `${(activePoint.x / svgWidth) * 100}%`,
              top: `${Math.max(10, (activePoint.y / svgHeight) * 100 - 32)}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-hk-champagne/60 shadow-xl min-w-[130px] text-center font-manrope animate-in fade-in-50 zoom-in-95">
              <div className="text-[10px] text-muted-foreground font-medium mb-0.5">
                {activePoint.point.date}
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <span className="font-semibold text-base text-hk-charcoal tabular-nums">
                  {unitPrefix}
                  {formatCompactNumber(activePoint.point.value)}
                  {unitSuffix}
                </span>
                {activePoint.point.deltaPct && (
                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                    ↗ {activePoint.point.deltaPct}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
