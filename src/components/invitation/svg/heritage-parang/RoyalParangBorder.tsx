import React from "react";
import { SvgAssetProps } from "../types";

export const RoyalParangBorder: React.FC<SvgAssetProps> = ({
  size = 54,
  color = "#D4AF37",
  secondaryColor = "#7A5316",
  className = "",
  ...props
}) => (
  <svg
    viewBox="0 0 64 64"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Diagonal Parang Barong Corner Flurry */}
    <path
      d="M8 8 L56 8 L56 16 L16 16 L16 56 L8 56 Z"
      fill={color}
      opacity="0.85"
    />
    <path
      d="M24 24 L48 24 L48 28 L28 28 L28 48 L24 48 Z"
      fill={secondaryColor}
      opacity="0.75"
    />
    {/* Mlinjon Diamond Dot */}
    <polygon points="36,36 40,32 44,36 40,40" fill="#FFEAA7" />
  </svg>
);
