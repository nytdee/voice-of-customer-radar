import { ALIASES } from "./taxonomy";
import { normalizeRootCause, type RootCause } from "./rootCause";

export interface TaggingRow {
  key: string;
  review_id: string;
  product: string;
  platform: string;
  rating: number | null;
  review_text: string;
}

export interface AiTag {
  key: string;
  root_cause: RootCause | null;
  reason?: string;
}

export const ROOT_CAUSE_TAGS = ["[PRODUCT_DEFECT]", "[OPERATIONAL_ERROR]"] as const;

export const ROOT_CAUSE_TAGGING_SYSTEM_PROMPT = `You are a root-cause tagger for e-commerce review intelligence.

Tag every review with exactly one of these two explicit labels:
[PRODUCT_DEFECT] — the complaint is about the product itself: sizing/fit/capacity, material or finish, durability, workmanship (stitching, seams, zippers, wheels, handles), comfort, ingredient reaction, colour/variant mismatch with the listing.
[OPERATIONAL_ERROR] — the complaint is about fulfilment or operations: shipping delay, late delivery, damaged packaging, transit damage, leaking or broken seals, expired stock, wrong or missing item, warehouse/packing mistakes, returns or support failure, price/offer errors.

Rules:
- Use [PRODUCT_DEFECT] when the review blames how the item was made or how it performs.
- Use [OPERATIONAL_ERROR] when the review blames how the item was stored, packed, shipped, sold or serviced.
- If a review contains both, choose the dominant complaint (the one the customer emphasises first or most strongly).
- Positive reviews and reviews without a diagnosable complaint get root_cause: null.
- The tag string must be exactly "[PRODUCT_DEFECT]" or "[OPERATIONAL_ERROR]" (with square brackets).
- Never invent review keys. Return one result per input key.
- Return strict JSON only, no markdown fences, no commentary.

Response shape:
{"tags":[{"key":"<input key>","root_cause":"[PRODUCT_DEFECT]","reason":"<max 15 words>"}]}`;

export function buildTaggingUserPrompt(rows: TaggingRow[]): string {
  return JSON.stringify({
    task: "Tag each review with [PRODUCT_DEFECT] or [OPERATIONAL_ERROR].",
    reviews: rows.map((row) => ({
      key: row.key,
      product: row.product,
      platform: row.platform,
      rating: row.rating,
      review_text: row.review_text,
    })),
  });
}

function normalCol(value: string): string {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function rowLookup(row: Record<string, unknown>): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const [key, value] of Object.entries(row)) {
    const normalized = normalCol(key);
    if (!lookup.has(normalized)) lookup.set(normalized, String(value ?? ""));
  }
  return lookup;
}

function pick(lookup: Map<string, string>, canonical: string): string {
  const aliases = ALIASES[canonical] ?? [canonical];
  for (const alias of aliases) {
    const value = lookup.get(normalCol(alias));
    if (value !== undefined && value !== "") return value;
  }
  return "";
}

export function toTaggingRows(input: Array<Record<string, unknown>>): TaggingRow[] {
  return input.map((row, index) => {
    const lookup = rowLookup(row);
    const reviewId = pick(lookup, "review_id");
    const rating = Number(pick(lookup, "rating"));
    return {
      key: reviewId || `row-${index}`,
      review_id: reviewId,
      product: pick(lookup, "product"),
      platform: pick(lookup, "platform"),
      rating: Number.isFinite(rating) ? rating : null,
      review_text: pick(lookup, "review_text"),
    };
  });
}

export function applyAiTags(
  input: Array<Record<string, unknown>>,
  tags: AiTag[]
): { rows: Array<Record<string, unknown>>; applied: number } {
  const keys = toTaggingRows(input).map((row) => row.key);
  const byKey = new Map(tags.map((tag) => [tag.key, tag]));
  let applied = 0;

  const rows = input.map((row, index) => {
    const tag = byKey.get(keys[index]);
    const cause = tag ? normalizeRootCause(tag.root_cause) : null;
    if (!cause) return row;
    applied += 1;
    return { ...row, root_cause: cause };
  });

  return { rows, applied };
}
