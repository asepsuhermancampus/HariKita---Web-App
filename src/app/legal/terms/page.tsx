import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description:
    "Syarat dan Ketentuan penggunaan platform HariKita untuk calon pengantin dan mitra vendor di Kabupaten Kebumen.",
  alternates: { canonical: "/legal/terms" },
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Syarat & Ketentuan"
      subtitle="Dengan menggunakan platform HariKita, Anda menyetujui ketentuan berikut yang mengatur hubungan antara klien, mitra vendor, dan platform."
      updatedAt="2026-09-17"
      breadcrumbLabel="Syarat & Ketentuan"
      breadcrumbPath="/legal/terms"
      sections={[
        {
          heading: "1. Definisi Pihak",
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Klien:</strong> calon pengantin/keluarga yang memesan layanan.</li>
              <li><strong>Mitra Vendor:</strong> penyedia jasa lokal Kebumen yang terkurasi.</li>
              <li><strong>Platform (HariKita):</strong> penyedia sarana pemesanan, escrow, dan koordinasi.</li>
            </ul>
          ),
        },
        {
          heading: "2. Akun & Registrasi",
          body: (
            <p>
              Registrasi ringan (nama &amp; nomor WhatsApp) dilakukan saat mengajukan pesanan. Anda
              bertanggung jawab menjaga kerahasiaan PIN dan keakuratan data yang diberikan.
            </p>
          ),
        },
        {
          heading: "3. Pemesanan & Ketersediaan Jadwal",
          body: (
            <p>
              Ketersediaan slot tanggal bersifat sementara saat proses pemesanan (hold 15 menit) dan
              menjadi pasti setelah semua vendor terkait menerima pesanan dan pembayaran DP
              dikonfirmasi. HariKita menyediakan matriks ketersediaan multi-vendor untuk mengurangi
              risiko bentrok jadwal.
            </p>
          ),
        },
        {
          heading: "4. Skema Pembayaran & Escrow",
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>DP sebesar 30% untuk mengunci tanggal acara.</li>
              <li>Pelunasan 70% paling lambat H-7 sebelum acara.</li>
              <li>
                Pencairan hak vendor: 30% pada H-3 (operasional) dan 70% pada H+2 setelah acara
                dinyatakan sukses.
              </li>
            </ul>
          ),
        },
        {
          heading: "5. Kewajiban Mitra Vendor",
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Memberikan informasi paket, harga, dan SLA secara akurat.</li>
              <li>Memperbarui kalender blackout untuk tanggal yang tidak tersedia.</li>
              <li>Tidak mengalihkan transaksi keluar platform (anti-disintermediasi).</li>
            </ul>
          ),
        },
        {
          heading: "6. Pembatalan, Refund & Sengketa",
          body: (
            <p>
              Kebijakan pembatalan mengikuti ketentuan kontrak digital per pesanan. Sengketa
              diselesaikan melalui Resolution Center dengan mediasi Super Admin, dengan memperhatikan
              status escrow dan jurnal keuangan yang telah tercatat.
            </p>
          ),
        },
        {
          heading: "7. Batasan Tanggung Jawab",
          body: (
            <p>
              HariKita berperan sebagai penyedia platform dan penampung dana (escrow). Pelaksanaan
              jasa sepenuhnya menjadi tanggung jawab mitra vendor sesuai perjanjian (SLA) yang
              disepakati.
            </p>
          ),
        },
        {
          heading: "8. Perubahan Ketentuan",
          body: (
            <p>
              Kami dapat memperbarui ketentuan ini dari waktu ke waktu. Perubahan material akan
              diinformasikan melalui platform. Penggunaan berkelanjutan berarti Anda menyetujui versi
              terbaru.
            </p>
          ),
        },
      ]}
    />
  );
}
