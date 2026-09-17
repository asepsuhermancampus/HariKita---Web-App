import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/seo";

export const runtime = "edge";
export const alt = `${SITE_NAME} — Platform Event Lamaran & Pernikahan Kebumen`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Open Graph social card dinamis (Phase 8).
 * Palet mengikuti design system HariKita: Cashmere Alabaster & Gilded Champagne.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #FAF8F5 0%, #F3EDE6 55%, #E8DED1 100%)",
          padding: "72px",
          fontFamily: "serif",
        }}
      >
        {/* Top: brand mark */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "9999px",
              background: "#88735B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FAF8F5",
              fontSize: "40px",
              fontWeight: 700,
            }}
          >
            H
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "44px", fontWeight: 700, color: "#2B2B2B", lineHeight: 1 }}>
              {SITE_NAME}
            </span>
            <span
              style={{
                fontSize: "18px",
                letterSpacing: "6px",
                color: "#88735B",
                marginTop: "6px",
              }}
            >
              WEDDING &amp; EVENTS
            </span>
          </div>
        </div>

        {/* Middle: headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <span
            style={{
              fontSize: "58px",
              fontWeight: 700,
              color: "#4A2E35",
              lineHeight: 1.15,
              maxWidth: "900px",
            }}
          >
            {SITE_TAGLINE}
          </span>
          <span
            style={{
              fontSize: "24px",
              color: "#6B5E62",
              maxWidth: "920px",
              lineHeight: 1.4,
              fontFamily: "sans-serif",
            }}
          >
            11 kategori layanan terpadu • Undangan digital eksklusif • Proteksi rekening bersama
          </span>
        </div>

        {/* Bottom: location + accent bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "22px", color: "#88735B", fontFamily: "sans-serif" }}>
            Kabupaten Kebumen, Jawa Tengah
          </span>
          <div
            style={{
              width: "220px",
              height: "8px",
              borderRadius: "9999px",
              background: "linear-gradient(90deg, #C9A88A 0%, #88735B 100%)",
            }}
          />
        </div>

        {/* hidden description for a11y pipeline */}
        <span style={{ display: "none" }}>{SITE_DESCRIPTION}</span>
      </div>
    ),
    { ...size }
  );
}
