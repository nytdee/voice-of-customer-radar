"use client";

import { ArrowUpRight } from "lucide-react";
import type { ProductReport } from "@/lib/analysis";

export function ProductCard({ item, onClick }: { item: ProductReport; onClick?: () => void }) {
  const cur = item.current;
  const prev = item.previous;
  const delta = item.rating_trend.rating_delta;
  const deltaText = delta === null ? "n/a" : `${delta > 0 ? "+" : ""}${delta.toFixed(2)}`;
  const deltaTone = delta === null ? "text-slate-400" : delta >= 0 ? "text-emerald-400" : "text-red-400";

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      {...(onClick ? { type: "button", onClick } : {})}
      className="glass glass-border rounded-2xl p-5 flex flex-col gap-3 text-left w-full transition-colors hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-teal-500/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">{item.product}</h3>
          <p className="text-[11px] text-slate-400">{cur.reviews} reviews this week</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400">
            {cur.negative_share_pct}% neg
          </span>
          {onClick && <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-white/5 border border-white/5 py-2">
          <p className="text-sm font-bold text-white">{cur.avg_review_rating ?? "—"}</p>
          <p className="text-[10px] text-slate-500">avg rating</p>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/5 py-2">
          <p className={`text-sm font-bold ${deltaTone}`}>{deltaText}</p>
          <p className="text-[10px] text-slate-500">Δ vs prev</p>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/5 py-2">
          <p className="text-sm font-bold text-white">{prev.reviews}</p>
          <p className="text-[10px] text-slate-500">prev week</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {item.top_issues.length > 0 ? (
          item.top_issues.map((issue, i) => (
            <div key={issue.issue} className="flex items-center justify-between text-xs">
              <span className="text-slate-300 truncate pr-2">
                {i + 1}. {issue.issue}
              </span>
              <span className="text-slate-400 shrink-0">{issue.mentions}×</span>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500">No negative-review themes detected.</p>
        )}
      </div>
    </Wrapper>
  );
}
