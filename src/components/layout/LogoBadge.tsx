import React from "react";
import Link from "next/link";
import Image from "next/image";

interface LogoBadgeProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  variant?: "default" | "light";
}

export const LogoBadge: React.FC<LogoBadgeProps> = ({
  size = "md",
  showTagline = true,
  variant = "default",
}) => {
  const dimension = size === "sm" ? 40 : size === "lg" ? 64 : 52;
  const isLight = variant === "light";

  return (
    <Link href="/" className="flex items-center gap-3 sm:gap-3.5 group focus:outline-none select-none">
      <div
        className={`relative rounded-full overflow-hidden shrink-0 shadow-md shadow-plum/20 ring-2 ring-gold/45 transition-all duration-300 group-hover:scale-105 group-hover:ring-gold/80 group-hover:shadow-lg group-hover:shadow-plum/30 ${
          size === "sm"
            ? "w-10 h-10"
            : size === "lg"
            ? "w-16 h-16"
            : "w-11 h-11 sm:w-[52px] sm:h-[52px]"
        }`}
      >
        <Image
          src="/logo_badge.png"
          alt="HariKita Cameo Emblem"
          width={dimension}
          height={dimension}
          className="w-full h-full object-cover"
          priority
        />
      </div>
      <div className="flex flex-col justify-center">
        <span
          className={`font-serif-luxury text-xl sm:text-2xl font-bold tracking-tight transition-colors leading-tight ${
            isLight
              ? "text-canvas group-hover:text-gold-light"
              : "text-plum group-hover:text-gold-dark"
          }`}
        >
          HariKita
        </span>
        {showTagline && (
          <span
            className={`text-[9px] sm:text-[10.5px] uppercase tracking-[0.24em] font-semibold transition-colors mt-0.5 ${
              isLight ? "text-gold-light/90" : "text-gold-dark"
            }`}
          >
            Kebumen Curated
          </span>
        )}
      </div>
    </Link>
  );
};

