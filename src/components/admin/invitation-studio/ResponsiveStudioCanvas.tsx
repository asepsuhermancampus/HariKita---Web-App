"use client";

import React, { useRef, useState, useCallback } from 'react';
import type { InvitationStudioDocument, StudioSectionId, StudioTransform } from '@/lib/invitation-studio/types';
import { resolveTransform, selectedStudioNode, type StudioDevice, type StudioEdit } from '@/lib/invitation-studio/editor';
import { gestureTransform, type StudioGesture } from '@/lib/invitation-studio/geometry';
import { STUDIO_SECTIONS } from '@/lib/invitation-studio/sections';
import { StudioSceneRenderer } from './StudioSceneRenderer';
import {
  Smartphone,
  Monitor,
  Info,
  Lock,
  Compass,
  Layers,
  LayoutGrid,
} from 'lucide-react';

type GestureState = {
  id: string;
  pointer: number;
  x: number;
  y: number;
  width: number;
  height: number;
  start: StudioTransform;
  mode: StudioGesture;
  last: StudioTransform;
  /** effectiveZoom at gesture start, used to convert bleedTop px → canvas-space */
  zoom: number;
  /** bleedTop in px at gesture start (only active mode) */
  bleedTopPx: number;
};

// Corner resize handle positions
const RESIZE_HANDLES: { id: string; cursor: string; style: React.CSSProperties; mode: StudioGesture }[] = [
  { id: 'nw', cursor: 'nw-resize', style: { top: -6, left: -6 }, mode: 'resize-nw' },
  { id: 'ne', cursor: 'ne-resize', style: { top: -6, right: -6 }, mode: 'resize-ne' },
  { id: 'sw', cursor: 'sw-resize', style: { bottom: -6, left: -6 }, mode: 'resize-sw' },
  { id: 'se', cursor: 'se-resize', style: { bottom: -6, right: -6 }, mode: 'resize-se' },
];

