import React from "react";
import { SvgAssetProps } from "../types";

export const TerracottaArchFrame: React.FC<SvgAssetProps> = ({
  size = 280,
  color = "#B85D3B",
  secondaryColor = "#D98A6C",
  className = "",
  ...props
}) => (
  <svg
    viewBox="0 0 240 320"
    width={size}
    height={(size as number) * (320 / 240)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Adobe Arch Outer Frame */}
    <path
      d="M18 300 L18 110 C18 50, 60 14, 120 14 C180 14, 222 50, 222 110 L222 300"
      stroke={color}
      strokeWidth="1.2"
      opacity="0.45"
      strokeLinecap="round"
    />
    <path
      d="M24 300 L24 112 C24 56, 64 22, 120 22 C176 22, 216 56, 216 112 L216 300"
      stroke={secondaryColor}
      strokeWidth="0.8"
      strokeDasharray="6 4"
      opacity="0.35"
    />

    {/* Sun Motif at Apex */}
    <g transform="translate(120, 14)">
      <circle cx="0" cy="0" r="4" fill={color} />
      <circle cx="0" cy="0" r="1.5" fill="#FFEAE2" />
    </g>
  </svg>
);
