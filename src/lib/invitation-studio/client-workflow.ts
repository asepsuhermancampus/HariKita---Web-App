import type { ActionResult } from '@/server/actions/_shared';
import type { StudioMutationToken, StudioState } from './contracts';
import type { InvitationStudioDocument } from './types';

export function studioToken(state: StudioState): StudioMutationToken {
  return { draftId: state.id, expectedVersion: state.versionNumber, expectedStatus: state.status };
}

export async function saveAndSubmitStudioReview(
  state: StudioState,
  document: InvitationStudioDocument,
  save: (input: StudioMutationToken & { document: InvitationStudioDocument }) => Promise<ActionResult<StudioState>>,
  submit: (input: StudioMutationToken) => Promise<ActionResult<StudioState>>,
  acknowledge: (state: StudioState) => void = () => {},
): Promise<ActionResult<StudioState>> {
  const saved = await save({ ...studioToken(state), document });
  if (!saved.success) return saved;
  // Retain the acknowledged version even when the following review request fails.
  acknowledge(saved.data);
  return submit(studioToken(saved.data));
}
