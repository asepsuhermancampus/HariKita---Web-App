import React from "react";
import { SvgAssetProps } from "../types";

export const TulipCalendar: React.FC<SvgAssetProps> = ({
  size = 20,
  color = "#7A8C74",
  secondaryColor = "#D48B72",
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
    {/* Centered Tulip Bloom */}
    <path
      d="M12 13 C10.5 14.5, 10.5 16.5, 12 18 C13.5 16.5, 13.5 14.5, 12 13 Z"
      fill={secondaryColor}
      opacity="0.9"
    />
  </svg>
);
