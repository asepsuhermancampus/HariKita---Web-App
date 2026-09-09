import React from "react";

interface SvgProps {
  className?: string;
  size?: number;
  primaryColor?: string;
  accentColor?: string;
}

export const IslamicArabesqueArchSvg: React.FC<SvgProps> = ({
  className = "",
  size = 76,
  primaryColor = "#1F4738",
  accentColor = "#CBA14A",
}) => {
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 100 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="islamicArchGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accentColor} />
          <stop offset="100%" stopColor={primaryColor} />
        </linearGradient>
      </defs>

      {/* Pointed Horseshoe Arch (Lengkungan Mihrab Tapal Kuda) */}
      <path
        d="M15 125 L15 65 C15 35 35 15 50 5 C65 15 85 35 85 65 L85 125"
        stroke={accentColor}
        strokeWidth="2"
        fill="none"
      />

      {/* Inner Nested Arch */}
      <path
        d="M22 125 L22 68 C22 42 38 24 50 16 C62 24 78 42 78 68 L78 125"
        stroke={primaryColor}
        strokeWidth="1.2"
        strokeDasharray="3 3"
        fill="none"
      />

      {/* Spandrel Decorative Arabesque Filigree */}
      <path
        d="M15 35 Q28 20 38 28 Q48 12 50 5 Q52 12 62 28 Q72 20 85 35"
        stroke={accentColor}
        strokeWidth="1"
        fill="none"
      />

      {/* 8-Point Rub-el-Hizb Geometric Star (Oktagram) */}
      <g transform="translate(50, 48) scale(0.65)">
        <rect x="-16" y="-16" width="32" height="32" stroke={accentColor} strokeWidth="1.8" fill={accentColor} fillOpacity="0.15" />
        <rect x="-16" y="-16" width="32" height="32" stroke={accentColor} strokeWidth="1.8" transform="rotate(45)" fill={accentColor} fillOpacity="0.15" />
        <circle cx="0" cy="0" r="4.5" fill={primaryColor} />
      </g>

      {/* Hanging Lantern / Lampu Gantung Nabawi */}
      <line x1="50" y1="5" x2="50" y2="35" stroke={accentColor} strokeWidth="1" strokeDasharray="2 1" />
      <path d="M46 36 L54 36 L52 44 L48 44 Z" fill={accentColor} />

      {/* Pillar Base Trim */}
      <rect x="10" y="123" width="10" height="4" fill={accentColor} />
      <rect x="80" y="123" width="10" height="4" fill={accentColor} />
    </svg>
  );
};
