import React from "react";

interface OrnamentMinimalLineProps {
  className?: string;
  color?: string;
  width?: number | string;
}

export const OrnamentMinimalLine: React.FC<OrnamentMinimalLineProps> = ({
  className = "w-full my-4 text-charcoal",
  color = "currentColor",
}) => {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="h-[1px] flex-1 bg-current opacity-30" style={{ backgroundColor: color }} />
      <div
        className="w-2 h-2 rotate-45 border border-current opacity-60"
        style={{ borderColor: color }}
      />
      <div className="h-[1px] flex-1 bg-current opacity-30" style={{ backgroundColor: color }} />
    </div>
  );
};
