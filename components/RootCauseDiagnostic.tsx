"use client";

import { ArrowRight, Wrench, Truck } from "lucide-react";
import type { RootCauseBucket, RootCauseDiagnostic as Diagnostic } from "@/lib/diagnostics";
import type { RootCause } from "@/lib/rootCause";
import type { NavContext, ViewKey } from "@/lib/nav";

const styles: Record<
  RootCause,
  { icon: typeof Wrench; text: string; border: string; bg: string; bar: string; dot: string }
> = {
  PRODUCT_DEFECT: {
    icon: Wrench,
    text: "text-amber-300",
    border: "border-amber-500/20",
    bg: "bg-amber-500/[0.07]",
    bar: "from-amber-500 to-orange-400",
    dot: "bg-amber-400",
  },
  OPERATIONAL_ERROR: {
    icon: Truck,
    text: "text-sky-300",
    border: "border-sky-500/20",
    bg: "bg-sky-500/[0.07]",
    bar: "from-sky-500 to-teal-400",
    dot: "bg-sky-400",
  },
};

function BucketCard({
  bucket,
  maxMentions,
  onNavigate,
}: {
  bucket: RootCauseBucket;
  maxMentions: number;
  onNavigate: (view: ViewKey, context?: NavContext) => void;
}) {
  const style = styles[bucket.cause];
  const Icon = style.icon;

  return (
    <div className={`glass glass-border rounded-2xl border p-5 ${style.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${style.border} ${style.bg}`}
          >
            <Icon className={`h-5 w-5 ${style.text}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{bucket.bucket}</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{bucket.description}</p>
          </div>
        </div>
        <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider ${style.text}`}>
          {bucket.cause === "PRODUCT_DEFECT" ? "Product" : "Ops"}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-bold text-white">{bucket.reviews}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">negative reviews</p>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${style.text}`}>{bucket.share}%</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">of negative volume</p>
        </div>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${style.bar} transition-all duration-700`}
          style={{ width: `${Math.min(100, bucket.share)}%` }}
        />
      </div>

      <div className="mt-4 space-y-2">
        {bucket.issues.length === 0 ? (
          <p className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-3 text-xs text-slate-500">
            No tagged issues in this bucket this week.
          </p>
        ) : (
          bucket.issues.map((issue, index) => (
            <button
              key={issue.issue}
              type="button"
              onClick={() =>
                onNavigate("reviews", { rootCause: bucket.cause, issue: issue.issue })
              }
              className="group w-full rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="flex min-w-0 items-center gap-1.5 text-slate-300">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
                  <span className="truncate">
                    {index + 1}. {issue.issue}
                  </span>
                </span>
                <span className="shrink-0 font-semibold text-white">{issue.mentions}</span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${style.bar}`}
                  style={{ width: `${Math.max(4, (issue.mentions / maxMentions) * 100)}%` }}
                />
              </div>
            </button>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={() => onNavigate("reviews", { rootCause: bucket.cause })}
        className={`mt-4 inline-flex items-center gap-1 text-[11px] font-medium ${style.text} hover:opacity-80`}
      >
        View all {bucket.reviews} reviews <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}

export function RootCauseDiagnostic({
  diagnostic,
  onNavigate,
}: {
  diagnostic: Diagnostic;
  onNavigate: (view: ViewKey, context?: NavContext) => void;
}) {
  const maxMentions = Math.max(
    1,
    ...diagnostic.buckets.flatMap((bucket) => bucket.issues.map((issue) => issue.mentions))
  );
  const product = diagnostic.buckets.find((bucket) => bucket.cause === "PRODUCT_DEFECT");
  const operational = diagnostic.buckets.find((bucket) => bucket.cause === "OPERATIONAL_ERROR");
  const productShare = diagnostic.classified
    ? Math.round(((product?.reviews ?? 0) / diagnostic.classified) * 1000) / 10
    : 0;

  return (
    <section className="glass glass-border rounded-2xl p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Root Cause Diagnostic</h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Split the complaint load between broken product attributes and warehouse/operations
            failures.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Tagged negatives</p>
          <p className="text-xs font-semibold text-white">
            {diagnostic.classified} / {diagnostic.negativeTotal}
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-full bg-white/5">
        <div className="flex h-2">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-700"
            style={{ width: `${productShare}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-teal-400 transition-all duration-700"
            style={{ width: `${Math.max(0, 100 - productShare)}%` }}
          />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          Product attributes {productShare}% of tagged
        </span>
        <span className="inline-flex items-center gap-1.5">
          Fulfillment &amp; operations {Math.round((100 - productShare) * 10) / 10}% of tagged
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
        </span>
      </div>
      {diagnostic.unclassified > 0 && (
        <p className="mt-2 text-[10px] text-slate-500">
          {diagnostic.unclassified} negative review{diagnostic.unclassified === 1 ? "" : "s"} could
          not be confidently tagged and are excluded from this split.
        </p>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {diagnostic.buckets.map((bucket) => (
          <BucketCard
            key={bucket.cause}
            bucket={bucket}
            maxMentions={maxMentions}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      <p className="mt-3 text-[10px] text-slate-500">
        Tags are rule-based and traceable to review text. Each review is assigned one dominant root
        cause; the tagged split and bucket shares use all negative reviews as the denominator.
      </p>
      {operational && operational.reviews === 0 && (
        <p className="mt-1 text-[10px] text-slate-500">
          No operational failures detected this week. Keep monitoring packaging and delivery
          signals.
        </p>
      )}
    </section>
  );
}
