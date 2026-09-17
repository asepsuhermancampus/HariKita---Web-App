'use client';

import React from 'react';

interface DynamicTintIconProps {
  src: string;
  color?: string;
  size?: number;
  width?: number | string;
  height?: number | string;
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
}

/**
 * DynamicTintIcon renders any monochrome SVG vector asset using CSS mask-image
 * allowing real-time color tinting without DOM parsing, SVG re-rendering, or XSS risk.
 */
export const DynamicTintIcon: React.FC<DynamicTintIconProps> = React.memo(
  ({
    src,
    color = 'currentColor',
    size,
    width,
    height,
    className = '',
    alt = 'icon',
    style = {},
  }) => {
    // Sanitize source to prevent CSS injection (escape quotes)
    const cleanSrc = src ? src.replace(/["'\\]/g, '') : '';

    const widthVal =
      width !== undefined
        ? typeof width === 'number'
          ? `${width}px`
          : width
        : size !== undefined
        ? `${size}px`
        : '24px';

    const heightVal =
      height !== undefined
        ? typeof height === 'number'
          ? `${height}px`
          : height
        : size !== undefined
        ? `${size}px`
        : '24px';

    const maskStyle: React.CSSProperties = {
      maskImage: `url("${cleanSrc}")`,
      WebkitMaskImage: `url("${cleanSrc}")`,
      maskRepeat: 'no-repeat',
      WebkitMaskRepeat: 'no-repeat',
      maskSize: 'contain',
      WebkitMaskSize: 'contain',
      maskPosition: 'center',
      WebkitMaskPosition: 'center',
      backgroundColor: color,
      width: widthVal,
      height: heightVal,
      ...style,
    };

    return (
      <span
        role="img"
        aria-label={alt}
        className={`inline-block shrink-0 transition-colors duration-200 ${className}`}
        style={maskStyle}
      />
    );
  }
);

DynamicTintIcon.displayName = 'DynamicTintIcon';
