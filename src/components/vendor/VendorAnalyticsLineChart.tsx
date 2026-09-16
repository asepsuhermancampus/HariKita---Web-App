"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Eye,
  Users,
  SlidersHorizontal,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { BadgePremium } from "@/components/harikita/ui";

export type Timeframe = "7d" | "30d" | "90d";

export interface ChartDataPoint {
  date: string;
  label: string;
  viewsGuest: number;
  viewsAuth: number;
  builderTrials: number;
  orders: number;
}

interface VendorAnalyticsLineChartProps {
  initialTimeframe?: Timeframe;
  viewsGuestTotal?: number;
  viewsAuthTotal?: number;
  builderTrialsTotal?: number;
  ordersTotal?: number;
}

// Generate deterministic historical realistic series based on totals
function generateChartSeries(
  days: number,
  totals: { guest: number; auth: number; trials: number; orders: number }
): ChartDataPoint[] {
  const points: ChartDataPoint[] = [];
  const now = new Date();

  // Factors that shape the natural growth curve
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString("id-ID", { weekday: "short" });
    const dayNum = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });

    // Deterministic pseudo-random variation based on date
    const hash = (d.getDate() * 17 + d.getMonth() * 31 + i * 13) % 100;
    const wave = Math.sin((days - i) * 0.4) * 0.25 + 1; // gentle wave

    const guestDaily = Math.max(1, Math.round(((totals.guest / days) * wave * (0.7 + (hash % 60) / 100))));
    const authDaily = Math.max(1, Math.round(((totals.auth / days) * wave * (0.65 + ((hash * 3) % 70) / 100))));
    const trialsDaily = Math.max(0, Math.round(((totals.trials / days) * wave * (0.6 + ((hash * 7) % 80) / 100))));
    const ordersDaily = Math.max(0, Math.round(((totals.orders / days) * wave * (0.5 + ((hash * 11) % 90) / 100))));

    points.push({
      date: dateStr,
      label: days <= 7 ? `${dayName}, ${d.getDate()}` : dayNum,
      viewsGuest: guestDaily,
      viewsAuth: authDaily,
      builderTrials: trialsDaily,
      orders: ordersDaily,
    });
  }

  return points;
}

// Helper: Calculate smooth cubic Bezier path string
function getBezierPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];

    const prev = points[i - 1] || current;
    const nextNext = points[i + 2] || next;

    const smoothing = 0.2;
    const cp1x = current.x + (next.x - prev.x) * smoothing;
    const cp1y = current.y + (next.y - prev.y) * smoothing;

    const cp2x = next.x - (nextNext.x - current.x) * smoothing;
    const cp2y = next.y - (nextNext.y - current.y) * smoothing;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
  }

  return path;
}

