import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

export interface LegalSection {
  heading: string;
  body: React.ReactNode;
}

export interface LegalPageLayoutProps {
  title: string;
  subtitle?: string;
  /** ISO date string of last update. */
  updatedAt: string;
  breadcrumbLabel: string;
  breadcrumbPath: string;
  sections: LegalSection[];
}

/**
 * Tata letak bersama untuk halaman legal/statis (Phase 8).
 * Konsisten, mudah dibaca, responsif, dan menyertakan structured data breadcrumb.
 */
export function LegalPageLayout({
  title,
  subtitle,
  updatedAt,
  breadcrumbLabel,
  breadcrumbPath,
  sections,
}: LegalPageLayoutProps) {
  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Beranda", path: "/" },
          { name: breadcrumbLabel, path: breadcrumbPath },
        ])}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 font-manrope text-xs text-hk-charcoal/60">
          <li>
            <Link href="/" className="transition-colors hover:text-hk-charcoal">
              Beranda
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li aria-current="page" className="font-semibold text-hk-charcoal">
            {breadcrumbLabel}
          </li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-10 border-b border-hk-champagne/40 pb-6">
        <h1 className="font-editorial text-3xl font-normal text-hk-charcoal sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 font-manrope text-sm leading-relaxed text-hk-charcoal/70">
            {subtitle}
          </p>
        )}
        <p className="mt-3 font-manrope text-xs text-hk-charcoal/50">
          Terakhir diperbarui:{" "}
          {new Date(updatedAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </header>

      {/* Content */}
      <div className="space-y-8">
        {sections.map((section, idx) => (
          <section key={idx} className="space-y-3">
            <h2 className="font-editorial text-xl font-normal text-hk-charcoal sm:text-2xl">
              {section.heading}
            </h2>
            <div className="space-y-3 font-manrope text-sm leading-relaxed text-hk-charcoal/80">
              {section.body}
            </div>
          </section>
        ))}
      </div>

      {/* Footer note */}
      <footer className="mt-12 rounded-hk-xl border border-hk-champagne/40 bg-hk-ivory/50 p-5">
        <p className="font-manrope text-xs leading-relaxed text-hk-charcoal/70">
          Pertanyaan mengenai dokumen ini? Hubungi tim Concierge HariKita melalui{" "}
          <Link href="/contact" className="font-semibold text-hk-taupe underline hover:text-hk-charcoal">
            halaman kontak
          </Link>{" "}
          atau WhatsApp resmi kami.
        </p>
      </footer>
    </article>
  );
}
