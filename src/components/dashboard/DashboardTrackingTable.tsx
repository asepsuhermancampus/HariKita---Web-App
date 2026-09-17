"use client";

import React, { useState } from "react";
import { ArrowUpDown, Filter, ChevronRight, User } from "lucide-react";

export interface TrackingTableRow {
  id: string;
  avatarUrl?: string;
  avatarFallback?: string;
  primaryName: string;
  secondaryText: string;
  type: string;
  subType?: string;
  badgeText: string;
  badgeTone?: "emerald" | "amber" | "taupe" | "rose" | "teal" | "indigo";
  statusText: string;
  statusDate: string;
}

export interface DashboardTrackingTableProps {
  title: string;
  actionLabel?: string;
  onActionClick?: () => void;
  onSort?: () => void;
  onFilter?: () => void;
  columns: {
    col1: string; // e.g. "NAMA KLIEN / MEMPELAI"
    col2: string; // e.g. "PAKET LAYANAN"
    col3: string; // e.g. "KECAMATAN / VENUE"
    col4: string; // e.g. "STATUS & TANGGAL"
  };
  rows: TrackingTableRow[];
  className?: string;
}

export function DashboardTrackingTable({
  title,
  actionLabel = "Lihat Semua",
  onActionClick,
  onSort,
  onFilter,
  columns,
  rows,
  className = "",
}: DashboardTrackingTableProps) {
  // Pastel pill tone styles matching the reference image's soft rounded department badges
  const toneStyles: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    amber: "bg-amber-50 text-amber-800 border-amber-200/80",
    taupe: "bg-hk-soft-beige/70 text-hk-taupe border-hk-champagne/60",
    rose: "bg-rose-50 text-rose-700 border-rose-200/80",
    teal: "bg-teal-50 text-teal-700 border-teal-200/80",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
  };

  return (
    <div
      className={`bg-white rounded-3xl p-6 sm:p-7 border border-hk-champagne/40 shadow-xs flex flex-col font-manrope transition-all ${className}`}
    >
      {/* Top Header & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-lg sm:text-xl text-hk-charcoal tracking-tight">
            {title}
          </h3>
        </div>

        {/* Toolbar Buttons: Sort, Filter, See All */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onSort && (
            <button
              onClick={onSort}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-hk-champagne/50 bg-white hover:bg-hk-ivory text-xs font-semibold text-hk-charcoal transition-all shadow-2xs"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-hk-taupe" />
              <span>Urutkan</span>
            </button>
          )}

          {onFilter && (
            <button
              onClick={onFilter}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-hk-champagne/50 bg-white hover:bg-hk-ivory text-xs font-semibold text-hk-charcoal transition-all shadow-2xs"
            >
              <Filter className="w-3.5 h-3.5 text-hk-taupe" />
              <span>Filter</span>
            </button>
          )}

          {actionLabel && (
            <button
              onClick={onActionClick}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-hk-champagne/50 bg-hk-ivory hover:bg-white text-xs font-semibold text-hk-charcoal transition-all shadow-2xs"
            >
              <span>{actionLabel}</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto no-scrollbar -mx-6 sm:mx-0 px-6 sm:px-0">
        <table className="w-full text-left border-collapse min-w-[620px]">
          <thead>
            <tr className="border-b border-hk-champagne/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <th className="pb-3.5 font-semibold">{columns.col1}</th>
              <th className="pb-3.5 font-semibold">{columns.col2}</th>
              <th className="pb-3.5 font-semibold">{columns.col3}</th>
              <th className="pb-3.5 font-semibold text-right">{columns.col4}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hk-champagne/25 text-xs">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground">
                  Belum ada data pesanan yang perlu dilacak saat ini.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const badgeClass = toneStyles[row.badgeTone || "emerald"] || toneStyles.emerald;

                return (
                  <tr
                    key={row.id}
                    className="group hover:bg-hk-ivory/50 transition-colors"
                  >
                    {/* Col 1: Avatar + Name + Secondary Text */}
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-hk-ivory border border-hk-champagne/60 flex items-center justify-center text-hk-charcoal font-bold text-xs shrink-0 overflow-hidden shadow-2xs">
                          {row.avatarUrl ? (
                            <img
                              src={row.avatarUrl}
                              alt={row.primaryName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{row.avatarFallback || row.primaryName.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>

                        {/* Name Info */}
                        <div className="space-y-0.5">
                          <div className="font-bold text-hk-charcoal group-hover:text-hk-taupe transition-colors">
                            {row.primaryName}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {row.secondaryText}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Col 2: Type & SubType */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-hk-charcoal">{row.type}</div>
                        {row.subType && (
                          <div className="text-[11px] text-muted-foreground">{row.subType}</div>
                        )}
                      </div>
                    </td>

                    {/* Col 3: Department / District Pastel Pill Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold border ${badgeClass}`}
                      >
                        {row.badgeText}
                      </span>
                    </td>

                    {/* Col 4: Status & Date */}
                    <td className="py-4 pl-4 text-right">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-hk-charcoal">{row.statusText}</div>
                        <div className="text-[11px] text-muted-foreground">{row.statusDate}</div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
