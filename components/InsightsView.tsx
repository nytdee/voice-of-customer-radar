"use client";

import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Gauge,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { AnalysisResult } from "@/lib/analysis";
import type { NavContext, ViewKey } from "@/lib/nav";
import { buildInsights, type EmotionLabel } from "@/lib/insights";

const emotionStyle: Record<EmotionLabel, { text: string; bg: string; bar: string; blurb: string }> = {
  Frustrated: {
    text: "text-red-400",
    bg: "border-red-500/25 bg-red-500/10",
    bar: "from-red-500 to-orange-400",
    blurb: "Customers are actively venting. Speed of response matters more than polish.",
  },
  Disappointed: {
    text: "text-amber-400",
    bg: "border-amber-500/25 bg-amber-500/10",
    bar: "from-amber-500 to-yellow-400",
    blurb: "Expectations are missed but sentiment is recoverable with visible fixes.",
  },
  Mixed: {
    text: "text-slate-300",
    bg: "border-white/10 bg-white/5",
    bar: "from-slate-500 to-slate-400",
    blurb: "Opinions are split. Watch which themes tip the balance next week.",
  },
  Satisfied: {
    text: "text-emerald-400",
    bg: "border-emerald-500/25 bg-emerald-500/10",
    bar: "from-emerald-500 to-teal-400",
    blurb: "Sentiment is healthy. Protect it by fixing the remaining friction points.",
  },
};

const priorityStyle = {
  High: "text-red-400 border-red-500/25 bg-red-500/10",
  Medium: "text-amber-400 border-amber-500/25 bg-amber-500/10",
  Low: "text-slate-300 border-white/10 bg-white/5",
} as const;

export function InsightsView({
  analysis,
  onNavigate,
}: {
  analysis: AnalysisResult;
  onNavigate: (view: ViewKey, context?: NavContext) => void;
}) {
  const insights = buildInsights(analysis);
  const style = emotionStyle[insights.overallEmotion];
  const { breakdown } = insights;
  const total = breakdown.total || 1;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">AI analyst</h2>
        <p className="text-slate-400 text-sm">
          Current emotional tone and a prioritised fix plan, generated from this week&apos;s reviews.
        </p>
      </div>

      <div className={`glass glass-border rounded-2xl p-6 border ${style.bg}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${style.bg}`}>
              <BrainCircuit className={`w-5 h-5 ${style.text}`} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-500">Current emotion</p>
              <p className={`text-3xl font-bold ${style.text}`}>{insights.overallEmotion}</p>
              <p className="mt-1 text-xs text-slate-400">{style.blurb}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">confidence</span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                insights.confidence === "High"
                  ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                  : insights.confidence === "Medium"
                    ? "text-amber-400 border-amber-500/20 bg-amber-500/10"
                    : "text-slate-300 border-white/10 bg-white/5"
              }`}
            >
              {insights.confidence}
            </span>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5" /> negative intensity
            </span>
            <span className="font-semibold text-white">{insights.emotionScore}/100</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${style.bar} transition-all duration-700`}
              style={{ width: `${Math.min(100, insights.emotionScore)}%` }}
            />
          </div>
        </div>

        <p className="mt-5 text-sm text-slate-300 leading-relaxed">{insights.narrative}</p>

        <div className="mt-4 flex flex-wrap gap-3 text-[11px]">
          <span className="text-red-400">● {breakdown.negative} negative</span>
          <span className="text-amber-400">● {breakdown.mixed} mixed</span>
          <span className="text-emerald-400">● {breakdown.positive} positive</span>
          <span className="text-slate-500">of {breakdown.total} reviews this week</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass glass-border rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">How to fix it</h3>
              <p className="text-xs text-slate-400">Ranked by priority, mentions and week-over-week change</p>
            </div>
            <Sparkles className="w-4 h-4 text-teal-400" />
          </div>
          {insights.fixes.length === 0 ? (
            <p className="text-sm text-slate-400">No negative-review issues to act on this week.</p>
          ) : (
            <ol className="space-y-3">
              {insights.fixes.map((fix, i) => (
                <li key={`${fix.product}-${fix.issue}`}>
                  <button
                    type="button"
                    onClick={() => onNavigate("products", { product: fix.product, issue: fix.issue })}
                    className="w-full text-left rounded-xl border border-white/5 bg-white/[0.03] p-4 hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-semibold text-slate-300 shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm font-semibold text-white truncate">{fix.issue}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${priorityStyle[fix.priority]}`}>
                          {fix.priority}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {fix.product} · {fix.mentions} mentions
                        {fix.changePct > 0 ? ` · +${fix.changePct.toFixed(0)}% WoW` : ""}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-300">{fix.action}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-teal-400">
                      Open evidence <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="glass glass-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-1">Product pulse</h3>
          <p className="text-xs text-slate-400 mb-4">Emotion per product, worst rating change first</p>
          <div className="space-y-3">
            {insights.products.map((p) => {
              const ps = emotionStyle[p.emotion];
              return (
                <button
                  key={p.product}
                  type="button"
                  onClick={() => onNavigate("products", { product: p.product })}
                  className="w-full text-left rounded-xl border border-white/5 bg-white/[0.03] p-3 hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-white truncate">{p.product}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${ps.bg} ${ps.text}`}>
                      {p.emotion}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{p.reviews} reviews · {p.negativeShare}% negative</span>
                    <span>{p.rating ?? "—"}★</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass glass-border rounded-2xl p-5 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs text-slate-300">
            This analyst is deterministic: it uses the same sentiment model and issue taxonomy as the rest of
            the dashboard, so every claim is traceable to reviews you can open.
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            No external LLM is called. The <code className="text-slate-400">buildInsights</code> engine can be
            replaced by an LLM route later without changing this view.
          </p>
        </div>
        <AlertTriangle className="w-4 h-4 text-slate-600 ml-auto shrink-0" />
      </div>
    </div>
  );
}
