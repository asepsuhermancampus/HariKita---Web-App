import React from "react";

export function AdminCard({
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
    <div className={`rounded-2xl border border-hk-soft-beige bg-white shadow-xs ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hk-soft-beige px-5 py-4">
          <div>
            {title && <div className="text-[15px] font-bold text-hk-charcoal">{title}</div>}
            {description && <div className="mt-0.5 text-xs text-plum-light">{description}</div>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
