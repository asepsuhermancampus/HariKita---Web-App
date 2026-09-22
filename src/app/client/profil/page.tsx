import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Heart,
  Calendar,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { getClientProfile } from "@/server/actions/client-profile";
import { ClientProfileForm } from "./ClientProfileForm";
import { DashPageHeader } from "@/components/dashboard";

export const metadata = {
  title: "Profil & Data Diri Pengantin • HariKita Kebumen",
  description:
    "Pengaturan profil pengantin, tanggal acara, lokasi pelaksanaan di Kebumen, dan preferensi tema pernikahan.",
};

export default async function ClientProfilePage() {
  const profile = await getClientProfile();

  if (!profile) {
    redirect("/auth/login?callbackUrl=/client/profil");
  }

  // Hitung sisa hari menuju hari H jika tanggal acara sudah diisi
  let daysUntilEvent: number | null = null;
  if (profile.eventDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const event = new Date(profile.eventDate);
    event.setHours(0, 0, 0, 0);
    const diffTime = event.getTime() - today.getTime();
    daysUntilEvent = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="flex flex-col gap-8">
      <DashPageHeader
        title={`Data Diri: ${profile.name}${profile.partnerName ? ` & ${profile.partnerName}` : ""}`}
        description="Data ini digunakan untuk kontrak digital SLA, sinkronisasi jadwal fitting, dan penentuan logistik vendor se-Kebumen."
        action={
          <Link
            href="/client/undangan"
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border border-hk-champagne/60 bg-white px-4 text-xs font-semibold text-hk-charcoal hover:bg-hk-soft-beige/40"
          >
            <ExternalLink className="w-3.5 h-3.5 text-hk-taupe" />
            <span>Kelola Undangan &amp; Tamu</span>
          </Link>
        }
      />

      {/* Couple Summary Card Banner */}
      <div className="rounded-3xl bg-white border border-hk-champagne/40 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle Decorative Background Ring */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full border border-hk-champagne/20 pointer-events-none" />
        <div className="absolute right-8 bottom-8 w-24 h-24 rounded-full border border-hk-champagne/25 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-hk-taupe font-manrope">
                Pasangan Bahagia HariKita
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-hk-soft-beige text-hk-charcoal font-semibold font-manrope border border-hk-champagne/40">
                Pilot Kebumen
              </span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl font-normal text-hk-charcoal flex items-center gap-2.5">
              <span>{profile.name}</span>
              <Heart className="w-5 h-5 text-hk-taupe fill-hk-taupe/30" />
              <span>{profile.partnerName || "Mempelai Pasangan"}</span>
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs font-manrope text-hk-charcoal/80 pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-hk-taupe" />
                <span>
                  {profile.eventDate
                    ? `Hari H: ${profile.eventDate}`
                    : "Tanggal Acara Belum Diset"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-hk-taupe" />
                <span>
                  {profile.eventLocation
                    ? `${profile.eventLocation}, Kec. ${profile.district}`
                    : `Kabupaten Kebumen (Kec. ${profile.district || "Kebumen"})`}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">
                  Akun Escrow Aktif
                </span>
              </div>
            </div>
          </div>

          {/* Countdown Pill if eventDate is set */}
          {daysUntilEvent !== null && (
            <div className="bg-hk-soft-beige/30 border border-hk-champagne/40 rounded-2xl p-4 text-center shrink-0 shadow-2xs font-manrope">
              <div className="text-[10px] uppercase font-bold tracking-wider text-hk-charcoal/70 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-hk-taupe" />
                <span>Hitung Mundur</span>
              </div>
              <div className="text-4xl font-editorial font-bold text-hk-charcoal mt-0.5 tabular-nums">
                {daysUntilEvent > 0 ? daysUntilEvent : 0}
              </div>
              <div className="text-[11px] font-semibold text-hk-taupe">
                {daysUntilEvent > 0
                  ? "Hari Menuju Hari H"
                  : daysUntilEvent === 0
                  ? "Hari Ini Hari Bahagia!"
                  : "Acara Telah Berlangsung"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Profile Form */}
      <ClientProfileForm initialData={profile} />
    </div>
  );
}
