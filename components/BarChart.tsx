"use client";

export interface BarDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  title: string;
  subtitle?: string;
  data: BarDatum[];
  unit?: string;
  onBarClick?: (label: string) => void;
}

export function BarChart({ title, subtitle, data, unit = "", onBarClick }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const peak = data.reduce((best, d) => (d.value > best.value ? d : best), data[0] ?? { label: "", value: 0 });

  return (
    <div className="glass glass-border rounded-2xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
        <span className="text-[11px] text-slate-500">
          peak {peak.value}{unit}{onBarClick ? " · click a bar" : ""}
        </span>
      </div>
      <div className="flex items-end justify-between gap-2 h-44 px-1">
        {data.map((d) => {
          const isPeak = d.value === max;
          const height = Math.max(6, Math.round((d.value / max) * 120));
          return (
            <button
              key={d.label}
              type="button"
              onClick={() => onBarClick?.(d.label)}
              aria-label={`${d.label}: ${d.value}${unit}`}
              className="flex flex-col items-center justify-end gap-1.5 w-full h-full rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            >
              <span className="text-[10px] font-semibold text-white">{d.value}</span>
              <div
                className={`w-full rounded-t-md transition-all duration-700 ${
                  isPeak
                    ? "bg-gradient-to-t from-teal-600 to-teal-300 shadow-[0_0_15px_rgba(45,212,191,0.4)]"
                    : "bg-gradient-to-t from-slate-700 to-slate-500"
                } ${onBarClick ? "hover:from-teal-600 hover:to-teal-300" : ""}`}
                style={{ height: `${height}px` }}
              />
              <span className="text-[10px] text-slate-500 truncate max-w-full">{d.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
