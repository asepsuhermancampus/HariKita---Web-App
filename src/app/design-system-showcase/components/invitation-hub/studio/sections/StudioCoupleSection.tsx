'use client';

import React from 'react';
import { CoupleCardVariantId } from '@/types/invitation-studio';
import { FloatingGlassVariant } from './couple-variants/FloatingGlassVariant';
import { EditorialSerifVariant } from './couple-variants/EditorialSerifVariant';
import { FullscreenPrewedVariant } from './couple-variants/FullscreenPrewedVariant';
import { TwinArchesFloralVariant } from './couple-variants/TwinArchesFloralVariant';
import { MihrabArabesqueVariant } from './couple-variants/MihrabArabesqueVariant';
import { JavaneseGununganVariant } from './couple-variants/JavaneseGununganVariant';
import { RoyalMedallionVariant } from './couple-variants/RoyalMedallionVariant';
import { PolaroidScrapbookVariant } from './couple-variants/PolaroidScrapbookVariant';

import { LiveContentData } from '@/types/invitation-studio';

export interface StudioCoupleSectionProps {
  variant: CoupleCardVariantId;
  themeColor: string;
  ornamentId?: string;
  content?: LiveContentData;
}

export function StudioCoupleSection({
  variant,
  themeColor,
  ornamentId,
  content,
}: StudioCoupleSectionProps) {
  switch (variant) {
    case 'floating-glass':
      return <FloatingGlassVariant themeColor={themeColor} ornamentId={ornamentId} content={content} />;
    case 'editorial-serif':
      return <EditorialSerifVariant themeColor={themeColor} ornamentId={ornamentId} content={content} />;
    case 'fullscreen-prewed':
      return <FullscreenPrewedVariant themeColor={themeColor} ornamentId={ornamentId} content={content} />;
    case 'twin-arches':
      return <TwinArchesFloralVariant themeColor={themeColor} ornamentId={ornamentId} content={content} />;
    case 'mihrab-arabesque':
      return <MihrabArabesqueVariant themeColor={themeColor} ornamentId={ornamentId} content={content} />;
    case 'javanese-gunungan':
      return <JavaneseGununganVariant themeColor={themeColor} ornamentId={ornamentId} content={content} />;
    case 'royal-medallion':
      return <RoyalMedallionVariant themeColor={themeColor} ornamentId={ornamentId} content={content} />;
    case 'polaroid-scrapbook':
      return <PolaroidScrapbookVariant themeColor={themeColor} ornamentId={ornamentId} content={content} />;
    default:
      return <TwinArchesFloralVariant themeColor={themeColor} ornamentId={ornamentId} content={content} />;
  }
}
