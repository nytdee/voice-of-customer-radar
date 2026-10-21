"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { AnalysisResult } from "@/lib/analysis";
import type { NavContext } from "@/lib/nav";
import type { RootCause } from "@/lib/rootCause";
import { formatDateISO } from "@/lib/dates";

const PAGE_SIZE = 15;

function sentimentClass(s: string) {
  if (s === "Negative") return "text-red-400 bg-red-500/10 border-red-500/20";
  if (s === "Positive") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  return "text-amber-400 bg-amber-500/10 border-amber-500/20";
}

function rootCauseClass(cause: RootCause) {
  if (cause === "PRODUCT_DEFECT") return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  return "text-sky-400 bg-sky-500/10 border-sky-500/20";
}

const ROOT_CAUSE_LABELS: Record<RootCause, string> = {
  PRODUCT_DEFECT: "Product defect",
  OPERATIONAL_ERROR: "Operational error",
};

export function ReviewsView({
  analysis,
  initial,
}: {
  analysis: AnalysisResult;
  initial?: NavContext;
}) {
  const [product, setProduct] = useState(initial?.product ?? "all");
  const [platform, setPlatform] = useState(initial?.platform ?? "all");
  const [sentiment, setSentiment] = useState(initial?.sentiment ?? "all");
  const [issue, setIssue] = useState(initial?.issue ?? "all");
  const [rootCause, setRootCause] = useState(initial?.rootCause ?? "all");
  const [query, setQuery] = useState(initial?.query ?? "");
  const [page, setPage] = useState(0);

  const products = useMemo(
    () => Array.from(new Set(analysis.reviews.map((r) => r.product))).sort(),
    [analysis]
  );
  const platforms = useMemo(
    () => Array.from(new Set(analysis.reviews.map((r) => r.platform))).sort(),
    [analysis]
  );
  const issues = useMemo(
    () => Array.from(new Set(analysis.reviews.flatMap((r) => r.issues))).sort(),
    [analysis]
  );
  const rootCauses = useMemo(
    () =>
      Array.from(
        new Set(analysis.reviews.map((r) => r.root_cause).filter(Boolean) as RootCause[])
      ).sort() as RootCause[],
    [analysis]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return analysis.reviews
      .filter((r) => (product === "all" ? true : r.product === product))
      .filter((r) => (platform === "all" ? true : r.platform === platform))
      .filter((r) => (sentiment === "all" ? true : r.sentiment === sentiment))
      .filter((r) => (issue === "all" ? true : r.issues.includes(issue)))
      .filter((r) => (rootCause === "all" ? true : r.root_cause === rootCause))
      .filter((r) => (q ? r.review_text.toLowerCase().includes(q) : true))
      .sort((a, b) => b.review_date.getTime() - a.review_date.getTime());
  }, [analysis, product, platform, sentiment, issue, rootCause, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const resetFilters = () => {
    setProduct("all");
    setPlatform("all");
    setSentiment("all");
    setIssue("all");
    setRootCause("all");
    setQuery("");
    setPage(0);
  };

  const drilldown = [
    product !== "all" ? product : null,
    platform !== "all" ? platform : null,
    sentiment !== "all" ? sentiment : null,
    issue !== "all" ? issue : null,
    rootCause !== "all" ? rootCause : null,
  ].filter(Boolean);

  const selectClass =
    "h-9 rounded-lg border border-white/10 bg-slate-900/60 px-3 text-xs text-slate-200 outline-none focus:border-teal-500/40";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Review browser</h2>
          <p className="text-slate-400 text-sm">
            {filtered.length.toLocaleString()} of {analysis.reviews.length.toLocaleString()} reviews match
          </p>
          {drilldown.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-slate-500">drill-down</span>
              {drilldown.map((label) => (
                <span
                  key={label as string}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={resetFilters}
          className="text-xs text-slate-400 hover:text-white underline underline-offset-4"
        >
          Reset filters
        </button>
      </div>

      <div className="glass glass-border rounded-2xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search review text…"
              className="h-9 w-full rounded-lg border border-white/10 bg-slate-900/60 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-teal-500/40"
            />
          </div>
          <select
            value={product}
            onChange={(e) => {
              setProduct(e.target.value);
              setPage(0);
            }}
            className={selectClass}
          >
            <option value="all">All products</option>
            {products.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={issue}
            onChange={(e) => {
              setIssue(e.target.value);
              setPage(0);
            }}
            className={selectClass}
          >
            <option value="all">All issues</option>
            {issues.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          <select
            value={platform}
            onChange={(e) => {
              setPlatform(e.target.value);
              setPage(0);
            }}
            className={selectClass}
          >
            <option value="all">All platforms</option>
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={sentiment}
            onChange={(e) => {
              setSentiment(e.target.value);
              setPage(0);
            }}
            className={selectClass}
          >
            <option value="all">All sentiment</option>
            <option value="Negative">Negative</option>
            <option value="Mixed / neutral">Mixed / neutral</option>
            <option value="Positive">Positive</option>
          </select>
          <select
            value={rootCause}
            onChange={(e) => {
              setRootCause(e.target.value === "all" ? "all" : (e.target.value as RootCause));
              setPage(0);
            }}
            className={selectClass}
          >
            <option value="all">All root causes</option>
            {rootCauses.map((rc) => (
              <option key={rc} value={rc}>
                {ROOT_CAUSE_LABELS[rc]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass glass-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 border-b border-white/10">
                <th className="px-4 py-3 font-medium whitespace-nowrap">Date</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Product</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Platform</th>
                <th className="px-4 py-3 font-medium text-center whitespace-nowrap">Rating</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Sentiment</th>
                <th className="px-4 py-3 font-medium">Review</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r, idx) => (
                <tr key={`${r.platform}-${r.review_id}-${formatDateISO(r.review_date)}-${idx}`} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">
                    {formatDateISO(r.review_date)}
                  </td>
                  <td className="px-4 py-3 text-slate-200 whitespace-nowrap">{r.product}</td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">{r.platform}</td>
                  <td className="px-4 py-3 text-center text-slate-200 whitespace-nowrap">{r.rating}★</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${sentimentClass(r.sentiment)}`}>
                      {r.sentiment}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-xs min-w-[260px]">
                    {r.root_cause && (
                      <span
                        className={`mr-1.5 inline-flex text-[9px] font-semibold px-1.5 py-0.5 rounded border font-mono ${rootCauseClass(r.root_cause)}`}
                        title={ROOT_CAUSE_LABELS[r.root_cause]}
                      >
                        {r.root_cause_tag}
                      </span>
                    )}
                    {r.review_text}
                    <div className="mt-1 flex flex-wrap gap-1">
                      {r.issues.map((issue) => (
                        <span key={issue} className="text-[10px] text-slate-500 border border-white/10 rounded px-1.5 py-0.5">
                          {issue}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                    No reviews match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-white/10">
          <p className="text-xs text-slate-500">
            Page {safePage + 1} of {pageCount}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(0, safePage - 1))}
              disabled={safePage === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 disabled:opacity-40 hover:bg-white/10"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <button
              onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))}
              disabled={safePage >= pageCount - 1}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 disabled:opacity-40 hover:bg-white/10"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
        </div>
      </div>
      </div>
    </div>
  );
}
