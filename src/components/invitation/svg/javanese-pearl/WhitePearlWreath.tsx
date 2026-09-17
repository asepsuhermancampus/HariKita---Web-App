import React from "react";
import { SvgAssetProps } from "../types";

export const WhitePearlWreath: React.FC<SvgAssetProps> = ({
  size = 140,
  color = "#D4AF37",
  secondaryColor = "#FDFCF7",
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
    {/* Concentric White Pearl & Fine Gold Filigree Rings */}
    <circle cx="100" cy="100" r="82" stroke={secondaryColor} strokeWidth="2" strokeDasharray="5 7" opacity="0.9" />
    <circle cx="100" cy="100" r="74" stroke={color} strokeWidth="0.8" opacity="0.45" />

    {/* Luminous Melati Tibo Dodo Pearls Along Ring */}
    <g fill={secondaryColor}>
      <circle cx="100" cy="18" r="6.5" />
      <circle cx="100" cy="18" r="2.5" fill="#FFEAA7" opacity="0.6" />

      <circle cx="182" cy="100" r="6.5" />
      <circle cx="182" cy="100" r="2.5" fill="#FFEAA7" opacity="0.6" />

      <circle cx="100" cy="182" r="6.5" />
      <circle cx="100" cy="182" r="2.5" fill="#FFEAA7" opacity="0.6" />

      <circle cx="18" cy="100" r="6.5" />
      <circle cx="18" cy="100" r="2.5" fill="#FFEAA7" opacity="0.6" />
    </g>

    {/* Intermediate Tiny Pearls and Gold Ties */}
    <g fill={secondaryColor} opacity="0.9">
      <circle cx="140" cy="42" r="4" />
      <circle cx="60" cy="42" r="4" />
      <circle cx="158" cy="142" r="4" />
      <circle cx="42" cy="142" r="4" />
    </g>

    {/* Fine Gold Tie Knots */}
    <circle cx="140" cy="42" r="1.5" fill={color} />
    <circle cx="60" cy="42" r="1.5" fill={color} />
    <circle cx="158" cy="142" r="1.5" fill={color} />
    <circle cx="42" cy="142" r="1.5" fill={color} />
  </svg>
);
