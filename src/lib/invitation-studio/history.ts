import type { InvitationStudioDocument } from './types';

export class StudioHistory {
  private past: InvitationStudioDocument[] = [];
  private future: InvitationStudioDocument[] = [];
  constructor(private current: InvitationStudioDocument, private readonly limit = 50) {}
  get document() { return this.current; }
  get canUndo() { return this.past.length > 0; }
  get canRedo() { return this.future.length > 0; }
  push(document: InvitationStudioDocument) { this.past.push(this.current); if (this.past.length > this.limit) this.past.shift(); this.current = document; this.future = []; }
  undo() { const previous = this.past.pop(); if (!previous) return null; this.future.push(this.current); this.current = previous; return this.current; }
  redo() { const next = this.future.pop(); if (!next) return null; this.past.push(this.current); this.current = next; return this.current; }
  reset(document: InvitationStudioDocument) { this.current = document; this.past = []; this.future = []; }
}
