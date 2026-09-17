import React from "react";
import { SvgAssetProps } from "../types";

export const RoseCalendar: React.FC<SvgAssetProps> = ({
  size = 28,
  color = "#C08081",
  secondaryColor = "#8C5E58",
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
    {/* Vintage Calendar Sheet */}
    <rect
      x="5"
      y="7"
      width="22"
      height="20"
      rx="3"
      stroke={color}
      strokeWidth="1.5"
      fill="#FFFBFB"
    />
    <path d="M5 13 L27 13" stroke={color} strokeWidth="1" />

    {/* Loops */}
    <rect x="9" y="4" width="2" height="4" rx="1" fill={secondaryColor} />
    <rect x="21" y="4" width="2" height="4" rx="1" fill={secondaryColor} />

    {/* Center Pressed Rose Motif */}
    <circle cx="16" cy="20" r="3" fill={color} opacity="0.85" />
    <circle cx="15.5" cy="19.5" r="1.2" fill="#FFE5E5" />
  </svg>
);
