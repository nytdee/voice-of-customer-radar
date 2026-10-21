export type MarketplaceId = "shopify" | "amazon" | "flipkart";

export interface ShopifyCredentialsInput {
  storeUrl?: string;
  accessToken?: string;
}

export interface AmazonCredentialsInput {
  region?: string;
  asinsCsv?: string;
}

export interface FlipkartCredentialsInput {
  productRef?: string;
}

export type MarketplaceCredentialsInput =
  | ShopifyCredentialsInput
  | AmazonCredentialsInput
  | FlipkartCredentialsInput;

export interface MarketplaceReviewRow {
  review_id: string;
  review_date: string;
  product: string;
  platform: string;
  rating: number;
  review_text: string;
  product_url: string;
  data_origin: string;
}

export interface MarketplaceSyncResult {
  platform: MarketplaceId;
  platformLabel: string;
  targets: string[];
  rows: MarketplaceReviewRow[];
  fetchedAtIso: string;
  reviewCount: number;
}

export interface ConnectedChannel {
  platform: MarketplaceId;
  targets: string[];
  reviewCount: number;
  connectedAtIso: string;
}

export class MarketplaceSyncError extends Error {}

const DISPLAY_LABELS: Record<MarketplaceId, string> = {
  shopify: "Shopify",
  amazon: "Amazon Marketplace",
  flipkart: "Flipkart",
};

const PLATFORM_TAGS: Record<MarketplaceId, string> = {
  shopify: "Shopify (simulated)",
  amazon: "Amazon (simulated)",
  flipkart: "Flipkart (simulated)",
};

export const AMAZON_REGIONS = ["US", "UK", "IN"] as const;
export type AmazonRegion = (typeof AMAZON_REGIONS)[number];

/**
 * Simulated latency per platform (ms). The production implementations of these
 * calls (following the INTEGRATION POINT comments below) can take up to two
 * minutes on real marketplaces; the demo paths use short waits so the loading
 * state is visible without stalling the walkthrough.
 */
export const MARKETPLACE_WAIT_MS: Record<MarketplaceId, number> = {
  shopify: 2200,
  amazon: 3000,
  flipkart: 3000,
};

const SHOPIFY_CATALOG = [
  "Glow Serum 30ml",
  "Hydra Repair Cream",
  "Vitamin C Essence",
  "Bamboo Sheet Mask",
  "Daily SPF50 Fluid",
  "Night Recovery Balm",
];

const AMAZON_CATALOG = [
  "Wireless Earbuds Pro ANC",
  "Fast Charge 20W Adapter",
  "Solar Power Bank 10000mAh",
  "Bluetooth Mini Speaker",
  "Braided USB-C Cable 2m",
];

const FLIPKART_CATALOG = [
  "Tough Armour Back Cover",
  "BassBuds Wired Earphone",
  "Smart Band Fitness Tracker",
  "Braided USB Cable 1.5m",
  "Aluminium Tablet Stand",
];

const NEGATIVE_TEMPLATES: Record<MarketplaceId, string[]> = {
  shopify: [
    "The dropper bottle leaked inside the protective pouch, so half the serum was gone on arrival.",
    "Second order in two months and the shade looks nothing like the product photos.",
    "Order shipped late and arrived with the box crushed; the cream tube was dented.",
    "The pump stopped working after two weeks — poor quality for the price I paid.",
    "The expiry date printed on the jar was only two weeks away; felt rushed.",
    "Wrong item sent — I ordered the SPF fluid and got the sheet mask instead.",
    "The bottle cap cracked on the first tight twist; material feels thinner this batch.",
  ],
  amazon: [
    "Item arrived 3 days after the promised delivery window with no update from the courier.",
    "The earbuds case hinge cracked after a week; the material feels like cheap plastic.",
    "Received a used unit — the box was already opened and the cable was missing.",
    "Packaging offered little protection and the charging adapter arrived with a dented plug.",
    "Sound cuts out on the left bud; the build quality is not worth the listing price.",
    "The product photos show a carried pouch and strap that are not included in this order.",
    "Charged twice for one order and support is still 'working on' the refund.",
  ],
  flipkart: [
    "The charger pin arrived loose and bent; the packing was just a torn paper wrap.",
    "Cover colour looks completely different from the pictures — the click-fitting also feels weak.",
    "Delivery took 6 days to a Tier-1 city and the outer box was damaged in transit.",
    "The cable Connector became loose within a week; poor material quality.",
    "Bought two units, each a different model revision — the picture on the listing is misleading.",
    "Shipped without an invoice and now returns are a chore; support never responds.",
    "The band strap snapped after light use; size adjustment slider is fragile.",
  ],
};

