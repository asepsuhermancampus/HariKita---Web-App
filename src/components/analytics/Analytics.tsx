"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

/**
 * Analytics (Phase 8)
 * Mendukung Google Analytics 4 dan/atau Umami tanpa dependensi berat.
 * Aktif hanya bila ID tersedia via env:
 *   - NEXT_PUBLIC_GA_MEASUREMENT_ID  (G-XXXXXXX)
 *   - NEXT_PUBLIC_UMAMI_WEBSITE_ID   + NEXT_PUBLIC_UMAMI_SRC
 * Tidak merender apa pun bila tidak dikonfigurasi (aman untuk dev/pilot).
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const UMAMI_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const UMAMI_SRC = process.env.NEXT_PUBLIC_UMAMI_SRC || "https://analytics.umami.is/script.js";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function NavigationTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID || typeof window.gtag !== "function") return;
    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    // Page view otomatis via gtag config; ini menangkap navigasi client-side.
    window.gtag("event", "page_view", {
      page_path: url,
    });
  }, [pathname, searchParams]);

  return null;
}

export function Analytics() {
  if (!GA_ID && !UMAMI_ID) return null;

  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { anonymize_ip: true });
            `}
          </Script>
          <Suspense fallback={null}>
            <NavigationTracker />
          </Suspense>
        </>
      )}

      {UMAMI_ID && (
        <Script
          src={UMAMI_SRC}
          data-website-id={UMAMI_ID}
          strategy="afterInteractive"
          defer
        />
      )}
    </>
  );
}
