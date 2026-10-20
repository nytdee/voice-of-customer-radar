"use client";

interface HeaderProps {
  subtitle?: string;
  sourceLabel?: string;
}

export default function Header({ subtitle, sourceLabel }: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 px-6 md:px-8 py-4 glass z-30 sticky top-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl glass-border flex items-center justify-center bg-white/5 shrink-0">
          <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="min-w-0">
          <h1 className="text-base md:text-lg font-semibold text-white tracking-tight truncate">
            Voice of Customer Radar
          </h1>
          {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {sourceLabel && (
          <span className="hidden sm:inline-flex max-w-[220px] truncate text-[11px] font-medium px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300">
            {sourceLabel}
          </span>
        )}
        <button
          className="w-9 h-9 rounded-xl glass-border flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          aria-label="Notifications"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 bg-slate-700/40 flex items-center justify-center text-xs font-bold text-slate-200">
          VOC
        </div>
      </div>
    </header>
  );
}
