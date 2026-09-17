import React from "react";
import { SvgAssetProps } from "../types";

export const KebumenLawetPin: React.FC<SvgAssetProps> = ({
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
    />

    {/* Swiftlet (Walet) Silhouette in Center */}
    <g transform="translate(16, 12)" fill="#1B120C">
      <path d="M0 0 C-4 -6, -8 -4, -10 -1 C-6 1, 0 1, 0 1 C0 1, 6 1, 10 -1 C8 -4, 4 -6, 0 0 Z" />
      <circle cx="0" cy="-1" r="1.2" fill="#FAF7F5" />
    </g>
  </svg>
);
