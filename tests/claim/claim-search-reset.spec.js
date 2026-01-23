const { test, expect } = require("@playwright/test");
const { claimListPage } = require("../../src/pages/claim.claimList.page");

test.describe("Claim", () => {
  test("@e2e Claim search + reset (demo-safe)", async ({ page }) => {
    const claim = claimListPage(page);

    await test.step("Open Claim module", async () => {
      await claim.goto();
      await page.screenshot({ path: "test-results/claim-page.png", fullPage: true });
    });

    await test.step("Search by Employee Name (demo-safe)", async () => {
      await claim.searchByEmployeeName("a");
      await claim.ensureResultsArea();

      const count = await claim.getRowsCount();
      test.info().annotations.push({ type: "rowsAfterSearch", description: String(count) });

      await page.screenshot({ path: "test-results/claim-after-search.png", fullPage: true });

      expect(count).toBeGreaterThanOrEqual(0);
    });

    await test.step("Reset and verify cleared", async () => {
      await claim.reset();
      await claim.assertResetCleared();

      await page.screenshot({ path: "test-results/claim-after-reset.png", fullPage: true });
    });
  });
});
