import type { Metadata } from "next";
import { MapPin, Mail, MessageCircle, Clock, Phone } from "lucide-react";
import { SITE_CONTACT } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Hubungi Kami",
  description:
    "Hubungi tim Concierge HariKita Kebumen via WhatsApp, email, atau kunjungi kami untuk konsultasi persiapan acara pernikahan Anda.",
  alternates: { canonical: "/contact" },
};

const WA_MESSAGE = encodeURIComponent(
  "Halo Concierge HariKita Kebumen, saya ingin konsultasi seputar persiapan acara (Pre-wedding / Lamaran / Pernikahan Intim)."
);

export default function ContactPage() {
  const channels = [
    {
      icon: MessageCircle,
      title: "WhatsApp Concierge",
      desc: "Respons tercepat, Senin–Sabtu 08.00–20.00 WIB.",
      action: { label: "Chat WhatsApp", href: `https://wa.me/${SITE_CONTACT.whatsapp}?text=${WA_MESSAGE}` },
      accent: "text-emerald-600",
    },
    {
      icon: Mail,
      title: "Email Resmi",
      desc: "Untuk pertanyaan resmi, kerja sama, atau dokumen.",
      action: { label: SITE_CONTACT.email, href: `mailto:${SITE_CONTACT.email}` },
      accent: "text-hk-taupe",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <span className="font-manrope text-xs font-bold uppercase tracking-widest text-hk-taupe">
          Kontak &amp; Bantuan
        </span>
        <h1 className="mt-3 font-editorial text-3xl font-normal text-hk-charcoal sm:text-4xl">
          Hubungi Concierge HariKita
        </h1>
        <p className="mx-auto mt-3 max-w-2xl font-manrope text-sm leading-relaxed text-hk-charcoal/70">
          Tim kami siap membantu Anda merangkai hari bahagia — mulai dari pemilihan vendor lokal
          Kebumen hingga koordinasi hari H.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {channels.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="rounded-hk-xl border border-hk-champagne/40 bg-white p-6 shadow-xs"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-full bg-hk-ivory ${c.accent}`}
                aria-hidden="true"
              >
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-editorial text-lg text-hk-charcoal">{c.title}</h2>
              <p className="mt-1 font-manrope text-sm text-hk-charcoal/70">{c.desc}</p>
              <a
                href={c.action.href}
                target={c.action.href.startsWith("http") ? "_blank" : undefined}
                rel={c.action.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="focus-ring mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full border border-hk-champagne bg-hk-ivory/60 px-5 py-2.5 font-manrope text-sm font-semibold text-hk-taupe transition-colors hover:bg-hk-ivory"
              >
                {c.action.label}
              </a>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-hk-xl border border-hk-champagne/40 bg-hk-ivory/40 p-6">
          <h2 className="flex items-center gap-2 font-editorial text-lg text-hk-charcoal">
            <MapPin className="h-5 w-5 text-hk-taupe" aria-hidden="true" />
            Wilayah Layanan
          </h2>
          <p className="mt-2 font-manrope text-sm leading-relaxed text-hk-charcoal/75">
            Pilot hyperlocal: <strong>Kabupaten Kebumen, Jawa Tengah</strong> — meliputi Kebumen Kota,
            Gombong, Ayah, Kutowinangun, Karangbolong, dan kecamatan sekitarnya.
          </p>
        </div>

        <div className="rounded-hk-xl border border-hk-champagne/40 bg-hk-ivory/40 p-6">
          <h2 className="flex items-center gap-2 font-editorial text-lg text-hk-charcoal">
            <Clock className="h-5 w-5 text-hk-taupe" aria-hidden="true" />
            Jam Operasional
          </h2>
          <ul className="mt-2 space-y-1 font-manrope text-sm text-hk-charcoal/75">
            <li className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-hk-taupe" aria-hidden="true" />
              Senin–Sabtu: 08.00–20.00 WIB
            </li>
            <li>Minggu & hari besar: berdasarkan janji temu</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
