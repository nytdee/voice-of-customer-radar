"use client";

import { useMemo } from "react";
import { Download, FileText, Layers, Star, TrendingDown } from "lucide-react";
import type { AnalysisResult } from "@/lib/analysis";
import type { NavContext, ViewKey } from "@/lib/nav";
import { renderHtmlReport, renderMarkdownReport } from "@/lib/reports";
import { toCsv } from "@/lib/csv";
import { StatCard } from "./StatCard";
import { BarChart } from "./BarChart";
import { DonutChart } from "./DonutChart";
import { ProductCard } from "./ProductCard";
import { TopIssues } from "./TopIssues";
import { IssueTable } from "./IssueTable";
import { ReportDownload } from "./ReportDownload";

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function OverviewView({
  analysis,
  onNavigate,
}: {
  analysis: AnalysisResult;
  onNavigate: (view: ViewKey, context?: NavContext) => void;
}) {
  const derived = useMemo(() => {
    const [start, end] = analysis.current_period;
    const current = analysis.reviews.filter(
      (r) => r.review_date >= start && r.review_date <= end
    );

    const sentiment = { Negative: 0, "Mixed / neutral": 0, Positive: 0 };
    for (const r of current) sentiment[r.sentiment] += 1;

    const themeTotals = new Map<string, number>();
    for (const row of analysis.issues) {
      themeTotals.set(row.issue, (themeTotals.get(row.issue) ?? 0) + row.mentions);
    }
    const themes = Array.from(themeTotals.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const topIssues = [...analysis.issues].sort((a, b) => b.mentions - a.mentions).slice(0, 6);
    const products = [...analysis.products].sort(
      (a, b) => (a.rating_trend.rating_delta ?? 0) - (b.rating_trend.rating_delta ?? 0)
    );

    return {
      start,
      end,
      sentiment,
      sentTotal: sentiment.Negative + sentiment["Mixed / neutral"] + sentiment.Positive,
      themes,
      topIssues,
      products,
      markdown: renderMarkdownReport(analysis),
      html: renderHtmlReport(analysis),
    };
  }, [analysis]);

  const cur = analysis.overall_current;
  const prev = analysis.overall_previous;
  const reviewDelta = cur.reviews - prev.reviews;
  const negDelta = Math.round((cur.negative_share_pct - prev.negative_share_pct) * 10) / 10;
  const ratingDelta =
    cur.avg_review_rating !== null && prev.avg_review_rating !== null
      ? Math.round((cur.avg_review_rating - prev.avg_review_rating) * 100) / 100
      : null;

  const downloadIssuesCsv = () => {
    const csv = toCsv(
      ["product", "issue", "mentions", "previous_mentions", "change_pct", "avg_rating", "one_two_star_count", "recommendation"],
      analysis.issues.map((i) => [
        i.product,
        i.issue,
        i.mentions,
        i.previous_mentions,
        i.change_pct,
        i.avg_rating,
        i.one_two_star_count,
        i.recommendation,
      ])
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "issues_by_product.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Weekly overview</h2>
          <p className="text-slate-400 text-sm">
            {fmtDate(derived.start)} – {fmtDate(derived.end)}, {derived.end.getFullYear()} · vs previous week
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Click any KPI, bar, segment or row to drill into the matching reviews.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={downloadIssuesCsv}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10"
          >
            <Download className="h-4 w-4" /> Issue table (CSV)
          </button>
          <ReportDownload markdown={derived.markdown} html={derived.html} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          value={cur.reviews.toLocaleString()}
          label="Reviews analysed"
          foot={`Previous week ${prev.reviews}`}
          delta={`${reviewDelta >= 0 ? "+" : ""}${reviewDelta}`}
          tone="neutral"
          accent="teal"
          onClick={() => onNavigate("reviews")}
        />
        <StatCard
          icon={TrendingDown}
          value={`${cur.negative_share_pct}%`}
          label="Negative share"
          foot={`Previous week ${prev.negative_share_pct}%`}
          delta={`${negDelta >= 0 ? "+" : ""}${negDelta} pts`}
          tone={negDelta > 0 ? "bad" : "good"}
          accent="amber"
          onClick={() => onNavigate("reviews", { sentiment: "Negative" })}
        />
        <StatCard
          icon={Star}
          value={cur.avg_review_rating !== null ? cur.avg_review_rating.toFixed(2) : "—"}
          label="Avg review rating"
          foot={`Previous week ${prev.avg_review_rating?.toFixed(2) ?? "—"}`}
          delta={ratingDelta === null ? undefined : `${ratingDelta >= 0 ? "+" : ""}${ratingDelta}`}
          tone={ratingDelta !== null && ratingDelta < 0 ? "bad" : "good"}
          accent="blue"
          onClick={() => onNavigate("reviews")}
        />
        <StatCard
          icon={Layers}
          value={analysis.source_count.toString()}
          label="Sources monitored"
          foot={`${analysis.deduped_review_count} deduped reviews`}
          accent="teal"
          onClick={() => onNavigate("reviews")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BarChart
            title="Top complaint themes"
            subtitle="Negative-review mentions across all products"
            data={derived.themes}
            onBarClick={(label) => onNavigate("reviews", { issue: label })}
          />
        </div>
        <div className="lg:col-span-1">
          <DonutChart
            title="Sentiment split"
            subtitle="Current week"
            centerValue={derived.sentTotal.toString()}
            centerLabel="reviews"
            segments={[
              { label: "Negative", value: derived.sentiment.Negative, color: "#f87171" },
              { label: "Mixed / neutral", value: derived.sentiment["Mixed / neutral"], color: "#fbbf24" },
              { label: "Positive", value: derived.sentiment.Positive, color: "#34d399" },
            ]}
            onSegmentClick={(label) => onNavigate("reviews", { sentiment: label })}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Product priorities</h3>
          <span className="text-[11px] text-slate-500">sorted by rating change (worst first)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {derived.products.map((item) => (
            <ProductCard
              key={item.product}
              item={item}
              onClick={() => onNavigate("products", { product: item.product })}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopIssues
          issues={derived.topIssues}
          className="lg:col-span-1"
          onIssueClick={(issue) => onNavigate("products", { product: issue.product, issue: issue.issue })}
        />
        <div className="lg:col-span-2">
          <IssueTable
            issues={analysis.issues}
            title="Issue breakdown by product"
            onRowClick={(issue) => onNavigate("products", { product: issue.product, issue: issue.issue })}
          />
        </div>
      </div>
    </div>
  );
}
