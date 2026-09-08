import React from "react";
import Link from "next/link";
import Image from "next/image";

interface LogoBadgeProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export const LogoBadge: React.FC<LogoBadgeProps> = ({ size = "md", showTagline = true }) => {
  const dimension = size === "sm" ? 36 : size === "lg" ? 56 : 44;

  return (
    <Link href="/" className="flex items-center gap-3 group focus:outline-none">
      <div className="relative rounded-full overflow-hidden shadow-sm border border-gold/40 transition-transform duration-300 group-hover:scale-105">
        <Image
          src="/logo_cameo.png"
          alt="HariKita Cameo Emblem"
          width={dimension}
          height={dimension}
          className="object-cover"
          priority
        />
      </div>
      <div className="flex flex-col">
        <span className="font-serif-luxury text-xl font-bold tracking-tight text-plum group-hover:text-gold-dark transition-colors">
          HariKita
        </span>
        {showTagline && (
          <span className="text-[10px] uppercase tracking-widest text-plum-light font-medium -mt-1">
            Kebumen Curated
          </span>
        )}
      </div>
    </Link>
  );
};
