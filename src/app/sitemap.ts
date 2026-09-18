import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { ALL_INVITATION_TEMPLATES } from "@/lib/templates/registry";

/**
 * sitemap.xml (Phase 8).
 * Mencakup halaman publik: landing, katalog kategori, galeri + demo template
 * undangan, builder, halaman legal/help, dan profil vendor publik statis.
 * Area privat (portal/API) sengaja TIDAK dimasukkan (juga diblokir di robots).
 */

const PUBLIC_STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/vendor", changeFrequency: "weekly", priority: 0.9 },
  { path: "/undangan", changeFrequency: "weekly", priority: 0.9 },
  { path: "/builder", changeFrequency: "monthly", priority: 0.8 },
  { path: "/help", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/legal/privacy", changeFrequency: "yearly", priority: 0.4 },
  { path: "/legal/terms", changeFrequency: "yearly", priority: 0.4 },
  { path: "/legal/cookies", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/data-processing", changeFrequency: "yearly", priority: 0.3 },
];

/** Kategori layanan hyperlocal (11 pilar). */
const CATEGORY_SLUGS = [
  "prewed",
  "busana",
  "mua",
  "seserahan",
  "foto",
  "dekor",
  "katering",
  "cake",
  "souvenir",
  "undangan",
  "denah",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_STATIC_ROUTES.map((r) => ({
    url: absoluteUrl(r.path),
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const categoryEntries: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: absoluteUrl(`/vendor/kategori/${slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Demo/preview undangan: satu entri per template agar terindeks sebagai
  // galeri contoh (bukan halaman tamu privat).
  const invitationEntries: MetadataRoute.Sitemap = ALL_INVITATION_TEMPLATES.map(
    (t) => ({
      url: absoluteUrl(`/undangan/demo?theme=${encodeURIComponent(t.id)}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    })
  );

  return [...staticEntries, ...categoryEntries, ...invitationEntries];
}

export const dynamic = "force-static";
