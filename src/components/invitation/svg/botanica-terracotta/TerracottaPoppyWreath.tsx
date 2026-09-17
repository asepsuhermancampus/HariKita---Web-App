import React from "react";
import { SvgAssetProps } from "../types";

export const TerracottaPoppyWreath: React.FC<SvgAssetProps> = ({
  size = 140,
  color = "#B85D3B",
  secondaryColor = "#D98A6C",
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
    {/* Sun-Baked Clay Ring */}
    <circle cx="100" cy="100" r="82" stroke={color} strokeWidth="1.2" strokeDasharray="8 6" opacity="0.4" />
    <circle cx="100" cy="100" r="76" stroke={secondaryColor} strokeWidth="0.8" opacity="0.3" />

    {/* Dried Poppy Blooms & Sunburst Petals */}
    <g fill={color} opacity="0.85">
      {/* Top Poppy Bloom */}
      <circle cx="100" cy="20" r="8" />
      <circle cx="95" cy="16" r="5" fill={secondaryColor} opacity="0.8" />
      <circle cx="105" cy="16" r="5" fill={secondaryColor} opacity="0.8" />
      <circle cx="100" cy="20" r="3" fill="#4A2518" />

      {/* East Dried Poppy */}
      <circle cx="180" cy="100" r="8" />
      <circle cx="180" cy="100" r="3" fill="#4A2518" />

      {/* South Dried Poppy */}
      <circle cx="100" cy="180" r="7" />
      <circle cx="100" cy="180" r="2.5" fill="#4A2518" />

      {/* West Dried Poppy */}
      <circle cx="20" cy="100" r="7" />
      <circle cx="20" cy="100" r="2.5" fill="#4A2518" />
    </g>

    {/* Dried Palm & Clay Grass Sprigs */}
    <g fill={secondaryColor} opacity="0.85">
      <path d="M125 35 Q135 25 145 30 Q138 42 125 35 Z" />
      <path d="M75 35 Q65 25 55 30 Q62 42 75 35 Z" />
      <path d="M165 135 Q175 145 170 155 Q158 148 165 135 Z" />
      <path d="M35 135 Q25 145 30 155 Q42 148 35 135 Z" />
    </g>

    {/* Clay Seed Dots */}
    <circle cx="140" cy="55" r="3" fill={color} />
    <circle cx="60" cy="55" r="3" fill={color} />
    <circle cx="145" cy="150" r="3" fill={color} />
    <circle cx="55" cy="150" r="3" fill={color} />
  </svg>
);
