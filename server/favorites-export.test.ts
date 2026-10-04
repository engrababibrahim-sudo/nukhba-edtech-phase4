import { describe, expect, it } from "vitest";
import { buildFavoritesCsv } from "../client/src/lib/favoritesExport";

describe("favorite CSV export", () => {
  it("neutralizes spreadsheet formulas in untrusted titles and IDs", () => {
    const csv = buildFavoritesCsv([{ favoriteType: "teacher", title: "=HYPERLINK(\"https://attacker.invalid\")", targetId: " +SUM(1,2)", createdAt: "2026-10-01T00:00:00Z" }]);
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain("' +SUM");
  });
});
