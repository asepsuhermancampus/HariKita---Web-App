import React from "react";
import { SvgAssetProps } from "../types";

export const BotanicalPin: React.FC<SvgAssetProps> = ({
  size = 20,
  color = "#5C6F57",
  className = "",
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Inner Leaf Accent */}
    <path
      d="M12 6 C10.5 7, 10 8.5, 12 11 C14 8.5, 13.5 7, 12 6 Z"
      fill={color}
      opacity="0.8"
    />
  </svg>
);
