/**
 * HariKita - Canonical Date Utilities (Asia/Jakarta / WIB, UTC+7)
 *
 * Kontrak Phase 1A v3.3 (Timezone Standardisation):
 * - Seluruh tanggal acara di Kabupaten Kebumen dinormalisasi ke `Asia/Jakarta`.
 * - DILARANG menggunakan `new Date("YYYY-MM-DD")` mentah: string tanggal tanpa
 *   timezone diinterpretasikan sebagai UTC 00:00:00 sehingga bisa bergeser satu
 *   hari saat dikonversi ke waktu lokal server.
 * - Helper ini adalah satu-satunya pintu normalisasi tanggal kalender WIB.
 *
 * Implementasi sengaja bebas dependensi runtime (tanpa Intl per-keperluan) agar
 * deterministik dan mudah diuji: WIB selalu UTC+7 (Indonesia tidak memakai DST).
 */

/** Offset WIB terhadap UTC dalam menit (UTC+7 = +420 menit). */
export const WIB_OFFSET_MINUTES = 420;

/** Offset WIB terhadap UTC dalam milidetik. */
const WIB_OFFSET_MS = WIB_OFFSET_MINUTES * 60 * 1000;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Normalisasi input tanggal menjadi string kanonikal `YYYY-MM-DD`.
 *
 * Menerima:
 * - `Date` (dikonversi ke komponen kalender WIB-nya, bukan UTC)
 * - string `YYYY-MM-DD` (dipakai apa adanya setelah validasi)
 * - string ISO lengkap (dikonversi ke tanggal kalender WIB)
 *
 * @throws {RangeError} jika input tidak dapat ditafsirkan sebagai tanggal valid.
 */
export function toWibDateString(input: Date | string): string {
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) {
      throw new RangeError("toWibDateString: Date tidak valid (Invalid Date).");
    }
    return dateToWibCalendarString(input);
  }

  if (typeof input !== "string" || input.trim() === "") {
    throw new RangeError("toWibDateString: input harus Date atau string non-kosong.");
  }

  const trimmed = input.trim();

  // Fast path: sudah berupa "YYYY-MM-DD".
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (ymd) {
    const [, y, m, d] = ymd;
    assertValidCalendarDate(Number(y), Number(m), Number(d), trimmed);
    return `${y}-${m}-${d}`;
  }

  // Selain itu, parse sebagai instant lalu ambil tanggal kalender WIB-nya.
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new RangeError(`toWibDateString: tidak dapat memparse "${input}".`);
  }
  return dateToWibCalendarString(parsed);
}

/**
 * Mengembalikan instant (Date UTC) untuk pukul 00:00:00.000 WIB pada tanggal
 * kalender yang diberikan. Hasil: instant yang ekuivalen dengan 17:00:00.000 UTC
 * hari kalender sebelumnya (kecuali offset berubah — tidak untuk WIB).
 */
export function getStartOfDayWIB(date: Date | string): Date {
  const ymd = toWibDateString(date);
  const [y, m, d] = ymd.split("-").map(Number);
  // 00:00:00 WIB = (00:00:00 lokal) - offset dalam UTC.
  const utcMs = Date.UTC(y, m - 1, d, 0, 0, 0, 0) - WIB_OFFSET_MS;
  return new Date(utcMs);
}

/**
 * Mengembalikan instant (Date UTC) untuk pukul 23:59:59.999 WIB pada tanggal
 * kalender yang diberikan (batas akhir inklusif hari tersebut).
 */
export function getEndOfDayWIB(date: Date | string): Date {
  const start = getStartOfDayWIB(date);
  return new Date(start.getTime() + MS_PER_DAY - 1);
}

/**
 * Menambahkan sejumlah hari kalender pada tanggal, dinormalisasi ke WIB.
 * Berguna untuk hitung deadline kanonikal (mis. H-3, H-7, H+2).
 */
export function addCalendarDaysWIB(date: Date | string, days: number): string {
  if (!Number.isInteger(days)) {
    throw new RangeError("addCalendarDaysWIB: `days` harus bilangan bulat.");
  }
  const ymd = toWibDateString(date);
  const [y, m, d] = ymd.split("-").map(Number);
  const shifted = new Date(Date.UTC(y, m - 1, d + days, 0, 0, 0, 0));
  const sy = shifted.getUTCFullYear();
  const sm = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const sd = String(shifted.getUTCDate()).padStart(2, "0");
  return `${sy}-${sm}-${sd}`;
}

/**
 * Selisih hari kalender WIB antara `a` dan `b` (a - b), dibulatkan ke hari utuh.
 * Positif berarti `a` setelah `b`.
 */
export function diffCalendarDaysWIB(a: Date | string, b: Date | string): number {
  const startA = getStartOfDayWIB(a).getTime();
  const startB = getStartOfDayWIB(b).getTime();
  return Math.round((startA - startB) / MS_PER_DAY);
}

/**
 * Mengecek apakah `value` merupakan tanggal kalender WIB valid (YYYY-MM-DD).
 */
export function isValidWibDateString(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!ymd) return false;
  try {
    assertValidCalendarDate(Number(ymd[1]), Number(ymd[2]), Number(ymd[3]), value);
    return true;
  } catch {
    return false;
  }
}

// ── Internal helpers ────────────────────────────────────────────────────────

/** Konversi Date instant ke string kalender WIB (YYYY-MM-DD). */
function dateToWibCalendarString(date: Date): string {
  const wibMs = date.getTime() + WIB_OFFSET_MS;
  const wib = new Date(wibMs);
  const y = wib.getUTCFullYear();
  const m = String(wib.getUTCMonth() + 1).padStart(2, "0");
  const d = String(wib.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Pastikan kombinasi tahun/bulan/hari benar-benar ada di kalender Gregorian. */
function assertValidCalendarDate(
  year: number,
  month: number,
  day: number,
  original: string
): void {
  if (month < 1 || month > 12) {
    throw new RangeError(`Tanggal tidak valid "${original}": bulan di luar 1-12.`);
  }
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > daysInMonth) {
    throw new RangeError(
      `Tanggal tidak valid "${original}": hari di luar 1-${daysInMonth}.`
    );
  }
}
