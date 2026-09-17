import React from "react";
import { SvgAssetProps } from "../types";

export const RoyalBatikDivider: React.FC<SvgAssetProps> = ({
  size = 180,
  color = "#D4AF37",
  secondaryColor = "#7A1C28",
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
    {/* Crimson Velvet Border Line */}
    <path
      d="M15 14 L85 14 M155 14 L225 14"
      stroke={secondaryColor}
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.85"
    />

    {/* Center Gold Paes Motif */}
    <g transform="translate(120, 14)">
      <polygon points="0,-8 6,0 0,8 -6,0" fill={color} />
      <circle cx="0" cy="0" r="2" fill="#FFF8E7" />
      <circle cx="-16" cy="0" r="1.5" fill={color} />
      <circle cx="16" cy="0" r="1.5" fill={color} />
    </g>
  </svg>
);
