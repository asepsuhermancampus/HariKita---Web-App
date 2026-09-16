/**
 * Content Guard: Anti-Disintermediation & Contact Leakage Sanitizer
 * Mencegah vendor atau pengguna menyisipkan nomor HP, link media sosial,
 * atau rekening pribadi untuk mengalihkan transaksi ke luar platform HariKita Kebumen.
 */

const LEET_DECODE_MAP: Record<string, string> = {
  o: "0",
  O: "0",
  i: "1",
  I: "1",
  l: "1",
  e: "3",
  E: "3",
  a: "4",
  A: "4",
  "@": "4",
  s: "5",
  S: "5",
  g: "6",
  G: "6",
  t: "7",
  T: "7",
  b: "8",
  B: "8",
};

const NUMBER_WORDS: Record<string, string> = {
  nol: "0",
  kosong: "0",
  satu: "1",
  dua: "2",
  tiga: "3",
  empat: "4",
  lima: "5",
  enam: "6",
  tujuh: "7",
  delapan: "8",
  sembilan: "9",
};

const PHONE_REGEX_RAW = /(?:\+?62|08|628)[\s\d\-().]{7,16}\d/gi;
const DIGIT_STREAM_REGEX = /\d{8,14}/g;
const CONTACT_KEYWORDS_REGEX =
  /(?:wa|whatsapp|tlp|telepon|hp|hubungi|call|kontak|ig|instagram|tiktok|tele|telegram)[\s:\-]*[a-z0-9\s\-().]{4,}/gi;

/**
 * Menormalkan teks dari teknik penyamaran leetspeak dan kata angka Indonesia
 */
export function normalizeLeetspeak(input: string): string {
  let text = input.toLowerCase();

  for (const [word, digit] of Object.entries(NUMBER_WORDS)) {
    text = text.replaceAll(word, digit);
  }

  return text
    .split("")
    .map((char) => LEET_DECODE_MAP[char] || char)
    .join("");
}

export interface GuardResult {
  flagged: boolean;
  cleanText: string;
  matches: string[];
}

/**
 * Memeriksa dan menyensor kontak langsung pada teks
 */
export function sanitizeContent(content: string): GuardResult {
  if (!content || !content.trim()) {
    return { flagged: false, cleanText: "", matches: [] };
  }

  const rawMatches = content.match(PHONE_REGEX_RAW) || [];
  const keywordMatches = content.match(CONTACT_KEYWORDS_REGEX) || [];

  // Normalisasi leetspeak, lalu deteksi digit-run PER-TOKEN (dipisah whitespace)
  // agar kata biasa seperti "Menganti" tidak digabung menjadi deretan angka palsu.
  const normalized = normalizeLeetspeak(content);
  const digitMatches: string[] = [];
  for (const token of normalized.split(/\s+/)) {
    const digitsOnly = token.replace(/[^\d]/g, "");
    const m = digitsOnly.match(DIGIT_STREAM_REGEX);
    if (m) digitMatches.push(...m);
  }

  const allMatches = Array.from(
    new Set([...rawMatches, ...keywordMatches, ...digitMatches])
  );

  let cleanText = content;

  if (allMatches.length > 0) {
    cleanText = cleanText
      .replace(PHONE_REGEX_RAW, "[KONTAK DISENSOR OLEH SISTEM]")
      .replace(CONTACT_KEYWORDS_REGEX, "[MEDSOS DISENSOR OLEH SISTEM]");
  }

  return {
    flagged: allMatches.length > 0,
    cleanText,
    matches: allMatches,
  };
}

/**
 * Helper deteksi pelanggaran kontak luar untuk form validation & CMS
 */
export function detectOffPlatformContact(content: string) {
  const res = sanitizeContent(content);
  return {
    isViolation: res.flagged,
    cleanText: res.cleanText,
    matches: res.matches,
    reason: res.flagged ? "Terdeteksi nomor telepon atau kontak media sosial luar." : "",
  };
}

