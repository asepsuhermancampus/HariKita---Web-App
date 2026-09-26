import type { InvitationStudioDocument } from './types';
export type StudioDraftStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
/** Both values are required: review/approval can change without creating a version. */
export interface StudioMutationToken { draftId: string; expectedVersion: number; expectedStatus: StudioDraftStatus; }
export interface StudioState {
  id: string;
  name: string;
  status: StudioDraftStatus;
  versionNumber: number;
  document: InvitationStudioDocument;
  updatedAt: string;
}
