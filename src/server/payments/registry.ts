import type { GatewayProvider, PaymentGatewayAdapter } from "./types";
import { createSimulatedAdapter } from "./simulated-adapter";
import { createMidtransAdapter } from "./midtrans-adapter";
import { createMidtransSnapAdapter } from "./midtrans-snap-adapter";
import { createXenditAdapter } from "./xendit-adapter";

/**
 * HariKita - Payment Gateway Registry
 *
 * Provider default `simulated_qris` agar pilot berjalan tanpa kredensial.
 * Midtrans tersedia dalam dua mode:
 *   - Core API (QRIS charge langsung)
 *   - Snap (halaman pembayaran lengkap: QRIS semua e-wallet/bank + transfer bank)
 *
 * `getGatewayAdapter` untuk webhook selalu memakai adapter Midtrans standar
 * (signature identik Snap & Core). `getCheckoutAdapter` memilih Snap bila diaktifkan.
 */

const REGISTRY: Record<GatewayProvider, () => PaymentGatewayAdapter> = {
  simulated_qris: createSimulatedAdapter,
  midtrans: createMidtransAdapter,
  xendit: createXenditAdapter,
};

export function getGatewayAdapter(provider: GatewayProvider): PaymentGatewayAdapter {
  const factory = REGISTRY[provider];
  if (!factory) throw new Error(`UNKNOWN_GATEWAY_PROVIDER: ${provider}`);
  return factory();
}

/** Provider default (env `HARIKITA_PAYMENT_PROVIDER`, fallback simulasi). */
export function getDefaultProvider(): GatewayProvider {
  const env = process.env.HARIKITA_PAYMENT_PROVIDER;
  if (env === "midtrans" || env === "xendit" || env === "simulated_qris") return env;
  return "simulated_qris";
}

export function isMidtransSnapEnabled(): boolean {
  return process.env.MIDTRANS_SNAP_ENABLED === "true";
}

/**
 * Adapter untuk membuat charge/checkout. Untuk Midtrans, memilih Snap bila
 * `MIDTRANS_SNAP_ENABLED=true` (halaman pembayaran lengkap), jika tidak Core API.
 */
export function getCheckoutAdapter(provider: GatewayProvider): PaymentGatewayAdapter {
  if (provider === "midtrans" && isMidtransSnapEnabled()) {
    return createMidtransSnapAdapter();
  }
  return getGatewayAdapter(provider);
}

export type { GatewayProvider, PaymentGatewayAdapter } from "./types";
