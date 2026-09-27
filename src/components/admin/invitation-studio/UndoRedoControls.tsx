"use client";
import React from 'react';
export function UndoRedoControls({ canUndo, canRedo, onUndo, onRedo }: { canUndo: boolean; canRedo: boolean; onUndo: () => void; onRedo: () => void }) { return <div className="flex gap-2"><button className="min-h-11 rounded border px-3" disabled={!canUndo} onClick={onUndo}>Undo</button><button className="min-h-11 rounded border px-3" disabled={!canRedo} onClick={onRedo}>Redo</button></div>; }
