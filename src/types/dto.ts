/**
 * HariKita - Boundary Contracts & Data Transfer Objects (DTO)
 * 
 * ATURAN ARSITEKTUR:
 * 1. DTO adalah kontrak batas (boundary contract), BUKAN mirror model Prisma.
 * 2. Field [CLIENT-OWNED] berstatus UNTRUSTED dan wajib divalidasi ketat oleh server.
 * 3. Field [SERVER-OWNED] dihitung/diambil dari database oleh server transaksi (AUTHORITATIVE).
 * 4. DTO mendefinisikan bentuk data (shape). Validasi invariant bisnis ditegakkan di runtime service.
 */

import type {
  VendorDecisionCommand,
  LedgerJournalType,
} from './domain';
import type {
  AvailabilityErrorCode,
  OrderErrorCode,
} from './errors';

// ── 1. TEMPORARY SLOT CLAIM (15-MINUTE HOLD) ───────────────────────────────
/**
 * Boundary: Browser Checkout -> Server Action (Public Boundary)
 * - Client-owned: vendorId (selector), date (selector)
 * - Server-owned: userId (dari authenticated session), holdToken, holdExpiresAt
 */
export interface ClaimSlotRequestDTO {
  vendorId: string; // Selector identitas toko (untrusted, diverifikasi di DB)
  date: string;     // ISO "YYYY-MM-DD" (dinormalisasi ke 00:00:00 WIB oleh server helper)
}

export interface ClaimSlotResponseDTO {
  success: boolean;
  holdToken?: string;     // Token acak plain dikirim ke browser (hanya SHA-256 tersimpan di DB)
  holdExpiresAt?: string; // ISO string batas waktu 15 menit
  errorCode?: AvailabilityErrorCode;
}

// ── 2. ORDER PLACEMENT (PROMOTION KE RESERVED) ─────────────────────────────
/**
 * Boundary: Keranjang Belanja Client -> Server Action Order (Public Boundary)
 */
export interface CreateOrderItemInputDTO {
  servicePackageId: string; // [CLIENT-OWNED]: ID paket katalog terpilih
  quantity: number;         // [CLIENT-OWNED]: Jumlah pax/baki/unit (default: 1)
  holdToken: string;        // [CLIENT-OWNED]: Token bukti hold 15 menit
  notes?: string;           // [CLIENT-OWNED]: Catatan opsional
}

export interface CreateOrderRequestDTO {
  eventDate: string; // [CLIENT-OWNED]: ISO "YYYY-MM-DD" (dinormalisasi WIB)
  clientName: string;
  clientPhone: string;
  city: string;      // [CLIENT-OWNED]: String bebas (pilot Kebumen dinormalisasi server)
  items: CreateOrderItemInputDTO[];

  /**
   * ALUR RESOLUSI OTORITATIF SERVER (ANTI-TAMPERING):
   * 1. servicePackageId -> Lookup DB:
   *    - Ambil vendorId otoritatif
   *    - Ambil snapshots: vendorNameSnapshot, packageName, packageSnapshot, snapshotVersion
   *    - Ambil unitPrice otoritatif dari katalog database
   * 2. eventDate + vendorId -> Lookup DB VendorAvailability:
   *    - Cari slot @@unique([vendorId, normalizedDate])
   *    - Verifikasi: SHA-256(item.holdToken) === slot.holdTokenHash
   *    - Verifikasi: slot.status === 'HELD' && slot.holdExpiresAt > now()
   * 3. Kalkulasi Finansial Server:
   *    - subtotal = quantity * unitPrice (dihitung server)
   *    - totalAmount = sum(subtotal)
   * 4. Deadlines & Promotion:
   *    - order.vendorResponseDueAt = now() + 24h
   *    - slot.status dipromosikan: HELD -> RESERVED dalam transaksi atomik
   */
}

export interface CreateOrderResponseDTO {
  success: boolean;
  orderNumber?: string;
  totalAmount?: number; // Integer Rupiah
  vendorResponseDueAt?: string;
  errorCode?: OrderErrorCode | AvailabilityErrorCode;
}

// ── 3. VENDOR DECISION COMMAND ─────────────────────────────────────────────
/**
 * Boundary: Dashboard Vendor -> Server Action Respon (Public Boundary)
 */
export interface ProcessVendorDecisionDTO {
  orderItemId: string;            // [CLIENT-OWNED]: Item yang direspon
  command: VendorDecisionCommand; // [CLIENT-OWNED]: 'ACCEPT' | 'REJECT' (Command, bukan state)
  rejectionReason?: string;       // [CLIENT-OWNED]: Wajib jika command === 'REJECT'
  // Server-owned invariant:
  // Server memverifikasi bahwa sesi vendor yang login adalah pemilik sah item tersebut.
}

// ── 4. DOUBLE-ENTRY LEDGER (INTERNAL SERVICE BOUNDARY) ──────────────────────
/**
 * Boundary: Payment/Escrow Service -> LedgerService (Internal Boundary)
 * DTO hanya mendefinisikan shape data. Penegakan invariant akuntansi
 * (sum debit === sum credit & entries.length >= 2) dilakukan oleh LedgerService runtime.
 */
export interface LedgerEntryItemDTO {
  accountId: string; // Identifier akun buku besar
  entityId?: string; // ID Vendor atau ID Klien jika relevan
  debit: number;     // Integer Rupiah >= 0
  credit: number;    // Integer Rupiah >= 0
}

export interface CreateLedgerJournalDTO {
  orderId?: string;
  installmentId?: string;
  type: LedgerJournalType;
  description: string;
  entries: LedgerEntryItemDTO[];
}
