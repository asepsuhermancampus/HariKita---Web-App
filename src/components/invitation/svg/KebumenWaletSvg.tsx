import React from "react";

interface SvgProps {
  className?: string;
  size?: number;
  primaryColor?: string;
  accentColor?: string;
}

export const KebumenWaletSvg: React.FC<SvgProps> = ({
  className = "",
  size = 72,
  primaryColor = "#CCA873",
  accentColor = "#7D5B28",
}) => {
  return (
    <svg
      width={size}
      height={size * 0.7}
      viewBox="0 0 100 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="waletGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="100%" stopColor={accentColor} />
        </linearGradient>
      </defs>

      {/* Swift Bird 1 (Left Facing Upper) */}
      <g>
        {/* Curved Wings */}
        <path
          d="M25 45 C30 25 15 8 5 5 C15 15 32 25 36 32 C42 22 55 12 70 8 C60 18 45 28 38 36"
          fill="url(#waletGoldGradient)"
          stroke={accentColor}
          strokeWidth="0.75"
        />
        {/* Slender Body & Forked Tail */}
        <path
          d="M36 32 C38 36 40 44 42 55 L38 65 L43 56 L47 62 L44 50 C44 42 40 35 36 32 Z"
          fill="url(#waletGoldGradient)"
        />
        {/* Head and Beak */}
        <circle cx="34" cy="30" r="3" fill={accentColor} />
        <path d="M32 29 L28 28" stroke={accentColor} strokeWidth="1.2" strokeLinecap="round" />
        {/* Jasmine Twig in Beak */}
        <path d="M28 28 Q24 22 18 20" stroke={primaryColor} strokeWidth="1" strokeLinecap="round" />
        <circle cx="18" cy="20" r="1.5" fill="#FAF7F5" stroke={primaryColor} strokeWidth="0.5" />
      </g>

      {/* Swift Bird 2 (Companion Silhouette Lower Right) */}
      <g opacity="0.65" transform="translate(35, 12) scale(0.65)">
        <path
          d="M25 45 C30 25 15 8 5 5 C15 15 32 25 36 32 C42 22 55 12 70 8 C60 18 45 28 38 36"
          fill="url(#waletGoldGradient)"
        />
        <path
          d="M36 32 C38 36 40 44 42 55 L38 65 L43 56 L47 62 L44 50 C44 42 40 35 36 32 Z"
          fill="url(#waletGoldGradient)"
        />
      </g>
    </svg>
  );
};
