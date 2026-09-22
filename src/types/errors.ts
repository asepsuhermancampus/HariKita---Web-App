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

// ── 5. BRAND AMBASSADOR ERROR CODES ────────────────────────────────────────
export const AMBASSADOR_ERROR_CODES = [
  'BA_NOT_FOUND',
  'INSUFFICIENT_BALANCE',
  'INVALID_WITHDRAWAL_AMOUNT',
  'WITHDRAWAL_NOT_FOUND',
  'WITHDRAWAL_ALREADY_RESOLVED',
  'INVALID_AMBASSADOR_INPUT',
] as const;

export type AmbassadorErrorCode = (typeof AMBASSADOR_ERROR_CODES)[number];

// ── 6. AUTH / OTP ERROR CODES ──────────────────────────────────────────────
export const OTP_ERROR_CODES = [
  'INVALID_EMAIL',
  'INVALID_PHONE',
  'EMAIL_ALREADY_USED',
  'PHONE_ALREADY_USED',
  'OTP_NOT_FOUND',
  'OTP_EXPIRED',
  'OTP_INVALID',
  'OTP_LOCKED',
  'OTP_COOLDOWN',
  'OTP_DAILY_LIMIT',
  'PIN_TOO_RECENT',
  'EMAIL_SEND_FAILED',
] as const;

export type OtpErrorCode = (typeof OTP_ERROR_CODES)[number];

// ── 8. ADMIN AUTHORIZATION ERROR CODES ─────────────────────────────────────
export const ADMIN_ERROR_CODES = [
  'UNAUTHORIZED_ADMIN_CAPABILITY',
] as const;

export type AdminErrorCode = (typeof ADMIN_ERROR_CODES)[number];

// ── 9. PLATFORM SETTINGS ERROR CODES ───────────────────────────────────────
export const SETTINGS_ERROR_CODES = [
  'INVALID_PLATFORM_SETTINGS',
  'ADMIN_EDIT_NOT_UNLOCKED',
] as const;

export type SettingsErrorCode = (typeof SETTINGS_ERROR_CODES)[number];

// ── 10. CONSOLIDATED APPLICATION ERROR UNION ───────────────────────────────
export type AppDomainErrorCode =
  | AvailabilityErrorCode
  | OrderErrorCode
  | PaymentErrorCode
  | LedgerErrorCode
  | AmbassadorErrorCode
  | OtpErrorCode
  | AdminErrorCode
  | SettingsErrorCode;
