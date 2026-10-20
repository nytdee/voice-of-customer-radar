"use client";

import { useRef, useState } from "react";
import { Download, FileUp, Loader2 } from "lucide-react";
import { parseCsv } from "@/lib/csv";
import { analyzeReviews } from "@/lib/analysis";
import type { AnalysisResult } from "@/lib/analysis";
import { SAMPLE_REVIEWS_CSV } from "@/lib/sampleData";

interface UploadViewProps {
  analysis: AnalysisResult | null;
  sourceLabel: string;
  onLoaded: (analysis: AnalysisResult, label: string) => void;
}

export function UploadView({ analysis, sourceLabel, onLoaded }: UploadViewProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length === 0) throw new Error("The CSV appears to be empty or has no data rows.");
      const result = analyzeReviews(rows);
      onLoaded(result, file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not analyse this file.");
    } finally {
      setBusy(false);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_REVIEWS_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_reviews.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Upload review data</h2>
        <p className="text-slate-400 text-sm">
          Load your own CSV export. Analysis runs locally in your browser after validation and de-duplication.
        </p>
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        className="glass glass-border rounded-2xl border-dashed p-10 text-center cursor-pointer hover:bg-white/[0.06] transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center bg-teal-500/10 border border-teal-500/25 text-teal-400">
          {busy ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileUp className="w-6 h-6" />}
        </div>
        <p className="mt-3 text-sm font-medium text-white">
          {busy ? "Analysing…" : "Click to choose a CSV file"}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Required columns: review_date, product, platform, rating, review_text
        </p>
        <p className="text-xs text-slate-500">Optional: review_id, product_url</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="glass glass-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Currently loaded</h3>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <dt className="text-[11px] text-slate-500">Dataset</dt>
            <dd className="text-slate-200 truncate" title={sourceLabel}>{sourceLabel}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-slate-500">Unique reviews</dt>
            <dd className="text-slate-200">{analysis?.deduped_review_count ?? 0}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-slate-500">Sources</dt>
            <dd className="text-slate-200">{analysis?.source_count ?? 0}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-slate-500">Products</dt>
            <dd className="text-slate-200">{analysis?.products.length ?? 0}</dd>
          </div>
        </dl>
      </div>

      <button
        onClick={downloadSample}
        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10"
      >
        <Download className="h-4 w-4" /> Download sample CSV template
      </button>
    </div>
  );
}
