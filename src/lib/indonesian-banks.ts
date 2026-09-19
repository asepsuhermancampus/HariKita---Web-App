/**
 * HariKita — Daftar Metode Pencairan (Bank & E-Wallet)
 *
 * Sumber data statis untuk dropdown metode penarikan dana BA.
 * Dikelompokkan menjadi dua kategori via `PAYOUT_GROUPS`:
 *   1. Bank (termasuk bank digital seperti SeaBank) → isi nomor rekening.
 *   2. E-Wallet / dompet digital → isi nomor HP / ID akun.
 *
 * Nilai `value` disimpan apa adanya sebagai `bankName` pada record penarikan.
 */

export type PayoutKind = "BANK" | "EWALLET";

export interface PayoutOption {
  /** Nilai yang disimpan (mis. "Bank BCA", "Gopay"). */
  value: string;
  /** Label tampilan. */
  label: string;
  /** Kategori: bank atau e-wallet (menentukan tipe input nomor). */
  kind: PayoutKind;
}

export interface PayoutGroup {
  /** Judul grup pada dropdown. */
  group: string;
  /** Opsi-opsi dalam grup. */
  options: PayoutOption[];
}

/** Bank di Indonesia. */
export const INDONESIAN_BANKS: PayoutOption[] = [
  { value: "Bank Mandiri", label: "Bank Mandiri", kind: "BANK" },
  { value: "Bank BCA", label: "Bank BCA", kind: "BANK" },
  { value: "Bank BRI", label: "Bank BRI", kind: "BANK" },
  { value: "Bank BNI", label: "Bank BNI", kind: "BANK" },
  { value: "Bank Seabank", label: "Bank Seabank", kind: "BANK" },
];

/** Dompet digital / e-wallet di Indonesia. */
export const INDONESIAN_EWALLETS: PayoutOption[] = [
  { value: "Gopay", label: "Gopay", kind: "EWALLET" },
  { value: "Dana", label: "Dana", kind: "EWALLET" },
  { value: "OVO", label: "OVO", kind: "EWALLET" },
  { value: "Shopeepay", label: "Shopeepay", kind: "EWALLET" },
  { value: "LinkAja", label: "LinkAja", kind: "EWALLET" },
];

/** Grup untuk rendering dropdown. */
export const PAYOUT_GROUPS: PayoutGroup[] = [
  { group: "Bank", options: INDONESIAN_BANKS },
  { group: "E-Wallet", options: INDONESIAN_EWALLETS },
];

/** Semua opsi (bank + e-wallet) sebagai daftar datar. */
export const ALL_PAYOUT_OPTIONS: PayoutOption[] = [
  ...INDONESIAN_BANKS,
  ...INDONESIAN_EWALLETS,
];

/**
 * Cek apakah sebuah nilai merupakan kanal non-bank (e-wallet) —
 * berguna untuk menyesuaikan label input (rekening vs nomor HP).
 */
export function isEwallet(value: string): boolean {
  const found = ALL_PAYOUT_OPTIONS.find((o) => o.value === value);
  return found?.kind === "EWALLET";
}

/** Label tampilan untuk sebuah nilai (fallback ke nilai apa adanya). */
export function payoutLabel(value: string): string {
  const found = ALL_PAYOUT_OPTIONS.find((o) => o.value === value);
  return found?.label ?? value;
}
