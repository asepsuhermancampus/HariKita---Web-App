import React from "react";

export function DashPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="font-editorial text-3xl font-normal text-hk-charcoal sm:text-4xl">{title}</h1>
        {description && <p className="mt-1 text-xs text-hk-taupe sm:text-sm">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
