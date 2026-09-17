import React from "react";
import { SvgAssetProps } from "../types";

export const OliveCrownWreath: React.FC<SvgAssetProps> = ({
  size = 140,
  color = "#6E7A55",
  secondaryColor = "#3A4527",
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
    {/* Intertwined Olive Laurel Branches */}
    <circle cx="100" cy="100" r="80" stroke={color} strokeWidth="1" strokeDasharray="8 6" opacity="0.4" />

    {/* Paired Mediterranean Olive Leaves */}
    <g fill={color} opacity="0.85">
      {/* Top Section */}
      <path d="M100 16 C92 22, 90 32, 100 36 C105 28, 105 22, 100 16 Z" />
      <path d="M110 24 C118 28, 126 36, 124 44 C116 42, 112 34, 110 24 Z" />
      <path d="M90 24 C82 28, 74 36, 76 44 C84 42, 88 34, 90 24 Z" />

      {/* East Section */}
      <path d="M184 100 C178 92, 168 90, 164 100 C172 105, 178 105, 184 100 Z" />
      <path d="M176 110 C172 118, 164 126, 156 124 C158 116, 166 112, 176 110 Z" />

      {/* South Section */}
      <path d="M100 184 C108 178, 110 168, 100 164 C95 172, 95 178, 100 184 Z" />

      {/* West Section */}
      <path d="M16 100 C22 108, 32 110, 36 100 C28 95, 22 95, 16 100 Z" />
    </g>

    {/* Olive Fruits */}
    <g fill={secondaryColor} opacity="0.9">
      <ellipse cx="118" cy="46" rx="3.5" ry="5" transform="rotate(25 118 46)" />
      <ellipse cx="82" cy="46" rx="3.5" ry="5" transform="rotate(-25 82 46)" />
      <ellipse cx="166" cy="85" rx="3.5" ry="5" transform="rotate(75 166 85)" />
      <ellipse cx="34" cy="115" rx="3.5" ry="5" transform="rotate(-75 34 115)" />
      <ellipse cx="115" cy="168" rx="3.5" ry="5" transform="rotate(35 115 168)" />
    </g>
  </svg>
);
