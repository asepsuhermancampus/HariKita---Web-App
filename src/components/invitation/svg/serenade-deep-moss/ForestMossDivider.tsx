import React from "react";
import { SvgAssetProps } from "../types";

export const ForestMossDivider: React.FC<SvgAssetProps> = ({
  size = 180,
  color = "#2D4A3E",
  secondaryColor = "#4D7358",
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
    {/* Fine Forest Twig Line */}
    <path
      d="M10 12 L90 12 M150 12 L230 12"
      stroke={color}
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.4"
    />

    {/* Center Fern Cluster with Dew Drops */}
    <g transform="translate(120, 12)">
      <path d="M0 0 C-6 -8, -14 -6, -18 -1 C-12 1, -6 1, 0 0 Z" fill={color} opacity="0.85" />
      <path d="M0 0 C6 -8, 14 -6, 18 -1 C12 1, 6 1, 0 0 Z" fill={color} opacity="0.85" />
      <circle cx="-10" cy="-6" r="1.5" fill="#CBE5D6" />
      <circle cx="10" cy="-6" r="1.5" fill="#CBE5D6" />
      <circle cx="0" cy="3" r="2.5" fill={secondaryColor} />
    </g>
  </svg>
);
