import type { Metadata } from "next";
import { getHomeVendorsByCategory } from "@/server/queries/catalog";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HariKita — Platform Event Lamaran & Pernikahan Hyperlocal Kebumen",
  description:
    "Kurasi 11 kategori vendor terbaik di Kebumen untuk acara Pre-wedding, Lamaran, dan Pernikahan Intim dengan jaminan Rekening Bersama (Escrow).",
};

export default async function Page() {
  // 6 vendor teratas per kategori, langsung dari database.
  const vendorsByCategory = await getHomeVendorsByCategory(6);
  return <HomeClient vendorsByCategory={vendorsByCategory} />;
}
