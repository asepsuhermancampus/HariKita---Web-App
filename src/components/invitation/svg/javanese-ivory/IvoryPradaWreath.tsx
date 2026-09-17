import React from "react";
import { SvgAssetProps } from "../types";

export const IvoryPradaWreath: React.FC<SvgAssetProps> = ({
  size = 140,
  color = "#D4AF37",
  secondaryColor = "#EFEBE4",
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
    {/* Concentric Ivory & Prada Gold Rings */}
    <circle cx="100" cy="100" r="82" stroke={color} strokeWidth="1.4" strokeDasharray="6 6" opacity="0.6" />
    <circle cx="100" cy="100" r="74" stroke={secondaryColor} strokeWidth="1.2" opacity="0.75" />

    {/* Ivory Mori Sacred Floral Carvings with Gold Prada Tips */}
    <g fill={secondaryColor} stroke={color} strokeWidth="0.8">
      {/* Top Bloom */}
      <circle cx="100" cy="20" r="6.5" />
      <circle cx="94" cy="17" r="4" />
      <circle cx="106" cy="17" r="4" />

      {/* East Bloom */}
      <circle cx="180" cy="100" r="6.5" />

      {/* South Bloom */}
      <circle cx="100" cy="180" r="6.5" />

      {/* West Bloom */}
      <circle cx="20" cy="100" r="6.5" />
    </g>

    {/* Gold Prada Pistils & Embers */}
    <circle cx="100" cy="20" r="2.5" fill={color} />
    <circle cx="180" cy="100" r="2.5" fill={color} />
    <circle cx="100" cy="180" r="2.5" fill={color} />
    <circle cx="20" cy="100" r="2.5" fill={color} />

    {/* Intermediate Prada Dots */}
    <circle cx="145" cy="45" r="3" fill={color} />
    <circle cx="55" cy="45" r="3" fill={color} />
    <circle cx="155" cy="145" r="3" fill={color} />
    <circle cx="45" cy="145" r="3" fill={color} />
  </svg>
);
