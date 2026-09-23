import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicVendorBySlug } from "@/server/queries/catalog";
import { PublicVendorProfileClient } from "@/components/vendor/PublicVendorProfileClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await getPublicVendorBySlug(slug);
  if (!vendor) return { title: "Vendor tidak ditemukan — HariKita" };
  return {
    title: `${vendor.name} — ${vendor.categoryTitle} | HariKita Kebumen`,
    description: vendor.bio || `Profil mitra vendor ${vendor.name} di Kebumen.`,
  };
}

export default async function PublicVendorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vendor = await getPublicVendorBySlug(slug);
  if (!vendor) notFound();
  return <PublicVendorProfileClient vendor={vendor} />;
}
