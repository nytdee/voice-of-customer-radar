import { NextResponse } from "next/server";
import { renderMarkdownReport, renderHtmlReport } from "@/lib/reports";
import type { AnalysisResult } from "@/lib/analysis";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as {
      analysis?: AnalysisResult;
      format?: "markdown" | "html" | "both";
    };
    const { analysis, format = "both" } = body;

    if (!analysis) {
      return NextResponse.json(
        { error: "Expected an 'analysis' object." },
        { status: 400 }
      );
    }

    const markdown = renderMarkdownReport(analysis);
    const html = renderHtmlReport(analysis);

    if (format === "markdown") {
      return NextResponse.json({ markdown });
    }
    if (format === "html") {
      return NextResponse.json({ html });
    }

    return NextResponse.json({ markdown, html });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Report generation failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
