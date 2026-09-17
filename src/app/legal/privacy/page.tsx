import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { SITE_CONTACT } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Kebijakan Privasi HariKita: bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda dalam layanan acara pernikahan hyperlocal Kebumen.",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Kebijakan Privasi"
      subtitle="Kami berkomitmen melindungi data pribadi Anda. Dokumen ini menjelaskan data apa yang kami kumpulkan, bagaimana kami menggunakannya, dan hak-hak Anda."
      updatedAt="2026-09-17"
      breadcrumbLabel="Kebijakan Privasi"
      breadcrumbPath="/legal/privacy"
      sections={[
        {
          heading: "1. Data yang Kami Kumpulkan",
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Identitas &amp; kontak:</strong> nama, nomor WhatsApp, alamat email, dan
                (untuk mitra vendor) data rekening bank serta identitas usaha.
              </li>
              <li>
                <strong>Detail acara:</strong> tanggal acara, lokasi/kecamatan di Kebumen, preferensi
                konsep, dan catatan khusus.
              </li>
              <li>
                <strong>Transaksi:</strong> rincian pesanan, riwayat pembayaran DP/Pelunasan, dan
                status escrow (rekening bersama).
              </li>
              <li>
                <strong>Teknis:</strong> data perangkat, alamat IP, dan interaksi halaman untuk
                keamanan serta analitik agregat.
              </li>
            </ul>
          ),
        },
        {
          heading: "2. Dasar & Tujuan Pemrosesan",
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Menghubungkan calon pengantin dengan mitra vendor lokal Kebumen.</li>
              <li>Memproses pesanan, verifikasi ketersediaan jadwal, dan pembayaran escrow.</li>
              <li>Mengirim notifikasi transaksional (konfirmasi, DP, jadwal fitting/test food).</li>
              <li>Mencegah penyalahgunaan, penipuan, dan kebocoran kontak antar-pihak.</li>
            </ul>
          ),
        },
        {
          heading: "3. Perlindungan Rekening Bersama (Escrow)",
          body: (
            <p>
              Dana yang Anda bayarkan ditampung pada rekening bersama terverifikasi. Kami memproses
              informasi pembayaran semata-mata untuk mengelola escrow sesuai skema DP 30% dan
              Pelunasan 70%, termasuk pencairan hak vendor pada H-3 dan H+2.
            </p>
          ),
        },
        {
          heading: "4. Berbagi Data",
          body: (
            <p>
              Kami hanya membagikan data yang diperlukan kepada mitra vendor terkait (mis. nama,
              nomor kontak, dan detail acara untuk koordinasi) dan penyedia layanan pembayaran.
              Kami tidak menjual data pribadi Anda kepada pihak ketiga.
            </p>
          ),
        },
        {
          heading: "5. Retensi Data",
          body: (
            <p>
              Data transaksi dan dokumen kontrak disimpan selama masa yang diperlukan untuk
              memenuhi kewajiban hukum dan penyelesaian sengketa. Data yang tidak lagi diperlukan
              akan dihapus atau dianonimkan secara berkala.
            </p>
          ),
        },
        {
          heading: "6. Hak Anda",
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Mengakses dan meminta salinan data pribadi Anda.</li>
              <li>Meminta koreksi data yang tidak akurat.</li>
              <li>Meminta penghapusan data sepanjang tidak bertentangan dengan kewajiban hukum.</li>
              <li>Menarik persetujuan untuk pemrosesan tertentu.</li>
            </ul>
          ),
        },
        {
          heading: "7. Keamanan",
          body: (
            <p>
              Kami menerapkan kontrol akses berbasis peran, enkripsi transport (HTTPS), dan
              pembatasan akses data keuangan. Lihat juga{" "}
              <a className="underline" href="/legal/data-processing">
                Pemberitahuan Pemrosesan Data
              </a>{" "}
              untuk detail teknis.
            </p>
          ),
        },
        {
          heading: "8. Kontak",
          body: (
            <p>
              Untuk permintaan terkait privasi, hubungi kami di{" "}
              <a className="underline" href={`mailto:${SITE_CONTACT.email}`}>
                {SITE_CONTACT.email}
              </a>{" "}
              atau melalui WhatsApp resmi HariKita.
            </p>
          ),
        },
      ]}
    />
  );
}
