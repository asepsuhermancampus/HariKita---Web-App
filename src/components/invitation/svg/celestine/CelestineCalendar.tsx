import React from "react";
import { SvgAssetProps } from "../types";

export const CelestineCalendar: React.FC<SvgAssetProps> = ({
  size = 28,
  color = "#5F7482",
  secondaryColor = "#9FB1BD",
  className = "",
  ...props
}) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Clean Slate Calendar */}
    <rect
      x="5"
      y="7"
      width="22"
      height="20"
      rx="3"
      stroke={color}
      strokeWidth="1.5"
      fill="#F4F8FA"
    />
    <path d="M5 13 L27 13" stroke={color} strokeWidth="1" />

    {/* Loops */}
    <rect x="9" y="4" width="2" height="4" rx="1" fill={secondaryColor} />
    <rect x="21" y="4" width="2" height="4" rx="1" fill={secondaryColor} />

    {/* Center Star Particle */}
    <g transform="translate(16, 20)">
      <path d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z" fill={color} />
      <circle cx="0" cy="0" r="1" fill="#EBF3F7" />
    </g>
  </svg>
);
