/**
 * HariKita - Canonical Domain Types & Vocabularies
 * Single Source of Truth (SSOT) untuk status persisten dan aksi sistem.
 * 
 * ATURAN ARSITEKTUR:
 * 1. Seluruh kumpulan literal wajib memakai pola: const ARRAY as const -> derived union type.
 * 2. Dilarang membuat manual TypeScript enum.
 * 3. Status berlabel PROPOSED belum diformalkan lewat Council dan tidak boleh
 *    diperlakukan sebagai approved business contract.
 */

// ── 1. ORDER LIFECYCLE (APPROVED DOMAIN LITERAL) ───────────────────────────
export const ORDER_STATUSES = [
  'DRAFT',
  'PENDING_CONFIRMATION',
  'PARTIALLY_ACCEPTED',
  'WAITING_DP',
  'EXPIRED',
  'DP_PAID',
  'IN_PROGRESS',
  'WAITING_SETTLEMENT',
  'FULLY_PAID',
  'COMPLETED',
  'CANCELLED',
  'DISPUTED',
  'REFUND_PENDING',
  'REFUNDED',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// ── 2. ORDER ITEM STATUS (APPROVED DOMAIN LITERAL) ─────────────────────────
export const ORDER_ITEM_STATUSES = [
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'CANCELLED',
] as const;

export type OrderItemStatus = (typeof ORDER_ITEM_STATUSES)[number];

// ── 3. VENDOR DECISION COMMAND (APPROVED COMMAND LITERAL) ──────────────────
// Aksi perintah vendor, bukan status persisten di database
export const VENDOR_DECISION_COMMANDS = [
  'ACCEPT',
  'REJECT',
] as const;

export type VendorDecisionCommand = (typeof VENDOR_DECISION_COMMANDS)[number];

// ── 4. VENDOR AVAILABILITY (APPROVED DOMAIN LITERAL) ────────────────────────
// Invariant: BOOKED dilarang direct transisi ke OPEN
export const AVAILABILITY_STATUSES = [
  'OPEN',
  'HELD',
  'RESERVED',
  'BOOKED',
  'BLACKED_OUT',
] as const;

export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

// ── 5. PAYMENT & INSTALLMENT (APPROVED DOMAIN LITERAL) ─────────────────────
export const INSTALLMENT_TYPES = [
  'DP_30',
  'SETTLEMENT_70',
  'FULL_100',
] as const;

export type InstallmentType = (typeof INSTALLMENT_TYPES)[number];

export const INSTALLMENT_STATUSES = [
  'PENDING',
  'PAID',
  'CANCELLED',
] as const;

export type InstallmentStatus = (typeof INSTALLMENT_STATUSES)[number];

export const PAYMENT_ATTEMPT_STATUSES = [
  'CREATED',
  'PENDING',
  'PAID',
  'FAILED',
  'EXPIRED',
] as const;

export type PaymentAttemptStatus = (typeof PAYMENT_ATTEMPT_STATUSES)[number];

// ── 6. LEDGER JOURNAL (APPROVED DOMAIN LITERAL) ────────────────────────────
export const LEDGER_JOURNAL_TYPES = [
  'ESCROW_DP_IN',
  'DP_DISBURSEMENT',
  'SETTLEMENT_IN',
  'SETTLEMENT_PAYOUT',
  'AMBASSADOR_COMMISSION',
  'REVERSAL',
] as const;

export type LedgerJournalType = (typeof LEDGER_JOURNAL_TYPES)[number];

// ── 7. PROPOSED DOMAIN LITERALS (UNAPPROVED EXPLORATORY) ────────────────────
// Status di bawah ini berasal dari komentar awal schema.prisma.
// Diberi prefiks Proposed* secara eksplisit agar TIDAK dianggap sebagai kontrak resmi.

export const PROPOSED_DISPUTE_STATUSES = [
  'OPEN',
  'UNDER_REVIEW',
  'RESOLVED',
  'REJECTED',
  'CLOSED',
] as const;

export type ProposedDisputeStatus = (typeof PROPOSED_DISPUTE_STATUSES)[number];

export const PROPOSED_DISPUTE_REASONS = [
  'VENDOR_NO_SHOW',
  'QUALITY_MISMATCH',
  'UNAUTHORIZED_EXTRA_FEE',
  'CANCEL_REQUEST',
] as const;

export type ProposedDisputeReason = (typeof PROPOSED_DISPUTE_REASONS)[number];

export const PROPOSED_REFUND_STATUSES = [
  'PENDING',
  'PROCESSING',
  'PAID',
  'FAILED',
  'CANCELLED',
] as const;

export type ProposedRefundStatus = (typeof PROPOSED_REFUND_STATUSES)[number];
