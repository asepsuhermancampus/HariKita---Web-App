import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVendorsByCategoryFromDb } from "@/server/queries/catalog";
import { VENDOR_CATEGORIES } from "@/lib/vendor-categories";
import { VendorCategoryClient } from "./VendorCategoryClient";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return VENDOR_CATEGORIES.map((c) => ({ kategori: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kategori: string }>;
}): Promise<Metadata> {
  const { kategori } = await params;
  const cat = VENDOR_CATEGORIES.find((c) => c.id === kategori);
  return {
    title: cat ? `Vendor ${cat.title} — HariKita Kebumen` : "Katalog Vendor — HariKita",
    description: cat?.shortDesc,
  };
}

export default async function VendorCategoryDetailPage({
  params,
}: {
  params: Promise<{ kategori: string }>;
}) {
  const { kategori } = await params;
  const category = VENDOR_CATEGORIES.find((c) => c.id === kategori);
  if (!category) notFound();

  const vendors = await getVendorsByCategoryFromDb(kategori);
  return <VendorCategoryClient categoryId={kategori} vendors={vendors} />;
}
