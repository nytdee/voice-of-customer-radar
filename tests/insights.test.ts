import { describe, it, expect } from "vitest";
import { analyzeReviews } from "@/lib/analysis";
import { buildInsights } from "@/lib/insights";
import { parseSampleCsv, SAMPLE_REVIEWS_CSV } from "@/lib/sampleData";

const analysis = analyzeReviews(parseSampleCsv(SAMPLE_REVIEWS_CSV));

describe("buildInsights", () => {
  it("derives a frustrated overall emotion from the sample week", () => {
    const insights = buildInsights(analysis);
    expect(insights.overallEmotion).toBe("Frustrated");
    expect(insights.emotionScore).toBe(67.6);
    expect(insights.breakdown.negative).toBe(69);
    expect(insights.breakdown.total).toBe(102);
    expect(insights.confidence).toBe("Medium");
  });

  it("produces a traceable narrative and a prioritised fix plan", () => {
    const insights = buildInsights(analysis);
    expect(insights.narrative).toContain("Frustrated");
    expect(insights.narrative).toContain("67.6%");
    expect(insights.fixes.length).toBeGreaterThan(0);
    expect(insights.fixes[0].priority).toBe("High");
    expect(insights.fixes[2].priority).toBe("Medium");
    expect(insights.fixes[4].priority).toBe("Low");
    expect(insights.fixes[0].action.length).toBeGreaterThan(10);
    expect(insights.products).toHaveLength(3);
    for (const pulse of insights.products) {
      expect(["Frustrated", "Disappointed", "Mixed", "Satisfied"]).toContain(pulse.emotion);
    }
  });
});
