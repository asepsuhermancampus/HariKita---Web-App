"use client";

import React from "react";
import { DedicatedTemplateProps, GalleryStyleId } from "@/lib/templates/types";
import { Gallery_MasonryStaggered } from "./Gallery_MasonryStaggered";
import { Gallery_FilmRollCarousel } from "./Gallery_FilmRollCarousel";
import { Gallery_MosaicHero } from "./Gallery_MosaicHero";
import { Gallery_PolaroidScatter } from "./Gallery_PolaroidScatter";

export const GallerySectionDispatcher: React.FC<{
  photos: string[];
  theme: DedicatedTemplateProps["theme"];
}> = ({ photos, theme }) => {
  let style: GalleryStyleId = theme?.sectionConfig?.galleryStyle || "masonry-staggered";

  if (!theme?.sectionConfig?.galleryStyle) {
    const arch = theme?.archetypeId || "botanical";
    if (arch.includes("celestial") || arch.includes("prewed")) {
      style = "film-roll-carousel";
    } else if (arch.includes("cute") || arch.includes("family")) {
      style = "polaroid-scatter";
    } else if (arch.includes("minimalist") || arch.includes("royal") || arch.includes("rose-gold")) {
      style = "mosaic-hero";
    } else {
      style = "masonry-staggered";
    }
  }

  switch (style) {
    case "film-roll-carousel":
      return <Gallery_FilmRollCarousel photos={photos} themePrimary={theme?.colors?.primary} />;
    case "mosaic-hero":
      return <Gallery_MosaicHero photos={photos} themePrimary={theme?.colors?.primary} />;
    case "polaroid-scatter":
      return <Gallery_PolaroidScatter photos={photos} themePrimary={theme?.colors?.primary} />;
    case "masonry-staggered":
    default:
      return <Gallery_MasonryStaggered photos={photos} themePrimary={theme?.colors?.primary} />;
  }
};
