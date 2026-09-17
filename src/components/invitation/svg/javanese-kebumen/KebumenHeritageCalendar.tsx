import React from "react";
import { SvgAssetProps } from "../types";

export const KebumenHeritageCalendar: React.FC<SvgAssetProps> = ({
  size = 28,
  color = "#D4AF37",
  secondaryColor = "#7A5316",
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
    {/* Kabumian Calendar Sheet */}
    <rect
      x="5"
      y="7"
      width="22"
      height="20"
      rx="3"
      stroke={color}
      strokeWidth="1.5"
      fill="#1C120C"
    />
    <path d="M5 13 L27 13" stroke={color} strokeWidth="1" />

    {/* Hanging Pegs */}
    <rect x="9" y="4" width="2" height="4" rx="1" fill={color} />
    <rect x="21" y="4" width="2" height="4" rx="1" fill={color} />

    {/* Center Walet Silhouette */}
    <path d="M12 21 C14 18, 18 18, 20 21 C18 22, 14 22, 12 21 Z" fill={color} />
    <circle cx="16" cy="19" r="1" fill="#FAF7F5" />
  </svg>
);
