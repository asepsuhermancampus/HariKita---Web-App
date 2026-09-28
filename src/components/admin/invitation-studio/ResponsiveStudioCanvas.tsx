"use client";

import React, { useRef, useState, useCallback } from 'react';
import type { InvitationStudioDocument, StudioSectionId, StudioTransform } from '@/lib/invitation-studio/types';
import { clampTransform, resolveTransform, selectedStudioNode, type StudioDevice, type StudioEdit } from '@/lib/invitation-studio/editor';
import { gestureTransform, type StudioGesture } from '@/lib/invitation-studio/geometry';
import { STUDIO_SECTIONS } from '@/lib/invitation-studio/sections';
import { StudioSceneRenderer } from './StudioSceneRenderer';
import {
  Smartphone,
  Monitor,
  Lock,
  Compass,
  Layers,
  LayoutGrid,
} from 'lucide-react';

type GestureState = {
  id: string;
  sectionId: StudioSectionId;
  pointer: number;
  x: number;
  y: number;
  width: number;
  height: number;
  start: StudioTransform;
  mode: StudioGesture;
  last: StudioTransform;
  zoom: number;
  centerX?: number;
  centerY?: number;
  lastAngle?: number;
  accumulatedRotation?: number;
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
  onActiveSectionChange,
  onEdit,
  disabled,
}: {
  document: InvitationStudioDocument;
  active: StudioSectionId;
  selection: string | null;
  device: StudioDevice;
  onDevice: (device: StudioDevice) => void;
  onSelect: (id: string | null) => void;
  onActiveSectionChange?: (section: StudioSectionId) => void;
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

  // Ghost bleed: in 'active' mode, provide generous context and bleed margin
  const BLEED_PX = Math.round(SECTION_HEIGHT * 0.35); // ~224px
  // In active mode, provide breathing room so cross-section bleed can be seen & edited comfortably
  const bleedTop = viewMode === 'active' ? (prevEnabledSection ? BLEED_PX : 120) : 0;
  const bleedBottom = viewMode === 'active' ? (nextEnabledSection ? BLEED_PX : 120) : 0;
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
    (
      event: React.PointerEvent<HTMLElement>,
      id: string,
      mode: StudioGesture,
      targetSectionId: StudioSectionId = active
    ) => {
      if (disabled || event.button !== 0) return;
      const targetSec = document.sections.find((s) => s.id === targetSectionId) ?? section;
      const target = targetSec.nodes.find((n) => n.id === id);
      if (!target) return;

      if (targetSectionId !== active) {
        onActiveSectionChange?.(targetSectionId);
      }
      onSelect(id);
      if (target.locked) return;
      event.preventDefault();
      event.stopPropagation();
      const t = resolveTransform(target, device);
      event.currentTarget.setPointerCapture(event.pointerId);

      let centerX: number | undefined;
      let centerY: number | undefined;
      let lastAngle: number | undefined;
      let accumulatedRotation: number | undefined;

      if (mode === 'rotate') {
        const overlayEl = nodeOverlayRefs.current.get(id);
        if (overlayEl) {
          const rect = overlayEl.getBoundingClientRect();
          centerX = rect.left + rect.width / 2;
          centerY = rect.top + rect.height / 2;
          lastAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI);
          accumulatedRotation = t.rotation;
        }
      }

      const gestureHeight = Math.max(1, SECTION_HEIGHT * effectiveZoom);
      gesture.current = {
        id,
        sectionId: targetSectionId,
        pointer: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        width: Math.max(1, baseWidth * effectiveZoom),
        height: gestureHeight,
        start: t,
        mode,
        last: t,
        zoom: effectiveZoom,
        centerX,
        centerY,
        lastAngle,
        accumulatedRotation,
      };
    },
    [disabled, section, document.sections, onSelect, onActiveSectionChange, active, device, effectiveZoom, baseWidth, SECTION_HEIGHT]
  );

  const onPointerMove = useCallback((event: React.PointerEvent) => {
    const g = gesture.current;
    if (!g || g.pointer !== event.pointerId) return;

    let t: StudioTransform;
    if (
      g.mode === 'rotate' &&
      g.centerX !== undefined &&
      g.centerY !== undefined &&
      g.lastAngle !== undefined &&
      g.accumulatedRotation !== undefined
    ) {
      const currentAngle = Math.atan2(event.clientY - g.centerY, event.clientX - g.centerX) * (180 / Math.PI);
      let delta = currentAngle - g.lastAngle;
      if (delta > 180) delta -= 360;
      else if (delta < -180) delta += 360;

      g.accumulatedRotation += delta;
      g.lastAngle = currentAngle;

      let rot = Math.round(g.accumulatedRotation);
      if (event.shiftKey) {
        // Holding Shift snaps rotation to 15-degree increments
        rot = Math.round(rot / 15) * 15;
      }
      while (rot > 180) rot -= 360;
      while (rot <= -180) rot += 360;

      t = clampTransform({ ...g.start, rotation: rot });
    } else {
      t = gestureTransform(g.start, g.mode, event.clientX - g.x, event.clientY - g.y, g.width, g.height);
    }
    g.last = t;

    // In 'all' mode: overlay top/height is % of totalHeight canvas.
    // In 'active' mode: overlay top/height is % of the 640px frame (1:1 with section-relative %).
    const sectionIdx = enabledSections.findIndex((s) => s.id === g.sectionId);
    let overlayTop: string;
    let overlayH: string;
    if (viewMode === 'all') {
      overlayTop = ((sectionIdx * SECTION_HEIGHT + (t.y / 100) * SECTION_HEIGHT) / totalHeight) * 100 + '%';
      overlayH = ((t.height / 100) * SECTION_HEIGHT / totalHeight) * 100 + '%';
    } else {
      overlayTop = t.y + '%';
      overlayH = t.height + '%';
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
    const nodeEl = frame.current?.querySelector<HTMLElement>('[data-studio-node="' + g.id + '"]');
    if (nodeEl) {
      nodeEl.style.left = t.x + '%';
      nodeEl.style.top = t.y + '%'; // section-relative %
      nodeEl.style.width = t.width + '%';
      nodeEl.style.height = t.height + '%';
      nodeEl.style.transform = 'rotate(' + t.rotation + 'deg) scale(' + (g.start.flipX ? -1 : 1) + ',' + (g.start.flipY ? -1 : 1) + ')';
    }
  }, [enabledSections, viewMode, totalHeight, SECTION_HEIGHT]);

  const finishGesture = useCallback(
    (cancel = false) => {
      const g = gesture.current;
      gesture.current = null;
      if (g && !cancel && JSON.stringify(g.start) !== JSON.stringify(g.last)) {
        // Commit once on drop — single React re-render syncs everything
        onEdit({ type: 'transform', section: g.sectionId, id: g.id, device, patch: g.last });
      } else if (g && cancel) {
        // Restore overlay box to original position via DOM
        const overlayEl = nodeOverlayRefs.current.get(g.id);
        const sectionIdx = enabledSections.findIndex((s) => s.id === g.sectionId);
        if (overlayEl) {
          const t = g.start;
          let overlayTop: string;
          let overlayH: string;
          if (viewMode === 'all') {
            overlayTop = ((sectionIdx * SECTION_HEIGHT + (t.y / 100) * SECTION_HEIGHT) / totalHeight) * 100 + '%';
            overlayH = ((t.height / 100) * SECTION_HEIGHT / totalHeight) * 100 + '%';
          } else {
            overlayTop = t.y + '%';
            overlayH = t.height + '%';
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
    [onEdit, device, viewMode, enabledSections, totalHeight, SECTION_HEIGHT]
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
                <div style={{ position: 'relative', width: '100%', height: SECTION_HEIGHT, overflow: 'visible' }}>
                  {/*
                    Active section rendered with transparent={true} so frame background is shared.
                    zIndex: 10 ensures active section's assets bleed OVER ghost sections at top & bottom!
                  */}
                  <div style={{ position: 'relative', zIndex: 10 }}>
                    <StudioSceneRenderer document={display} device={device} activeSection={active} editor transparent />
                  </div>

                  {/* Ghost: prev section — context for top bleed, zIndex: 2 */}
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
                        opacity: 0.55,
                        zIndex: 2,
                      }}
                    >
                      <StudioSceneRenderer document={display} device={device} activeSection={prevEnabledSection.id} editor transparent />
                    </div>
                  )}

                  {/* Ghost: next section — context for bottom bleed, zIndex: 2 */}
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
                        opacity: 0.55,
                        zIndex: 2,
                      }}
                    >
                      <StudioSceneRenderer document={display} device={device} activeSection={nextEnabledSection.id} editor transparent />
                    </div>
                  )}

                  {/* Section boundary indicators — on top of scenes */}
                  {prevEnabledSection && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute left-0 right-0 flex items-center gap-2"
                      style={{ top: 0, zIndex: 20 }}
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
                      style={{ top: SECTION_HEIGHT, zIndex: 20 }}
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
                // In 'all' mode: enable clicking nodes across all enabled sections
                // In 'active' mode: interact with active section nodes
                const targetSections = viewMode === 'all'
                  ? enabledSections
                  : [section];

                return targetSections.flatMap((sec) => {
                  const secIdx = enabledSections.findIndex((s) => s.id === sec.id);
                  const secYOffset = viewMode === 'all' ? secIdx * SECTION_HEIGHT : 0;

                  return sec.nodes.filter((n) => n.visible).map((n) => {
                    const t = resolveTransform(n, device);
                    const isSelected = selection === n.id;

                    let effectiveTop: number;
                    let effectiveH: number;
                    if (viewMode === 'all') {
                      effectiveTop = ((secYOffset + (t.y / 100) * SECTION_HEIGHT) / totalHeight) * 100;
                      effectiveH = (t.height / 100) * SECTION_HEIGHT / totalHeight * 100;
                    } else {
                      effectiveTop = t.y;
                      effectiveH = t.height;
                    }

                    return (
                      <div
                        key={n.id}
                        ref={(el) => {
                          if (el) nodeOverlayRefs.current.set(n.id, el);
                          else nodeOverlayRefs.current.delete(n.id);
                        }}
                        className={`absolute group select-none transition-shadow ${
                          !isSelected && !n.locked ? 'hover:ring-2 hover:ring-[#C5A880]/70 hover:bg-[#C5A880]/5' : ''
                        }`}
                        style={{
                          left: `${t.x}%`,
                          top: `${effectiveTop}%`,
                          width: `${t.width}%`,
                          height: `${effectiveH}%`,
                          transform: `rotate(${t.rotation}deg)`,
                          zIndex: isSelected ? 35 : 25,
                          cursor: n.locked ? 'not-allowed' : (isSelected ? 'move' : 'pointer'),
                          boxSizing: 'border-box',
                          minWidth: 24,
                          minHeight: 24,
                        }}
                        title={n.accessibility.label || n.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (sec.id !== active) {
                            onActiveSectionChange?.(sec.id);
                          }
                          onSelect(n.id);
                        }}
                        onPointerDown={(e) => {
                          if (sec.id !== active) {
                            onActiveSectionChange?.(sec.id);
                          }
                          startGesture(e as unknown as React.PointerEvent<HTMLElement>, n.id, 'drag', sec.id);
                        }}
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
                                onPointerDown={(e) => startGesture(e as unknown as React.PointerEvent<HTMLElement>, n.id, handle.mode, sec.id)}
                                className="absolute z-50 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#C5A880] shadow-md transition-transform hover:scale-125"
                                style={{ ...handle.style, cursor: handle.cursor, touchAction: 'none' }}
                              />
                            ))}

                            {/* Rotate Handle — top center */}
                            <div
                              onPointerDown={(e) => startGesture(e as unknown as React.PointerEvent<HTMLElement>, n.id, 'rotate', sec.id)}
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

                            {/* Quick Flip & Reset Toolbar — bottom center */}
                            <div
                              className="absolute flex items-center gap-1 rounded-full bg-[#4A2E35] px-2 py-0.5 text-white shadow-md pointer-events-auto select-none"
                              style={{
                                bottom: -28,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 55,
                              }}
                              onPointerDown={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                title={t.flipX ? "Matikan Flip Horizontal" : "Balik Horizontal (Flip X)"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit({
                                    type: 'transform',
                                    section: sec.id,
                                    id: n.id,
                                    device,
                                    patch: { flipX: !t.flipX },
                                  });
                                }}
                                className={`flex h-5 items-center gap-0.5 rounded px-1 text-[9px] font-bold transition hover:bg-white/20 ${
                                  t.flipX ? 'bg-[#C5A880] text-[#4A2E35]' : 'text-white'
                                }`}
                              >
                                <span>⇄</span>
                                <span>Flip X</span>
                              </button>

                              <button
                                type="button"
                                title={t.flipY ? "Matikan Flip Vertikal" : "Balik Vertikal (Flip Y)"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit({
                                    type: 'transform',
                                    section: sec.id,
                                    id: n.id,
                                    device,
                                    patch: { flipY: !t.flipY },
                                  });
                                }}
                                className={`flex h-5 items-center gap-0.5 rounded px-1 text-[9px] font-bold transition hover:bg-white/20 ${
                                  t.flipY ? 'bg-[#C5A880] text-[#4A2E35]' : 'text-white'
                                }`}
                              >
                                <span>⇅</span>
                                <span>Flip Y</span>
                              </button>

                              {Math.round(t.rotation) !== 0 && (
                                <button
                                  type="button"
                                  title="Reset rotasi ke 0°"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit({
                                      type: 'transform',
                                      section: sec.id,
                                      id: n.id,
                                      device,
                                      patch: { rotation: 0 },
                                    });
                                  }}
                                  className="flex h-5 items-center rounded px-1 text-[9px] font-bold text-[#C5A880] hover:bg-white/20 transition"
                                >
                                  <span>0°</span>
                                </button>
                              )}
                            </div>
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
                });
              })()}
            </div>{/* end frame */}
          </div>{/* end scaleTransform */}
        </div>{/* end scaledWrapper */}
      </div>{/* end containerRef */}
    </section>
  );
}
