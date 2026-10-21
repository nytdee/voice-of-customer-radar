import { describe, it, expect } from "vitest";
import {
  parseCredentials,
  fetchMarketplaceData,
  formatRelativeSync,
  marketplaceDisplayLabel,
  MarketplaceSyncError,
  type MarketplaceId,
} from "@/lib/integrations";

describe("parseCredentials", () => {
  it("accepts a Shopify store URL + token", () => {
    const parsed = parseCredentials("shopify", {
      storeUrl: "my-store.myshopify.com",
      accessToken: "shpca_123456",
    });
    expect(parsed.shopify?.storeUrl).toBe("https://my-store.myshopify.com");
    expect(parsed.shopify?.accessToken).toBe("shpca_123456");
  });

  it("rejects Shopify without a token", () => {
    expect(() => parseCredentials("shopify", { storeUrl: "https://my-store.myshopify.com" }))
      .toThrow(MarketplaceSyncError);
  });

  it("parses caps-separated Amazon ASINs", () => {
    const parsed = parseCredentials("amazon", { region: "IN", asinsCsv: "B08N5WRWNW, B07FZ8S74R" });
    expect(parsed.amazon?.region).toBe("IN");
    expect(parsed.amazon?.asins).toEqual(["B08N5WRWNW", "B07FZ8S74R"]);
  });

  it("rejects an ASIN that is not exactly 10 characters", () => {
    expect(() => parseCredentials("amazon", { region: "US", asinsCsv: "SHORT123" }))
      .toThrow(/10 letters\/numbers|10 char/i);
  });

  it("rejects an unknown Amazon region", () => {
    expect(() => parseCredentials("amazon", { region: "AU", asinsCsv: "B08N5WRWNW" }))
      .toThrow(MarketplaceSyncError);
  });

  it("extracts the Flipkart product ID from a listing URL", () => {
    const parsed = parseCredentials("flipkart", {
      productRef: "https://www.flipkart.com/some-phone-case/p/itme?pid=MOBGXVBXVNQNZFHK",
    });
    expect(parsed.flipkart?.productId.length).toBeGreaterThanOrEqual(6);
  });

  it("rejects a Flipkart ref that is too short", () => {
    expect(() => parseCredentials("flipkart", { productRef: "abc12" }))
      .toThrow(MarketplaceSyncError);
  });

  it("rejects unsupported marketplaces at fetch time", async () => {
    await expect(
      fetchMarketplaceData("unknown" as MarketplaceId, {})
    ).rejects.toThrow(MarketplaceSyncError);
  });
});

describe("fetchMarketplaceData (demo path)", () => {
  it("returns Shopify-styled mock reviews derived from the store URL", async () => {
    const result = await fetchMarketplaceData(
      "shopify",
      { storeUrl: "aurora-skincare.myshopify.com", accessToken: "shpca_123456" },
      { waitMs: 1 }
    );
    expect(result.platform).toBe("shopify");
    expect(marketplaceDisplayLabel("shopify")).toBe("Shopify");
    expect(result.targets).toEqual(["https://aurora-skincare.myshopify.com"]);
    expect(result.reviewCount).toBe(result.rows.length);
    expect(result.rows.length).toBeGreaterThan(0);
    const row = result.rows[0];
    expect(row.platform).toContain("Shopify (simulated)");
    expect(row.rating).toBeGreaterThanOrEqual(1);
    expect(row.rating).toBeLessThanOrEqual(5);
    expect(row.product_url).toContain("aurora-skincare.myshopify.com");
    expect(row.review_text.length).toBeGreaterThan(10);
    const ids = new Set(result.rows.map((r) => r.review_id));
    expect(ids.size).toBe(result.rows.length);
  });

  it("returns Amazon mock reviews keyed by ASIN", async () => {
    const result = await fetchMarketplaceData(
      "amazon",
      { region: "US", asinsCsv: "B08N5WRWNW,B07FZ8S74R" },
      { waitMs: 1 }
    );
    expect(result.platform).toBe("amazon");
    expect(result.targets).toEqual(["B08N5WRWNW", "B07FZ8S74R"]);
    const asinUrls = result.rows.filter((r) => r.product_url.includes("/dp/"));
    expect(asinUrls.length).toBe(result.rows.length);
    expect(result.platformLabel).toBe("Amazon Marketplace");
  });

  it("returns Flipkart mock reviews keyed by product ID", async () => {
    const result = await fetchMarketplaceData(
      "flipkart",
      { productRef: "https://www.flipkart.com/cover/p/itme?pid=MOBGXVBXVNQNZFHK" },
      { waitMs: 1 }
    );
    expect(result.platform).toBe("flipkart");
    expect(result.targets).toEqual(["MOBGXVBXVNQNZFHK"]);
    expect(result.rows.every((r) => r.platform.includes("Flipkart (simulated)"))).toBe(true);
    expect(result.rows.every((r) => r.data_origin.includes("Marketplace sync demo"))).toBe(true);
  });
});

describe("formatRelativeSync", () => {
  it("renders relative sync labels", () => {
    const now = Date.parse("2026-10-21T12:00:00Z");
    expect(formatRelativeSync("2026-10-21T11:59:50Z", now)).toBe("just now");
    expect(formatRelativeSync("2026-10-21T11:55:00Z", now)).toBe("5 min ago");
    expect(formatRelativeSync("2026-10-21T10:00:00Z", now)).toBe("2 hrs ago");
  });
});
