"use client";

import { ArrowUpRight } from "lucide-react";
import type { IssueRow } from "@/lib/analysis";

interface TopIssuesProps {
  issues: IssueRow[];
  className?: string;
  onIssueClick?: (issue: IssueRow) => void;
}

export function TopIssues({ issues, className, onIssueClick }: TopIssuesProps) {
  const max = Math.max(1, ...issues.map((i) => i.mentions));

  return (
    <div className={`glass glass-border rounded-2xl p-6 ${className ?? ""}`}>
      <h3 className="text-sm font-semibold text-white mb-1">Top issue drivers</h3>
      <p className="text-xs text-slate-400 mb-5">
        Negative-review mentions this week{onIssueClick ? " · click to drill down" : ""}
      </p>
      <div className="space-y-4">
        {issues.map((issue) => {
          const rising = issue.change_pct > 0;
          return (
            <button
              key={`${issue.product}-${issue.issue}`}
              type="button"
              onClick={() => onIssueClick?.(issue)}
              className="w-full text-left rounded-lg px-1.5 py-1 -mx-1.5 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm text-white truncate flex items-center gap-1">
                    {issue.issue}
                    {onIssueClick && <ArrowUpRight className="w-3 h-3 text-slate-500" />}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{issue.product}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-white">{issue.mentions}</span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${
                      rising
                        ? "text-red-400 border-red-500/20 bg-red-500/10"
                        : "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                    }`}
                  >
                    {issue.previous_mentions === 0
                      ? "new"
                      : `${rising ? "+" : ""}${issue.change_pct.toFixed(0)}%`}
                  </span>
                </div>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500"
                  style={{ width: `${(issue.mentions / max) * 100}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
