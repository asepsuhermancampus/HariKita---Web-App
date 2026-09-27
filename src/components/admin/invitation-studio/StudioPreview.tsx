"use client";

import React, { useState } from 'react';
import type { InvitationStudioDocument, StudioSectionId } from '@/lib/invitation-studio/types';
import { StudioSceneRenderer } from './StudioSceneRenderer';
import { STUDIO_FIXTURE } from './studio-fixtures';
import { Smartphone, Tablet, Monitor, X, Eye } from 'lucide-react';

export function StudioPreviewContent({ document, width = 375 }: { document: InvitationStudioDocument; width?: 375 | 768 | 1024 }) {
  return (
    <div 
      data-preview-width={width} 
      style={{ width: '100%', maxWidth: width, overflowX: 'hidden', margin: '0 auto' }}
      className="rounded-2xl shadow-xl border border-hk-soft-beige bg-white"
    >
      <StudioSceneRenderer 
        document={document} 
        device={width <= 768 ? 'mobile' : 'desktop'} 
        renderSection={(id: StudioSectionId) => (
          <div data-preview-fixture={id} className="text-center font-serif">
            {id === 'cover' || id === 'couple' ? <h2 className="text-xl font-bold">{STUDIO_FIXTURE.couple}</h2> : null}
            {id === 'events' ? <p className="text-sm mt-1">{STUDIO_FIXTURE.events}</p> : null}
            {id === 'quote-prayer' ? <p className="text-xs italic mt-1 text-hk-taupe">{STUDIO_FIXTURE.quote}</p> : null}
          </div>
        )} 
      />
    </div>
  );
}

export function StudioPreview({ 
  onClose, 
  document, 
  width: initialWidth = 375, 
  ...props 
}: React.ComponentProps<typeof StudioPreviewContent> & { onClose?: () => void }) {
  const [activeWidth, setActiveWidth] = useState<375 | 768 | 1024>(initialWidth);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/60 backdrop-blur-xs p-4 sm:p-6" 
      role="dialog" 
      aria-label="Pratinjau undangan"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl bg-[#FAF8F5] shadow-2xl border border-hk-soft-beige">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hk-soft-beige/80 px-6 py-4">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-[#C5A880]" />
            <h3 className="font-editorial text-xl font-bold text-hk-charcoal">
              Pratinjau Undangan Digital
            </h3>
          </div>

          {/* Viewport switchers inside preview */}
          <div className="flex items-center rounded-xl bg-white border border-hk-soft-beige p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveWidth(375)}
              className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition ${
                activeWidth === 375 
                  ? 'bg-[#4A2E35] text-white shadow-2xs' 
                  : 'text-hk-taupe hover:text-hk-charcoal'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Mobile (375px)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveWidth(768)}
              className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition ${
                activeWidth === 768 
                  ? 'bg-[#4A2E35] text-white shadow-2xs' 
                  : 'text-hk-taupe hover:text-hk-charcoal'
              }`}
            >
              <Tablet className="h-3.5 w-3.5" />
              <span>Tablet (768px)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveWidth(1024)}
              className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition ${
                activeWidth === 1024 
                  ? 'bg-[#4A2E35] text-white shadow-2xs' 
                  : 'text-hk-taupe hover:text-hk-charcoal'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Desktop (1024px)</span>
            </button>
          </div>

          {/* Close button with text 'Tutup' */}
          {onClose && (
            <button 
              type="button" 
              className="flex h-9 items-center gap-1.5 rounded-xl border border-hk-soft-beige bg-white px-3.5 text-xs font-bold text-hk-charcoal transition hover:bg-stone-100" 
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span>Tutup</span>
            </button>
          )}
        </div>

        {/* Scrollable Preview Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F3EDE6]/40">
          <StudioPreviewContent document={document} width={activeWidth} {...props} />
        </div>
      </div>
    </div>
  );
}
