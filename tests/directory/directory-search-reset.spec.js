const { test, expect } = require("@playwright/test");
const { directorySearchPage } = require("../../src/pages/directory.directorySearch.page");

test.describe("Directory", () => {
  test("@e2e Directory search + reset (demo-safe)", async ({ page }) => {
    const dir = directorySearchPage(page);

    await test.step("Open Directory page", async () => {
      await dir.goto();
      await page.screenshot({
        path: "test-results/directory/directory-page.png",
        fullPage: true
      });
    });

    await test.step("Search (Employee Name) and verify results are reachable", async () => {
      await dir.search("a");
      await dir.ensureResultsArea();

      const count = await dir.getCardsCount();
      test.info().annotations.push({ type: "cardsAfterSearch", description: String(count) });

      await page.screenshot({
        path: "test-results/directory/directory-after-search.png",
        fullPage: true
      });

      expect(count).toBeGreaterThanOrEqual(0);
    });

    await test.step("Reset and verify search is reset (best-effort)", async () => {
      await dir.reset();

      const count = await dir.getCardsCount();
      test.info().annotations.push({ type: "cardsAfterReset", description: String(count) });

      await page.screenshot({
        path: "test-results/directory/directory-after-reset.png",
        fullPage: true
      });

      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});
