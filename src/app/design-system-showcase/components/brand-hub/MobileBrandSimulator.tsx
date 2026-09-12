'use client';

import React, { useState } from 'react';
import { Smartphone } from 'lucide-react';
import { ButtonGhost } from '@/components/harikita/ui';
import {
  MobileHeader,
  MobileHero,
  MobileServiceCard,
  MobileInvitationPreview,
  MobileBottomNav,
  MobileStickyBookingBar,
} from '@/components/harikita/mobile';

export function MobileBrandSimulator() {
  const [mobileTab, setMobileTab] = useState<string>('beranda');

  return (
    <section id="mobile" className="scroll-mt-24">
      <div className="mb-8 flex items-center justify-between border-b border-hk-champagne/40 pb-4">
        <div>
          <div className="flex items-center gap-2 text-hk-taupe">
            <Smartphone className="h-5 w-5" />
            <span className="font-manrope text-xs font-bold uppercase tracking-widest">
              Mobile-First Experience
            </span>
          </div>
          <h2 className="mt-1 font-editorial text-3xl font-normal text-hk-charcoal">
            Interactive Mobile Simulator (375px)
          </h2>
        </div>
        <span className="font-manrope text-xs text-hk-taupe">
          Uji Coba Sentuh &amp; Responsivitas
        </span>
      </div>

      <div className="flex flex-col items-center justify-center">
        {/* Phone Bezel Simulator Frame */}
        <div className="relative w-full max-w-[390px] overflow-hidden rounded-[40px] border-[8px] border-hk-charcoal bg-hk-ivory shadow-2xl">
          {/* Phone Speaker Notch */}
          <div className="absolute top-2 left-1/2 z-50 h-4 w-28 -translate-x-1/2 rounded-full bg-hk-charcoal" />

          {/* Mobile Screen Scrollable Area */}
          <div className="relative h-[680px] overflow-y-auto flex flex-col justify-between">
            <div>
              {/* Mobile Header */}
              <MobileHeader />

              {/* Mobile Hero */}
              <MobileHero />

              {/* Mobile Services Section */}
              <div className="px-4 py-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-editorial text-xl font-medium text-hk-charcoal">
                    Layanan Terpadu Kebumen
                  </h3>
                  <ButtonGhost size="sm">Lihat Semua</ButtonGhost>
                </div>

                <MobileServiceCard
                  title="Busana &amp; Kebaya Adat"
                  category="BUSANA"
                  priceHint="Mulai Rp 2.500.000"
                  iconSrc="/assets/harikita/icons/icon-love-story.svg"
                  badge="Fitting Gratis"
                />

                <MobileServiceCard
                  title="Liputan Foto &amp; Cinematic Reels"
                  category="DOKUMENTASI"
                  priceHint="Mulai Rp 3.200.000"
                  iconSrc="/assets/harikita/icons/icon-two-people.svg"
                />
              </div>

              {/* Mobile Invitation Preview Section */}
              <div className="px-4 py-6 bg-white border-t border-hk-soft-beige">
                <h3 className="font-editorial text-xl font-medium text-hk-charcoal text-center mb-4">
                  Undangan Digital Eksklusif
                </h3>
                <MobileInvitationPreview />
              </div>
            </div>

            {/* Mobile Bottom Controls Locked to Simulator */}
            <div className="sticky bottom-0 z-30 flex flex-col w-full">
              <MobileStickyBookingBar
                price="Rp 8.500.000"
                priceLabel="Estimasi Paket Intim"
                fixed={false}
              />

              <MobileBottomNav
                activeTab={mobileTab}
                onTabChange={setMobileTab}
                fixed={false}
              />
            </div>
          </div>
        </div>

        <p className="mt-4 font-manrope text-xs text-hk-taupe">
          * Simulator 375px mensimulasikan layar iPhone SE / smartphone standar keluarga di Kebumen.
        </p>
      </div>
    </section>
  );
}
