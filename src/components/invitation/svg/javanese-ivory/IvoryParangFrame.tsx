import React from "react";
import { SvgAssetProps } from "../types";

export const IvoryParangFrame: React.FC<SvgAssetProps> = ({
  size = 280,
  color = "#D4AF37",
  secondaryColor = "#EFEBE4",
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
    {/* Ivory & Gold Double Keraton Border */}
    <rect
      x="14"
      y="14"
      width="212"
      height="292"
      rx="16"
      stroke={color}
      strokeWidth="1.4"
      opacity="0.6"
    />
    <rect
      x="20"
      y="20"
      width="200"
      height="280"
      rx="12"
      stroke={secondaryColor}
      strokeWidth="1"
      strokeDasharray="4 4"
      opacity="0.8"
    />

    {/* Top Left Prada Flourish */}
    <g transform="translate(20, 20)" fill={color}>
      <polygon points="0,0 8,0 0,8" />
      <circle cx="8" cy="8" r="2" fill="#FFF2C2" />
    </g>

    {/* Bottom Right Prada Flourish */}
    <g transform="translate(220, 300) rotate(180)" fill={color}>
      <polygon points="0,0 8,0 0,8" />
      <circle cx="8" cy="8" r="2" fill="#FFF2C2" />
    </g>
  </svg>
);
