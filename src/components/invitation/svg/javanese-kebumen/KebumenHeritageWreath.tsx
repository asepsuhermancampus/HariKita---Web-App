import React from "react";
import { SvgAssetProps } from "../types";

export const KebumenHeritageWreath: React.FC<SvgAssetProps> = ({
  size = 140,
  color = "#D4AF37",
  secondaryColor = "#7A5316",
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
    {/* Concentric Gold Kabumian Heritage Rings */}
    <circle cx="100" cy="100" r="82" stroke={color} strokeWidth="1.5" strokeDasharray="6 6" opacity="0.65" />
    <circle cx="100" cy="100" r="74" stroke={secondaryColor} strokeWidth="0.8" opacity="0.4" />

    {/* Upper Swiftlet (Burung Walet Emas 1) */}
    <g transform="translate(70, 22) scale(0.65)" fill={color}>
      {/* Wings */}
      <path d="M25 45 C30 25 15 8 5 5 C15 15 32 25 36 32 C42 22 55 12 70 8 C60 18 45 28 38 36 Z" />
      {/* Body & Tail */}
      <path d="M36 32 C38 36 40 44 42 55 L38 65 L43 56 L47 62 L44 50 C44 42 40 35 36 32 Z" />
      {/* Beak with Jasmine Twig */}
      <circle cx="18" cy="20" r="2" fill="#FAF7F5" />
    </g>

    {/* Lower Companion Swiftlet (Burung Walet Emas 2) */}
    <g transform="translate(130, 178) rotate(180) scale(0.65)" fill={color}>
      <path d="M25 45 C30 25 15 8 5 5 C15 15 32 25 36 32 C42 22 55 12 70 8 C60 18 45 28 38 36 Z" />
      <path d="M36 32 C38 36 40 44 42 55 L38 65 L43 56 L47 62 L44 50 C44 42 40 35 36 32 Z" />
      <circle cx="18" cy="20" r="2" fill="#FAF7F5" />
    </g>

    {/* Jasmine Flower Clusters along East and West */}
    <g fill="#FAF7F5">
      <circle cx="180" cy="100" r="4" />
      <circle cx="180" cy="94" r="2.5" />
      <circle cx="180" cy="106" r="2.5" />
      <circle cx="174" cy="100" r="2.5" />

      <circle cx="20" cy="100" r="4" />
      <circle cx="20" cy="94" r="2.5" />
      <circle cx="20" cy="106" r="2.5" />
      <circle cx="26" cy="100" r="2.5" />
    </g>

    {/* Golden Center Stamens */}
    <circle cx="180" cy="100" r="1.5" fill={color} />
    <circle cx="20" cy="100" r="1.5" fill={color} />
  </svg>
);
