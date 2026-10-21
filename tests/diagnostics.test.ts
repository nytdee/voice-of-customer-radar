import { describe, it, expect } from "vitest";
import { analyzeReviews } from "@/lib/analysis";
import { parseSampleCsv, SAMPLE_REVIEWS_CSV } from "@/lib/sampleData";
import { classifyRootCause, tagRootCause } from "@/lib/rootCause";
import {
  buildRootCauseDiagnostic,
  buildPlatformMatrix,
  buildQuickWins,
} from "@/lib/diagnostics";

const analysis = analyzeReviews(parseSampleCsv(SAMPLE_REVIEWS_CSV));

describe("root-cause classification", () => {
  it("tags explicit fulfilment failures as operational", () => {
    const cause = classifyRootCause(
      "The tote arrived crushed in thin packaging.",
      ["Packaging / delivery"],
      "Negative"
    );
    expect(cause).toBe("OPERATIONAL_ERROR");
  });

  it("tags product-attribute failures as defects", () => {
    const cause = classifyRootCause(
      "The zipper gets stuck and the wheel broke.",
      ["Zipper / closure", "Wheels / handle"],
      "Negative"
    );
    expect(cause).toBe("PRODUCT_DEFECT");
  });

  it("never tags positive reviews", () => {
    const cause = classifyRootCause(
      "Delivery was smooth and the product matched the description.",
      [],
      "Positive"
    );
    expect(cause).toBeNull();
  });

  it("exposes bracketed tags", () => {
    expect(tagRootCause("PRODUCT_DEFECT")).toBe("[PRODUCT_DEFECT]");
    expect(tagRootCause("OPERATIONAL_ERROR")).toBe("[OPERATIONAL_ERROR]");
    expect(tagRootCause(null)).toBe("");
  });
});

describe("buildRootCauseDiagnostic", () => {
  it("classifies the negative sample into both buckets", () => {
    const diag = buildRootCauseDiagnostic(analysis);
    expect(diag.negativeTotal).toBeGreaterThan(0);
    expect(diag.classified).toBeGreaterThan(0);
    const product = diag.buckets.find((b) => b.cause === "PRODUCT_DEFECT");
    const ops = diag.buckets.find((b) => b.cause === "OPERATIONAL_ERROR");
    expect(product?.reviews).toBeGreaterThan(0);
    expect(ops?.reviews).toBeGreaterThan(0);
    expect(product?.issues.length).toBeGreaterThan(0);
  });
});

describe("buildPlatformMatrix", () => {
  it("builds one column per detected source", () => {
    const matrix = buildPlatformMatrix(analysis);
    expect(matrix.platforms.length).toBe(5);
    for (const platform of matrix.platforms) {
      expect(platform.reviews).toBeGreaterThan(0);
      expect(platform.negativeShare).toBeGreaterThanOrEqual(0);
      expect(platform.negativeShare).toBeLessThanOrEqual(100);
      expect(platform.positiveShare).toBeGreaterThanOrEqual(0);
    }
    expect(matrix.rows.length).toBeGreaterThan(0);
    expect(matrix.rows[0].total).toBeGreaterThan(0);
  });
});

describe("buildQuickWins", () => {
  it("produces at most three actions with concrete evidence", () => {
    const wins = buildQuickWins(analysis);
    expect(wins.length).toBeGreaterThan(0);
    expect(wins.length).toBeLessThanOrEqual(3);
    for (const win of wins) {
      expect(win.detail.length).toBeGreaterThan(10);
      expect(win.action.length).toBeGreaterThan(10);
      expect(win.evidence.length).toBeGreaterThan(0);
    }
    const kinds = new Set(wins.map((w) => w.kind));
    expect(kinds.has("listing")).toBe(true);
  });
});
