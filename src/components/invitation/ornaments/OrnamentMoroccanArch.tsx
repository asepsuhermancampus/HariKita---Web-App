import React from "react";

interface OrnamentMoroccanArchProps {
  className?: string;
  color?: string;
  size?: number;
}

export const OrnamentMoroccanArch: React.FC<OrnamentMoroccanArchProps> = ({
  className = "w-16 h-16 text-emerald-700",
  color = "currentColor",
  size = 64,
}) => {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Pointed Horseshoe Arch */}
      <path
        d="M20 110 L20 60 C20 40 32 25 50 15 C56 12 64 12 70 15 C88 25 100 40 100 60 L100 110"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Inner Inset Arch with Scalloped Cusps */}
      <path
        d="M28 110 L28 64 C28 50 36 38 50 30 C56 26 64 26 70 30 C84 38 92 50 92 64 L92 110"
        stroke={color}
        strokeWidth="1.2"
        strokeDasharray="3 3"
      />

      {/* Islamic 8-Point Star at Apex */}
      <g transform="translate(60, 26) scale(0.65)">
        <rect x="-10" y="-10" width="20" height="20" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.5" />
        <rect
          x="-10"
          y="-10"
          width="20"
          height="20"
          fill={color}
          fillOpacity="0.15"
          stroke={color}
          strokeWidth="1.5"
          transform="rotate(45)"
        />
        <circle cx="0" cy="0" r="2.5" fill={color} />
      </g>

      {/* Baseline Arabesque Flourish */}
      <path
        d="M10 110 L110 110 M40 110 C45 105 55 105 60 110 C65 105 75 105 80 110"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
};
