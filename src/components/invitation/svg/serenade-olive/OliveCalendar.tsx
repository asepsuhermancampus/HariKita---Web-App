import React from "react";
import { SvgAssetProps } from "../types";

export const OliveCalendar: React.FC<SvgAssetProps> = ({
  size = 28,
  color = "#6E7A55",
  secondaryColor = "#3A4527",
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
    {/* Clean Parchment Calendar Box */}
    <rect
      x="5"
      y="7"
      width="22"
      height="20"
      rx="3"
      stroke={color}
      strokeWidth="1.5"
      fill="#FBFBF7"
    />
    <path d="M5 13 L27 13" stroke={color} strokeWidth="1" />

    {/* Olive Leaf Hanging Pins */}
    <rect x="9" y="4" width="2" height="4" rx="1" fill={secondaryColor} />
    <rect x="21" y="4" width="2" height="4" rx="1" fill={secondaryColor} />

    {/* Tiny Olive Sprig in Body */}
    <ellipse cx="16" cy="20" rx="2.5" ry="3.5" fill={color} />
    <path d="M16 17 C18 15, 20 16, 21 18" stroke={secondaryColor} strokeWidth="1" strokeLinecap="round" />
  </svg>
);
