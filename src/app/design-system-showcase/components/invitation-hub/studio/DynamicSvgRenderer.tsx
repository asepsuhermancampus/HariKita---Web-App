'use client';

import React, { useState, useEffect } from 'react';
import { HariKitaAsset } from '@/types/harikita-asset';
import { cn } from '@/lib/utils';

// Global memory cache for fetched and normalized SVG strings
const normalizedSvgCache: Record<string, string> = {};

/**
 * Normalizes SVG strings by replacing hardcoded strokes and fills with 'currentColor'
 * while preserving fill="none" and url(...) references.
 */
export function normalizeSvgString(rawSvg: string): string {
  if (!rawSvg) return '';

  return rawSvg
    // Replace stroke="..." when not "none" or "transparent"
    .replace(/\bstroke=["'](?!none|transparent|url)([^"']+)["']/gi, 'stroke="currentColor"')
    // Replace fill="..." when not "none" or "transparent" or "url(...)"
    .replace(/\bfill=["'](?!none|transparent|url)([^"']+)["']/gi, 'fill="currentColor"')
    // Replace inline style fill: #... or stroke: #...
    .replace(/style=["']([^"']*)["']/gi, (match, styleContent) => {
      const cleaned = styleContent
        .replace(/stroke\s*:\s*(?!none|transparent)[^;]+/gi, 'stroke: currentColor')
        .replace(/fill\s*:\s*(?!none|transparent)[^;]+/gi, 'fill: currentColor');
      return `style="${cleaned}"`;
    });
}

interface DynamicSvgRendererProps {
  asset?: HariKitaAsset | null;
  assetPath?: string;
  color?: string; // hex color or CSS color
  colorClass?: string; // tailwind color class
  className?: string;
  style?: React.CSSProperties;
}

export function DynamicSvgRenderer({
  asset,
  assetPath,
  color,
  colorClass,
  className,
  style,
}: DynamicSvgRendererProps) {
  const filePath = asset?.filePath || assetPath || '';
  const isWebp = asset?.format === 'webp' || filePath.endsWith('.webp');
  const src = filePath ? `/${filePath.replace(/^\//, '')}` : '';

  const [svgContent, setSvgContent] = useState<string | null>(
    normalizedSvgCache[filePath] || null
  );
  const [isLoading, setIsLoading] = useState<boolean>(!normalizedSvgCache[filePath] && !isWebp && !!filePath);

  useEffect(() => {
    if (!filePath || isWebp) return;
    if (normalizedSvgCache[filePath]) {
      setSvgContent(normalizedSvgCache[filePath]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((raw) => {
        if (isMounted) {
          const normalized = normalizeSvgString(raw);
          normalizedSvgCache[filePath] = normalized;
          setSvgContent(normalized);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to load SVG for DynamicSvgRenderer:', src, err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [filePath, isWebp, src]);

  if (!filePath) {
    return null;
  }

  if (isWebp) {
    return (
      <img
        src={src}
        alt={asset?.name || 'HariKita Texture'}
        className={cn('h-full w-full object-cover', className)}
        style={style}
        loading="lazy"
      />
    );
  }

  if (isLoading || !svgContent) {
    return (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center opacity-40',
          className
        )}
        style={{ color: color || undefined, ...style }}
      >
        <div className="h-4 w-4 animate-spin rounded-full border border-current border-t-transparent" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center transition-colors duration-200',
        '[&>svg]:h-full [&>svg]:w-full [&>svg]:max-h-full [&>svg]:max-w-full [&>svg]:object-contain',
        '[&_path]:transition-colors [&_circle]:transition-colors [&_rect]:transition-colors',
        '[&_path]:stroke-current [&_circle]:stroke-current [&_rect]:stroke-current [&_line]:stroke-current [&_polyline]:stroke-current',
        colorClass,
        className
      )}
      style={{
        color: color || undefined,
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
