import React from "react";
import { SvgAssetProps } from "../types";

export const RoseScrollDivider: React.FC<SvgAssetProps> = ({
  size = 180,
  color = "#C08081",
  secondaryColor = "#8C5E58",
  className = "",
  ...props
}) => (
  <svg
    viewBox="0 0 240 28"
    width={size}
    height={(size as number) * (28 / 240)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Delicate Filigree Rose Scrolls */}
    <path
      d="M20 14 C50 14, 70 8, 95 14 C105 16, 110 16, 115 14 M125 14 C130 16, 135 16, 145 14 C170 8, 190 14, 220 14"
      stroke={color}
      strokeWidth="0.9"
      strokeLinecap="round"
      opacity="0.5"
    />

    {/* Center Dusty Rosebud with Side Petals */}
    <g transform="translate(120, 14)">
      <circle cx="0" cy="0" r="4.5" fill={color} />
      <circle cx="-1" cy="-1" r="2.5" fill="#FFEFEF" opacity="0.65" />
      <path d="M-6 -2 Q-10 -8 -14 -4 Q-8 0 -6 -2 Z" fill={secondaryColor} opacity="0.75" />
      <path d="M6 -2 Q10 -8 14 -4 Q8 0 6 -2 Z" fill={secondaryColor} opacity="0.75" />
    </g>
  </svg>
);
