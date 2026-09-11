import React from "react";
import { SvgAssetProps } from "../types";

export const GoldenParangDivider: React.FC<SvgAssetProps> = ({
  size = 180,
  color = "#D4AF37",
  secondaryColor = "#8F6B1E",
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
    {/* Golden Prada Ray Line */}
    <path
      d="M15 14 L85 14 M155 14 L225 14"
      stroke={color}
      strokeWidth="1.4"
      strokeLinecap="round"
      opacity="0.6"
    />

    {/* Center Garuda Wing Silhouette */}
    <g transform="translate(120, 14)" fill={color}>
      <path d="M0 0 C-6 -8, -14 -8, -18 -4 C-12 0, -6 0, 0 2 C6 0, 12 0, 18 -4 C14 -8, 6 -8, 0 0 Z" />
      <circle cx="0" cy="1" r="2.5" fill="#FFEAA7" />
    </g>
  </svg>
);
