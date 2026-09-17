import React from "react";
import { SvgAssetProps } from "../types";

export const FiorellaButterfly: React.FC<SvgAssetProps> = ({
  size = 36,
  color = "#D47385",
  secondaryColor = "#8EA881",
  className = "",
  animated = false,
  ...props
}) => (
  <svg
    viewBox="0 0 48 48"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${animated ? "animate-pulse" : ""} ${className}`}
    {...props}
  >
    {/* Left Upper Wing */}
    <path
      d="M24 24 C18 12, 6 10, 4 20 C2 28, 16 30, 24 26"
      fill={color}
      opacity="0.8"
    />
    {/* Left Lower Wing */}
    <path
      d="M24 26 C16 32, 10 38, 14 42 C18 44, 22 36, 24 28"
      fill={color}
      opacity="0.65"
    />

    {/* Right Upper Wing */}
    <path
      d="M24 24 C30 12, 42 10, 44 20 C46 28, 32 30, 24 26"
      fill={color}
      opacity="0.8"
    />
    {/* Right Lower Wing */}
    <path
      d="M24 26 C32 32, 38 38, 34 42 C30 44, 26 36, 24 28"
      fill={color}
      opacity="0.65"
    />

    {/* Slender Body & Antennae */}
    <ellipse cx="24" cy="26" rx="1.5" ry="7" fill={secondaryColor} />
    <path d="M23 19 Q20 14 16 12" stroke={secondaryColor} strokeWidth="1" strokeLinecap="round" />
    <path d="M25 19 Q28 14 32 12" stroke={secondaryColor} strokeWidth="1" strokeLinecap="round" />
  </svg>
);
