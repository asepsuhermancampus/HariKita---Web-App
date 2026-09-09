import React from "react";

interface SvgProps {
  className?: string;
  size?: number;
  primaryColor?: string;
  accentColor?: string;
}

export const RusticPampasTwineSvg: React.FC<SvgProps> = ({
  className = "",
  size = 76,
  primaryColor = "#5C4033",
  accentColor = "#C49A6C",
}) => {
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Pampas Stem 1 (Center Arch) */}
      <path d="M50 115 Q48 70 50 20" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" />

      {/* Pampas Feathers / Plumes Center */}
      <path d="M50 20 Q40 12 32 15 M50 28 Q36 22 28 27 M50 38 Q34 32 26 40 M50 48 Q35 44 30 52" stroke={accentColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
      <path d="M50 20 Q60 12 68 15 M50 28 Q64 22 72 27 M50 38 Q66 32 74 40 M50 48 Q65 44 70 52" stroke={accentColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />

      {/* Pampas Stem 2 (Left Leaning) */}
      <path d="M48 115 Q40 80 32 45" stroke={primaryColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
      <path d="M32 45 Q22 38 18 42 M35 55 Q24 50 18 58" stroke={accentColor} strokeWidth="1" strokeLinecap="round" opacity="0.7" />

      {/* Pampas Stem 3 (Right Leaning) */}
      <path d="M52 115 Q60 80 68 45" stroke={primaryColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
      <path d="M68 45 Q78 38 82 42 M65 55 Q76 50 82 58" stroke={accentColor} strokeWidth="1" strokeLinecap="round" opacity="0.7" />

      {/* Jute Twine Bow Knot (Simpul Tali Rami) */}
      <g transform="translate(50, 95)">
        {/* Horizontal Wrap Lines */}
        <line x1="-15" y1="-3" x2="15" y2="-3" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="-15" y1="2" x2="15" y2="2" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
        {/* Left Loop */}
        <path d="M-4 0 C-18 -12 -22 8 -6 4" stroke={accentColor} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {/* Right Loop */}
        <path d="M4 0 C18 -12 22 8 6 4" stroke={accentColor} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {/* Dangling Twine Tails */}
        <path d="M-3 3 Q-8 16 -12 22 M3 3 Q6 14 10 20" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
};
