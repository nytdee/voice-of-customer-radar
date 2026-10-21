"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Sidebar from "@/components/Sidebar";
import type { NavContext, ViewKey } from "@/lib/nav";
import Header from "@/components/Header";
import { OverviewView } from "@/components/OverviewView";
import { InsightsView } from "@/components/InsightsView";
import { ProductsView } from "@/components/ProductsView";
import { ReviewsView } from "@/components/ReviewsView";
import { UploadView } from "@/components/UploadView";
import { DiscoveryView } from "@/components/DiscoveryView";
import { IntegrationsView } from "@/components/IntegrationsView";
import { analyzeReviews } from "@/lib/analysis";
import type { AnalysisResult } from "@/lib/analysis";
import type { ConnectedChannel, MarketplaceId, MarketplaceSyncResult } from "@/lib/integrations";
import { marketplaceDisplayLabel } from "@/lib/integrations";
import { parseSampleCsv, SAMPLE_REVIEWS_CSV } from "@/lib/sampleData";

function fmt(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Dashboard() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [sourceLabel, setSourceLabel] = useState("Included synthetic sample dataset");
  const [sourceLabels, setSourceLabels] = useState<string[]>([
    "Included synthetic sample dataset",
  ]);
  const [view, setView] = useState<ViewKey>("overview");
  const [nav, setNav] = useState<NavContext>({});
  const [error, setError] = useState<string | null>(null);
  const [connections, setConnections] = useState<
    Partial<Record<MarketplaceId, ConnectedChannel>>
  >({});
  const rowsRef = useRef<Array<Record<string, unknown>>>([]);

  const go = (next: ViewKey, context: NavContext = {}) => {
    setNav(context);
    setView(next);
  };

  const applyRows = useCallback(
    (rows: Array<Record<string, unknown>>, labels: string[]) => {
      rowsRef.current = rows;
      setAnalysis(analyzeReviews(rows));
      setSourceLabels(labels);
      setSourceLabel(labels.join(" + "));
      setError(null);
    },
    []
  );

  const loadSample = useCallback(() => {
    try {
      applyRows(parseSampleCsv(SAMPLE_REVIEWS_CSV), ["Included synthetic sample dataset"]);
      setConnections({});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to analyse the sample dataset.");
    }
  }, [applyRows]);

  const replaceDataset = useCallback(
    (rows: Array<Record<string, unknown>>, label: string, nextView: ViewKey = "overview") => {
      try {
        applyRows(rows, [label]);
        setView(nextView);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to analyse that dataset.");
      }
    },
    [applyRows]
  );

  const handleSynced = useCallback(
    (result: MarketplaceSyncResult) => {
      try {
        rowsRef.current = [
          ...rowsRef.current,
          ...result.rows.map((row): Record<string, unknown> => ({ ...row })),
        ];
        applyRows(rowsRef.current, [
          ...sourceLabels,
          `${marketplaceDisplayLabel(result.platform)} sync (demo)`,
        ]);
        setConnections((prev) => ({
          ...prev,
          [result.platform]: {
            platform: result.platform,
            targets: result.targets,
            reviewCount: result.reviewCount,
            connectedAtIso: result.fetchedAtIso,
          },
        }));
        setView("overview");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Marketplace sync analysis failed.");
      }
    },
    [applyRows, sourceLabels]
  );

  useEffect(() => {
    loadSample();
  }, [loadSample]);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (
      ["overview", "insights", "products", "reviews", "upload", "discovery", "integrations"].includes(
        hash
      )
    ) {
      setView(hash as ViewKey);
    }
  }, []);

  const subtitle = analysis
    ? `${fmt(analysis.current_period[0])} – ${fmt(analysis.current_period[1])} · ${analysis.overall_current.reviews} reviews this week`
    : "Loading dataset…";

  return (
    <div className="min-h-screen relative overflow-hidden pl-16 md:pl-56">
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div className="absolute top-0 left-1/3 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-teal-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <Sidebar
        active={view}
        onNavigate={(next) => go(next)}
        sourceLabel={sourceLabel}
        onReset={() => {
          loadSample();
          go("overview");
        }}
      />
      <Header subtitle={subtitle} sourceLabel={sourceLabel} />

      <main className="px-4 md:px-8 py-6 relative z-10 max-w-7xl mx-auto w-full">
        {error ? (
          <div className="glass glass-border rounded-2xl p-8 max-w-lg">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={loadSample}
              className="mt-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 hover:bg-white/10"
            >
              Retry with sample data
            </button>
          </div>
        ) : !analysis ? (
          <div className="flex items-center justify-center py-24">
            <div className="glass glass-border rounded-2xl p-8 flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
              <p className="text-slate-400 text-sm">Analysing review data…</p>
            </div>
          </div>
        ) : (
          <>
            {view === "overview" && <OverviewView analysis={analysis} onNavigate={go} />}
            {view === "insights" && <InsightsView analysis={analysis} onNavigate={go} />}
            {view === "products" && (
              <ProductsView
                key={`products-${nav.product ?? ""}-${nav.issue ?? ""}`}
                analysis={analysis}
                initialProduct={nav.product}
                initialIssue={nav.issue}
                onNavigate={go}
              />
            )}
            {view === "reviews" && (
              <ReviewsView
                key={`reviews-${JSON.stringify(nav)}`}
                analysis={analysis}
                initial={nav}
              />
            )}
            {view === "upload" && (
              <UploadView
                analysis={analysis}
                sourceLabel={sourceLabel}
                onLoaded={(rows, label) => replaceDataset(rows, label)}
              />
            )}
            {view === "discovery" && (
              <DiscoveryView
                onAnalyse={(rows, label) => replaceDataset(rows, label)}
              />
            )}
            {view === "integrations" && (
              <IntegrationsView
                connections={connections}
                onSynced={handleSynced}
              />
            )}

            <footer className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-4">
              <p className="text-xs text-slate-500">
                Synthetic demo data · issue counts are not claims about any real marketplace or product.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                {analysis.source_count} sources · {analysis.deduped_review_count} reviews
              </div>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
