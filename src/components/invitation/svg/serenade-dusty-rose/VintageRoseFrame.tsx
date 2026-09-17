import React from "react";
import { SvgAssetProps } from "../types";

export const VintageRoseFrame: React.FC<SvgAssetProps> = ({
  size = 280,
  color = "#C08081",
  secondaryColor = "#8C5E58",
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
    {/* Double Vintage Border */}
    <rect
      x="14"
      y="14"
      width="212"
      height="292"
      rx="12"
      stroke={color}
      strokeWidth="1"
      opacity="0.4"
    />
    <rect
      x="20"
      y="20"
      width="200"
      height="280"
      rx="8"
      stroke={secondaryColor}
      strokeWidth="0.6"
      strokeDasharray="4 4"
      opacity="0.35"
    />

    {/* Top Left Rose Corner */}
    <g transform="translate(20, 20)">
      <circle cx="2" cy="2" r="5" fill={color} opacity="0.9" />
      <path d="M2 7 Q8 12 14 10 Q10 4 2 7 Z" fill={secondaryColor} opacity="0.8" />
    </g>

    {/* Bottom Right Rose Corner */}
    <g transform="translate(220, 300) rotate(180)">
      <circle cx="2" cy="2" r="5" fill={color} opacity="0.9" />
      <path d="M2 7 Q8 12 14 10 Q10 4 2 7 Z" fill={secondaryColor} opacity="0.8" />
    </g>
  </svg>
);
