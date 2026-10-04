import { describe, expect, it } from "vitest";
import { isSafeReturnTo } from "../client/src/const";
import { buildStudentPdfDocument } from "../client/src/lib/studentPdf";
import { SESSION_TTL_MS } from "../shared/const";

describe("auth and export security", () => {
  it("accepts only same-origin path return targets", () => {
    expect(isSafeReturnTo("/dashboard/student", "https://example.test")).toBe(true);
    for (const target of ["//attacker.test", "/\\\\attacker.test", "https://attacker.test", "data:text/html,hello"]) {
      expect(isSafeReturnTo(target, "https://example.test")).toBe(false);
    }
  });
  it("bounds new OAuth sessions to thirty days", () => {
    expect(SESSION_TTL_MS).toBe(30 * 24 * 60 * 60 * 1000);
  });
  it("escapes untrusted profile text before writing printable HTML", () => {
    const html = buildStudentPdfDocument({ user: { name: "<script>alert(1)</script>" }, profile: { fullName: "<img src=x onerror=alert(1)>" }, bookings: [] });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
  });
});
