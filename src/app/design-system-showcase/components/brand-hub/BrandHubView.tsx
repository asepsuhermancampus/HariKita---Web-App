'use client';

import React from 'react';
import { PaletteSection } from './PaletteSection';
import { TypographySection } from './TypographySection';
import { CoreAssetsSection } from './CoreAssetsSection';
import { UIComponentsSection } from './UIComponentsSection';
import { MobileBrandSimulator } from './MobileBrandSimulator';

export function BrandHubView() {
  return (
    <div className="space-y-24">
      <PaletteSection />
      <TypographySection />
      <CoreAssetsSection />
      <UIComponentsSection />
      <MobileBrandSimulator />
    </div>
  );
}
