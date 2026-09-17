import React from "react";
import { SvgAssetProps } from "../types";

export const FiorellaCalendar: React.FC<SvgAssetProps> = ({
  size = 28,
  color = "#D47385",
  secondaryColor = "#8EA881",
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
    {/* Calendar Body */}
    <rect
      x="5"
      y="7"
      width="22"
      height="20"
      rx="4"
      stroke={color}
      strokeWidth="1.5"
      fill="#FFFBF9"
    />
    <path d="M5 13 L27 13" stroke={color} strokeWidth="1" />

    {/* Hanging Loops */}
    <rect x="9" y="4" width="2" height="4" rx="1" fill={secondaryColor} />
    <rect x="21" y="4" width="2" height="4" rx="1" fill={secondaryColor} />

    {/* Center Blossom Icon */}
    <circle cx="16" cy="20" r="3" fill={color} opacity="0.85" />
    <circle cx="16" cy="20" r="1.2" fill="#FFE59E" />
  </svg>
);
