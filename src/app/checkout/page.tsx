import type { Metadata } from "next";
import { getPlatformSettings } from "@/server/services/platform-settings-service";
import { CheckoutClient } from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout & Booking Terproteksi",
  description:
    "Kunci jadwal vendor pilihanmu di Kebumen dengan skema DP atau bayar lunas, terlindungi Rekening Bersama HariKita.",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const settings = await getPlatformSettings();
  return (
    <CheckoutClient
      settings={{ dpPct: settings.dpPct, platformFeePct: settings.platformFeePct }}
    />
  );
}
