"use client";

import React, { useState, useMemo } from "react";
import {
  DashboardSplineChart,
  SplinePoint,
  DashboardSemiDonutGauge,
  DashboardSparkBarCard,
  DashboardScheduleTimeline,
  ScheduleItem,
  DashboardTrackingTable,
  TrackingTableRow,
} from "./index";
import { formatRupiah } from "@/lib/utils";
import type { AdminCalendarEventDTO } from "@/server/queries/orders";
import type { FunnelStepVM } from "@/app/admin/AdminDashboardClient";

export interface AdminTrackingSuiteProps {
  funnelSteps: FunnelStepVM[];
  calendarEvents: AdminCalendarEventDTO[];
  escrow: {
    orders: Array<{
      id: string;
      orderNumber: string;
      clientName: string;
      status: string;
      totalAmount: number;
      eventDate: string;
      itemCount: number;
    }>;
    journalCount: number;
    totalDebit: number;
    totalCredit: number;
  } | null;
  gmv: number;
  className?: string;
}

export function AdminTrackingSuite({
  funnelSteps,
  calendarEvents,
  escrow,
  gmv,
  className = "",
}: AdminTrackingSuiteProps) {
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("7d");
  const [scheduleTab, setScheduleTab] = useState<string>("Semua");
  const [currentDateIndex, setCurrentDateIndex] = useState<number>(0);

  const datesList = ["10 Nov 2025", "11 Nov 2025", "12 Nov 2025"];
  const currentDate = datesList[currentDateIndex] || "10 Nov 2025";

  const effectiveGmv = gmv > 0 ? gmv : 48500000;
  const platformFee = Math.round(effectiveGmv * 0.1);

  // 1. Spline Data for Superadmin (Daily transactions & GMV telemetri)
  const splineData: SplinePoint[] = useMemo(() => {
    const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90;
    const points: SplinePoint[] = [];
    const baseVal = Math.round(effectiveGmv / (days * 100000));

    const now = new Date(2025, 10, 10);
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayNum = d.getDate();
      const dayName = d.toLocaleDateString("id-ID", { weekday: "short" });
      const monthShort = d.toLocaleDateString("id-ID", { month: "short" });

      const wave = Math.sin((days - i) * 0.45) * 0.28 + 1;
      const hash = (dayNum * 13 + i * 7) % 20;
      const val = Math.max(5, Math.round((baseVal + hash) * wave));

      points.push({
        date: `${dayNum} ${monthShort} 2025`,
        label: days <= 7 ? `${dayName}, ${dayNum}` : `${dayNum} ${monthShort}`,
        value: val,
        deltaPct: hash % 2 === 0 ? `+${18 + (hash % 12)}%` : `+${14 + (hash % 6)}%`,
      });
    }
    return points;
  }, [timeframe, effectiveGmv]);

  const dateRangeLabel = useMemo(() => {
    if (splineData.length === 0) return "8 Nov 2025 - 14 Nov 2025";
    return `${splineData[0].label} - ${splineData[splineData.length - 1].label}`;
  }, [splineData]);

  // 2. Semi Donut Gauge: Intimate Wedding Bundle vs Single Service
  const gaugeSegments: [
    { label: string; sublabel: string; value: number; color: string },
    { label: string; sublabel: string; value: number; color: string }
  ] = [
    {
      label: "Paket Terpadu",
      sublabel: "Intimate & Combo Builder",
      value: 178,
      color: "#F59E0B",
    },
    {
      label: "Layanan Tunggal",
      sublabel: "MUA / Gaun / Foto Saja",
      value: 76,
      color: "#10B981",
    },
  ];

  // 3. Sparkline Micro Bars
  const gmvBars = [
    { label: "Sen", value: 4500000, tooltip: "Sen: Rp 4.500.000" },
    { label: "Sel", value: 6800000, tooltip: "Sel: Rp 6.800.000" },
    { label: "Rab", value: 11200000, tooltip: "Rab: Rp 11.200.000" },
    { label: "Kam", value: 7900000, tooltip: "Kam: Rp 7.900.000" },
    { label: "Jum", value: 16400000, tooltip: "Jum: Rp 16.400.000" },
    { label: "Sab", value: 13500000, tooltip: "Sab: Rp 13.500.000" },
    { label: "Min", value: 19800000, tooltip: "Min: Rp 19.800.000" },
  ];

  const feeBars = [
    { label: "Sen", value: 450000, tooltip: "Komisi 10%: Rp 450.000" },
    { label: "Sel", value: 680000, tooltip: "Komisi 10%: Rp 680.000" },
    { label: "Rab", value: 1120000, tooltip: "Komisi 10%: Rp 1.120.000" },
    { label: "Kam", value: 790000, tooltip: "Komisi 10%: Rp 790.000" },
    { label: "Jum", value: 1640000, tooltip: "Komisi 10%: Rp 1.640.000" },
    { label: "Sab", value: 1350000, tooltip: "Komisi 10%: Rp 1.350.000" },
    { label: "Min", value: 1980000, tooltip: "Komisi 10%: Rp 1.980.000" },
  ];

  // 4. Master Schedule Events for Admin (Multi-Vendor Schedule across Kebumen)
  const masterEvents: ScheduleItem[] = useMemo(() => {
    if (calendarEvents && calendarEvents.length > 0) {
      return calendarEvents.slice(0, 5).map((evt, idx) => ({
        id: evt.id,
        startTime: `08:${30 + idx * 15} WIB`,
        endTime: `12:${0 + idx * 15} WIB`,
        category: evt.status === "TERKUNCI_DP" ? "Terkunci DP 30%" : "Lunas Escrow",
        title: `Acara Pernikahan ${evt.client}`,
        personName: `${evt.vendorsCount} Vendor Terlibat`,
        venue: evt.venue,
        accentColor: evt.status === "TERKUNCI_DP" ? "amber" : "emerald",
      }));
    }

    return [
      {
        id: "evt-adm-1",
        startTime: "08:00 WIB",
        endTime: "11:30 WIB",
        category: "Akad & Resepsi Intimate",
        title: "Pernikahan Anisa & Bagus (3 Vendor Terlibat)",
        personName: "Menganti Studio, Rias Ayu MUA, Dekor Sekar",
        venue: "Pendopo Ageng Kebumen",
        accentColor: "emerald",
      },
      {
        id: "evt-adm-2",
        startTime: "13:00 WIB",
        endTime: "16:00 WIB",
        category: "Sesi Fitting Gaun Perdana",
        title: "Fitting Gaun & Busana Ortu Pengantin",
        personName: "Atelier Busana Kebumen",
        venue: "Jl. Pahlawan, Kebumen Kota",
        accentColor: "amber",
      },
      {
        id: "evt-adm-3",
        startTime: "16:30 WIB",
        endTime: "19:00 WIB",
        category: "Test Food Katering",
        title: "Uji Rasa 300 Pax Resepsi Tradisional",
        personName: "Katering Lestari Rasa",
        venue: "Gombong, Kebumen",
        accentColor: "teal",
      },
    ];
  }, [calendarEvents]);

  // 5. Tracking Data Table: Master Transaksi Escrow
  const tableRows: TrackingTableRow[] = useMemo(() => {
    if (escrow?.orders && escrow.orders.length > 0) {
      return escrow.orders.map((ord) => ({
        id: ord.id,
        primaryName: ord.clientName,
        secondaryText: `Order #${ord.orderNumber} • ${ord.itemCount} Vendor`,
        type: "Intimate Wedding Package",
        subType: formatRupiah(ord.totalAmount),
        badgeText: "Kebumen",
        badgeTone: ord.status === "TERKUNCI_DP" ? "amber" : "emerald",
        statusText: ord.status,
        statusDate: ord.eventDate.split("T")[0],
      }));
    }

    return [
      {
        id: "hk-ord-01",
        primaryName: "Anisa Rahma & Bagus",
        secondaryText: "Order #HK-2025-089 • 3 Vendor",
        type: "Intimate Wedding All-In",
        subType: "Total: Rp 14.500.000",
        badgeText: "Kebumen Kota",
        badgeTone: "emerald",
        statusText: "DP 30% Terkunci",
        statusDate: "10 Nov 2025",
      },
      {
        id: "hk-ord-02",
        primaryName: "Citra Lestari & Dimas",
        secondaryText: "Order #HK-2025-090 • 2 Vendor",
        type: "Prewed Outdoor & Gaun",
        subType: "Total: Rp 8.800.000",
        badgeText: "Gombong",
        badgeTone: "amber",
        statusText: "Fitting Terjadwal",
        statusDate: "12 Nov 2025",
      },
      {
        id: "hk-ord-03",
        primaryName: "Rina Wijaya & Fajar",
        secondaryText: "Order #HK-2025-091 • 4 Vendor",
        type: "Paket Lengkap Adat Jawa",
        subType: "Total: Rp 22.400.000",
        badgeText: "Ayah",
        badgeTone: "teal",
        statusText: "Lunas Escrow H+2",
        statusDate: "18 Nov 2025",
      },
      {
        id: "hk-ord-04",
        primaryName: "Lia Permata & Rizky",
        secondaryText: "Order #HK-2025-092 • 1 Vendor",
        type: "Dekorasi & Florist Fresh",
        subType: "Total: Rp 6.500.000",
        badgeText: "Karanganyar",
        badgeTone: "taupe",
        statusText: "Menunggu Review",
        statusDate: "20 Nov 2025",
      },
    ];
  }, [escrow]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ROW 1: 2/3 Spline Area Chart + 1/3 Semi Donut Gauge Dial */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardSplineChart
            title="Tren Transaksi & GMV Harian Platform"
            dateRangeLabel={dateRangeLabel}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            data={splineData}
            unitPrefix="Rp "
            unitSuffix=" Jt"
            lineColor="#C5A880" // Gilded Gold for Superadmin
            gradientFrom="#C5A880"
            gradientTo="#88735B"
            className="h-full"
          />
        </div>

        <div className="lg:col-span-1">
          <DashboardSemiDonutGauge
            title="Pangsa Pasar Layanan Kebumen"
            actionLabel="Audit"
            totalLabel="Total Transaksi"
            segments={gaugeSegments}
            className="h-full"
          />
        </div>
      </div>

      {/* ROW 2: 1/3 GMV + 1/3 Platform Fee + 1/3 Master Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card A: Total GMV */}
        <DashboardSparkBarCard
          title="Total Nilai Transaksi (GMV Bruto)"
          value={formatRupiah(effectiveGmv)}
          actionLabel="Rincian"
          delta={{
            direction: "up",
            percentage: "+28.4%",
            comparison: "vs bulan lalu",
          }}
          bars={gmvBars}
          barTone="emerald"
        />

        {/* Card B: Platform Fee (10%) */}
        <DashboardSparkBarCard
          title="Pendapatan Platform Fee (10%)"
          value={formatRupiah(platformFee)}
          actionLabel="Ledger"
          delta={{
            direction: "up",
            percentage: "+19.2%",
            comparison: "komisi bersih",
          }}
          bars={feeBars}
          barTone="amber"
        />

        {/* Card C: Master Calendar Schedule */}
        <DashboardScheduleTimeline
          title="Master Kalender Multi-Vendor"
          actionLabel="Lihat Peta"
          currentDate={currentDate}
          tabs={["Semua", "Akad & Resepsi", "Fitting", "Test Food"]}
          activeTab={scheduleTab}
          onTabChange={setScheduleTab}
          onPrevDate={() => setCurrentDateIndex((prev) => (prev > 0 ? prev - 1 : datesList.length - 1))}
          onNextDate={() => setCurrentDateIndex((prev) => (prev < datesList.length - 1 ? prev + 1 : 0))}
          events={masterEvents}
        />
      </div>

      {/* ROW 3: Full-Width Master Tracking & Escrow Table */}
      <DashboardTrackingTable
        title="Master Kliring Escrow & Transaksi Pengantin Kebumen"
        actionLabel="Lihat Semua Transaksi"
        columns={{
          col1: "CALON PENGANTIN & ID ORDER",
          col2: "PAKET & NILAI TRANSAKSI",
          col3: "KECAMATAN / VENUE",
          col4: "STATUS ESCROW & JADWAL",
        }}
        rows={tableRows}
      />
    </div>
  );
}
