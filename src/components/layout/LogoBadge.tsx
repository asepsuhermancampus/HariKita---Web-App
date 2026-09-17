import React from "react";
import { HariKitaLogo } from "@/components/brand/HariKitaLogo";

export interface LogoBadgeProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  variant?: "default" | "light";
  className?: string;
}

export const LogoBadge: React.FC<LogoBadgeProps> = ({
  size = "md",
  showTagline = true,
  variant = "default",
  className = "",
}) => {
  const tone = variant === "light" ? "light" : "dark";

  return (
    <div className={`inline-flex items-center ${className}`}>
      <HariKitaLogo
        variant="horizontal"
        tone={tone}
        size={size}
        showSubtitle={showTagline}
        asLink={true}
        href="/"
      />
    </div>
  );
};
