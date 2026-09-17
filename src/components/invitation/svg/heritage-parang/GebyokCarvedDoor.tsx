import React from "react";
import { SvgAssetProps } from "../types";

export const GebyokCarvedDoor: React.FC<SvgAssetProps> = ({
  size = 280,
  color = "#D4AF37",
  secondaryColor = "#7A5316",
  className = "",
  ...props
}) => (
  <svg
    viewBox="0 0 240 320"
    width={size}
    height={(size as number) * (320 / 240)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Gebyok Arch Frame */}
    <path
      d="M20 300 L20 80 C20 40, 60 20, 120 20 C180 20, 220 40, 220 80 L220 300"
      stroke={color}
      strokeWidth="1.5"
      opacity="0.5"
    />
    <path
      d="M26 300 L26 82 C26 46, 64 26, 120 26 C176 26, 214 46, 214 82 L214 300"
      stroke={secondaryColor}
      strokeWidth="0.8"
      strokeDasharray="6 4"
      opacity="0.4"
    />

    {/* Gunungan Finial Apex */}
    <g transform="translate(120, 20)">
      <path d="M0 -12 L12 4 L-12 4 Z" fill={color} />
      <circle cx="0" cy="-12" r="2.5" fill="#FFEAA7" />
    </g>

    {/* Center Door Division Line */}
    <line x1="120" y1="26" x2="120" y2="300" stroke={color} strokeWidth="0.8" opacity="0.3" />
  </svg>
);
