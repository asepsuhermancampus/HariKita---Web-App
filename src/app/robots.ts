import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * robots.txt (Phase 8).
 * Memblokir area privat (portal, API, halaman sistem) dari crawler, namun
 * mengizinkan seluruh halaman publik: landing, kategori, undangan, legal, help.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/client",
          "/dashboard/vendor",
          "/dashboard/vendor/dompet",
          "/dashboard/vendor/inbox",
          "/dashboard/vendor/paket",
          "/dashboard/vendor/kalender",
          "/dashboard/vendor/profil",
          "/dashboard/vendor/profile",
          "/checkout",
          "/pembayaran/",
          "/pesanan/",
          "/design-system-showcase",
          "/hub-koordinasi",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
