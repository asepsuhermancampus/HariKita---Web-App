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
  CheckSquare,
  X,
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

  // Multi-select state: Set of selected node IDs
  const [multiSelection, setMultiSelection] = useState<Set<string>>(new Set());
  // Explicit toggle for multi-select mode (allows selecting multiple items on canvas without keyboard shortcuts)
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);

  const section = document.sections.find((s) => s.id === active)!;
  const sectionLabel = STUDIO_SECTIONS.find((s) => s.id === active)?.label ?? active;

  // Active selected IDs combines multiSelection with selection prop
  const activeSelectedIds = React.useMemo(() => {
    const set = new Set(multiSelection);
    if (selection && !set.has(selection) && set.size === 0) {
      set.add(selection);
    }
    return set;
  }, [multiSelection, selection]);

  const selectedCount = activeSelectedIds.size;
  const isAnySelected = selectedCount > 0;
  const hasMultipleSelected = selectedCount >= 2;

  // Selected nodes in current section
  const selectedNodes = React.useMemo(() => {
    return section.nodes.filter(n => activeSelectedIds.has(n.id));
  }, [section.nodes, activeSelectedIds]);

  // Primary active node (for single actions or inspector)
  const node = selectedStudioNode(document, active, selection) ?? selectedNodes[0] ?? null;

  // Unique groupIds present among all currently selected nodes
  const selectedGroupIds = React.useMemo(() => {
    const gids = new Set<string>();
    selectedNodes.forEach(n => {
      if (n.groupId) gids.add(n.groupId);
    });
    return Array.from(gids);
  }, [selectedNodes]);

  const hasGroup = selectedGroupIds.length > 0;

  // Multi-select toggler
  const toggleMultiSelect = useCallback((id: string) => {
    const next = new Set(multiSelection);
    // If previous multi-selection was empty, but single selection existed, include it!
    if (next.size === 0 && selection && selection !== id) {
      next.add(selection);
    }

    let targetSelection: string | null;
    if (next.has(id)) {
      next.delete(id);
      targetSelection = next.size > 0 ? Array.from(next)[0] : null;
    } else {
      next.add(id);
      targetSelection = id;
    }

    setMultiSelection(next);
    onSelect(targetSelection);
  }, [selection, multiSelection, onSelect]);

  const clearMultiSelect = useCallback(() => {
    setMultiSelection(new Set());
    onSelect(null);
    setIsMultiSelectMode(false);
  }, [onSelect]);

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
  const ALL_MODE_MARGIN = 36;
  const allMarginTop = viewMode === 'all' ? ALL_MODE_MARGIN : 0;
  const allMarginBottom = viewMode === 'all' ? ALL_MODE_MARGIN : 0;
  // Wrapper height includes bleed so ghost sections are in scroll area
  const wrapperHeight = Math.round((SECTION_HEIGHT + bleedTop + bleedBottom) * effectiveZoom);
  const wrapperWidth = Math.round(baseWidth * effectiveZoom);
  // In 'all' mode wrapper matches total height plus top & bottom breathing margin
  const scaledWrapperHeight = viewMode === 'all' ? Math.round((totalHeight + allMarginTop + allMarginBottom) * effectiveZoom) : wrapperHeight;
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
      if (mode === 'drag') {
        if (target.groupId) {
          const siblings = targetSec.nodes.filter((n) => n.groupId === target.groupId && !n.locked);
          if (siblings.length > 1) {
            groupSiblings = siblings.map((n) => ({
              id: n.id,
              start: resolveTransform(n, device),
            }));
          }
        } else if (activeSelectedIds.size > 1 && activeSelectedIds.has(id)) {
          const siblings = targetSec.nodes.filter((n) => activeSelectedIds.has(n.id) && !n.locked);
          if (siblings.length > 1) {
            groupSiblings = siblings.map((n) => ({
              id: n.id,
              start: resolveTransform(n, device),
            }));
          }
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
    [disabled, section, document.sections, onSelect, onActiveSectionChange, active, device, effectiveZoom, baseWidth, SECTION_HEIGHT, activeSelectedIds]
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
      } else if (g && !cancel && JSON.stringify(g.start) === JSON.stringify(g.last)) {
        // Click without movement: if user clicks an already multi-selected item without Shift/multi-mode, collapse to single
        if (activeSelectedIds.size > 1 && !isMultiSelectMode) {
          setMultiSelection(new Set([g.id]));
          onSelect(g.id);
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
    [onEdit, device, viewMode, enabledSections, totalHeight, SECTION_HEIGHT, activeSelectedIds, isMultiSelectMode, onSelect]
  );

  const activeNodes = section.nodes.filter((n) => n.visible);
  const anySelected = isAnySelected;

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
        <div className="flex items-center gap-1 border-t border-hk-soft-beige px-3 py-1.5 bg-[#FAF8F5]/50 flex-wrap sm:flex-nowrap">

          {/* Multi-Select Mode Toggle Button */}
          <button
            type="button"
            title={
              isMultiSelectMode
                ? "Mode Multi-Pilih aktif — klik asset di canvas untuk menambah/mengurangi seleksi"
                : "Aktifkan Mode Multi-Pilih (atau tahan Shift/Ctrl saat klik asset)"
            }
            onClick={() => {
              const nextMode = !isMultiSelectMode;
              setIsMultiSelectMode(nextMode);
              if (nextMode && selection && multiSelection.size === 0) {
                setMultiSelection(new Set([selection]));
              }
            }}
            className={`flex h-6 items-center gap-1 rounded-lg px-2 text-[10px] font-bold transition ${
              isMultiSelectMode
                ? 'bg-[#4A2E35] text-white shadow-2xs ring-1 ring-[#4A2E35]'
                : hasMultipleSelected
                ? 'bg-[#4A2E35]/10 text-[#4A2E35]'
                : 'text-hk-taupe hover:bg-white hover:text-hk-charcoal'
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            <span>{isMultiSelectMode ? 'Multi Aktif' : 'Multi-Pilih'}</span>
          </button>

          {/* Selection count badge & Clear button */}
          {selectedCount > 1 && (
            <div className="flex items-center gap-1 rounded-md bg-[#4A2E35]/10 pl-2 pr-1 py-0.5 text-[10px] font-bold text-[#4A2E35]">
              <span>{selectedCount} asset</span>
              <button
                type="button"
                title="Batal pilih semua"
                onClick={clearMultiSelect}
                className="flex h-4 w-4 items-center justify-center rounded hover:bg-[#4A2E35]/20 text-[#4A2E35] transition"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Group badge if current selection belongs to a group */}
          {hasGroup && (
            <span className="flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
              <Group className="h-3 w-3 text-amber-600" />
              <span className="max-w-[90px] truncate">
                {selectedNodes.find(n => n.groupName)?.groupName || 'Grup'}
              </span>
            </span>
          )}

          {/* Divider */}
          <div className="h-4 w-px bg-hk-soft-beige" />

          {/* Duplicate — single or batch */}
          <button
            type="button"
            disabled={disabled || !isAnySelected}
            title={hasMultipleSelected ? `Duplikat ${selectedCount} asset terpilih` : 'Duplikat (Ctrl+D)'}
            onClick={() => {
              if (hasMultipleSelected) {
                const ids = selectedNodes.map(n => n.id);
                const newIds = ids.map(id => `${id}-cp-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
                onEdit({ type: 'duplicate-many', section: active, ids, newIds });
                setMultiSelection(new Set(newIds));
                onSelect(newIds[0]);
              } else if (node) {
                const newId = `${node.id}-cp-${Date.now()}`;
                onEdit({ type: 'duplicate', section: active, id: node.id, newId });
                setMultiSelection(new Set([newId]));
                onSelect(newId);
              }
            }}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-hk-taupe hover:bg-white hover:text-hk-charcoal transition disabled:opacity-30"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>

          {/* Toggle Visible — single or batch */}
          <button
            type="button"
            disabled={disabled || !isAnySelected}
            title={
              hasMultipleSelected
                ? `Sembunyikan / Tampilkan ${selectedCount} asset`
                : node?.visible ? 'Sembunyikan layer' : 'Tampilkan layer'
            }
            onClick={() => {
              if (hasMultipleSelected) {
                const allVisible = selectedNodes.every(n => n.visible !== false);
                selectedNodes.forEach(n => {
                  onEdit({ type: 'node', section: active, id: n.id, patch: { visible: !allVisible } });
                });
              } else if (node) {
                onEdit({ type: 'node', section: active, id: node.id, patch: { visible: !node.visible } });
              }
            }}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-hk-taupe hover:bg-white hover:text-hk-charcoal transition disabled:opacity-30"
          >
            {node?.visible === false ? <EyeOff className="h-3.5 w-3.5 text-hk-taupe/50" /> : <Eye className="h-3.5 w-3.5" />}
          </button>

          {/* Toggle Lock — single or batch */}
          <button
            type="button"
            disabled={disabled || !isAnySelected}
            title={
              hasMultipleSelected
                ? `Kunci / Buka kunci ${selectedCount} asset`
                : node?.locked ? 'Buka kunci' : 'Kunci layer'
            }
            onClick={() => {
              if (hasMultipleSelected) {
                const allLocked = selectedNodes.every(n => n.locked);
                selectedNodes.forEach(n => {
                  onEdit({ type: 'node', section: active, id: n.id, patch: { locked: !allLocked } });
                });
              } else if (node) {
                onEdit({ type: 'node', section: active, id: node.id, patch: { locked: !node.locked } });
              }
            }}
            className={`flex h-6 w-6 items-center justify-center rounded-lg transition disabled:opacity-30 ${
              node?.locked ? 'bg-amber-100 text-amber-600 hover:bg-amber-50' : 'text-hk-taupe hover:bg-white hover:text-hk-charcoal'
            }`}
          >
            {node?.locked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
          </button>

          <div className="h-4 w-px bg-hk-soft-beige" />

          {/* Group — enabled when ≥2 nodes are selected */}
          <button
            type="button"
            disabled={disabled || !hasMultipleSelected}
            title={
              hasMultipleSelected
                ? `Gabungkan ${selectedCount} asset menjadi satu grup`
                : 'Pilih minimal 2 asset (aktifkan Multi-Pilih atau tahan Shift) lalu tekan Group'
            }
            onClick={() => {
              if (!hasMultipleSelected) return;
              const ids = Array.from(activeSelectedIds);
              const groupId = `grp-${Date.now()}`;
              const groupName = `Grup ${Math.floor(Date.now() % 10000)}`;
              onEdit({
                type: 'group-nodes',
                section: active,
                ids,
                groupId,
                groupName,
              });
              setMultiSelection(new Set(ids));
              onSelect(ids[0]);
              setIsMultiSelectMode(false);
            }}
            className={`flex h-6 items-center gap-1 rounded-lg px-2 text-[10px] font-bold transition disabled:opacity-30 ${
              hasMultipleSelected
                ? 'bg-[#4A2E35] text-white hover:bg-[#382328] shadow-2xs'
                : 'text-hk-taupe hover:bg-white hover:text-hk-charcoal'
            }`}
          >
            <Group className="h-3.5 w-3.5" />
            <span>Group{hasMultipleSelected ? ` (${selectedCount})` : ''}</span>
          </button>

          {/* Ungroup — enabled whenever any selected node belongs to a group */}
          <button
            type="button"
            disabled={disabled || !hasGroup}
            title={
              hasGroup
                ? `Pisahkan ${selectedGroupIds.length} grup menjadi layer terpisah`
                : 'Pilih asset yang berada dalam grup untuk melakukan ungroup'
            }
            onClick={() => {
              if (!hasGroup) return;
              selectedGroupIds.forEach(gid => {
                onEdit({ type: 'ungroup-nodes', section: active, groupId: gid });
              });
            }}
            className={`flex h-6 items-center gap-1 rounded-lg px-2 text-[10px] font-bold transition disabled:opacity-30 ${
              hasGroup
                ? 'text-[#4A2E35] bg-white border border-hk-soft-beige hover:border-[#C5A880] hover:bg-[#FAF8F5]'
                : 'text-hk-taupe hover:bg-white hover:text-hk-charcoal'
            }`}
          >
            <Ungroup className="h-3.5 w-3.5" />
            <span>Ungroup</span>
          </button>

          {/* Pilih Grup — selects all sibling nodes belonging to the same group */}
          <button
            type="button"
            disabled={!hasGroup}
            title={
              hasGroup
                ? 'Pilih semua asset dalam grup ini sekaligus'
                : 'Pilih asset dalam grup terlebih dahulu'
            }
            onClick={() => {
              if (!hasGroup) return;
              const allMemberIds = section.nodes
                .filter(n => n.groupId && selectedGroupIds.includes(n.groupId))
                .map(n => n.id);
              setMultiSelection(new Set(allMemberIds));
              if (allMemberIds[0]) onSelect(allMemberIds[0]);
            }}
            className={`flex h-6 items-center gap-1 rounded-lg px-2 text-[10px] font-bold transition disabled:opacity-30 ${
              hasGroup
                ? 'text-[#4A2E35] bg-amber-50/70 border border-amber-200/80 hover:bg-amber-100/70'
                : 'text-hk-taupe hover:bg-white hover:text-hk-charcoal'
            }`}
          >
            <MousePointer2 className="h-3.5 w-3.5 text-[#C5A880]" />
            <span>Pilih Grup</span>
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Delete — single or batch */}
          <button
            type="button"
            disabled={disabled || !isAnySelected}
            title={hasMultipleSelected ? `Hapus ${selectedCount} asset terpilih` : 'Hapus layer'}
            onClick={() => {
              if (hasMultipleSelected) {
                const ids = Array.from(activeSelectedIds);
                onEdit({ type: 'delete-many', section: active, ids });
                clearMultiSelect();
              } else if (node) {
                onEdit({ type: 'delete', section: active, id: node.id });
                clearMultiSelect();
              }
            }}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-30"
          >
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
              top: viewMode === 'active' ? Math.round(bleedTop * effectiveZoom) : Math.round(allMarginTop * effectiveZoom),
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
              {/* Safe Area Dotted Boundary — seragam rounded persis antar mode */}
              {viewMode === 'active' ? (
                <div
                  className="pointer-events-none absolute inset-0 z-20 border border-dashed border-[#C5A880]/40 m-2"
                  aria-hidden="true"
                  style={{ borderRadius: device === 'mobile' ? '22px' : '12px' }}
                />
              ) : (
                /* 'Semua Section' mode: render Safe Area Dotted Boundary rounded yang seragam per section */
                enabledSections.map((sec, idx) => (
                  <div
                    key={`safe-area-${sec.id}`}
                    className="pointer-events-none absolute border border-dashed border-[#C5A880]/40"
                    aria-hidden="true"
                    style={{
                      top: idx * SECTION_HEIGHT + 8,
                      left: 8,
                      right: 8,
                      height: SECTION_HEIGHT - 16,
                      borderRadius: device === 'mobile' ? '22px' : '12px',
                      zIndex: 20,
                    }}
                  >
                    {/* Section Label Header in 'all' mode */}
                    <div className="absolute top-2 left-3 pointer-events-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onActiveSectionChange?.(sec.id);
                        }}
                        title={`Pilih ${STUDIO_SECTIONS.find((s) => s.id === sec.id)?.label ?? sec.id}`}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition shadow-2xs ${
                          sec.id === active
                            ? 'bg-[#C5A880] text-white shadow-sm'
                            : 'bg-white/90 text-[#4A2E35] border border-[#E8DED1] hover:bg-white'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{STUDIO_SECTIONS.find((s) => s.id === sec.id)?.label ?? sec.id}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}

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

                  {/* Section boundary indicators — floating in bleed area to preserve pristine rounded corners */}
                  {prevEnabledSection && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute left-6 right-6 flex items-center justify-center gap-2"
                      style={{ top: -16, zIndex: 20 }}
                    >
                      <div className="flex-1 border-t border-dashed border-[#C5A880]/40" />
                      <span className="rounded-full bg-[#C5A880]/90 px-2.5 py-0.5 text-[9px] font-bold text-white whitespace-nowrap shadow-sm">
                        ↑ {STUDIO_SECTIONS.find((s) => s.id === prevEnabledSection.id)?.label ?? prevEnabledSection.id}
                      </span>
                      <div className="flex-1 border-t border-dashed border-[#C5A880]/40" />
                    </div>
                  )}
                  {nextEnabledSection && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute left-6 right-6 flex items-center justify-center gap-2"
                      style={{ top: SECTION_HEIGHT + 6, zIndex: 20 }}
                    >
                      <div className="flex-1 border-t border-dashed border-[#C5A880]/40" />
                      <span className="rounded-full bg-[#C5A880]/90 px-2.5 py-0.5 text-[9px] font-bold text-white whitespace-nowrap shadow-sm">
                        ↓ {STUDIO_SECTIONS.find((s) => s.id === nextEnabledSection.id)?.label ?? nextEnabledSection.id}
                      </span>
                      <div className="flex-1 border-t border-dashed border-[#C5A880]/40" />
                    </div>
                  )}
                </div>

              ) : (
                /* 'Semua Section' mode — all enabled sections stacked with transparent scene background */
                <StudioSceneRenderer document={display} device={device} editor transparent />
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
                    const isSelected = activeSelectedIds.has(n.id);

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
                          (!isSelected && !n.locked ? 'hover:ring-2 hover:ring-[#C5A880]/70 hover:bg-[#C5A880]/5' : '')
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
                        }}
                        onPointerDown={(e) => {
                          if (sec.id !== active) {
                            onActiveSectionChange?.(sec.id);
                          }
                          const isAdditive = e.shiftKey || e.ctrlKey || e.metaKey || isMultiSelectMode;
                          if (isAdditive) {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleMultiSelect(n.id);
                            return;
                          }
                          if (activeSelectedIds.has(n.id) && activeSelectedIds.size > 1) {
                            startGesture(e as unknown as React.PointerEvent<HTMLElement>, n.id, 'drag', sec.id);
                          } else {
                            setMultiSelection(new Set([n.id]));
                            onSelect(n.id);
                            startGesture(e as unknown as React.PointerEvent<HTMLElement>, n.id, 'drag', sec.id);
                          }
                        }}
                      >
                        {/* Selection outline */}
                        {isSelected && (
                          <div
                            className={`absolute inset-0 border-2 rounded-sm pointer-events-none transition-all ${
                              n.groupId ? 'border-[#C5A880] ring-1 ring-[#C5A880]/50 bg-[#C5A880]/5' : 'border-[#C5A880] bg-[#C5A880]/5'
                            }`}
                            style={{ margin: -2, zIndex: 11 }}
                          >
                            {/* Multi-selection badge */}
                            {activeSelectedIds.size > 1 && (
                              <div className="absolute -top-2.5 -left-2.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#4A2E35] px-1 text-[9px] font-bold text-white shadow-xs pointer-events-none">
                                {n.groupId ? '⬡' : '✓'}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Dashed outline for other sibling nodes belonging to the same group */}
                        {node?.groupId && n.groupId === node.groupId && !isSelected && (
                          <div
                            className="absolute inset-0 border border-dashed border-[#C5A880]/80 rounded-sm pointer-events-none bg-[#C5A880]/3"
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

                        {/* Group / Multi-selection moving indicator badge */}
                        {isSelected && (n.groupId || (activeSelectedIds.size > 1 && n.id === (selection || Array.from(activeSelectedIds)[0]))) && (
                          <div
                            className="absolute flex items-center gap-1 rounded-full bg-[#4A2E35]/90 px-2 py-0.5 text-[9px] font-bold text-[#C5A880] shadow-md pointer-events-none select-none whitespace-nowrap"
                            style={{ bottom: -24, left: '50%', transform: 'translateX(-50%)', zIndex: 55 }}
                          >
                            <span>{n.groupId ? '📁 Seluruh grup bergerak bersamaan' : `📁 ${activeSelectedIds.size} asset bergerak bersamaan`}</span>
                          </div>
                        )}

                        {/* Resize + rotate handles (Hanya jika asset bukan bagian dari grup dan hanya 1 asset terpilih) */}
                        {isSelected && activeSelectedIds.size === 1 && !n.locked && !n.groupId && (
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
