export type SandboxBlock = 'rsvp' | 'guestbook' | string;

export function sandboxReply(block: SandboxBlock, name: string, value: string) {
  if (!name.trim() || !value.trim()) return { success: false, message: 'Nama dan pilihan wajib diisi.' };
  return { success: true, message: `Simulasi ${block} berhasil untuk ${name.trim()}.` };
}

export const STUDIO_FIXTURE = {
  couple: 'Pasangan Contoh',
  events: 'Akad & resepsi contoh',
  quote: 'Dengan penuh syukur, kami mengundang Anda.',
} as const;
