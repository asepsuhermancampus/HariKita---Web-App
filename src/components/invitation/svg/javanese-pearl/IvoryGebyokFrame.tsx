import React from "react";
import { SvgAssetProps } from "../types";

export const IvoryGebyokFrame: React.FC<SvgAssetProps> = ({
  size = 280,
  color = "#D4AF37",
  secondaryColor = "#FDFCF7",
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
    {/* Clean White Pearl & Gold Filigree Frame */}
    <rect
      x="14"
      y="14"
      width="212"
      height="292"
      rx="16"
      stroke={secondaryColor}
      strokeWidth="2"
      opacity="0.9"
    />
    <rect
      x="20"
      y="20"
      width="200"
      height="280"
      rx="12"
      stroke={color}
      strokeWidth="0.8"
      strokeDasharray="4 4"
      opacity="0.5"
    />

    {/* Top Left Pearl Blossom Corner */}
    <g transform="translate(20, 20)">
      <circle cx="0" cy="0" r="4.5" fill={secondaryColor} stroke={color} strokeWidth="0.8" />
      <circle cx="8" cy="0" r="2.5" fill={secondaryColor} />
      <circle cx="0" cy="8" r="2.5" fill={secondaryColor} />
    </g>

    {/* Bottom Right Pearl Blossom Corner */}
    <g transform="translate(220, 300) rotate(180)">
      <circle cx="0" cy="0" r="4.5" fill={secondaryColor} stroke={color} strokeWidth="0.8" />
      <circle cx="8" cy="0" r="2.5" fill={secondaryColor} />
      <circle cx="0" cy="8" r="2.5" fill={secondaryColor} />
    </g>
  </svg>
);
