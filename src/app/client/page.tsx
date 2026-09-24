import React from "react";
import Link from "next/link";
import { CalendarHeart, Sparkles, Clock } from "lucide-react";
import { getClientPlannerOverview } from "@/server/queries/wedding-planner";
import { getClientOrderViewModels } from "@/server/queries/orders";
import {
  DashPageHeader,
  DashCard,
  DashStatCard,
  DashboardSemiDonutGauge,
} from "@/components/dashboard";
import { formatRupiah } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientPortalPage() {
  const [overview, orders] = await Promise.all([
    getClientPlannerOverview(),
    getClientOrderViewModels(),
  ]);

  const couple = overview.partnerName
    ? `${overview.coupleName} & ${overview.partnerName}`
    : overview.coupleName;
  const r = overview.readiness;

  return (
    <div className="flex flex-col gap-8">
      <DashPageHeader
        title={`Selamat Datang, ${couple}`}
        description="Pusat kendali persiapan pernikahan Anda: progres, anggaran, jadwal, dan undangan."
        action={
          <Link
            href="/client/perencanaan"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-hk-champagne/60 bg-white px-4 text-xs font-semibold text-hk-charcoal hover:bg-hk-soft-beige/40"
          >
            <Sparkles className="h-3.5 w-3.5 text-hk-taupe" /> Mulai Persiapan
          </Link>
        }
      />

      {/* Countdown */}
      <div className="relative overflow-hidden rounded-3xl border border-hk-champagne/40 bg-white p-6 sm:p-8">
        <div className="absolute -bottom-10 -right-10 h-44 w-44 rounded-full border border-hk-champagne/20" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-hk-champagne/40 bg-hk-soft-beige/60">
              <CalendarHeart className="h-6 w-6 text-hk-taupe" />
            </div>
            <div>
              <div className="font-manrope text-[11px] font-bold uppercase tracking-wider text-hk-taupe">
                Menuju Hari H
              </div>
              <div className="font-editorial text-xl text-hk-charcoal">
                {overview.eventDate ?? "Tanggal acara belum diset"}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-editorial text-5xl font-bold tabular-nums text-hk-charcoal">
              {overview.daysUntilEvent !== null && overview.daysUntilEvent > 0
                ? overview.daysUntilEvent
                : overview.daysUntilEvent === 0
                ? "0"
                : "—"}
            </div>
            <div className="font-manrope text-[11px] font-semibold text-hk-taupe">
              {overview.daysUntilEvent === null
                ? "Lengkapi tanggal di Profil"
                : overview.daysUntilEvent > 0
                ? "Hari lagi"
                : overview.daysUntilEvent === 0
                ? "Hari ini hari bahagia!"
                : "Acara telah berlangsung"}
            </div>
          </div>
        </div>
      </div>

      {/* Readiness + stats */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DashboardSemiDonutGauge
          title="Kesiapan Pernikahan"
          totalLabel="Progres"
          segments={[
            { label: "% Selesai", value: r.overallPct, color: "#88735B" },
            { label: "% Sisa", value: Math.max(0, 100 - r.overallPct), color: "#E8DED1" },
          ]}
        />
        <div className="flex flex-col gap-4">
          <DashStatCard label="Timeline Selesai" value={`${r.timeline.pct}%`} delta={`${r.timeline.done}/${r.timeline.total} tugas`} deltaTone="ok" />
          <DashStatCard label="Berkas KUA" value={`${r.kua.pct}%`} delta={`${r.kua.done}/${r.kua.total} berkas`} deltaTone="ok" />
        </div>
        <div className="flex flex-col gap-4">
          <DashStatCard label="Estimasi Anggaran" value={formatRupiah(r.budget.estimated)} />
          <DashStatCard label="Sudah Terbayar" value={formatRupiah(r.budget.paid)} delta={`Sisa ${formatRupiah(r.budget.remaining)}`} deltaTone="warn" />
        </div>
      </div>

      {/* Sesi terdekat + pesanan */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashCard title="Sesi Fisik Terdekat">
          {overview.nextSession ? (
            <div className="space-y-1.5 font-manrope text-sm">
              <div className="font-semibold text-hk-charcoal">{overview.nextSession.title}</div>
              <div className="flex items-center gap-1.5 text-xs text-hk-charcoal/70">
                <Clock className="h-3.5 w-3.5 text-hk-taupe" /> {overview.nextSession.scheduledDate}
              </div>
              <p className="text-xs text-hk-taupe">{overview.nextSession.location}</p>
            </div>
          ) : (
            <p className="font-manrope text-sm text-hk-taupe">Belum ada sesi terjadwal.</p>
          )}
          <Link href="/client/jadwal" className="mt-4 inline-flex items-center gap-1.5 font-manrope text-xs font-semibold text-hk-taupe hover:text-hk-charcoal">
            Lihat semua jadwal
          </Link>
        </DashCard>

        <DashCard title={`Pesanan Aktif (${orders.length})`}>
          {orders.length === 0 ? (
            <p className="font-manrope text-sm text-hk-taupe">Belum ada pesanan. Racik paket di Builder.</p>
          ) : (
            <ul className="space-y-3">
              {orders.slice(0, 3).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 border-b border-hk-soft-beige/60 pb-3 last:border-0">
                  <div className="min-w-0">
                    <div className="truncate font-manrope text-sm font-semibold text-hk-charcoal">{o.bookingId}</div>
                    <div className="font-manrope text-[11px] text-hk-taupe">{o.eventDate} • {o.items.length} layanan</div>
                  </div>
                  <span className="font-manrope text-xs font-bold tabular-nums text-hk-charcoal">{formatRupiah(o.financials.totalAmount)}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/client/pesanan" className="mt-4 inline-flex items-center gap-1.5 font-manrope text-xs font-semibold text-hk-taupe hover:text-hk-charcoal">
            Lihat semua pesanan
          </Link>
        </DashCard>
      </div>

      {/* Quick links ke modul planner */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickLink href="/client/perencanaan" label="Timeline" />
        <QuickLink href="/client/berkas-kua" label="Berkas KUA" />
        <QuickLink href="/client/anggaran" label="Anggaran" />
        <QuickLink href="/client/katering" label="Katering" />
      </div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex min-h-11 items-center justify-center rounded-2xl border border-hk-champagne/40 bg-white px-4 py-3 font-manrope text-xs font-semibold text-hk-charcoal hover:bg-hk-soft-beige/40"
    >
      {label}
    </Link>
  );
}
