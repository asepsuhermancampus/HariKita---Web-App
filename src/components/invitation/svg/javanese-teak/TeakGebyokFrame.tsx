import React from "react";
import { SvgAssetProps } from "../types";

export const TeakGebyokFrame: React.FC<SvgAssetProps> = ({
  size = 280,
  color = "#8A5A36",
  secondaryColor = "#4A2E1B",
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
    {/* Solid Teak Frame Border */}
    <rect
      x="12"
      y="12"
      width="216"
      height="296"
      rx="10"
      stroke={color}
      strokeWidth="2"
      opacity="0.65"
    />
    <rect
      x="18"
      y="18"
      width="204"
      height="284"
      rx="6"
      stroke={secondaryColor}
      strokeWidth="1"
      strokeDasharray="6 4"
      opacity="0.45"
    />

    {/* Top Carved Gebyok Crest */}
    <g transform="translate(120, 18)" fill={color}>
      <path d="M-20 0 C-10 -12, 10 -12, 20 0 Z" />
      <circle cx="0" cy="-4" r="2.5" fill="#D4AF37" />
    </g>
  </svg>
);
