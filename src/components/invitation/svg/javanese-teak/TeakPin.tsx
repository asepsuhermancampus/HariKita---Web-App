import React from "react";
import { SvgAssetProps } from "../types";

export const TeakPin: React.FC<SvgAssetProps> = ({
  size = 28,
  color = "#8A5A36",
  secondaryColor = "#4A2E1B",
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
    {/* Teak Pin Droplet */}
    <path
      d="M16 3 C10.5 3 6 7.5 6 13 C6 20 16 29 16 29 C16 29 26 20 26 13 C26 7.5 21.5 3 16 3 Z"
      fill={color}
      opacity="0.9"
    />

    {/* Center Wood Knot Circle */}
    <circle cx="16" cy="12" r="3.5" fill={secondaryColor} />
    <circle cx="16" cy="12" r="1.5" fill="#D4AF37" />
  </svg>
);
