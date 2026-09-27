export type AutosaveStatus = 'saved' | 'saving' | 'error' | 'conflict';
type SaveResult<T> = { success: true; data: T } | { success: false; errorCode?: string; message: string };
export class StudioAutosaveCoordinator<D, T> {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private sequence = 0; private inFlight = false; private pending = false; private lastToken: unknown; private lastError: Error | null = null;
  private latest: D;
  status: AutosaveStatus = 'saved';
  constructor(private readonly options: { save: (document: D, token: unknown) => Promise<SaveResult<T>>; debounceMs?: number; onStatus?: (status: AutosaveStatus) => void; }) { this.latest = undefined as D; }
  private setStatus(status: AutosaveStatus) { this.status = status; this.options.onStatus?.(status); }
  get document() { return this.latest; }
  edit(document: D, token: unknown) { this.latest = document; this.lastToken = token; this.pending = true; this.setStatus('saving'); if (this.timer) clearTimeout(this.timer); this.timer = setTimeout(() => { this.timer = null; void this.flush(); }, this.options.debounceMs ?? 400); }
  async flush() { if (!this.pending || this.inFlight) return; this.pending = false; this.inFlight = true; const seq = ++this.sequence; const document = this.latest, token = this.lastToken; const result = await this.options.save(document, token); this.inFlight = false; if (seq !== this.sequence) { this.pending = true; return; } if (!result.success) { this.setStatus(result.errorCode === 'STUDIO_CONFLICT' ? 'conflict' : 'error'); this.lastError = new Error(result.message); return; } this.setStatus('saved'); if (this.pending) void this.flush(); }
  retry() { if (!this.lastError) return false; this.pending = true; this.setStatus('saving'); void this.flush(); return true; }
  fail(error: Error) { this.lastError = error; this.setStatus('error'); }
  dispose() { if (this.timer) clearTimeout(this.timer); this.timer = null; this.sequence++; }
}
