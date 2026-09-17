import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Pusat Bantuan & FAQ",
  description:
    "Pertanyaan umum seputar pemesanan, escrow, jadwal fitting, undangan digital, dan cara kerja HariKita di Kabupaten Kebumen.",
  alternates: { canonical: "/help" },
};

const FAQ_ITEMS = [
  {
    question: "Apa itu HariKita dan siapa saja yang bisa menggunakannya?",
    answer:
      "HariKita adalah platform acara hyperlocal untuk Pre-wedding, Lamaran, dan Pernikahan Intim di Kabupaten Kebumen. Calon pengantin dapat menjelajah, meracik, dan memesan layanan dari 11 kategori jasa terkurasi.",
  },
  {
    question: "Apakah saya perlu membuat akun terlebih dahulu?",
    answer:
      "Tidak. Anda bebas menjelajah katalog, melihat portofolio, dan meracik paket tanpa akun. Akun singkat (nama & nomor WhatsApp) baru dibuat saat Anda mengajukan pesanan.",
  },
  {
    question: "Bagaimana skema pembayarannya?",
    answer:
      "Pembayaran menggunakan skema rekening bersama (escrow): DP 30% untuk mengunci tanggal, dan Pelunasan 70% paling lambat H-7 sebelum acara. Dana vendor dicairkan 30% pada H-3 dan 70% pada H+2 setelah acara sukses.",
  },
  {
    question: "Bagaimana cara kerja escrow / rekening bersama?",
    answer:
      "Dana Anda ditampung di rekening bersama terverifikasi, bukan langsung ke vendor. Pencairan dilakukan bertahap sesuai tahapan acara sehingga dana terlindungi sampai acara dinyatakan terlaksana.",
  },
  {
    question: "Bagaimana memastikan jadwal vendor tidak bentrok?",
    answer:
      "HariKita menyediakan matriks ketersediaan multi-vendor. Saat Anda memilih beberapa vendor di tanggal yang sama, sistem mengecek ketersediaan seluruh vendor sekaligus. Slot yang Anda pilih akan di-hold 15 menit saat check-out.",
  },
  {
    question: "Apa saja 11 kategori layanan yang tersedia?",
    answer:
      "Pre-wedding, Busana Pengantin & Fitting, MUA & Hijab, Kotak Seserahan & Mahar, Dokumentasi Foto-Video, Dekorasi & Florist, Katering & Food Stalls, Kue & Dessert Corner, Souvenir, Undangan Digital & Cetak, serta Ilustrasi Denah Lokasi Kartun.",
  },
  {
    question: "Apakah ada sesi fisik seperti fitting busana atau test food?",
    answer:
      "Ya. Untuk kategori tertentu (busana dan katering) tersedia sesi fisik terjadwal seperti 1st & Final Fitting serta Test Food. Jadwal ini otomatis masuk ke portal klien dan dashboard vendor.",
  },
  {
    question: "Bagaimana cara menyampaikan keluhan atau sengketa?",
    answer:
      "Anda dapat mengajukan sengketa melalui Resolution Center. Tim Super Admin akan menengahi dengan memperhatikan status escrow dan catatan transaksi yang telah tercatat.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd data={faqJsonLd(FAQ_ITEMS)} />

      <header className="mb-10 text-center">
        <span className="font-manrope text-xs font-bold uppercase tracking-widest text-hk-taupe">
          Pusat Bantuan
        </span>
        <h1 className="mt-3 font-editorial text-3xl font-normal text-hk-charcoal sm:text-4xl">
          Pertanyaan yang Sering Diajukan
        </h1>
        <p className="mx-auto mt-3 max-w-2xl font-manrope text-sm leading-relaxed text-hk-charcoal/70">
          Jawaban cepat seputar pemesanan, escrow, jadwal, dan undangan digital. Tidak menemukan
          jawabannya? Tim Concierge kami siap membantu.
        </p>
      </header>

      <div className="space-y-3">
        {FAQ_ITEMS.map((item, idx) => (
          <details
            key={idx}
            className="group rounded-hk-lg border border-hk-champagne/40 bg-white p-5 open:shadow-sm"
          >
            <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 font-manrope text-sm font-semibold text-hk-charcoal">
              <span>{item.question}</span>
              <span
                aria-hidden="true"
                className="shrink-0 text-hk-taupe transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 font-manrope text-sm leading-relaxed text-hk-charcoal/75">
              {item.answer}
            </p>
          </details>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center gap-4 rounded-hk-xl border border-hk-champagne/40 bg-hk-ivory/50 p-8 text-center">
        <h2 className="font-editorial text-xl text-hk-charcoal">Masih ada pertanyaan?</h2>
        <p className="max-w-md font-manrope text-sm text-hk-charcoal/70">
          Hubungi Concierge HariKita untuk konsultasi gratis seputar persiapan acara Anda di Kebumen.
        </p>
        <Link
          href="/contact"
          className="focus-ring inline-flex min-h-[44px] items-center justify-center rounded-full bg-hk-taupe px-6 py-3 font-manrope text-sm font-semibold text-white transition-colors hover:bg-[#78644e]"
        >
          Hubungi Kami
        </Link>
      </div>
    </div>
  );
}
