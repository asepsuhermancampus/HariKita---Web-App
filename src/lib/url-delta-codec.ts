/**
 * URL Delta Codec for HariKita Undangan DS Studio
 * Serializes & deserializes custom invitation configurations into safe, compact URL hashes.
 * Includes strict input sanitization to prevent XSS (no javascript: or invalid protocols).
 */

import { InvitationStudioConfig } from '@/types/invitation-studio';

export function sanitizeUrl(url: string | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();
  // Enforce strict http/https protocol check
  return /^https?:\/\//i.test(trimmed) ? trimmed : '';
}

/**
 * Compact delta representation of user customizations
 */
export interface StudioDeltaPayload {
  v: 1;
  theme?: string;
  couple?: string;
  placement?: string;
  gallery?: string;
  effects?: string[];
  animations?: string[];
  slots?: Record<string, string>;
  sections?: Array<{ id: string; enabled: boolean; order: number }>;
  content?: {
    groom?: string;
    groomParents?: string;
    bride?: string;
    brideParents?: string;
    date?: string;
    venue?: string;
    address?: string;
    mapsUrl?: string;
    quote?: string;
    bank?: string;
    account?: string;
    holder?: string;
  };
}

/**
 * Encodes an InvitationStudioConfig into a URL-safe Base64 hash
 */
export function encodeStudioDelta(config: Partial<InvitationStudioConfig>): string {
  try {
    const payload: StudioDeltaPayload = {
      v: 1,
      theme: config.themeColor,
      couple: config.coupleVariant,
      placement: config.placementStyle,
      gallery: config.galleryVariant,
      effects: config.activeEffects,
      animations: config.activeAnimations,
      slots: config.slotAssets as Record<string, string>,
    };

    if (config.sections) {
      payload.sections = config.sections.map((s) => ({
        id: s.id,
        enabled: s.enabled,
        order: s.order,
      }));
    }

    if (config.content) {
      payload.content = {
        groom: config.content.groomName,
        groomParents: config.content.groomParents,
        bride: config.content.brideName,
        brideParents: config.content.brideParents,
        date: config.content.weddingDate,
        venue: config.content.venueName,
        address: config.content.venueAddress,
        mapsUrl: sanitizeUrl(config.content.locationMapsUrl),
        quote: config.content.quoteText,
        bank: config.content.bankName,
        account: config.content.bankAccount,
        holder: config.content.bankHolder,
      };
    }

    const jsonStr = JSON.stringify(payload);
    // Base64 encode for URL safety
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
      return encodeURIComponent(window.btoa(unescape(encodeURIComponent(jsonStr))));
    } else {
      return encodeURIComponent(Buffer.from(jsonStr, 'utf-8').toString('base64'));
    }
  } catch (err) {
    console.warn('[encodeStudioDelta] Serialization failed:', err);
    return '';
  }
}

/**
 * Decodes a URL-safe Base64 hash back into Partial<InvitationStudioConfig>
 * Returns null if corrupted or invalid.
 */
export function decodeStudioDelta(hash: string): Partial<InvitationStudioConfig> | null {
  if (!hash || typeof hash !== 'string') return null;

  try {
    // Strip leading '#' if present
    const cleanHash = hash.replace(/^#/, '');
    let jsonStr = '';

    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      jsonStr = decodeURIComponent(escape(window.atob(decodeURIComponent(cleanHash))));
    } else {
      jsonStr = Buffer.from(decodeURIComponent(cleanHash), 'base64').toString('utf-8');
    }

    const parsed: StudioDeltaPayload = JSON.parse(jsonStr);
    if (!parsed || parsed.v !== 1) {
      return null;
    }

    const config: Partial<InvitationStudioConfig> = {};

    if (parsed.theme && /^#[0-9A-Fa-f]{6}$/.test(parsed.theme)) {
      config.themeColor = parsed.theme;
    }
    if (parsed.couple) config.coupleVariant = parsed.couple as any;
    if (parsed.placement) config.placementStyle = parsed.placement as any;
    if (parsed.gallery) config.galleryVariant = parsed.gallery;
    if (Array.isArray(parsed.effects)) config.activeEffects = parsed.effects as any;
    if (Array.isArray(parsed.animations)) config.activeAnimations = parsed.animations as any;
    if (parsed.slots && typeof parsed.slots === 'object') {
      config.slotAssets = parsed.slots;
    }

    if (Array.isArray(parsed.sections)) {
      config.sections = parsed.sections.map((s) => ({
        id: s.id as any,
        label: s.id,
        enabled: Boolean(s.enabled),
        order: Number(s.order) || 0,
      }));
    }

    if (parsed.content && typeof parsed.content === 'object') {
      config.content = {
        groomName: parsed.content.groom || '',
        groomParents: parsed.content.groomParents || '',
        brideName: parsed.content.bride || '',
        brideParents: parsed.content.brideParents || '',
        weddingDate: parsed.content.date || '',
        venueName: parsed.content.venue || '',
        venueAddress: parsed.content.address || '',
        locationMapsUrl: sanitizeUrl(parsed.content.mapsUrl),
        quoteText: parsed.content.quote || '',
        bankName: parsed.content.bank || '',
        bankAccount: parsed.content.account || '',
        bankHolder: parsed.content.holder || '',
      };
    }

    return config;
  } catch (err) {
    console.warn('[decodeStudioDelta] Hash decoding returned corrupted state:', err);
    return null;
  }
}
