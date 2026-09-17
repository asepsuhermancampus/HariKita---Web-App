import React from "react";
import { SvgAssetProps } from "../types";

export const EarthyTerracottaDivider: React.FC<SvgAssetProps> = ({
  size = 180,
  color = "#B85D3B",
  secondaryColor = "#D98A6C",
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
    {/* Earthy Terracotta Horizon Line */}
    <path
      d="M15 12 L90 12 M150 12 L225 12"
      stroke={color}
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.45"
    />

    {/* Center Clay Sun & Poppy Sprig */}
    <g transform="translate(120, 12)">
      <circle cx="0" cy="0" r="5" fill={color} />
      <circle cx="0" cy="0" r="2" fill="#FFEFEA" />
      <path d="M-6 -2 Q-14 -6 -16 0 Q-10 2 -6 -2 Z" fill={secondaryColor} opacity="0.8" />
      <path d="M6 -2 Q14 -6 16 0 Q10 2 6 -2 Z" fill={secondaryColor} opacity="0.8" />
    </g>
  </svg>
);
