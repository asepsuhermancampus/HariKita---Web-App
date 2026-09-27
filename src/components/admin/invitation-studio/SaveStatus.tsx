"use client";
import React from 'react';
import type { AutosaveStatus } from '@/lib/invitation-studio/autosave';
export function SaveStatus({ status, onRetry }: { status: AutosaveStatus; onRetry?: () => void }) { return <span aria-live="polite" className="text-xs text-hk-taupe">{status === 'saved' ? 'Saved' : status === 'saving' ? 'Saving…' : status === 'conflict' ? 'Conflict — perubahan lokal dipertahankan' : <><span>Error menyimpan</span>{onRetry && <button className="ml-2 min-h-11 rounded border px-2" onClick={onRetry}>Retry</button>}</>}</span>; }
