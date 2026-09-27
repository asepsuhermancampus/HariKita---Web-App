"use client";

import React from 'react';
import type { AutosaveStatus } from '@/lib/invitation-studio/autosave';
import { CheckCircle2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export function SaveStatus({ status, onRetry }: { status: AutosaveStatus; onRetry?: () => void }) {
  if (status === 'saved') {
    return (
      <span aria-live="polite" className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        <span className="relative flex h-2 w-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span>Saved</span>
      </span>
    );
  }

  if (status === 'saving') {
    return (
      <span aria-live="polite" className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
        <Loader2 className="h-3 w-3 animate-spin text-amber-600" />
        <span>Saving…</span>
      </span>
    );
  }

  if (status === 'conflict') {
    return (
      <span aria-live="polite" className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
        <AlertCircle className="h-3 w-3 text-amber-600" />
        <span>Conflict — perubahan lokal dipertahankan</span>
      </span>
    );
  }

  return (
    <span aria-live="polite" className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
      <AlertCircle className="h-3 w-3 text-red-600" />
      <span>Error menyimpan</span>
      {onRetry && (
        <button 
          type="button"
          className="ml-1 inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-red-700 border border-red-200 shadow-2xs hover:bg-red-100" 
          onClick={onRetry}
        >
          <RefreshCw className="h-2.5 w-2.5" />
          <span>Retry</span>
        </button>
      )}
    </span>
  );
}
