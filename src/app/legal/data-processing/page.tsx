import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Pemberitahuan Pemrosesan Data",
  description:
    "Pemberitahuan Pemrosesan Data HariKita: kategori data, dasar pemrosesan, retensi, dan langkah keamanan teknis.",
  alternates: { canonical: "/legal/data-processing" },
};

export default function DataProcessingNoticePage() {
  return (
    <LegalPageLayout
      title="Pemberitahuan Pemrosesan Data"
      subtitle="Dokumen ini menjelaskan bagaimana data diproses dan dilindungi dalam operasional platform HariKita."
      updatedAt="2026-09-17"
      breadcrumbLabel="Pemrosesan Data"
      breadcrumbPath="/legal/data-processing"
      sections={[
        {
          heading: "1. Kategori Subjek Data",
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Calon pengantin &amp; keluarga (klien).</li>
              <li>Mitra vendor dan personel terkait.</li>
              <li>Pengunjung platform (data teknis agregat).</li>
            </ul>
          ),
        },
        {
          heading: "2. Kategori Data & Tujuan",
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Kontak &amp; identitas — komunikasi pesanan dan notifikasi.</li>
              <li>Detail acara — koordinasi jadwal dan ketersediaan.</li>
              <li>Data keuangan — pemrosesan escrow dan payout vendor.</li>
              <li>Data teknis — keamanan, pencegahan penyalahgunaan, dan analitik.</li>
            </ul>
          ),
        },
        {
          heading: "3. Lokasi & Penyimpanan",
          body: (
            <p>
              Data disimpan pada basis data terkelola dengan kontrol akses berbasis peran. Untuk
              lingkungan produksi, penyimpanan dapat berada pada penyedia cloud terpercaya dengan
              perlindungan enkripsi transport (HTTPS) dan, bila tersedia, enkripsi at-rest.
            </p>
          ),
        },
        {
          heading: "4. Langkah Keamanan Teknis",
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Autentikasi berbasis peran (Klien / Vendor / Admin) dan isolasi kepemilikan data.</li>
              <li>Validasi otoritatif harga &amp; transaksi di sisi server (anti-tamper).</li>
              <li>Pembukuan double-entry append-only untuk integritas keuangan.</li>
              <li>Rate limiting dan penyaringan kontak pada titik-titik sensitif.</li>
            </ul>
          ),
        },
        {
          heading: "5. Retensi & Penghapusan",
          body: (
            <p>
              Data disimpan selama diperlukan untuk operasional dan kewajiban hukum. Setelah masa
              retensi berakhir, data dihapus atau dianonimkan sesuai prosedur internal.
            </p>
          ),
        },
        {
          heading: "6. Sub-Prosesor",
          body: (
            <p>
              Kami dapat menggunakan penyedia layanan pihak ketiga (mis. gateway pembayaran, pengiriman
              notifikasi WhatsApp/email, dan hosting) yang terikat kewajiban kerahasiaan dan hanya
              memproses data untuk kepentingan layanan HariKita.
            </p>
          ),
        },
      ]}
    />
  );
}
