"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Store,
  type LucideIcon,
} from "lucide-react";
import {
  AMAZON_REGIONS,
  formatRelativeSync,
  marketplaceDisplayLabel,
  type ConnectedChannel,
  type MarketplaceId,
  type MarketplaceSyncResult,
} from "@/lib/integrations";

interface IntegrationsViewProps {
  connections: Partial<Record<MarketplaceId, ConnectedChannel>>;
  onSynced: (result: MarketplaceSyncResult) => void;
}

const CARD_META: Record<
  MarketplaceId,
  { icon: LucideIcon; accent: string; border: string; note: string; cta: string }
> = {
  shopify: {
    icon: Store,
    accent: "text-emerald-300",
    border: "border-emerald-500/20 hover:border-emerald-500/35",
    note: "Reviews from a reviews app metafield (Judge.me, Loox, Product Reviews).",
    cta: "Connect & Fetch",
  },
  amazon: {
    icon: ShoppingBag,
    accent: "text-amber-300",
    border: "border-amber-500/20 hover:border-amber-500/35",
    note: "Pulled per ASIN from the chosen marketplace region.",
    cta: "Connect & Fetch",
  },
  flipkart: {
    icon: ShoppingCart,
    accent: "text-sky-300",
    border: "border-sky-500/20 hover:border-sky-500/35",
    note: "Per-product listing; the product ID is taken from the URL or PID.",
    cta: "Connect & Fetch",
  },
};

const inputClass =
  "h-9 w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-teal-500/40";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-300">{label}</label>
      {children}
    </div>
  );
}