const POSITIVE_TEMPLATES: Record<MarketplaceId, string[]> = {
  shopify: [
    "Fast shipping and lovely packaging; the texture is exactly what I hoped for.",
    "Second time ordering — the serum suits my skin and the pump seal arrives intact.",
    "Good quality for the price, and the shade matches the photos perfectly.",
    "Delivery was quick and the order arrived safely wrapped with a card inside.",
    "Replacing my whole routine with this range; the bottle design is practical.",
  ],
  amazon: [
    "Order arrived a day early with perfect packaging and a proper box.",
    "Impressed with sound quality at this price; battery life matches the listing.",
    "Product matched the description and the seller shipped it quickly.",
    "Sturdy build, charges fast, and the case feels premium for this price range.",
    "Works exactly as advertised; would buy from this seller again.",
  ],
  flipkart: [
    "Value for money — the cover fits my phone perfectly and the buttons still click well.",
    "Delivery was quick and the package arrived in a proper sealed box.",
    "Sound and build quality are good for the budget; no complaints so far.",
    "Exactly as shown in the pictures; happy with this purchase.",
    "Good battery, comfortable straps, and the adjustment fits my wrist well.",
  ],
};

const NEUTRAL_TEMPLATES: Record<MarketplaceId, string[]> = {
  shopify: [
    "The texture is okay, though it takes time to absorb; would like richer packaging.",
    "Product works, but the pump releases too much product each time.",
  ],
  amazon: [
    "Works fine, though the carrying case is thinner than I expected at this price.",
    "Decent product, but the bass is weaker than the listing photos suggest.",
  ],
  flipkart: [
    "Cover is fine for the price, though it shows fingerprints easily.",
    "Product works, but the cable length is shorter than expected.",
  ],
};

export function marketplaceDisplayLabel(platform: MarketplaceId): string {
  return DISPLAY_LABELS[platform];
}

