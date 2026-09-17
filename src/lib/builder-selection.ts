/**
 * Utilitas seleksi builder — fungsi murni agar mudah diuji.
 */
export type SelectionMap = { [id: string]: { count?: number } };

/**
 * Merge dua peta seleksi. `extra` menang atas `base` untuk key yang sama.
 * Tidak memutasi input.
 */
export function mergeSelections(
  base: SelectionMap,
  extra: SelectionMap
): SelectionMap {
  return { ...base, ...extra };
}

/** Kategori cart item → serviceId builder. */
export const CATEGORY_TO_SERVICE: Record<string, string> = {
  prewed: "prewed-1",
  busana: "busana-1",
  mua: "mua-1",
  seserahan: "seserahan-1",
  foto: "foto-1",
  dekor: "dekor-1",
  katering: "katering-1",
  cake: "cake-1",
  souvenir: "souvenir-1",
  undangan: "undangan-1",
  denah: "denah-1",
};

/** Vendor katalog ID → serviceId builder. */
export const VENDOR_TO_SERVICE: Record<string, string> = {
  v_prewed_01: "prewed-1",
  v_prewed_02: "prewed-1",
  v_busana_01: "busana-1",
  v_mua_01: "mua-1",
  v_seserahan_01: "seserahan-1",
  v_foto_01: "foto-1",
  v_dekor_01: "dekor-1",
  v_katering_01: "katering-1",
  v_cake_01: "cake-1",
  v_souvenir_01: "souvenir-1",
  v_undangan_01: "undangan-1",
  v_denah_01: "denah-1",
};

/**
 * Ubah daftar item cart → peta seleksi builder, memakai categoryId
 * (fallback vendorId). Item tanpa pemetaan diabaikan.
 */
export function selectionsFromCartItems(
  items: Array<{ categoryId: string; vendorId: string }>
): SelectionMap {
  const result: SelectionMap = {};
  for (const item of items) {
    const serviceId =
      CATEGORY_TO_SERVICE[item.categoryId] || VENDOR_TO_SERVICE[item.vendorId];
    if (serviceId) result[serviceId] = {};
  }
  return result;
}
