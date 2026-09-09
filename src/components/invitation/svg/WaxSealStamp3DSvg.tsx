import React from "react";

interface SvgProps {
  className?: string;
  size?: number;
  sealColor?: string;
  goldAccent?: string;
  initials?: string;
}

export const WaxSealStamp3DSvg: React.FC<SvgProps> = ({
  className = "",
  size = 72,
  sealColor = "#7D424D",
  goldAccent = "#CCA873",
  initials = "B & C",
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
      <defs>
        {/* Organic Wax Shading */}
        <radialGradient id="waxRadial3D" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
          <stop offset="40%" stopColor={sealColor} />
          <stop offset="100%" stopColor="#1C1014" />
        </radialGradient>
        {/* Embossed Drop Shadow */}
        <filter id="waxShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Irregular Melting Wax Outer Perimeter */}
      <path
        d="M50 8 C65 6 78 14 86 24 C95 35 94 52 90 66 C86 78 76 90 62 93 C48 96 32 94 20 84 C8 74 6 56 10 42 C14 26 32 10 50 8 Z"
        fill="url(#waxRadial3D)"
        filter="url(#waxShadow)"
      />

      {/* Inner Indented Rim (Cincin Tekanan Stempel) */}
      <circle
        cx="50"
        cy="50"
        r="32"
        fill={sealColor}
        stroke={goldAccent}
        strokeWidth="1.8"
        strokeOpacity="0.85"
      />

      {/* Subtle Concentric Beaded Circle */}
      <circle
        cx="50"
        cy="50"
        r="28"
        stroke={goldAccent}
        strokeWidth="0.75"
        strokeDasharray="2 2"
        strokeOpacity="0.6"
      />

      {/* Monogram Couple Initials (Timbul Prada Emas) */}
      <text
        x="50"
        y="55"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={goldAccent}
        fontSize="13"
        fontWeight="bold"
        fontFamily="serif"
        letterSpacing="1.5"
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}
      >
        {initials}
      </text>

      {/* Small Heart Crest Accent Under Initials */}
      <path
        d="M50 67 C48 64 45 64 45 66 C45 68 50 71 50 71 C50 71 55 68 55 66 C55 64 52 64 50 67 Z"
        fill={goldAccent}
        fillOpacity="0.9"
      />
    </svg>
  );
};
