import React from "react";
import { SvgAssetProps } from "../types";

export const MediterraneanArchFrame: React.FC<SvgAssetProps> = ({
  size = 280,
  color = "#6E7A55",
  secondaryColor = "#3A4527",
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
    {/* Roman Arch Outline */}
    <path
      d="M20 300 L20 120 C20 55, 60 15, 120 15 C180 15, 220 55, 220 120 L220 300"
      stroke={color}
      strokeWidth="1.2"
      opacity="0.4"
      strokeLinecap="round"
    />
    <path
      d="M26 300 L26 122 C26 62, 64 23, 120 23 C176 23, 214 62, 214 122 L214 300"
      stroke={color}
      strokeWidth="0.75"
      strokeDasharray="4 4"
      opacity="0.3"
    />

    {/* Olive Crown at Arch Apex */}
    <g transform="translate(120, 15)">
      <path d="M0 0 C-10 -8, -24 -4, -26 2 C-18 4, -8 0, 0 0 Z" fill={color} opacity="0.8" />
      <path d="M0 0 C10 -8, 24 -4, 26 2 C18 4, 8 0, 0 0 Z" fill={color} opacity="0.8" />
      <circle cx="0" cy="4" r="2.5" fill={secondaryColor} />
    </g>
  </svg>
);
