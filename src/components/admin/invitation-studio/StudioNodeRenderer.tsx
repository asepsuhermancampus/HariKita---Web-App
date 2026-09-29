"use client";
import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { StudioNode } from '@/lib/invitation-studio/types';
import { resolveTransform, type StudioDevice } from '@/lib/invitation-studio/editor';
import { resolveStudioMotion, resolveCompositeStudioMotion } from './studio-motion-presets';
import { loadGoogleFont, getFontFamilyCss } from '@/lib/invitation-studio/fonts';

export function StudioNodeRenderer({ node, device, editor = false, renderComponent }: { node: StudioNode; device: StudioDevice; editor?: boolean; renderComponent?: (node: Extract<StudioNode, { kind: 'component' }>) => React.ReactNode }) {
  const reduced = useReducedMotion();

  React.useEffect(() => {
    if (node.kind === 'text' && node.config.fontFamily) {
      loadGoogleFont(node.config.fontFamily);
    }
  }, [node.kind, (node as any).config?.fontFamily]);

  if (!node.visible) return null;
  const t = resolveTransform(node, device);
  const layers = { background: 0, 'behind-content': 1, content: 2, 'front-decoration': 3, component: 4 };
  const interactive = node.kind === 'component';
  let content: React.ReactNode;
  if (node.kind === 'text') {
    content = (
      <p
        style={{
          margin: 0,
          color: node.config.color ?? '#4A2E35',
          fontSize: node.config.fontSize ?? 28,
          textAlign: node.config.align ?? 'center',
          fontFamily: getFontFamilyCss(node.config.fontFamily),
          fontWeight: node.config.fontWeight ?? 'normal',
          fontStyle: node.config.fontStyle ?? 'normal',
          letterSpacing: node.config.letterSpacing !== undefined ? `${node.config.letterSpacing}px` : undefined,
          lineHeight: node.config.lineHeight ?? 1.25,
          overflowWrap: 'anywhere',
          whiteSpace: 'pre-wrap',
        }}
      >
        {node.config.text}
      </p>
    );
  } else if (node.kind === 'component') {
    content = renderComponent?.(node) ?? <div className="rounded border border-[#C5A880] bg-[#FAF8F5] p-3">{node.config.title || node.config.component} · Sandbox</div>;
  } else {
    content = <img src={node.config.src} alt={node.accessibility.label} draggable={false} style={{ width: '100%', height: '100%', objectFit: node.config.fit ?? 'contain' }} />;
  }
  
  const { outer: outerMotionProps, inner: innerMotionProps } = resolveCompositeStudioMotion(node.animation, editor || reduced === true);
  
  return <div data-studio-node={node.id} style={{ position: 'absolute', left: `${t.x}%`, top: `${t.y}%`, width: `${t.width}%`, height: `${t.height}%`, transform: `rotate(${t.rotation}deg) scale(${t.flipX ? -1 : 1},${t.flipY ? -1 : 1})`, opacity: node.appearance.opacity / 100, overflow: node.appearance.overflow === 'visible' ? 'visible' : 'hidden', zIndex: interactive ? 4 : layers[node.layer], pointerEvents: interactive && !editor ? 'auto' : 'none', minWidth: interactive ? 44 : undefined, minHeight: interactive ? 44 : undefined }}>
    <motion.div {...outerMotionProps} style={{ width: '100%', height: '100%' }}>
      {innerMotionProps.animate ? (
        <motion.div {...innerMotionProps} style={{ width: '100%', height: '100%' }}>
          {content}
        </motion.div>
      ) : content}
    </motion.div>
  </div>;
}
