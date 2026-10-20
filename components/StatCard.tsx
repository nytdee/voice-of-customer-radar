"use client";

import type { LucideIcon } from "lucide-react";

type Tone = "good" | "bad" | "neutral";

const toneClass: Record<Tone, string> = {
  good: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  bad: "text-red-400 border-red-500/20 bg-red-500/10",
  neutral: "text-slate-300 border-white/10 bg-white/5",
};

const accentClass = {
  teal: "text-teal-400",
  blue: "text-blue-400",
  amber: "text-amber-400",
} as const;

export interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  foot?: string;
  delta?: string;
  tone?: Tone;
  accent?: keyof typeof accentClass;
  onClick?: () => void;
}

export function StatCard({
  icon: Icon,
  value,
  label,
  foot,
  delta,
  tone = "neutral",
  accent = "teal",
  onClick,
}: StatCardProps) {
  const inner = (
    <>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center glass-border bg-white/5 ${accentClass[accent]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {delta && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${toneClass[tone]}`}>
            {delta}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-white leading-none">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
      {foot && <p className="mt-2 text-[11px] text-slate-500">{foot}</p>}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="glass glass-border rounded-2xl p-5 text-left w-full transition-colors hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-teal-500/40"
      >
        {inner}
      </button>
    );
  }

  return <div className="glass glass-border rounded-2xl p-5">{inner}</div>;
}
