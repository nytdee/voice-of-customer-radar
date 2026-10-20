import { NextResponse } from "next/server";
import {
  tavilySearch,
  buildSearchQueries,
  analyzeWebSnippets,
  resultsToReviewRows,
} from "@/lib/tavily";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as {
      product?: string;
      brand?: string;
      domains?: string[];
      tavily_api_key?: string;
    };
    const { product, brand = "", domains = [], tavily_api_key } = body;
    const apiKey =
      (tavily_api_key ?? "").trim() || (process.env.TAVILY_API_KEY ?? "").trim();

    if (!product || !product.trim()) {
      return NextResponse.json(
        { error: "Expected a non-empty 'product' name." },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "A Tavily API key is required for public web discovery." },
        { status: 400 }
      );
    }

    const queries = buildSearchQueries(product.trim(), domains);
    const allResults: Awaited<ReturnType<typeof tavilySearch>> = [];

    const errors: string[] = [];
    for (const query of queries) {
      try {
        const results = await tavilySearch(query, apiKey, 5);
        allResults.push(...results);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        errors.push(`${query}: ${msg}`);
      }
    }

    const snippets = analyzeWebSnippets(allResults);
    const reviews = resultsToReviewRows(allResults, product.trim(), brand);

    return NextResponse.json({
      ok: true,
      product: product.trim(),
      brand: brand.trim(),
      queries,
      result_count: snippets.length,
      results: snippets,
      reviews,
      review_count: reviews.length,
      errors,
      note:
        "Search-result snippets are discovery leads, not verified customer reviews. Each result page is treated as one review signal; counts are not complete review totals.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Web search failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
