"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, User, MapPin, Calendar, Clock, ExternalLink } from "lucide-react";

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
  actionHref?: string;
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
  actionHref = "/dashboard/vendor/kalender",
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
  const accentCardStyles: Record<
    string,
    { border: string; bg: string; badge: string; text: string }
  > = {
    emerald: {
      border: "border-l-emerald-500",
      bg: "hover:bg-emerald-50/40",
      badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
      text: "text-emerald-700",
    },
    amber: {
      border: "border-l-amber-500",
      bg: "hover:bg-amber-50/40",
      badge: "bg-amber-50 text-amber-800 border-amber-200",
      text: "text-amber-700",
    },
    taupe: {
      border: "border-l-[#88735B]",
      bg: "hover:bg-hk-soft-beige/40",
      badge: "bg-hk-soft-beige/60 text-hk-charcoal border-hk-champagne/60",
      text: "text-hk-taupe",
    },
    rose: {
      border: "border-l-rose-500",
      bg: "hover:bg-rose-50/40",
      badge: "bg-rose-50 text-rose-800 border-rose-200",
      text: "text-rose-700",
    },
    teal: {
      border: "border-l-teal-500",
      bg: "hover:bg-teal-50/40",
      badge: "bg-teal-50 text-teal-800 border-teal-200",
      text: "text-teal-700",
    },
  };

  return (
    <div
      className={`bg-white rounded-3xl p-5 sm:p-6 border border-hk-champagne/40 shadow-xs flex flex-col justify-between transition-all ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <h3 className="font-manrope font-semibold text-base sm:text-lg text-hk-charcoal tracking-tight flex items-center gap-2">
          <Calendar className="w-4.5 h-4.5 text-hk-taupe" />
          {title}
        </h3>
        {actionLabel && (
          actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1 text-xs font-manrope font-semibold text-hk-taupe hover:text-hk-charcoal transition-colors px-2.5 py-1 rounded-lg hover:bg-hk-ivory border border-transparent hover:border-hk-champagne/40"
            >
              <span>{actionLabel}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          ) : (
            <button
              onClick={onActionClick}
              className="inline-flex items-center gap-1 text-xs font-manrope font-semibold text-hk-taupe hover:text-hk-charcoal transition-colors px-2.5 py-1 rounded-lg hover:bg-hk-ivory"
            >
              <span>{actionLabel}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )
        )}
      </div>

      {/* Date Stepper Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-2xl bg-hk-ivory border border-hk-champagne/50 font-manrope text-xs font-semibold text-hk-charcoal mb-2.5">
        <button
          onClick={onPrevDate}
          className="p-1 rounded-lg hover:bg-white hover:shadow-2xs text-hk-charcoal/70 hover:text-hk-charcoal transition-all"
          aria-label="Tanggal Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-hk-taupe" />
          <span className="tracking-tight font-bold">{currentDate}</span>
        </div>
        <button
          onClick={onNextDate}
          className="p-1 rounded-lg hover:bg-white hover:shadow-2xs text-hk-charcoal/70 hover:text-hk-charcoal transition-all"
          aria-label="Tanggal Berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-hk-champagne/30 pb-2 mb-2.5 font-manrope text-xs overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`relative px-2.5 py-1 rounded-lg transition-all whitespace-nowrap text-xs font-medium ${
                isActive
                  ? "bg-hk-charcoal text-white font-semibold shadow-2xs"
                  : "text-muted-foreground hover:text-hk-charcoal hover:bg-hk-ivory"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Timeline Clean Card List Items - Consistent Fixed-Height Container */}
      <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:#E8DED1_transparent]">
        {events.length === 0 ? (
          <div className="h-full min-h-[140px] flex flex-col items-center justify-center p-4 text-center text-xs text-muted-foreground font-manrope bg-hk-ivory/30 rounded-2xl border border-dashed border-hk-champagne/50">
            <span>Belum ada jadwal sesi fisik pada kategori ini.</span>
          </div>
        ) : (
          events.map((evt) => {
            const style =
              accentCardStyles[evt.accentColor || "emerald"] ||
              accentCardStyles.emerald;

            return (
              <div
                key={evt.id}
                className={`p-2.5 sm:p-3 rounded-2xl border border-hk-champagne/40 bg-white shadow-2xs border-l-4 ${style.border} ${style.bg} transition-all duration-200 font-manrope space-y-1.5`}
              >
                {/* Micro Header: Time & Category */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-hk-charcoal tabular-nums bg-hk-ivory/80 px-2 py-0.5 rounded-md border border-hk-champagne/40">
                    <Clock className="w-3 h-3 text-hk-taupe" />
                    {evt.startTime} - {evt.endTime}
                  </span>
                  <span
                    className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${style.badge}`}
                  >
                    {evt.category}
                  </span>
                </div>

                {/* Event Title */}
                <h4 className="font-semibold text-hk-charcoal text-xs leading-snug">
                  {evt.title}
                </h4>

                {/* Person & Venue Metadata */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10.5px] text-muted-foreground pt-0.5 border-t border-hk-champagne/20">
                  <span className="inline-flex items-center gap-1 text-hk-charcoal/90 font-medium">
                    <User className="w-3 h-3 text-hk-taupe shrink-0" />
                    <span className="truncate">{evt.personName}</span>
                  </span>
                  {evt.venue && (
                    <span className="inline-flex items-center gap-1 text-hk-charcoal/70">
                      <MapPin className="w-3 h-3 text-hk-taupe shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
