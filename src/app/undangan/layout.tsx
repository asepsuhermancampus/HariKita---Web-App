import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galeri Undangan Digital Eksklusif",
  description:
    "Eksplorasi puluhan template undangan digital interaktif: adat Jawa, islami, botanical, royal luxury, hingga ilustrasi ceria. Dilengkapi RSVP, amplop digital, dan denah lokasi.",
  alternates: { canonical: "/undangan" },
  openGraph: {
    title: "Galeri Undangan Digital Eksklusif | HariKita",
    description:
      "Pilih tema undangan digital yang menyelaraskan restu keluarga dan estetika modern.",
    url: "/undangan",
  },
};

export default function UndanganLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
