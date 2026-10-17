import React from "react";

export interface Column<T> {
  key: string;
  header: string;
  isNumeric?: boolean;
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  className?: string;
  emptyMessage?: string;
  showShareBar?: boolean;
  getShareValue?: (row: T) => number; // 0 to 1
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  className = "",
  emptyMessage = "No telemetry recorded for this timeframe.",
  showShareBar = false,
  getShareValue,
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-[12px] font-sans text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`w-full overflow-x-auto select-none ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-raised rounded-xl overflow-hidden border-b border-border">
            {columns.map((col, idx) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={`py-2 px-3 text-[12px] font-sans font-medium text-muted tracking-tight ${
                  col.isNumeric ? "text-right" : "text-left"
                } ${idx === 0 ? "rounded-l-xl" : ""} ${
                  idx === columns.length - 1 ? "rounded-r-xl" : ""
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {data.map((row, rowIdx) => {
            const share = showShareBar && getShareValue ? getShareValue(row) : 0;
            return (
              <tr
                key={keyExtractor(row, rowIdx)}
                className="group relative hover:bg-raised/80 transition-colors duration-150"
              >
                {columns.map((col) => {
                  const content = col.render ? col.render(row, rowIdx) : String((row as Record<string, unknown>)[col.key] ?? "");
                  return (
                    <td
                      key={col.key}
                      className={`py-2.5 px-3 text-[13px] text-white relative ${
                        col.isNumeric ? "text-right font-mono tabular-nums text-muted group-hover:text-white" : "font-sans"
                      }`}
                    >
                      {/* Optional inline hatched-ember bar behind value for share of total */}
                      {col.isNumeric && share > 0 && (
                        <div
                          className="absolute inset-y-1 right-2 rounded-full hatch-accent pointer-events-none"
                          style={{
                            width: `${Math.min(Math.max(share * 100, 4), 100)}%`,
                            opacity: 0.25,
                          }}
                        />
                      )}
                      <span className="relative z-10">{content}</span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
