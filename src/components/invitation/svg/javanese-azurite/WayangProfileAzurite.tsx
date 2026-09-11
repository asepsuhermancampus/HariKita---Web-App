import React from "react";
import { SvgAssetProps } from "../types";

export const WayangProfileAzurite: React.FC<SvgAssetProps> = ({
  size = 54,
  color = "#D4AF37",
  secondaryColor = "#2A4B7C",
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
    {/* Wayang Profile Silhouette in Azurite & Gold */}
    <path
      d="M32 8 C38 8, 44 14, 42 22 C48 20, 52 24, 50 30 C46 32, 42 28, 40 28 C38 34, 30 38, 26 44 L28 54 L22 54 L22 42 C20 36, 16 32, 18 24 C20 16, 26 8, 32 8 Z"
      fill={secondaryColor}
      opacity="0.85"
    />
    <path
      d="M34 12 C36 12, 38 15, 37 18 C35 17, 33 15, 34 12 Z"
      fill={color}
    />
    {/* Gold Gelung Earring Dot */}
    <circle cx="28" cy="24" r="2" fill={color} />
  </svg>
);
