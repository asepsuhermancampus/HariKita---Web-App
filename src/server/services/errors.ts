/**
 * HariKita - Domain Error (service layer)
 *
 * Membungkus kegagalan business-rule dengan kode kanonik dari `src/types/errors.ts`
 * agar seluruh service dapat memetakan error secara konsisten ke respons transport
 * (Server Action / Route Handler) tanpa menduplikasi kosakata.
 *
 * Klasifikasi e RR (Phase 1D v9 §13):
 *  - Transient contention  → ditangani `withTransactionRetry` (P2034/SQLITE_BUSY).
 *  - Permanent business rejection → `DomainError` dengan kode kanonik.
 *  - Unexpected system error → error apa pun yang bukan `DomainError`.
 */

import type {
  AppDomainErrorCode,
  AvailabilityErrorCode,
  LedgerErrorCode,
  OrderErrorCode,
  PaymentErrorCode,
} from "@/types/errors";

export type AnyDomainErrorCode =
  | AvailabilityErrorCode
  | OrderErrorCode
  | PaymentErrorCode
  | LedgerErrorCode;

/**
 * Error domain yang merepresentasikan penolakan business-rule yang bersifat
 * PERMANENT (tidak akan berubah bila di-retry tanpa perubahan input).
 */
export class DomainError extends Error {
  readonly code: AnyDomainErrorCode;
  readonly detail?: unknown;

  constructor(code: AnyDomainErrorCode, message: string, detail?: unknown) {
    super(`${code}: ${message}`);
    this.name = "DomainError";
    this.code = code;
    this.detail = detail;
  }
}

/**
 * Error sistemik tak terduga (mis. TypeError, FK violation). Selalu disurfacekan
 * sebagai kegagalan tidak terduga agar pemanggil dapat mengirim HTTP 500 /
 * membiarkan `processed = false` pada webhook.
 */
export class UnexpectedSystemError extends Error {
  readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(`UNEXPECTED_SYSTEM_ERROR: ${message}`);
    this.name = "UnexpectedSystemError";
    this.cause = cause;
  }
}

/** Type guard: apakah error merupakan penolakan business-rule permanen. */
export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}

/**
 * Memetakan error domain menjadi bentuk respons transport standar.
 * Transport layer (Server Action / API route) dapat langsung mengembalikan ini.
 */
export interface MappedError {
  success: false;
  errorCode: AppDomainErrorCode | "UNEXPECTED_SYSTEM_ERROR";
  message: string;
}

export function toMappedError(error: unknown): MappedError {
  if (isDomainError(error)) {
    return {
      success: false,
      errorCode: error.code,
      message: error.message,
    };
  }
  if (error instanceof UnexpectedSystemError) {
    return {
      success: false,
      errorCode: "UNEXPECTED_SYSTEM_ERROR",
      message: error.message,
    };
  }
  return {
    success: false,
    errorCode: "UNEXPECTED_SYSTEM_ERROR",
    message: error instanceof Error ? error.message : String(error),
  };
}
