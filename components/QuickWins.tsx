"use client";

import { ArrowRight, Package, Sparkles, Tag, Target } from "lucide-react";
import type { QuickWin, QuickWinKind } from "@/lib/diagnostics";
import type { NavContext, ViewKey } from "@/lib/nav";

const icons: Record<QuickWinKind, typeof Tag> = {
  listing: Tag,
  warehouse: Package,
  platform: Target,
};

const accents: Record<QuickWinKind, string> = {
  listing: "text-amber-300 border-amber-500/25 bg-amber-500/10",
  warehouse: "text-sky-300 border-sky-500/25 bg-sky-500/10",
  platform: "text-teal-300 border-teal-500/25 bg-teal-500/10",
};

export function QuickWins({
  wins,
  onNavigate,
}: {
  wins: QuickWin[];
  onNavigate: (view: ViewKey, context?: NavContext) => void;
}) {
  if (wins.length === 0) return null;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/[0.11] via-slate-900/70 to-slate-900/70 p-5 md:p-6 shadow-[0_0_40px_rgba(20,184,166,0.08)]">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-teal-400/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-300">
            <Sparkles className="h-3.5 w-3.5" /> Instant action
          </p>
          <h3 className="mt-1 text-lg font-bold text-white">🚀 Quick Wins &amp; Operational Fixes</h3>
          <p className="mt-1 text-xs text-slate-400">
            Three highest-leverage actions from this week&apos;s negative reviews.
          </p>
        </div>
        <span className="rounded-full border border-teal-500/25 bg-teal-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-teal-300">
          3 actions for today
        </span>
      </div>

      <div className="relative mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        {wins.map((win, index) => {
          const Icon = icons[win.kind];
          const context: NavContext = {
            ...(win.product ? { product: win.product } : {}),
            ...(win.platform ? { platform: win.platform } : {}),
            ...(win.issue ? { issue: win.issue } : {}),
            ...(win.rootCause ? { rootCause: win.rootCause } : {}),
          };
          return (
            <button
              key={`${win.kind}-${win.product ?? ""}-${win.issue ?? ""}-${index}`}
              type="button"
              onClick={() => onNavigate("reviews", context)}
              className="group flex h-full flex-col rounded-xl border border-white/10 bg-slate-950/35 p-4 text-left transition-colors hover:border-teal-500/25 hover:bg-white/[0.055] focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${accents[win.kind]}`}
                >
                  <Icon className="h-3 w-3" />
                  {win.label}
                </span>
                <span className="text-[10px] font-semibold text-slate-600">0{index + 1}</span>
              </div>
              <p className="mt-2.5 text-sm font-semibold leading-snug text-white">{win.detail}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{win.action}</p>
              <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                <span className="truncate text-[10px] text-slate-500">{win.evidence}</span>
                <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-teal-400">
                  Open evidence <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
