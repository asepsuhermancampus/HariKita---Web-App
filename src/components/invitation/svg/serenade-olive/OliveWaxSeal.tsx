import React from "react";
import { SvgAssetProps } from "../types";

export const OliveWaxSeal: React.FC<SvgAssetProps> = ({
  size = 48,
  color = "#6E7A55",
  secondaryColor = "#3A4527",
  className = "",
  ...props
}) => (
  <svg
    viewBox="0 0 64 64"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Melted Organic Seal Rim */}
    <path
      d="M32 4 C46 3, 58 14, 59 28 C60 42, 50 56, 36 59 C20 62, 5 50, 4 36 C3 20, 16 5, 32 4 Z"
      fill={color}
      opacity="0.85"
    />
    <circle cx="32" cy="32" r="22" stroke={secondaryColor} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

    {/* Olive Branch Debossed in Center */}
    <g transform="translate(32, 32)" fill="#FFFBF5" opacity="0.9">
      <path d="M-8 6 C-4 -2, 4 -8, 10 -10 C8 -4, 2 4, -8 6 Z" />
      <path d="M-2 -2 C2 -6, 6 -8, 10 -8 C6 -4, 2 0, -2 -2 Z" />
      <circle cx="4" cy="2" r="2" fill="#E8D8B0" />
    </g>
  </svg>
);
