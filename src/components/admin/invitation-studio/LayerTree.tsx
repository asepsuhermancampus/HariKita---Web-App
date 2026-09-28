"use client";

import React, { useState, useEffect } from 'react';
import type { StudioSection, StudioSectionId, StudioNode } from '@/lib/invitation-studio/types';
import type { StudioEdit } from '@/lib/invitation-studio/editor';
import { STUDIO_SECTIONS } from '@/lib/invitation-studio/sections';
import { 
  Layers, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  ChevronUp, 
  ChevronDown, 
  ChevronRight,
  Copy, 
  Trash2, 
  Type, 
  LayoutTemplate,
  CheckSquare,
  Square,
  ArrowRightCircle,
  Folder,
  FolderOpen,
  FolderPlus,
  FolderX,
  X
} from 'lucide-react';

export function LayerTree({ 
  section, 
  selection, 
  onSelect, 
  onEdit, 
  disabled 
}: { 
  section: StudioSection; 
  selection: string | null; 
  onSelect: (id: string) => void; 
  onEdit: (edit: StudioEdit) => void; 
  disabled: boolean; 
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [targetSection, setTargetSection] = useState<StudioSectionId | ''>('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Reset multi-selection when section changes
  useEffect(() => {
    setSelectedIds(new Set());
    setCopyFeedback(null);
  }, [section.id]);

  const allSelected = section.nodes.length > 0 && selectedIds.size === section.nodes.length;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(section.nodes.map(n => n.id)));
    }
  };

  const handleCreateGroup = () => {
    if (selectedIds.size < 2) return;
    const existingGroupCount = new Set(section.nodes.map(n => n.groupId).filter(Boolean)).size;
    const defaultName = `Grup Layer ${existingGroupCount + 1}`;
    const name = window.prompt("Nama grup baru:", defaultName);
    if (!name || !name.trim()) return;
    const groupId = `group-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    onEdit({
      type: 'group-nodes',
      section: section.id,
      ids: Array.from(selectedIds),
      groupId,
      groupName: name.trim(),
    });
    setCopyFeedback(`✓ ${selectedIds.size} layer digabung ke "${name.trim()}"`);
    setSelectedIds(new Set());
    setTimeout(() => setCopyFeedback(null), 3500);
  };

  const handleDuplicateSelected = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    onEdit({
      type: 'duplicate-many',
      section: section.id,
      ids,
      newIds: ids.map(() => crypto.randomUUID()),
    });
    setCopyFeedback(`✓ ${ids.length} layer diduplikat`);
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const handleDuplicateGroup = (groupId: string, nodes: StudioNode[]) => {
    const newGroupId = `group-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const newGroupIdsMap: Record<string, string> = {};
    nodes.forEach(n => {
      newGroupIdsMap[n.id] = crypto.randomUUID();
    });
    onEdit({
      type: 'duplicate-group',
      section: section.id,
      groupId,
      newGroupId,
      newGroupIdsMap,
    });
    setCopyFeedback(`✓ 1 grup (${nodes.length} layer) berhasil diduplikat`);
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const handleUngroup = (groupId: string) => {
    onEdit({
      type: 'ungroup-nodes',
      section: section.id,
      groupId,
    });
    setCopyFeedback(`✓ Grup berhasil dipisahkan kembali`);
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const handleToggleGroupLock = (groupId: string, nodes: StudioNode[]) => {
    const allLocked = nodes.every(n => n.locked);
    onEdit({
      type: 'group-toggle',
      section: section.id,
      groupId,
      field: 'locked',
      value: !allLocked,
    });
  };

  const handleToggleGroupVisibility = (groupId: string, nodes: StudioNode[]) => {
    const allVisible = nodes.every(n => n.visible);
    onEdit({
      type: 'group-toggle',
      section: section.id,
      groupId,
      field: 'visible',
      value: !allVisible,
    });
  };

  const handleDeleteGroup = (groupId: string, groupName: string) => {
    if (!window.confirm(`Hapus "${groupName}" beserta seluruh isinya?`)) return;
    onEdit({
      type: 'delete-group',
      section: section.id,
      groupId,
    });
    setSelectedIds(prev => {
      const next = new Set(prev);
      section.nodes.filter(n => n.groupId === groupId).forEach(n => next.delete(n.id));
      return next;
    });
  };

  const handleRenameGroup = (groupId: string, newName: string) => {
    if (newName.trim()) {
      onEdit({
        type: 'rename-group',
        section: section.id,
        groupId,
        groupName: newName.trim(),
      });
    }
  };

  const handleCopyToSection = (toSec: StudioSectionId) => {
    if (selectedIds.size === 0 || !toSec) return;
    const ids = Array.from(selectedIds);
    onEdit({
      type: 'copy-to-section',
      fromSection: section.id,
      toSection: toSec,
      ids,
      newIds: ids.map(() => crypto.randomUUID()),
    });
    const targetLabel = STUDIO_SECTIONS.find(s => s.id === toSec)?.label ?? toSec;
    setCopyFeedback(`✓ ${ids.length} layer disalin ke "${targetLabel}"`);
    setTargetSection('');
    setTimeout(() => setCopyFeedback(null), 3500);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    if (!window.confirm(`Hapus ${ids.length} layer terpilih di section ini?`)) return;
    onEdit({
      type: 'delete-many',
      section: section.id,
      ids,
    });
    setSelectedIds(new Set());
  };

  // Grouping structure for rendering
  const renderedGroupIds = new Set<string>();
  type TreeItem =
    | { type: 'group'; groupId: string; groupName: string; nodes: StudioNode[] }
    | { type: 'node'; node: StudioNode; index: number };

  const treeItems: TreeItem[] = [];
  section.nodes.forEach((node, idx) => {
    if (node.groupId) {
      if (!renderedGroupIds.has(node.groupId)) {
        renderedGroupIds.add(node.groupId);
        const groupNodes = section.nodes.filter(n => n.groupId === node.groupId);
        treeItems.push({
          type: 'group',
          groupId: node.groupId,
          groupName: node.groupName || 'Grup',
          nodes: groupNodes,
        });
      }
    } else {
      treeItems.push({
        type: 'node',
        node,
        index: idx,
      });
    }
  });

  const renderSingleNodeCard = (node: StudioNode, index: number, isNested = false) => {
    const isSelected = selection === node.id;
    const isChecked = selectedIds.has(node.id);
    // Strip a-/b- source prefix from legacy names for friendly display
    const nodeName = (node.name ?? node.kind).replace(/^[ab]-/, '').replace(/-/g, ' ');

    return (
      <div 
        key={node.id} 
        className={`space-y-2 rounded-xl border p-2.5 transition ${
          isChecked
            ? 'border-[#C5A880] bg-[#FAF8F5] ring-2 ring-[#C5A880]/50'
            : isSelected 
              ? 'border-[#C5A880] bg-[#F3EDE6] shadow-2xs ring-1 ring-[#C5A880]/40' 
              : isNested 
                ? 'border-hk-soft-beige/70 bg-white/90 hover:border-[#C5A880]/50' 
                : 'border-hk-soft-beige/90 bg-white hover:border-[#C5A880]/50'
        }`}
      >
        {/* Row header & selection trigger */}
        <div className="flex w-full min-w-0 items-center gap-2">
          {/* Multi-select Checkbox */}
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => {
              e.stopPropagation();
              toggleSelect(node.id);
            }}
            className="h-4 w-4 shrink-0 rounded border-hk-soft-beige text-[#C5A880] focus:ring-[#C5A880] cursor-pointer"
            title="Pilih layer untuk aksi massal"
          />

          <button 
            type="button"
            className="flex min-w-0 flex-1 items-center gap-2 text-left" 
            aria-pressed={isSelected} 
            onClick={() => onSelect(node.id)}
          >
            <div className="flex shrink-0 items-center justify-center rounded-lg bg-[#FAF8F5] border border-hk-soft-beige p-1" style={{ width: 30, height: 30, minWidth: 30, overflow: 'hidden' }}>
              {'src' in node.config ? (
                <img
                  src={node.config.src}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              ) : node.kind === 'text' ? (
                <Type className="h-3.5 w-3.5 text-[#C5A880]" />
              ) : (
                <LayoutTemplate className="h-3.5 w-3.5 text-[#C5A880]" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className={`truncate text-xs font-bold ${isSelected ? 'text-[#4A2E35]' : 'text-hk-charcoal'}`}>
                {nodeName}
              </p>
              <p className="text-[10px] text-hk-taupe truncate">
                {node.kind} · {node.layer}
              </p>
            </div>
          </button>
        </div>

        {/* Rename input */}
        <div className="space-y-0.5">
          <label className="text-[9px] font-bold text-hk-taupe uppercase tracking-wider">Nama layer</label>
          <input 
            className="h-7 w-full min-w-0 rounded-lg border border-hk-soft-beige bg-white px-2 text-xs text-hk-charcoal transition focus:border-[#C5A880] focus:outline-none" 
            value={node.name ?? node.kind} 
            maxLength={100} 
            disabled={disabled} 
            onChange={e => { 
              if (e.target.value.trim()) {
                onEdit({ type: 'node', section: section.id, id: node.id, patch: { name: e.target.value } }); 
              }
            }} 
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-hk-soft-beige/60">
          <button 
            type="button"
            className="flex h-6 items-center gap-0.5 rounded-md border border-hk-soft-beige bg-white px-1.5 text-[10px] font-medium text-hk-charcoal transition hover:border-[#C5A880] hover:bg-[#FAF8F5] disabled:opacity-40" 
            disabled={disabled} 
            onClick={() => onEdit({ type: 'node', section: section.id, id: node.id, patch: { locked: !node.locked } })}
            title={node.locked ? 'Buka kunci layer' : 'Kunci layer'}
          >
            {node.locked ? <Lock className="h-2.5 w-2.5 text-amber-600" /> : <Unlock className="h-2.5 w-2.5 text-stone-400" />}
            <span>{node.locked ? 'Buka kunci' : 'Kunci'}</span>
          </button>

          <button 
            type="button"
            className="flex h-6 items-center gap-0.5 rounded-md border border-hk-soft-beige bg-white px-1.5 text-[10px] font-medium text-hk-charcoal transition hover:border-[#C5A880] hover:bg-[#FAF8F5] disabled:opacity-40" 
            disabled={disabled} 
            onClick={() => onEdit({ type: 'node', section: section.id, id: node.id, patch: { visible: !node.visible } })}
            title={node.visible ? 'Sembunyikan layer' : 'Tampilkan layer'}
          >
            {node.visible ? <Eye className="h-2.5 w-2.5 text-emerald-600" /> : <EyeOff className="h-2.5 w-2.5 text-stone-400" />}
            <span>{node.visible ? 'Sembunyikan' : 'Tampilkan'}</span>
          </button>

          <button 
            type="button"
            aria-label={`Naik layer ${node.name}`} 
            title="Naikkan urutan layer"
            className="flex h-6 w-6 items-center justify-center rounded-md border border-hk-soft-beige bg-white text-xs text-hk-charcoal transition hover:border-[#C5A880] hover:bg-[#FAF8F5] disabled:opacity-30" 
            disabled={disabled || index === 0} 
            onClick={() => onEdit({ type: 'node-move', section: section.id, id: node.id, offset: -1 })}
          >
            <ChevronUp className="h-3 w-3" />
            <span className="sr-only">↑</span>
          </button>

          <button 
            type="button"
            aria-label={`Turun layer ${node.name}`} 
            title="Turunkan urutan layer"
            className="flex h-6 w-6 items-center justify-center rounded-md border border-hk-soft-beige bg-white text-xs text-hk-charcoal transition hover:border-[#C5A880] hover:bg-[#FAF8F5] disabled:opacity-30" 
            disabled={disabled || index === section.nodes.length - 1} 
            onClick={() => onEdit({ type: 'node-move', section: section.id, id: node.id, offset: 1 })}
          >
            <ChevronDown className="h-3 w-3" />
            <span className="sr-only">↓</span>
          </button>

          <button 
            type="button"
            className="flex h-6 items-center gap-0.5 rounded-md border border-hk-soft-beige bg-white px-1.5 text-[10px] font-medium text-hk-charcoal transition hover:border-[#C5A880] hover:bg-[#FAF8F5] disabled:opacity-40" 
            disabled={disabled} 
            onClick={() => onEdit({ type: 'duplicate', section: section.id, id: node.id, newId: crypto.randomUUID() })}
            title="Duplikat layer ini"
          >
            <Copy className="h-2.5 w-2.5 text-sky-600" />
            <span>Duplikat layer</span>
          </button>

          <button 
            type="button"
            className="flex h-6 items-center gap-0.5 rounded-md border border-red-200 bg-white px-1.5 text-[10px] font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-40" 
            disabled={disabled} 
            onClick={() => onEdit({ type: 'delete', section: section.id, id: node.id })}
            title="Hapus layer ini"
          >
            <Trash2 className="h-2.5 w-2.5 text-red-500" />
            <span>Hapus layer</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="flex flex-col h-full min-h-0 space-y-2.5">
      {/* Top Header */}
      <div className="shrink-0 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#C5A880]" />
          <h2 className="text-sm font-bold text-hk-charcoal">Layers</h2>
        </div>
        <div className="flex items-center gap-2">
          {section.nodes.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAll}
              disabled={disabled}
              className="flex items-center gap-1 text-[11px] font-bold text-[#C5A880] hover:text-[#4A2E35] transition"
            >
              {allSelected ? (
                <>
                  <CheckSquare className="h-3 w-3" />
                  <span>Batal Semua</span>
                </>
              ) : (
                <>
                  <Square className="h-3 w-3" />
                  <span>Pilih Semua</span>
                </>
              )}
            </button>
          )}
          <span className="rounded-full bg-[#FAF8F5] border border-hk-soft-beige px-2 py-0.5 text-[11px] font-bold text-hk-taupe">
            {section.nodes.length} item
          </span>
        </div>
      </div>

      {/* Feedback Alert */}
      {copyFeedback && (
        <div className="shrink-0 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-800 flex items-center justify-between animate-fade-in shadow-2xs">
          <span>{copyFeedback}</span>
          <button type="button" onClick={() => setCopyFeedback(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Batch Actions Toolbar (Shown when >= 1 layer is checked) */}
      {selectedIds.size > 0 && (
        <div className="shrink-0 rounded-xl border border-[#C5A880] bg-[#FAF8F5] p-2.5 shadow-sm space-y-2 animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#C5A880]/30 pb-1.5">
            <span className="text-xs font-bold text-[#4A2E35]">
              {selectedIds.size} layer terpilih
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-[10px] font-bold text-hk-taupe hover:text-red-600 transition"
            >
              Batal
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Create Group button (if >= 2 items selected) */}
            {selectedIds.size >= 2 && (
              <button
                type="button"
                onClick={handleCreateGroup}
                disabled={disabled}
                className="flex h-7 items-center justify-center gap-1 rounded-lg border border-[#4A2E35] bg-[#4A2E35] px-2 text-xs font-bold text-white shadow-2xs transition hover:bg-[#6B5E62] active:scale-95 disabled:opacity-40"
                title="Satukan layer terpilih ke dalam 1 grup"
              >
                <FolderPlus className="h-3.5 w-3.5 text-[#C5A880]" />
                <span>Jadikan 1 Group</span>
              </button>
            )}

            {/* Duplicate button */}
            <button
              type="button"
              onClick={handleDuplicateSelected}
              disabled={disabled}
              className="flex h-7 flex-1 items-center justify-center gap-1 rounded-lg border border-[#C5A880] bg-white px-2 text-xs font-bold text-[#4A2E35] shadow-2xs transition hover:bg-[#F3EDE6] active:scale-95 disabled:opacity-40"
              title="Gandakan semua layer yang dipilih di section ini"
            >
              <Copy className="h-3 w-3 text-sky-600" />
              <span>Duplikat ({selectedIds.size})</span>
            </button>

            {/* Delete button */}
            <button
              type="button"
              onClick={handleDeleteSelected}
              disabled={disabled}
              className="flex h-7 items-center justify-center gap-1 rounded-lg border border-red-200 bg-white px-2 text-xs font-bold text-red-600 shadow-2xs transition hover:bg-red-50 active:scale-95 disabled:opacity-40"
              title="Hapus semua layer yang dipilih"
            >
              <Trash2 className="h-3 w-3 text-red-500" />
              <span>Hapus</span>
            </button>
          </div>

          {/* Copy to another section */}
          <div className="pt-0.5">
            <div className="flex items-center gap-1">
              <ArrowRightCircle className="h-3.5 w-3.5 text-[#C5A880] shrink-0" />
              <select
                value={targetSection}
                onChange={(e) => {
                  const to = e.target.value as StudioSectionId;
                  if (to) {
                    setTargetSection(to);
                    handleCopyToSection(to);
                  }
                }}
                disabled={disabled}
                className="h-7 w-full rounded-lg border border-hk-soft-beige bg-white px-2 text-[11px] font-semibold text-[#4A2E35] focus:border-[#C5A880] focus:outline-none cursor-pointer"
              >
                <option value="">Salin ke section lain...</option>
                {STUDIO_SECTIONS.filter(s => s.id !== section.id).map(s => (
                  <option key={s.id} value={s.id}>
                    ↳ {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!section.nodes.length && (
        <div className="rounded-xl border border-dashed border-hk-soft-beige p-6 text-center my-auto">
          <p className="text-xs text-hk-taupe">Belum ada layer di section ini.</p>
          <p className="mt-1 text-[11px] text-hk-taupe/70">Tambahkan teks, ornamen, atau blok section dari tab Katalog.</p>
        </div>
      )}

      {/* Layer Items List with Grouping */}
      <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1">
        {treeItems.map((item) => {
          if (item.type === 'node') {
            return renderSingleNodeCard(item.node, item.index);
          }

          // Group Folder item
          const isCollapsed = collapsedGroups.has(item.groupId);
          const allGroupNodesSelected = item.nodes.every(n => selectedIds.has(n.id));
          const allGroupLocked = item.nodes.every(n => n.locked);
          const allGroupVisible = item.nodes.every(n => n.visible);

          return (
            <div 
              key={item.groupId}
              className="rounded-xl border border-[#C5A880]/80 bg-[#FAF8F5]/90 p-2.5 shadow-2xs space-y-2 transition-all"
            >
              {/* Group Folder Header */}
              <div className="flex items-center justify-between gap-1.5 border-b border-[#C5A880]/30 pb-2">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  {/* Expand/Collapse Button */}
                  <button
                    type="button"
                    onClick={() => toggleGroupCollapse(item.groupId)}
                    className="flex h-5 w-5 items-center justify-center rounded text-hk-taupe hover:text-[#4A2E35] transition"
                    title={isCollapsed ? "Buka folder grup" : "Tutup folder grup"}
                  >
                    <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`} />
                  </button>

                  {/* Group Checkbox */}
                  <input
                    type="checkbox"
                    checked={allGroupNodesSelected}
                    onChange={() => {
                      if (allGroupNodesSelected) {
                        setSelectedIds(prev => {
                          const next = new Set(prev);
                          item.nodes.forEach(n => next.delete(n.id));
                          return next;
                        });
                      } else {
                        setSelectedIds(prev => {
                          const next = new Set(prev);
                          item.nodes.forEach(n => next.add(n.id));
                          return next;
                        });
                      }
                    }}
                    className="h-4 w-4 shrink-0 rounded border-hk-soft-beige text-[#C5A880] focus:ring-[#C5A880] cursor-pointer"
                    title="Pilih seluruh isi grup ini"
                  />

                  {/* Folder Icon */}
                  {isCollapsed ? (
                    <Folder className="h-4 w-4 text-[#C5A880] shrink-0" />
                  ) : (
                    <FolderOpen className="h-4 w-4 text-[#C5A880] shrink-0" />
                  )}

                  {/* Inline Group Name Input */}
                  <input
                    defaultValue={item.groupName}
                    onBlur={(e) => handleRenameGroup(item.groupId, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="h-6 min-w-0 flex-1 rounded bg-transparent px-1 text-xs font-bold text-[#4A2E35] hover:bg-white/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                    title="Klik untuk mengubah nama grup"
                  />

                  {/* Count badge */}
                  <span className="shrink-0 rounded-full bg-white border border-[#C5A880]/40 px-1.5 py-0.2 text-[9px] font-bold text-[#4A2E35]">
                    {item.nodes.length}
                  </span>
                </div>

                {/* Quick actions on Group Header */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Lock/Unlock all in group */}
                  <button
                    type="button"
                    onClick={() => handleToggleGroupLock(item.groupId, item.nodes)}
                    disabled={disabled}
                    className="flex h-5 w-5 items-center justify-center rounded border border-[#C5A880]/30 bg-white text-hk-taupe hover:text-[#4A2E35] hover:border-[#C5A880] transition"
                    title={allGroupLocked ? "Buka kunci semua di grup" : "Kunci semua di grup"}
                  >
                    {allGroupLocked ? <Lock className="h-2.5 w-2.5 text-amber-600" /> : <Unlock className="h-2.5 w-2.5" />}
                  </button>

                  {/* Show/Hide all in group */}
                  <button
                    type="button"
                    onClick={() => handleToggleGroupVisibility(item.groupId, item.nodes)}
                    disabled={disabled}
                    className="flex h-5 w-5 items-center justify-center rounded border border-[#C5A880]/30 bg-white text-hk-taupe hover:text-[#4A2E35] hover:border-[#C5A880] transition"
                    title={allGroupVisible ? "Sembunyikan semua di grup" : "Tampilkan semua di grup"}
                  >
                    {allGroupVisible ? <Eye className="h-2.5 w-2.5 text-emerald-600" /> : <EyeOff className="h-2.5 w-2.5" />}
                  </button>

                  {/* Duplicate Group */}
                  <button
                    type="button"
                    onClick={() => handleDuplicateGroup(item.groupId, item.nodes)}
                    disabled={disabled}
                    className="flex h-5 w-5 items-center justify-center rounded border border-[#C5A880]/30 bg-white text-sky-600 hover:bg-sky-50 hover:border-sky-300 transition"
                    title="Duplikat seluruh grup ini beserta isinya"
                  >
                    <Copy className="h-2.5 w-2.5" />
                  </button>

                  {/* Ungroup */}
                  <button
                    type="button"
                    onClick={() => handleUngroup(item.groupId)}
                    disabled={disabled}
                    className="flex h-5 w-5 items-center justify-center rounded border border-[#C5A880]/30 bg-white text-hk-taupe hover:text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition"
                    title="Pisahkan grup (Ungroup) kembali menjadi layer mandiri"
                  >
                    <FolderX className="h-2.5 w-2.5" />
                  </button>

                  {/* Delete Group */}
                  <button
                    type="button"
                    onClick={() => handleDeleteGroup(item.groupId, item.groupName)}
                    disabled={disabled}
                    className="flex h-5 w-5 items-center justify-center rounded border border-red-200 bg-white text-red-500 hover:bg-red-50 hover:border-red-300 transition"
                    title="Hapus grup beserta isinya"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>

              {/* Group Body: Child Layer Items (collapsible) */}
              {!isCollapsed && (
                <div className="ml-2.5 pl-2.5 border-l-2 border-[#C5A880]/40 space-y-2 py-1">
                  {item.nodes.map((node) => {
                    const originalIdx = section.nodes.findIndex(n => n.id === node.id);
                    return renderSingleNodeCard(node, originalIdx, true);
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
