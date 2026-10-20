import {
  ALIASES,
  ISSUE_RULES,
  NEGATIVE_TERMS,
  POSITIVE_TERMS,
  RECOMMENDATIONS,
  REQUIRED_COLUMNS,
} from "./taxonomy";

export interface RawReview {
  [key: string]: unknown;
}

export interface Review {
  review_id: string;
  review_date: Date;
  product: string;
  platform: string;
  rating: number;
  review_text: string;
  product_url: string;
  sentiment: "Negative" | "Positive" | "Mixed / neutral";
  issues: string[];
  issue_count: number;
}

export interface PeriodSummary {
  reviews: number;
  negative_reviews: number;
  negative_share_pct: number;
  avg_review_rating: number | null;
}

export interface IssueRow {
  product: string;
  issue: string;
  mentions: number;
  previous_mentions: number;
  avg_rating: number;
  one_two_star_count: number;
  change_pct: number;
  recommendation: string;
}

export interface RatingTrendRow {
  product: string;
  current_avg_review_rating: number | null;
  previous_avg_review_rating: number | null;
  rating_delta: number | null;
  current_review_count: number;
  previous_review_count: number;
}

export interface ProductReport {
  product: string;
  current: PeriodSummary;
  previous: PeriodSummary;
  top_issues: IssueRow[];
  rating_trend: RatingTrendRow;
}

export interface AnalysisResult {
  reviews: Review[];
  issues: IssueRow[];
  rating_trend: RatingTrendRow[];
  anchor_date: Date;
  current_period: [Date, Date];
  previous_period: [Date, Date];
  overall_current: PeriodSummary;
  overall_previous: PeriodSummary;
  products: ProductReport[];
  source_count: number;
  deduped_review_count: number;
}

