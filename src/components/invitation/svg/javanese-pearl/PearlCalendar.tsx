import React from "react";
import { SvgAssetProps } from "../types";

export const PearlCalendar: React.FC<SvgAssetProps> = ({
  size = 28,
  color = "#D4AF37",
  secondaryColor = "#FDFCF7",
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
    {/* White Pearl Silk Calendar */}
    <rect
      x="5"
      y="7"
      width="22"
      height="20"
      rx="3"
      stroke={color}
      strokeWidth="1.2"
      fill={secondaryColor}
    />
    <path d="M5 13 L27 13" stroke={color} strokeWidth="1" />

    {/* Loops */}
    <rect x="9" y="4" width="2" height="4" rx="1" fill={color} />
    <rect x="21" y="4" width="2" height="4" rx="1" fill={color} />

    {/* Center Pearl Motif */}
    <circle cx="16" cy="20" r="3" fill="#FFFFFF" stroke={color} strokeWidth="0.8" />
    <circle cx="16" cy="20" r="1" fill="#FFEAA7" />
  </svg>
);
