import React from "react";
import { SvgAssetProps } from "../types";

export const KebumenWaletEmblem: React.FC<SvgAssetProps> = ({
  size = 54,
  color = "#D4AF37",
  secondaryColor = "#7A5316",
  className = "",
  ...props
}) => (
  <svg
    viewBox="0 0 64 64"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Circular Prada Medallion */}
    <circle cx="32" cy="32" r="26" fill={secondaryColor} opacity="0.85" />
    <circle cx="32" cy="32" r="23" stroke={color} strokeWidth="1.2" strokeDasharray="4 3" />

    {/* Paired Swiftlets in Center */}
    <g transform="translate(18, 18) scale(0.45)" fill={color}>
      <path d="M25 45 C30 25 15 8 5 5 C15 15 32 25 36 32 C42 22 55 12 70 8 C60 18 45 28 38 36 Z" />
      <path d="M36 32 C38 36 40 44 42 55 L38 65 L43 56 L47 62 L44 50 C44 42 40 35 36 32 Z" />
      <circle cx="18" cy="20" r="3" fill="#FAF7F5" />
    </g>
  </svg>
);
