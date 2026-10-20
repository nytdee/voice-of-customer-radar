"use client";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  title: string;
  subtitle?: string;
  segments: DonutSegment[];
  centerValue: string;
  centerLabel: string;
  onSegmentClick?: (label: string) => void;
}

const radius = 42;
const circumference = 2 * Math.PI * radius;

export function DonutChart({
  title,
  subtitle,
  segments,
  centerValue,
  centerLabel,
  onSegmentClick,
}: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  let offset = 0;

  return (
    <div className="glass glass-border rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
            {segments.map((seg) => {
              const dash = (seg.value / total) * circumference;
              const element = (
                <circle
                  key={seg.label}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="10"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += dash;
              return element;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-white">{centerValue}</span>
            <span className="text-[10px] text-slate-400">{centerLabel}</span>
          </div>
        </div>
        <div className="space-y-2 flex-1">
          {segments.map((seg) => (
            <button
              key={seg.label}
              type="button"
              onClick={() => onSegmentClick?.(seg.label)}
              className="w-full flex items-center justify-between rounded-lg px-1.5 py-1 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              aria-label={`${seg.label}: ${seg.value}`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                <span className="text-xs text-slate-300">{seg.label}</span>
              </div>
              <span className="text-xs font-semibold text-white">{seg.value}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
