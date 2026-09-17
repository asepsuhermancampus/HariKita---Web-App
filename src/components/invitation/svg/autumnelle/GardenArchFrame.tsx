import React from "react";
import { SvgAssetProps } from "../types";

export const GardenArchFrame: React.FC<SvgAssetProps> = ({
  size = 200,
  color = "#5C6F57",
  className = "",
  children,
  ...props
}) => {
  const numSize = Number(size) || 200;
  const height = (numSize * 360) / 280;

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: numSize, height }}
    >
      {/* Inner Clipped Arch Content */}
      <div className="absolute inset-[8px] rounded-t-full overflow-hidden flex items-center justify-center bg-emerald-50">
        {children}
      </div>

      <svg
        viewBox="0 0 280 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        {...props}
      >
        {/* Outer Arch Border */}
        <path
          d="M 15 350 L 15 140 A 125 125 0 0 1 265 140 L 265 350"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        {/* Inner Inset Arch */}
        <path
          d="M 23 348 L 23 140 A 117 117 0 0 1 257 140 L 257 348"
          stroke={color}
          strokeWidth="0.75"
          strokeDasharray="4 4"
          opacity="0.35"
        />
        {/* Top Keystone Botanical Bud */}
        <circle cx="140" cy="22" r="3.5" fill={color} opacity="0.65" />
        <path d="M 136 24 C 130 30, 126 36, 120 40" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        <path d="M 144 24 C 150 30, 154 36, 160 40" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      </svg>
    </div>
  );
};
