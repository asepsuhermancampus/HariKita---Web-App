import React from "react";
import { SvgAssetProps } from "../types";

export const LeafCalendar: React.FC<SvgAssetProps> = ({
  size = 20,
  color = "#5C6F57",
  secondaryColor = "#B85D3B",
  className = "",
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <rect x="3" y="4" width="18" height="18" rx="4" stroke={color} strokeWidth="1.5" />
    <path d="M16 2V6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 2V6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M3 10H21" stroke={color} strokeWidth="1" opacity="0.4" />
    {/* Autumn Leaf inside calendar grid */}
    <path
      d="M12 13 C10.5 14, 10 16, 12 18 C14 16, 13.5 14, 12 13 Z"
      fill={secondaryColor}
      opacity="0.85"
    />
  </svg>
);
