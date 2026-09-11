import React from "react";
import { SvgAssetProps } from "../types";

export const CelestineCrownWreath: React.FC<SvgAssetProps> = ({
  size = 140,
  color = "#5F7482",
  secondaryColor = "#9FB1BD",
  className = "",
  animated = true,
  ...props
}) => (
  <svg
    viewBox="0 0 200 200"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${animated ? "animate-spin-slow" : ""} ${className}`}
    {...props}
  >
    {/* Concentric Slate & Icy Crystal Orbits */}
    <circle cx="100" cy="100" r="82" stroke={color} strokeWidth="1.2" strokeDasharray="4 8" opacity="0.45" />
    <circle cx="100" cy="100" r="75" stroke={secondaryColor} strokeWidth="0.8" opacity="0.3" />

    {/* Celestine Star Leaves & Moon Floral Blooms */}
    <g fill={color} opacity="0.85">
      {/* Top Star Leaf */}
      <path d="M100 14 C104 22, 112 28, 120 30 C112 32, 104 28, 100 22 Z" />
      <path d="M100 14 C96 22, 88 28, 80 30 C88 32, 96 28, 100 22 Z" />

      {/* East Star Bloom */}
      <path d="M186 100 C178 104, 172 112, 170 120 C168 112, 172 104, 178 100 Z" />

      {/* South Star Leaf */}
      <path d="M100 186 C104 178, 112 172, 120 170 C112 168, 104 172, 100 178 Z" />

      {/* West Star Bloom */}
      <path d="M14 100 C22 96, 28 88, 30 80 C32 88, 28 96, 22 100 Z" />
    </g>

    {/* Sparkling Ice Crystal Stars */}
    <g fill={secondaryColor} opacity="0.95">
      <circle cx="140" cy="40" r="2.5" />
      <circle cx="170" cy="115" r="3" />
      <circle cx="145" cy="165" r="2.5" />
      <circle cx="60" cy="160" r="3" />
      <circle cx="35" cy="90" r="2.5" />
      <circle cx="65" cy="35" r="3" />
    </g>

    {/* Halo Sparkles */}
    <path d="M100 10 L101 13 L104 14 L101 15 L100 18 L99 15 L96 14 L99 13 Z" fill="#EBF3F7" />
    <path d="M188 100 L189 102 L192 103 L189 104 L188 106 L187 104 L184 103 L187 102 Z" fill="#EBF3F7" />
  </svg>
);
