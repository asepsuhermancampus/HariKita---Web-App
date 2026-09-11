import React from "react";
import { SvgAssetProps } from "../types";

export const TeakCarvedDivider: React.FC<SvgAssetProps> = ({
  size = 180,
  color = "#8A5A36",
  secondaryColor = "#4A2E1B",
  className = "",
  ...props
}) => (
  <svg
    viewBox="0 0 240 28"
    width={size}
    height={(size as number) * (28 / 240)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Teak Wood Carved Beam */}
    <path
      d="M15 14 L85 14 M155 14 L225 14"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.6"
    />

    {/* Center Carved Floral Medallion */}
    <g transform="translate(120, 14)">
      <circle cx="0" cy="0" r="6" fill={color} />
      <circle cx="0" cy="0" r="3" fill="#D4AF37" />
      <path d="M-10 0 C-6 -6, 6 -6, 10 0 C6 6, -6 6, -10 0 Z" stroke={secondaryColor} strokeWidth="1" fill="none" />
    </g>
  </svg>
);
