import React from "react";
import { SvgAssetProps } from "../types";

export const WoodenRoyalSeal: React.FC<SvgAssetProps> = ({
  size = 48,
  color = "#8A5A36",
  secondaryColor = "#4A2E1B",
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
    {/* Teak Carved Seal Disc */}
    <circle cx="32" cy="32" r="26" fill={color} />
    <circle cx="32" cy="32" r="21" stroke={secondaryColor} strokeWidth="1.5" strokeDasharray="4 3" />
    <circle cx="32" cy="32" r="16" fill={secondaryColor} />

    {/* Center Royal Gunungan Logo */}
    <path d="M32 20 L40 36 L24 36 Z" fill="#D4AF37" />
    <circle cx="32" cy="28" r="2" fill="#FFF2C2" />
  </svg>
);
