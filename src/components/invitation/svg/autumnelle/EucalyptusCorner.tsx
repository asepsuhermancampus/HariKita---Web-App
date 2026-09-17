import React from "react";
import { SvgAssetProps } from "../types";

export const EucalyptusCorner: React.FC<SvgAssetProps> = ({
  size = 80,
  color = "#5C6F57",
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
    {/* Delicate Curved Stem */}
    <path d="M5 5 Q35 15 55 55 T95 95" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    {/* Eucalyptus Round Leaves */}
    <ellipse cx="28" cy="18" rx="10" ry="7" transform="rotate(-25 28 18)" fill={color} opacity="0.75" />
    <ellipse cx="18" cy="28" rx="10" ry="7" transform="rotate(65 18 28)" fill={color} opacity="0.6" />
    <ellipse cx="48" cy="38" rx="12" ry="8" transform="rotate(-15 48 38)" fill={color} opacity="0.8" />
    <ellipse cx="38" cy="48" rx="12" ry="8" transform="rotate(75 38 48)" fill={color} opacity="0.65" />
    <ellipse cx="70" cy="68" rx="11" ry="7" transform="rotate(-30 70 68)" fill={color} opacity="0.75" />
    <ellipse cx="85" cy="85" rx="8" ry="5" transform="rotate(45 85 85)" fill={color} opacity="0.7" />
  </svg>
);
