import React from "react";
import { SvgAssetProps } from "../types";

export const CelestialLeafDivider: React.FC<SvgAssetProps> = ({
  size = 180,
  color = "#5F7482",
  secondaryColor = "#9FB1BD",
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
    {/* Silver Horizon Line */}
    <path
      d="M15 12 L90 12 M150 12 L225 12"
      stroke={color}
      strokeWidth="0.8"
      strokeDasharray="4 2"
      opacity="0.4"
    />

    {/* Center Star Botanical Cluster */}
    <g transform="translate(120, 12)">
      <path d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z" fill="#EBF3F7" />
      <path d="M0 0 C-4 -6, -12 -6, -15 -2 C-10 0, -4 0, 0 0 Z" fill={color} opacity="0.8" />
      <path d="M0 0 C4 -6, 12 -6, 15 -2 C10 0, 4 0, 0 0 Z" fill={color} opacity="0.8" />
      <circle cx="-16" cy="-2" r="1.2" fill={secondaryColor} />
      <circle cx="16" cy="-2" r="1.2" fill={secondaryColor} />
    </g>
  </svg>
);
