"use client";

import { ArrowUpRight, LayoutGrid } from "lucide-react";
import type { PlatformMatrix as Matrix } from "@/lib/diagnostics";
import { isSimulatedPlatform, platformLabel } from "@/lib/diagnostics";
import { ROOT_CAUSE_META } from "@/lib/rootCause";
import type { NavContext, ViewKey } from "@/lib/nav";

export function PlatformMatrix({
  matrix,
  onNavigate,
}: {
  matrix: Matrix;
  onNavigate: (view: ViewKey, context?: NavContext) => void;
}) {
  const rows = matrix.rows.slice(0, 9);
  const maxCell = Math.max(1, ...rows.flatMap((row) => row.cells.map((cell) => cell.mentions)));

  if (matrix.platforms.length === 0) {
    return null;
  }

  return (
    <section className="glass glass-border rounded-2xl p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <LayoutGrid className="h-4 w-4 text-teal-400" /> Platform Sentiment Matrix
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Where each complaint concentrates, alongside each channel&apos;s positive share.
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {matrix.platforms.length} channels · {matrix.negativeTotal} negatives
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-slate-900/95 pb-3 pr-4 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 backdrop-blur">
                Complaint theme
              </th>
              {matrix.platforms.map((platform) => (
                <th key={platform.platform} className="min-w-[120px] px-1 pb-3 text-left align-bottom">
                  <button
                    type="button"
                    onClick={() => onNavigate("reviews", { platform: platform.platform })}
                    className="group w-full rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                    title={platform.platform}
                  >
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-white">
                      <span className="truncate">{platformLabel(platform.platform)}</span>
                      <ArrowUpRight className="h-3 w-3 shrink-0 text-slate-600 group-hover:text-teal-400" />
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[9px] font-normal normal-case tracking-normal text-slate-500">
                      {platform.reviews} reviews
                      {isSimulatedPlatform(platform.platform) && (
                        <span className="rounded border border-white/10 px-1 text-[8px] uppercase tracking-wide text-slate-600">
                          sim
                        </span>
                      )}
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-[9px] font-semibold text-red-400">
                      <span className="h-1 w-1 rounded-full bg-red-400" />
                      {platform.negativeShare}% neg
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.issue}>
                <td className="sticky left-0 z-10 border-t border-white/5 bg-slate-900/95 py-2.5 pr-4 backdrop-blur">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        row.cause === "PRODUCT_DEFECT"
                          ? "bg-amber-400"
                          : row.cause === "OPERATIONAL_ERROR"
                            ? "bg-sky-400"
                            : "bg-slate-500"
                      }`}
                      title={
                        row.cause
                          ? ROOT_CAUSE_META[row.cause].label
                          : "Unclassified complaint theme"
                      }
                    />
                    {row.issue}
                  </span>
                  <span className="mt-0.5 block text-[9px] text-slate-500">{row.total} total</span>
                </td>
                {row.cells.map((cell) => {
                  const heat = cell.mentions / maxCell;
                  return (
                    <td key={cell.platform} className="border-t border-white/5 p-1">
                      <button
                        type="button"
                        disabled={cell.mentions === 0}
                        onClick={() =>
                          onNavigate("reviews", {
                            platform: cell.platform,
                            issue: row.issue,
                          })
                        }
                        title={
                          cell.mentions > 0
                            ? `${cell.mentions} mentions · ${cell.shareOfIssue}% of all "${row.issue}" complaints · ${cell.shareOfPlatformNegative}% of ${platformLabel(cell.platform)} negatives`
                            : `No "${row.issue}" mentions on ${platformLabel(cell.platform)}`
                        }
                        className={`h-12 w-full rounded-lg border px-2 text-left transition-colors ${
                          cell.mentions > 0
                            ? "border-teal-500/15 hover:border-teal-400/40 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                            : "cursor-default border-transparent"
                        }`}
                        style={
                          cell.mentions > 0
                            ? {
                                backgroundColor: `rgba(45, 212, 191, ${0.05 + heat * 0.24})`,
                              }
                            : undefined
                        }
                      >
                        {cell.mentions > 0 ? (
                          <>
                            <span className="text-xs font-semibold text-white">{cell.mentions}</span>
                            <span className="ml-1 text-[9px] text-teal-200/70">
                              {cell.shareOfIssue}%
                            </span>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-700">—</span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td className="sticky left-0 z-10 border-t border-white/10 bg-slate-900/95 py-3 pr-4 backdrop-blur">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  Positive share
                </span>
              </td>
              {matrix.platforms.map((platform) => (
                <td key={platform.platform} className="border-t border-white/10 p-1">
                  <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.06] px-2 py-2.5">
                    <p className="text-xs font-semibold text-emerald-300">{platform.positiveShare}%</p>
                    <p className="text-[9px] text-emerald-500/70">
                      {platform.positive} positive
                    </p>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
        <p>
          Cell = mentions · share of that issue&apos;s total mentions. Dot colour = root cause.
        </p>
        <p>Click a cell or channel to open the matching reviews.</p>
      </div>
    </section>
  );
}
