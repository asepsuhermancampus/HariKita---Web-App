"use client";

import React, { useEffect } from "react";

/**
 * global-error.tsx menangkap error pada root layout (termasuk kegagalan
 * Navbar/Footer). Karena root layout gagal, file ini WAJIB merender
 * <html> dan <body> sendiri dan tidak boleh bergantung pada provider/global CSS
 * yang mungkin belum ter-mount. Styling dibuat inline agar tetap tampil.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[HariKita] Global error:", error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
          textAlign: "center",
          background: "#FAF8F5",
          color: "#2B2B2B",
          fontFamily: "'Manrope', system-ui, -apple-system, sans-serif",
        }}
      >
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.75rem", margin: 0 }}>
          Aplikasi gagal dimuat
        </h1>
        <p style={{ maxWidth: "28rem", fontSize: "0.875rem", lineHeight: 1.6, color: "#4A4A4A" }}>
          Maaf, terjadi kendala teknis yang tidak terduga. Silakan muat ulang halaman ini.
        </p>
        {error.digest && (
          <p style={{ fontFamily: "monospace", fontSize: "0.6875rem", color: "#8A8A8A", margin: 0 }}>
            Kode kesalahan: {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          style={{
            minHeight: "44px",
            padding: "0.75rem 1.5rem",
            borderRadius: "9999px",
            border: "none",
            background: "#88735B",
            color: "#FFFFFF",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Muat Ulang
        </button>
      </body>
    </html>
  );
}
