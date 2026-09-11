import React from "react";
import { SvgAssetProps } from "../types";

export const SunBotanicalEmblem: React.FC<SvgAssetProps> = ({
  size = 48,
  color = "#B85D3B",
  secondaryColor = "#D98A6C",
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
    {/* Terracotta Sunburst */}
    <circle cx="32" cy="32" r="14" fill={color} />
    <circle cx="32" cy="32" r="8" fill={secondaryColor} />
    <circle cx="32" cy="32" r="3" fill="#FFF5F0" />

    {/* Sun Ray Leaves */}
    <g fill={color} opacity="0.8">
      <path d="M32 8 C33 12, 33 16, 32 16 C31 16, 31 12, 32 8 Z" />
      <path d="M32 48 C33 52, 33 56, 32 56 C31 56, 31 52, 32 48 Z" />
      <path d="M8 32 C12 33, 16 33, 16 32 C16 31, 12 31, 8 32 Z" />
      <path d="M48 32 C52 33, 56 33, 56 32 C56 31, 52 31, 48 32 Z" />
    </g>
  </svg>
);
