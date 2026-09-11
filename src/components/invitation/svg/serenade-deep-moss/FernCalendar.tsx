import React from "react";
import { SvgAssetProps } from "../types";

export const FernCalendar: React.FC<SvgAssetProps> = ({
  size = 28,
  color = "#2D4A3E",
  secondaryColor = "#4D7358",
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
    {/* Calendar Box */}
    <rect
      x="5"
      y="7"
      width="22"
      height="20"
      rx="3"
      stroke={color}
      strokeWidth="1.5"
      fill="#F5FAF7"
    />
    <path d="M5 13 L27 13" stroke={color} strokeWidth="1" />

    {/* Loops */}
    <rect x="9" y="4" width="2" height="4" rx="1" fill={secondaryColor} />
    <rect x="21" y="4" width="2" height="4" rx="1" fill={secondaryColor} />

    {/* Center Fern Leaf Motif */}
    <path
      d="M16 16 C14 18, 14 22, 16 24 C18 22, 18 18, 16 16 Z"
      fill={color}
      opacity="0.85"
    />
  </svg>
);
