import React from "react";
import { SvgAssetProps } from "../types";

export const AzureParangFrame: React.FC<SvgAssetProps> = ({
  size = 280,
  color = "#D4AF37",
  secondaryColor = "#2A4B7C",
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
    {/* Deep Royal Azure & Prada Frame */}
    <rect
      x="14"
      y="14"
      width="212"
      height="292"
      rx="16"
      stroke={secondaryColor}
      strokeWidth="1.5"
      opacity="0.6"
    />
    <rect
      x="20"
      y="20"
      width="200"
      height="280"
      rx="12"
      stroke={color}
      strokeWidth="0.8"
      strokeDasharray="6 4"
      opacity="0.5"
    />

    {/* Top Left Azure Cloud Corner */}
    <g transform="translate(20, 20)">
      <path d="M0 0 C8 0, 14 6, 14 14 C14 8, 20 4, 28 4" stroke={color} strokeWidth="1.2" fill="none" />
      <circle cx="10" cy="10" r="2.5" fill={color} />
    </g>

    {/* Bottom Right Azure Cloud Corner */}
    <g transform="translate(220, 300) rotate(180)">
      <path d="M0 0 C8 0, 14 6, 14 14 C14 8, 20 4, 28 4" stroke={color} strokeWidth="1.2" fill="none" />
      <circle cx="10" cy="10" r="2.5" fill={color} />
    </g>
  </svg>
);
