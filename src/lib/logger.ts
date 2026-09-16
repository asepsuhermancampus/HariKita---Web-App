/**
 * HariKita - Structured Logger
 *
 * Log terstruktur (JSON) untuk produksi, human-readable saat development.
 * Menyertakan level, waktu, konteks, dan pesan. Aman: tidak log secret/PII.
 *
 * Penggunaan:
 *   logger.info("payment.webhook.processed", { orderId, eventId });
 *   logger.error("payment.webhook.failed", error, { eventId });
 */

type Level = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

function minLevel(): number {
  const env = process.env.LOG_LEVEL as Level | undefined;
  if (env && env in LEVEL_ORDER) return LEVEL_ORDER[env];
  return process.env.NODE_ENV === "production" ? LEVEL_ORDER.info : LEVEL_ORDER.debug;
}

/** Kunci yang nilainya TIDAK boleh dicatat (secret/PII). */
const REDACT_KEYS = new Set([
  "pin",
  "password",
  "secret",
  "token",
  "authorization",
  "serverKey",
  "apiKey",
  "clientPhone",
  "customerWhatsApp",
]);

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = REDACT_KEYS.has(k) ? "[REDACTED]" : redact(v);
    }
    return out;
  }
  return value;
}

function emit(level: Level, message: string, context?: Record<string, unknown>): void {
  if (LEVEL_ORDER[level] < minLevel()) return;

  const payload = {
    level,
    time: new Date().toISOString(),
    message,
    ...(context ? { context: redact(context) } : {}),
  };

  const line =
    process.env.NODE_ENV === "production"
      ? JSON.stringify(payload)
      : `[${payload.time}] ${level.toUpperCase()} ${message}${
          context ? " " + JSON.stringify(redact(context)) : ""
        }`;

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => emit("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) => emit("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => emit("warn", message, context),
  error: (message: string, error?: unknown, context?: Record<string, unknown>) =>
    emit("error", message, {
      ...(context ?? {}),
      ...(error
        ? { error: error instanceof Error ? { name: error.name, message: error.message } : String(error) }
        : {}),
    }),
};

export function appErrorCode(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    return String((error as { code: unknown }).code);
  }
  return "UNKNOWN";
}
