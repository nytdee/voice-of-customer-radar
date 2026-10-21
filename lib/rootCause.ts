export type RootCause = "PRODUCT_DEFECT" | "OPERATIONAL_ERROR";

export const ROOT_CAUSE_TAG: Record<RootCause, string> = {
  PRODUCT_DEFECT: "[PRODUCT_DEFECT]",
  OPERATIONAL_ERROR: "[OPERATIONAL_ERROR]",
};

export const ROOT_CAUSE_META: Record<
  RootCause,
  { label: string; bucket: string; description: string }
> = {
  PRODUCT_DEFECT: {
    label: "Product defect",
    bucket: "Product attributes",
    description: "Sizing, materials, durability, fit, comfort and finish signals.",
  },
  OPERATIONAL_ERROR: {
    label: "Operational error",
    bucket: "Fulfillment & Operations",
    description: "Shipping, packaging, delivery damage, returns and listing accuracy signals.",
  },
};

export const ROOT_CAUSE_ISSUES: Record<string, RootCause> = {
  "Zipper / closure": "PRODUCT_DEFECT",
  "Wheels / handle": "PRODUCT_DEFECT",
  "Stitching / seams": "PRODUCT_DEFECT",
  "Material / finish": "PRODUCT_DEFECT",
  "Size / fit / capacity": "PRODUCT_DEFECT",
  "Comfort / weight": "PRODUCT_DEFECT",
  "Colour / expectation": "PRODUCT_DEFECT",
  "Packaging / delivery": "OPERATIONAL_ERROR",
  "Customer service / returns": "OPERATIONAL_ERROR",
  "Price / value": "OPERATIONAL_ERROR",
};

const PRODUCT_SIGNALS: Array<[string, number]> = [
  ["zipper", 2],
  ["zip", 2],
  ["wheel", 2],
  ["handle", 2],
  ["stitch", 2],
  ["seam", 2],
  ["thread", 1],
  ["material", 2],
  ["fabric", 2],
  ["durab", 2],
  ["quality", 1],
  ["defect", 3],
  ["faulty", 3],
  ["size", 1],
  ["fit", 1],
  ["capacity", 1],
  ["colour", 1],
  ["color", 1],
  ["shade", 1],
  ["comfort", 2],
  ["strap", 1],
  ["padding", 1],
  ["scratch", 1],
  ["scuff", 1],
  ["dent", 1],
];

const OPERATIONAL_SIGNALS: Array<[string, number]> = [
  ["arrived damaged", 3],
  ["arrived crushed", 3],
  ["arrived with", 2],
  ["damaged in transit", 3],
  ["transit damage", 3],
  ["shipping damage", 3],
  ["leaking", 3],
  ["leaked", 3],
  ["spilled", 3],
  ["broken seal", 3],
  ["expired", 3],
  ["wrong item", 3],
  ["incorrect item", 3],
  ["missing item", 3],
  ["missing part", 3],
  ["packaging", 2],
  ["packing", 2],
  ["shipping", 2],
  ["delivery", 1],
  ["courier", 2],
  ["warehouse", 2],
  ["late", 1],
  ["delay", 1],
  ["refund", 1],
  ["return", 1],
  ["replacement", 1],
  ["customer service", 2],
  ["no response", 2],
  ["support team", 1],
  ["overpriced", 1],
  ["price", 1],
];

function score(text: string, signals: Array<[string, number]>): number {
  return signals.reduce((total, [term, weight]) => (text.includes(term) ? total + weight : total), 0);
}

function mappedCause(issues: string[]): RootCause | null {
  const causes = new Set(
    issues.map((issue) => ROOT_CAUSE_ISSUES[issue]).filter(Boolean) as RootCause[]
  );
  if (causes.size === 1) return Array.from(causes)[0];
  return null;
}

export function normalizeRootCause(value: unknown): RootCause | null {
  if (value === null || value === undefined) return null;
  const key = String(value)
    .trim()
    .toUpperCase()
    .replace(/^\[|\]$/g, "")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (
    ["PRODUCT_DEFECT", "PRODUCT", "DEFECT", "PRODUCT_ATTRIBUTE", "PRODUCT_ISSUE"].includes(key)
  ) {
    return "PRODUCT_DEFECT";
  }
  if (
    [
      "OPERATIONAL_ERROR",
      "OPERATIONAL",
      "OPERATIONS",
      "OPS",
      "FULFILLMENT",
      "FULFILMENT",
      "SHIPPING",
      "WAREHOUSE",
    ].includes(key)
  ) {
    return "OPERATIONAL_ERROR";
  }
  return null;
}

export function rootCauseForIssue(issue: string): RootCause | null {
  return ROOT_CAUSE_ISSUES[issue] ?? null;
}

export function tagRootCause(cause: RootCause | null): string {
  return cause ? ROOT_CAUSE_TAG[cause] : "";
}

export function classifyRootCause(
  text: string,
  issues: string[] = [],
  sentiment?: string
): RootCause | null {
  if (sentiment === "Positive") return null;

  const body = String(text).toLowerCase().replace(/\s+/g, " ").trim();
  const operationalScore = score(body, OPERATIONAL_SIGNALS);
  const productScore = score(body, PRODUCT_SIGNALS);
  const fallback = mappedCause(issues);

  if (operationalScore > productScore) return "OPERATIONAL_ERROR";
  if (productScore > operationalScore) return "PRODUCT_DEFECT";
  if (operationalScore > 0) return fallback ?? "OPERATIONAL_ERROR";
  return fallback;
}
