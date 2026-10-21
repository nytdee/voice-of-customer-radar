import { NextResponse } from "next/server";
import {
  fetchMarketplaceData,
  type MarketplaceId,
} from "@/lib/integrations";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as {
      platform?: MarketplaceId;
      credentials?: unknown;
    };
    const platform = body.platform;
    if (!platform) {
      return NextResponse.json(
        { ok: false, error: "Expected a 'platform' value (shopify, amazon or flipkart)." },
        { status: 400 }
      );
    }

    const result = await fetchMarketplaceData(
      platform,
      (body.credentials ?? {}) as never
    );

    return NextResponse.json({ ok: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Marketplace sync failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
