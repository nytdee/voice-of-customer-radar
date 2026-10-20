export const ISSUE_RULES: Record<string, string[]> = {
  "Zipper / closure": [
    "zipper", "zip stuck", "zipper stuck", "zip broke", "zipper broke",
    "zip jam", "zipper jam", "zip jamm", "zipper jamm", "zip keeps",
    "zip came off",
  ],
  "Wheels / handle": [
    "wheel", "wheels", "handle", "telescopic", "pull handle", "caster",
    "rolling",
  ],
  "Stitching / seams": [
    "stitch", "stitching", "seam", "thread came", "threads coming",
    "loose thread",
  ],
  "Material / finish": [
    "scratch", "scratched", "scuff", "dent", "crack", "cracked", "shell",
    "material", "fabric quality", "cheap plastic", "faded",
  ],
  "Size / fit / capacity": [
    "too small", "too big", "small compartment", "laptop sleeve",
    "laptop compartment", "doesn't fit", "does not fit", "not fit",
    "capacity", "cabin size", "overhead", "size",
  ],
  "Comfort / weight": [
    "uncomfortable", "shoulder", "strap", "back pain", "heavy", "weight",
    "padding",
  ],
  "Packaging / delivery": [
    "packaging", "package", "box", "arrived damaged", "delivery",
    "late delivery", "shipping", "transit damage", "packing",
  ],
  "Colour / expectation": [
    "colour", "color", "different shade", "looks different",
    "not as pictured", "misleading photo", "photo",
  ],
  "Price / value": [
    "expensive", "price", "overpriced", "worth the money",
    "value for money", "not worth", "cost",
  ],
  "Customer service / returns": [
    "refund", "return", "replacement", "customer service", "support team",
    "no response", "response from", "exchange",
  ],
} as const;

export const RECOMMENDATIONS: Record<string, string> = {
  "Zipper / closure":
    "Inspect zipper/closure complaints by SKU and batch; test the failure mode and validate any supplier or design corrective action before scaling it.",
  "Wheels / handle":
    "Break complaints down by wheel/handle part, SKU, production batch and usage context; run a targeted durability check and review QC sampling.",
  "Stitching / seams":
    "Inspect seam placement, thread quality and stress points; sample affected batches and compare complaint rates after corrective action.",
  "Material / finish":
    "Separate scratches at delivery from wear after use; audit protective film, material finish and packing/handling steps.",
  "Size / fit / capacity":
    "Compare complaints with product dimensions and use cases; improve size guidance, photos and compatibility information where expectations are mismatched.",
  "Comfort / weight":
    "Review fit/ergonomics feedback and product specifications; test with representative users and make the weight/fit trade-off clearer on the listing.",
  "Packaging / delivery":
    "Compare by marketplace and fulfilment path; inspect packaging protection, handoff condition and carrier damage evidence before assigning responsibility.",
  "Colour / expectation":
    "Compare listing photos and descriptions with actual product variants; verify whether complaints cluster around a colour/variant or photography issue.",
  "Price / value":
    "Compare price objections with the attributes customers expected; test clearer feature communication and assess discounting against contribution margin.",
  "Customer service / returns":
    "Audit contact and return-resolution times for the affected cases; identify handoff delays and assign an owner for unresolved complaints.",
  "Other / needs review":
    "Manually review representative comments to determine whether a new issue theme should be added to the taxonomy.",
};

export const NEGATIVE_TERMS = [
  "broken", "broke", "cracked", "damaged", "bad", "poor", "terrible",
  "disappointed", "defective", "faulty", "uncomfortable", "dislike",
  "not worth", "not working", "jamming", "jammed", "failed", "failure",
  "worst", "cheap quality", "late", "missing", "stuck", "scratched",
  "refund",
];

export const POSITIVE_TERMS = [
  "excellent", "great", "love it", "perfect", "amazing", "good quality",
  "happy", "comfortable", "durable", "recommend",
];

export const REQUIRED_COLUMNS = [
  "review_date", "product", "platform", "rating", "review_text",
];

export const ALIASES: Record<string, string[]> = {
  review_id: ["review_id", "id", "reviewid", "review id"],
  review_date: ["review_date", "date", "created_at", "review date", "created date"],
  product: ["product", "product_name", "sku_name", "item", "title"],
  platform: ["platform", "source", "marketplace", "channel", "retailer"],
  rating: ["rating", "stars", "star_rating", "score", "review_rating"],
  review_text: ["review_text", "review", "text", "comment", "content", "body"],
  product_url: ["product_url", "url", "listing_url", "source_url"],
};
