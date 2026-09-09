import React from "react";

interface SvgProps {
  className?: string;
  size?: number;
  primaryColor?: string;
  accentColor?: string;
}

export const CelestialConstellationSvg: React.FC<SvgProps> = ({
  className = "",
  size = 80,
  primaryColor = "#0D1326",
  accentColor = "#CCA873",
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Crescent Moon Outline */}
      <path
        d="M50 15 C30 15 15 32 15 50 C15 68 30 85 50 85 C38 75 34 58 40 42 C44 32 50 24 60 18 C56 16 53 15 50 15 Z"
        fill={accentColor}
        fillOpacity="0.25"
        stroke={accentColor}
        strokeWidth="1.2"
      />

      {/* Constellation Connection Lines */}
      <path
        d="M32 30 L45 22 L62 26 L78 40 L68 62 L52 72 L38 65 L45 48 Z"
        stroke={accentColor}
        strokeWidth="0.8"
        strokeDasharray="2 2"
        opacity="0.6"
      />

      {/* Constellation Star Nodes */}
      <circle cx="32" cy="30" r="2.5" fill={accentColor} />
      <circle cx="45" cy="22" r="2" fill="#FFFFFF" />
      <circle cx="62" cy="26" r="3" fill={accentColor} />
      <circle cx="78" cy="40" r="2.2" fill="#FFFFFF" />
      <circle cx="68" cy="62" r="2.5" fill={accentColor} />
      <circle cx="52" cy="72" r="2" fill="#FFFFFF" />
      <circle cx="38" cy="65" r="2" fill={accentColor} />
      <circle cx="45" cy="48" r="3" fill="#FFFFFF" />

      {/* Central Radiating North Star (Bintang Polaris 4 Sudut) */}
      <g transform="translate(68, 20)">
        <path d="M0 -8 L0 8 M-8 0 L8 0" stroke={accentColor} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M-4 -4 L4 4 M-4 4 L4 -4" stroke={accentColor} strokeWidth="0.8" opacity="0.6" />
        <circle cx="0" cy="0" r="1.5" fill="#FFFFFF" />
      </g>

      {/* Tiny Twinkles */}
      <circle cx="22" cy="50" r="1" fill="#FFFFFF" opacity="0.8" />
      <circle cx="82" cy="68" r="1.2" fill={accentColor} opacity="0.8" />
      <circle cx="30" cy="80" r="1" fill="#FFFFFF" opacity="0.6" />
    </svg>
  );
};
