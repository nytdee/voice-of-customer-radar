import { describe, it, expect } from "vitest";
import { buildSearchQueries, resultsToReviewRows } from "@/lib/tavily";

describe("search queries", () => {
  it("maps platform labels to real domains", () => {
    const queries = buildSearchQueries("Aero Cabin Case", ["Amazon India", "Flipkart"]);
    expect(queries[0]).toContain("site:amazon.in");
    expect(queries[1]).toContain("site:flipkart.com");
  });
});

describe("resultsToReviewRows", () => {
  it("dedupes by URL and builds review rows with platform and rating", () => {
    const rows = resultsToReviewRows(
      [
        {
          title: "Zip broke",
          url: "https://www.amazon.in/product",
          published_date: "",
          content: "The zip broke after one trip. Rated 2 out of 5.",
        },
        {
          title: "Duplicate",
          url: "https://www.amazon.in/product",
          published_date: "",
          content: "duplicate",
        },
      ],
      "Aero Cabin Case",
      "Away"
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].product).toBe("Away Aero Cabin Case");
    expect(rows[0].platform).toBe("Amazon (web)");
    expect(rows[0].rating).toBe("2");
    expect(rows[0].review_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
