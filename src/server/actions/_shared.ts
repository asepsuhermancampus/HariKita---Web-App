import { revalidatePath } from "next/cache";
import { getSession, type SessionData } from "@/lib/session";
import { DomainError, toMappedError, type MappedError } from "@/server/services/errors";

/**
 * HariKita - Server Action Transport Helpers
 *
 * Utilitas bersama untuk seluruh Server Action Phase 2:
 *  - pembacaan sesi (auth guard),
 *  - pembungkus error domain → respons serializable,
 *  - bentuk hasil standar.
 */

export interface ActionSuccess<T> {
  success: true;
  data: T;
}

export type ActionResult<T> = ActionSuccess<T> | MappedError;

/** Membungkus error apa pun menjadi `MappedError` yang aman untuk klien. */
export function toActionError(error: unknown): MappedError {
  return toMappedError(error);
}

/** Mengambil sesi login yang wajib ada (auth guard untuk Server Action). */
export async function requireSession(): Promise<SessionData> {
  const session = await getSession();
  if (!session) {
    throw new DomainError("UNAUTHORIZED_ORDER_ACCESS", "Sesi tidak ditemukan. Silakan login kembali.");
  }
  return session;
}

/** Mengambil sesi atau null (untuk alur lazy-registration). */
export async function optionalSession(): Promise<SessionData | null> {
  return getSession();
}

/**
 * Menjalankan logika action dengan penanganan error seragam.
 * Mengembalikan `{ success: true, data }` atau `MappedError`.
 */
export async function runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    return toActionError(error);
  }
}

/** Revalidasi beberapa path sekaligus (idempotent). */
export function revalidate(paths: string[]): void {
  for (const p of paths) {
    try {
      revalidatePath(p);
    } catch {
      // revalidatePath dapat gagal di luar konteks request; abaikan aman.
    }
  }
}
