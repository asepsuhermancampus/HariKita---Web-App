import { sanitizeContent } from "@/lib/content-guard";

/**
 * HariKita - Content Audit Scanner
 *
 * Pemindai read-only untuk mendeteksi kebocoran kontak (nomor HP/medsos) pada
 * teks yang disimpan (deskripsi vendor, caption portofolio). Berbeda dengan
 * sanitizeContent yang menyensor, scanner ini hanya melaporkan.
 */

export interface ScanResult {
  flagged: boolean;
  matches: string[];
}

export function scanForContactLeaks(text: string): ScanResult {
  const result = sanitizeContent(text);
  return { flagged: result.flagged, matches: result.matches };
}
