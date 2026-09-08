import React from "react";

interface OrnamentGununganProps {
  className?: string;
  color?: string;
  size?: number;
}

export const OrnamentGunungan: React.FC<OrnamentGununganProps> = ({
  className = "w-16 h-24 text-gold",
  color = "currentColor",
  size = 64,
}) => {
  return (
    <svg
      viewBox="0 0 100 150"
      width={size}
      height={size * 1.5}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Leaf Silhouette of Gunungan */}
      <path
        d="M50 5 C52 20 68 35 78 55 C88 75 92 95 86 115 C82 128 72 138 58 142 L58 148 L42 148 L42 142 C28 138 18 128 14 115 C8 95 12 75 22 55 C32 35 48 20 50 5 Z"
        fill={color}
        fillOpacity="0.12"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Inner Tree of Life (Pohon Hayat) Trunk & Branches */}
      <path
        d="M50 20 L50 142 M50 50 C40 45 32 55 28 65 M50 50 C60 45 68 55 72 65 M50 75 C38 70 30 82 24 95 M50 75 C62 70 70 82 76 95 M50 100 C36 95 28 108 26 120 M50 100 C64 95 72 108 74 120"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Apex Crown Finial */}
      <circle cx="50" cy="8" r="3" fill={color} />
      <path d="M46 16 L54 16 M44 24 L56 24" stroke={color} strokeWidth="1.2" strokeLinecap="round" />

      {/* Gatehouse Motif at Base */}
      <path
        d="M40 120 L40 142 L60 142 L60 120 C60 115 40 115 40 120 Z"
        fill={color}
        fillOpacity="0.25"
        stroke={color}
        strokeWidth="1.2"
      />
    </svg>
  );
};