export function ResponsiveStudioCanvas({
  document,
  active,
  selection,
  device,
  onDevice,
  onSelect,
  onEdit,
  disabled,
}: {
  document: InvitationStudioDocument;
  active: StudioSectionId;
  selection: string | null;
  device: StudioDevice;
  onDevice: (device: StudioDevice) => void;
  onSelect: (id: string | null) => void;
  onEdit: (edit: StudioEdit) => void;
  disabled: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const gesture = useRef<GestureState | null>(null);
  // Map node.id -> overlay div for zero-rerender DOM drag updates
  const nodeOverlayRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomMode, setZoomMode] = useState<'fit' | number>('fit');
  const [fitScale, setFitScale] = useState<number>(0.55);

  // View mode: 'active' = only active section, 'all' = all sections stacked
  const [viewMode, setViewMode] = useState<'active' | 'all'>('active');

  const section = document.sections.find((s) => s.id === active)!;
  const sectionLabel = STUDIO_SECTIONS.find((s) => s.id === active)?.label ?? active;

  const baseWidth = device === 'mobile' ? 375 : 1024;
  const SECTION_HEIGHT = 640;

  // Enabled sections for 'all' mode stacking
  const enabledSections = document.sectionOrder
    .map((id) => document.sections.find((s) => s.id === id)!)
    .filter((s) => s.enabled);
  const activeSectionIndex = enabledSections.findIndex((s) => s.id === active);
  const prevEnabledSection = activeSectionIndex > 0 ? enabledSections[activeSectionIndex - 1] : null;
  const nextEnabledSection = activeSectionIndex < enabledSections.length - 1 ? enabledSections[activeSectionIndex + 1] : null;
  const totalHeight = viewMode === 'all'
    ? enabledSections.length * SECTION_HEIGHT
    : SECTION_HEIGHT;
  const baseHeight = totalHeight;

  // Auto-fit scale using ResizeObserver
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateFit = () => {
      const padding = 32;
      const availW = Math.max(100, el.clientWidth - padding);
      const availH = Math.max(100, el.clientHeight - padding);
      let scale: number;
      if (viewMode === 'all') {
        // 'all' mode: canvas is very tall — fit only to width so user can scroll vertically
        scale = Math.min(availW / baseWidth, 1.0);
      } else {
        // 'active' mode: fit single section (640px) to both width and height
        scale = Math.min(availW / baseWidth, availH / SECTION_HEIGHT, 1.0);
      }
      setFitScale(Math.max(0.3, Math.round(scale * 100) / 100));
    };
    updateFit();
    const observer = new ResizeObserver(updateFit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [baseWidth, SECTION_HEIGHT, viewMode]);

  const effectiveZoom = zoomMode === 'fit' ? fitScale : zoomMode;

  // Ghost bleed: in 'active' mode, show 30% of adjacent sections for context
  const BLEED_PX = SECTION_HEIGHT * 0.3; // 192px
  const bleedTop = viewMode === 'active' && prevEnabledSection ? BLEED_PX : 0;
  const bleedBottom = viewMode === 'active' && nextEnabledSection ? BLEED_PX : 0;
  // Wrapper height includes bleed so ghost sections are in scroll area
  const wrapperHeight = Math.round((SECTION_HEIGHT + bleedTop + bleedBottom) * effectiveZoom);
  const wrapperWidth = Math.round(baseWidth * effectiveZoom);
  // In 'all' mode wrapper matches total height
  const scaledWrapperHeight = viewMode === 'all' ? Math.round(totalHeight * effectiveZoom) : wrapperHeight;
  const scaledWrapperWidth = wrapperWidth;

  // Pass document directly — overlay position updated via DOM refs during drag (zero re-render)
  const display = document;

  // ── Gesture handlers ────────────────────────────────────────────────────
  const startGesture = useCallback(
    (event: React.PointerEvent<HTMLElement>, id: string, mode: StudioGesture) => {
      if (disabled || event.button !== 0) return;
      const target = section.nodes.find((n) => n.id === id)!;
      onSelect(id);
      if (target.locked) return;
      event.preventDefault();
      event.stopPropagation();
      const rect = frame.current!.getBoundingClientRect();
      const t = resolveTransform(target, device);
      event.currentTarget.setPointerCapture(event.pointerId);
      //
      // gestureHeight MUST equal SECTION_HEIGHT * zoom for correct % mapping:
      //   py = (dy / gestureHeight) * 100  →  should give % of one 640px section
      //
      // In 'active' mode, rect.height = (bleedTop + SECTION_HEIGHT + bleedBottom) * zoom
      //   which is LARGER than SECTION_HEIGHT*zoom, so dragging feels sluggish.
      //   Fix: always use SECTION_HEIGHT * effectiveZoom.
      //
      // In 'all' mode, rect.height = totalHeight * zoom.
      //   We still want % of a single section, so use SECTION_HEIGHT * zoom.
      //
      const gestureHeight = Math.max(1, SECTION_HEIGHT * effectiveZoom);
      gesture.current = {
        id,
        pointer: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        width: Math.max(1, baseWidth * effectiveZoom),
        height: gestureHeight,
        start: t,
        mode,
        last: t,
        zoom: effectiveZoom,
        bleedTopPx: viewMode === 'active' ? bleedTop * effectiveZoom : 0,
      };
    },
    [disabled, section, onSelect, device, viewMode, SECTION_HEIGHT, totalHeight, effectiveZoom, baseWidth, bleedTop]
  );

  const onPointerMove = useCallback((event: React.PointerEvent) => {
    const g = gesture.current;
    if (!g || g.pointer !== event.pointerId) return;
    const t = gestureTransform(g.start, g.mode, event.clientX - g.x, event.clientY - g.y, g.width, g.height);
    g.last = t;

    // In 'all' mode: overlay top/height must be expressed as % of totalHeight canvas.
    // In 'active' mode: overlay top is % of the FRAME div which includes bleedTop+section+bleedBottom,
    //   so we must convert section-relative % → frame-relative %.
    const sectionIdx = enabledSections.findIndex((s) => s.id === active);
    let overlayTop: string;
    let overlayH: string;
    if (viewMode === 'all') {
      overlayTop = ((sectionIdx * SECTION_HEIGHT + (t.y / 100) * SECTION_HEIGHT) / totalHeight) * 100 + '%';
      overlayH = ((t.height / 100) * SECTION_HEIGHT / totalHeight) * 100 + '%';
    } else {
      // Frame height in unscaled px = bleedTop + SECTION_HEIGHT + bleedBottom
      const frameHeightPx = bleedTop + SECTION_HEIGHT + bleedBottom;
      // Section starts at bleedTop within frame. Convert section-% → frame-%.
      const topPx = bleedTop + (t.y / 100) * SECTION_HEIGHT;
      overlayTop = (topPx / frameHeightPx) * 100 + '%';
      overlayH = ((t.height / 100) * SECTION_HEIGHT / frameHeightPx) * 100 + '%';
    }

    // 1. Update interactive overlay box via DOM (no React re-render)
    const overlayEl = nodeOverlayRefs.current.get(g.id);
    if (overlayEl) {
      overlayEl.style.left = t.x + '%';
      overlayEl.style.top = overlayTop;
      overlayEl.style.width = t.width + '%';
      overlayEl.style.height = overlayH;
      overlayEl.style.transform = 'rotate(' + t.rotation + 'deg)';
    }

    // 2. Update actual rendered asset image via DOM so it follows the box live.
    // The nodeEl lives inside a <section> tag which is at y=0 in the rendered StudioSceneRenderer.
    // Its position is section-relative %, so we use t.x / t.y directly.
    const nodeEl = frame.current?.querySelector<HTMLElement>('[data-studio-node="' + g.id + '"]');
    if (nodeEl) {
      nodeEl.style.left = t.x + '%';
      nodeEl.style.top = t.y + '%'; // section-relative %
      nodeEl.style.width = t.width + '%';
      nodeEl.style.height = t.height + '%';
      nodeEl.style.transform = 'rotate(' + t.rotation + 'deg) scale(' + (g.start.flipX ? -1 : 1) + ',' + (g.start.flipY ? -1 : 1) + ')';
    }
  }, [active, enabledSections, viewMode, totalHeight, SECTION_HEIGHT, bleedTop, bleedBottom]);

  const finishGesture = useCallback(
    (cancel = false) => {
      const g = gesture.current;
      gesture.current = null;
      if (g && !cancel && JSON.stringify(g.start) !== JSON.stringify(g.last)) {
        // Commit once on drop — single React re-render syncs everything
        onEdit({ type: 'transform', section: active, id: g.id, device, patch: g.last });
      } else if (g && cancel) {
        // Restore overlay box to original position via DOM
        const overlayEl = nodeOverlayRefs.current.get(g.id);
        const sectionIdx = enabledSections.findIndex((s) => s.id === active);
        if (overlayEl) {
          const t = g.start;
          let overlayTop: string;
          let overlayH: string;
          if (viewMode === 'all') {
            overlayTop = ((sectionIdx * SECTION_HEIGHT + (t.y / 100) * SECTION_HEIGHT) / totalHeight) * 100 + '%';
            overlayH = ((t.height / 100) * SECTION_HEIGHT / totalHeight) * 100 + '%';
          } else {
            const frameHeightPx = bleedTop + SECTION_HEIGHT + bleedBottom;
            const topPx = bleedTop + (t.y / 100) * SECTION_HEIGHT;
            overlayTop = (topPx / frameHeightPx) * 100 + '%';
            overlayH = ((t.height / 100) * SECTION_HEIGHT / frameHeightPx) * 100 + '%';
          }
          overlayEl.style.left = t.x + '%';
          overlayEl.style.top = overlayTop;
          overlayEl.style.width = t.width + '%';
          overlayEl.style.height = overlayH;
          overlayEl.style.transform = 'rotate(' + t.rotation + 'deg)';
        }
        // Restore rendered asset image
        const nodeEl = frame.current?.querySelector<HTMLElement>('[data-studio-node="' + g.id + '"]');
        if (nodeEl) {
          const t = g.start;
          nodeEl.style.left = t.x + '%';
          nodeEl.style.top = t.y + '%';
          nodeEl.style.width = t.width + '%';
          nodeEl.style.height = t.height + '%';
          nodeEl.style.transform = 'rotate(' + t.rotation + 'deg) scale(' + (t.flipX ? -1 : 1) + ',' + (t.flipY ? -1 : 1) + ')';
        }
      }
    },
    [onEdit, active, device, viewMode, enabledSections, totalHeight, SECTION_HEIGHT, bleedTop, bleedBottom]
  );

  const node = selectedStudioNode(document, active, selection);
  const activeNodes = section.nodes.filter((n) => n.visible);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <section
      aria-label="Canvas editor"
      className="flex min-w-0 flex-1 min-h-0 flex-col rounded-2xl border border-hk-soft-beige bg-[#F3EDE6]/70 shadow-inner h-full overflow-hidden"
    >
      {/* ── Canvas Top Toolbar ──────────────────────────────────────── */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 rounded-t-2xl bg-white px-3 py-2 border-b border-hk-soft-beige shadow-2xs">
        {/* Device Toggle */}
        <div className="flex items-center gap-1">
          {(['mobile', 'desktop'] as const).map((d) => (
            <button
              key={d}
              type="button"
              className={`flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition ${
                device === d
                  ? 'bg-[#4A2E35] text-white shadow-2xs'
                  : 'bg-transparent text-hk-taupe hover:bg-[#FAF8F5] hover:text-hk-charcoal'
              }`}
              aria-pressed={device === d}
              onClick={() => { finishGesture(true); onDevice(d); }}
            >
              {d === 'mobile' ? (
                <><Smartphone className="h-3.5 w-3.5 text-[#C5A880]" /><span>Mobile</span></>
              ) : (
                <><Monitor className="h-3.5 w-3.5 text-[#C5A880]" /><span>Desktop</span></>
              )}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#FAF8F5] border border-hk-soft-beige rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setViewMode('active')}
            className={`flex h-6 items-center gap-1 rounded-md px-2 text-[10px] font-bold transition ${
              viewMode === 'active'
                ? 'bg-white text-[#4A2E35] shadow-2xs border border-hk-soft-beige/80'
                : 'text-hk-taupe hover:text-hk-charcoal'
            }`}
            title="Tampilkan section aktif saja"
          >
            <Compass className="h-3 w-3 text-[#C5A880]" />
            <span>Section Aktif</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('all')}
            className={`flex h-6 items-center gap-1 rounded-md px-2 text-[10px] font-bold transition ${
              viewMode === 'all'
                ? 'bg-white text-[#4A2E35] shadow-2xs border border-hk-soft-beige/80'
                : 'text-hk-taupe hover:text-hk-charcoal'
            }`}
            title="Tampilkan semua section digabung"
          >
            <LayoutGrid className="h-3 w-3 text-[#C5A880]" />
            <span>Semua Section</span>
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-[#FAF8F5] border border-hk-soft-beige rounded-lg px-1.5 py-0.5">
          <span className="text-[10px] font-bold text-hk-taupe mr-0.5">Zoom:</span>
          <button
            type="button"
            onClick={() => setZoomMode('fit')}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
              zoomMode === 'fit'
                ? 'bg-[#C5A880] text-white shadow-2xs'
                : 'text-hk-taupe hover:text-hk-charcoal'
            }`}
          >
            Fit ({Math.round(fitScale * 100)}%)
          </button>
          {([0.5, 0.65, 0.8, 1.0] as const).map((z) => (
            <button
              key={z}
              type="button"
              onClick={() => setZoomMode(z)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                zoomMode === z
                  ? 'bg-[#C5A880] text-white shadow-2xs'
                  : 'text-hk-taupe hover:text-hk-charcoal'
              }`}
            >
              {`${Math.round(z * 100)}%`}
            </button>
          ))}
        </div>

        {/* Current Section Badge */}
        <span className="inline-flex items-center gap-1 rounded-md bg-[#FAF8F5] border border-hk-soft-beige px-2 py-0.5 text-xs font-semibold text-[#4A2E35]">
          <Layers className="h-3 w-3 text-[#C5A880]" />
          <span className="max-w-[120px] truncate">{sectionLabel}</span>
          {!section.enabled && <span className="text-[10px] text-hk-taupe">· Off</span>}
        </span>
      </div>

      {/* ── Help Notice ─────────────────────────────────────────────── */}
      <div className="shrink-0 mx-3 mt-2 flex items-center gap-2 rounded-lg bg-white/70 px-2.5 py-1 text-[10px] text-hk-taupe border border-hk-soft-beige/60">
        <Info className="h-3 w-3 shrink-0 text-[#C5A880]" />
        <p className="truncate">
          Seret untuk pindah · Tarik pojok untuk resize · Tarik ikon rotasi untuk putar · Asset bisa keluar batas canvas
        </p>
      </div>

      {/* ── Canvas Workspace ─────────────────────────────────────────── */}
      {/*
        IMPORTANT: Always use alignItems flex-start.
        In 'all' mode, the canvas is extremely tall (e.g. 16×640×zoom = 9000px).
        alignItems:center would put the top half ABOVE scroll origin (y<0) = invisible.
        flex-start ensures scroll always starts from the top of the canvas.
      */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 flex justify-center items-start overflow-auto p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onSelect(null); }}
      >
        {/*
          Scaled wrapper: sized to zoomed dimensions so the scroll container knows the area.
          In 'active' mode: height = (640 + bleedTop + bleedBottom) * zoom so ghost sections
          fall within the scrollable area and are visible.
          In 'all' mode: height = totalHeight * zoom.
        */}
        <div
          style={{
            width: scaledWrapperWidth,
            height: scaledWrapperHeight,
            flexShrink: 0,
            position: 'relative',
          }}
        >
          {/*
            Scale transform. In 'active' mode, offset down by bleedTop*zoom so:
            - ghost of prev section appears ABOVE (at top of wrapper)
            - active section starts at bleedTop*zoom
            - ghost of next section appears BELOW (at (bleedTop + 640)*zoom)
          */}
          <div
            style={{
              transform: `scale(${effectiveZoom})`,
              transformOrigin: 'top left',
              width: baseWidth,
              height: baseHeight,
              position: 'absolute',
              top: viewMode === 'active' ? Math.round(bleedTop * effectiveZoom) : 0,
              left: 0,
              overflow: 'visible',
            }}
          >
            {/* Canvas frame — getBoundingClientRect() on this is used for gesture calculations */}
            <div
              ref={frame}
              className="relative mx-auto bg-[#FAF8F5] shadow-2xl transition-all"
              style={{
                width: baseWidth,
                height: baseHeight,
                overflow: 'visible', // allow decorations to bleed out
                borderRadius: device === 'mobile' ? '28px' : '16px',
                border: '2px solid #E8DED1',
              }}
              onPointerMove={onPointerMove}
              onPointerUp={() => finishGesture()}
              onPointerCancel={() => finishGesture(true)}
              onLostPointerCapture={() => { if (gesture.current) finishGesture(true); }}
            >
              {/* Safe Area Dotted Boundary */}
              <div
                className="pointer-events-none absolute inset-0 z-20 border border-dashed border-[#C5A880]/40 m-2"
                aria-hidden="true"
                style={{ borderRadius: device === 'mobile' ? '22px' : '12px' }}
              />

              {/* ── Scene Renderer ──────────────────────────────────── */}
              {viewMode === 'active' ? (
                /*
                  'Section Aktif' mode:
                  - Ghost of prev section at top: -SECTION_HEIGHT (its overflow bleeds into current)
                  - Active section at top: 0
                  - Ghost of next section at top: +SECTION_HEIGHT
                  All ghosts are pointer-events:none and semi-transparent (visual context only).
                  The wrapper has overflow:visible so ghosts bleed out.
                */
                <div style={{ position: 'relative', width: '100%', height: SECTION_HEIGHT, overflow: 'visible' }}>
                  {/*
                    RENDER ORDER: active section FIRST (z=2), ghosts AFTER (z=3).
                    Ghost sections' overflow into active area must paint ON TOP so it's visible.
                    Previously ghost at z=1 was COVERED by active section's white background → fix: z=3.
                    Ghost opacity=0.55 means 55% ghost + 45% active section shows through = nice blend.
                  */}

                  {/* Active section — rendered first so ghost overflow appears on top */}
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <StudioSceneRenderer document={display} device={device} activeSection={active} editor />
                  </div>

                  {/* Ghost: prev section — overflow bleeds DOWN into active section (visible at z=3) */}
                  {prevEnabledSection && (
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        top: -SECTION_HEIGHT,
                        left: 0,
                        right: 0,
                        height: SECTION_HEIGHT,
                        overflow: 'visible',
                        pointerEvents: 'none',
                        opacity: 0.6,
                        zIndex: 3,  // ABOVE active section (z=2) so overflow is visible
                      }}
                    >
                      <StudioSceneRenderer document={display} device={device} activeSection={prevEnabledSection.id} editor transparent />
                    </div>
                  )}

                  {/* Ghost: next section — overflow bleeds UP into active section (visible at z=3) */}
                  {nextEnabledSection && (
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        top: SECTION_HEIGHT,
                        left: 0,
                        right: 0,
                        height: SECTION_HEIGHT,
                        overflow: 'visible',
                        pointerEvents: 'none',
                        opacity: 0.6,
                        zIndex: 3,  // ABOVE active section (z=2) so overflow is visible
                      }}
                    >
                      <StudioSceneRenderer document={display} device={device} activeSection={nextEnabledSection.id} editor transparent />
                    </div>
                  )}

                  {/* Section boundary indicators — always on top */}
                  {prevEnabledSection && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute left-0 right-0 flex items-center gap-2"
                      style={{ top: 0, zIndex: 40 }}
                    >
                      <div className="flex-1 border-t-2 border-dashed border-[#C5A880]/60" />
                      <span className="rounded bg-[#C5A880]/90 px-2 py-0.5 text-[9px] font-bold text-white whitespace-nowrap shadow">
                        ↑ {STUDIO_SECTIONS.find((s) => s.id === prevEnabledSection.id)?.label ?? prevEnabledSection.id}
                      </span>
                      <div className="flex-1 border-t-2 border-dashed border-[#C5A880]/60" />
                    </div>
                  )}
                  {nextEnabledSection && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute left-0 right-0 flex items-center gap-2"
                      style={{ top: SECTION_HEIGHT, zIndex: 40 }}
                    >
                      <div className="flex-1 border-t-2 border-dashed border-[#C5A880]/60" />
                      <span className="rounded bg-[#C5A880]/90 px-2 py-0.5 text-[9px] font-bold text-white whitespace-nowrap shadow">
                        ↓ {STUDIO_SECTIONS.find((s) => s.id === nextEnabledSection.id)?.label ?? nextEnabledSection.id}
                      </span>
                      <div className="flex-1 border-t-2 border-dashed border-[#C5A880]/60" />
                    </div>
                  )}
                </div>

              ) : (
                /* 'Semua Section' mode — all enabled sections stacked */
                <StudioSceneRenderer document={display} device={device} editor />
              )}

              {/* ── Interactive Node Overlays ─────────────────────── */}
              {(() => {
                // In 'all' mode: offset overlays to the correct section's Y band
                const sectionYOffset = viewMode === 'all'
                  ? activeSectionIndex * SECTION_HEIGHT
                  : 0;

                return activeNodes.map((n) => {
                  const t = resolveTransform(n, device);
                  const isSelected = selection === n.id;

                  // Initial overlay position (DOM will update live during drag)
                  // In 'active' mode: frame includes bleedTop+section+bleedBottom.
                  // We must express overlay top as % of frame height, not section height.
                  let effectiveTop: number;
                  let effectiveH: number;
                  if (viewMode === 'all') {
                    effectiveTop = ((sectionYOffset + (t.y / 100) * SECTION_HEIGHT) / totalHeight) * 100;
                    effectiveH = (t.height / 100) * SECTION_HEIGHT / totalHeight * 100;
                  } else {
                    const frameHeightPx = bleedTop + SECTION_HEIGHT + bleedBottom;
                    const topPx = bleedTop + (t.y / 100) * SECTION_HEIGHT;
                    effectiveTop = (topPx / frameHeightPx) * 100;
                    effectiveH = (t.height / 100) * SECTION_HEIGHT / frameHeightPx * 100;
                  }

                  return (
                    <div
                      key={n.id}
                      ref={(el) => {
                        if (el) nodeOverlayRefs.current.set(n.id, el);
                        else nodeOverlayRefs.current.delete(n.id);
                      }}
                      className="absolute"
                      style={{
                        left: `${t.x}%`,
                        top: `${effectiveTop}%`,
                        width: `${t.width}%`,
                        height: `${effectiveH}%`,
                        transform: `rotate(${t.rotation}deg)`,
                        zIndex: 10,
                        cursor: n.locked ? 'not-allowed' : 'move',
                        boxSizing: 'border-box',
                      }}
                      onClick={(e) => { e.stopPropagation(); onSelect(n.id); }}
                      onPointerDown={(e) => startGesture(e as unknown as React.PointerEvent<HTMLElement>, n.id, 'drag')}
                    >
                      {/* Selection outline */}
                      {isSelected && (
                        <div
                          className="absolute inset-0 border-2 border-[#C5A880] rounded-sm pointer-events-none"
                          style={{ margin: -2, zIndex: 11 }}
                        />
                      )}

                      {/* Node label */}
                      {isSelected && (
                        <div
                          className="absolute pointer-events-none select-none whitespace-nowrap rounded-md bg-[#4A2E35] px-2 py-0.5 text-[10px] font-bold text-white shadow"
                          style={{ top: -24, left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}
                        >
                          <span className="flex items-center gap-1">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            {n.accessibility.label || n.id}
                          </span>
                        </div>
                      )}

                      {/* Resize + rotate handles */}
                      {isSelected && !n.locked && (
                        <>
                          {RESIZE_HANDLES.map((handle) => (
                            <div
                              key={handle.id}
                              onPointerDown={(e) => startGesture(e as unknown as React.PointerEvent<HTMLElement>, n.id, handle.mode)}
                              className="absolute z-50 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#C5A880] shadow-md transition-transform hover:scale-125"
                              style={{ ...handle.style, cursor: handle.cursor, touchAction: 'none' }}
                            />
                          ))}

                          {/* Rotate Handle — top center */}
                          <div
                            onPointerDown={(e) => startGesture(e as unknown as React.PointerEvent<HTMLElement>, n.id, 'rotate')}
                            className="absolute z-50 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#4A2E35] shadow-md cursor-grab active:cursor-grabbing hover:bg-[#6B5E62] transition-colors"
                            style={{ top: -24, left: '50%', transform: 'translateX(-50%)', touchAction: 'none' }}
                            title="Tarik untuk memutar"
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21.5 2v6h-6" />
                              <path d="M21.34 15.57a10 10 0 1 1-.57-8.38" />
                            </svg>
                          </div>

                          {/* Connector line */}
                          <div
                            className="absolute pointer-events-none bg-[#C5A880]/60"
                            style={{ width: 1, height: 16, top: -16, left: '50%', transform: 'translateX(-50%)', zIndex: 49 }}
                          />
                        </>
                      )}

                      {/* Lock badge */}
                      {n.locked && isSelected && (
                        <div className="absolute top-1 right-1 rounded bg-black/60 p-0.5 pointer-events-none z-50">
                          <Lock className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>{/* end frame */}
          </div>{/* end scaleTransform */}
        </div>{/* end scaledWrapper */}
      </div>{/* end containerRef */}
    </section>
  );
}
