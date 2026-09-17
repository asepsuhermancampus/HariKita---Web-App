import React from "react";
import { SvgAssetProps } from "../types";

export const AzuriteCloudWreath: React.FC<SvgAssetProps> = ({
  size = 140,
  color = "#D4AF37",
  secondaryColor = "#2A4B7C",
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
    {/* Concentric Azure & Gold Filigree Rings */}
    <circle cx="100" cy="100" r="82" stroke={secondaryColor} strokeWidth="1.5" strokeDasharray="5 7" opacity="0.6" />
    <circle cx="100" cy="100" r="75" stroke={color} strokeWidth="1" opacity="0.45" />

    {/* Javanese Cloud Ornaments (Wadasan / Megamendung Keraton) */}
    <g fill={color} opacity="0.85">
      {/* Top Cloud Swirl */}
      <path d="M100 16 C110 12, 122 18, 120 26 C114 30, 106 28, 100 24 C94 28, 86 30, 80 26 C78 18, 90 12, 100 16 Z" />

      {/* East Cloud */}
      <path d="M184 100 C188 110, 182 122, 174 120 C170 114, 172 106, 176 100 C172 94, 170 86, 174 80 C182 78, 188 90, 184 100 Z" />

      {/* South Cloud */}
      <path d="M100 184 C110 188, 122 182, 120 174 C114 170, 106 172, 100 176 C94 172, 86 170, 80 174 C78 182, 90 188, 100 184 Z" />

      {/* West Cloud */}
      <path d="M16 100 C12 90, 18 78, 26 80 C30 86, 28 94, 24 100 C28 106, 30 114, 26 120 C18 122, 12 110, 16 100 Z" />
    </g>

    {/* Azure Sapphire Dots */}
    <circle cx="140" cy="45" r="3.5" fill={secondaryColor} />
    <circle cx="60" cy="45" r="3.5" fill={secondaryColor} />
    <circle cx="155" cy="155" r="3.5" fill={secondaryColor} />
    <circle cx="45" cy="155" r="3.5" fill={secondaryColor} />
  </svg>
);
