"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Scissors,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Modal, DatePicker } from "@/components/harikita/ui";
import { DashPageHeader } from "@/components/dashboard";
import type { OrderViewModel, PhysicalSessionDTO, RundownRowDTO } from "@/server/queries/orders";

interface PhysicalSession {
  id: string;
  title: string;
  vendor: string;
  category: string;
  date: string;
  time: string;
  location: string;
  status: "COMPLETED" | "CONFIRMED" | "SCHEDULED" | "RESCHEDULE_REQUESTED";
  statusLabel: string;
  notes: string;
  icon: any;
  mapsUrl: string;
}

export function ClientJadwalClient({
  activeOrder,
  dbSessions,
  dbRundown,
}: {
  activeOrder: OrderViewModel | null;
  dbSessions: PhysicalSessionDTO[];
  dbRundown: RundownRowDTO[];
}) {
  const [activeTab, setActiveTab] = useState<"sessions" | "rundown">("sessions");
  // Sesi hanya berasal dari database owner-scoped.
  const dbMappedSessions: PhysicalSession[] = dbSessions.map((s) => ({
    id: s.id,
    title: s.title,
    vendor: s.vendor,
    category: s.category,
    date: s.scheduledDate,
    time: "Menyesuaikan Jadwal",
    location: s.location,
    status:
      s.status === "COMPLETED"
        ? "COMPLETED"
        : s.status === "RESCHEDULED"
        ? "RESCHEDULE_REQUESTED"
        : "SCHEDULED",
    statusLabel:
      s.status === "COMPLETED" ? "Selesai Sesi" : "Terjadwal",
    notes: s.notes,
    icon: Scissors,
    mapsUrl: "https://maps.google.com/?q=Kebumen",
  }));

  // State: Dynamic Physical Sessions
  const [sessions, setSessions] = useState<PhysicalSession[]>(dbMappedSessions);

  // Modal Reschedule State
  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean;
    sessionId: string;
    newDate: string;
    reason: string;
  }>({
    isOpen: false,
    sessionId: "",
    newDate: "",
    reason: "",
  });

  const handleConfirmAttendance = (id: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: "CONFIRMED",
              statusLabel: "Kehadiran Dikonfirmasi",
            }
          : s
      )
    );
  };

  const handleOpenReschedule = (session: PhysicalSession) => {
    setRescheduleModal({
      isOpen: true,
      sessionId: session.id,
      newDate: "",
      reason: "",
    });
  };

  const handleSubmitReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleModal.newDate) return;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === rescheduleModal.sessionId
          ? {
              ...s,
              date: rescheduleModal.newDate,
              status: "RESCHEDULE_REQUESTED",
              statusLabel: "Pengajuan Reschedule Terkirim",
              notes: `Permintaan reschedule: ${rescheduleModal.reason || "Menyesuaikan jam kerja"}. Menunggu konfirmasi vendor.`,
            }
          : s
      )
    );
    setRescheduleModal({ isOpen: false, sessionId: "", newDate: "", reason: "" });
  };

  const dynamicRundown = dbRundown.map((r) => ({
          time: r.timeSlot,
          activity: r.activity,
          vendor: r.picName ?? "Mitra Vendor",
          location: r.location ?? activeOrder?.eventLocation ?? "Lokasi belum ditentukan",
          role: "",
        }));

  return (
    <div className="flex flex-col gap-6">
      <DashPageHeader
        title="Pelacak Sesi Fisik & Rundown Hari H"
        description="Kelola sesi fitting di Kebumen, pengantaran sample box test food, dan susunan rundown hari H terkoordinasi."
        action={activeOrder ?
          <Link
            href={`/hub-koordinasi?orderId=${activeOrder.id}`}
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full bg-hk-taupe px-4 text-xs font-semibold text-white hover:bg-hk-charcoal"
          >
            <Sparkles className="w-3.5 h-3.5 text-hk-champagne" />
            <span>Radar Hub Koordinasi</span>
          </Link>
        : undefined}
      />

      {/* Info Card Active Order */}
      {activeOrder ? <div className="bg-white rounded-3xl border border-hk-champagne/40 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-manrope uppercase tracking-wider font-bold text-hk-taupe">
            Acara Terkoneksi ({activeOrder.id})
          </span>
          <h2 className="font-editorial text-2xl font-normal text-hk-charcoal">
            {activeOrder.customerName}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs font-manrope text-hk-charcoal/80">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-hk-taupe" />
              <span>Hari H: <strong className="font-semibold text-hk-charcoal">{activeOrder.eventDate}</strong></span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-hk-taupe" />
              <span>{activeOrder.eventLocation}</span>
            </span>
          </div>
        </div>

        <Link
          href={`/pesanan/${activeOrder.id}/invoice`}
          className="px-4 py-2 rounded-full bg-hk-soft-beige/50 border border-hk-champagne/60 text-hk-charcoal text-xs font-manrope font-semibold hover:bg-white transition-colors self-start sm:self-auto shrink-0 flex items-center gap-1.5 shadow-2xs"
        >
          Lihat Invoice Resmi
        </Link>
      </div>
      : <div className="rounded-3xl border border-hk-champagne/40 bg-white p-8 text-center font-manrope text-sm text-hk-charcoal/70">
          Belum ada pesanan aktif. Jadwal sesi dan rundown akan muncul setelah pesanan dibuat.
        </div>}

      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 border-b border-hk-champagne/30 pb-3">
        <button
          onClick={() => setActiveTab("sessions")}
          className={`px-5 py-2.5 rounded-full text-xs font-manrope transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "sessions"
              ? "bg-hk-charcoal text-white font-bold shadow-xs"
              : "border border-hk-champagne/50 text-hk-charcoal/75 hover:bg-hk-soft-beige/40 hover:text-hk-charcoal font-medium"
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Sesi Fisik ({sessions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("rundown")}
          className={`px-5 py-2.5 rounded-full text-xs font-manrope transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "rundown"
              ? "bg-hk-charcoal text-white font-bold shadow-xs"
              : "border border-hk-champagne/50 text-hk-charcoal/75 hover:bg-hk-soft-beige/40 hover:text-hk-charcoal font-medium"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Rundown Hari H Otomatis{activeOrder ? ` (${activeOrder.eventDate})` : ""}</span>
        </button>
      </div>

      {activeTab === "sessions" ? (
        /* TAB 1: Sesi Fisik List */
        <div className="space-y-4">
          {sessions.length === 0 && (
            <div className="rounded-3xl border border-hk-champagne/40 bg-white p-8 text-center font-manrope text-sm text-hk-charcoal/70">
              Belum ada sesi fisik terjadwal.
            </div>
          )}
          {sessions.map((ses) => {
            const IconComponent = ses.icon;
            return (
              <div
                key={ses.id}
                className="bg-white rounded-3xl border border-hk-champagne/40 shadow-xs p-6 space-y-4 relative overflow-hidden transition-all hover:border-hk-taupe"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-hk-soft-beige/50 border border-hk-champagne/40 flex items-center justify-center text-hk-charcoal shrink-0">
                      <IconComponent className="w-6 h-6 text-hk-taupe" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-manrope uppercase tracking-wider font-bold text-hk-taupe bg-hk-soft-beige/60 px-2.5 py-0.5 rounded-full border border-hk-champagne/40">
                          {ses.category}
                        </span>
                        <span className="text-xs font-manrope text-hk-charcoal/70">Mitra: {ses.vendor}</span>
                      </div>
                      <h3 className="font-editorial text-2xl font-normal text-hk-charcoal mt-1">
                        {ses.title}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-manrope font-semibold self-start sm:self-center shrink-0 ${
                      ses.status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : ses.status === "CONFIRMED"
                        ? "bg-blue-50 text-blue-800 border border-blue-200"
                        : ses.status === "RESCHEDULE_REQUESTED"
                        ? "bg-purple-50 text-purple-800 border border-purple-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {ses.statusLabel}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-manrope text-hk-charcoal/80 pt-2 border-t border-hk-soft-beige/60">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-hk-taupe shrink-0" />
                    <span className="font-manrope tabular-nums">{ses.date} • {ses.time}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-4 h-4 text-hk-taupe shrink-0" />
                      <span className="truncate">{ses.location}</span>
                    </div>
                    <a
                      href={ses.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-hk-taupe hover:underline font-semibold flex items-center gap-0.5 shrink-0"
                    >
                      Peta <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-hk-soft-beige/30 border border-hk-champagne/30 text-xs font-manrope text-hk-charcoal/80">
                  <strong className="text-hk-charcoal block mb-0.5 font-semibold">Catatan Teknis Sesi:</strong>
                  {ses.notes}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-hk-soft-beige/60">
                  {ses.status !== "COMPLETED" && (
                    <>
                      <button
                        onClick={() => handleOpenReschedule(ses)}
                        className="px-4 py-2 rounded-full border border-hk-champagne/60 text-hk-charcoal hover:bg-hk-soft-beige/40 text-xs font-manrope font-semibold transition-colors cursor-pointer"
                      >
                        Ajukan Reschedule
                      </button>
                      {ses.status !== "CONFIRMED" && (
                        <button
                          onClick={() => handleConfirmAttendance(ses.id)}
                          className="px-4 py-2 rounded-full bg-hk-charcoal text-white hover:bg-hk-taupe text-xs font-manrope font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-hk-champagne" />
                          <span>Konfirmasi Kehadiran</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TAB 2: Rundown Hari H */
        <div className="bg-white rounded-3xl border border-hk-champagne/40 shadow-xs p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-hk-champagne/30 pb-4 gap-2">
            <div>
              <h3 className="font-editorial text-2xl font-normal text-hk-charcoal">
                Susunan Rundown Sinkron Multi-Vendor
              </h3>
              <p className="text-xs font-manrope text-hk-charcoal/70 mt-0.5">
                Sinkron secara otomatis ke jam hadir (call time) dashboard masing-masing vendor yang dipesan.
              </p>
            </div>
            <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-manrope font-semibold border border-emerald-200 self-start sm:self-auto">
              Status: Rundown tersinkron
            </span>
          </div>

          <div className="space-y-3">
            {dynamicRundown.length === 0 && (
              <p className="py-8 text-center font-manrope text-sm text-hk-charcoal/70">
                Rundown belum tersedia untuk pesanan ini.
              </p>
            )}
            {dynamicRundown.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-hk-soft-beige/25 border border-hk-champagne/30 gap-2 text-xs font-manrope hover:bg-white transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span className="font-manrope tabular-nums font-bold text-hk-charcoal bg-white px-3 py-1.5 rounded-lg border border-hk-champagne/40 shrink-0 text-xs shadow-2xs">
                    {item.time}
                  </span>
                  <div>
                    <strong className="text-hk-charcoal block text-sm font-semibold">
                      {item.activity}
                    </strong>
                    <span className="text-hk-charcoal/70 text-[11px]">
                      Lokasi: {item.location}
                    </span>
                  </div>
                </div>
                <div className="text-right text-[11px] font-manrope font-semibold text-hk-taupe self-end sm:self-center shrink-0">
                  {item.vendor}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      <Modal
        isOpen={rescheduleModal.isOpen}
        onClose={() => setRescheduleModal({ isOpen: false, sessionId: "", newDate: "", reason: "" })}
        title="Ajukan Reschedule Sesi Fisik"
        size="md"
      >
        <form onSubmit={handleSubmitReschedule} className="space-y-4 text-xs font-manrope">
          <div>
            <DatePicker
              id="reschedule-date"
              label="Pilih Tanggal Baru:"
              required
              value={rescheduleModal.newDate}
              onChange={(newDate) =>
                setRescheduleModal((prev) => ({ ...prev, newDate }))
              }
              placeholder="Pilih tanggal pengganti..."
              minDate={new Date()}
              displayFormat="EEEE, dd MMMM yyyy"
            />
          </div>

          <div>
            <label htmlFor="reschedule-reason" className="block text-hk-charcoal font-semibold mb-1">
              Alasan Perubahan Jadwal:
            </label>
            <textarea
              id="reschedule-reason"
              rows={3}
              placeholder="Contoh: Menyesuaikan jam kerja atau jadwal cuti keluarga..."
              value={rescheduleModal.reason}
              onChange={(e) =>
                setRescheduleModal((prev) => ({ ...prev, reason: e.target.value }))
              }
              className="focus-ring w-full p-3 rounded-xl border border-hk-champagne/60 focus:outline-none focus:border-hk-taupe bg-hk-ivory/50"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-hk-champagne/30">
            <button
              type="button"
              onClick={() => setRescheduleModal({ isOpen: false, sessionId: "", newDate: "", reason: "" })}
              className="focus-ring px-4 py-2 rounded-full border border-hk-champagne/60 text-hk-charcoal hover:bg-hk-soft-beige/40 cursor-pointer min-h-[44px]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="focus-ring px-5 py-2 rounded-full bg-hk-taupe text-white font-semibold hover:bg-[#78644e] transition-colors shadow-xs cursor-pointer min-h-[44px]"
            >
              Kirimkan Pengajuan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
