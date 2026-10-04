import { describe, expect, it } from "vitest";
import { intervalsOverlap } from "./booking";

describe("booking interval rules", () => {
  it("rejects a true overlap, including a containing interval", () => {
    expect(intervalsOverlap(new Date("2026-11-01T09:00:00Z"), new Date("2026-11-01T10:00:00Z"), new Date("2026-11-01T09:30:00Z"), new Date("2026-11-01T10:30:00Z"))).toBe(true);
    expect(intervalsOverlap(new Date("2026-11-01T09:00:00Z"), new Date("2026-11-01T12:00:00Z"), new Date("2026-11-01T10:00:00Z"), new Date("2026-11-01T11:00:00Z"))).toBe(true);
  });
  it("allows adjacent, non-overlapping lessons", () => {
    expect(intervalsOverlap(new Date("2026-11-01T09:00:00Z"), new Date("2026-11-01T10:00:00Z"), new Date("2026-11-01T10:00:00Z"), new Date("2026-11-01T11:00:00Z"))).toBe(false);
  });
});
