import React from "react";
import { SvgAssetProps } from "../types";

export const IvoryCalendar: React.FC<SvgAssetProps> = ({
  size = 28,
  color = "#D4AF37",
  secondaryColor = "#EFEBE4",
  className = "",
  ...props
}) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Ivory Mori Calendar Sheet */}
    <rect
      x="5"
      y="7"
      width="22"
      height="20"
      rx="3"
      stroke={color}
      strokeWidth="1.5"
      fill={secondaryColor}
    />
    <path d="M5 13 L27 13" stroke={color} strokeWidth="1" />

    {/* Loops */}
    <rect x="9" y="4" width="2" height="4" rx="1" fill={color} />
    <rect x="21" y="4" width="2" height="4" rx="1" fill={color} />

    {/* Gold Gunungan Emblem */}
    <polygon points="16,16 19,23 13,23" fill={color} />
  </svg>
);