function normalCol(s: string): string {
  return String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

export function normalizeColumns(input: RawReview[]): Review[] {
  if (!Array.isArray(input) || input.length === 0) {
    throw new Error("No review rows provided.");
  }

  const first = input[0];
  const lookup: Record<string, string> = {};
  for (const c of Object.keys(first)) {
    lookup[normalCol(c)] = c;
  }

  const rename: Record<string, string> = {};
  for (const [canonical, options] of Object.entries(ALIASES)) {
    for (const option of options) {
      const k = normalCol(option);
      if (k in lookup) {
        rename[lookup[k]] = canonical;
        break;
      }
    }
  }

  const rows = input.map((row) => {
    const r: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      const target = rename[key] ?? key;
      r[target] = value;
    }
    return r;
  });

  const missing = REQUIRED_COLUMNS.filter((c) => !(c in rows[0]));
  if (missing.length > 0) {
    throw new Error(
      "Missing required columns: " +
        missing.join(", ") +
        ". Required fields are review_date, product, platform, rating, review_text."
    );
  }

  const parseDate = (v: unknown): Date | null => {
    if (v === null || v === undefined || v === "") return null;
    const d = new Date(String(v));
    if (isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const parseRating = (v: unknown): number | null => {
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    return n;
  };

  const asStr = (v: unknown): string =>
    v === null || v === undefined ? "" : String(v).trim();

  const computed: Record<number, string> = {};
  const normalized: Review[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const review_date = parseDate(row["review_date"]);
    const rating = parseRating(row["rating"]);
    const product = asStr(row["product"]);
    const platform = asStr(row["platform"]);
    const review_text = asStr(row["review_text"]);
    const review_id = asStr(row["review_id"]);
    const product_url = asStr(row["product_url"]);

    if (!review_date || rating === null) continue;
    if (product === "" || review_text === "") continue;
    if (rating < 1 || rating > 5) continue;

    let dedupeKey: string;
    if (review_id) {
      dedupeKey = `${platform}::${review_id}`;
    } else {
      const basis = [
        product.toLowerCase(),
        platform.toLowerCase(),
        review_date.toISOString().slice(0, 10),
        String(rating),
        review_text.toLowerCase().replace(/\s+/g, " ").trim(),
      ].join("|");
      let hash = 0;
      for (let j = 0; j < basis.length; j++) {
        const char = basis.charCodeAt(j);
        hash = (hash << 5) - hash + char;
        hash |= 0;
      }
      dedupeKey = Math.abs(hash).toString(16).slice(0, 20);
    }
    computed[i] = dedupeKey;

    normalized.push({
      review_id,
      review_date,
      product,
      platform,
      rating,
      review_text,
      product_url,
      sentiment: "Mixed / neutral",
      issues: [],
      issue_count: 0,
    });
  }

  // Stable dedupe: keep last occurrence per key.
  const seen = new Map<string, number>();
  for (let i = 0; i < normalized.length; i++) {
    seen.set(computed[i], i);
  }
  const dedupedIndices = Array.from(seen.values()).sort((a, b) => a - b);
  const deduped = dedupedIndices.map((i) => normalized[i]);

  deduped.sort((a, b) => a.review_date.getTime() - b.review_date.getTime());

  return deduped.map((r) => ({
    ...r,
    sentiment: classifySentiment(r.review_text, r.rating),
    issues: classifyIssues(r.review_text),
  })) as Review[];
}

export function classifyIssues(text: string): string[] {
  const body = String(text).toLowerCase().replace(/\s+/g, " ").trim();
  const found: string[] = [];
  for (const [issue, terms] of Object.entries(ISSUE_RULES)) {
    if (terms.some((t) => body.includes(t))) found.push(issue);
  }
  return found.length > 0 ? found : ["Other / needs review"];
}

export function classifySentiment(text: string, rating: number): Review["sentiment"] {
  const body = String(text).toLowerCase();
  const neg = NEGATIVE_TERMS.some((t) => body.includes(t));
  const pos = POSITIVE_TERMS.some((t) => body.includes(t));
  if (rating <= 2 || (rating <= 3 && neg) || (neg && !pos)) return "Negative";
  if (rating >= 4 && !neg) return "Positive";
  if (pos && !neg) return "Positive";
  return "Mixed / neutral";
}

export function enrichReviews(input: RawReview[]): Review[] {
  const normalized = normalizeColumns(input);
  return normalized.map((r) => ({
    ...r,
    sentiment: classifySentiment(r.review_text, r.rating),
    issues: classifyIssues(r.review_text),
    issue_count: classifyIssues(r.review_text).length,
  }));
}

function periodSummary(sub: Review[]): PeriodSummary {
  const reviews = sub.length;
  const negative_reviews = sub.filter((r) => r.sentiment === "Negative").length;
  const negative_share_pct = reviews
    ? Math.round((negative_reviews / reviews) * 1000) / 10
    : 0;
  const avg_review_rating = reviews
    ? Math.round((sub.reduce((s, r) => s + r.rating, 0) / reviews) * 100) / 100
    : null;
  return { reviews, negative_reviews, negative_share_pct, avg_review_rating };
}

export function analyzeReviews(input: RawReview[]): AnalysisResult {
  const enriched = enrichReviews(input);
  if (enriched.length === 0) {
    throw new Error(
      "No valid reviews were found after validation. Check dates, ratings and text."
    );
  }

  const anchor = new Date(
    Math.max(...enriched.map((r) => r.review_date.getTime()))
  );
  const thisStart = new Date(anchor);
  thisStart.setDate(anchor.getDate() - 6);
  const prevEnd = new Date(thisStart);
  prevEnd.setDate(thisStart.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevEnd.getDate() - 6);

  const current = enriched.filter(
    (r) => r.review_date >= thisStart && r.review_date <= anchor
  );
  const previous = enriched.filter(
    (r) => r.review_date >= prevStart && r.review_date <= prevEnd
  );

  function issueCounts(sub: Review[]): IssueRow[] {
    const neg = sub.filter((r) => r.sentiment === "Negative");
    if (neg.length === 0) return [];
    const counts = new Map<string, IssueRow>();
    for (const r of neg) {
      for (const issue of r.issues) {
        const key = `${r.product}|||${issue}`;
        const existing = counts.get(key);
        if (existing) {
          existing.mentions += 1;
          existing.avg_rating =
            Math.round(
              ((existing.avg_rating * (existing.mentions - 1) + r.rating) /
                existing.mentions) *
                100
            ) / 100;
          if (r.rating <= 2) existing.one_two_star_count += 1;
        } else {
          counts.set(key, {
            product: r.product,
            issue,
            mentions: 1,
            previous_mentions: 0,
            avg_rating: Math.round(r.rating * 100) / 100,
            one_two_star_count: r.rating <= 2 ? 1 : 0,
            change_pct: 0,
            recommendation: RECOMMENDATIONS[issue] ?? RECOMMENDATIONS["Other / needs review"],
          });
        }
      }
    }
    return Array.from(counts.values());
  }

  const currentIssues = issueCounts(current);
  const previousIssuesMap = new Map<string, number>();
  for (const row of issueCounts(previous)) {
    previousIssuesMap.set(`${row.product}|||${row.issue}`, row.mentions);
  }

  const issues: IssueRow[] = [];
  for (const row of currentIssues) {
    const key = `${row.product}|||${row.issue}`;
    const previous_mentions = previousIssuesMap.get(key) ?? 0;
    let change_pct = 0;
    if (previous_mentions > 0) {
      change_pct = Math.round(((row.mentions - previous_mentions) / previous_mentions) * 100 * 10) / 10;
    } else if (row.mentions > 0) {
      change_pct = 100;
    }
    issues.push({
      ...row,
      previous_mentions,
      change_pct,
    });
  }

  issues.sort(
    (a, b) =>
      a.product.localeCompare(b.product) ||
      b.mentions - a.mentions ||
      b.one_two_star_count - a.one_two_star_count
  );

  // Rating trend per product.
  const productRatingCurrent = new Map<string, { sum: number; n: number }>();
  for (const r of current) {
    const key = r.product;
    const cur = productRatingCurrent.get(key) ?? { sum: 0, n: 0 };
    cur.sum += r.rating;
    cur.n += 1;
    productRatingCurrent.set(key, cur);
  }
  const productRatingPrev = new Map<string, { sum: number; n: number }>();
  for (const r of previous) {
    const key = r.product;
    const cur = productRatingPrev.get(key) ?? { sum: 0, n: 0 };
    cur.sum += r.rating;
    cur.n += 1;
    productRatingPrev.set(key, cur);
  }

  const ratingTrend: RatingTrendRow[] = [];
  const allProducts = Array.from(
    new Set([
      ...Array.from(productRatingCurrent.keys()),
      ...Array.from(productRatingPrev.keys()),
    ])
  );
  for (const product of allProducts) {
    const cur = productRatingCurrent.get(product);
    const prev = productRatingPrev.get(product);
    const current_avg_review_rating = cur
      ? Math.round((cur.sum / cur.n) * 100) / 100
      : null;
    const previous_avg_review_rating = prev
      ? Math.round((prev.sum / prev.n) * 100) / 100
      : null;
    const rating_delta =
      current_avg_review_rating !== null && previous_avg_review_rating !== null
        ? Math.round((current_avg_review_rating - previous_avg_review_rating) * 100) / 100
        : null;
    ratingTrend.push({
      product,
      current_avg_review_rating,
      previous_avg_review_rating,
      rating_delta,
      current_review_count: cur?.n ?? 0,
      previous_review_count: prev?.n ?? 0,
    });
  }
  ratingTrend.sort((a, b) => {
    if (a.rating_delta === null && b.rating_delta === null) return 0;
    if (a.rating_delta === null) return 1;
    if (b.rating_delta === null) return -1;
    return a.rating_delta - b.rating_delta;
  });

  const products: ProductReport[] = [];
  const enrichedProducts = new Set(enriched.map((r) => r.product));
  for (const product of Array.from(enrichedProducts).sort()) {
    const c = current.filter((r) => r.product === product);
    const p = previous.filter((r) => r.product === product);
    const current_summary = periodSummary(c);
    const previous_summary = periodSummary(p);
    const tops = issues.filter((i) => i.product === product).slice(0, 3);
        const trend = ratingTrend.find((t) => t.product === product);
        products.push({
          product,
          current: current_summary,
          previous: previous_summary,
          top_issues: tops,
          rating_trend: trend ?? {
            product,
            current_avg_review_rating: null,
            previous_avg_review_rating: null,
            rating_delta: null,
            current_review_count: 0,
            previous_review_count: 0,
          },
        });
  }

  const overall_current = periodSummary(current);
  const overall_previous = periodSummary(previous);

  return {
    reviews: enriched,
    issues,
    rating_trend: ratingTrend,
    anchor_date: anchor,
    current_period: [thisStart, anchor],
    previous_period: [prevStart, prevEnd],
    overall_current,
    overall_previous,
    products,
    source_count: new Set(enriched.map((r) => r.platform)).size,
    deduped_review_count: enriched.length,
  };
}

export function pctChange(current: number, previous: number): string {
  if (!previous) return current ? "new" : "0%";
  return `${(((current - previous) / previous) * 100).toFixed(0)}%`;
}
