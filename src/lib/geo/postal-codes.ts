/**
 * Peta kode pos desa/kelurahan di Kabupaten Kebumen (subset pilot).
 * Kunci = nama desa (lowercase). Nilai = { kecamatan, postalCode }.
 * Bila tidak ada di peta, form meminta pengisian manual.
 */
export const KEBUMEN_POSTAL: Record<string, { kecamatan: string; postalCode: string }> = {
  kebumen: { kecamatan: "Kebumen", postalCode: "54311" },
  panjer: { kecamatan: "Kebumen", postalCode: "54312" },
  gombong: { kecamatan: "Gombong", postalCode: "54411" },
  karanganyar: { kecamatan: "Karanganyar", postalCode: "54364" },
  prembun: { kecamatan: "Prembun", postalCode: "54394" },
  kutowinangun: { kecamatan: "Kutowinangun", postalCode: "54393" },
  alian: { kecamatan: "Alian", postalCode: "54352" },
  ayah: { kecamatan: "Ayah", postalCode: "54473" },
};

/** Kode pos untuk (desa, kecamatan); null bila tak dikenal / tidak cocok. */
export function lookupPostalCode(desa: string, kecamatan: string): string | null {
  if (!desa) return null;
  const key = desa.trim().toLowerCase();
  const entry = KEBUMEN_POSTAL[key];
  if (!entry) return null;
  if (kecamatan && entry.kecamatan.toLowerCase() !== kecamatan.trim().toLowerCase()) {
    return null;
  }
  return entry.postalCode;
}
