const { test, expect } = require("@playwright/test");
const { adminJobTitlesPage } = require("../../src/pages/admin.jobTitles.page");

test.describe("Admin - Job Titles", () => {
  test("@e2e Add, search and delete job title (CRUD demo)", async ({ page }) => {
    const jobs = adminJobTitlesPage(page);

    const stamp = Date.now().toString().slice(-5);
    const title = `Auto Job Title ${stamp}`;

    await test.step("Open Job Titles page", async () => {
      await jobs.goto();
      await page.screenshot({
        path: "test-results/admin/job-titles-page.png",
        fullPage: true
      });
    });

    await test.step("Add job title", async () => {
      await jobs.addJobTitle(title);

      const toast = await jobs.waitForToast();
      test.info().annotations.push({ type: "toast", description: toast ?? "null" });

      await page.screenshot({
        path: "test-results/admin/job-titles-added.png",
        fullPage: true
      });

      if (toast) expect(toast.toLowerCase()).toMatch(/success|saved|successfully/);
    });

    await test.step("Search and verify in results", async () => {
      await jobs.reset();
      await jobs.searchByName(title);

      const rowSet = await jobs.findRowByName(title);
      await expect(rowSet.first()).toBeVisible({ timeout: 20000 });

      await page.screenshot({
        path: "test-results/admin/job-titles-found.png",
        fullPage: true
      });
    });

    await test.step("Delete job title and verify removal", async () => {
      await jobs.deleteByName(title);

      const toast = await jobs.waitForToast();
      test.info().annotations.push({ type: "toast", description: toast ?? "null" });

      await jobs.reset();
      await jobs.searchByName(title);

      const rowSet = await jobs.findRowByName(title);
      await expect(rowSet).toHaveCount(0);

      await page.screenshot({
        path: "test-results/admin/job-titles-deleted.png",
        fullPage: true
      });
    });
  });
});
