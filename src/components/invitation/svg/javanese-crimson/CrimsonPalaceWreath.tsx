import React from "react";
import { SvgAssetProps } from "../types";

export const CrimsonPalaceWreath: React.FC<SvgAssetProps> = ({
  size = 140,
  color = "#D4AF37",
  secondaryColor = "#7A1C28",
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
    {/* Concentric Crimson Velvet & Gold Prada Rings */}
    <circle cx="100" cy="100" r="82" stroke={secondaryColor} strokeWidth="2" strokeDasharray="6 6" opacity="0.8" />
    <circle cx="100" cy="100" r="74" stroke={color} strokeWidth="1.2" opacity="0.55" />

    {/* Crimson Royal Gunungan at Apex */}
    <g transform="translate(100, 18)">
      <path d="M0 -12 L14 10 L-14 10 Z" fill={secondaryColor} stroke={color} strokeWidth="1" />
      <circle cx="0" cy="2" r="3" fill={color} />
    </g>

    {/* Paes Ageng Curved Tendrils */}
    <g fill={color} opacity="0.85">
      <path d="M182 100 C176 90, 166 92, 164 100 C166 108, 176 110, 182 100 Z" />
      <path d="M100 182 C90 176, 92 166, 100 164 C108 166, 110 176, 100 182 Z" />
      <path d="M18 100 C24 90, 34 92, 36 100 C34 108, 24 110, 18 100 Z" />
    </g>

    {/* Golden Prada Pearls */}
    <circle cx="140" cy="45" r="3.5" fill="#FFEAA7" />
    <circle cx="60" cy="45" r="3.5" fill="#FFEAA7" />
    <circle cx="155" cy="155" r="3.5" fill="#FFEAA7" />
    <circle cx="45" cy="155" r="3.5" fill="#FFEAA7" />
  </svg>
);
