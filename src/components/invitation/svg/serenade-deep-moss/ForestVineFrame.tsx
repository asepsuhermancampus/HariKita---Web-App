import React from "react";
import { SvgAssetProps } from "../types";

export const ForestVineFrame: React.FC<SvgAssetProps> = ({
  size = 280,
  color = "#2D4A3E",
  secondaryColor = "#4D7358",
  className = "",
  ...props
}) => (
  <svg
    viewBox="0 0 240 320"
    width={size}
    height={(size as number) * (320 / 240)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Interlocking Moss Forest Border */}
    <rect
      x="12"
      y="12"
      width="216"
      height="296"
      rx="16"
      stroke={color}
      strokeWidth="1.2"
      opacity="0.4"
    />
    <rect
      x="18"
      y="18"
      width="204"
      height="284"
      rx="12"
      stroke={secondaryColor}
      strokeWidth="0.8"
      strokeDasharray="8 4"
      opacity="0.3"
    />

    {/* Top Left Fern Sprout Corner */}
    <g transform="translate(18, 18)" fill={color} opacity="0.8">
      <path d="M0 0 C6 12, 16 16, 22 14 C16 8, 8 4, 0 0 Z" />
      <circle cx="18" cy="18" r="2.5" fill={secondaryColor} />
    </g>

    {/* Bottom Right Fern Sprout Corner */}
    <g transform="translate(222, 302) rotate(180)" fill={color} opacity="0.8">
      <path d="M0 0 C6 12, 16 16, 22 14 C16 8, 8 4, 0 0 Z" />
      <circle cx="18" cy="18" r="2.5" fill={secondaryColor} />
    </g>
  </svg>
);
