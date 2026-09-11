import React from "react";
import { SvgAssetProps } from "../types";

export const RonceanMelatiDivider: React.FC<SvgAssetProps> = ({
  size = 180,
  color = "#D4AF37",
  secondaryColor = "#FDFCF7",
  className = "",
  ...props
}) => (
  <svg
    viewBox="0 0 240 28"
    width={size}
    height={(size as number) * (28 / 240)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Fine Silk Strand Line */}
    <path
      d="M15 14 L85 14 M155 14 L225 14"
      stroke={color}
      strokeWidth="0.8"
      strokeDasharray="4 3"
      opacity="0.5"
    />

    {/* Center Roncean Melati Tibo Dodo Blossom & Pearls */}
    <g transform="translate(120, 14)">
      <circle cx="0" cy="0" r="5.5" fill={secondaryColor} stroke={color} strokeWidth="0.8" />
      <circle cx="0" cy="0" r="2" fill="#FFEAA7" />
      <circle cx="-14" cy="0" r="3.5" fill={secondaryColor} />
      <circle cx="14" cy="0" r="3.5" fill={secondaryColor} />
      <circle cx="-24" cy="0" r="2" fill={secondaryColor} opacity="0.8" />
      <circle cx="24" cy="0" r="2" fill={secondaryColor} opacity="0.8" />
    </g>
  </svg>
);
