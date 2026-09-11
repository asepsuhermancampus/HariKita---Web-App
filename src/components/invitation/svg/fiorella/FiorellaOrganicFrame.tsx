import React from "react";
import { SvgAssetProps } from "../types";

export const FiorellaOrganicFrame: React.FC<SvgAssetProps> = ({
  size = 280,
  color = "#D47385",
  secondaryColor = "#8EA881",
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
    {/* Soft Curving Meadow Frame */}
    <rect
      x="12"
      y="12"
      width="216"
      height="296"
      rx="32"
      stroke={secondaryColor}
      strokeWidth="1.2"
      strokeDasharray="6 4"
      opacity="0.4"
    />
    <rect
      x="18"
      y="18"
      width="204"
      height="284"
      rx="26"
      stroke={color}
      strokeWidth="0.75"
      opacity="0.3"
    />

    {/* Top Left Organic Sprout Corner */}
    <g transform="translate(18, 18)" fill={secondaryColor} opacity="0.8">
      <path d="M0 16 Q8 4 20 0 Q10 10 0 16 Z" />
      <circle cx="16" cy="14" r="3" fill={color} />
      <circle cx="16" cy="14" r="1.2" fill="#FFE59E" />
    </g>

    {/* Bottom Right Organic Sprout Corner */}
    <g transform="translate(222, 302) rotate(180)" fill={secondaryColor} opacity="0.8">
      <path d="M0 16 Q8 4 20 0 Q10 10 0 16 Z" />
      <circle cx="16" cy="14" r="3" fill={color} />
      <circle cx="16" cy="14" r="1.2" fill="#FFE59E" />
    </g>
  </svg>
);
