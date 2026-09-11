import React from "react";
import { SvgAssetProps } from "../types";

export const KeratonCalendar: React.FC<SvgAssetProps> = ({
  size = 28,
  color = "#D4AF37",
  secondaryColor = "#7A5316",
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
    {/* Keraton Calendar Slate */}
    <rect
      x="5"
      y="7"
      width="22"
      height="20"
      rx="3"
      stroke={color}
      strokeWidth="1.5"
      fill="#2A1B0E"
    />
    <path d="M5 13 L27 13" stroke={color} strokeWidth="1" />

    {/* Loops */}
    <rect x="9" y="4" width="2" height="4" rx="1" fill={color} />
    <rect x="21" y="4" width="2" height="4" rx="1" fill={color} />

    {/* Center Keraton Crown Motif */}
    <path
      d="M13 22 L11 18 L14 19 L16 16 L18 19 L21 18 L19 22 Z"
      fill={color}
    />
  </svg>
);
