import React from "react";
import { SvgAssetProps } from "../types";

export const CarvedScrollDivider: React.FC<SvgAssetProps> = ({
  size = 180,
  color = "#D4AF37",
  secondaryColor = "#2A4B7C",
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
    {/* Azure Blue Ribbon Line */}
    <path
      d="M15 14 L85 14 M155 14 L225 14"
      stroke={secondaryColor}
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.6"
    />

    {/* Center Carved Serat Scroll in Gold */}
    <g transform="translate(120, 14)">
      <path
        d="M-18 -4 C-10 -10, 10 -10, 18 -4 C14 2, 8 4, 0 4 C-8 4, -14 2, -18 -4 Z"
        fill={color}
      />
      <circle cx="0" cy="-2" r="2.5" fill={secondaryColor} />
      <circle cx="-20" cy="-4" r="1.5" fill={color} />
      <circle cx="20" cy="-4" r="1.5" fill={color} />
    </g>
  </svg>
);
