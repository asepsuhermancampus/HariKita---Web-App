import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ensureWeddingPlannerSeeded } from "@/server/services/wedding-planner-seed";
import { getKuaRequirements } from "@/server/queries/wedding-planner";
import { DashPageHeader } from "@/components/dashboard";
import { ClientKua } from "./ClientKua";

export const dynamic = "force-dynamic";

const FLOW = [
  { n: "1. RT/RW", d: "Surat Pengantar" },
  { n: "2. Kelurahan", d: "Form Model N1-N4" },
  { n: "3. Puskesmas", d: "Lab, TT & Elsimil" },
  { n: "4. KUA Asal", d: "Rekomendasi Nikah" },
  { n: "5. Simkah", d: "Daftar Min H-10" },
  { n: "6. Bayar PNBP", d: "Rp 600rb (Luar KUA)" },
  { n: "7. Bimwin", d: "Kursus & Setor Saksi" },
  { n: "8. Meja Akad", d: "TTD Buku Nikah" },
];

export default async function BerkasKuaPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login?callbackUrl=/client/berkas-kua");

  await ensureWeddingPlannerSeeded(session.userId);
  const requirements = await getKuaRequirements();

  return (
    <div className="flex flex-col gap-6">
      <DashPageHeader
        title="Berkas & Administrasi KUA"
        description="Persyaratan resmi PMA 20/2019 & Simkah Kemenag Gen 4, plus berkas khusus opsional sesuai profesi/kondisi Anda."
      />
      <ClientKua requirements={requirements} flow={FLOW} />
    </div>
  );
}
