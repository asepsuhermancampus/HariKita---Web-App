import React from "react";

/**
 * Layout profil publik vendor (/vendor/[slug]).
 * Sengaja polos — TANPA VendorHeaderNav dashboard, karena ini area publik.
 */
export default function PublicVendorProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
