import React from "react";
import { SvgAssetProps } from "../types";

export const CelestinePin: React.FC<SvgAssetProps> = ({
  size = 28,
  color = "#5F7482",
  secondaryColor = "#9FB1BD",
  className = "",
  ...props
}) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Map Pin Droplet */}
    <path
      d="M16 3 C10.5 3 6 7.5 6 13 C6 20 16 29 16 29 C16 29 26 20 26 13 C26 7.5 21.5 3 16 3 Z"
      fill={color}
      opacity="0.9"
    />

    {/* Center Ice Crystal Star */}
    <g transform="translate(16, 12)">
      <path d="M0 -5 L1 -2 L4 0 L1 2 L0 5 L-1 2 L-4 0 L-1 -2 Z" fill="#EBF3F7" />
      <circle cx="0" cy="0" r="1.2" fill="#FFF" />
    </g>
  </svg>
);
