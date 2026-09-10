import React from "react";
import { SvgAssetProps } from "../types";

export const TulipDivider: React.FC<SvgAssetProps> = ({
  color = "#7A8C74",
  secondaryColor = "#D48B72",
  className = "",
  ...props
}) => (
  <div className={`w-full flex items-center justify-center py-2 ${className}`}>
    <svg
      viewBox="0 0 300 24"
      className="w-full max-w-[280px] sm:max-w-[320px] h-6 mx-auto overflow-visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <line x1="15" y1="12" x2="125" y2="12" stroke={color} strokeWidth="1" opacity="0.45" strokeDasharray="4 4" />
      <g transform="translate(150, 12)">
        {/* Center Tulip Bloom Silhouette */}
        <path d="M0 -6 C-5 -1, -4 4, 0 6 C4 4, 5 -1, 0 -6 Z" fill={secondaryColor} opacity="0.9" />
        <path d="M-8 -2 C-5 0, -4 3, -2 4" stroke={color} strokeWidth="0.8" opacity="0.7" />
        <path d="M8 -2 C5 0, 4 3, 2 4" stroke={color} strokeWidth="0.8" opacity="0.7" />
        <circle cx="-14" cy="0" r="1.5" fill={color} opacity="0.6" />
        <circle cx="14" cy="0" r="1.5" fill={color} opacity="0.6" />
      </g>
      <line x1="175" y1="12" x2="285" y2="12" stroke={color} strokeWidth="1" opacity="0.45" strokeDasharray="4 4" />
    </svg>
  </div>
);
