"use client";

import { useState } from "react";
import { BarChart3, ExternalLink, Loader2, Search } from "lucide-react";
import { analyzeReviews } from "@/lib/analysis";
import type { AnalysisResult } from "@/lib/analysis";

interface Snippet {
  title: string;
  url: string;
  published_date: string;
  snippet: string;
  themes_detected: string;
  evidence_warning: string;
}

interface DiscoveryViewProps {
  onAnalyse: (analysis: AnalysisResult, label: string) => void;
}

const DOMAINS = ["Amazon India", "Flipkart", "Myntra", "Blinkit", "Zepto", "Other public web"];

export function DiscoveryView({ onAnalyse }: DiscoveryViewProps) {
  const [product, setProduct] = useState("");
  const [brand, setBrand] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [domains, setDomains] = useState<string[]>(["Amazon India", "Flipkart", "Myntra"]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Snippet[]>([]);
  const [reviews, setReviews] = useState<Array<Record<string, string>>>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [meta, setMeta] = useState<{ queries: number; searched: boolean }>({ queries: 0, searched: false });

  const toggleDomain = (d: string) => {
    setDomains((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  };

  const runSearch = async () => {
    setLoading(true);
    setErrors([]);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, brand, domains, tavily_api_key: apiKey }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Search failed.");
      setResults(json.results ?? []);
      setReviews(json.reviews ?? []);
      setErrors(json.errors ?? []);
      setMeta({ queries: json.queries?.length ?? 0, searched: true });
    } catch (e) {
      setErrors([e instanceof Error ? e.message : "Search failed."]);
      setResults([]);
      setReviews([]);
      setMeta({ queries: 0, searched: true });
    } finally {
      setLoading(false);
    }
  };

  const useAsReviews = () => {
    try {
      const analysis = analyzeReviews(reviews);
      const label = `Web search: ${[brand, product].filter((x) => x.trim()).join(" ")} (${reviews.length} result pages)`;
      onAnalyse(analysis, label);
    } catch (e) {
      setErrors([e instanceof Error ? e.message : "Could not analyse these results."]);
    }
  };

  const themeCounts = (() => {
    const counts = new Map<string, number>();
    for (const r of results) {
      for (const theme of (r.themes_detected || "").split(";").map((t) => t.trim()).filter(Boolean)) {
        counts.set(theme, (counts.get(theme) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  })();

  const canSearch = product.trim().length > 0 && domains.length > 0 && !loading;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Public web discovery</h2>
        <p className="text-slate-400 text-sm">
          Search public pages for a product, then convert the results into a partial review dataset for issue analysis. Counts are per result page, not complete marketplace totals.
        </p>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-200 space-y-1">
        <p className="font-semibold">Experimental · not SKU-exact</p>
        <p className="text-amber-200/80">
          Web search matches product names and snippets, so it can pull unrelated variants or random pages.
          Use the sample dataset or a CSV export when you need reliable, reproducible numbers.
        </p>
      </div>

      <div className="glass glass-border rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Product / SKU</label>
            <input
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="e.g. Aero Cabin Case"
              className="h-9 w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-teal-500/40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Brand (optional)</label>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Away"
              className="h-9 w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-teal-500/40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Tavily API key (optional)</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Uses server key if blank"
              className="h-9 w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-teal-500/40"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={runSearch}
              disabled={!canSearch}
              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? "Searching…" : "Search public web"}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Search domains</label>
          <div className="flex flex-wrap gap-2">
            {DOMAINS.map((d) => (
              <button
                key={d}
                onClick={() => toggleDomain(d)}
                className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
                  domains.includes(d)
                    ? "bg-teal-500/15 border-teal-500/30 text-teal-300"
                    : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-amber-300/80">
          Leave blank to use the server-configured key. A key entered here is used only for this request and is never stored.
        </p>
      </div>

      {errors.length > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300 space-y-1">
          {errors.map((e, i) => (
            <div key={i}>{e}</div>
          ))}
        </div>
      )}

      {meta.searched && results.length === 0 && errors.length === 0 && (
        <p className="text-sm text-slate-400">
          No results returned. Try a broader product name or another source.
        </p>
      )}

      {reviews.length > 0 && (
        <div className="glass glass-border rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3 border-teal-500/20">
          <div>
            <h3 className="text-sm font-semibold text-white">Use as review dataset</h3>
            <p className="text-xs text-slate-400">
              {reviews.length} result pages will be treated as review signals and ranked by issue frequency.
            </p>
          </div>
          <button
            onClick={useAsReviews}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500"
          >
            <BarChart3 className="h-4 w-4" /> Analyse issues
          </button>
        </div>
      )}

      {themeCounts.length > 0 && (
        <div className="glass glass-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Themes in result snippets</h3>
          <div className="flex flex-wrap gap-2">
            {themeCounts.map(([theme, count]) => (
              <span key={theme} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
                {theme} · {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            {meta.queries} queries · {results.length} unique result URLs
          </p>
          {results.map((r) => (
            <div key={r.url} className="glass glass-border rounded-2xl p-4">
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-300 hover:text-teal-200"
              >
                {r.title || r.url} <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <p className="mt-1 text-[11px] text-slate-500 truncate">{r.url}</p>
              <p className="mt-2 text-xs text-slate-300">{r.snippet}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {r.themes_detected
                  .split(";")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((t) => (
                    <span key={t} className="text-[10px] text-slate-400 border border-white/10 rounded px-1.5 py-0.5">
                      {t}
                    </span>
                  ))}
                <span className="text-[10px] text-amber-300/70">{r.evidence_warning}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
