import React from "react";
import { SvgAssetProps } from "../types";

export const RoyalPradaDivider: React.FC<SvgAssetProps> = ({
  size = 180,
  color = "#D4AF37",
  secondaryColor = "#EFEBE4",
  className = "",
  ...props
}) => (
  <svg
    viewBox="0 0 240 28"
    width={size}
    height={(size as number) * (28 / 240)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Prada Gold Slender Cord */}
    <path
      d="M15 14 L85 14 M155 14 L225 14"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.65"
    />

    {/* Center Mori Ivory & Prada Petal Medallion */}
    <g transform="translate(120, 14)">
      <circle cx="0" cy="0" r="6" fill={secondaryColor} stroke={color} strokeWidth="1" />
      <circle cx="0" cy="0" r="3" fill={color} />
      <circle cx="-16" cy="0" r="1.5" fill={color} />
      <circle cx="16" cy="0" r="1.5" fill={color} />
    </g>
  </svg>
);
