import React from "react";

export interface DashColumn {
  key: string;
  header: string;
  className?: string;
}

export function DashTable<T>({
  columns,
  rows,
  renderRow,
  empty,
}: {
  columns: DashColumn[];
  rows: T[];
  renderRow: (row: T, index: number) => React.ReactNode[];
  empty?: React.ReactNode;
}) {
  if (rows.length === 0 && empty) return <>{empty}</>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={`border-b border-hk-soft-beige px-4 py-3 text-left font-manrope text-[11px] font-bold uppercase tracking-wide text-hk-taupe ${c.className ?? ""}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-hk-ivory">
              {renderRow(row, i).map((cell, j) => (
                <td key={j} className="border-b border-hk-soft-beige/50 px-4 py-3.5 text-hk-charcoal">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