export function IntegrationsView({ connections, onSynced }: IntegrationsViewProps) {
  const [shopifyUrl, setShopifyUrl] = useState("");
  const [shopifyToken, setShopifyToken] = useState("");
  const [amazonRegion, setAmazonRegion] = useState<(typeof AMAZON_REGIONS)[number]>("US");
  const [amazonAsins, setAmazonAsins] = useState("");
  const [flipkartRef, setFlipkartRef] = useState("");
  const [syncing, setSyncing] = useState<MarketplaceId | null>(null);
  const [errorByPlatform, setErrorByPlatform] = useState<Partial<Record<MarketplaceId, string>>>({});
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 30000);
    return () => window.clearInterval(id);
  }, []);

  const credentialsFor = (platform: MarketplaceId) => {
    if (platform === "shopify") {
      return { storeUrl: shopifyUrl, accessToken: shopifyToken };
    }
    if (platform === "amazon") {
      return { region: amazonRegion, asinsCsv: amazonAsins };
    }
    return { productRef: flipkartRef };
  };

  const connect = async (platform: MarketplaceId) => {
    setSyncing(platform);
    setErrorByPlatform((prev) => ({ ...prev, [platform]: undefined }));
    try {
      const res = await fetch("/api/integrations/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, credentials: credentialsFor(platform) }),
      });
      const payload = (await res.json()) as MarketplaceSyncResult & { ok?: boolean; error?: string };
      if (!res.ok || !payload.ok) {
        throw new Error(payload.error ?? `${marketplaceDisplayLabel(platform)} sync failed.`);
      }
      onSynced(payload);
    } catch (e) {
      setErrorByPlatform((prev) => ({
        ...prev,
        [platform]: e instanceof Error ? e.message : `${marketplaceDisplayLabel(platform)} sync failed.`,
      }));
    } finally {
      setSyncing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Integrations &amp; data sync</h2>
        <p className="text-slate-400 text-sm">
          Connect storefronts and target marketplaces. Successful syncs merge fresh reviews into the
          active dashboard dataset immediately.
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Access tokens are used only for this request and are never persisted. Demo channels emit
          simulated reviews so the full flow can be walked through safely.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(["shopify", "amazon", "flipkart"] as MarketplaceId[]).map((platform) => {
          const meta = CARD_META[platform];
          const Icon = meta.icon;
          const connection = connections[platform];
          const busy = syncing === platform;
          const error = errorByPlatform[platform];
          const credentials = credentialsFor(platform);
          const hasInput =
            platform === "shopify"
              ? (credentials as { storeUrl: string; accessToken: string }).storeUrl.trim().length > 0 &&
                (credentials as { storeUrl: string; accessToken: string }).accessToken.trim().length > 0
              : platform === "amazon"
                ? (credentials as { asinsCsv: string }).asinsCsv.trim().length > 0
                : (credentials as { productRef: string }).productRef.trim().length > 0;

          return (
            <section
              key={platform}
              className={`glass glass-border rounded-2xl border p-5 flex flex-col ${meta.border}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 shrink-0 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center ${meta.accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {marketplaceDisplayLabel(platform)}
                    </h3>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{meta.note}</p>
                  </div>
                </div>
              </div>

              {connection ? (
                <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.07] px-2.5 py-1.5 text-[11px] text-emerald-200 w-fit">
                  <span className="inline-flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                  </span>
                  <span className="mx-1.5 opacity-40">•</span>
                  Synced {formatRelativeSync(connection.connectedAtIso)}
                </div>
              ) : (
                <div className="mt-3 w-fit rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-slate-400">
                  Not connected
                </div>
              )}

              <div className="mt-4 space-y-3 flex-1">
                {platform === "shopify" && (
                  <>
                    <Field label="Shopify Store URL">
                      <input
                        type="text"
                        value={shopifyUrl}
                        onChange={(e) => setShopifyUrl(e.target.value)}
                        placeholder="https://my-store.myshopify.com"
                        className={inputClass}
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </Field>
                    <Field label="Access Token / API Key">
                      <input
                        type="password"
                        value={shopifyToken}
                        onChange={(e) => setShopifyToken(e.target.value)}
                        placeholder="shpca_xxxxxxxxxxxxxxxx"
                        className={inputClass}
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </Field>
                  </>
                )}

                {platform === "amazon" && (
                  <>
                    <Field label="Region">
                      <select
                        value={amazonRegion}
                        onChange={(e) => setAmazonRegion(e.target.value as (typeof AMAZON_REGIONS)[number])}
                        className={inputClass}
                      >
                        {AMAZON_REGIONS.map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Product ASINs (comma separated)">
                      <input
                        type="text"
                        value={amazonAsins}
                        onChange={(e) => setAmazonAsins(e.target.value)}
                        placeholder="B08N5WRWNW, B07FZ8S74R"
                        className={inputClass}
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </Field>
                  </>
                )}

                {platform === "flipkart" && (
                  <Field label="Flipkart Product URL / Product ID">
                    <input
                      type="text"
                      value={flipkartRef}
                      onChange={(e) => setFlipkartRef(e.target.value)}
                      placeholder="https://www.flipkart.com/product/p/…  or PID"
                      className={inputClass}
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </Field>
                )}
              </div>

              {error && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {connection && (
                <p className="mt-3 text-[11px] text-slate-500">
                  Last batch: {connection.reviewCount} reviews ·{" "}
                  {connection.targets.slice(0, 2).join(", ")}
                  {connection.targets.length > 2 ? "…" : ""}
                </p>
              )}

              <button
                type="button"
                onClick={() => void connect(platform)}
                disabled={busy || syncing !== null}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : connection ? (
                  <RefreshCw className="h-4 w-4" />
                ) : null}
                {busy
                  ? `Syncing data from ${marketplaceDisplayLabel(platform)}...`
                  : connection
                    ? "Sync again"
                    : meta.cta}
              </button>
              {busy && (
                <p className="mt-2 text-center text-[11px] text-slate-500">
                  This may take up to 2 minutes.
                </p>
              )}
              {!busy && !hasInput && (
                <p className="mt-2 text-center text-[10px] text-slate-600">
                  Fill in the fields above to enable a demo sync.
                </p>
              )}
            </section>
          );
        })}
      </div>

      <div className="glass glass-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-2">Connected channels</h3>
        {Object.keys(connections).length === 0 ? (
          <p className="text-xs text-slate-500">
            No marketplace channels connected yet. The dashboard runs on the base dataset you loaded
            (sample, upload or discovery).
          </p>
        ) : (
          <div className="space-y-2">
            {(Object.values(connections) as ConnectedChannel[]).map((channel) => (
              <div
                key={channel.platform}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-teal-500/10 text-teal-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate text-xs font-medium text-slate-200">
                    {marketplaceDisplayLabel(channel.platform)} sync
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span>{channel.reviewCount} reviews</span>
                  <span title={channel.connectedAtIso}>
                    Connected • Synced {formatRelativeSync(channel.connectedAtIso)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
