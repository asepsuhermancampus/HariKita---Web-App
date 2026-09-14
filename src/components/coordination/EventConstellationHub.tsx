"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Clock,
  MapPin,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Eye,
  Layers,
  Crown,
  Briefcase,
  SlidersHorizontal,
} from "lucide-react";

export type ConstellationRole = "pengantin" | "vendor" | "superadmin";

export interface EventSatelliteNode {
  id: string;
  category: string;
  vendorName: string;
  district: string;
  callTime: string; // e.g. "05.00 WIB"
  status: "standby" | "otw" | "active" | "completed";
  taskDesc: string;
  avatar?: string;
}

import { orderStore } from "@/lib/order-store";

export interface EventConstellationHubProps {
  initialRole?: ConstellationRole;
  activeVendorId?: string; // which vendor is currently viewing (if role=vendor)
  bookingId?: string;
  onVendorClick?: (vendor: EventSatelliteNode) => void;
}

// Mock Active Event Data (Module Scope)
const EVENT_DETAILS = {
  title: "Akad & Resepsi Pernikahan",
  couple: "Siti Rahmawati & Dimas Pratama",
  date: "Sabtu, 24 Oktober 2026",
  venue: "Gedung Bale Marmer, Kebumen Kota",
  countdown: "H-12 Hari Menuju Hari H",
};

// Satellite Vendor Nodes (Module Scope)
const SATELLITES: EventSatelliteNode[] = [
  {
    id: "v_mua",
    category: "Makeup Artist (MUA)",
    vendorName: "Alula MUA & Hijab",
    district: "Kebumen Kota",
    callTime: "05.00 WIB",
    status: "active",
    taskDesc: "Rias Pengantin Akad, Ronce Melati Asli & Hijab Styling",
  },
  {
    id: "v_busana",
    category: "Busana Pengantin",
    vendorName: "Griya Busana Rarasati",
    district: "Kebumen Kota",
    callTime: "06.00 WIB",
    status: "standby",
    taskDesc: "Fitting Akhir & Pemasangan Beskap Sikepan Adat Jawa",
  },
  {
    id: "v_dekor",
    category: "Dekorasi Pelaminan",
    vendorName: "Asmara Flora",
    district: "Gombong",
    callTime: "06.00 WIB",
    status: "standby",
    taskDesc: "Final Check Bunga Segar Pelaminan 6m & Karpet Pengantin",
  },
  {
    id: "v_foto",
    category: "Dokumentasi Hari H",
    vendorName: "Menganti Cinematic",
    district: "Ayah",
    callTime: "07.30 WIB",
    status: "otw",
    taskDesc: "Standby Liputan Pra-Akad, Drone Aerial & Cinematic Reels",
  },
  {
    id: "v_seserahan",
    category: "Seserahan & Mahar",
    vendorName: "Hantaran Lestari",
    district: "Karanganyar",
    callTime: "08.00 WIB",
    status: "completed",
    taskDesc: "Penataan 7 Baki Akrilik & Pigura Logam Mulia 3D di Meja Akad",
  },
  {
    id: "v_katering",
    category: "Katering Prasmanan",
    vendorName: "Dapur Rasa Boga",
    district: "Kutowinangun",
    callTime: "09.30 WIB",
    status: "standby",
    taskDesc: "Pramusaji Standby, Buffet 6 Menu & Food Stall Siap Santap",
  },
  {
    id: "v_cake",
    category: "Wedding Cake",
    vendorName: "L'Aura Patisserie",
    district: "Kebumen Kota",
    callTime: "10.00 WIB",
    status: "standby",
    taskDesc: "Setup Kue Pengantin 2 Tingkat & Meja Dessert Table",
  },
];

// Geometri Radial 9Router (Module Scope Constants)
const WIDTH = 1000;
const HEIGHT = 750;
const CX = WIDTH / 2; // 500
const CY = HEIGHT / 2; // 375
const RX = 370; // horizontal radius
const RY = 270; // vertical radius

