"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import {
  X,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  MessageCircle,
  FileText,
  Download,
} from "lucide-react";
import { CartVendorItem } from "@/lib/cart-store";

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  customerName: string;
  customerWhatsApp: string;
  eventDate: string;
  eventLocation: string;
  items: CartVendorItem[];
  totalAmount: number;
  dpAmount: number;
  finalAmount: number;
  paymentType: "dp_30" | "full_100";
  status: "LUNAS DP 30%" | "LUNAS 100%" | "MENUNGGU PEMBAYARAN";
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData | null;
}

export function InvoiceModal({ isOpen, onClose, invoice }: InvoiceModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(dialogRef, isOpen && !!invoice, onClose, initialFocusRef);

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const waMessage = encodeURIComponent(
    `Halo HariKita Kebumen, saya telah menerima Invoice Resmi ${invoice.invoiceNumber} untuk acara tanggal ${invoice.eventDate}. Mohon konfirmasi jadwal final vendor.`
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-hk-charcoal/80 backdrop-blur-sm print:p-0 print:bg-white"
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-3xl rounded-3xl bg-white border border-hk-champagne/60 shadow-2xl overflow-hidden my-6 print:border-none print:shadow-none print:rounded-none"
      >
        {/* Modal Toolbar (hidden in print) */}
        <div className="p-4 bg-hk-charcoal text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-hk-champagne" />
            <span className="font-manrope text-xs font-bold uppercase tracking-wider text-hk-champagne">
              Bukti Tagihan &amp; Pembayaran Resmi (PDF Ready)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="focus-ring flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-hk-taupe text-white text-xs font-manrope font-bold hover:bg-white hover:text-hk-charcoal transition-all shadow-xs min-h-[36px]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              ref={initialFocusRef}
              onClick={onClose}
              aria-label="Tutup invoice"
              className="focus-ring w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Document Body */}
        <div className="p-6 sm:p-10 space-y-6 text-hk-charcoal bg-white">
          {/* Header Document */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b-2 border-hk-champagne/40 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="relative w-7 h-7 rounded-full overflow-hidden border border-hk-taupe">
                  <Image src="/logo_cameo.png" alt="HariKita" fill className="object-cover" />
                </div>
                <span className="font-editorial text-2xl font-bold text-hk-charcoal">
                  HariKita Kebumen
                </span>
              </div>
              <p className="font-manrope text-xs text-hk-charcoal/70 max-w-sm leading-relaxed">
                Platform Event Lamaran &amp; Pernikahan Hyperlocal Kebumen. Dilindungi Sistem Rekening Bersama Escrow Independen.
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="text-[10px] font-manrope font-bold text-hk-taupe uppercase tracking-widest block">
                INVOICE RESMI
              </span>
              <h3
                id="invoice-modal-title"
                className="font-mono text-lg sm:text-xl font-bold text-hk-charcoal"
              >
                {invoice.invoiceNumber}
              </h3>
              <p className="font-manrope text-xs text-hk-charcoal/60">
                Diterbitkan: {invoice.issueDate}
              </p>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-manrope font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 mt-1">
                ✓ {invoice.status}
              </span>
            </div>
          </div>

          {/* Customer & Event Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-hk-ivory/50 border border-hk-champagne/40 text-xs font-manrope">
            <div className="space-y-1">
              <span className="font-bold text-hk-taupe uppercase tracking-wider text-[10px] block">
                Pemesan (Klien):
              </span>
              <p className="font-bold text-sm text-hk-charcoal">{invoice.customerName}</p>
              <p className="text-hk-charcoal/70">WhatsApp: {invoice.customerWhatsApp}</p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-hk-taupe uppercase tracking-wider text-[10px] block">
                Jadwal Hari H Acara:
              </span>
              <p className="font-bold text-sm text-hk-charcoal flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-hk-taupe" />
                <span>{invoice.eventDate}</span>
              </p>
              <p className="text-hk-charcoal/70 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-hk-taupe" />
                <span>{invoice.eventLocation}</span>
              </p>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="space-y-2">
            <h4 className="font-editorial text-lg font-bold text-hk-charcoal">
              Rincian Layanan Vendor Terpilih di Kebumen
            </h4>

            <div className="overflow-x-auto border border-hk-champagne/40 rounded-xl">
              <table className="w-full text-left text-xs font-manrope">
                <thead className="bg-hk-ivory text-hk-charcoal/80 border-b border-hk-champagne/40">
                  <tr>
                    <th className="p-3">Layanan</th>
                    <th className="p-3">Mitra Vendor</th>
                    <th className="p-3">Kecamatan</th>
                    <th className="p-3">Call Time</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hk-champagne/30">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-hk-soft-beige/20">
                      <td className="p-3 font-semibold text-hk-charcoal">
                        {item.categoryTitle}
                        <span className="block text-[10px] text-hk-charcoal/60 font-normal">
                          {item.packageName}
                        </span>
                      </td>
                      <td className="p-3 text-hk-taupe font-medium">{item.vendorName}</td>
                      <td className="p-3 text-hk-charcoal/70">Kec. {item.district}</td>
                      <td className="p-3 font-mono text-[11px] text-hk-charcoal/80">
                        {item.callTime || "08.00 WIB"}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-hk-charcoal">
                        Rp {(item.unitPrice * item.quantity).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals & Escrow Breakdown */}
          <div className="p-4 rounded-2xl bg-hk-ivory/60 border border-hk-champagne/50 space-y-2.5">
            <div className="flex justify-between text-xs font-manrope text-hk-charcoal/80">
              <span>Total Nilai Paket Acara:</span>
              <span className="font-mono font-bold text-sm text-hk-charcoal">
                Rp {invoice.totalAmount.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="flex justify-between text-xs font-manrope font-bold text-emerald-800 pt-2 border-t border-hk-champagne/40">
              <span>
                Pembayaran DP 30% (Kunci Tanggal):
              </span>
              <span className="font-mono text-sm">
                Rp {invoice.dpAmount.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="flex justify-between text-xs font-manrope text-hk-charcoal/70">
              <span>
                Sisa Pelunasan 70% (Jatuh Tempo H-7 Acara):
              </span>
              <span className="font-mono font-medium">
                Rp {invoice.finalAmount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* Legal Notice & Trust Stamp */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs font-manrope text-emerald-900">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">
                Jaminan Perlindungan Rekening Bersama HariKita:
              </span>
              <span>
                Dana DP Anda diamankan di rekening penampungan resmi. 30% hak vendor dicairkan pada H-3 untuk belanja bahan, dan 70% pelunasan baru ditransfer ke vendor pada H+2 setelah acara sukses terlaksana.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Action Footer (hidden in print) */}
        <div className="p-4 sm:p-6 bg-hk-ivory/60 border-t border-hk-champagne/40 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <a
            href={`https://wa.me/6281234567890?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-hk-champagne/60 bg-white px-5 py-2.5 text-xs font-manrope font-semibold text-hk-charcoal hover:bg-hk-taupe hover:text-white transition-all shadow-2xs"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Kirim Salinan via WhatsApp</span>
          </a>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-hk-taupe px-6 py-2.5 text-xs font-manrope font-bold text-white shadow-xs hover:bg-hk-charcoal transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh / Cetak Dokumen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
