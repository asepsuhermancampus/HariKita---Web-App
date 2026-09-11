import React from "react";
import { SvgAssetProps } from "../types";

export const GarudaWingFrame: React.FC<SvgAssetProps> = ({
  size = 280,
  color = "#D4AF37",
  secondaryColor = "#8F6B1E",
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
    {/* Stately Royal Prada Border */}
    <rect
      x="14"
      y="14"
      width="212"
      height="292"
      rx="16"
      stroke={color}
      strokeWidth="1.5"
      opacity="0.6"
    />
    <rect
      x="20"
      y="20"
      width="200"
      height="280"
      rx="12"
      stroke={secondaryColor}
      strokeWidth="0.8"
      strokeDasharray="6 4"
      opacity="0.5"
    />

    {/* Top Left Garuda Wing Corner */}
    <g transform="translate(20, 20)" fill={color}>
      <path d="M0 0 C6 14, 18 16, 24 12 C16 8, 8 4, 0 0 Z" />
      <circle cx="8" cy="8" r="2" fill="#FFEAA7" />
    </g>

    {/* Bottom Right Garuda Wing Corner */}
    <g transform="translate(220, 300) rotate(180)" fill={color}>
      <path d="M0 0 C6 14, 18 16, 24 12 C16 8, 8 4, 0 0 Z" />
      <circle cx="8" cy="8" r="2" fill="#FFEAA7" />
    </g>
  </svg>
);
