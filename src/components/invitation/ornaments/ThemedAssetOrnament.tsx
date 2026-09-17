// src/components/invitation/ornaments/ThemedAssetOrnament.tsx
"use client";

import React from "react";

export interface ThemedAssetOrnamentProps {
  src?: string;
  alt?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  tintColor?: string;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  opacity?: number;
  style?: React.CSSProperties;
}

/**
 * Universal Vector SVG Asset Renderer for HariKita Invitation Themes
 * Ensures zero CLS, instant browser caching, and graceful silent fallback.
 */
export const ThemedAssetOrnament: React.FC<ThemedAssetOrnamentProps> = ({
  src,
  alt = "HariKita Theme Ornament",
  className = "",
  width,
  height,
  priority = false,
  tintColor,
  flipHorizontal = false,
  flipVertical = false,
  opacity,
  style = {},
}) => {
  if (!src) return null;

  const transformParts: string[] = [];
  if (flipHorizontal) transformParts.push("scaleX(-1)");
  if (flipVertical) transformParts.push("scaleY(-1)");

  const combinedStyle: React.CSSProperties = {
    ...style,
    ...(opacity !== undefined ? { opacity } : {}),
    ...(transformParts.length > 0 ? { transform: transformParts.join(" ") } : {}),
    ...(tintColor ? { filter: `drop-shadow(0 0 0 ${tintColor})` } : {}),
  };

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      className={`select-none pointer-events-none transition-opacity duration-300 ${className}`}
      style={combinedStyle}
    />
  );
};
