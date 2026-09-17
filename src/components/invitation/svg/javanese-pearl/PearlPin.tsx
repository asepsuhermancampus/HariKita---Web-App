import React from "react";
import { SvgAssetProps } from "../types";

export const PearlPin: React.FC<SvgAssetProps> = ({
  size = 28,
  color = "#D4AF37",
  secondaryColor = "#FDFCF7",
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
    {/* Pearl Pin Droplet */}
    <path
      d="M16 3 C10.5 3 6 7.5 6 13 C6 20 16 29 16 29 C16 29 26 20 26 13 C26 7.5 21.5 3 16 3 Z"
      fill={secondaryColor}
      stroke={color}
      strokeWidth="1.2"
    />

    {/* Center Iridescent Pearl Core */}
    <circle cx="16" cy="12" r="3.5" fill="#FFFFFF" />
    <circle cx="16" cy="12" r="1.5" fill="#FFEAA7" opacity="0.6" />
  </svg>
);
