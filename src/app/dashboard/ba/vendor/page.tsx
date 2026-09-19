import React from "react";
import { Store, CalendarDays } from "lucide-react";
import { getAmbassadorRecruitedVendors } from "@/server/queries/ambassador";
import { EmptyState } from "@/components/harikita/ui";

export const dynamic = "force-dynamic";

/**
 * Daftar vendor rekrutan BA — Server Component (BA-only via middleware).
 */
export default async function BaVendorsPage() {
  const vendors = await getAmbassadorRecruitedVendors();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-hk-charcoal">
          Vendor Rekrutan
        </h1>
        <p className="text-xs text-hk-charcoal/70 mt-0.5 font-manrope">
          Mitra vendor yang mendaftar menggunakan kode referral Anda.
        </p>
      </div>

      {vendors.length === 0 ? (
        <EmptyState
          title="Belum ada vendor rekrutan"
          description="Bagikan kode referral Anda ke calon mitra vendor untuk mulai merekrut dan mengumpulkan komisi."
          icon="inbox"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {vendors.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-2xl border border-hk-champagne/30 shadow-sm p-5 space-y-3"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-hk-soft-beige/60 text-hk-taupe">
                  <Store className="w-5 h-5" aria-hidden="true" />
                </span>
                <div className="flex-1">
                  <h3 className="font-editorial text-base font-bold text-hk-charcoal">
                    {v.businessName}
                  </h3>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-hk-soft-beige/80 text-hk-charcoal border border-hk-champagne/40">
                    {v.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-hk-charcoal/60 font-manrope">
                <CalendarDays className="w-3.5 h-3.5 text-hk-taupe" aria-hidden="true" />
                <span>Bergabung: {v.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
