"use client";

import { useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import type { AnalysisResult } from "@/lib/analysis";
import type { NavContext, ViewKey } from "@/lib/nav";

export function ProductsView({
  analysis,
  initialProduct,
  initialIssue,
  onNavigate,
}: {
  analysis: AnalysisResult;
  initialProduct?: string;
  initialIssue?: string;
  onNavigate: (view: ViewKey, context?: NavContext) => void;
}) {
  const products = [...analysis.products].sort(
    (a, b) => (a.rating_trend.rating_delta ?? 0) - (b.rating_trend.rating_delta ?? 0)
  );
  const [selected, setSelected] = useState(
    initialProduct && products.some((p) => p.product === initialProduct)
      ? initialProduct
      : products[0]?.product ?? ""
  );
  const item = products.find((p) => p.product === selected) ?? products[0];

  if (!item) {
    return <p className="text-sm text-slate-400">No products found in this dataset.</p>;
  }

  const cur = item.current;
  const prev = item.previous;
  const delta = item.rating_trend.rating_delta;
  const deltaText = delta === null ? "n/a" : `${delta >= 0 ? "+" : ""}${delta.toFixed(2)}`;
  const deltaTone = delta === null ? "text-slate-400" : delta >= 0 ? "text-emerald-400" : "text-red-400";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Product deep-dive</h2>
        <p className="text-slate-400 text-sm">Select a product to inspect issues and evidence.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {products.map((p) => (
          <button
            key={p.product}
            onClick={() => setSelected(p.product)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              p.product === item.product
                ? "bg-teal-500/15 border-teal-500/30 text-teal-300"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {p.product}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="glass glass-border rounded-2xl p-5">
          <p className="text-xs text-slate-400">Current-window reviews</p>
          <p className="mt-2 text-2xl font-bold text-white">{cur.reviews}</p>
          <p className="mt-1 text-[11px] text-slate-500">Previous week {prev.reviews}</p>
        </div>
        <div className="glass glass-border rounded-2xl p-5">
          <p className="text-xs text-slate-400">Negative reviews</p>
          <p className="mt-2 text-2xl font-bold text-white">{cur.negative_reviews}</p>
          <p className="mt-1 text-[11px] text-slate-500">{cur.negative_share_pct}% negative share</p>
        </div>
        <div className="glass glass-border rounded-2xl p-5">
          <p className="text-xs text-slate-400">Average rating</p>
          <p className="mt-2 text-2xl font-bold text-white">{cur.avg_review_rating ?? "—"}</p>
          <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
            <Star className="w-3 h-3" /> collected-review average
          </p>
        </div>
        <div className="glass glass-border rounded-2xl p-5">
          <p className="text-xs text-slate-400">Rating change</p>
          <p className={`mt-2 text-2xl font-bold ${deltaTone}`}>
            {deltaText}
            {delta === null ? "" : " ★"}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">vs previous week</p>
        </div>
      </div>

      <div className="glass glass-border rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-1">Top issues to address</h3>
        <p className="text-xs text-slate-400 mb-5">Ranked by negative-review mentions this week</p>

        {item.top_issues.length === 0 ? (
          <p className="text-sm text-slate-400">No negative-review themes detected.</p>
        ) : (
          <div className="space-y-4">
            {item.top_issues.map((issue, rank) => {
              const evidence = analysis.reviews
                .filter(
                  (r) =>
                    r.product === item.product &&
                    r.sentiment === "Negative" &&
                    r.issues.includes(issue.issue)
                )
                .slice(0, 3);
              return (
                <div
                  key={issue.issue}
                  className={`rounded-xl border bg-white/[0.03] p-4 ${
                    initialIssue === issue.issue ? "border-teal-500/40 ring-1 ring-teal-500/20" : "border-white/5"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">
                      {rank + 1}. {issue.issue}
                    </p>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-slate-300">{issue.mentions} mentions</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full border ${
                          issue.previous_mentions === 0
                            ? "text-blue-400 border-blue-500/20 bg-blue-500/10"
                            : issue.change_pct > 0
                              ? "text-red-400 border-red-500/20 bg-red-500/10"
                              : "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                        }`}
                      >
                        {issue.previous_mentions === 0
                          ? "new"
                          : `${issue.change_pct > 0 ? "+" : ""}${issue.change_pct.toFixed(0)}% WoW`}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{issue.recommendation}</p>
                  <button
                    type="button"
                    onClick={() =>
                      onNavigate("reviews", { product: item.product, issue: issue.issue })
                    }
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-teal-400 hover:text-teal-300"
                  >
                    See matching reviews →
                  </button>

                  {evidence.length > 0 && (
                    <details className="group mt-3" open={initialIssue === issue.issue}>
                      <summary className="flex items-center gap-1.5 cursor-pointer list-none text-xs font-medium text-teal-400 hover:text-teal-300">
                        <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
                        Evidence examples ({evidence.length})
                      </summary>
                      <div className="mt-2 space-y-2">
                        {evidence.map((r) => (
                          <div key={r.review_id} className="rounded-lg bg-slate-900/40 border border-white/5 p-2.5">
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span>
                                {r.review_date.toISOString().slice(0, 10)} · {r.platform}
                              </span>
                              <span>{r.rating}★</span>
                            </div>
                            <p className="mt-1 text-xs text-slate-300">{r.review_text}</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
