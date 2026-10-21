import { describe, it, expect } from "vitest";
import { analyzeReviews } from "@/lib/analysis";
import type { AnalysisResult } from "@/lib/analysis";
import { parseSampleCsv, SAMPLE_REVIEWS_CSV } from "@/lib/sampleData";
import { renderHtmlReport, renderMarkdownReport } from "@/lib/reports";

const analysis = analyzeReviews(parseSampleCsv(SAMPLE_REVIEWS_CSV));

describe("report rendering", () => {
  it("renders styled HTML with real metrics and no template brace leaks", () => {
    const html = renderHtmlReport(analysis);
    expect(html).toContain("<style>");
    expect(html).not.toContain("{{");
    expect(html).toContain(":root{");
    expect(html).toContain(".metrics{");
    expect(html).toContain("Aero Cabin Case");
    expect(html).toContain("Daytrip Tote");
    expect(html).toContain("Nomad Work Backpack");
  });

  it("renders markdown with priorities and issue tables", () => {
    const md = renderMarkdownReport(analysis);
    expect(md).toContain("## Product priorities");
    expect(md).toContain("Aero Cabin Case");
    expect(md).toContain("Zipper / closure");
  });

  it("renders reports from a JSON-serialised analysis payload", () => {
    const payload = JSON.parse(JSON.stringify(analysis)) as unknown as AnalysisResult;
    const md = renderMarkdownReport(payload);
    const html = renderHtmlReport(payload);
    expect(md).toContain("**Current window:** 2026-10-13 to 2026-10-19");
    expect(md).toContain("67.6%");
    expect(html).toContain("2026-10-13");
    expect(html).toContain("2026-10-19");
  });
});
