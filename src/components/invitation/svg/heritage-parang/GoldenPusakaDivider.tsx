import React from "react";
import { SvgAssetProps } from "../types";

export const GoldenPusakaDivider: React.FC<SvgAssetProps> = ({
  size = 180,
  color = "#D4AF37",
  secondaryColor = "#7A5316",
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
    {/* Prada Gold Line with Carved Knot Ends */}
    <path
      d="M15 14 L85 14 M155 14 L225 14"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.5"
    />

    {/* Center Keraton Pusaka / Keris Luk Silhouette */}
    <g transform="translate(120, 14)">
      {/* Golden Luk Curve */}
      <path
        d="M-12 0 C-6 -8, 6 -8, 12 0 C6 8, -6 8, -12 0 Z"
        fill={color}
      />
      <circle cx="0" cy="0" r="3.5" fill="#FFF2C2" />
      <circle cx="-16" cy="0" r="1.5" fill={color} />
      <circle cx="16" cy="0" r="1.5" fill={color} />
    </g>
  </svg>
);
