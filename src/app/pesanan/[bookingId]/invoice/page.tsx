import React from "react";
import { getClientOrderViewModelByBooking } from "@/server/queries/orders";
import { InvoiceClient } from "./InvoiceClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

/**
 * Invoice Resmi — Server Component wrapper.
 * Mengambil order dari database (owner-scoped); bila tidak ditemukan, klien
 * akan jatuh ke mock store lokal (perilaku lama tetap terjaga).
 */
export default async function PesananInvoicePage({ params }: PageProps) {
  const { bookingId } = await params;
  const initialOrder = await getClientOrderViewModelByBooking(bookingId);

  return <InvoiceClient params={params} initialOrder={initialOrder} />;
}
