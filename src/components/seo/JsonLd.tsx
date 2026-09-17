import React from "react";

/**
 * JsonLd — menyuntikkan structured data (schema.org) sebagai
 * <script type="application/ld+json">. Server component murni.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify aman di sini (bukan input pengguna; hanya objek config statis).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
