import React from "react";
import { SvgAssetProps } from "../types";

export const AzuriteCalendar: React.FC<SvgAssetProps> = ({
  size = 28,
  color = "#D4AF37",
  secondaryColor = "#2A4B7C",
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
    {/* Azurite Blue Calendar */}
    <rect
      x="5"
      y="7"
      width="22"
      height="20"
      rx="3"
      stroke={secondaryColor}
      strokeWidth="1.5"
      fill="#0F1A2C"
    />
    <path d="M5 13 L27 13" stroke={color} strokeWidth="1" />

    {/* Gold Loops */}
    <rect x="9" y="4" width="2" height="4" rx="1" fill={color} />
    <rect x="21" y="4" width="2" height="4" rx="1" fill={color} />

    {/* Center Cloud Motif */}
    <circle cx="16" cy="20" r="3" fill={color} opacity="0.9" />
  </svg>
);
