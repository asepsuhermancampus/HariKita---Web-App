import React from "react";
import { SvgAssetProps } from "../types";

export const WildFernCorner: React.FC<SvgAssetProps> = ({
  size = 54,
  color = "#2D4A3E",
  secondaryColor = "#4D7358",
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
    {/* Wild Fern Arching Sprigs */}
    <path
      d="M4 60 C8 34, 34 8, 60 4"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.6"
    />

    {/* Fern Leaflets */}
    <g fill={color} opacity="0.8">
      <path d="M12 45 C18 42, 22 46, 20 52 C15 50, 12 47, 12 45 Z" />
      <path d="M22 35 C28 30, 34 34, 32 40 C26 38, 22 36, 22 35 Z" />
      <path d="M34 22 C40 18, 46 22, 44 28 C38 26, 34 24, 34 22 Z" />
      <path d="M46 12 C52 6, 58 10, 56 16 C50 14, 46 13, 46 12 Z" />
    </g>

    {/* Dew Drops */}
    <circle cx="28" cy="28" r="2" fill="#CBE5D6" />
    <circle cx="42" cy="16" r="1.5" fill="#CBE5D6" />
  </svg>
);
