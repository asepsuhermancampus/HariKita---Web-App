import React from "react";
import { SvgAssetProps } from "../types";

export const TerracottaPin: React.FC<SvgAssetProps> = ({
  size = 28,
  color = "#B85D3B",
  secondaryColor = "#D98A6C",
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

    {/* Clay Sun Inset */}
    <circle cx="16" cy="12" r="3.5" fill="#FFEAE2" />
    <circle cx="16" cy="12" r="1.5" fill={secondaryColor} />
  </svg>
);
