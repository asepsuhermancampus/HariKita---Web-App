import type { GatewayProvider, PaymentGatewayAdapter } from "./types";
import { createSimulatedAdapter } from "./simulated-adapter";
import { createMidtransAdapter } from "./midtrans-adapter";
import { createXenditAdapter } from "./xendit-adapter";

/**
 * HariKita - Payment Gateway Registry
 *
 * Memilih adapter berdasarkan provider yang diminta. Provider default seluruh
 * sistem adalah `simulated_qris`, sehingga alur pilot tetap berjalan tanpa
 * konfigurasi kredensial.
 */

const REGISTRY: Record<GatewayProvider, () => PaymentGatewayAdapter> = {
  simulated_qris: createSimulatedAdapter,
  midtrans: createMidtransAdapter,
  xendit: createXenditAdapter,
};

export function getGatewayAdapter(provider: GatewayProvider): PaymentGatewayAdapter {
  const factory = REGISTRY[provider];
  if (!factory) {
    throw new Error(`UNKNOWN_GATEWAY_PROVIDER: ${provider}`);
  }
  return factory();
}

/** Provider default yang aktif (env `HARIKITA_PAYMENT_PROVIDER`, fallback simulasi). */
export function getDefaultProvider(): GatewayProvider {
  const env = process.env.HARIKITA_PAYMENT_PROVIDER;
  if (env === "midtrans" || env === "xendit" || env === "simulated_qris") {
    return env;
  }
  return "simulated_qris";
}

export type { GatewayProvider, PaymentGatewayAdapter } from "./types";
