import React from "react";
import { SvgAssetProps } from "../types";

export const PalaceCrownEmblem: React.FC<SvgAssetProps> = ({
  size = 48,
  color = "#D4AF37",
  secondaryColor = "#7A1C28",
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
    {/* Crimson Velvet Roundel */}
    <circle cx="32" cy="32" r="26" fill={secondaryColor} />
    <circle cx="32" cy="32" r="22" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" />

    {/* Keraton Gold Crown */}
    <path
      d="M18 38 L16 26 L24 30 L32 20 L40 30 L48 26 L46 38 Z"
      fill={color}
    />
    <circle cx="32" cy="20" r="2" fill="#FFF8DC" />
  </svg>
);
