'use client';

import React, { useState } from 'react';
import { Gift, Building2, Copy, Check, MapPin, Heart } from 'lucide-react';
import { SANDBOX_GIFT_DATA } from '../../../../data/mock-invitation-sandbox';
import { cn } from '@/lib/utils';

interface StudioBankGiftSectionProps {
  themeColor: string;
  ornamentId?: string;
}

export function StudioBankGiftSection({ themeColor }: StudioBankGiftSectionProps) {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);

  const { bankAccounts, physicalGift } = SANDBOX_GIFT_DATA;

  const handleCopy = (accountNumber: string, bankName: string) => {
    navigator.clipboard.writeText(accountNumber.replace(/-/g, ''));
    setCopiedAccount(bankName);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handleCopyPhysicalAddress = () => {
    navigator.clipboard.writeText(
      `${physicalGift.recipientName}\n${physicalGift.address}\nTelp: ${physicalGift.phone}`
    );
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <div className="space-y-6 px-3 py-2 text-hk-charcoal">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-hk-soft-beige px-3 py-0.5 text-[10px] font-manrope font-bold uppercase tracking-widest text-hk-taupe">
          <Gift className="h-3 w-3" style={{ color: themeColor }} />
          <span>Tanda Kasih &amp; Doa Restu</span>
        </div>
        <h3 className="font-editorial text-2xl sm:text-3xl text-hk-charcoal font-medium">
          Tanda Kasih Mempelai
        </h3>
        <p className="font-manrope text-[11px] text-hk-charcoal/70 max-w-sm mx-auto leading-relaxed">
          Doa restu Anda adalah karunia terindah bagi kami. Namun jika berkenan memberikan tanda kasih, dapat disalurkan melalui:
        </p>
      </div>

      {/* Clean Bank Accounts Grid */}
      <div className="space-y-3">
        {bankAccounts.map((account) => {
          const isCopied = copiedAccount === account.bank;
          return (
            <div
              key={account.bank}
              className="relative overflow-hidden rounded-2xl border border-hk-champagne/60 bg-white p-4 shadow-xs transition-all hover:border-hk-taupe hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-hk-ivory text-hk-charcoal border border-hk-champagne/40"
                    style={{ color: themeColor }}
                  >
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-editorial text-lg font-bold text-hk-charcoal leading-none">
                      {account.bank}
                    </span>
                    <span className="block font-manrope text-[9px] uppercase tracking-wider text-hk-taupe font-bold">
                      {account.badge}
                    </span>
                  </div>
                </div>

                {/* 1-Click Copy Button */}
                <button
                  onClick={() => handleCopy(account.accountNumber, account.bank)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-manrope font-semibold transition-all active:scale-95 shadow-2xs',
                    isCopied
                      ? 'bg-emerald-600 text-white'
                      : 'border border-hk-champagne/60 bg-hk-ivory text-hk-charcoal hover:border-hk-taupe'
                  )}
                  style={{
                    backgroundColor: isCopied ? undefined : undefined,
                  }}
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-hk-taupe" />
                      <span>Salin Rekening</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-3 rounded-xl bg-hk-ivory/50 p-3 border border-hk-champagne/30">
                <code className="block font-mono text-base font-bold text-hk-charcoal tracking-wider">
                  {account.accountNumber}
                </code>
                <span className="font-manrope text-xs text-hk-charcoal/75 mt-0.5 block">
                  a.n. <strong className="text-hk-charcoal">{account.holderName}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Physical Gift Delivery Card (Alamat Kirim Kado ke Kebumen) */}
      <div className="rounded-2xl border border-hk-champagne/50 bg-gradient-to-br from-hk-ivory/80 via-white to-hk-soft-beige/30 p-4 shadow-xs">
        <div className="flex items-center gap-2 text-hk-taupe font-bold uppercase tracking-wider text-[11px] mb-1">
          <MapPin className="h-3.5 w-3.5" style={{ color: themeColor }} />
          <span>Kirim Kado Fisik ke Kebumen</span>
        </div>
        <p className="font-manrope text-xs text-hk-charcoal font-semibold mt-1">
          {physicalGift.recipientName}
        </p>
        <p className="font-manrope text-[11px] text-hk-charcoal/70 leading-relaxed mt-0.5">
          {physicalGift.address}
        </p>
        <p className="font-mono text-[10px] text-hk-taupe mt-1">Telp: {physicalGift.phone}</p>

        <button
          onClick={handleCopyPhysicalAddress}
          className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl border border-hk-champagne/60 bg-white py-2 text-xs font-manrope font-semibold text-hk-charcoal hover:border-hk-taupe transition-colors shadow-2xs"
        >
          {copiedAddress ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-700" />
              <span className="text-emerald-700">Alamat Lengkap Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-hk-taupe" />
              <span>Salin Alamat Lengkap</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
