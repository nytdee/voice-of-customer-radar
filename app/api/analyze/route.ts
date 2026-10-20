import { NextResponse } from "next/server";
import { analyzeReviews } from "@/lib/analysis";
import type { AnalysisResult } from "@/lib/analysis";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { reviews } = body;

    if (!Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json(
        { error: "Expected a non-empty 'reviews' array." },
        { status: 400 }
      );
    }

    const result: AnalysisResult = analyzeReviews(reviews);

    return NextResponse.json({
      ok: true,
      deduped_review_count: result.deduped_review_count,
      source_count: result.source_count,
      anchor_date: result.anchor_date.toISOString(),
      current_period: result.current_period.map((d) => d.toISOString()),
      previous_period: result.previous_period.map((d) => d.toISOString()),
      overall_current: result.overall_current,
      overall_previous: result.overall_previous,
      issues: result.issues,
      rating_trend: result.rating_trend,
      products: result.products,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Analysis failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
