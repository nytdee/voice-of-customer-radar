import { describe, it, expect } from "vitest";
import { asDate, formatDateISO } from "@/lib/dates";

describe("date helpers", () => {
  it("formats local calendar dates without UTC day shifts", () => {
    expect(formatDateISO(new Date(2026, 9, 19))).toBe("2026-10-19");
    expect(formatDateISO(new Date("2026-10-19T00:00:00"))).toBe("2026-10-19");
  });

  it("hydrates ISO strings returned by JSON APIs", () => {
    expect(formatDateISO(asDate("2026-10-13T00:00:00.000Z"))).toBe("2026-10-13");
  });

  it("rejects invalid dates", () => {
    expect(() => asDate("not-a-date")).toThrow("Invalid date");
  });
});