export function EventConstellationHub({
  initialRole = "pengantin",
  activeVendorId = "v_mua",
  bookingId,
  onVendorClick,
}: EventConstellationHubProps) {
  const [role, setRole] = useState<ConstellationRole>(initialRole);
  const [selectedVendorId, setSelectedVendorId] = useState<string>(activeVendorId);
  const [selectedNode, setSelectedNode] = useState<EventSatelliteNode | null>(null);

  // Ambil order nyata jika bookingId disediakan
  const matchingOrder = bookingId ? orderStore.getOrderById(bookingId) : undefined;

  const eventDetails = matchingOrder
    ? {
        title: "Akad & Resepsi Pernikahan",
        couple: matchingOrder.customerName,
        date: matchingOrder.eventDate,
        venue: `${matchingOrder.eventLocation}, Kec. ${matchingOrder.district}`,
        countdown: "Jadwal Hari H Terkonfirmasi Escrow",
      }
    : EVENT_DETAILS;

  const satellites: EventSatelliteNode[] =
    matchingOrder && matchingOrder.items.length > 0
      ? matchingOrder.items.map((item, idx) => ({
          id: item.vendorId || `v_${idx}`,
          category: item.categoryTitle,
          vendorName: item.vendorName,
          district: item.district,
          callTime: item.callTime || "08.00 WIB",
          status: idx === 0 ? "active" : idx === 1 ? "standby" : idx === 2 ? "otw" : "standby",
          taskDesc: item.packageName,
        }))
      : SATELLITES;

  const width = WIDTH;
  const height = HEIGHT;
  const cx = CX;
  const cy = CY;
  const rx = RX;
  const ry = RY;

  // Memoized Geometry for 9Router Radial Constellation (Sub-millisecond instant render)
  const calculatedNodes = React.useMemo(() => {
    const total = satellites.length;

    return satellites.map((sat, i) => {
      const angle = (2 * Math.PI / total) * i - Math.PI / 2;
      const x = Math.round(CX + RX * Math.cos(angle));
      const y = Math.round(CY + RY * Math.sin(angle));

      // Quadratic Bezier Control Point (subtle curve bowing towards center)
      const cpx = Math.round(CX + (RX * 0.45) * Math.cos(angle + 0.15));
      const cpy = Math.round(CY + (RY * 0.45) * Math.sin(angle + 0.15));
      const path = `M ${CX} ${CY} Q ${cpx} ${cpy} ${x} ${y}`;

      return { ...sat, x, y, path };
    });
  }, [satellites]);

  const handleNodeClick = (node: EventSatelliteNode) => {
    setSelectedNode(node);
    if (role === "vendor") {
      setSelectedVendorId(node.id);
    }
    if (onVendorClick) {
      onVendorClick(node);
    }
  };

  return (
    <div className="w-full rounded-3xl bg-[#1C1618] border-2 border-hk-champagne/40 text-white shadow-2xl overflow-hidden">
      {/* Header Controller Bar */}
      <div className="p-5 sm:p-6 border-b border-hk-champagne/25 bg-[#251D20]/90 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-manrope font-bold text-hk-champagne uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-hk-champagne" />
            <span>Event Coordination Hub • HariKita Kebumen</span>
          </div>
          <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-white">
            Konstelasi Koordinasi Hari H (Model 9Router)
          </h3>
          <p className="font-manrope text-xs text-white/70">
            Pusat kendali kesiapan seluruh mitra vendor di tanggal acara pernikahan Anda.
          </p>
        </div>

        {/* Role Perspective Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/40 border border-hk-champagne/30 self-start md:self-auto">
          <span className="text-[10px] font-manrope font-semibold text-hk-champagne px-2.5 hidden sm:inline">
            Sudut Pandang:
          </span>
          <button
            type="button"
            onClick={() => setRole("pengantin")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-manrope font-bold transition-all ${
              role === "pengantin"
                ? "bg-hk-champagne text-hk-charcoal shadow-md"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Pengantin</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("vendor")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-manrope font-bold transition-all ${
              role === "vendor"
                ? "bg-hk-champagne text-hk-charcoal shadow-md"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Vendor (MUA)</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("superadmin")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-manrope font-bold transition-all ${
              role === "superadmin"
                ? "bg-hk-champagne text-hk-charcoal shadow-md"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Super Admin</span>
          </button>
        </div>
      </div>

      {/* Role State Banner Helper */}
      <div className="px-6 py-3 bg-[#171113] border-b border-hk-champagne/20 flex flex-wrap items-center justify-between text-xs font-manrope text-white/90 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-hk-champagne animate-ping" />
          <span>
            {role === "pengantin" && (
              <span>
                <strong>Mode Pengantin:</strong> Semua vendor dan pusat acara menyala aktif serentak. Seluruh tim kompak mendukung hari bahagia Anda.
              </span>
            )}
            {role === "vendor" && (
              <span>
                <strong>Mode Vendor ({satellites.find((s) => s.id === selectedVendorId)?.vendorName || "Alula MUA"}):</strong>{" "}
                Fokus utama menyorot tugas &amp; jam kehadiran Anda. Vendor lain tampil redup agar Anda fokus tampil optimal.
              </span>
            )}
            {role === "superadmin" && (
              <span>
                <strong>Mode Super Admin:</strong> Master radar seluruh pergerakan vendor Kebumen di Hari H.
              </span>
            )}
          </span>
        </div>

        <span className="text-[11px] text-hk-champagne font-mono font-semibold bg-hk-champagne/10 px-3 py-1 rounded-full border border-hk-champagne/30">
          {eventDetails.countdown}
        </span>
      </div>

      {/* Main Interactive Canvas Area (Desktop SVG) */}
      <div className="relative w-full overflow-hidden bg-radial from-[#2A1E23] via-[#1A1416] to-[#120D0F] min-h-[580px] flex items-center justify-center p-2 sm:p-4">
        {/* Subtle Ambient Background Grid & Concentric Circles */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <div className="w-full h-full bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:28px_28px]" />
        </div>

        {/* Concentric Orbit Guide Rings */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill="none"
            stroke="#C5A880"
            strokeWidth="1"
            strokeDasharray="4 8"
            className="opacity-30"
          />
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx * 0.55}
            ry={ry * 0.55}
            fill="none"
            stroke="#C5A880"
            strokeWidth="1"
            strokeDasharray="2 6"
            className="opacity-20"
          />

          {/* Curved Bezier Spoke Lines */}
          {calculatedNodes.map((node) => {
            const isSelf = role === "vendor" && node.id === selectedVendorId;
            const isDimmed = role === "vendor" && !isSelf;

            return (
              <g key={`path-${node.id}`}>
                {/* Glow layer for active path */}
                {(role === "pengantin" || isSelf || role === "superadmin") && (
                  <path
                    d={node.path}
                    fill="none"
                    stroke="#C5A880"
                    strokeWidth={isSelf ? "5" : "3"}
                    className={isDimmed ? "opacity-10" : "opacity-40 blur-xs"}
                  />
                )}

                {/* Main Bezier Curve */}
                <path
                  d={node.path}
                  fill="none"
                  stroke={isSelf ? "#F8F6F1" : "#C5A880"}
                  strokeWidth={isSelf ? "3.5" : "2"}
                  strokeDasharray={isSelf ? "8 4" : "5 5"}
                  className={`transition-all duration-500 ${
                    isDimmed
                      ? "opacity-20"
                      : "opacity-80 animate-pulse"
                  }`}
                />
              </g>
            );
          })}
        </svg>

        {/* Central Node: The Wedding Event */}
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 text-center transition-all duration-500"
          style={{ left: `${(cx / width) * 100}%`, top: `${(cy / height) * 100}%` }}
        >
          <div className="relative p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#332227] via-[#24171A] to-[#1B1114] border-2 border-hk-champagne shadow-[0_0_50px_rgba(197,168,128,0.35)] max-w-[290px] sm:max-w-[320px]">
            {/* Center Cameo Badge */}
            <div className="w-11 h-11 mx-auto -mt-11 mb-2.5 rounded-full bg-hk-champagne border-2 border-white flex items-center justify-center text-hk-charcoal shadow-lg">
              <Crown className="w-5 h-5 text-hk-charcoal" />
            </div>

            <span className="text-[10px] font-manrope font-bold uppercase tracking-widest text-hk-champagne block">
              {eventDetails.title}
            </span>

            <h4 className="font-editorial text-xl sm:text-2xl font-bold text-white mt-1 leading-tight">
              {eventDetails.couple}
            </h4>

            <div className="mt-3 pt-2.5 border-t border-hk-champagne/30 text-xs font-manrope space-y-1.5 text-white/85">
              <p className="flex items-center justify-center gap-1.5 font-semibold text-hk-champagne">
                <Calendar className="w-3.5 h-3.5 text-hk-champagne" />
                <span>{eventDetails.date}</span>
              </p>
              <p className="flex items-center justify-center gap-1 text-[11px] text-white/70">
                <MapPin className="w-3 h-3 text-hk-champagne" />
                <span>{eventDetails.venue}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Peripheral Satellite Nodes (Vendors) */}
        {calculatedNodes.map((node) => {
          const isSelf = role === "vendor" && node.id === selectedVendorId;
          const isDimmed = role === "vendor" && !isSelf;

          return (
            <div
              key={node.id}
              onClick={() => handleNodeClick(node)}
              className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-500 hover:scale-110 active:scale-95 ${
                isDimmed ? "opacity-35 hover:opacity-80" : "opacity-100"
              }`}
              style={{
                left: `${(node.x / width) * 100}%`,
                top: `${(node.y / height) * 100}%`,
              }}
            >
              <div
                className={`p-3 sm:p-3.5 rounded-2xl backdrop-blur-md transition-all shadow-xl max-w-[170px] sm:max-w-[190px] text-center ${
                  isSelf
                    ? "bg-[#2E1E23] border-2 border-hk-champagne ring-4 ring-hk-champagne/40 scale-105 shadow-[0_0_30px_rgba(197,168,128,0.4)]"
                    : "bg-[#251B1E]/90 hover:bg-[#34242A] border border-hk-champagne/40"
                }`}
              >
                {/* Call Time Badge */}
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-manrope font-bold bg-hk-champagne text-hk-charcoal shadow-2xs mb-1.5">
                  <Clock className="w-3 h-3 text-hk-charcoal" />
                  <span>{node.callTime}</span>
                </div>

                <h5 className="font-editorial text-sm sm:text-base font-bold text-white leading-tight line-clamp-1">
                  {node.vendorName}
                </h5>

                <p className="text-[10px] font-manrope text-hk-champagne/90 line-clamp-1 font-medium">
                  {node.category}
                </p>

                <div className="mt-1 flex items-center justify-center gap-1 text-[9px] font-manrope text-white/70">
                  <MapPin className="w-2.5 h-2.5 text-hk-champagne" />
                  <span>Kec. {node.district}</span>
                </div>

                {isSelf && (
                  <span className="mt-1.5 inline-block text-[9px] font-bold text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-500/40">
                    ★ Akun Anda Aktif
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Node Details Drawer (Bottom Inspector) */}
      {selectedNode && (
        <div className="p-5 sm:p-6 bg-[#251D20]/95 border-t border-hk-champagne/30 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-manrope font-bold bg-hk-champagne text-hk-charcoal">
                {selectedNode.category}
              </span>
              <span className="text-xs text-hk-champagne font-bold flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>Call Time: {selectedNode.callTime}</span>
              </span>
            </div>
            <h4 className="font-editorial text-2xl font-bold text-white">
              {selectedNode.vendorName}
            </h4>
            <p className="font-manrope text-xs text-white/80 max-w-xl">
              <strong>Tugas Hari H:</strong> {selectedNode.taskDesc} • Sesi di wilayah Kecamatan {selectedNode.district}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedNode(null)}
              className="px-4 py-2 rounded-full text-xs font-manrope font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-all border border-white/20"
            >
              Tutup Rincian
            </button>
            <span className="text-xs font-manrope text-emerald-300 bg-emerald-950/80 px-3.5 py-1.5 rounded-full border border-emerald-500/40 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Jadwal Tersinkronisasi</span>
            </span>
          </div>
        </div>
      )}

      {/* Mobile-Friendly Chronological Rundown List (Always accessible below canvas) */}
      <div className="p-5 sm:p-6 bg-[#161012] border-t border-hk-champagne/25">
        <h5 className="font-editorial text-lg font-bold text-hk-champagne mb-3.5 flex items-center gap-2">
          <Clock className="w-4 h-4 text-hk-champagne" />
          <span>Rundown Urutan Kehadiran Vendor di Hari H (Kebumen)</span>
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {satellites.map((s) => (
            <div
              key={s.id}
              onClick={() => handleNodeClick(s)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs font-manrope ${
                selectedNode?.id === s.id
                  ? "bg-hk-champagne/20 border-hk-champagne text-white shadow-sm"
                  : "bg-white/5 border-hk-champagne/20 text-white/85 hover:bg-white/10 hover:border-hk-champagne/40"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-hk-champagne font-mono bg-black/40 px-2 py-0.5 rounded-md border border-hk-champagne/30 text-[11px]">
                    {s.callTime}
                  </span>
                  <span className="font-semibold text-white">{s.vendorName}</span>
                </div>
                <p className="text-[11px] text-white/60">{s.category} • Kec. {s.district}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
