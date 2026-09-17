import React from "react";
import { SvgAssetProps } from "../types";

export const MoonFlowerEmblem: React.FC<SvgAssetProps> = ({
  size = 48,
  color = "#5F7482",
  secondaryColor = "#9FB1BD",
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
    {/* Crescent Moon Arc */}
    <path
      d="M36 8 C22 10, 12 22, 14 36 C16 48, 28 58, 42 56 C32 52, 24 42, 26 30 C28 18, 38 12, 36 8 Z"
      fill={secondaryColor}
      opacity="0.85"
    />

    {/* Star Bloom Inside Crescent */}
    <g transform="translate(36, 32)">
      <circle cx="0" cy="0" r="3.5" fill={color} />
      <path d="M0 -8 L2 -3 L7 0 L2 3 L0 8 L-2 3 L-7 0 L-2 -3 Z" fill="#EBF3F7" opacity="0.9" />
      <circle cx="0" cy="0" r="1.5" fill="#FFF" />
    </g>
  </svg>
);
