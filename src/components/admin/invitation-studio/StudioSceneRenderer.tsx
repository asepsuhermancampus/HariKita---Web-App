"use client";
import React from 'react';
import type { InvitationStudioDocument, StudioNode, StudioSectionId } from '@/lib/invitation-studio/types';
import type { StudioDevice } from '@/lib/invitation-studio/editor';
import { StudioNodeRenderer } from './StudioNodeRenderer';

export function StudioSceneRenderer({ document, device, activeSection, editor = false, renderSection, renderComponent }: { document: InvitationStudioDocument; device: StudioDevice; activeSection?: StudioSectionId; editor?: boolean; renderSection?: (id: StudioSectionId) => React.ReactNode; renderComponent?: (node: Extract<StudioNode, { kind: 'component' }>) => React.ReactNode }) {
  return <div data-studio-scene style={{ overflowX: 'clip', width: '100%', background: '#FAF8F5', color: '#4A2E35' }}>{document.sectionOrder.filter(id => activeSection ? id === activeSection : document.sections.find(s => s.id === id)?.enabled).map(id => {
    const section = document.sections.find(s => s.id === id)!;
    return <section key={id} data-studio-section={id} style={{ position: 'relative', isolation: 'isolate', height: 640, overflow: section.overflowPolicy === 'visible' ? 'visible' : 'hidden', borderBottom: '1px solid #F3EDE6' }}>
      <div style={{ position: 'relative', zIndex: 2, pointerEvents: 'none', padding: 24, height: '100%' }}>{renderSection?.(id)}</div>
      {section.nodes.map(node => <StudioNodeRenderer key={node.id} node={node} device={device} editor={editor} renderComponent={renderComponent} />)}
    </section>;
  })}</div>;
}
