import React from "react";
import { SvgAssetProps } from "../types";

export const RedGebyokFrame: React.FC<SvgAssetProps> = ({
  size = 280,
  color = "#D4AF37",
  secondaryColor = "#7A1C28",
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
    {/* Royal Red & Gold Gebyok Frame */}
    <rect
      x="14"
      y="14"
      width="212"
      height="292"
      rx="14"
      stroke={secondaryColor}
      strokeWidth="2"
      opacity="0.8"
    />
    <rect
      x="20"
      y="20"
      width="200"
      height="280"
      rx="10"
      stroke={color}
      strokeWidth="0.8"
      strokeDasharray="5 5"
      opacity="0.6"
    />

    {/* Top Crest */}
    <g transform="translate(120, 20)">
      <polygon points="0,-6 10,4 -10,4" fill={color} />
      <circle cx="0" cy="4" r="2" fill={secondaryColor} />
    </g>
  </svg>
);
