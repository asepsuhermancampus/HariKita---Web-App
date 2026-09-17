import React from "react";
import { SvgAssetProps } from "../types";

export const WayangPin: React.FC<SvgAssetProps> = ({
  size = 28,
  color = "#D4AF37",
  secondaryColor = "#7A5316",
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

    {/* Gunungan Silhouette in Pin Center */}
    <path
      d="M16 7 L21 15 L11 15 Z"
      fill="#1A120B"
    />
    <circle cx="16" cy="11" r="1.5" fill="#FFEAA7" />
  </svg>
);
