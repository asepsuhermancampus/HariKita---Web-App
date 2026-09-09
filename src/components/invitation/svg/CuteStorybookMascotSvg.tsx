import React from "react";

interface SvgProps {
  className?: string;
  size?: number;
  primaryColor?: string;
  accentColor?: string;
}

export const CuteStorybookMascotSvg: React.FC<SvgProps> = ({
  className = "",
  size = 76,
  primaryColor = "#3D5943",
  accentColor = "#D98282",
}) => {
  return (
    <svg
      width={size}
      height={size * 0.9}
      viewBox="0 0 100 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left Bunny (Groom) */}
      <g transform="translate(18, 15)">
        {/* Left Ear */}
        <ellipse cx="10" cy="8" rx="4" ry="12" fill="#FFFFFF" stroke={primaryColor} strokeWidth="1.5" transform="rotate(-15 10 8)" />
        <ellipse cx="10" cy="8" rx="2" ry="8" fill={accentColor} fillOpacity="0.3" transform="rotate(-15 10 8)" />
        {/* Right Ear */}
        <ellipse cx="20" cy="6" rx="4" ry="12" fill="#FFFFFF" stroke={primaryColor} strokeWidth="1.5" transform="rotate(10 20 6)" />
        <ellipse cx="20" cy="6" rx="2" ry="8" fill={accentColor} fillOpacity="0.3" transform="rotate(10 20 6)" />
        {/* Head */}
        <circle cx="15" cy="24" r="14" fill="#FFFFFF" stroke={primaryColor} strokeWidth="1.5" />
        {/* Eyes (Happy Closed Arch) */}
        <path d="M10 24 Q12 21 14 24 M18 24 Q20 21 22 24" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" />
        {/* Nose & Blush */}
        <circle cx="16" cy="27" r="1.2" fill={accentColor} />
        <ellipse cx="8" cy="27" rx="2" ry="1.2" fill={accentColor} fillOpacity="0.5" />
        <ellipse cx="24" cy="27" rx="2" ry="1.2" fill={accentColor} fillOpacity="0.5" />
        {/* Little Bowtie */}
        <path d="M13 36 L19 40 L19 36 L13 40 Z" fill={primaryColor} />
      </g>

      {/* Right Bunny (Bride with Floral Veil) */}
      <g transform="translate(48, 15)">
        {/* Left Ear */}
        <ellipse cx="14" cy="6" rx="4" ry="12" fill="#FFFFFF" stroke={primaryColor} strokeWidth="1.5" transform="rotate(-10 14 6)" />
        <ellipse cx="14" cy="6" rx="2" ry="8" fill={accentColor} fillOpacity="0.3" transform="rotate(-10 14 6)" />
        {/* Right Ear with Flower */}
        <ellipse cx="24" cy="8" rx="4" ry="12" fill="#FFFFFF" stroke={primaryColor} strokeWidth="1.5" transform="rotate(15 24 8)" />
        <ellipse cx="24" cy="8" rx="2" ry="8" fill={accentColor} fillOpacity="0.3" transform="rotate(15 24 8)" />
        {/* Veil Flower Crown */}
        <circle cx="21" cy="14" r="3" fill={accentColor} />
        <circle cx="25" cy="16" r="2" fill="#F7D070" />
        {/* Head */}
        <circle cx="18" cy="24" r="14" fill="#FFFFFF" stroke={primaryColor} strokeWidth="1.5" />
        {/* Eyes with Eyelashes */}
        <path d="M13 24 Q15 21 17 24 M21 24 Q23 21 25 24" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M26 23 L28 21" stroke={primaryColor} strokeWidth="1" strokeLinecap="round" />
        {/* Nose & Blush */}
        <circle cx="19" cy="27" r="1.2" fill={accentColor} />
        <ellipse cx="12" cy="27" rx="2" ry="1.2" fill={accentColor} fillOpacity="0.5" />
        <ellipse cx="26" cy="27" rx="2" ry="1.2" fill={accentColor} fillOpacity="0.5" />
      </g>

      {/* Floating Love Heart Between Them */}
      <path
        d="M50 16 C48 11 42 11 42 15 C42 20 50 24 50 24 C50 24 58 20 58 15 C58 11 52 11 50 16 Z"
        fill={accentColor}
      />
    </svg>
  );
};
