const { test, expect } = require("@playwright/test");
const { recruitmentCandidatesPage } = require("../../src/pages/recruitment.candidates.page");

test.describe("Recruitment - Candidates", () => {
  test("@e2e Candidates search/filter + reset (demo-safe)", async ({ page }) => {
    const candidates = recruitmentCandidatesPage(page);

    await test.step("Open Candidates page", async () => {
      await candidates.goto();
      await page.screenshot({
        path: "test-results/recruitment/candidates-page.png",
        fullPage: true
      });
    });

    await test.step("Apply filter: Candidate Name = 'a' and search", async () => {
      await candidates.setCandidateName("a");
      await candidates.search();
      await candidates.expectResultsLoaded();

      const value = await candidates.getCandidateNameValue();
      expect(value.toLowerCase()).toBe("a");

      await page.screenshot({
        path: "test-results/recruitment/candidates-filtered.png",
        fullPage: true
      });
    });

    await test.step("Reset filters and verify cleared", async () => {
      await candidates.reset();

      const value = await candidates.getCandidateNameValue();
      expect(value).toBe("");

      await page.screenshot({
        path: "test-results/recruitment/candidates-reset.png",
        fullPage: true
      });
    });
  });
});
