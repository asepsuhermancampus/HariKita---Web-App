import React from "react";
import { SvgAssetProps } from "../types";

export const BatikJagatanDivider: React.FC<SvgAssetProps> = ({
  size = 180,
  color = "#D4AF37",
  secondaryColor = "#7A5316",
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
    {/* Prada Gold Line */}
    <path
      d="M15 14 L85 14 M155 14 L225 14"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.6"
    />

    {/* Center Batik Jagatan Kebumen Diamond Motif with Walet Wing Accents */}
    <g transform="translate(120, 14)">
      {/* Jagatan Rhombus */}
      <polygon points="0,-8 8,0 0,8 -8,0" fill={color} />
      <polygon points="0,-4 4,0 0,4 -4,0" fill="#FAF7F5" />
      {/* Walet Wing Whispers Left and Right */}
      <path d="M-8 0 C-14 -6, -20 -4, -22 0 C-16 2, -10 2, -8 0 Z" fill={color} opacity="0.8" />
      <path d="M8 0 C14 -6, 20 -4, 22 0 C16 2, 10 2, 8 0 Z" fill={color} opacity="0.8" />
    </g>
  </svg>
);
