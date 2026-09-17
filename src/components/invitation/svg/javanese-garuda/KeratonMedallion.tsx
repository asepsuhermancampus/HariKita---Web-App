import React from "react";
import { SvgAssetProps } from "../types";

export const KeratonMedallion: React.FC<SvgAssetProps> = ({
  size = 48,
  color = "#D4AF37",
  secondaryColor = "#8F6B1E",
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
    {/* Sunburst Keraton Prada Medallion */}
    <circle cx="32" cy="32" r="26" fill={color} />
    <circle cx="32" cy="32" r="22" stroke={secondaryColor} strokeWidth="1.5" strokeDasharray="5 3" />
    <circle cx="32" cy="32" r="16" fill="#1A1208" />

    {/* Center Garuda Emblem */}
    <path d="M32 22 L38 36 L26 36 Z" fill={color} />
    <circle cx="32" cy="30" r="2" fill="#FFEAA7" />
  </svg>
);
