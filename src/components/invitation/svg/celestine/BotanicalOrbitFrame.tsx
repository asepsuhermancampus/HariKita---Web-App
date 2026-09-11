import React from "react";
import { SvgAssetProps } from "../types";

export const BotanicalOrbitFrame: React.FC<SvgAssetProps> = ({
  size = 280,
  color = "#5F7482",
  secondaryColor = "#9FB1BD",
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
    {/* Oval Orbit Frame */}
    <rect
      x="14"
      y="14"
      width="212"
      height="292"
      rx="24"
      stroke={color}
      strokeWidth="1"
      opacity="0.4"
    />
    <rect
      x="20"
      y="20"
      width="200"
      height="280"
      rx="18"
      stroke={secondaryColor}
      strokeWidth="0.6"
      strokeDasharray="4 6"
      opacity="0.3"
    />

    {/* Top Left Star Orbit Corner */}
    <g transform="translate(20, 20)">
      <path d="M0 0 L2 6 L8 8 L2 10 L0 16 L-2 10 L-8 8 L-2 6 Z" fill={secondaryColor} opacity="0.85" />
      <circle cx="8" cy="8" r="1.5" fill="#EBF3F7" />
    </g>

    {/* Bottom Right Star Orbit Corner */}
    <g transform="translate(220, 300) rotate(180)">
      <path d="M0 0 L2 6 L8 8 L2 10 L0 16 L-2 10 L-8 8 L-2 6 Z" fill={secondaryColor} opacity="0.85" />
      <circle cx="8" cy="8" r="1.5" fill="#EBF3F7" />
    </g>
  </svg>
);
