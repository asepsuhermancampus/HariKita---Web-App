import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * HariKita - SQLite Concurrency Guard: `withTransactionRetry`
 *
 * Kontrak Phase 1D (Invariant #21 — SQLite contention retry):
 * - Retry HANYA untuk error contention: Prisma `P2034` (write conflict/deadlock),
 *   `SQLITE_BUSY`, atau pesan `"database is locked"`.
 * - `P2002` (unique violation) BUKAN contention. Ia harus ditangani secara
 *   *contextual* di pemanggil berdasarkan `error.meta.target` (jangan pernah
 *   di-retry di sini, karena retry tidak akan mengubah hasil).
 * - Setiap retry = rollback penuh + eksekusi ulang dari awal (tidak ada partial retry).
 * - Backoff eksponensial + full jitter, dibatasi `maxRetries`.
 *
 * Pemanggil WAJIB memastikan tidak ada I/O eksternal (HTTP/WhatsApp/email) di dalam
 * callback, karena transaksi memegang file-lock eksklusif SQLite.
 */

/** Opsi transaksi mengikuti kontrak Phase 1D §11. */
export interface TransactionRetryOptions {
  /** Tingkat isolasi Prisma. Default `Serializable` (aman untuk operasi finansial). */
  isolationLevel?: Prisma.TransactionIsolationLevel;
  /** Jumlah retry maksimum setelah percobaan pertama. Default 5. */
  maxRetries?: number;
  /** Batas tunggu koneksi (ms) sebelum error. Default 5000. */
  maxWait?: number;
  /** Timeout total transaksi (ms). Default 10000. */
  timeout?: number;
  /** Jeda dasar backoff (ms) sebelum jitter. Default 50. */
  baseDelayMs?: number;
  /** Batas maksimum jeda backoff (ms). Default 500. */
  maxDelayMs?: number;
  /** Sumber keacakan untuk jitter (memudahkan pengujian deterministik). */
  random?: () => number;
  /**
   * Sleep function yang dapat di-override untuk pengujian (agar test tidak
   * benar-benar menunggu). Default memakai `setTimeout`.
   */
  sleep?: (ms: number) => Promise<void>;
}

type TxClient = Prisma.TransactionClient;

/** Callback transaksi. Menerima `tx` yang sama untuk seluruh mutasi. */
export type TransactionRetryCallback<T> = (tx: TxClient) => Promise<T>;

/**
 * Klasifikasi error contention sesuai kontrak Phase 1D §11.
 * P2002 dan `PrismaClientKnownRequestError` non-P2034 TIDAK dianggap contention.
 */
export function isContentionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const maybe = error as { code?: unknown; message?: unknown };

  if (maybe.code === "P2034") return true;

  const message = typeof maybe.message === "string" ? maybe.message : "";
  return (
    message.includes("SQLITE_BUSY") ||
    message.includes("database is locked") ||
    message.includes("SQLITE_LOCKED")
  );
}

/** Error dilempar setelah seluruh percobaan retry habis. */
export class TransactionRetryExhaustedError extends Error {
  readonly attempts: number;
  readonly cause: unknown;

  constructor(attempts: number, cause: unknown) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    super(
      `withTransactionRetry: gagal setelah ${attempts} percobaan karena contention ` +
        `persisten. Penyebab terakhir: ${reason}`
    );
    this.name = "TransactionRetryExhaustedError";
    this.attempts = attempts;
    this.cause = cause;
  }
}

const defaultSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Menjalankan `callback` di dalam transaksi Prisma dengan retry otomatis untuk
 * error contention SQLite. Semua mutasi di dalam `callback` memakai `tx` yang sama.
 *
 * @example
 * const order = await withTransactionRetry(async (tx) => {
 *   const o = await tx.order.create({ data: {...} });
 *   await tx.ledgerJournal.create({ data: {...} });
 *   return o;
 * });
 */
export async function withTransactionRetry<T>(
  callback: TransactionRetryCallback<T>,
  options: TransactionRetryOptions = {}
): Promise<T> {
  const {
    isolationLevel = Prisma.TransactionIsolationLevel.Serializable,
    maxRetries = 5,
    maxWait = 5000,
    timeout = 10000,
    baseDelayMs = 50,
    maxDelayMs = 500,
    random = Math.random,
    sleep = defaultSleep,
  } = options;

  if (!Number.isInteger(maxRetries) || maxRetries < 0) {
    throw new RangeError("withTransactionRetry: `maxRetries` harus bilangan bulat >= 0.");
  }

  const totalAttempts = maxRetries + 1;
  let lastError: unknown;

  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
    try {
      return await prisma.$transaction(callback, {
        isolationLevel,
        maxWait,
        timeout,
      });
    } catch (error) {
      lastError = error;

      // Hanya error contention yang layak di-retry.
      if (!isContentionError(error)) {
        throw error;
      }

      // Percobaan terakhir gagal → tidak ada jadwal retry berikutnya.
      if (attempt === totalAttempts) {
        throw new TransactionRetryExhaustedError(attempt, error);
      }

      // Exponential backoff + full jitter: delay ∈ [0, ceiling].
      const ceiling = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      const delay = Math.floor(random() * ceiling);
      if (delay > 0) {
        await sleep(delay);
      }
    }
  }

  // Secara teori tidak tercapai, namun sebagai jaring pengaman tipe.
  throw new TransactionRetryExhaustedError(totalAttempts, lastError);
}
