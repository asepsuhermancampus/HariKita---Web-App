"use client";

import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';

export function UndoRedoControls({ 
  canUndo, 
  canRedo, 
  onUndo, 
  onRedo 
}: { 
  canUndo: boolean; 
  canRedo: boolean; 
  onUndo: () => void; 
  onRedo: () => void; 
}) {
  return (
    <div className="flex items-center rounded-xl border border-hk-soft-beige bg-white p-0.5 shadow-xs">
      <button 
        type="button"
        title="Undo (Ctrl+Z)"
        aria-label="Undo"
        className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-hk-charcoal transition hover:bg-[#F3EDE6] disabled:opacity-35 disabled:hover:bg-transparent" 
        disabled={!canUndo} 
        onClick={onUndo}
      >
        <Undo2 className="h-3.5 w-3.5 text-[#C5A880]" />
        <span>Undo</span>
      </button>
      <div className="h-4 w-px bg-hk-soft-beige" />
      <button 
        type="button"
        title="Redo (Ctrl+Y)"
        aria-label="Redo"
        className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-hk-charcoal transition hover:bg-[#F3EDE6] disabled:opacity-35 disabled:hover:bg-transparent" 
        disabled={!canRedo} 
        onClick={onRedo}
      >
        <Redo2 className="h-3.5 w-3.5 text-[#C5A880]" />
        <span>Redo</span>
      </button>
    </div>
  );
}
