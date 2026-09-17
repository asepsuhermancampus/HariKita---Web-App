"use client";

import React from "react";
import { ChevronLeft, ChevronRight, User, MapPin } from "lucide-react";

export interface ScheduleItem {
  id: string;
  startTime: string;
  endTime: string;
  category: string;
  title: string;
  personName: string;
  venue?: string;
  accentColor?: "emerald" | "amber" | "taupe" | "rose" | "teal";
}

export interface DashboardScheduleTimelineProps {
  title?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  currentDate: string;
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onPrevDate?: () => void;
  onNextDate?: () => void;
  events: ScheduleItem[];
  className?: string;
}

export function DashboardScheduleTimeline({
  title = "Schedule",
  actionLabel = "Lihat Semua",
  onActionClick,
  currentDate,
  tabs,
  activeTab,
  onTabChange,
  onPrevDate,
  onNextDate,
  events,
  className = "",
}: DashboardScheduleTimelineProps) {
  const accentBorderColors: Record<string, string> = {
    emerald: "border-[#10B981]",
    amber: "border-[#F59E0B]",
    taupe: "border-[#88735B]",
    rose: "border-rose-500",
    teal: "border-teal-500",
  };

  return (
    <div
      className={`bg-white rounded-3xl p-6 sm:p-7 border border-hk-champagne/40 shadow-xs flex flex-col justify-between transition-all ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
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

      {/* Date Stepper Bar */}
      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-2xl bg-hk-ivory border border-hk-champagne/50 font-manrope text-xs font-semibold text-hk-charcoal mb-4">
        <button
          onClick={onPrevDate}
          className="p-1 rounded-lg hover:bg-white hover:shadow-2xs text-hk-charcoal/70 hover:text-hk-charcoal transition-all"
          aria-label="Tanggal Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="tracking-tight">{currentDate}</span>
        <button
          onClick={onNextDate}
          className="p-1 rounded-lg hover:bg-white hover:shadow-2xs text-hk-charcoal/70 hover:text-hk-charcoal transition-all"
          aria-label="Tanggal Berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-4 border-b border-hk-champagne/30 pb-2 mb-4 font-manrope text-xs overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`relative pb-1.5 transition-colors whitespace-nowrap font-medium ${
                isActive ? "text-hk-charcoal font-bold" : "text-muted-foreground hover:text-hk-charcoal"
              }`}
            >
              {tab}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-hk-taupe rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Timeline List Items */}
      <div className="space-y-4 flex-1 overflow-y-auto max-h-[260px] pr-1 no-scrollbar">
        {events.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground font-manrope">
            Belum ada jadwal sesi fisik pada tanggal ini.
          </div>
        ) : (
          events.map((evt) => {
            const borderClass = accentBorderColors[evt.accentColor || "emerald"] || "border-[#10B981]";
            return (
              <div key={evt.id} className="flex items-start gap-3 font-manrope text-xs group">
                {/* Time Column */}
                <div className="w-16 shrink-0 text-right space-y-0.5 pt-0.5">
                  <div className="font-bold text-hk-charcoal text-[11px] tabular-nums">{evt.startTime}</div>
                  <div className="text-[10px] text-muted-foreground tabular-nums">{evt.endTime}</div>
                </div>

                {/* Vertical Indicator Accent Line */}
                <div className={`h-full min-h-[44px] border-l-[3px] ${borderClass} rounded-full pl-3 flex-1 space-y-1`}>
                  {/* Category Pill / Label */}
                  <span className="text-[10px] font-semibold text-muted-foreground block uppercase tracking-wider">
                    {evt.category}
                  </span>

                  {/* Title */}
                  <h4 className="font-bold text-hk-charcoal text-xs leading-snug group-hover:text-hk-taupe transition-colors">
                    {evt.title}
                  </h4>

                  {/* Person Name & Optional Venue */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground pt-0.5">
                    <span className="inline-flex items-center gap-1">
                      <User className="w-3 h-3 text-hk-charcoal/60" />
                      <span>{evt.personName}</span>
                    </span>
                    {evt.venue && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-hk-taupe" />
                        <span>{evt.venue}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
