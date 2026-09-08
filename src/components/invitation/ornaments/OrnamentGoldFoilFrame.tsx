import React from "react";

interface OrnamentGoldFoilFrameProps {
  className?: string;
  color?: string;
  size?: number;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export const OrnamentGoldFoilFrame: React.FC<OrnamentGoldFoilFrameProps> = ({
  className = "w-16 h-16 text-gold",
  color = "currentColor",
  size = 64,
  position = "top-left",
}) => {
  let transform = "";
  if (position === "top-right") transform = "scale(-1, 1)";
  if (position === "bottom-left") transform = "scale(1, -1)";
  if (position === "bottom-right") transform = "scale(-1, -1)";

  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g transform={transform} style={{ transformOrigin: "40px 40px" }}>
        {/* Main Corner L-bracket hairline */}
        <path d="M5 40 L5 8 C5 6 6 5 8 5 L40 5" stroke={color} strokeWidth="1.8" />
        <path d="M12 40 L12 14 C12 13 13 12 14 12 L40 12" stroke={color} strokeWidth="1" strokeDasharray="3 2" />

        {/* Baroque Scroll Filigree */}
        <path
          d="M18 18 C24 14 30 20 25 25 C20 30 14 24 18 18 Z"
          fill={color}
          fillOpacity="0.2"
          stroke={color}
          strokeWidth="1.2"
        />
        <circle cx="8" cy="8" r="2.5" fill={color} />
        <circle cx="20" cy="5" r="1.5" fill={color} />
        <circle cx="5" cy="20" r="1.5" fill={color} />
      </g>
    </svg>
  );
};
