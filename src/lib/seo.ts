/**
 * HariKita — SEO & Site Configuration (Phase 8)
 *
 * Single source of truth untuk metadata situs, canonical URL, dan structured
 * data. Murni presentasional (tanpa dependensi service layer / DB) sehingga
 * aman dikerjakan paralel dengan fase backend.
 */

/** Base URL publik. Di produksi wajib di-set via NEXT_PUBLIC_BASE_URL. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export const SITE_NAME = "HariKita";

export const SITE_TAGLINE = "Rangkai Hari Bahagiamu, Menyelaraskan Restu & Impian";

export const SITE_DESCRIPTION =
  "Platform terkurasi lokal Kabupaten Kebumen untuk merangkai Pre-wedding, Lamaran, dan Pernikahan Intim. 11 kategori layanan terpadu dengan perlindungan Rekening Bersama (Escrow).";

export const SITE_LOCALE = "id_ID";

export const SITE_KEYWORDS = [
  "wedding kebumen",
  "pernikahan kebumen",
  "undangan digital kebumen",
  "sewa busana pengantin kebumen",
  "katering pernikahan kebumen",
  "mua kebumen",
  "prewedding pantai menganti",
  "dekorasi pernikahan kebumen",
  "lamaran kebumen",
  "vendor pernikahan kebumen",
];

export const SITE_CONTACT = {
  /** Nomor WhatsApp concierge (format internasional tanpa +). */
  whatsapp: "6281234567890",
  email: "halo@harikita.id",
  addressLocality: "Kebumen",
  addressRegion: "Jawa Tengah",
  addressCountry: "ID",
};

/** URL absolut untuk sebuah path relatif. */
export function absoluteUrl(path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}

/**
 * Structured data (schema.org LocalBusiness / Organization) untuk rich results.
 * Mengembalikan objek JSON-LD siap disuntik via <script type="application/ld+json">.
 */
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    image: absoluteUrl("/icons/icon-512x512.png"),
    logo: absoluteUrl("/icons/icon-512x512.png"),
    telephone: `+${SITE_CONTACT.whatsapp}`,
    email: SITE_CONTACT.email,
    priceRange: "Rp",
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE_CONTACT.addressLocality,
      addressRegion: SITE_CONTACT.addressRegion,
      addressCountry: SITE_CONTACT.addressCountry,
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Kabupaten Kebumen, Jawa Tengah",
    },
    sameAs: [] as string[],
  };
}

/** Structured data FAQPage dari daftar tanya-jawab. */
export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/** Structured data BreadcrumbList. */
export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
