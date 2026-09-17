import React from "react";
import { SvgAssetProps } from "../types";

export const AutumnLeafWreath: React.FC<SvgAssetProps> = ({
  size = 140,
  color = "#5C6F57",
  secondaryColor = "#B85D3B",
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
    {/* Outer Eucalyptus Botanical Circle */}
    <circle cx="100" cy="100" r="82" stroke={color} strokeWidth="1.5" strokeDasharray="4 6" opacity="0.45" />
    <circle cx="100" cy="100" r="74" stroke={secondaryColor} strokeWidth="0.8" opacity="0.3" />

    {/* Autumn Leaves Clustered along Circumference */}
    <g fill={color} opacity="0.85">
      <path d="M100 12 C105 22, 115 28, 120 30 C115 35, 105 32, 100 22 Z" />
      <path d="M165 65 C168 76, 175 85, 180 90 C172 92, 165 85, 160 75 Z" />
      <path d="M178 120 C175 132, 178 145, 180 152 C170 148, 168 135, 170 125 Z" />
      <path d="M100 188 C95 178, 85 172, 80 170 C85 165, 95 168, 100 178 Z" />
      <path d="M35 135 C32 124, 25 115, 20 110 C28 108, 35 115, 40 125 Z" />
      <path d="M22 80 C25 68, 22 55, 20 48 C30 52, 32 65, 30 75 Z" />
    </g>

    {/* Secondary Warm Terracotta Seed & Leaf Buds */}
    <g fill={secondaryColor} opacity="0.9">
      <circle cx="135" cy="42" r="3.5" />
      <circle cx="172" cy="105" r="3" />
      <circle cx="145" cy="165" r="3.5" />
      <circle cx="65" cy="158" r="3" />
      <circle cx="28" cy="95" r="3.5" />
      <circle cx="55" cy="35" r="3" />
      <path d="M138 38 Q148 40 152 48 Q144 48 138 42 Z" />
      <path d="M62 162 Q52 160 48 152 Q56 152 62 158 Z" />
    </g>
  </svg>
);