export function VendorAnalyticsLineChart({
  initialTimeframe = "7d",
  viewsGuestTotal = 184,
  viewsAuthTotal = 76,
  builderTrialsTotal = 42,
  ordersTotal = 25,
}: VendorAnalyticsLineChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>(initialTimeframe);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Active series toggles
  const [visibleSeries, setVisibleSeries] = useState({
    viewsGuest: true,
    viewsAuth: true,
    builderTrials: true,
    orders: true,
  });

  const toggleSeries = (key: keyof typeof visibleSeries) => {
    setVisibleSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const daysCount = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90;

  const data = useMemo(() => {
    return generateChartSeries(daysCount, {
      guest: viewsGuestTotal,
      auth: viewsAuthTotal,
      trials: builderTrialsTotal,
      orders: ordersTotal,
    });
  }, [daysCount, viewsGuestTotal, viewsAuthTotal, builderTrialsTotal, ordersTotal]);

  // Chart dimensions inside SVG viewBox
  const width = 800;
  const height = 320;
  const padding = { top: 30, right: 30, bottom: 45, left: 45 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Find max value across visible series to scale Y axis dynamically
  const maxValue = useMemo(() => {
    let max = 5;
    data.forEach((d) => {
      if (visibleSeries.viewsGuest) max = Math.max(max, d.viewsGuest);
      if (visibleSeries.viewsAuth) max = Math.max(max, d.viewsAuth);
      if (visibleSeries.builderTrials) max = Math.max(max, d.builderTrials);
      if (visibleSeries.orders) max = Math.max(max, d.orders);
    });
    // Add 20% headroom
    return Math.ceil((max * 1.25) / 5) * 5;
  }, [data, visibleSeries]);

  // Convert data points to coordinate space
  const coords = useMemo(() => {
    return data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
      const yGuest = padding.top + chartHeight - (d.viewsGuest / maxValue) * chartHeight;
      const yAuth = padding.top + chartHeight - (d.viewsAuth / maxValue) * chartHeight;
      const yTrials = padding.top + chartHeight - (d.builderTrials / maxValue) * chartHeight;
      const yOrders = padding.top + chartHeight - (d.orders / maxValue) * chartHeight;

      return {
        x,
        guest: { x, y: yGuest, val: d.viewsGuest },
        auth: { x, y: yAuth, val: d.viewsAuth },
        trials: { x, y: yTrials, val: d.builderTrials },
        orders: { x, y: yOrders, val: d.orders },
        raw: d,
      };
    });
  }, [data, maxValue, chartWidth, chartHeight, padding.left, padding.top]);

  // Paths
  const guestPoints = coords.map((c) => c.guest);
  const authPoints = coords.map((c) => c.auth);
  const trialsPoints = coords.map((c) => c.trials);
  const ordersPoints = coords.map((c) => c.orders);

  const guestPath = getBezierPath(guestPoints);
  const authPath = getBezierPath(authPoints);
  const trialsPath = getBezierPath(trialsPoints);
  const ordersPath = getBezierPath(ordersPoints);

  // Closed area path under Guest views
  const guestAreaPath =
    guestPoints.length > 1
      ? `${guestPath} L ${guestPoints[guestPoints.length - 1].x} ${padding.top + chartHeight} L ${guestPoints[0].x} ${padding.top + chartHeight} Z`
      : "";

  // Closed area path under Auth views
  const authAreaPath =
    authPoints.length > 1
      ? `${authPath} L ${authPoints[authPoints.length - 1].x} ${padding.top + chartHeight} L ${authPoints[0].x} ${padding.top + chartHeight} Z`
      : "";

  // Horizontal Grid Lines (5 ticks)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const val = Math.round(ratio * maxValue);
    const y = padding.top + chartHeight - ratio * chartHeight;
    return { val, y };
  });

  // Handle Mouse Move for interactive hover inspection
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - svgRect.left;
    const svgX = (clientX / svgRect.width) * width;

    // Find nearest point
    let nearestIdx = 0;
    let minDiff = Infinity;
    coords.forEach((c, idx) => {
      const diff = Math.abs(c.x - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        nearestIdx = idx;
      }
    });

    setHoveredIndex(nearestIdx);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const activePoint = hoveredIndex !== null ? coords[hoveredIndex] : null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-hk-champagne/40 shadow-xs space-y-6 font-manrope">
      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-hk-champagne/25 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-hk-taupe/15 text-hk-taupe flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
            <span className="font-manrope text-xs font-bold uppercase tracking-widest text-hk-taupe">
              Grafik Tren Interaktif
            </span>
          </div>
          <h3 className="font-editorial text-2xl font-normal text-hk-charcoal mt-1">
            Fluktuasi Kunjungan &amp; Minat Calon Pengantin
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Garis kurva bezier halus memperlihatkan akselerasi penemuan portofolio hingga penguncian tanggal acara.
          </p>
        </div>

        {/* Timeframe Selector Pill Group */}
        <div className="flex items-center gap-1.5 bg-hk-ivory p-1.5 rounded-2xl border border-hk-champagne/40 self-start lg:self-auto">
          {(
            [
              { id: "7d", label: "7 Hari" },
              { id: "30d", label: "30 Hari" },
              { id: "90d", label: "3 Bulan" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                timeframe === t.id
                  ? "bg-hk-charcoal text-white shadow-xs"
                  : "text-hk-charcoal/70 hover:text-hk-charcoal hover:bg-white/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Series Toggles & Interactive Legend */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
        <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold mr-1">
          Filter Garis:
        </span>

        {/* Series 1: Guest Views */}
        <button
          onClick={() => toggleSeries("viewsGuest")}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
            visibleSeries.viewsGuest
              ? "bg-hk-charcoal text-white border-hk-charcoal shadow-2xs"
              : "bg-white text-hk-charcoal/40 border-hk-champagne/40 opacity-60 line-through"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white border border-hk-charcoal" />
          <span className="font-medium">Tamu Publik (Guest)</span>
        </button>

        {/* Series 2: Auth Views */}
        <button
          onClick={() => toggleSeries("viewsAuth")}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
            visibleSeries.viewsAuth
              ? "bg-hk-taupe text-white border-hk-taupe shadow-2xs"
              : "bg-white text-hk-taupe/40 border-hk-champagne/40 opacity-60 line-through"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white" />
          <span className="font-medium">Klien Berakun</span>
        </button>

        {/* Series 3: Builder Trials */}
        <button
          onClick={() => toggleSeries("builderTrials")}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
            visibleSeries.builderTrials
              ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
              : "bg-white text-amber-600/40 border-hk-champagne/40 opacity-60 line-through"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white" />
          <span className="font-medium">Racik di Builder</span>
        </button>

        {/* Series 4: Orders */}
        <button
          onClick={() => toggleSeries("orders")}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
            visibleSeries.orders
              ? "bg-emerald-700 text-white border-emerald-700 shadow-2xs"
              : "bg-white text-emerald-700/40 border-hk-champagne/40 opacity-60 line-through"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white" />
          <span className="font-medium">Pesanan Berhasil</span>
        </button>
      </div>

      {/* SVG Responsive Line Chart Canvas */}
      <div className="relative w-full overflow-hidden select-none bg-linear-to-b from-hk-ivory/50 via-white to-hk-ivory/30 rounded-2xl border border-hk-champagne/30 p-2 sm:p-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-64 sm:h-72 md:h-80 overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Soft Gradient Under Guest Series */}
            <linearGradient id="guestAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2B2B2B" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2B2B2B" stopOpacity="0.0" />
            </linearGradient>

            {/* Soft Gradient Under Auth Series */}
            <linearGradient id="authAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#88735B" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#88735B" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="#C9A88A"
                strokeOpacity="0.2"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={tick.y + 3}
                textAnchor="end"
                className="font-manrope text-[10px] fill-hk-charcoal/50 tabular-nums"
              >
                {tick.val}
              </text>
            </g>
          ))}

          {/* Area Fills under curves */}
          {visibleSeries.viewsGuest && (
            <path d={guestAreaPath} fill="url(#guestAreaGrad)" />
          )}
          {visibleSeries.viewsAuth && (
            <path d={authAreaPath} fill="url(#authAreaGrad)" />
          )}

          {/* Line 1: Guest Views (Charcoal) */}
          {visibleSeries.viewsGuest && (
            <path
              d={guestPath}
              fill="none"
              stroke="#2B2B2B"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Line 2: Auth Views (Taupe) */}
          {visibleSeries.viewsAuth && (
            <path
              d={authPath}
              fill="none"
              stroke="#88735B"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Line 3: Builder Trials (Amber/Champagne) */}
          {visibleSeries.builderTrials && (
            <path
              d={trialsPath}
              fill="none"
              stroke="#D97706"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="5 3"
            />
          )}

          {/* Line 4: Orders (Emerald) */}
          {visibleSeries.orders && (
            <path
              d={ordersPath}
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* X Axis Labels */}
          {coords.map((c, idx) => {
            // Sampling labels on 30d/90d to prevent clutter
            const showLabel =
              daysCount <= 7
                ? true
                : daysCount <= 30
                ? idx % 5 === 0 || idx === coords.length - 1
                : idx % 15 === 0 || idx === coords.length - 1;

            if (!showLabel) return null;

            return (
              <text
                key={idx}
                x={c.x}
                y={height - 12}
                textAnchor="middle"
                className="font-manrope text-[10px] fill-hk-charcoal/60"
              >
                {c.raw.label}
              </text>
            );
          })}

          {/* Active Hover Crosshair & Anchor Dots */}
          {activePoint && (
            <g>
              {/* Vertical Guide Line */}
              <line
                x1={activePoint.x}
                y1={padding.top}
                x2={activePoint.x}
                y2={padding.top + chartHeight}
                stroke="#88735B"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                strokeOpacity="0.75"
              />

              {/* Guest Point Dot */}
              {visibleSeries.viewsGuest && (
                <circle
                  cx={activePoint.guest.x}
                  cy={activePoint.guest.y}
                  r="5.5"
                  fill="#2B2B2B"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  className="transition-transform duration-100"
                />
              )}

              {/* Auth Point Dot */}
              {visibleSeries.viewsAuth && (
                <circle
                  cx={activePoint.auth.x}
                  cy={activePoint.auth.y}
                  r="5"
                  fill="#88735B"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              )}

              {/* Trials Point Dot */}
              {visibleSeries.builderTrials && (
                <circle
                  cx={activePoint.trials.x}
                  cy={activePoint.trials.y}
                  r="4.5"
                  fill="#D97706"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              )}

              {/* Orders Point Dot */}
              {visibleSeries.orders && (
                <circle
                  cx={activePoint.orders.x}
                  cy={activePoint.orders.y}
                  r="5"
                  fill="#059669"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              )}
            </g>
          )}
        </svg>

        {/* Floating Tooltip Card */}
        {activePoint && (
          <div
            className="absolute z-20 pointer-events-none transition-all duration-75 bg-hk-charcoal/95 backdrop-blur-md text-white border border-hk-champagne/40 rounded-2xl p-3 shadow-xl text-xs"
            style={{
              left: `${Math.min(
                Math.max(12, (activePoint.x / width) * 100),
                76
              )}%`,
              top: "16px",
            }}
          >
            <div className="font-editorial text-sm font-semibold text-hk-champagne border-b border-white/15 pb-1.5 mb-2">
              {activePoint.raw.label} ({activePoint.raw.date})
            </div>

            <div className="space-y-1 text-[11px] tabular-nums">
              {visibleSeries.viewsGuest && (
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-white/80">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    Tamu Publik:
                  </span>
                  <strong className="font-semibold text-white">
                    {activePoint.raw.viewsGuest} views
                  </strong>
                </div>
              )}

              {visibleSeries.viewsAuth && (
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-hk-champagne">
                    <span className="w-2 h-2 rounded-full bg-hk-taupe" />
                    Klien Berakun:
                  </span>
                  <strong className="font-semibold text-white">
                    {activePoint.raw.viewsAuth} views
                  </strong>
                </div>
              )}

              {visibleSeries.builderTrials && (
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Percobaan Racik:
                  </span>
                  <strong className="font-semibold text-white">
                    {activePoint.raw.builderTrials} racikan
                  </strong>
                </div>
              )}

              {visibleSeries.orders && (
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Pesanan Selesai:
                  </span>
                  <strong className="font-semibold text-white">
                    {activePoint.raw.orders} orders
                  </strong>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Insight Note */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-hk-taupe" />
          <span>
            Arahkan kursor atau sentuh garis kurva untuk melihat data harian spesifik.
          </span>
        </div>
        <span className="text-[11px] font-semibold text-hk-taupe bg-hk-taupe/10 px-2.5 py-1 rounded-full border border-hk-champagne/30">
          Tren Konversi: +18.4% Bulan Ini
        </span>
      </div>
    </div>
  );
}
