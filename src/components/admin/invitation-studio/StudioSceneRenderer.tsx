"use client";
import React from 'react';
import type { InvitationStudioDocument, StudioNode, StudioSectionId } from '@/lib/invitation-studio/types';
import type { StudioDevice } from '@/lib/invitation-studio/editor';
import { StudioNodeRenderer } from './StudioNodeRenderer';

export function StudioSceneRenderer({
  document,
  device,
  activeSection,
  editor = false,
  transparent = false,
  renderSection,
  renderComponent,
}: {
  document: InvitationStudioDocument;
  device: StudioDevice;
  activeSection?: StudioSectionId;
  editor?: boolean;
  /** When true, root div has no background (used for ghost overlay rendering) */
  transparent?: boolean;
  renderSection?: (id: StudioSectionId) => React.ReactNode;
  renderComponent?: (node: Extract<StudioNode, { kind: 'component' }>) => React.ReactNode;
}) {
  const sectionIds = document.sectionOrder.filter((id) =>
    activeSection
      ? id === activeSection
      : document.sections.find((s) => s.id === id)?.enabled
  );

  return (
    <div
      data-studio-scene
      style={{
        // Clip X only; Y overflow allowed for cross-section decorative assets
        overflowX: 'clip',
        overflowY: 'visible',
        width: '100%',
        borderRadius: device === 'mobile' ? '28px' : '16px',
        // Ghost renders without background so only its assets show at 60% opacity
        background: transparent ? 'transparent' : '#FAF8F5',
        color: '#4A2E35',
      }}
    >
      {sectionIds.map((id) => {
        const section = document.sections.find((s) => s.id === id)!;
        // Always allow decorative assets to cross section boundaries seamlessly in both editor and preview
        const overflow = 'visible';
        return (
          <section
            key={id}
            data-studio-section={id}
            style={{
              position: 'relative',
              isolation: editor ? undefined : 'isolate',
              height: 640,
              overflow,
              // Subtle dashed divider in editor so section boundaries are visible; clean in preview and omitted on the last section to protect bottom rounded corner
              borderBottom: (editor && id !== sectionIds[sectionIds.length - 1]) ? '1px dashed #C5A88044' : undefined,
              // Ghost sections: transparent section background
              background: transparent ? 'transparent' : undefined,
            }}
          >
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                pointerEvents: 'none',
                padding: 24,
                height: '100%',
              }}
            >
              {renderSection?.(id)}
            </div>
            {section.nodes.map((node) => (
              <StudioNodeRenderer
                key={node.id}
                node={node}
                device={device}
                editor={editor}
                renderComponent={renderComponent}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
}
