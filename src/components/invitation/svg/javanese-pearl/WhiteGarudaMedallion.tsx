import React from "react";
import { SvgAssetProps } from "../types";

export const WhiteGarudaMedallion: React.FC<SvgAssetProps> = ({
  size = 48,
  color = "#D4AF37",
  secondaryColor = "#FDFCF7",
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
    {/* Iridescent White Pearl Medallion */}
    <circle cx="32" cy="32" r="26" fill={secondaryColor} stroke={color} strokeWidth="1.2" />
    <circle cx="32" cy="32" r="22" stroke={color} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />

    {/* Center Sacred White Garuda Silhouette with Gold Accents */}
    <path d="M32 20 L38 34 L26 34 Z" fill={color} />
    <circle cx="32" cy="32" r="3" fill={secondaryColor} stroke={color} strokeWidth="0.8" />
  </svg>
);
