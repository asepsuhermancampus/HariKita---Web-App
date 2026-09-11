import React from "react";
import { SvgAssetProps } from "../types";

export const OliveLineDivider: React.FC<SvgAssetProps> = ({
  size = 180,
  color = "#6E7A55",
  secondaryColor = "#3A4527",
  className = "",
  ...props
}) => (
  <svg
    viewBox="0 0 240 24"
    width={size}
    height={(size as number) * (24 / 240)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Slender Olive Branch Stem */}
    <path
      d="M15 12 L95 12 M145 12 L225 12"
      stroke={color}
      strokeWidth="0.8"
      strokeLinecap="round"
      opacity="0.4"
    />

    {/* Paired Olive Sprig in Center */}
    <g transform="translate(120, 12)">
      {/* Leaves */}
      <path d="M0 0 C-6 -8, -16 -6, -18 -2 C-12 0, -6 0, 0 0 Z" fill={color} opacity="0.85" />
      <path d="M0 0 C6 -8, 16 -6, 18 -2 C12 0, 6 0, 0 0 Z" fill={color} opacity="0.85" />
      <path d="M0 0 C-4 6, -12 8, -14 6 C-10 4, -4 2, 0 0 Z" fill={color} opacity="0.7" />
      <path d="M0 0 C4 6, 12 8, 14 6 C10 4, 4 2, 0 0 Z" fill={color} opacity="0.7" />

      {/* Ripe Olive Fruit */}
      <ellipse cx="0" cy="5" rx="2.5" ry="3.5" fill={secondaryColor} />
    </g>
  </svg>
);
