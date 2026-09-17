import React from "react";

export interface SvgAssetProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  secondaryColor?: string;
  strokeWidth?: number;
  className?: string;
  animated?: boolean;
}
