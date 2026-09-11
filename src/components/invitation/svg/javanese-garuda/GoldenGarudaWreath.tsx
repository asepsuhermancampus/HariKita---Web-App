import React from "react";
import { SvgAssetProps } from "../types";

export const GoldenGarudaWreath: React.FC<SvgAssetProps> = ({
  size = 140,
  color = "#D4AF37",
  secondaryColor = "#8F6B1E",
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
    {/* Concentric Golden Garuda Aura Rings */}
    <circle cx="100" cy="100" r="82" stroke={color} strokeWidth="1.5" strokeDasharray="8 4" opacity="0.65" />
    <circle cx="100" cy="100" r="74" stroke={secondaryColor} strokeWidth="0.8" opacity="0.4" />

    {/* Golden Garuda Wings Outstretched at Zenith */}
    <g transform="translate(100, 20)" fill={color}>
      <path d="M0 0 C-12 -12, -26 -10, -32 -4 C-20 -2, -10 6, 0 10 C10 6, 20 -2, 32 -4 C26 -10, 12 -12, 0 0 Z" />
      <circle cx="0" cy="0" r="3" fill="#FFEAA7" />
    </g>

    {/* Flared Wing Feathers Around Perimeter */}
    <g fill={color} opacity="0.85">
      <path d="M182 100 C172 90, 160 96, 160 106 C170 106, 178 104, 182 100 Z" />
      <path d="M100 182 C90 172, 96 160, 106 160 C106 170, 104 178, 100 182 Z" />
      <path d="M18 100 C28 90, 40 96, 40 106 C30 106, 22 104, 18 100 Z" />
    </g>

    {/* Golden Sun Embers */}
    <circle cx="140" cy="45" r="3.5" fill="#FFEAA7" />
    <circle cx="60" cy="45" r="3.5" fill="#FFEAA7" />
    <circle cx="155" cy="155" r="3.5" fill="#FFEAA7" />
    <circle cx="45" cy="155" r="3.5" fill="#FFEAA7" />
  </svg>
);
