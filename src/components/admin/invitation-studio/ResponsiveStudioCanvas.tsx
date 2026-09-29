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
  LockOpen,
  Compass,
  Layers,
  LayoutGrid,
  Copy,
  Trash2,
  EyeOff,
  Eye,
  Group,
  Ungroup,
  MousePointer2,
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
  groupSiblings?: { id: string; start: StudioTransform }[];
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

  // Multi-select state — Shift+Click to add/remove nodes
  const [multiSelection, setMultiSelection] = useState<Set<string>>(new Set());

  const toggleMultiSelect = (id: string) => {
    setMultiSelection(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const clearMultiSelect = () => setMultiSelection(new Set());

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

      let groupSiblings: { id: string; start: StudioTransform }[] | undefined;
      if (mode === 'drag' && target.groupId) {
        const siblings = targetSec.nodes.filter((n) => n.groupId === target.groupId && !n.locked);
        if (siblings.length > 1) {
          groupSiblings = siblings.map((n) => ({
            id: n.id,
            start: resolveTransform(n, device),
          }));
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
        groupSiblings,
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

    // 3. If dragging a grouped node, move all group siblings in sync
    if (g.mode === 'drag' && g.groupSiblings && g.groupSiblings.length > 1) {
      const dxPercent = t.x - g.start.x;
      const dyPercent = t.y - g.start.y;
      g.groupSiblings.forEach((sibling) => {
        if (sibling.id === g.id) return;
        const sibT = clampTransform({
          ...sibling.start,
          x: sibling.start.x + dxPercent,
          y: sibling.start.y + dyPercent,
        });
        let sibOverlayTop: string;
        let sibOverlayH: string;
        if (viewMode === 'all') {
          sibOverlayTop = ((sectionIdx * SECTION_HEIGHT + (sibT.y / 100) * SECTION_HEIGHT) / totalHeight) * 100 + '%';
          sibOverlayH = ((sibT.height / 100) * SECTION_HEIGHT / totalHeight) * 100 + '%';
        } else {
          sibOverlayTop = sibT.y + '%';
          sibOverlayH = sibT.height + '%';
        }
        const sibOverlay = nodeOverlayRefs.current.get(sibling.id);
        if (sibOverlay) {
          sibOverlay.style.left = sibT.x + '%';
          sibOverlay.style.top = sibOverlayTop;
          sibOverlay.style.width = sibT.width + '%';
          sibOverlay.style.height = sibOverlayH;
        }
        const sibNode = frame.current?.querySelector<HTMLElement>('[data-studio-node="' + sibling.id + '"]');
        if (sibNode) {
          sibNode.style.left = sibT.x + '%';
          sibNode.style.top = sibT.y + '%';
        }
      });
    }
  }, [enabledSections, viewMode, totalHeight, SECTION_HEIGHT]);

  const finishGesture = useCallback(
    (cancel = false) => {
      const g = gesture.current;
      gesture.current = null;
      if (g && !cancel && JSON.stringify(g.start) !== JSON.stringify(g.last)) {
        if (g.mode === 'drag' && g.groupSiblings && g.groupSiblings.length > 1) {
          const dxPercent = g.last.x - g.start.x;
          const dyPercent = g.last.y - g.start.y;
          const patches: Record<string, Partial<StudioTransform>> = {};
          g.groupSiblings.forEach((s) => {
            patches[s.id] = {
              x: clampTransform({ ...s.start, x: s.start.x + dxPercent, y: s.start.y + dyPercent }).x,
              y: clampTransform({ ...s.start, x: s.start.x + dxPercent, y: s.start.y + dyPercent }).y,
            };
          });
          onEdit({ type: 'transform-many', section: g.sectionId, device, patches });
        } else {
          // Commit once on drop — single React re-render syncs everything
          onEdit({ type: 'transform', section: g.sectionId, id: g.id, device, patch: g.last });
        }
      } else if (g && cancel) {
        // Restore overlay box to original position via DOM
        const sectionIdx = enabledSections.findIndex((s) => s.id === g.sectionId);
        const restoreNode = (nodeId: string, origT: StudioTransform) => {
          const overlayEl = nodeOverlayRefs.current.get(nodeId);
          if (overlayEl) {
            let overlayTop: string;
            let overlayH: string;
            if (viewMode === 'all') {
              overlayTop = ((sectionIdx * SECTION_HEIGHT + (origT.y / 100) * SECTION_HEIGHT) / totalHeight) * 100 + '%';
              overlayH = ((origT.height / 100) * SECTION_HEIGHT / totalHeight) * 100 + '%';
            } else {
              overlayTop = origT.y + '%';
              overlayH = origT.height + '%';
            }
            overlayEl.style.left = origT.x + '%';
            overlayEl.style.top = overlayTop;
            overlayEl.style.width = origT.width + '%';
            overlayEl.style.height = overlayH;
            overlayEl.style.transform = 'rotate(' + origT.rotation + 'deg)';
          }
          const nodeEl = frame.current?.querySelector<HTMLElement>('[data-studio-node="' + nodeId + '"]');
          if (nodeEl) {
            nodeEl.style.left = origT.x + '%';
            nodeEl.style.top = origT.y + '%';
            nodeEl.style.width = origT.width + '%';
            nodeEl.style.height = origT.height + '%';
            nodeEl.style.transform = 'rotate(' + origT.rotation + 'deg) scale(' + (origT.flipX ? -1 : 1) + ',' + (origT.flipY ? -1 : 1) + ')';
          }
        };

        restoreNode(g.id, g.start);
        if (g.groupSiblings) {
          g.groupSiblings.forEach((s) => {
            if (s.id !== g.id) restoreNode(s.id, s.start);
          });
        }
      }
    },
    [onEdit, device, viewMode, enabledSections, totalHeight, SECTION_HEIGHT]
  );

  const node = selectedStudioNode(document, active, selection);
  const activeNodes = section.nodes.filter((n) => n.visible);
  // Multi-select: collect full node objects for selected IDs
  const multiNodes = section.nodes.filter(n => multiSelection.has(n.id));
  const hasMultiSelect = multiSelection.size >= 2;
  // Effective: if multi-select active, use first as representative; else use single selection
  const anySelected = !!node || hasMultiSelect;

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <section
      aria-label="Canvas editor"
      className="flex min-w-0 flex-1 min-h-0 flex-col rounded-2xl border border-hk-soft-beige bg-[#F3EDE6]/70 shadow-inner h-full overflow-hidden"
    >
      {/* ── Canvas Top Toolbar ───────────────────────────────────────── */}
      <div className="shrink-0 flex flex-col rounded-t-2xl bg-white border-b border-hk-soft-beige shadow-2xs">

        {/* Row 1: Controls */}
        <div className="flex items-center justify-between gap-2 px-3 py-1.5">
          <div className="flex items-center gap-1.5">

            {/* Device Toggle — icon only */}
            <div className="flex items-center rounded-lg border border-hk-soft-beige bg-[#FAF8F5] p-0.5 gap-0.5">
              {(['mobile', 'desktop'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  title={d === 'mobile' ? 'Mobile (375px)' : 'Desktop (1024px)'}
                  className={`flex h-6 w-6 items-center justify-center rounded-md transition ${
                    device === d ? 'bg-white text-[#4A2E35] shadow-2xs' : 'text-hk-taupe hover:text-hk-charcoal'
                  }`}
                  aria-pressed={device === d}
                  onClick={() => { finishGesture(true); onDevice(d); }}
                >
                  {d === 'mobile' ? <Smartphone className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>

            {/* View Mode — icon only */}
            <div className="flex items-center rounded-lg border border-hk-soft-beige bg-[#FAF8F5] p-0.5 gap-0.5">
              <button
                type="button"
                title="Section Aktif saja"
                onClick={() => setViewMode('active')}
                className={`flex h-6 w-6 items-center justify-center rounded-md transition ${
                  viewMode === 'active' ? 'bg-white text-[#4A2E35] shadow-2xs' : 'text-hk-taupe hover:text-hk-charcoal'
                }`}
              >
                <Compass className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                title="Semua Section"
                onClick={() => setViewMode('all')}
                className={`flex h-6 w-6 items-center justify-center rounded-md transition ${
                  viewMode === 'all' ? 'bg-white text-[#4A2E35] shadow-2xs' : 'text-hk-taupe hover:text-hk-charcoal'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Zoom compact */}
            <div className="flex items-center rounded-lg border border-hk-soft-beige bg-[#FAF8F5] p-0.5 gap-0.5">
              <button
                type="button"
                title={`Fit — ${Math.round(fitScale * 100)}%`}
                onClick={() => setZoomMode('fit')}
                className={`h-6 px-2 rounded-md text-[10px] font-bold transition ${
                  zoomMode === 'fit' ? 'bg-white text-[#4A2E35] shadow-2xs' : 'text-hk-taupe hover:text-hk-charcoal'
                }`}
              >
                Fit
              </button>
              {([0.5, 0.75, 1.0] as const).map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setZoomMode(z)}
                  className={`h-6 px-1.5 rounded-md text-[10px] font-bold transition ${
                    zoomMode === z ? 'bg-white text-[#4A2E35] shadow-2xs' : 'text-hk-taupe hover:text-hk-charcoal'
                  }`}
                >
                  {`${Math.round(z * 100)}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Section badge */}
          <span className="inline-flex items-center gap-1 rounded-lg bg-[#FAF8F5] border border-hk-soft-beige px-2 py-1 text-[11px] font-semibold text-[#4A2E35]">
            <Layers className="h-3 w-3 text-[#C5A880]" />
            <span className="max-w-[100px] truncate">{sectionLabel}</span>
            {!section.enabled && <span className="text-[10px] text-hk-taupe">· Off</span>}
          </span>
        </div>

        {/* Row 2: Layer Action Bar — always visible */}
        <div className="flex items-center gap-1 border-t border-hk-soft-beige px-3 py-1.5 bg-[#FAF8F5]/50">

          {/* Multi-select badge OR no-selection hint */}
          {hasMultiSelect ? (
            <span className="flex items-center gap-1 rounded-md bg-[#4A2E35]/10 px-2 py-0.5 text-[10px] font-bold text-[#4A2E35]">
              <MousePointer2 className="h-3 w-3" />
              {multiSelection.size} dipilih
            </span>
          ) : !node ? (
            <span className="text-[10px] text-hk-taupe/60 italic select-none">Pilih asset…</span>
          ) : null}

          {/* Divider — only when something is selected */}
          {anySelected && <div className="h-4 w-px bg-hk-soft-beige" />}

          {/* Duplicate — single node only */}
          <button type="button"
            disabled={disabled || !node || hasMultiSelect}
            title="Duplikat"
            onClick={() => node && onEdit({ type: 'duplicate', section: active, id: node.id, newId: `${node.id}-cp-${Date.now()}` })}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-hk-taupe hover:bg-white hover:text-hk-charcoal transition disabled:opacity-30">
            <Copy className="h-3.5 w-3.5" />
          </button>

          {/* Toggle Visible — single node only */}
          <button type="button"
            disabled={disabled || !node || hasMultiSelect}
            title={node?.visible ? 'Sembunyikan layer' : 'Tampilkan layer'}
            onClick={() => node && onEdit({ type: 'node', section: active, id: node.id, patch: { visible: !node.visible } })}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-hk-taupe hover:bg-white hover:text-hk-charcoal transition disabled:opacity-30">
            {node?.visible === false ? <EyeOff className="h-3.5 w-3.5 text-hk-taupe/50" /> : <Eye className="h-3.5 w-3.5" />}
          </button>

          {/* Toggle Lock — single node only */}
          <button type="button"
            disabled={disabled || !node || hasMultiSelect}
            title={node?.locked ? 'Buka kunci' : 'Kunci layer'}
            onClick={() => node && onEdit({ type: 'node', section: active, id: node.id, patch: { locked: !node.locked } })}
            className={`flex h-6 w-6 items-center justify-center rounded-lg transition disabled:opacity-30 ${
              node?.locked ? 'bg-amber-100 text-amber-600 hover:bg-amber-50' : 'text-hk-taupe hover:bg-white hover:text-hk-charcoal'
            }`}>
            {node?.locked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
          </button>

          <div className="h-4 w-px bg-hk-soft-beige" />

          {/* Group — enabled when Shift+Click selects ≥2 nodes */}
          <button type="button"
            disabled={disabled || !hasMultiSelect}
            title={hasMultiSelect ? `Gabungkan ${multiSelection.size} asset menjadi grup` : 'Shift+Klik beberapa asset lalu tekan Group'}
            onClick={() => {
              if (!hasMultiSelect) return;
              const ids = Array.from(multiSelection);
              onEdit({ type: 'group-nodes', section: active, ids, groupId: `grp-${Date.now()}`, groupName: 'Grup Baru' });
              clearMultiSelect();
              onSelect(null);
            }}
            className={`flex h-6 items-center gap-1 rounded-lg px-1.5 text-[10px] font-bold transition disabled:opacity-30 ${
              hasMultiSelect
                ? 'bg-[#4A2E35] text-white hover:bg-[#382328]'
                : 'text-hk-taupe hover:bg-white hover:text-hk-charcoal'
            }`}>
            <Group className="h-3.5 w-3.5" />
            <span>Group{hasMultiSelect ? ` (${multiSelection.size})` : ''}</span>
          </button>

          {/* Ungroup — single node that belongs to a group */}
          <button type="button"
            disabled={disabled || !node?.groupId || hasMultiSelect}
            title="Pisahkan dari grup"
            onClick={() => node?.groupId && onEdit({ type: 'ungroup-nodes', section: active, groupId: node.groupId })}
            className="flex h-6 items-center gap-1 rounded-lg px-1.5 text-[10px] font-bold text-hk-taupe hover:bg-white hover:text-hk-charcoal transition disabled:opacity-30">
            <Ungroup className="h-3.5 w-3.5" />
            <span>Ungroup</span>
          </button>

          {/* Pilih semua dalam grup */}
          <button type="button"
            disabled={!node?.groupId}
            title="Pilih semua dalam grup ini (Shift+Klik lainnya)"
            onClick={() => {
              if (!node?.groupId) return;
              const sibling = section.nodes.filter(n => n.groupId === node.groupId);
              const ids = new Set(sibling.map(n => n.id));
              setMultiSelection(ids);
              onSelect(sibling[0]?.id ?? null);
            }}
            className="flex h-6 items-center gap-1 rounded-lg px-1.5 text-[10px] font-bold text-hk-taupe hover:bg-white hover:text-hk-charcoal transition disabled:opacity-30">
            <MousePointer2 className="h-3.5 w-3.5" />
            <span>Pilih Grup</span>
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Delete — danger, rightmost */}
          <button type="button"
            disabled={disabled || (!node && !hasMultiSelect)}
            title={hasMultiSelect ? `Hapus ${multiSelection.size} asset` : 'Hapus layer'}
            onClick={() => {
              if (hasMultiSelect) {
                const ids = Array.from(multiSelection);
                onEdit({ type: 'delete-many', section: active, ids });
                clearMultiSelect();
                onSelect(null);
              } else if (node) {
                onEdit({ type: 'delete', section: active, id: node.id });
              }
            }}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-30">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
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
        onClick={(e) => { if (e.target === e.currentTarget) { onSelect(null); clearMultiSelect(); } }}
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
                    const isMultiSelected = multiSelection.has(n.id);

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
                          (!isSelected && !isMultiSelected && !n.locked ? 'hover:ring-2 hover:ring-[#C5A880]/70 hover:bg-[#C5A880]/5' : '')
                        }`}
                        style={{
                          left: `${t.x}%`,
                          top: `${effectiveTop}%`,
                          width: `${t.width}%`,
                          height: `${effectiveH}%`,
                          transform: `rotate(${t.rotation}deg)`,
                          zIndex: isSelected || isMultiSelected ? 35 : 25,
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
                          if (e.shiftKey) {
                            // Shift+Click: toggle in multi-selection
                            toggleMultiSelect(n.id);
                            onSelect(n.id);
                          } else {
                            // Normal click: clear multi-select, single select
                            clearMultiSelect();
                            onSelect(n.id);
                          }
                        }}
                        onPointerDown={(e) => {
                          if (sec.id !== active) {
                            onActiveSectionChange?.(sec.id);
                          }
                          // Only drag on normal (non-shift) pointer down
                          if (!e.shiftKey) {
                            startGesture(e as unknown as React.PointerEvent<HTMLElement>, n.id, 'drag', sec.id);
                          }
                        }}
                      >
                        {/* Selection outline — primary (gold) for single select, dashed blue for multi-select */}
                        {isSelected && (
                          <div
                            className={`absolute inset-0 border-2 rounded-sm pointer-events-none ${
                              n.groupId ? 'border-[#C5A880] ring-1 ring-[#C5A880]/50' : 'border-[#C5A880]'
                            }`}
                            style={{ margin: -2, zIndex: 11 }}
                          />
                        )}
                        {isMultiSelected && !isSelected && (
                          <div
                            className="absolute inset-0 border-2 border-dashed border-[#4A2E35] rounded-sm pointer-events-none bg-[#4A2E35]/5"
                            style={{ margin: -2, zIndex: 11 }}
                          />
                        )}

                        {/* Dashed outline for other sibling nodes belonging to the same group */}
                        {node?.groupId && n.groupId === node.groupId && !isSelected && (
                          <div
                            className="absolute inset-0 border border-dashed border-[#C5A880] rounded-sm pointer-events-none"
                            style={{ margin: -1, zIndex: 10 }}
                          />
                        )}

                        {/* Node label */}
                        {isSelected && (
                          <div
                            className="absolute pointer-events-none select-none whitespace-nowrap rounded-md bg-[#4A2E35] px-2 py-0.5 text-[10px] font-bold text-white shadow"
                            style={{ top: -24, left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}
                          >
                            <span className="flex items-center gap-1">
                              {n.groupId ? (
                                <span className="text-[#C5A880] font-extrabold flex items-center gap-0.5">
                                  📁 {n.groupName || 'Grup'} ·
                                </span>
                              ) : (
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                              )}
                              {(n.accessibility.label || n.name || n.id).replace(/^[ab]-/, '').replace(/-/g, ' ')}
                            </span>
                          </div>
                        )}

                        {/* Group moving indicator badge */}
                        {isSelected && n.groupId && (
                          <div
                            className="absolute flex items-center gap-1 rounded-full bg-[#4A2E35]/90 px-2 py-0.5 text-[9px] font-bold text-[#C5A880] shadow-md pointer-events-none select-none whitespace-nowrap"
                            style={{ bottom: -24, left: '50%', transform: 'translateX(-50%)', zIndex: 55 }}
                          >
                            <span>📁 Seluruh grup bergerak bersamaan</span>
                          </div>
                        )}

                        {/* Resize + rotate handles (Hanya jika asset bukan bagian dari grup) */}
                        {isSelected && !n.locked && !n.groupId && (
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
