import React from "react";
import { SvgAssetProps } from "../types";

export const KeratonCrownWreath: React.FC<SvgAssetProps> = ({
  size = 140,
  color = "#D4AF37",
  secondaryColor = "#7A5316",
  className = "",
  animated = true,
  ...props
}) => (
  <svg
    viewBox="0 0 200 200"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${animated ? "animate-spin-slow" : ""} ${className}`}
    {...props}
  >
    {/* Concentric Royal Keraton Rings */}
    <circle cx="100" cy="100" r="82" stroke={color} strokeWidth="1.5" strokeDasharray="6 6" opacity="0.5" />
    <circle cx="100" cy="100" r="74" stroke={secondaryColor} strokeWidth="0.8" opacity="0.35" />

    {/* Royal Keraton Crown at Zenith */}
    <g transform="translate(100, 18)" fill={color}>
      <path d="M-14 12 L-18 -2 L-8 4 L0 -8 L8 4 L18 -2 L14 12 Z" />
      <circle cx="0" cy="-8" r="2.5" fill="#FFEAA7" />
      <circle cx="-18" cy="-2" r="1.8" fill="#FFEAA7" />
      <circle cx="18" cy="-2" r="1.8" fill="#FFEAA7" />
    </g>

    {/* Parang Barong Curving Ornaments */}
    <g fill={color} opacity="0.85">
      {/* East Flame Ornament */}
      <path d="M182 100 C174 92, 166 92, 164 100 C166 108, 174 108, 182 100 Z" />
      <path d="M172 112 C168 118, 160 120, 154 116 C158 110, 166 108, 172 112 Z" />

      {/* South Gunungan Peak Accent */}
      <path d="M100 184 L108 170 L92 170 Z" />

      {/* West Flame Ornament */}
      <path d="M18 100 C26 92, 34 92, 36 100 C34 108, 26 108, 18 100 Z" />
      <path d="M28 112 C32 118, 40 120, 46 116 C42 110, 34 108, 28 112 Z" />
    </g>

    {/* Golden Prada Jewels */}
    <circle cx="140" cy="45" r="3" fill="#FFEAA7" />
    <circle cx="60" cy="45" r="3" fill="#FFEAA7" />
    <circle cx="160" cy="150" r="3" fill="#FFEAA7" />
    <circle cx="40" cy="150" r="3" fill="#FFEAA7" />
  </svg>
);
