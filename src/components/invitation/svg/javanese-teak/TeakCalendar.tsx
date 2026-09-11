import React from "react";
import { SvgAssetProps } from "../types";

export const TeakCalendar: React.FC<SvgAssetProps> = ({
  size = 28,
  color = "#8A5A36",
  secondaryColor = "#4A2E1B",
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
    {/* Teak Carved Calendar */}
    <rect
      x="5"
      y="7"
      width="22"
      height="20"
      rx="2"
      stroke={color}
      strokeWidth="1.5"
      fill="#21150C"
    />
    <path d="M5 13 L27 13" stroke={color} strokeWidth="1" />

    {/* Wooden Hanging Pegs */}
    <rect x="9" y="4" width="2" height="4" rx="1" fill={secondaryColor} />
    <rect x="21" y="4" width="2" height="4" rx="1" fill={secondaryColor} />

    {/* Wood Grain Motif */}
    <ellipse cx="16" cy="20" rx="3" ry="2" fill="#D4AF37" opacity="0.8" />
  </svg>
);
