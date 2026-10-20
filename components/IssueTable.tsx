"use client";

import type { IssueRow } from "@/lib/analysis";

interface IssueTableProps {
  issues: IssueRow[];
  title?: string;
  onRowClick?: (issue: IssueRow) => void;
}

export function IssueTable({ issues, title, onRowClick }: IssueTableProps) {
  return (
    <div className="glass glass-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        {title && <h3 className="text-sm font-semibold text-white">{title}</h3>}
        {onRowClick && <span className="text-[11px] text-slate-500">click a row to drill down</span>}
      </div>
      {issues.length === 0 ? (
        <p className="text-sm text-slate-400">No negative-review issues detected.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 border-b border-white/10">
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium">Issue</th>
                <th className="pb-2 font-medium text-right">Mentions</th>
                <th className="pb-2 font-medium text-right">Prior</th>
                <th className="pb-2 font-medium text-right">WoW</th>
                <th className="pb-2 font-medium text-right">Avg rating</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((row, i) => (
                <tr
                  key={`${row.product}-${row.issue}-${i}`}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-white/5 last:border-0 ${
                    onRowClick ? "cursor-pointer hover:bg-white/[0.04]" : ""
                  }`}
                >
                  <td className="py-2.5 text-slate-300 whitespace-nowrap">{row.product}</td>
                  <td className="py-2.5 text-white">{row.issue}</td>
                  <td className="py-2.5 text-right font-semibold text-white">{row.mentions}</td>
                  <td className="py-2.5 text-right text-slate-400">{row.previous_mentions}</td>
                  <td
                    className={`py-2.5 text-right font-semibold ${
                      row.previous_mentions === 0
                        ? "text-blue-400"
                        : row.change_pct > 0
                          ? "text-red-400"
                          : row.change_pct < 0
                            ? "text-emerald-400"
                            : "text-slate-400"
                    }`}
                  >
                    {row.previous_mentions === 0
                      ? "new"
                      : `${row.change_pct > 0 ? "+" : ""}${row.change_pct.toFixed(0)}%`}
                  </td>
                  <td className="py-2.5 text-right text-slate-400">{row.avg_rating.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
