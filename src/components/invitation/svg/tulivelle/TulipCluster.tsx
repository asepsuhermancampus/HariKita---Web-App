import React from "react";
import { SvgAssetProps } from "../types";

export const TulipCluster: React.FC<SvgAssetProps> = ({
  size = 70,
  color = "#7A8C74",
  secondaryColor = "#D48B72",
  className = "",
  ...props
}) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Twin Tulip Buds Blooming */}
    <path d="M40 30 C30 40, 32 55, 42 60 C48 50, 52 38, 40 30 Z" fill={secondaryColor} opacity="0.85" />
    <path d="M52 22 C45 32, 48 45, 58 50 C62 42, 65 30, 52 22 Z" fill={secondaryColor} opacity="0.7" />
    <path d="M68 35 C60 45, 62 55, 72 60 C76 52, 78 40, 68 35 Z" fill={secondaryColor} opacity="0.9" />
    {/* Stems & Leaves */}
    <path d="M42 60 Q48 78 50 95" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    <path d="M58 50 Q54 72 50 95" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    <path d="M72 60 Q65 78 50 95" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    <path d="M48 75 Q32 70 20 60 Q30 78 48 82 Z" fill={color} opacity="0.75" />
    <path d="M52 72 Q70 68 85 58 Q72 75 52 80 Z" fill={color} opacity="0.75" />
  </svg>
);
