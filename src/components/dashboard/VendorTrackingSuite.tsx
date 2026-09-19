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
import { VendorProfileData } from "@/server/actions/vendor-profile";
import { formatRupiah } from "@/lib/utils";

interface VendorTrackingSuiteProps {
  data: VendorProfileData;
  className?: string;
}

export function VendorTrackingSuite({ data, className = "" }: VendorTrackingSuiteProps) {
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("7d");
  const [scheduleTab, setScheduleTab] = useState<string>("Semua");
  const [currentDateIndex, setCurrentDateIndex] = useState<number>(0);

  const datesList = ["10 Nov 2025", "11 Nov 2025", "12 Nov 2025"];
  const currentDate = datesList[currentDateIndex] || "10 Nov 2025";

  const totalViews = data.viewsGuest + data.viewsAuth;
  const totalOrders = data.ordersSolo + data.ordersCombo;
  const grossEstimatedRevenue = totalOrders * 1250000 + data.walletBalance;
  const netVendorRevenue = Math.round(grossEstimatedRevenue * 0.9);

  // 1. Generate Spline Data based on selected timeframe
  const splineData: SplinePoint[] = useMemo(() => {
    const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90;
    const points: SplinePoint[] = [];
    const baseVal = Math.max(8, Math.round(totalViews / (days * 0.6)));

    const now = new Date(2025, 10, 10); // 10 Nov 2025 as reference demo anchor
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayNum = d.getDate();
      const dayName = d.toLocaleDateString("id-ID", { weekday: "short" });
      const monthShort = d.toLocaleDateString("id-ID", { month: "short" });

      // Natural deterministic wave variation
      const wave = Math.sin((days - i) * 0.5) * 0.3 + 1;
      const hash = (dayNum * 19 + i * 11) % 15;
      const val = Math.max(2, Math.round((baseVal + hash) * wave));

      points.push({
        date: `${dayNum} ${monthShort} 2025`,
        label: days <= 7 ? `${dayName}, ${dayNum}` : `${dayNum} ${monthShort}`,
        value: val,
        deltaPct: hash % 2 === 0 ? `+${12 + (hash % 10)}%` : `+${15 + (hash % 8)}%`,
      });
    }
    return points;
  }, [timeframe, totalViews]);

  // Date range label
  const dateRangeLabel = useMemo(() => {
    if (splineData.length === 0) return "8 Nov 2025 - 14 Nov 2025";
    return `${splineData[0].label} - ${splineData[splineData.length - 1].label}`;
  }, [splineData]);

  // 2. Semi Donut Gauge Data: Solo Orders vs Combo Orders
  const gaugeSegments: [
    { label: string; sublabel: string; value: number; color: string },
    { label: string; sublabel: string; value: number; color: string }
  ] = [
    {
      label: "Pesanan Solo",
      sublabel: "Layanan mandiri studio",
      value: Math.max(1, data.ordersSolo),
      color: "#F59E0B", // Vibrant Amber from reference image
    },
    {
      label: "Kolaborasi Paket",
      sublabel: "Kombinasi MUA & Dekor",
      value: Math.max(1, data.ordersCombo),
      color: "#10B981", // Vibrant Emerald from reference image
    },
  ];

  // 3. Sparkline Micro Bars
  // Card A: Omset harian 7 hari terakhir
  const revenueBars = [
    { label: "Sen", value: 3200000, tooltip: "Senin: Rp 3.200.000" },
    { label: "Sel", value: 4800000, tooltip: "Selasa: Rp 4.800.000" },
    { label: "Rab", value: 8500000, tooltip: "Rabu: Rp 8.500.000" },
    { label: "Kam", value: 5400000, tooltip: "Kamis: Rp 5.400.000" },
    { label: "Jum", value: 12000000, tooltip: "Jumat: Rp 12.000.000" },
    { label: "Sab", value: 9200000, tooltip: "Sabtu: Rp 9.200.000" },
    { label: "Min", value: 14500000, tooltip: "Minggu: Rp 14.500.000" },
  ];

  // Card B: Escrow harian menunggu pencairan H-3 & H+2
  const escrowBars = [
    { label: "H-7", value: 2400000, tooltip: "Terkunci DP: Rp 2.400.000" },
    { label: "H-5", value: 4200000, tooltip: "Terkunci DP: Rp 4.200.000" },
    { label: "H-3", value: 6500000, tooltip: "Cair Operasional: Rp 6.500.000" },
    { label: "H-1", value: 3800000, tooltip: "Menunggu Hari H: Rp 3.800.000" },
    { label: "Hari H", value: 8900000, tooltip: "Sesi Berjalan: Rp 8.900.000" },
    { label: "H+1", value: 5100000, tooltip: "Audit Klien: Rp 5.100.000" },
    { label: "H+2", value: 11200000, tooltip: "Siap Cair Rekening: Rp 11.200.000" },
  ];

  // 4. Agenda Sesi Fisik Terdekat di Kebumen
  const allEvents: ScheduleItem[] = [
    {
      id: "evt-1",
      startTime: "09:30 WIB",
      endTime: "11:00 WIB",
      category: "Fitting Gaun Pengantin",
      title: "1st Fitting Gaun Resepsi Modern & Beskap",
      personName: "Anisa Rahma & Bagus Setiawan",
      venue: "Studio Menganti, Jl. Pahlawan Kebumen",
      accentColor: "amber",
    },
    {
      id: "evt-2",
      startTime: "13:30 WIB",
      endTime: "15:00 WIB",
      category: "Test Food Katering",
      title: "Sesi Pencicipan 5 Menu Utama Katering Intimate",
      personName: "Dimas Prasetyo & Citra Lestari",
      venue: "Atelier Rasa, Gombong Kebumen",
      accentColor: "emerald",
    },
    {
      id: "evt-3",
      startTime: "16:00 WIB",
      endTime: "17:30 WIB",
      category: "Technical Meeting",
      title: "Final Rundown Sync dengan WO & MUA Adat",
      personName: "Fajar Pratama & Rina Wijaya",
      venue: "Meotel Ballroom Kebumen",
      accentColor: "teal",
    },
    {
      id: "evt-4",
      startTime: "19:00 WIB",
      endTime: "20:30 WIB",
      category: "Fitting Busana Ortu",
      title: "Penyesuaian Ukuran Kebaya Orang Tua & Beskap",
      personName: "Keluarga Bapak Hendro",
      venue: "Galeri Busana Pengantin, Karanganyar",
      accentColor: "taupe",
    },
  ];

  const filteredEvents = useMemo(() => {
    if (scheduleTab === "Semua") return allEvents;
    if (scheduleTab === "Fitting") {
      return allEvents.filter((e) => e.category.toLowerCase().includes("fitting"));
    }
    if (scheduleTab === "Test Food") {
      return allEvents.filter((e) => e.category.toLowerCase().includes("test food"));
    }
    if (scheduleTab === "Hari H") {
      return allEvents.filter((e) => e.category.toLowerCase().includes("rundown") || e.category.toLowerCase().includes("acara"));
    }
    return allEvents;
  }, [scheduleTab]);

  // 5. Tabel Pelacakan Pesanan Masuk
  const trackingRows: TrackingTableRow[] = [
    {
      id: "ord-101",
      primaryName: "Anisa Rahma & Bagus",
      secondaryText: "WhatsApp: 0812-8822-9011",
      type: "Paket Prewed Sunset & Fitting",
      subType: "Outdoor Pantai Menganti + Studio",
      badgeText: "Kebumen Kota",
      badgeTone: "emerald",
      statusText: "DP 30% Terkunci",
      statusDate: "10 Nov 2025",
    },
    {
      id: "ord-102",
      primaryName: "Citra Lestari & Dimas",
      secondaryText: "WhatsApp: 0813-9911-3422",
      type: "Paket Intimate Wedding All-In",
      subType: "Kolaborasi Foto + MUA + Gaun",
      badgeText: "Gombong",
      badgeTone: "amber",
      statusText: "Fitting 1st Selesai",
      statusDate: "12 Nov 2025",
    },
    {
      id: "ord-103",
      primaryName: "Rina Wijaya & Fajar",
      secondaryText: "WhatsApp: 0857-2233-8819",
      type: "Liputan Hari H Cinematic",
      subType: "Teaser Reels + Box Flashdisk",
      badgeText: "Ayah",
      badgeTone: "teal",
      statusText: "Pelunasan 70% Escrow",
      statusDate: "18 Nov 2025",
    },
    {
      id: "ord-104",
      primaryName: "Lia Permata & Rizky",
      secondaryText: "WhatsApp: 0878-1144-6620",
      type: "Sewa Busana Adat Jawa Klasik",
      subType: "Beskap Lengkap + Ronce Melati",
      badgeText: "Karanganyar",
      badgeTone: "taupe",
      statusText: "Selesai & Review",
      statusDate: "20 Nov 2025",
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ROW 1: 2/3 Spline Area Chart + 1/3 Semi Donut Gauge Dial */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardSplineChart
            title="Tren Kunjungan & Minat Pengantin"
            dateRangeLabel={dateRangeLabel}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            data={splineData}
            unitSuffix=" Kunjungan"
            lineColor="#10B981"
            gradientFrom="#10B981"
            gradientTo="#10B981"
            className="h-full"
          />
        </div>

        <div className="lg:col-span-1">
          <DashboardSemiDonutGauge
            title="Rasio Pesanan Studio"
            actionLabel="Lihat Semua"
            totalLabel="Total Pesanan"
            segments={gaugeSegments}
            className="h-full"
          />
        </div>
      </div>

      {/* ROW 2: 1/3 Spark Bar Omset + 1/3 Spark Bar Escrow + 1/3 Schedule Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card A: Omset Bersih 90% */}
        <DashboardSparkBarCard
          title="Total Omset Bersih (90% Hak Studio)"
          value={formatRupiah(netVendorRevenue)}
          actionLabel="Rincian"
          delta={{
            direction: "up",
            percentage: "+24.8%",
            comparison: "vs minggu lalu",
          }}
          bars={revenueBars}
          barTone="emerald"
          className="h-[350px] lg:h-[355px]"
        />

        {/* Card B: Dana Escrow Tertahan */}
        <DashboardSparkBarCard
          title="Dana Escrow Rekening Bersama"
          value={formatRupiah(data.walletBalance + 8500000)}
          actionLabel="Jadwal Cair"
          delta={{
            direction: "up",
            percentage: "+15.2%",
            comparison: "aman di escrow",
          }}
          bars={escrowBars}
          barTone="amber"
          className="h-[350px] lg:h-[355px]"
        />

        {/* Card C: Schedule Agenda Timeline */}
        <DashboardScheduleTimeline
          title="Agenda Sesi Fisik Terdekat"
          actionLabel="Buka Kalender"
          actionHref="/dashboard/vendor/kalender"
          currentDate={currentDate}
          tabs={["Semua", "Fitting", "Test Food", "Hari H"]}
          activeTab={scheduleTab}
          onTabChange={setScheduleTab}
          onPrevDate={() => setCurrentDateIndex((prev) => (prev > 0 ? prev - 1 : datesList.length - 1))}
          onNextDate={() => setCurrentDateIndex((prev) => (prev < datesList.length - 1 ? prev + 1 : 0))}
          events={filteredEvents}
          className="h-[350px] lg:h-[355px]"
        />
      </div>

      {/* ROW 3: Full-Width Order Tracking Table */}
      <DashboardTrackingTable
        title="Daftar Pesanan & Pelacakan Klien Masuk"
        actionLabel="Lihat Semua (24)"
        columns={{
          col1: "CALON PENGANTIN",
          col2: "PAKET & LAYANAN",
          col3: "KECAMATAN / VENUE",
          col4: "STATUS & TANGGAL ACARA",
        }}
        rows={trackingRows}
      />
    </div>
  );
}
