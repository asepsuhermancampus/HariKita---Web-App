import React from "react";
import { SvgAssetProps } from "../types";

export const DustyRoseWreath: React.FC<SvgAssetProps> = ({
  size = 140,
  color = "#C08081",
  secondaryColor = "#8C5E58",
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
    {/* Concentric Delicate Wire Rings */}
    <circle cx="100" cy="100" r="82" stroke={color} strokeWidth="1" strokeDasharray="6 6" opacity="0.4" />
    <circle cx="100" cy="100" r="76" stroke={secondaryColor} strokeWidth="0.75" opacity="0.3" />

    {/* Layered Rosebud Blooms */}
    <g fill={color} opacity="0.85">
      {/* Top Rose Petal Swirl */}
      <circle cx="100" cy="20" r="7" />
      <path d="M96 16 C98 12, 104 12, 106 16 C104 20, 98 20, 96 16 Z" fill="#FFEAE8" opacity="0.6" />
      <path d="M100 27 C92 25, 90 32, 98 34 Z" fill={secondaryColor} opacity="0.7" />

      {/* East Bloom */}
      <circle cx="180" cy="100" r="7" />
      <path d="M176 96 C178 92, 184 92, 186 96 C184 100, 178 100, 176 96 Z" fill="#FFEAE8" opacity="0.6" />

      {/* Southwest Rosebud */}
      <circle cx="45" cy="155" r="6" />
      <circle cx="155" cy="155" r="6" />
    </g>

    {/* Lace Rose Leaves */}
    <g fill={secondaryColor} opacity="0.75">
      <path d="M112 22 Q122 18 126 24 Q118 28 112 22 Z" />
      <path d="M88 22 Q78 18 74 24 Q82 28 88 22 Z" />
      <path d="M175 112 Q180 122 174 126 Q170 118 175 112 Z" />
      <path d="M25 100 Q18 90 26 84 Q28 94 25 100 Z" />
    </g>

    {/* Soft Drifting Rose Petals */}
    <ellipse cx="60" cy="45" rx="3" ry="5" transform="rotate(-30 60 45)" fill={color} opacity="0.6" />
    <ellipse cx="140" cy="50" rx="3" ry="5" transform="rotate(30 140 50)" fill={color} opacity="0.6" />
    <ellipse cx="100" cy="180" rx="4" ry="6" fill={color} opacity="0.6" />
  </svg>
);
