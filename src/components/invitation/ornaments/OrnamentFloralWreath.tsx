import React from "react";

interface OrnamentFloralWreathProps {
  className?: string;
  color?: string;
  size?: number;
}

export const OrnamentFloralWreath: React.FC<OrnamentFloralWreathProps> = ({
  className = "w-20 h-20 text-rose-400",
  color = "currentColor",
  size = 80,
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Circular Botanical Garland */}
      <circle cx="50" cy="50" r="38" stroke={color} strokeWidth="1" strokeDasharray="4 2" />

      {/* Left Leaf Clusters */}
      <g transform="translate(18, 50)">
        <path d="M0 0 C-8 -6 -12 2 -4 8 C4 14 6 4 0 0 Z" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1" />
        <path d="M-2 -8 C-8 -14 -14 -8 -8 -2 C-2 4 4 -2 -2 -8 Z" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1" />
      </g>

      {/* Right Leaf Clusters */}
      <g transform="translate(82, 50) scale(-1, 1)">
        <path d="M0 0 C-8 -6 -12 2 -4 8 C4 14 6 4 0 0 Z" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1" />
        <path d="M-2 -8 C-8 -14 -14 -8 -8 -2 C-2 4 4 -2 -2 -8 Z" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1" />
      </g>

      {/* Bottom Rosebud Blossom */}
      <g transform="translate(50, 88)">
        <circle cx="0" cy="0" r="5" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1.2" />
        <path d="M-4 -2 C-6 -8 6 -8 4 -2" stroke={color} strokeWidth="1" />
        <path d="M-8 0 C-12 4 -4 8 0 4" stroke={color} strokeWidth="1" />
        <path d="M8 0 C12 4 4 8 0 4" stroke={color} strokeWidth="1" />
      </g>

      {/* Top Dainty Bow Flourish */}
      <g transform="translate(50, 12)">
        <circle cx="0" cy="0" r="2.5" fill={color} />
        <path d="M0 0 C-6 -4 -6 4 0 0 C6 -4 6 4 0 0" stroke={color} strokeWidth="1" fill={color} fillOpacity="0.3" />
      </g>
    </svg>
  );
};
