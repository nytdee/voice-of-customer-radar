"use client";

import { useRef, useState } from "react";
import { Download, FileUp, Loader2, Sparkles } from "lucide-react";
import { parseCsv } from "@/lib/csv";
import { analyzeReviews } from "@/lib/analysis";
import type { AnalysisResult } from "@/lib/analysis";
import { SAMPLE_REVIEWS_CSV } from "@/lib/sampleData";
import { applyAiTags, toTaggingRows, type AiTag } from "@/lib/tagging";

interface UploadViewProps {
  analysis: AnalysisResult | null;
  sourceLabel: string;
  onLoaded: (analysis: AnalysisResult, label: string) => void;
}

export function UploadView({ analysis, sourceLabel, onLoaded }: UploadViewProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useAi, setUseAi] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const text = await file.text();
      let rows: Array<Record<string, unknown>> = parseCsv(text);
      if (rows.length === 0) throw new Error("The CSV appears to be empty or has no data rows.");

      let label = file.name;
      if (useAi) {
        try {
          const taggingRows = toTaggingRows(rows).slice(0, 200);
          const response = await fetch("/api/tag", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rows: taggingRows }),
          });
          const payload = (await response.json()) as {
            ok?: boolean;
            configured?: boolean;
            tags?: AiTag[];
            reason?: string;
            error?: string;
          };
          if (payload.ok && Array.isArray(payload.tags)) {
            const applied = applyAiTags(rows, payload.tags);
            rows = applied.rows;
            label = `${file.name} · AI-tagged ${applied.applied}/${taggingRows.length}`;
            setNotice(
              `AI tagged ${applied.applied} of ${taggingRows.length} reviews with [PRODUCT_DEFECT] / [OPERATIONAL_ERROR]. Remaining reviews use rules.`
            );
          } else {
            setNotice(payload.reason ?? payload.error ?? "AI tagging unavailable — rules-based tags used.");
          }
        } catch {
          setNotice("AI tagging unavailable — rules-based tags used.");
        }
      }

      const result = analyzeReviews(rows);
      onLoaded(result, label);
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
        <p className="text-xs text-slate-500">Optional: review_id, product_url, root_cause/category ([PRODUCT_DEFECT] or [OPERATIONAL_ERROR])</p>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors hover:bg-white/[0.06]">
        <input
          type="checkbox"
          checked={useAi}
          onChange={(e) => setUseAi(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-slate-900 accent-teal-500"
        />
        <span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
            <Sparkles className="h-3.5 w-3.5 text-teal-400" /> AI root-cause tagging (optional)
          </span>
          <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-500">
            Sends up to 200 reviews to the configured AI endpoint to tag each one
            [PRODUCT_DEFECT] or [OPERATIONAL_ERROR]. Without <code>AI_API_KEY</code>, the
            deterministic rules run and nothing leaves your browser.
          </span>
        </span>
      </label>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {notice && !error && (
        <div className="rounded-xl border border-teal-500/20 bg-teal-500/10 px-4 py-3 text-xs text-teal-200">
          {notice}
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
