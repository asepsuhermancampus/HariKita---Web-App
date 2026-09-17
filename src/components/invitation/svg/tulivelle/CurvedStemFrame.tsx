import React from "react";
import { SvgAssetProps } from "../types";

export const CurvedStemFrame: React.FC<SvgAssetProps> = ({
  size = 200,
  color = "#7A8C74",
  secondaryColor = "#D48B72",
  className = "",
  children,
  ...props
}) => {
  const numSize = Number(size) || 200;
  const height = (numSize * 350) / 280;

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: numSize, height }}
    >
      {/* Inner Clipped Curved Content */}
      <div className="absolute inset-[10px] rounded-[32px] overflow-hidden flex items-center justify-center bg-rose-50">
        {children}
      </div>

      <svg
        viewBox="0 0 280 350"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        {...props}
      >
        {/* Soft Rounded Curvature Frame */}
        <rect x="16" y="16" width="248" height="318" rx="40" stroke={color} strokeWidth="1.2" opacity="0.45" />
        <rect x="24" y="24" width="232" height="302" rx="34" stroke={secondaryColor} strokeWidth="0.8" strokeDasharray="5 4" opacity="0.35" />
        {/* Corner Tulip Floral Flourishes */}
        <g transform="translate(16, 16)" fill={secondaryColor} opacity="0.8">
          <circle cx="10" cy="10" r="3" />
          <path d="M10 10 Q24 6 32 12 Q20 18 10 10 Z" fill={color} opacity="0.65" />
        </g>
        <g transform="translate(248, 318)" fill={secondaryColor} opacity="0.8">
          <circle cx="-10" cy="-10" r="3" />
          <path d="M-10 -10 Q-24 -6 -32 -12 Q-20 -18 -10 -10 Z" fill={color} opacity="0.65" />
        </g>
      </svg>
    </div>
  );
};
