import React from "react";

export function DashCard({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-hk-champagne/30 bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hk-soft-beige px-5 py-4">
          <div>
            {title && <div className="font-editorial text-lg font-medium text-hk-charcoal">{title}</div>}
            {description && <div className="mt-0.5 text-xs text-hk-taupe">{description}</div>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
