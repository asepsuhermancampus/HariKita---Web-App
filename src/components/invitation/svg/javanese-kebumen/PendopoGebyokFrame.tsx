import React from "react";
import { SvgAssetProps } from "../types";

export const PendopoGebyokFrame: React.FC<SvgAssetProps> = ({
  size = 280,
  color = "#D4AF37",
  secondaryColor = "#7A5316",
  className = "",
  ...props
}) => (
  <svg
    viewBox="0 0 240 320"
    width={size}
    height={(size as number) * (320 / 240)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Stately Pendopo Kabumian Double Arch */}
    <path
      d="M18 300 L18 80 C18 35, 55 16, 120 16 C185 16, 222 35, 222 80 L222 300"
      stroke={color}
      strokeWidth="1.5"
      opacity="0.65"
    />
    <path
      d="M24 300 L24 82 C24 40, 58 22, 120 22 C182 22, 216 40, 216 82 L216 300"
      stroke={secondaryColor}
      strokeWidth="0.8"
      strokeDasharray="6 4"
      opacity="0.45"
    />

    {/* Walet Emas Emblem at Apex of Pendopo Gate */}
    <g transform="translate(120, 16)">
      <polygon points="0,-10 12,4 -12,4" fill={color} />
      <circle cx="0" cy="-1" r="2" fill="#FAF7F5" />
    </g>
  </svg>
);
