import type { AnalysisResult, Review } from "./analysis";
import {
  ROOT_CAUSE_META,
  rootCauseForIssue,
  type RootCause,
} from "./rootCause";

export function platformLabel(platform: string): string {
  return platform.replace(/\s*\(simulated\)$/i, "");
}

export function isSimulatedPlatform(platform: string): boolean {
  return /\(simulated\)$/i.test(platform);
}

function currentReviews(analysis: AnalysisResult): Review[] {
  const [start, end] = analysis.current_period;
  return analysis.reviews.filter((r) => r.review_date >= start && r.review_date <= end);
}

function effectiveRootCause(review: Review): RootCause | null {
  if (review.root_cause) return review.root_cause;
  for (const issue of review.issues) {
    const cause = rootCauseForIssue(issue);
    if (cause) return cause;
  }
  return null;
}

export interface DiagnosticIssue {
  issue: string;
  mentions: number;
  share: number;
}

export interface RootCauseBucket {
  cause: RootCause;
  label: string;
  bucket: string;
  description: string;
  reviews: number;
  share: number;
  issues: DiagnosticIssue[];
}

export interface RootCauseDiagnostic {
  negativeTotal: number;
  classified: number;
  unclassified: number;
  buckets: RootCauseBucket[];
}

export function buildRootCauseDiagnostic(analysis: AnalysisResult): RootCauseDiagnostic {
  const current = currentReviews(analysis);
  const negative = current.filter((r) => r.sentiment === "Negative");
  const grouped = new Map<RootCause, { reviews: number; issues: Map<string, number> }>();
  let classified = 0;

  for (const cause of ["PRODUCT_DEFECT", "OPERATIONAL_ERROR"] as RootCause[]) {
    grouped.set(cause, { reviews: 0, issues: new Map() });
  }

  for (const review of negative) {
    const cause = effectiveRootCause(review);
    if (!cause) continue;
    const group = grouped.get(cause);
    if (!group) continue;
    classified += 1;
    group.reviews += 1;
    for (const issue of new Set(review.issues)) {
      group.issues.set(issue, (group.issues.get(issue) ?? 0) + 1);
    }
  }

  const buckets = (["PRODUCT_DEFECT", "OPERATIONAL_ERROR"] as RootCause[]).map((cause) => {
    const group = grouped.get(cause) ?? { reviews: 0, issues: new Map<string, number>() };
    const meta = ROOT_CAUSE_META[cause];
    const issues = Array.from(group.issues.entries())
      .map(([issue, mentions]) => ({
        issue,
        mentions,
        share: group.reviews
          ? Math.round((mentions / group.reviews) * 1000) / 10
          : 0,
      }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 5);

    return {
      cause,
      label: meta.label,
      bucket: meta.bucket,
      description: meta.description,
      reviews: group.reviews,
      share: negative.length
        ? Math.round((group.reviews / negative.length) * 1000) / 10
        : 0,
      issues,
    };
  });

  return {
    negativeTotal: negative.length,
    classified,
    unclassified: negative.length - classified,
    buckets,
  };
}

export interface PlatformSummary {
  platform: string;
  reviews: number;
  negative: number;
  mixed: number;
  positive: number;
  negativeShare: number;
  positiveShare: number;
  avgRating: number | null;
}

export interface PlatformMatrixCell {
  platform: string;
  mentions: number;
  shareOfIssue: number;
  shareOfPlatformNegative: number;
}

export interface PlatformMatrixRow {
  issue: string;
  total: number;
  cause: RootCause | null;
  cells: PlatformMatrixCell[];
}

export interface PlatformMatrix {
  platforms: PlatformSummary[];
  rows: PlatformMatrixRow[];
  negativeTotal: number;
}

export function buildPlatformMatrix(analysis: AnalysisResult): PlatformMatrix {
  const current = currentReviews(analysis);
  const platformNames = Array.from(new Set(current.map((r) => r.platform)));

  const platforms = platformNames
    .map((platform) => {
      const reviews = current.filter((r) => r.platform === platform);
      const negative = reviews.filter((r) => r.sentiment === "Negative").length;
      const mixed = reviews.filter((r) => r.sentiment === "Mixed / neutral").length;
      const positive = reviews.filter((r) => r.sentiment === "Positive").length;
      const total = reviews.length || 1;
      return {
        platform,
        reviews: reviews.length,
        negative,
        mixed,
        positive,
        negativeShare: Math.round((negative / total) * 1000) / 10,
        positiveShare: Math.round((positive / total) * 1000) / 10,
        avgRating: reviews.length
          ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 100) / 100
          : null,
      };
    })
    .sort((a, b) => b.negativeShare - a.negativeShare || b.reviews - a.reviews);

  const counts = new Map<string, Map<string, number>>();
  for (const review of current) {
    if (review.sentiment !== "Negative") continue;
    for (const issue of new Set(review.issues)) {
      const byPlatform = counts.get(issue) ?? new Map<string, number>();
      byPlatform.set(review.platform, (byPlatform.get(review.platform) ?? 0) + 1);
      counts.set(issue, byPlatform);
    }
  }

  const rows = Array.from(counts.entries())
    .map(([issue, byPlatform]) => {
      const total = Array.from(byPlatform.values()).reduce((sum, value) => sum + value, 0);
      const cells = platforms.map((platform) => {
        const mentions = byPlatform.get(platform.platform) ?? 0;
        return {
          platform: platform.platform,
          mentions,
          shareOfIssue: total ? Math.round((mentions / total) * 1000) / 10 : 0,
          shareOfPlatformNegative: platform.negative
            ? Math.round((mentions / platform.negative) * 1000) / 10
            : 0,
        };
      });
      return {
        issue,
        total,
        cause: rootCauseForIssue(issue),
        cells,
      };
    })
    .sort((a, b) => b.total - a.total);

  return {
    platforms,
    rows,
    negativeTotal: current.filter((r) => r.sentiment === "Negative").length,
  };
}

