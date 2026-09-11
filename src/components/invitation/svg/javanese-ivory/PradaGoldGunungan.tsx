import React from "react";
import { SvgAssetProps } from "../types";

export const PradaGoldGunungan: React.FC<SvgAssetProps> = ({
  size = 54,
  color = "#D4AF37",
  secondaryColor = "#EFEBE4",
  className = "",
  ...props
}) => (
  <svg
    viewBox="0 0 64 64"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Gunungan Silhouette with Prada Gold Inlay */}
    <path
      d="M32 6 L52 48 L12 48 Z"
      fill={secondaryColor}
      stroke={color}
      strokeWidth="1.5"
    />
    <path
      d="M32 14 L44 44 L20 44 Z"
      fill={color}
      opacity="0.8"
    />
    <circle cx="32" cy="28" r="3" fill="#FFF8DC" />
    <path d="M32 48 L32 58" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);
