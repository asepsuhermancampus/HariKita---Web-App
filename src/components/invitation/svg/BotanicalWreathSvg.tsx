import React from "react";

interface SvgProps {
  className?: string;
  size?: number;
  primaryColor?: string;
  accentColor?: string;
}

export const BotanicalWreathSvg: React.FC<SvgProps> = ({
  className = "",
  size = 80,
  primaryColor = "#5C6F57",
  accentColor = "#B85D3B",
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
      {/* Curved Olive & Eucalyptus Branch (Left) */}
      <path
        d="M50 90 C25 90 12 70 12 50 C12 30 25 10 50 10"
        stroke={primaryColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Curved Branch (Right) */}
      <path
        d="M50 90 C75 90 88 70 88 50 C88 30 75 10 50 10"
        stroke={primaryColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Eucalyptus Leaves Left Arc */}
      <ellipse cx="28" cy="24" rx="5" ry="3" transform="rotate(-30 28 24)" fill={primaryColor} fillOpacity="0.4" stroke={primaryColor} strokeWidth="0.8" />
      <ellipse cx="14" cy="40" rx="6" ry="3.5" transform="rotate(-70 14 40)" fill={primaryColor} fillOpacity="0.35" stroke={primaryColor} strokeWidth="0.8" />
      <ellipse cx="16" cy="62" rx="6" ry="3.5" transform="rotate(70 16 62)" fill={primaryColor} fillOpacity="0.4" stroke={primaryColor} strokeWidth="0.8" />
      <ellipse cx="30" cy="78" rx="5" ry="3" transform="rotate(35 30 78)" fill={primaryColor} fillOpacity="0.45" stroke={primaryColor} strokeWidth="0.8" />

      {/* Eucalyptus Leaves Right Arc */}
      <ellipse cx="72" cy="24" rx="5" ry="3" transform="rotate(30 72 24)" fill={primaryColor} fillOpacity="0.4" stroke={primaryColor} strokeWidth="0.8" />
      <ellipse cx="86" cy="40" rx="6" ry="3.5" transform="rotate(70 86 40)" fill={primaryColor} fillOpacity="0.35" stroke={primaryColor} strokeWidth="0.8" />
      <ellipse cx="84" cy="62" rx="6" ry="3.5" transform="rotate(-70 84 62)" fill={primaryColor} fillOpacity="0.4" stroke={primaryColor} strokeWidth="0.8" />
      <ellipse cx="70" cy="78" rx="5" ry="3" transform="rotate(-35 70 78)" fill={primaryColor} fillOpacity="0.45" stroke={primaryColor} strokeWidth="0.8" />

      {/* Delicate Floral Accent Buds */}
      <circle cx="50" cy="10" r="3" fill={accentColor} />
      <circle cx="20" cy="28" r="2.2" fill={accentColor} fillOpacity="0.8" />
      <circle cx="80" cy="28" r="2.2" fill={accentColor} fillOpacity="0.8" />
      <circle cx="50" cy="90" r="2.5" fill={accentColor} />

      {/* Ribbon Knot Bottom */}
      <path d="M46 91 Q50 94 54 91 M48 93 L44 98 M52 93 L56 98" stroke={accentColor} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
};
