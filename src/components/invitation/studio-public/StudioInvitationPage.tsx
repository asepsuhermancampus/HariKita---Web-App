"use client";

import React from "react";
import { StudioSceneRenderer } from "@/components/admin/invitation-studio/StudioSceneRenderer";
import { backgroundToCss } from "@/lib/invitation-studio/colors";
import { STUDIO_SECTIONS } from "@/lib/invitation-studio/sections";
import type { InvitationStudioDocument } from "@/lib/invitation-studio/types";

/**
 * Public renderer for a published studio document. Reuses StudioSceneRenderer so
 * the canvas background and all sections/nodes render exactly as designed in the
 * editor, without any editor chrome.
 */
export function StudioInvitationPage({
  document,
  guestName,
}: {
  document: InvitationStudioDocument;
  guestName?: string;
}) {
  const lastId = document.sectionOrder[document.sectionOrder.length - 1];

  return (
    <div className="min-h-screen">
      {guestName ? (
        <div className="bg-white/70 px-4 py-2 text-center text-xs font-semibold text-[#4A2E35] backdrop-blur">
          Kepada: {guestName}
        </div>
      ) : null}
      <div className="mx-auto w-full max-w-[480px]" style={backgroundToCss(document.background)}>
        <StudioSceneRenderer document={document} device="mobile" editor={false} transparent />
      </div>
      <div className="sr-only" data-studio-sections={document.sectionOrder.length}>
        {STUDIO_SECTIONS.find((s) => s.id === lastId)?.label ?? ""}
      </div>
    </div>
  );
}
