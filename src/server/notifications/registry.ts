import type { NotificationChannel, NotificationAdapter } from "./types";
import { createWhatsAppAdapter } from "./whatsapp-adapter";
import { createEmailAdapter } from "./email-adapter";

/**
 * HariKita - Notification Adapter Registry
 */

const REGISTRY: Record<Exclude<NotificationChannel, "IN_APP">, () => NotificationAdapter> = {
  WHATSAPP: createWhatsAppAdapter,
  EMAIL: createEmailAdapter,
};

export function getNotificationAdapter(
  channel: Exclude<NotificationChannel, "IN_APP">
): NotificationAdapter {
  const factory = REGISTRY[channel];
  if (!factory) throw new Error(`UNKNOWN_NOTIFICATION_CHANNEL: ${channel}`);
  return factory();
}

export type { NotificationAdapter, NotificationChannel } from "./types";
