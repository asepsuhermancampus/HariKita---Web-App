'use client';

import React, { useState } from 'react';
import { QrCode, Copy, Check, Gift, CreditCard, MapPin, Building2, Heart } from 'lucide-react';
import { SANDBOX_GIFT_DATA } from '../../../data/mock-invitation-sandbox';
import { cn } from '@/lib/utils';

interface SandboxQrisGeneratorProps {
  accentColor: string;
}

export function SandboxQrisGenerator({ accentColor }: SandboxQrisGeneratorProps) {
  const [customNominal, setCustomNominal] = useState<number>(250000);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);

  const { bankAccounts, qris, physicalGift } = SANDBOX_GIFT_DATA;

  const quickChips = [
    { label: 'Rp 100.000', value: 100000 },
    { label: 'Rp 250.000', value: 250000 },
    { label: 'Rp 500.000', value: 500000 },
    { label: 'Rp 1.000.000', value: 1000000 },
  ];

  const handleCopyAccount = (accountNo: string, bank: string) => {
    navigator.clipboard.writeText(accountNo.replace(/-/g, ''));
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(
      `${physicalGift.recipientName}\n${physicalGift.address}\nTelp: ${physicalGift.phone}`
    );
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-hk-champagne/40 bg-white p-6 md:p-8 shadow-sm">
      {/* Header */}
      <div className="mb-6 border-b border-hk-soft-beige pb-4">
        <span className="rounded-full bg-hk-soft-beige px-3 py-1 font-manrope text-[11px] font-bold uppercase tracking-wider text-hk-taupe">
          Tanda Kasih &amp; Kehormatan Tamu
        </span>
        <h3 className="mt-1 font-editorial text-2xl text-hk-charcoal">
          Live Generator QRIS Dinamis &amp; Rekening Bank
        </h3>
        <p className="mt-1 font-manrope text-xs text-hk-charcoal/70">
          Uji simulasi input nominal tamu yang secara otomatis menghasilkan gambar QRIS real-time sesuai jumlah yang diinginkan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive QRIS Dynamic Generator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-xl border border-hk-champagne/50 bg-hk-ivory/50 p-5">
            <label className="block font-manrope text-xs font-bold uppercase tracking-wider text-hk-charcoal">
              1. Pilih / Masukkan Nominal Tanda Kasih:
            </label>

            {/* Quick Nominal Chips */}
            <div className="mt-3 flex flex-wrap gap-2">
              {quickChips.map((chip) => (
                <button
                  key={chip.value}
                  onClick={() => setCustomNominal(chip.value)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-manrope font-semibold transition-all',
                    customNominal === chip.value
                      ? 'text-white shadow-xs'
                      : 'bg-white border border-hk-champagne/50 text-hk-charcoal hover:border-hk-taupe'
                  )}
                  style={{
                    backgroundColor: customNominal === chip.value ? accentColor : undefined,
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="mt-4 flex items-center gap-3">
              <span className="font-editorial text-xl font-semibold text-hk-charcoal">Rp</span>
              <input
                type="number"
                min="10000"
                step="10000"
                value={customNominal}
                onChange={(e) => setCustomNominal(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-xl border border-hk-champagne/60 bg-white px-4 py-2 text-base font-manrope font-bold text-hk-charcoal focus:border-hk-taupe focus:outline-hidden"
              />
            </div>
            <p className="mt-2 font-manrope text-[11px] text-hk-taupe">
              * Tamu cukup memindai (scan) QRIS tanpa perlu mengetik ulang nominal di aplikasi e-wallet.
            </p>
          </div>

          {/* Bank Transfer Cards */}
          <div className="space-y-3">
            <span className="font-manrope text-xs font-bold uppercase tracking-wider text-hk-charcoal/80">
              2. Pilihan Rekening Bank Resmi:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bankAccounts.map((acc) => (
                <div
                  key={acc.bank}
                  className="rounded-xl border border-hk-champagne/50 bg-white p-4 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-manrope text-[10px] font-bold text-hk-taupe uppercase">
                        {acc.badge}
                      </span>
                      <Building2 className="h-4 w-4 text-hk-taupe" />
                    </div>
                    <h5 className="mt-1 font-editorial text-lg text-hk-charcoal">{acc.bank}</h5>
                    <code className="mt-2 block font-mono text-sm font-bold text-hk-charcoal">
                      {acc.accountNumber}
                    </code>
                    <p className="mt-0.5 font-manrope text-xs text-hk-charcoal/70">
                      a.n. {acc.holderName}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopyAccount(acc.accountNumber, acc.bank)}
                    className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-hk-champagne/50 bg-hk-ivory py-1.5 text-xs font-manrope font-semibold text-hk-charcoal hover:border-hk-taupe transition-colors"
                  >
                    {copiedBank === acc.bank ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-700" />
                        <span className="text-emerald-700">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-hk-taupe" />
                        <span>Salin Rekening</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Dynamic QRIS Mockup Canvas (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[320px] rounded-2xl border-2 border-hk-taupe bg-white p-6 shadow-xl flex flex-col items-center text-center">
            {/* National QRIS Header */}
            <div className="w-full border-b pb-3 mb-4">
              <div className="flex items-center justify-center gap-1 text-red-600 font-bold font-manrope text-lg tracking-wider">
                <span>QRIS</span>
                <span className="text-[10px] font-normal text-hk-charcoal">STANDAR PEMBAYARAN NASIONAL</span>
              </div>
              <p className="font-manrope text-[10px] text-hk-charcoal/70 mt-1">
                {qris.merchantName}
              </p>
              <span className="font-mono text-[9px] text-hk-taupe">NMID: {qris.nmid}</span>
            </div>

            {/* QR Pattern Representation */}
            <div className="relative flex h-52 w-52 items-center justify-center rounded-xl border border-black/10 bg-white p-3 shadow-inner">
              <div className="relative h-full w-full flex flex-col justify-between items-center bg-[radial-gradient(#2B2B2B_1.5px,transparent_1.5px)] bg-[size:10px_10px] p-2">
                {/* 3 QR Position Corner Marks */}
                <div className="absolute top-1 left-1 h-8 w-8 border-4 border-hk-charcoal bg-transparent flex items-center justify-center">
                  <div className="h-3.5 w-3.5 bg-hk-charcoal" />
                </div>
                <div className="absolute top-1 right-1 h-8 w-8 border-4 border-hk-charcoal bg-transparent flex items-center justify-center">
                  <div className="h-3.5 w-3.5 bg-hk-charcoal" />
                </div>
                <div className="absolute bottom-1 left-1 h-8 w-8 border-4 border-hk-charcoal bg-transparent flex items-center justify-center">
                  <div className="h-3.5 w-3.5 bg-hk-charcoal" />
                </div>

                {/* Center Badge with HariKita Icon */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-hk-champagne shadow-md text-hk-taupe">
                    <Heart className="h-5 w-5 fill-hk-taupe" />
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Nominal Badge */}
            <div className="mt-4 w-full rounded-xl bg-hk-ivory p-3 border border-hk-champagne/40">
              <span className="font-manrope text-[10px] uppercase text-hk-taupe font-bold tracking-wider">
                Nominal Terkonfirmasi:
              </span>
              <div className="font-editorial text-2xl font-bold text-hk-charcoal mt-0.5">
                Rp {customNominal.toLocaleString('id-ID')}
              </div>
            </div>

            <p className="mt-3 font-manrope text-[10px] text-hk-charcoal/60">
              Dapat discan lewat GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, BRI, &amp; BSI.
            </p>
          </div>

          {/* Physical Gift Delivery Card */}
          <div className="mt-6 w-full max-w-[320px] rounded-xl border border-hk-champagne/40 bg-hk-ivory p-4 text-xs font-manrope">
            <div className="flex items-center gap-1.5 text-hk-taupe font-bold uppercase tracking-wider mb-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>Kirim Kado Fisik ke Kebumen:</span>
            </div>
            <p className="text-hk-charcoal/80 leading-relaxed text-[11px]">
              {physicalGift.recipientName} <br />
              {physicalGift.address}
            </p>
            <button
              onClick={handleCopyAddress}
              className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-md bg-white border border-hk-champagne/50 py-1.5 text-[11px] font-semibold text-hk-charcoal hover:border-hk-taupe transition-colors"
            >
              {copiedAddress ? (
                <>
                  <Check className="h-3 w-3 text-emerald-700" />
                  <span className="text-emerald-700">Alamat Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 text-hk-taupe" />
                  <span>Salin Alamat Lengkap</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
