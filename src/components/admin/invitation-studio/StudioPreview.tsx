"use client";

import React from 'react';
import type { InvitationStudioDocument, StudioSectionId } from '@/lib/invitation-studio/types';
import { StudioSceneRenderer } from './StudioSceneRenderer';
import { STUDIO_FIXTURE } from './studio-fixtures';

export function StudioPreviewContent({ document, width = 375 }: { document: InvitationStudioDocument; width?: 375 | 768 | 1024 }) {
  return (
    <div data-preview-width={width} style={{ width: '100%', maxWidth: width, overflowX: 'hidden', margin: '0 auto' }}>
      <StudioSceneRenderer document={document} device={width <= 768 ? 'mobile' : 'desktop'} renderSection={(id: StudioSectionId) => (
        <div data-preview-fixture={id}>
          {id === 'cover' || id === 'couple' ? <h2>{STUDIO_FIXTURE.couple}</h2> : null}
          {id === 'events' ? <p>{STUDIO_FIXTURE.events}</p> : null}
          {id === 'quote-prayer' ? <p>{STUDIO_FIXTURE.quote}</p> : null}
        </div>
      )} />
    </div>
  );
}

export function StudioPreview({ onClose, ...props }: React.ComponentProps<typeof StudioPreviewContent> & { onClose?: () => void }) {
  return <div className="fixed inset-0 z-50 overflow-auto bg-black/40 p-4" role="dialog" aria-label="Pratinjau undangan">
    <div className="mx-auto max-w-3xl rounded-2xl bg-[#FAF8F5] p-4">
      {onClose && <button type="button" className="mb-3 min-h-11 rounded-lg px-4" onClick={onClose}>Tutup</button>}
      <StudioPreviewContent {...props} />
    </div>
  </div>;
}
