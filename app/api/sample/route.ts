import { NextResponse } from "next/server";
import { SAMPLE_REVIEWS_CSV, parseSampleCsv } from "@/lib/sampleData";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  const rows = parseSampleCsv(SAMPLE_REVIEWS_CSV);
  return NextResponse.json({
    ok: true,
    note:
      "This dataset is synthetic demo data. It does not describe any real brand, marketplace or customer.",
    row_count: rows.length,
    columns: [
      "review_id",
      "review_date",
      "product",
      "platform",
      "rating",
      "review_text",
      "product_url",
      "data_origin",
    ],
    reviews: rows,
  });
}
