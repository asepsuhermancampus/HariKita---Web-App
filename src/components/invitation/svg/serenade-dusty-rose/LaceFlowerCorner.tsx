import React from "react";
import { SvgAssetProps } from "../types";

export const LaceFlowerCorner: React.FC<SvgAssetProps> = ({
  size = 54,
  color = "#C08081",
  secondaryColor = "#8C5E58",
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
    {/* Lace Arc Flourish */}
    <path
      d="M4 60 C4 30, 30 4, 60 4"
      stroke={color}
      strokeWidth="1.2"
      strokeDasharray="3 3"
      opacity="0.5"
    />
    <path
      d="M12 60 C12 36, 36 12, 60 12"
      stroke={secondaryColor}
      strokeWidth="0.8"
      opacity="0.35"
    />

    {/* Corner Pressed Rose */}
    <circle cx="16" cy="16" r="6" fill={color} opacity="0.85" />
    <circle cx="15" cy="15" r="2.5" fill="#FFEFEF" opacity="0.7" />
    <path d="M16 22 Q12 28 8 26 Q10 20 16 22 Z" fill={secondaryColor} opacity="0.8" />
  </svg>
);