export type QuickWinKind = "listing" | "warehouse" | "platform";

export interface QuickWin {
  kind: QuickWinKind;
  label: string;
  detail: string;
  action: string;
  evidence: string;
  product?: string;
  platform?: string;
  issue?: string;
  rootCause?: RootCause;
}

interface IssueEntry {
  product: string;
  issue: string;
  cause: RootCause;
  mentions: number;
  platform: string;
  platformMentions: number;
  platformProductReviews: number;
  platformShare: number;
}

function issueEntries(current: Review[]): IssueEntry[] {
  const grouped = new Map<
    string,
    {
      product: string;
      issue: string;
      cause: RootCause;
      platforms: Map<string, number>;
    }
  >();

  for (const review of current) {
    if (review.sentiment !== "Negative") continue;
    const cause = effectiveRootCause(review);
    if (!cause) continue;
    for (const issue of new Set(review.issues)) {
      if (issue === "Other / needs review") continue;
      const key = `${review.product}|||${issue}|||${cause}`;
      const entry = grouped.get(key) ?? {
        product: review.product,
        issue,
        cause,
        platforms: new Map<string, number>(),
      };
      entry.platforms.set(review.platform, (entry.platforms.get(review.platform) ?? 0) + 1);
      grouped.set(key, entry);
    }
  }

  return Array.from(grouped.values())
    .map((entry) => {
      const [platform, platformMentions] = Array.from(entry.platforms.entries()).sort(
        (a, b) => b[1] - a[1]
      )[0] ?? ["", 0];
      const platformProductReviews = current.filter(
        (r) => r.product === entry.product && r.platform === platform
      ).length;
      return {
        product: entry.product,
        issue: entry.issue,
        cause: entry.cause,
        mentions: Array.from(entry.platforms.values()).reduce((sum, value) => sum + value, 0),
        platform,
        platformMentions,
        platformProductReviews,
        platformShare: platformProductReviews
          ? Math.round((platformMentions / platformProductReviews) * 1000) / 10
          : 0,
      };
    })
    .sort((a, b) => b.mentions - a.mentions || b.platformShare - a.platformShare);
}

function listingAction(issue: string, product: string): string {
  const actions: Record<string, string> = {
    "Size / fit / capacity":
      `Add a sizing and compatibility alert to the ${product} listing, with exact internal dimensions and a simple "fits this / not that" guide.`,
    "Colour / expectation":
      `Replace the ${product} listing photos with true-colour shots under neutral light and add a clear shade disclaimer for the affected variant.`,
    "Zipper / closure":
      `Add closure-care instructions and a stress-test check for the ${product}; inspect the affected batch before the next listing push.`,
    "Wheels / handle":
      `Publish clear usage limits for the ${product} and run a wheel/handle durability check on the current batch.`,
    "Stitching / seams":
      `Move the ${product} seam/thread specification into QC review and add a "stress points" note to the listing.`,
    "Material / finish":
      `Add close-up material and finish photos for the ${product}, plus a care note that sets realistic wear expectations.`,
    "Comfort / weight":
      `Clarify the loaded weight and fit of the ${product} in the listing, and test the strap/padding with a representative load.`,
  };
  return (
    actions[issue] ??
    `Update the ${product} listing with clearer expectations around ${issue.toLowerCase()} and add a pre-purchase check.`
  );
}

function operationalLabel(issue: string): string {
  if (issue === "Price / value") return "Commercial check";
  if (issue === "Customer service / returns") return "Returns check";
  return "Warehouse check";
}

function operationalAction(issue: string, product: string, platform: string): string {
  const actions: Record<string, string> = {
    "Packaging / delivery":
      `Audit packaging and carrier handoff for ${product} on ${platform}; add corner protection and a pre-dispatch damage check.`,
    "Customer service / returns":
      `Create a 24-hour resolution queue for ${product} returns on ${platform} and track repeat contacts by batch.`,
    "Price / value":
      `Review the ${platform} price and bundle for ${product} against the value customers expected, then test one clearer offer.`,
  };
  return (
    actions[issue] ??
    `Assign a warehouse owner to inspect the affected ${product} batch on ${platform} and record the corrective action.`
  );
}

