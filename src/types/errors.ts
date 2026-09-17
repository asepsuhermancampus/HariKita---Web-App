/**
 * HariKita - Canonical Domain Error Vocabularies
 * Dikelompokkan berdasarkan domain failure modes untuk mencegah dumping ground.
 */

// ── 1. AVAILABILITY ERROR CODES ────────────────────────────────────────────
export const AVAILABILITY_ERROR_CODES = [
  'SLOT_UNAVAILABLE',
  'SLOT_ALREADY_CLAIMED',
  'HOLD_EXPIRED',
  'HOLD_TOKEN_INVALID',
  'INVALID_AVAILABILITY_TRANSITION',
  'DATE_OUT_OF_SERVICE_WINDOW',
] as const;

export type AvailabilityErrorCode = (typeof AVAILABILITY_ERROR_CODES)[number];

// ── 2. ORDER LIFECYCLE ERROR CODES ─────────────────────────────────────────
export const ORDER_ERROR_CODES = [
  'ORDER_NOT_FOUND',
  'ORDER_ITEM_NOT_FOUND',
  'INVALID_ORDER_TRANSITION',
  'VENDOR_RESPONSE_EXPIRED',
  'UNAUTHORIZED_ORDER_ACCESS',
  'ITEM_PACKAGE_MISMATCH',
  'CANNOT_CANCEL_CONFIRMED_ORDER',
] as const;

export type OrderErrorCode = (typeof ORDER_ERROR_CODES)[number];

// ── 3. PAYMENT & SETTLEMENT ERROR CODES ────────────────────────────────────
export const PAYMENT_ERROR_CODES = [
  'INSTALLMENT_NOT_FOUND',
  'INSTALLMENT_ALREADY_PAID',
  'PAYMENT_AMOUNT_MISMATCH',
  'PAYMENT_ATTEMPT_FAILED',
  'IDEMPOTENCY_KEY_REPLAYED',
  'WEBHOOK_SIGNATURE_INVALID',
  'DUPLICATE_WEBHOOK_EVENT',
] as const;

export type PaymentErrorCode = (typeof PAYMENT_ERROR_CODES)[number];

// ── 4. LEDGER & ACCOUNTING ERROR CODES ─────────────────────────────────────
export const LEDGER_ERROR_CODES = [
  'LEDGER_IMBALANCE',
  'LEDGER_INSUFFICIENT_ENTRIES',
  'LEDGER_INVALID_ENTRY_AMOUNTS',
  'JOURNAL_ALREADY_REVERSED',
  'CANNOT_REVERSE_REVERSAL_JOURNAL',
] as const;

export type LedgerErrorCode = (typeof LEDGER_ERROR_CODES)[number];

// ── 5. CONSOLIDATED APPLICATION ERROR UNION ────────────────────────────────
export type AppDomainErrorCode =
  | AvailabilityErrorCode
  | OrderErrorCode
  | PaymentErrorCode
  | LedgerErrorCode;
