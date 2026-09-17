import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Pemberitahuan Cookie",
  description:
    "Pemberitahuan Cookie HariKita: jenis cookie yang kami gunakan dan cara Anda mengendalikannya.",
  alternates: { canonical: "/legal/cookies" },
};

export default function CookieNoticePage() {
  return (
    <LegalPageLayout
      title="Pemberitahuan Cookie"
      subtitle="Kami menggunakan cookie dan teknologi serupa secara minimal untuk menjalankan platform serta memahami penggunaan secara agregat."
      updatedAt="2026-09-17"
      breadcrumbLabel="Pemberitahuan Cookie"
      breadcrumbPath="/legal/cookies"
      sections={[
        {
          heading: "1. Apa Itu Cookie",
          body: (
            <p>
              Cookie adalah berkas kecil yang disimpan di perangkat Anda untuk mengingat preferensi
              dan menjaga sesi. Kami juga menggunakan penyimpanan lokal (localStorage) untuk fungsi
              tertentu seperti preferensi antarmuka.
            </p>
          ),
        },
        {
          heading: "2. Jenis Cookie yang Kami Gunakan",
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Esensial:</strong> diperlukan untuk autentikasi sesi, keamanan, dan fungsi
                inti (mis. keranjang racikan paket).
              </li>
              <li>
                <strong>Fungsional:</strong> mengingat preferensi seperti penutupan banner pemasangan
                aplikasi (PWA) selama 7 hari.
              </li>
              <li>
                <strong>Analitik (opsional):</strong> hanya aktif bila diaktifkan oleh operator
                platform, untuk mengukur penggunaan secara agregat dan anonim.
              </li>
            </ul>
          ),
        },
        {
          heading: "3. Mengendalikan Cookie",
          body: (
            <p>
              Anda dapat mengatur atau menghapus cookie melalui pengaturan peramban Anda. Menonaktifkan
              cookie esensial dapat memengaruhi fungsionalitas platform seperti proses pemesanan dan
              sesi masuk.
            </p>
          ),
        },
        {
          heading: "4. Perubahan",
          body: (
            <p>
              Pemberitahuan ini dapat diperbarui seiring perubahan layanan. Tanggal pembaruan terakhir
              tercantum di atas.
            </p>
          ),
        },
      ]}
    />
  );
}