function platformWin(
  current: Review[],
  entries: IssueEntry[],
  used: Set<string>
): QuickWin | null {
  const platforms = Array.from(new Set(current.map((r) => r.platform)))
    .map((platform) => {
      const reviews = current.filter((r) => r.platform === platform);
      const negative = reviews.filter((r) => r.sentiment === "Negative");
      return {
        platform,
        reviews: reviews.length,
        negative: negative.length,
        negativeShare: reviews.length
          ? Math.round((negative.length / reviews.length) * 1000) / 10
          : 0,
      };
    })
    .filter((p) => p.reviews >= 3)
    .sort((a, b) => b.negativeShare - a.negativeShare || b.negative - a.negative);

  const worst = platforms[0];
  if (!worst) return null;

  const top =
    entries
      .filter((entry) => entry.platform === worst.platform)
      .sort((a, b) => b.platformMentions - a.platformMentions)[0] ??
    entries.find((entry) => entry.platform === worst.platform) ??
    null;

  if (!top) {
    return {
      kind: "platform",
      label: "Channel focus",
      detail: `${platformLabel(worst.platform)} carries a ${worst.negativeShare}% negative share across ${worst.reviews} reviews.`,
      action:
        "Review listing accuracy, batch allocation and fulfilment SLAs for this channel before increasing spend.",
      evidence: `${worst.reviews} reviews · ${worst.negative} negative`,
      platform: worst.platform,
    };
  }

  used.add(`${top.product}|||${top.issue}`);
  return {
    kind: "platform",
    label: "Channel focus",
    detail: `${platformLabel(worst.platform)} has a ${worst.negativeShare}% negative share; "${top.issue}" is its biggest cluster (${top.platformMentions} mentions).`,
    action: `Assign a channel owner to review ${top.product} listing accuracy, batch allocation and fulfilment SLAs on ${platformLabel(worst.platform)}.`,
    evidence: `${worst.reviews} reviews · ${worst.negative} negative · ${top.platformMentions} mentions`,
    product: top.product,
    platform: worst.platform,
    issue: top.issue,
    rootCause: top.cause,
  };
}

export function buildQuickWins(analysis: AnalysisResult): QuickWin[] {
  const current = currentReviews(analysis);
  const entries = issueEntries(current);
  const wins: QuickWin[] = [];
  const used = new Set<string>();

  const productEntry = entries.find((entry) => entry.cause === "PRODUCT_DEFECT");
  if (productEntry) {
    used.add(`${productEntry.product}|||${productEntry.issue}`);
    wins.push({
      kind: "listing",
      label: "Update listing",
      detail: `${productEntry.platformShare}% of ${platformLabel(productEntry.platform)} reviews for ${productEntry.product} mention ${productEntry.issue.toLowerCase()}.`,
      action: listingAction(productEntry.issue, productEntry.product),
      evidence: `${productEntry.mentions} mentions · ${platformLabel(productEntry.platform)}`,
      product: productEntry.product,
      platform: productEntry.platform,
      issue: productEntry.issue,
      rootCause: "PRODUCT_DEFECT",
    });
  }

  const operationalEntry = entries.find((entry) => entry.cause === "OPERATIONAL_ERROR");
  if (operationalEntry) {
    used.add(`${operationalEntry.product}|||${operationalEntry.issue}`);
    wins.push({
      kind: "warehouse",
      label: operationalLabel(operationalEntry.issue),
      detail: `${operationalEntry.platformShare}% of ${platformLabel(operationalEntry.platform)} reviews for ${operationalEntry.product} point to ${operationalEntry.issue.toLowerCase()}.`,
      action: operationalAction(
        operationalEntry.issue,
        operationalEntry.product,
        platformLabel(operationalEntry.platform)
      ),
      evidence: `${operationalEntry.mentions} mentions · ${platformLabel(operationalEntry.platform)}`,
      product: operationalEntry.product,
      platform: operationalEntry.platform,
      issue: operationalEntry.issue,
      rootCause: "OPERATIONAL_ERROR",
    });
  }

  const channel = platformWin(current, entries, used);
  if (channel) wins.push(channel);

  const fallback = entries.find((entry) => !used.has(`${entry.product}|||${entry.issue}`));
  if (wins.length < 3 && fallback) {
    wins.push({
      kind: "listing",
      label: "Product check",
      detail: `${fallback.mentions} negative mentions of ${fallback.issue.toLowerCase()} are concentrated on ${platformLabel(fallback.platform)} for ${fallback.product}.`,
      action: listingAction(fallback.issue, fallback.product),
      evidence: `${fallback.platformMentions} on ${platformLabel(fallback.platform)}`,
      product: fallback.product,
      platform: fallback.platform,
      issue: fallback.issue,
      rootCause: fallback.cause,
    });
  }

  return wins.slice(0, 3);
}
