import React from "react";
import { SvgAssetProps } from "../types";

export const TeakGununganWreath: React.FC<SvgAssetProps> = ({
  size = 140,
  color = "#8A5A36",
  secondaryColor = "#4A2E1B",
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
    {/* Concentric Teak Wood Rings */}
    <circle cx="100" cy="100" r="82" stroke={color} strokeWidth="1.6" strokeDasharray="8 6" opacity="0.6" />
    <circle cx="100" cy="100" r="74" stroke={secondaryColor} strokeWidth="1" opacity="0.4" />

    {/* Carved Teak Gunungan at Apex */}
    <g transform="translate(100, 18)" fill={color}>
      <path d="M0 -10 L14 10 L-14 10 Z" />
      <circle cx="0" cy="2" r="3" fill="#D4AF37" />
    </g>

    {/* Four Cardinal Teak Leaf Carvings */}
    <g fill={color} opacity="0.85">
      <path d="M182 100 C174 94, 166 94, 164 100 C166 106, 174 106, 182 100 Z" />
      <path d="M100 182 C94 174, 94 166, 100 164 C106 166, 106 174, 100 182 Z" />
      <path d="M18 100 C26 94, 34 94, 36 100 C34 106, 26 106, 18 100 Z" />
    </g>

    {/* Wood Knot Knobs */}
    <circle cx="140" cy="45" r="3.5" fill={secondaryColor} />
    <circle cx="60" cy="45" r="3.5" fill={secondaryColor} />
    <circle cx="155" cy="155" r="3.5" fill={secondaryColor} />
    <circle cx="45" cy="155" r="3.5" fill={secondaryColor} />
  </svg>
);
