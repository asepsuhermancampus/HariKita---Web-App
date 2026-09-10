import React from "react";
import { SvgAssetProps } from "../types";

export const TulipWreath: React.FC<SvgAssetProps> = ({
  size = 140,
  color = "#7A8C74",
  secondaryColor = "#D48B72",
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
    {/* Inner & Outer Ring */}
    <circle cx="100" cy="100" r="80" stroke={color} strokeWidth="1.2" strokeDasharray="5 5" opacity="0.4" />
    <circle cx="100" cy="100" r="72" stroke={secondaryColor} strokeWidth="0.8" opacity="0.3" />

    {/* Tulivelle Signature Tulip Cups & Petals */}
    <g fill={secondaryColor} opacity="0.85">
      {/* Top Tulip */}
      <path d="M100 12 C95 18, 92 25, 96 30 C100 34, 104 30, 108 25 C105 18, 100 12, 100 12 Z" />
      {/* Right-Top Tulip */}
      <path d="M165 55 C160 62, 158 68, 164 72 C169 75, 174 70, 175 64 C172 58, 165 55, 165 55 Z" />
      {/* Bottom-Right Tulip */}
      <path d="M168 135 C164 142, 160 148, 166 152 C172 154, 176 148, 178 142 C174 136, 168 135, 168 135 Z" />
      {/* Bottom Tulip */}
      <path d="M100 188 C105 182, 108 175, 104 170 C100 166, 96 170, 92 175 C95 182, 100 188, 100 188 Z" />
      {/* Left Tulip */}
      <path d="M32 100 C36 94, 40 88, 36 84 C30 80, 26 86, 24 92 C28 98, 32 100, 32 100 Z" />
    </g>

    {/* Tulip Green Leaves wrapping around */}
    <g fill={color} opacity="0.75">
      <path d="M108 26 Q122 34 135 48 Q125 46 114 36 Z" />
      <path d="M174 72 Q180 90 182 105 Q176 96 170 82 Z" />
      <path d="M164 154 Q148 168 130 176 Q138 166 152 158 Z" />
      <path d="M92 174 Q75 168 60 152 Q70 155 82 166 Z" />
      <path d="M26 84 Q22 65 30 48 Q35 58 36 74 Z" />
    </g>
  </svg>
);
