import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicProductBySlug } from "@/server/queries/catalog";
import { ProductDetailClient } from "./ProductDetailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
}): Promise<Metadata> {
  const { slug, productSlug } = await params;
  const data = await getPublicProductBySlug(slug, productSlug);
  if (!data) return { title: "Produk tidak ditemukan — HariKita" };
  return {
    title: `${data.product.name} — ${data.vendor.name} | HariKita Kebumen`,
    description: data.product.desc,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
}) {
  const { slug, productSlug } = await params;
  const data = await getPublicProductBySlug(slug, productSlug);
  if (!data) notFound();
  return <ProductDetailClient vendor={data.vendor} product={data.product} />;
}
