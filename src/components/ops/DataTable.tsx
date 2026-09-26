import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  className?: string;
  /** Cell shown in the stacked mobile-card layout; defaults to render(). */
  mobileLabel?: string;
}

/** Hairline table on desktop; stacked cards on phones (<640px). */
export const DataTable = <T,>({ columns, rows, rowKey, onRowClick, selected, onToggleSelect }: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  selected?: Set<string>;
  onToggleSelect?: (key: string) => void;
}) => (
  <div>
    {/* Desktop / tablet table */}
    <div className="hidden overflow-x-auto rounded-xl border border-line sm:block">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-rail/60">
            {onToggleSelect && <th className="w-10 px-3 py-2.5" />}
            {columns.map((col) => (
              <th key={col.key} className={cn("px-3 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-dim", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = rowKey(row);
            return (
              <tr
                key={key}
                onClick={() => onRowClick?.(row)}
                className={cn("border-b border-line last:border-0", onRowClick && "cursor-pointer hover:bg-rail/50")}
              >
                {onToggleSelect && (
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected?.has(key) ?? false}
                      onChange={() => onToggleSelect(key)}
                      aria-label="Select row"
                      className="h-4 w-4 rounded border-line-strong bg-rail accent-signal"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-3 py-2.5 align-middle text-ink", col.className)}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {/* Mobile stacked cards */}
    <div className="flex flex-col gap-2 sm:hidden">
      {rows.map((row) => {
        const key = rowKey(row);
        return (
          <div
            key={key}
            onClick={() => onRowClick?.(row)}
            className={cn("rounded-xl border border-line bg-deck p-3", onRowClick && "cursor-pointer active:bg-rail/50")}
          >
            <div className="flex items-start justify-between gap-2">
              {onToggleSelect && (
                <input
                  type="checkbox"
                  checked={selected?.has(key) ?? false}
                  onChange={(e) => {
                    e.stopPropagation();
                    onToggleSelect(key);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Select row"
                  className="mt-1 h-4 w-4 shrink-0 rounded border-line-strong bg-rail accent-signal"
                />
              )}
              <dl className="flex-1 space-y-1.5">
                {columns.map((col) => (
                  <div key={col.key} className="flex items-baseline justify-between gap-3">
                    <dt className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">{col.mobileLabel ?? col.header}</dt>
                    <dd className="min-w-0 truncate text-right text-ink">{col.render(row)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default DataTable;
