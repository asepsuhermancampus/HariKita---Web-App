import React from "react";
import { SvgAssetProps } from "../types";

export const PressedFlowerDivider: React.FC<SvgAssetProps> = ({
  size = "100%",
  color = "#5C6F57",
  secondaryColor = "#B85D3B",
  className = "",
  ...props
}) => (
  <svg
    viewBox="0 0 300 24"
    width={size}
    height={24}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Left Hairline Rule */}
    <line x1="20" y1="12" x2="125" y2="12" stroke={color} strokeWidth="0.8" opacity="0.4" strokeDasharray="3 4" />
    {/* Center Botanical Pressed Flora Motif */}
    <g transform="translate(150, 12)">
      <circle cx="0" cy="0" r="3.5" fill={secondaryColor} opacity="0.9" />
      <path d="M-10 0 C-7 -4, -4 -6, 0 -3 C4 -6, 7 -4, 10 0 C7 4, 4 6, 0 3 C-4 6, -7 4, -10 0 Z" fill={color} opacity="0.6" />
      <circle cx="-16" cy="0" r="1.5" fill={color} opacity="0.5" />
      <circle cx="16" cy="0" r="1.5" fill={color} opacity="0.5" />
    </g>
    {/* Right Hairline Rule */}
    <line x1="175" y1="12" x2="280" y2="12" stroke={color} strokeWidth="0.8" opacity="0.4" strokeDasharray="3 4" />
  </svg>
);
