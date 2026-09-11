import React from "react";
import { SvgAssetProps } from "../types";

export const FiorellaWaveDivider: React.FC<SvgAssetProps> = ({
  size = 180,
  color = "#D47385",
  secondaryColor = "#8EA881",
  className = "",
  ...props
}) => (
  <svg
    viewBox="0 0 240 32"
    width={size}
    height={(size as number) * (32 / 240)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Undulating Spring Wave Line */}
    <path
      d="M10 16 C40 8, 70 24, 100 16 C110 13, 115 13, 120 16 C125 19, 130 19, 140 16 C170 8, 200 24, 230 16"
      stroke={secondaryColor}
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.45"
    />

    {/* Wildflower Cluster in Center */}
    <g transform="translate(120, 16)">
      <circle cx="0" cy="0" r="3.5" fill={color} />
      <circle cx="-5" cy="-2" r="2.5" fill={color} opacity="0.8" />
      <circle cx="5" cy="-2" r="2.5" fill={color} opacity="0.8" />
      <circle cx="-3" cy="4" r="2" fill={secondaryColor} opacity="0.85" />
      <circle cx="3" cy="4" r="2" fill={secondaryColor} opacity="0.85" />
      <circle cx="0" cy="0" r="1.5" fill="#FFF2C6" />
    </g>

    {/* Drifting Petals Along the Wave */}
    <circle cx="55" cy="14" r="2" fill={color} opacity="0.6" />
    <circle cx="185" cy="18" r="2" fill={color} opacity="0.6" />
  </svg>
);