export function formatRelativeSync(iso: string, nowMs: number = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "unknown";
  const diffMs = Math.max(0, nowMs - then);
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(then).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export interface ParsedCredentials {
  shopify?: { storeUrl: string; accessToken: string };
  amazon?: { region: AmazonRegion; asins: string[] };
  flipkart?: { productId: string };
}

export function parseCredentials(
  platform: MarketplaceId,
  input: MarketplaceCredentialsInput
): ParsedCredentials {
  if (platform === "shopify") {
    const creds = input as ShopifyCredentialsInput;
    const rawUrl = String(creds.storeUrl ?? "").trim();
    if (!rawUrl) {
      throw new MarketplaceSyncError("Enter your Shopify store URL, e.g. https://my-store.myshopify.com");
    }
    let url: URL;
    try {
      url = new URL(/^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`);
    } catch {
      throw new MarketplaceSyncError("Enter a valid Shopify store URL, e.g. https://my-store.myshopify.com");
    }
    if (!url.hostname.includes(".")) {
      throw new MarketplaceSyncError("Enter a valid Shopify store URL, e.g. https://my-store.myshopify.com");
    }
    const token = String(creds.accessToken ?? "").trim();
    if (token.length < 4) {
      throw new MarketplaceSyncError(
        "Enter the Shopify Access Token / API key from your reviews app (Admin → Apps → API credentials)."
      );
    }
    return { shopify: { storeUrl: url.toString().replace(/\/$/, ""), accessToken: token } };
  }

  if (platform === "amazon") {
    const creds = input as AmazonCredentialsInput;
    const region = String(creds.region ?? "").toUpperCase().trim();
    if (!(AMAZON_REGIONS as readonly string[]).includes(region)) {
      throw new MarketplaceSyncError("Choose the marketplace region: US, UK or IN.");
    }
    const asins = String(creds.asinsCsv ?? "")
      .split(/[^A-Za-z0-9]+/)
      .map((a) => a.trim().toUpperCase())
      .filter(Boolean);
    if (asins.length === 0) {
      throw new MarketplaceSyncError("Enter at least one Amazon product ASIN, e.g. B08N5WRWNW.");
    }
    const invalid = asins.filter((a) => !/^[A-Z0-9]{10}$/.test(a));
    if (invalid.length > 0) {
      throw new MarketplaceSyncError(
        `Every ASIN must be exactly 10 letters/numbers. Check: ${invalid.slice(0, 3).join(", ")}`
      );
    }
    return { amazon: { region: region as AmazonRegion, asins: Array.from(new Set(asins)) } };
  }

  const creds = input as FlipkartCredentialsInput;
  const rawRef = String(creds.productRef ?? "").trim();
  if (!rawRef) {
    throw new MarketplaceSyncError("Enter a Flipkart product URL or product ID.");
  }
  // Accept a full Flipkart URL such as
  //   https://www.flipkart.com/some-product-name/p/itme?pid=MOBGXVBXVNQNZFHK
  // The PID query parameter wins; otherwise fall back to the /p/<id> segment,
  // then to the bare ID.
  const pidParam = rawRef.match(/[?&]pid=([a-z0-9]+)/i)?.[1];
  const pathPid = rawRef.match(/\/p\/([a-z0-9]+)/i)?.[1];
  const pid = (pidParam ?? pathPid ?? rawRef).replace(/[^a-z0-9]/gi, "");
  if (pid.length < 6) {
    throw new MarketplaceSyncError(
      "Enter a valid Flipkart product URL (containing /p/<id> or ?pid=<id>) or the product ID itself."
    );
  }
  return { flipkart: { productId: pid.toUpperCase() } };
}

function hashSeed(parts: string[]): number {
  let hash = 2166136261;
  for (const part of parts) {
    for (let i = 0; i < part.length; i++) {
      hash = (hash ^ part.charCodeAt(i)) * 16777619;
      hash |= 0;
    }
  }
  return Math.abs(hash);
}

function pick<T>(items: T[], seed: number): T {
  return items[seed % items.length];
}

function titleizeSlug(slug: string): string {
  return slug
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ") || "Store";
}

function buildMockReviews(
  platform: MarketplaceId,
  targets: string[],
  credentials: ParsedCredentials
): MarketplaceReviewRow[] {
  const platformTag = PLATFORM_TAGS[platform];
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const seedBase = hashSeed([platform, targets.join("|"), String(today.getTime())]);
  const productCount = targets.length || 3;
  const perProduct = platform === "shopify" ? 5 : 4;
  const rows: MarketplaceReviewRow[] = [];
  let counter = 0;

  const targetLabel = (index: number): string => {
    if (platform === "shopify") {
      const slug = credentials.shopify
        ? new URL(credentials.shopify.storeUrl).hostname.split(".")[0]
        : "store";
      return titleizeSlug(slug);
    }
    return targets[index % targets.length];
  };

  const itemFor = (index: number): string => {
    const catalog =
      platform === "shopify"
        ? SHOPIFY_CATALOG
        : platform === "amazon"
          ? AMAZON_CATALOG
          : FLIPKART_CATALOG;
    return catalog[(seedBase + index) % catalog.length];
  };

  const urlFor = (index: number): string => {
    if (platform === "shopify" && credentials.shopify) {
      const slug = itemFor(index).toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return `${credentials.shopify.storeUrl}/products/${slug}`;
    }
    if (platform === "amazon" && credentials.amazon) {
      return `https://www.amazon.${credentials.amazon.region === "UK" ? "co.uk" : credentials.amazon.region === "IN" ? "in" : "com"}/dp/${credentials.amazon.asins[index % credentials.amazon.asins.length]}`;
    }
    if (platform === "flipkart" && credentials.flipkart) {
      return `https://www.flipkart.com/product/p/${credentials.flipkart.productId.toLowerCase()}`;
    }
    return "";
  };

  for (let i = 0; i < productCount; i++) {
    const product = platform === "shopify"
      ? `${targetLabel(i)} ${pick(SHOPIFY_CATALOG, (seedBase + i * 7) % SHOPIFY_CATALOG.length)}`
      : itemFor(i);

    for (let j = 0; j < perProduct; j++) {
      counter += 1;
      const seed = hashSeed([product, String(j), String(seedBase), String(counter)]);
      const bucket = seed % 10;
      let rating: number;
      if (platform === "shopify") {
        rating = bucket < 5 ? 5 : bucket < 8 ? 2 : bucket === 8 ? 1 : 3;
      } else if (platform === "amazon") {
        rating = bucket < 4 ? 5 : bucket < 6 ? 2 : bucket < 8 ? 1 : bucket === 8 ? 3 : 4;
      } else {
        rating = bucket < 4 ? 4 : bucket < 6 ? 2 : bucket < 8 ? 1 : bucket === 8 ? 5 : 3;
      }
      const template =
        rating >= 4
          ? pick(POSITIVE_TEMPLATES[platform], seed)
          : rating === 3
            ? pick(NEUTRAL_TEMPLATES[platform], seed)
            : pick(NEGATIVE_TEMPLATES[platform], seed);

      const day = new Date(today);
      day.setDate(today.getDate() - (seed % 10));
      rows.push({
        review_id: `${platform.slice(0, 3).toUpperCase()}-${String(seedBase % 100000 + counter).padStart(5, "0")}`,
        review_date: formatDateISOFrom(day),
        product,
        platform: platformTag,
        rating,
        review_text: template,
        product_url: urlFor(i),
        data_origin: `Marketplace sync demo — simulated rows for ${DISPLAY_LABELS[platform]}, not real purchases.`,
      });
    }
  }

  return rows;
}

function formatDateISOFrom(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface FetchMarketplaceOptions {
  waitMs?: number;
  nowIso?: string;
}

/**
 * Placeholder marketplace fetch. Each branch documents the production
 * integration point; the demo path validates input, waits to simulate network
 * latency, then returns a fresh batch of realistic, platform-specific mock
 * reviews that merge into the dashboard state.
 */
export async function fetchMarketplaceData(
  platform: MarketplaceId,
  credentials: MarketplaceCredentialsInput,
  options: FetchMarketplaceOptions = {}
): Promise<MarketplaceSyncResult> {
  if (!(platform in DISPLAY_LABELS)) {
    throw new MarketplaceSyncError(`Unsupported marketplace: ${String(platform)}`);
  }
  const parsed = parseCredentials(platform, credentials);
  const waitMs = options.waitMs ?? MARKETPLACE_WAIT_MS[platform];
  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
  const fetchedAtIso = options.nowIso ?? new Date().toISOString();

  if (platform === "shopify" && parsed.shopify) {
    const { storeUrl, accessToken } = parsed.shopify;
    // INTEGRATION POINT — Shopify (production):
    // Shopify core Admin API does not expose product reviews; reviews live in a
    // reviews app's metafields (Judge.me, Loox, Shopify Product Reviews, etc.).
    // In production: look up the installed reviews app's metafield namespace via
    //   GET ${storeUrl}/admin/api/2024-01/products.json               (catalogue)
    //   GET ${storeUrl}/admin/api/2024-01/metafields.json?...namespaces (reviews)
    // with header `X-Shopify-Access-Token: ${accessToken}` over HTTPS, then map
    // each metafield review body into MarketplaceReviewRow. The token is used
    // for this request only. The demo path below simulates that round trip.
    void accessToken;
    const targets = [storeUrl];
    const rows = buildMockReviews("shopify", targets, parsed);
    return {
      platform,
      platformLabel: DISPLAY_LABELS.shopify,
      targets,
      rows,
      fetchedAtIso,
      reviewCount: rows.length,
    };
  }

  if (platform === "amazon" && parsed.amazon) {
    const { region, asins } = parsed.amazon;
    // INTEGRATION POINT — Amazon (production):
    // Amazon does not offer public reviews access for third parties. Wire a
    // third-party scraper API such as Rainforest API (https://rainforestapi.com/)
    // or a scraping proxy; e.g. per ASIN:
    //   GET https://api.rainforestapi.com/request?api_key=$KEY&type=reviews
    //     &amazon_domain=amazon.com&asin=B08N5WRWNW&sort_by=most_recent
    // ...then map response.reviews[] into MarketplaceReviewRow and observe the
    // provider's rate limits and terms of use. The demo path below simulates
    // the wait, then emits ASIN-specific mock reviews.
    void region;
    const rows = buildMockReviews("amazon", asins, parsed);
    return {
      platform,
      platformLabel: DISPLAY_LABELS.amazon,
      targets: asins,
      rows,
      fetchedAtIso,
      reviewCount: rows.length,
    };
  }

  if (platform === "flipkart" && parsed.flipkart) {
    const { productId } = parsed.flipkart;
    // INTEGRATION POINT — Flipkart (production):
    // Flipkart likewise has no public review-text endpoint; most teams use a
    // scraping proxy/aggregator (ScraperAPI, Smartproxy, etc.) with the product
    // ID parsed from the listing URL, respecting their ToS and rate limits.
    // The demo path below simulates that wait, returning product-specific
    // Flipkart-flavoured mock reviews.
    const rows = buildMockReviews("flipkart", [productId], parsed);
    return {
      platform,
      platformLabel: DISPLAY_LABELS.flipkart,
      targets: [productId],
      rows,
      fetchedAtIso,
      reviewCount: rows.length,
    };
  }

  throw new MarketplaceSyncError("Could not prepare the sync for this marketplace.");
}
