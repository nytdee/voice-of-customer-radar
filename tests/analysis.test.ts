import { describe, it, expect } from "vitest";
import {
  analyzeReviews,
  classifyIssues,
  classifySentiment,
} from "@/lib/analysis";

const sampleRow = {
  review_id: "R1",
  review_date: "2026-10-18",
  product: "Test Item",
  platform: "Test Platform",
  rating: 2,
  review_text: "The zipper gets stuck and the wheel broke.",
};

describe("issue classification", () => {
  it("maps zipper and wheel terms", () => {
    expect(classifyIssues("The zipper gets stuck.")).toContain("Zipper / closure");
    expect(classifyIssues("The wheel broke.")).toContain("Wheels / handle");
  });

  it("returns Other / needs review for unknown text", () => {
    expect(classifyIssues("It is fine.")).toContain("Other / needs review");
  });
});

describe("sentiment classification", () => {
  it("rates low ratings as negative", () => {
    expect(classifySentiment("broken zipper", 1)).toBe("Negative");
  });

  it("rates high ratings without negatives as positive", () => {
    expect(classifySentiment("great product", 5)).toBe("Positive");
  });
});

describe("analyzeReviews", () => {
  it("produces three products from the embedded sample", () => {
    const rows: Array<Record<string, unknown>> = [];
    // Build a minimal multi-product dataset spanning two 7-day windows.
    const anchor = new Date("2026-10-19");
    const add = (dateOffset: number, product: string, rating: number, text: string) => {
      const d = new Date(anchor);
      d.setDate(anchor.getDate() - dateOffset);
      rows.push({
        review_id: `R-${Math.random().toString(36).slice(2)}`,
        review_date: d.toISOString().slice(0, 10),
        product,
        platform: "P",
        rating,
        review_text: text,
      });
    };
    for (let i = 0; i < 10; i++) {
      add(i % 14, "Aero Cabin Case", 2, "The zipper gets stuck.");
      add(i % 14, "Nomad Work Backpack", 2, "The wheel broke.");
      add(i % 14, "Daytrip Tote", 2, "The seam is opening.");
    }
    const result = analyzeReviews(rows);
    expect(result.products.length).toBe(3);
    expect(result.deduped_review_count).toBeGreaterThan(0);
    for (const product of result.products) {
      expect(product.top_issues.length).toBeLessThanOrEqual(3);
    }
  });

  it("de-duplicates repeated rows", () => {
    const rows = [sampleRow, { ...sampleRow, review_id: "R1" }];
    const result = analyzeReviews(rows);
    expect(result.deduped_review_count).toBe(1);
  });
});
