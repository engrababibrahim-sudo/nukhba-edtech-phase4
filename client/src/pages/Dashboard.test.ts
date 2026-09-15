import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./Dashboard.tsx", import.meta.url), "utf8");

describe("student dashboard loading states", () => {
  it("has a layout-preserving skeleton and explicit fetch error state", () => {
    expect(source).toContain("StudentDashboardSkeleton");
    expect(source).toContain("aria-label=\"جارٍ تحميل لوحة الطالب\"");
    expect(source).toContain("تعذر تحميل بيانات لوحة الطالب");
    expect(source).toContain("learning.isLoading");
    expect(source).toContain("bookings.isLoading");
  });
});
