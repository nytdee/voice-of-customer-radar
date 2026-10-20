import type { AnalysisResult, IssueRow, ProductReport } from "./analysis";

export type EmotionLabel = "Frustrated" | "Disappointed" | "Mixed" | "Satisfied";
export type Confidence = "Low" | "Medium" | "High";
export type Priority = "High" | "Medium" | "Low";

export interface FixAction {
  product: string;
  issue: string;
  mentions: number;
  changePct: number;
  action: string;
  priority: Priority;
}

export interface ProductPulse {
  product: string;
  emotion: EmotionLabel;
  negativeShare: number;
  reviews: number;
  rating: number | null;
  ratingDelta: number | null;
  topIssue: IssueRow | null;
}

export interface AnalysisInsights {
  overallEmotion: EmotionLabel;
  emotionScore: number;
  narrative: string;
  breakdown: { negative: number; mixed: number; positive: number; total: number };
  products: ProductPulse[];
  fixes: FixAction[];
  confidence: Confidence;
}

function emotionFor(negativeShare: number, positiveShare: number): EmotionLabel {
  if (negativeShare >= 60) return "Frustrated";
  if (negativeShare >= 40) return "Disappointed";
  if (positiveShare >= 50) return "Satisfied";
  return "Mixed";
}

function productPulse(item: ProductReport, currentNeg: number, currentPos: number): ProductPulse {
  const total = item.current.reviews || 1;
  const negativeShare = Math.round((currentNeg / total) * 1000) / 10;
  const positiveShare = Math.round((currentPos / total) * 1000) / 10;
  return {
    product: item.product,
    emotion: emotionFor(negativeShare, positiveShare),
    negativeShare: item.current.negative_share_pct,
    reviews: item.current.reviews,
    rating: item.current.avg_review_rating,
    ratingDelta: item.rating_trend.rating_delta,
    topIssue: item.top_issues[0] ?? null,
  };
}

export function buildInsights(analysis: AnalysisResult): AnalysisInsights {
  const [start, end] = analysis.current_period;
  const current = analysis.reviews.filter(
    (r) => r.review_date >= start && r.review_date <= end
  );

  const negative = current.filter((r) => r.sentiment === "Negative").length;
  const positive = current.filter((r) => r.sentiment === "Positive").length;
  const mixed = current.length - negative - positive;
  const total = current.length || 1;
  const negativeShare = Math.round((negative / total) * 1000) / 10;
  const positiveShare = Math.round((positive / total) * 1000) / 10;
  const overallEmotion = emotionFor(negativeShare, positiveShare);

  const products = [...analysis.products]
    .map((item) => {
      const prodReviews = current.filter((r) => r.product === item.product);
      return productPulse(
        item,
        prodReviews.filter((r) => r.sentiment === "Negative").length,
        prodReviews.filter((r) => r.sentiment === "Positive").length
      );
    })
    .sort((a, b) => (a.ratingDelta ?? 0) - (b.ratingDelta ?? 0));

  const fixes: FixAction[] = [...analysis.issues]
    .sort((a, b) => b.mentions - a.mentions || b.change_pct - a.change_pct)
    .slice(0, 6)
    .map((issue, index) => ({
      product: issue.product,
      issue: issue.issue,
      mentions: issue.mentions,
      changePct: issue.change_pct,
      action: issue.recommendation,
      priority: index < 2 ? "High" : index < 4 ? "Medium" : "Low",
    }));

  const topFix = fixes[0];
  const narrative = topFix
    ? `${overallEmotion} customers: ${negative} of ${current.length} reviews this week are negative (${negativeShare}%, versus ${analysis.overall_previous.negative_share_pct}% last week). The strongest signal is "${topFix.issue}" on ${topFix.product} with ${topFix.mentions} mentions. Start with: ${topFix.action}`
    : `No negative-review issues detected this week across ${analysis.products.length} product${analysis.products.length === 1 ? "" : "s"}. Keep monitoring for early shifts.`;

  const confidence: Confidence =
    analysis.overall_current.reviews >= 200
      ? "High"
      : analysis.overall_current.reviews >= 60
        ? "Medium"
        : "Low";

  return {
    overallEmotion,
    emotionScore: negativeShare,
    narrative,
    breakdown: { negative, mixed, positive, total: current.length },
    products,
    fixes,
    confidence,
  };
}
