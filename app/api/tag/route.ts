import { NextResponse } from "next/server";
import { aiTaggingConfig, tagRowsWithLlm } from "@/lib/aiTagging.server";
import type { TaggingRow } from "@/lib/tagging";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request): Promise<NextResponse> {
  const config = aiTaggingConfig();
  if (!config.configured) {
    return NextResponse.json({
      ok: false,
      configured: false,
      reason: "AI_API_KEY is not configured. Rules-based tags are used instead.",
    });
  }

  let body: { rows?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  if (!Array.isArray(body.rows) || body.rows.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Expected a non-empty 'rows' array." },
      { status: 400 }
    );
  }
  if (body.rows.length > 200) {
    return NextResponse.json(
      { ok: false, error: "Send at most 200 reviews per tagging request." },
      { status: 400 }
    );
  }

  try {
    const tags = await tagRowsWithLlm(body.rows as TaggingRow[]);
    return NextResponse.json({ ok: true, configured: true, model: config.model, tags });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "AI tagging failed.";
    return NextResponse.json({ ok: false, configured: true, error: message }, { status: 502 });
  }
}
