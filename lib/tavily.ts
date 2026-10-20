import { ISSUE_RULES } from "./taxonomy";

export interface TavilyResult {
  title: string;
  url: string;
  published_date: string;
  content: string;
  raw_content?: string;
}

export interface TavilySearchResponse {
  results: TavilyResult[];
  answer?: string;
  response_time?: number;
}

export interface WebSnippet {
  title: string;
  url: string;
  published_date: string;
  snippet: string;
  themes_detected: string;
  evidence_warning: string;
  rating: null;
}

const PLATFORM_DOMAINS: Record<string, string> = {
  "Amazon India": "amazon.in",
  Flipkart: "flipkart.com",
  Myntra: "myntra.com",
  Blinkit: "blinkit.com",
  Zepto: "zeptonow.com",
};

export function buildSearchQueries(product: string, domains: string[]): string[] {
  const labels = (domains ?? []).map((d) => d.trim()).filter(Boolean);
  if (labels.length === 0) {
    return [`"${product}" reviews complaints issues customer feedback`];
  }
  const seen = new Set<string>();
  const queries: string[] = [];
  for (const label of labels) {
    const mapped = PLATFORM_DOMAINS[label] ?? (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(label) ? label : "");
    const query = mapped
      ? `"${product}" reviews complaints issues site:${mapped}`
      : `"${product}" reviews complaints issues customer feedback`;
    if (!seen.has(query)) {
      seen.add(query);
      queries.push(query);
    }
  }
  return queries;
}

export async function tavilySearch(
  query: string,
  apiKey: string,
  maxResults = 5
): Promise<TavilyResult[]> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error("Enter a Tavily API key to enable public web discovery.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey.trim(),
        query,
        search_depth: "basic",
        topic: "general",
        max_results: maxResults,
        include_answer: false,
        include_raw_content: true,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 500);
      throw new Error(`Tavily returned HTTP ${response.status}: ${detail}`);
    }

    const payload = (await response.json()) as TavilySearchResponse;
    return payload.results ?? [];
  } finally {
    clearTimeout(timeout);
  }
}

export function analyzeWebSnippets(results: TavilyResult[]): WebSnippet[] {
  const rows: WebSnippet[] = [];
  const seen = new Set<string>();
  for (const result of results) {
    const url = String(result.url ?? "").trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const content = String(result.content ?? "");
    const title = String(result.title ?? "");
    const body = (title + " " + content).toLowerCase().replace(/\s+/g, " ").trim();
    const found: string[] = [];
    for (const [issue, terms] of Object.entries(ISSUE_RULES)) {
      if (terms.some((t) => body.includes(t))) found.push(issue);
    }
    rows.push({
      title,
      url,
      published_date: result.published_date ?? "",
      snippet: content.slice(0, 1800),
      themes_detected: found.length > 0 ? found.join("; ") : "Other / needs review",
      evidence_warning:
        "Search-result snippet only; not a complete or verified individual review.",
      rating: null,
    });
  }
  return rows;
}

const PLATFORM_LABELS: Array<[RegExp, string]> = [
  [/amazon\./i, "Amazon (web)"],
  [/flipkart\./i, "Flipkart (web)"],
  [/myntra\./i, "Myntra (web)"],
  [/blinkit\./i, "Blinkit (web)"],
  [/zepto/i, "Zepto (web)"],
  [/etsy\./i, "Etsy (web)"],
  [/trustpilot\./i, "Trustpilot"],
  [/reddit\./i, "Reddit"],
];

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function platformOf(url: string): string {
  const host = hostOf(url);
  for (const [re, label] of PLATFORM_LABELS) {
    if (re.test(host)) return label;
  }
  return host || "Public web";
}

function extractRating(text: string): number | null {
  const patterns = [
    /(\d(?:[.,]\d)?)\s*(?:\/|out of)\s*5/i,
    /(\d(?:[.,]\d)?)\s*stars?/i,
    /rated\s*(\d(?:[.,]\d)?)/i,
  ];
  for (const re of patterns) {
    const match = text.match(re);
    if (match) {
      const n = Number(match[1].replace(",", "."));
      if (Number.isFinite(n) && n >= 1 && n <= 5) return Math.round(n * 10) / 10;
    }
  }
  return null;
}

function hashString(s: string): string {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

export function resultsToReviewRows(
  results: TavilyResult[],
  product: string,
  brand?: string
): Array<Record<string, string>> {
  const today = new Date().toISOString().slice(0, 10);
  const seen = new Set<string>();
  const rows: Array<Record<string, string>> = [];
  const label = brand && brand.trim() ? `${brand.trim()} ${product.trim()}` : product.trim();

  for (const result of results) {
    const url = String(result.url ?? "").trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const snippet = String(result.content ?? "").trim();
    const raw = String(result.raw_content ?? "").trim();
    const body = (snippet || raw).replace(/\s+/g, " ").slice(0, 2500);
    if (!body) continue;
    const title = String(result.title ?? "").trim();
    const rating = extractRating(`${title} ${body}`) ?? 3;
    rows.push({
      review_id: `web-${hashString(url)}`,
      review_date: today,
      product: label,
      platform: platformOf(url),
      rating: String(rating),
      review_text: `${title ? title + ". " : ""}${body}`,
      product_url: url,
    });
  }
  return rows;
}
