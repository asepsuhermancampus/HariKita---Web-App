import React from "react";
import { SvgAssetProps } from "../types";

export const MossFernWreath: React.FC<SvgAssetProps> = ({
  size = 140,
  color = "#2D4A3E",
  secondaryColor = "#4D7358",
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
    {/* Forest Vine Twig Circle */}
    <circle cx="100" cy="100" r="82" stroke={color} strokeWidth="1.2" strokeDasharray="10 5" opacity="0.45" />

    {/* Deep Wild Fern Fronds */}
    <g fill={color} opacity="0.88">
      {/* Top Frond */}
      <path d="M100 12 C106 20, 114 26, 120 28 C112 30, 106 26, 100 18 Z" />
      <path d="M96 24 C90 18, 82 22, 78 28 C86 28, 92 26, 96 24 Z" />
      <path d="M104 28 C112 24, 118 28, 122 34 C114 34, 108 30, 104 28 Z" />

      {/* East Frond */}
      <path d="M184 100 C176 106, 170 114, 168 120 C166 112, 170 106, 178 100 Z" />
      <path d="M172 94 C178 88, 174 80, 168 76 C168 84, 170 90, 172 94 Z" />

      {/* South Frond */}
      <path d="M100 184 C94 176, 86 170, 80 168 C88 166, 94 170, 100 178 Z" />

      {/* West Frond */}
      <path d="M16 100 C24 94, 30 86, 32 80 C34 88, 30 94, 22 100 Z" />
    </g>

    {/* Moss Spores & Dew Drops */}
    <g fill={secondaryColor} opacity="0.9">
      <circle cx="132" cy="40" r="3" />
      <circle cx="170" cy="112" r="3.5" />
      <circle cx="140" cy="165" r="3" />
      <circle cx="68" cy="160" r="3.5" />
      <circle cx="32" cy="90" r="3" />
      <circle cx="60" cy="36" r="3.5" />
    </g>

    {/* Glistening Morning Dew Sparkle */}
    <circle cx="100" cy="14" r="1.5" fill="#CBE5D6" />
    <circle cx="182" cy="100" r="1.5" fill="#CBE5D6" />
  </svg>
);
