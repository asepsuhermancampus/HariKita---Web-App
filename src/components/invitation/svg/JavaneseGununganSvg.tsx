import React from "react";

interface SvgProps {
  className?: string;
  size?: number;
  primaryColor?: string;
  accentColor?: string;
}

export const JavaneseGununganSvg: React.FC<SvgProps> = ({
  className = "",
  size = 80,
  primaryColor = "#7D5B28",
  accentColor = "#CCA873",
}) => {
  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 100 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="gununganGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accentColor} />
          <stop offset="50%" stopColor={primaryColor} />
          <stop offset="100%" stopColor={accentColor} />
        </linearGradient>
      </defs>

      {/* Gunungan Outer Contour */}
      <path
        d="M50 5 C45 35 15 70 10 115 C10 130 90 130 90 115 C85 70 55 35 50 5 Z"
        fill="url(#gununganGoldGrad)"
        fillOpacity="0.12"
        stroke={primaryColor}
        strokeWidth="2"
      />

      {/* Inner Decorative Ridge */}
      <path
        d="M50 15 C46 40 22 72 18 110 C20 122 80 122 82 110 C78 72 54 40 50 15 Z"
        stroke={accentColor}
        strokeWidth="1.2"
        strokeDasharray="2 2"
      />

      {/* Tree of Life (Pohon Hayat Trunk & Branches) */}
      <path
        d="M50 125 L50 45 M50 95 Q35 85 28 72 M50 80 Q65 70 72 58 M50 65 Q38 55 34 45 M50 52 Q62 42 66 35"
        stroke={primaryColor}
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Garuda Claws / Gate Base (Kori Gapuran) */}
      <rect x="36" y="112" width="28" height="14" rx="2" fill={primaryColor} fillOpacity="0.25" stroke={primaryColor} strokeWidth="1.5" />
      <path d="M42 126 L42 118 Q50 114 58 118 L58 126" stroke={accentColor} strokeWidth="1.2" />

      {/* Crest Peak Crown (Puncak Mahkota Candi) */}
      <circle cx="50" cy="8" r="3" fill={accentColor} />
      <path d="M47 16 L53 16 M48 22 L52 22" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};
