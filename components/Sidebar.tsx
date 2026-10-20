"use client";

import {
  LayoutDashboard,
  Boxes,
  FileText,
  Search,
  Sparkles,
  Upload,
  RotateCcw,
} from "lucide-react";
import type { ViewKey } from "@/lib/nav";

const items: Array<{ key: ViewKey; label: string; icon: typeof LayoutDashboard }> = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "insights", label: "AI analyst", icon: Sparkles },
  { key: "products", label: "Products", icon: Boxes },
  { key: "reviews", label: "Reviews", icon: FileText },
  { key: "discovery", label: "Discovery", icon: Search },
  { key: "upload", label: "Upload data", icon: Upload },
];

interface SidebarProps {
  active: ViewKey;
  onNavigate: (view: ViewKey) => void;
  sourceLabel: string;
  onReset: () => void;
}

export default function Sidebar({ active, onNavigate, sourceLabel, onReset }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-56 glass z-40 flex flex-col p-2 md:p-3">
      <div className="hidden md:flex items-center gap-2 px-2 py-3 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-500/15 border border-teal-500/25 text-teal-400 font-bold">
          ◎
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">VoC Radar</p>
          <p className="text-[10px] text-slate-500">review intelligence</p>
        </div>
      </div>

      <nav className="space-y-1 mt-2 md:mt-0">
        {items.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              aria-current={isActive ? "page" : undefined}
              title={label}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-teal-500/12 text-teal-300 border border-teal-500/25"
                  : "text-slate-400 border border-transparent hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="hidden md:inline font-medium">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2">
        <div className="hidden md:block rounded-xl border border-white/10 bg-white/5 p-2.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Data source</p>
          <p className="text-[11px] text-slate-200 truncate" title={sourceLabel}>
            {sourceLabel}
          </p>
        </div>
        <button
          onClick={onReset}
          title="Load sample data"
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 border border-transparent hover:text-white hover:bg-white/5 transition-colors"
        >
          <RotateCcw className="w-5 h-5 shrink-0" />
          <span className="hidden md:inline font-medium">Load sample</span>
        </button>
      </div>
    </aside>
  );
}
