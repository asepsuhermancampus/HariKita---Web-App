import React from "react";
import { SvgAssetProps } from "../types";

export const FiorellaSpringWreath: React.FC<SvgAssetProps> = ({
  size = 140,
  color = "#D47385",
  secondaryColor = "#8EA881",
  className = "",
  animated = true,
  ...props
}) => (
  <svg
    viewBox="0 0 200 200"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${animated ? "animate-spin-slow" : ""} ${className}`}
    {...props}
  >
    {/* Fine Wildflower Double Ring */}
    <circle cx="100" cy="100" r="82" stroke={secondaryColor} strokeWidth="1.2" strokeDasharray="5 7" opacity="0.45" />
    <circle cx="100" cy="100" r="76" stroke={color} strokeWidth="0.8" opacity="0.3" />

    {/* Spring Wildflower Blooms & Petals */}
    <g fill={color} opacity="0.88">
      {/* 5-Petal Flower Top */}
      <circle cx="100" cy="18" r="4.5" />
      <circle cx="95" cy="15" r="3.5" />
      <circle cx="105" cy="15" r="3.5" />
      <circle cx="97" cy="22" r="3.5" />
      <circle cx="103" cy="22" r="3.5" />

      {/* Wildflower East */}
      <circle cx="182" cy="100" r="5" />
      <circle cx="182" cy="94" r="3.5" />
      <circle cx="182" cy="106" r="3.5" />
      <circle cx="176" cy="100" r="3.5" />
      <circle cx="188" cy="100" r="3.5" />

      {/* Floating Petals Drift */}
      <path d="M145 35 C150 42, 155 45, 160 48 C153 50, 147 45, 145 35 Z" />
      <path d="M50 150 C45 158, 42 165, 38 170 C43 165, 48 158, 50 150 Z" />
      <path d="M165 145 C172 150, 178 152, 182 155 C176 156, 170 152, 165 145 Z" />
    </g>

    {/* Spring Leaf Branches */}
    <g fill={secondaryColor} opacity="0.85">
      <path d="M125 24 Q132 20 138 22 Q132 28 125 24 Z" />
      <path d="M68 32 Q62 25 56 26 Q60 34 68 32 Z" />
      <path d="M172 125 Q178 132 184 130 Q178 138 172 125 Z" />
      <path d="M28 100 Q20 95 18 102 Q25 106 28 100 Z" />
      <path d="M100 182 Q92 188 88 184 Q95 178 100 182 Z" />
    </g>

    {/* Golden Stamen Dots */}
    <circle cx="100" cy="18" r="2" fill="#E8C779" />
    <circle cx="182" cy="100" r="2" fill="#E8C779" />
  </svg>
);
