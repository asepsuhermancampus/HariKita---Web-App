import React from "react";
import { SvgAssetProps } from "../types";

export const FiorellaPin: React.FC<SvgAssetProps> = ({
  size = 28,
  color = "#D47385",
  secondaryColor = "#8EA881",
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
    {/* Map Pin Droplet Silhouette */}
    <path
      d="M16 3 C10.5 3 6 7.5 6 13 C6 20 16 29 16 29 C16 29 26 20 26 13 C26 7.5 21.5 3 16 3 Z"
      fill={color}
      opacity="0.9"
    />

    {/* Center Wildflower Petal Star */}
    <circle cx="16" cy="12" r="3" fill="#FFF8F0" />
    <circle cx="16" cy="9.5" r="1.5" fill={secondaryColor} />
    <circle cx="16" cy="14.5" r="1.5" fill={secondaryColor} />
    <circle cx="13.5" cy="12" r="1.5" fill={secondaryColor} />
    <circle cx="18.5" cy="12" r="1.5" fill={secondaryColor} />
  </svg>
);
